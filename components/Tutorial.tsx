"use client";

export function Tutorial() {
  return (
    <section className="panel tutorial">
      <h2>Como usar</h2>
      <details>
        <summary>Abrir tutorial rapido</summary>
        <ol>
          <li>Faca upload do seu arquivo CSV ou XLSX.</li>
          <li>A primeira linha deve conter os nomes das colunas.</li>
          <li>Use {`{{nome_coluna}}`} para inserir valores no template.</li>
          <li>Use funcoes prontas como {`{{money(valor)}}`} para formatar moeda.</li>
          <li>
            Para condicional de texto, use {`{{ifValue("Tem imposto",imposto)}}`}:
            mostra apenas o texto quando o campo tiver valor.
          </li>
          <li>
            Para remover a linha inteira, use {`{{clearLine(imposto)}}`} no lugar
            do valor da linha. Essa funcao nao imprime o valor, apenas valida se a
            linha deve continuar.
          </li>
          <li>Clique em &quot;Gerar textos&quot;.</li>
          <li>Use o botao &quot;Copiar&quot; em cada card.</li>
        </ol>
      </details>
    </section>
  );
}
