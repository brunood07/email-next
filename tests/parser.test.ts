import { describe, expect, it } from "vitest";
import { parseUploadedFile } from "@/lib/parser";

describe("parser csv", () => {
  it("parse valid csv with comma", async () => {
    const file = new File(["nome,email\nAna,ana@x.com"], "dados.csv", {
      type: "text/csv",
    });
    const parsed = await parseUploadedFile(file);
    expect(parsed.headers).toEqual(["nome", "email"]);
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0]).toEqual({ nome: "Ana", email: "ana@x.com" });
  });

  it("detect semicolon csv", async () => {
    const file = new File(["nome;email\nAna;ana@x.com"], "dados.csv", {
      type: "text/csv",
    });
    const parsed = await parseUploadedFile(file);
    expect(parsed.headers).toEqual(["nome", "email"]);
  });
});
