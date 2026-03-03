const TOKEN_REGEX = /{{(.*?)}}/g;
const FUNCTION_REGEX = /^([a-zA-Z_][a-zA-Z0-9_]*)\(([\s\S]*)\)$/;
const CLEAR_LINE_MARKER = "__TPL_CLEAR_LINE__";

type TemplateFunction = (value: string) => string;

function splitFunctionArgs(rawArgs: string): string[] {
  const args: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;
  let escaped = false;
  let parenDepth = 0;

  for (const char of rawArgs) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }

    if (quote) {
      current += char;
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "(") {
      parenDepth += 1;
      current += char;
      continue;
    }

    if (char === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      current += char;
      continue;
    }

    if (char === "," && parenDepth === 0) {
      args.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  const last = current.trim();
  if (last) {
    args.push(last);
  }

  return args;
}

function parseFunctionCall(expression: string): { name: string; args: string[] } | null {
  const match = expression.trim().match(FUNCTION_REGEX);
  if (!match) return null;

  const name = match[1];
  const args = splitFunctionArgs(match[2] ?? "");
  return { name, args };
}

function parseCurrencyNumber(value: string): number | null {
  const sanitized = value
    .trim()
    .replaceAll("R$", "")
    .replace(/\s+/g, "");

  if (!sanitized) return null;

  const ptPattern = /^-?\d{1,3}(\.\d{3})*(,\d+)?$/;
  const enPattern = /^-?\d{1,3}(,\d{3})*(\.\d+)?$/;
  const plainPattern = /^-?\d+([.,]\d+)?$/;

  if (ptPattern.test(sanitized)) {
    const normalized = sanitized.replaceAll(".", "").replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (enPattern.test(sanitized)) {
    const normalized = sanitized.replaceAll(",", "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (plainPattern.test(sanitized)) {
    const normalized = sanitized.includes(",")
      ? sanitized.replace(",", ".")
      : sanitized;
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatMoney(value: string): string {
  const number = parseCurrencyNumber(value);
  if (number === null) return "";
  // Intl is the native JS API for locale-aware currency formatting.
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
}

const TEMPLATE_FUNCTIONS: Record<string, TemplateFunction> = {
  money: formatMoney,
  upper: (value) => value.toUpperCase(),
  lower: (value) => value.toLowerCase(),
};

function parseTextLiteral(arg: string): string {
  const trimmed = arg.trim();
  const match = trimmed.match(/^"(.*)"$/) ?? trimmed.match(/^'(.*)'$/);
  if (!match) return trimmed;

  return match[1]
    .replaceAll('\\"', '"')
    .replaceAll("\\'", "'")
    .replaceAll("\\n", "\n")
    .replaceAll("\\t", "\t");
}

function isTextLiteral(expression: string): boolean {
  const trimmed = expression.trim();
  return /^"(.*)"$/.test(trimmed) || /^'(.*)'$/.test(trimmed);
}

function isEmptyLikeValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "" || normalized === "x";
}

function extractFieldsFromExpression(expression: string): string[] {
  const trimmed = expression.trim();
  if (!trimmed) return [];

  const functionCall = parseFunctionCall(trimmed);
  if (!functionCall) {
    if (isTextLiteral(trimmed)) return [];
    return [trimmed];
  }

  if (functionCall.name === "ifValue") {
    const valueArg = functionCall.args[1]?.trim();
    return valueArg ? extractFieldsFromExpression(valueArg) : [];
  }

  if (functionCall.name === "clearLine" || functionCall.name === "cleanLine") {
    const valueArg = functionCall.args[0]?.trim();
    return valueArg ? extractFieldsFromExpression(valueArg) : [];
  }

  return functionCall.args.flatMap((arg) => extractFieldsFromExpression(arg));
}

function evaluateExpression(expression: string, row: Record<string, string>): string {
  const trimmed = expression.trim();
  if (!trimmed) return "";

  const functionCall = parseFunctionCall(trimmed);
  if (!functionCall) {
    if (isTextLiteral(trimmed)) return parseTextLiteral(trimmed);
    return row[trimmed] ?? "";
  }

  if (functionCall.name === "ifValue") {
    const textArg = functionCall.args[0] ?? "";
    const valueArg = functionCall.args[1] ?? "";
    const value = evaluateExpression(valueArg, row);
    if (isEmptyLikeValue(value)) return "";
    return parseTextLiteral(textArg);
  }

  if (functionCall.name === "clearLine" || functionCall.name === "cleanLine") {
    const valueArg = functionCall.args[0] ?? "";
    const value = evaluateExpression(valueArg, row);
    if (isEmptyLikeValue(value)) return CLEAR_LINE_MARKER;
    return "";
  }

  const fn = TEMPLATE_FUNCTIONS[functionCall.name];
  if (!fn) return "";

  const valueArg = functionCall.args[0] ?? "";
  const value = evaluateExpression(valueArg, row);
  return fn(value);
}

export function extractTemplateFields(template: string): string[] {
  const fields = new Set<string>();
  for (const match of template.matchAll(TOKEN_REGEX)) {
    const expression = match[1] ?? "";
    const expressionFields = extractFieldsFromExpression(expression);
    for (const field of expressionFields) {
      if (field) {
        fields.add(field);
      }
    }
  }
  return [...fields];
}

export function validateTemplateFields(
  template: string,
  availableHeaders: string[],
): { valid: true } | { valid: false; invalidFields: string[] } {
  const fields = extractTemplateFields(template);
  const headerSet = new Set(availableHeaders);
  const invalidFields = fields.filter((field) => !headerSet.has(field));

  if (invalidFields.length > 0) {
    return { valid: false, invalidFields };
  }
  return { valid: true };
}

export function renderTemplate(
  template: string,
  row: Record<string, string>,
): string {
  const rendered = template.replace(TOKEN_REGEX, (_match, expression: string) => {
    return evaluateExpression(expression, row);
  });

  return rendered
    .split(/\r?\n/)
    .filter((line) => !line.includes(CLEAR_LINE_MARKER))
    .join("\n")
    .replaceAll(CLEAR_LINE_MARKER, "");
}
