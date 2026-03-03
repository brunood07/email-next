import { describe, expect, it } from "vitest";
import {
  extractTemplateFields,
  renderTemplate,
  validateTemplateFields,
} from "@/lib/templateEngine";

describe("templateEngine", () => {
  it("extract unique fields from template", () => {
    const fields = extractTemplateFields("Oi {{ nome }}, pedido {{pedido}} {{nome}}");
    expect(fields.sort()).toEqual(["nome", "pedido"]);
  });

  it("replace missing values with empty string", () => {
    const out = renderTemplate("Oi {{nome}} {{telefone}}", { nome: "Ana" });
    expect(out).toBe("Oi Ana ");
  });

  it("validate template fields against headers", () => {
    const valid = validateTemplateFields("{{nome}} {{email}}", ["nome", "email"]);
    expect(valid.valid).toBe(true);

    const invalid = validateTemplateFields("{{nome}} {{cpf}}", ["nome", "email"]);
    expect(invalid.valid).toBe(false);
    if (!invalid.valid) {
      expect(invalid.invalidFields).toEqual(["cpf"]);
    }
  });
});
