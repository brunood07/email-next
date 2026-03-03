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

        <h3>Funcoes do template</h3>
        <ul>
          <li>
            <code>{`{{campo}}`}</code>: insere o valor bruto da coluna.
            Exemplo: template <code>{`{{nome}}`}</code>, valor <code>Ana</code>,
            saida <code>Ana</code>.
          </li>
          <li>
            <code>{`{{money(campo)}}`}</code>: formata o valor como moeda BRL.
            Exemplo: template <code>{`{{money(valor)}}`}</code>, valor{" "}
            <code>87,05</code>, saida <code>R$ 87,05</code>.
          </li>
          <li>
            <code>{`{{upper(campo)}}`}</code>: converte o valor para maiusculo.
            Exemplo: template <code>{`{{upper(nome)}}`}</code>, valor{" "}
            <code>ana</code>, saida <code>ANA</code>.
          </li>
          <li>
            <code>{`{{lower(campo)}}`}</code>: converte o valor para minusculo.
            Exemplo: template <code>{`{{lower(nome)}}`}</code>, valor{" "}
            <code>ANA</code>, saida <code>ana</code>.
          </li>
          <li>
            <code>{`{{ifValue("Texto",campo)}}`}</code>: exibe apenas o texto
            quando o campo tem valor.
            Exemplo: template <code>{`{{ifValue("Tem imposto",imposto)}}`}</code>,
            com <code>imposto=10</code> saida <code>Tem imposto</code>; com{" "}
            <code>imposto=&quot;&quot;</code> saida vazia.
          </li>
          <li>
            <code>{`{{clearLine(campo)}}`}</code> /{" "}
            <code>{`{{cleanLine(campo)}}`}</code>: remove a linha quando o campo
            estiver vazio.
            Exemplo: linha <code>{`Imposto: {{clearLine(imposto)}}`}</code>; com{" "}
            <code>imposto=10</code> vira <code>Imposto: </code>; com{" "}
            <code>imposto=&quot;&quot;</code> a linha e removida.
          </li>
        </ul>
        <p className="muted">
          Regra de vazio: valor em branco, apenas espacos ou <code>x</code>.
        </p>
      </details>
    </section>
  );
}
