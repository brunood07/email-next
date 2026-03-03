"use client";

import { useEffect, useMemo, useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ResultCard } from "@/components/ResultCard";
import { TemplateEditor } from "@/components/TemplateEditor";
import { Tutorial } from "@/components/Tutorial";
import { renderTemplate, validateTemplateFields } from "@/lib/templateEngine";
import { AppState, UploadedData } from "@/types/upload";

const PAGE_SIZE = 50;
const CHUNK_SIZE = 200;

type GeneratedResult = {
  label: string;
  text: string;
};

function resolveRowLabel(row: Record<string, string>, index: number): string {
  const candidates = ["id", "nome", "name", "email"];
  const key = Object.keys(row).find((header) =>
    candidates.includes(header.toLowerCase()),
  );

  if (key && row[key]) {
    return row[key];
  }
  return `Linha ${index + 1}`;
}

async function generateInChunks(
  data: UploadedData,
  template: string,
): Promise<GeneratedResult[]> {
  const out: GeneratedResult[] = [];

  for (let i = 0; i < data.rows.length; i += CHUNK_SIZE) {
    const chunk = data.rows.slice(i, i + CHUNK_SIZE);
    chunk.forEach((row, idx) => {
      const absoluteIndex = i + idx;
      const generated = renderTemplate(template, row);
      out.push({
        label: resolveRowLabel(row, absoluteIndex),
        text: generated,
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return out;
}

export default function HomePage() {
  const [state, setState] = useState<AppState>("IDLE");
  const [data, setData] = useState<UploadedData | null>(null);
  const [template, setTemplate] = useState("");
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const preview = useMemo(() => {
    if (!data || !data.rows[0] || template.trim().length === 0) return "";
    return renderTemplate(template, data.rows[0]);
  }, [data, template]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [page, results]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

  function showError(message: string) {
    setError(message);
    setState("ERROR");
  }

  function resetErrorIfNeeded() {
    if (error) {
      setError(null);
    }
    if (state === "ERROR") {
      setState("UPLOADED");
    }
  }

  async function handleGenerate() {
    if (!data) return;
    resetErrorIfNeeded();

    if (!template.trim()) {
      showError("Digite um template antes de gerar os textos.");
      return;
    }

    const validation = validateTemplateFields(template, data.headers);
    if (!validation.valid) {
      showError(
        `E003 - Campos inexistentes no template: ${validation.invalidFields.join(", ")}`,
      );
      return;
    }

    setIsGenerating(true);
    try {
      if (data.rows.length > 1000) {
        setToast("Arquivo grande detectado (>1000 linhas). Processando em chunks...");
      }
      const generated = await generateInChunks(data, template);
      setResults(generated);
      setPage(1);
      setState("GENERATED");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <p className="eyebrow">Template Studio</p>
        <h1>Gerador de Textos em Lote</h1>
        <p className="muted">
          Fluxo: Upload - Colunas - Template - Preview - Gerar
        </p>
        <div className="status-row">
          <span className="status-pill">Estado: {state}</span>
          <span className="status-pill">
            Linhas: {data ? data.rows.length.toString() : "0"}
          </span>
          <span className="status-pill">
            Resultados: {results.length.toString()}
          </span>
        </div>
      </header>

      {toast && <div className="toast">{toast}</div>}

      <Tutorial />

      <FileUpload
        onSuccess={(payload) => {
          setData(payload);
          setResults([]);
          setTemplate("");
          setError(null);
          setToast(null);
          setState("UPLOADED");
        }}
        onError={(uploadError) => {
          showError(
            `${uploadError.code ? `${uploadError.code} - ` : ""}${uploadError.message}`,
          );
        }}
      />

      {data && (
        <>
          <section className="panel">
            <h2>Colunas identificadas</h2>
            <div className="chips">
              {data.headers.map((header) => (
                <span key={header} className="chip static">
                  {header}
                </span>
              ))}
            </div>
            <p className="muted">Linhas validas: {data.rows.length}</p>
          </section>

          <TemplateEditor
            headers={data.headers}
            template={template}
            preview={preview}
            onTemplateChange={(value) => {
              resetErrorIfNeeded();
              setTemplate(value);
              setState("EDITING_TEMPLATE");
            }}
          />

          <section className="panel action-panel">
            <button
              className="btn btn-primary full"
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? "Gerando..." : "Gerar textos"}
            </button>
          </section>
        </>
      )}

      {error && (
        <section className="panel error">
          <strong>Erro:</strong> <span>{error}</span>
        </section>
      )}

      {results.length > 0 && (
        <section className="panel">
          <h2>Resultados</h2>
          <p className="muted">
            Pagina {page} de {totalPages}
          </p>
          <div className="result-grid">
            {paginated.map((result, index) => (
              <ResultCard
                key={`${result.label}-${index}`}
                label={result.label}
                text={result.text}
                onCopied={() => setToast("Copiado!")}
              />
            ))}
          </div>
          <div className="pagination">
            <button
              className="btn btn-ghost"
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Proxima
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
