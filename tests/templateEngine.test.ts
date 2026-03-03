import { describe, expect, it } from "vitest";
import {
  extractTemplateFields,
  renderTemplate,
  validateTemplateFields,
} from "@/lib/templateEngine";

describe("templateEngine", () => {
  it("extract unique fields from plain and function expressions", () => {
    const fields = extractTemplateFields(
      "Oi {{ nome }}, total {{money(valor)}} e pedido {{pedido}} {{nome}}",
    );
    expect(fields.sort()).toEqual(["nome", "pedido", "valor"]);
  });

  it("replace missing values with empty string", () => {
    const out = renderTemplate("Oi {{nome}} {{telefone}}", { nome: "Ana" });
    expect(out).toBe("Oi Ana ");
  });

  it("render function expressions", () => {
    const out = renderTemplate("Total: {{money(valor)}} / {{upper(nome)}}", {
      valor: "1234,5",
      nome: "ana",
    });
    expect(out).toContain("R$");
    expect(out).toContain("ANA");
  });

  it("validate template fields against headers", () => {
    const valid = validateTemplateFields("{{nome}} {{money(valor)}}", [
      "nome",
      "valor",
    ]);
    expect(valid.valid).toBe(true);

    const invalid = validateTemplateFields("{{nome}} {{money(cpf)}}", [
      "nome",
      "email",
    ]);
    expect(invalid.valid).toBe(false);
    if (!invalid.valid) {
      expect(invalid.invalidFields).toEqual(["cpf"]);
    }
  });
});
