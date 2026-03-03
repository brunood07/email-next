import { NextResponse } from "next/server";
import { parseUploadedFile } from "@/lib/parser";
import { UploadValidationError } from "@/types/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        {
          error: {
            code: "E001",
            message: "Arquivo inválido. Envie um CSV ou XLSX.",
          },
        },
        { status: 400 },
      );
    }

    const data = await parseUploadedFile(fileEntry);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "E001",
          message: "Falha inesperada ao processar o arquivo.",
        },
      },
      { status: 500 },
    );
  }
}
