export type UploadedData = {
  headers: string[];
  rows: Record<string, string>[];
};

export type AppState =
  | "IDLE"
  | "UPLOADED"
  | "EDITING_TEMPLATE"
  | "GENERATED"
  | "ERROR";

export type UploadErrorCode = "E001" | "E002" | "E003" | "E004";

export class UploadValidationError extends Error {
  code: UploadErrorCode;

  constructor(code: UploadErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "UploadValidationError";
  }
}
