"use client";

export function Tutorial() {
  return (
    <section className="panel">
      <h2>Como usar</h2>
      <details>
        <summary>Abrir tutorial</summary>
        <ol>
          <li>Faça upload do seu arquivo CSV ou XLSX.</li>
          <li>A primeira linha deve conter os nomes das colunas.</li>
          <li>Use {`{{nome_coluna}}`} para inserir valores no template.</li>
          <li>Clique em &quot;Gerar textos&quot;.</li>
          <li>Use o botão &quot;Copiar&quot; em cada card.</li>
        </ol>
      </details>
    </section>
  );
}
