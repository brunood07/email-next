"use client";

import { useRef } from "react";

type TemplateEditorProps = {
  headers: string[];
  template: string;
  preview: string;
  onTemplateChange: (value: string) => void;
};

export function TemplateEditor({
  headers,
  template,
  preview,
  onTemplateChange,
}: TemplateEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function normalizeSelectionToField(selection: string): string | null {
    const trimmed = selection.trim();
    if (!trimmed) return null;

    const tokenMatch = trimmed.match(/^{{\s*(.*?)\s*}}$/);
    if (!tokenMatch) {
      return trimmed;
    }

    const expression = tokenMatch[1].trim();
    const fnMatch = expression.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\((.*?)\)$/);
    if (!fnMatch) {
      return expression;
    }

    const arg = fnMatch[2]?.trim();
    return arg || null;
  }

  function insertSnippet(snippet: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      onTemplateChange(`${template}${snippet}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next =
      template.slice(0, start) + snippet + template.slice(end, template.length);
    onTemplateChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + snippet.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function insertField(field: string) {
    insertSnippet(`{{${field}}}`);
  }

  function applyFunctionOnSelection(
    functionName: "money" | "upper" | "lower" | "ifValue" | "clearLine",
  ) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = end > start;

    if (!hasSelection) {
      if (functionName === "ifValue") {
        insertSnippet(`{{ifValue("Texto: ",${sampleField})}}`);
        return;
      }
      if (functionName === "clearLine") {
        insertSnippet(`{{clearLine(${sampleField})}}`);
        return;
      }
      insertSnippet(`{{${functionName}(${sampleField})}}`);
      return;
    }

    const selectedText = template.slice(start, end);
    const field = normalizeSelectionToField(selectedText);
    if (!field) return;

    const replacement =
      functionName === "ifValue"
        ? `{{ifValue("Texto: ",${field})}}`
        : functionName === "clearLine"
          ? `{{clearLine(${field})}}`
        : `{{${functionName}(${field})}}`;
    const next = template.slice(0, start) + replacement + template.slice(end);
    onTemplateChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + replacement.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  const sampleField = headers[0] ?? "valor";

  return (
    <section className="panel">
      <h2>2. Template</h2>
      <p className="muted">
        Use sintaxe simples <code>{"{{campo}}"}</code> ou funcoes como{" "}
        <code>{"{{money(campo)}}"}</code> e{" "}
        <code>{'{{ifValue("Texto opcional",campo)}}'}</code> e{" "}
        <code>{"{{clearLine(campo)}}"}</code>.
      </p>

      <div className="field-list">
        <strong>Campos disponiveis:</strong>
        <div className="chips">
          {headers.map((header) => (
            <button
              key={header}
              type="button"
              className="chip chip-action"
              onClick={() => insertField(header)}
            >
              {header}
            </button>
          ))}
        </div>
      </div>

      <div className="field-list">
        <strong>Funcoes prontas:</strong>
        <div className="chips">
          <button
            type="button"
            className="chip chip-action"
            onClick={() => applyFunctionOnSelection("money")}
          >
            money
          </button>
          <button
            type="button"
            className="chip chip-action"
            onClick={() => applyFunctionOnSelection("upper")}
          >
            upper
          </button>
          <button
            type="button"
            className="chip chip-action"
            onClick={() => applyFunctionOnSelection("lower")}
          >
            lower
          </button>
          <button
            type="button"
            className="chip chip-action"
            onClick={() => applyFunctionOnSelection("ifValue")}
          >
            ifValue
          </button>
          <button
            type="button"
            className="chip chip-action"
            onClick={() => applyFunctionOnSelection("clearLine")}
          >
            clearLine
          </button>
        </div>
        <p className="muted">
          Dica: selecione um campo ja inserido (ex: <code>{"{{valor}}"}</code>) e
          clique em uma funcao. No <code>ifValue</code>, o texto aparece sem
          imprimir o valor da celula. No <code>clearLine</code>, a linha inteira
          e removida quando o valor estiver vazio.
        </p>
      </div>

      <textarea
        className="template-input"
        ref={textareaRef}
        value={template}
        onChange={(event) => onTemplateChange(event.target.value)}
        rows={8}
        placeholder="Ola {{nome}}, seu pedido {{pedido}} foi aprovado!"
      />

      <div className="preview">
        <strong>Preview (primeira linha)</strong>
        <p>{preview || "Digite o template para ver o preview."}</p>
      </div>
    </section>
  );
}
