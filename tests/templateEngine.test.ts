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

  it("format money correctly for comma and dot decimal inputs", () => {
    const commaDecimal = renderTemplate("{{money(valor)}}", {
      valor: "87,05",
    });
    expect(commaDecimal).toBe("R$\u00a087,05");

    const dotDecimal = renderTemplate("{{money(valor)}}", {
      valor: "87.05",
    });
    expect(dotDecimal).toBe("R$\u00a087,05");
  });

  it("render ifValue condition without leaving text when value is empty", () => {
    const withValue = renderTemplate('{{ifValue("Total: ",valor)}}', {
      valor: "150",
    });
    expect(withValue).toBe("Total: ");

    const withoutValue = renderTemplate('{{ifValue("Total: ",valor)}}', {
      valor: "",
    });
    expect(withoutValue).toBe("");

    const withOnlySpaces = renderTemplate('{{ifValue("Total: ",valor)}}', {
      valor: "   ",
    });
    expect(withOnlySpaces).toBe("");

    const withX = renderTemplate('{{ifValue("Total: ",valor)}}', {
      valor: "x",
    });
    expect(withX).toBe("");

    const withUpperX = renderTemplate('{{ifValue("Total: ",valor)}}', {
      valor: " X ",
    });
    expect(withUpperX).toBe("");
  });

  it("allow nested function inside ifValue", () => {
    const out = renderTemplate('{{ifValue("Imposto: ",money(imposto))}}', {
      imposto: "10,5",
    });
    expect(out).toBe("Imposto: ");
  });

  it("validate template fields against headers", () => {
    const valid = validateTemplateFields(
      '{{nome}} {{money(valor)}} {{ifValue("Total: ",money(valor))}}',
      ["nome", "valor"],
    );
    expect(valid.valid).toBe(true);

    const invalid = validateTemplateFields(
      '{{nome}} {{ifValue("Total: ",money(cpf))}}',
      ["nome", "email"],
    );
    expect(invalid.valid).toBe(false);
    if (!invalid.valid) {
      expect(invalid.invalidFields).toEqual(["cpf"]);
    }
  });
});
