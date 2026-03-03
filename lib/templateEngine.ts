const TOKEN_REGEX = /{{(.*?)}}/g;
const FUNCTION_REGEX = /^([a-zA-Z_][a-zA-Z0-9_]*)\((.*?)\)$/;

type TemplateFunction = (value: string) => string;

function parsePtBrNumber(value: string): number | null {
  const normalized = value
    .trim()
    .replaceAll("R$", "")
    .replaceAll(" ", "")
    .replaceAll(".", "")
    .replace(",", ".");

  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatMoney(value: string): string {
  const number = parsePtBrNumber(value);
  if (number === null) return "";
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

function extractFieldFromExpression(expression: string): string | null {
  const trimmed = expression.trim();
  if (!trimmed) return null;

  const functionMatch = trimmed.match(FUNCTION_REGEX);
  if (!functionMatch) {
    return trimmed;
  }

  const argument = functionMatch[2]?.trim();
  return argument || null;
}

function evaluateExpression(expression: string, row: Record<string, string>): string {
  const trimmed = expression.trim();
  if (!trimmed) return "";

  const functionMatch = trimmed.match(FUNCTION_REGEX);
  if (!functionMatch) {
    return row[trimmed] ?? "";
  }

  const functionName = functionMatch[1];
  const argument = functionMatch[2]?.trim();
  if (!argument) return "";

  const fn = TEMPLATE_FUNCTIONS[functionName];
  if (!fn) return "";

  return fn(row[argument] ?? "");
}

export function extractTemplateFields(template: string): string[] {
  const fields = new Set<string>();
  for (const match of template.matchAll(TOKEN_REGEX)) {
    const expression = match[1] ?? "";
    const field = extractFieldFromExpression(expression);
    if (field) {
      fields.add(field);
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
  return template.replace(TOKEN_REGEX, (_match, expression: string) => {
    return evaluateExpression(expression, row);
  });
}
