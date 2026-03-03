const TOKEN_REGEX = /{{(.*?)}}/g;

export function extractTemplateFields(template: string): string[] {
  const fields = new Set<string>();
  for (const match of template.matchAll(TOKEN_REGEX)) {
    const field = match[1]?.trim();
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
  return template.replace(TOKEN_REGEX, (_match, key: string) => {
    const normalizedKey = key.trim();
    return row[normalizedKey] ?? "";
  });
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
