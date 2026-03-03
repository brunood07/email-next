import Papa from "papaparse";
import * as XLSX from "xlsx";
import { UploadedData, UploadValidationError } from "@/types/upload";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".csv", ".xlsx"];

function normalizeHeaderCell(cell: unknown): string {
  return String(cell ?? "").trim();
}

function validateHeaders(headers: string[]) {
  if (headers.length === 0) {
    throw new UploadValidationError("E004", "Arquivo vazio ou sem header.");
  }

  if (headers.some((header) => header.length === 0)) {
    throw new UploadValidationError(
      "E001",
      "Há colunas vazias no header. Preencha todos os nomes de coluna.",
    );
  }

  const unique = new Set(headers);
  if (unique.size !== headers.length) {
    throw new UploadValidationError(
      "E002",
      "Header possui colunas duplicadas. Renomeie as colunas repetidas.",
    );
  }
}

function toUploadedData(table: unknown[][]): UploadedData {
  if (table.length < 2) {
    throw new UploadValidationError(
      "E004",
      "O arquivo precisa ter pelo menos 1 linha de header e 1 linha de dados.",
    );
  }

  const headers = (table[0] ?? []).map(normalizeHeaderCell);
  validateHeaders(headers);

  const rows = table
    .slice(1)
    .filter((line) => line.some((value) => String(value ?? "").trim() !== ""))
    .map((line) => {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = String(line[index] ?? "");
      });
      return row;
    });

  if (rows.length === 0) {
    throw new UploadValidationError(
      "E004",
      "Nenhuma linha de dados válida foi encontrada no arquivo.",
    );
  }

  return { headers, rows };
}

function parseCsv(content: string): UploadedData {
  const firstNonEmptyLine =
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? "";

  const commaCount = (firstNonEmptyLine.match(/,/g) ?? []).length;
  const semicolonCount = (firstNonEmptyLine.match(/;/g) ?? []).length;
  const delimiter = semicolonCount > commaCount ? ";" : ",";

  const parsed = Papa.parse<string[]>(content, {
    delimiter,
    skipEmptyLines: "greedy",
  });

  if (parsed.errors.length > 0) {
    throw new UploadValidationError("E001", "Não foi possível ler o CSV.");
  }

  return toUploadedData(parsed.data as unknown[][]);
}

function parseXlsx(buffer: ArrayBuffer): UploadedData {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new UploadValidationError("E004", "Planilha sem abas válidas.");
  }

  const firstSheet = workbook.Sheets[firstSheetName];
  const table = XLSX.utils.sheet_to_json(firstSheet, {
    header: 1,
    blankrows: false,
    defval: "",
  }) as unknown[][];

  return toUploadedData(table);
}

export function validateUploadFile(file: File) {
  const fileName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext),
  );

  if (!hasAllowedExtension) {
    throw new UploadValidationError(
      "E001",
      "Formato inválido. Envie apenas arquivos .csv ou .xlsx.",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new UploadValidationError(
      "E001",
      "Arquivo acima do limite de 5MB.",
    );
  }
}

export async function parseUploadedFile(file: File): Promise<UploadedData> {
  validateUploadFile(file);

  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".csv")) {
    const text = await file.text();
    return parseCsv(text);
  }

  if (fileName.endsWith(".xlsx")) {
    const buffer = await file.arrayBuffer();
    return parseXlsx(buffer);
  }

  throw new UploadValidationError(
    "E001",
    "Formato inválido. Envie apenas arquivos .csv ou .xlsx.",
  );
}
