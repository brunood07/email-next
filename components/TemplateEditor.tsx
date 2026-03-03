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

  function insertField(field: string) {
    const token = `{{${field}}}`;
    const textarea = textareaRef.current;

    if (!textarea) {
      onTemplateChange(`${template}${token}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next =
      template.slice(0, start) + token + template.slice(end, template.length);
    onTemplateChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + token.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <section className="panel">
      <h2>2. Template</h2>
      <p className="muted">
        Use a sintaxe: <code>{"{{campo}}"}</code>
      </p>

      <div className="field-list">
        <strong>Campos disponíveis:</strong>
        <div className="chips">
          {headers.map((header) => (
            <button
              key={header}
              type="button"
              className="chip"
              onClick={() => insertField(header)}
            >
              {header}
            </button>
          ))}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={template}
        onChange={(event) => onTemplateChange(event.target.value)}
        rows={8}
        placeholder="Olá {{nome}}, seu pedido {{pedido}} foi aprovado!"
      />

      <div className="preview">
        <strong>Preview (primeira linha):</strong>
        <p>{preview}</p>
      </div>
    </section>
  );
}
