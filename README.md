# Email Next - Gerador de Textos

Aplicação Next.js (App Router) para gerar textos em lote a partir de CSV/XLSX com template `{{campo}}`.

## Requisitos atendidos
- Upload `.csv` e `.xlsx`
- Parsing e validação no backend (`app/api/upload/route.ts`)
- Header obrigatório, sem duplicatas e sem valores vazios
- Preview em tempo real
- Campos clicáveis para inserir `{{campo}}`
- Validação de campos inexistentes no template (`E003`)
- Geração por linha + paginação (50 por página)
- Copy to clipboard com feedback visual
- Tutorial embutido
- Aviso/processamento em chunks para arquivos grandes (>1000 linhas)

## Rodar localmente
```bash
npm install
npm run dev
```

## Estrutura
- `app/` UI principal e API route
- `components/` upload/editor/resultados/tutorial
- `lib/` parser e template engine
- `types/` tipos compartilhados
