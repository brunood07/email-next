"use client";

import { FormEvent, useState } from "react";
import { UploadedData } from "@/types/upload";

type UploadError = {
  code?: string;
  message: string;
};

type FileUploadProps = {
  onSuccess: (data: UploadedData) => void;
  onError: (error: UploadError) => void;
};

export function FileUpload({ onSuccess, onError }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      onError({ message: "Selecione um arquivo .csv ou .xlsx." });
      return;
    }

    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/upload", { method: "POST", body });
      const payload = await response.json();

      if (!response.ok) {
        onError(payload.error ?? { message: "Erro ao processar upload." });
        return;
      }

      onSuccess(payload as UploadedData);
    } catch {
      onError({ message: "Falha de rede ao enviar arquivo." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel panel-upload" onSubmit={handleSubmit}>
      <h2>1. Upload do arquivo</h2>
      <p className="muted">
        Tipos permitidos: <code>.csv</code> e <code>.xlsx</code>. Tamanho
        maximo: 5MB.
      </p>
      <input
        className="file-input"
        type="file"
        accept=".csv,.xlsx"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <button className="btn btn-primary full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Processando..." : "Enviar arquivo"}
      </button>
    </form>
  );
}
