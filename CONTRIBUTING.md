# Contributing

Contributions are welcome — whether that's correcting a data error, improving the UI, or adding data from a new conference year.

## Reporting a Data Error

The easiest way to report an incorrect motion text, wrong vote count, misattributed maker, or other data issue is to use the **Corrections** button on the [archive](https://wscarchive.org). Expand any motion row and click "Suggest a correction," or use the general Corrections button at the top of the page.

Submissions open a GitHub issue tagged `correction`. If you have a source document (PDF page number, section, etc.) please include it — it speeds up verification significantly.

If you prefer to open an issue directly: [github.com/pjaudiomv/wsc-summary-app/issues](https://github.com/pjaudiomv/wsc-summary-app/issues)

## Adding a New Conference Year

When a new WSC Summary of Decisions PDF is published:

1. Add the PDF to a new `WSC-YYYY/` directory at the repo root.
2. Run the data pipeline:
   ```bash
   cd scripts
   pip install pdfplumber          # first time only
   python3 extract_decisions.py
   ```
3. Review the output in `src/data/decisions_flat.json` — the parser is good but not perfect, especially for unusual formatting in older documents.
4. Open a PR with the PDF and the updated JSON files.

## Code Contributions

### Setup

```bash
npm install
npm run dev
```

### Before opening a PR

```bash
npm run lint    # must pass clean — prettier + eslint + svelte-check
npm run test    # must pass
```

### Conventions

- **Svelte 5 runes only** — `$state`, `$derived`, `$effect`, `$props`. No legacy stores.
- **Tailwind only** — no inline styles or custom CSS unless Tailwind can't do it.
- **TypeScript** — all logic in `<script lang="ts">` blocks. Types live in `src/types/`.
- **Path aliases** — use `@components/`, `@utils/`, `$types/` etc. instead of relative `../../` imports.
- Line width 200, single quotes, no trailing commas (Prettier is authoritative — run `npm run format`).

### Cloudflare Worker (`cf-worker/`)

The worker proxies correction submissions to GitHub Issues. It's deployed separately with wrangler:

```bash
cd cf-worker
npm install
npx wrangler deploy
```

Requires a `GITHUB_TOKEN` secret (fine-grained PAT with Issues: Read and write on this repo) set via `wrangler secret put GITHUB_TOKEN`.

## Questions

Open an issue or start a discussion on GitHub.
