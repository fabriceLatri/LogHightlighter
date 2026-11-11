## Project

Log Highlighter is a Visual Studio Code extension that highlights lines in `.log` files based on keywords and time ranges.

- **Highlight**: highlights keywords in `.log` files.
- **Time filter**: keeps logs inside a time range set with `-S` (since) and `-U` (until).
- **Opacity**: lines outside the time range are dimmed.
- **Commands**: `logHighlighter.search` (search and highlight keywords) and `logHighlighter.clearHighlights` (clear highlights and opacity effects).

## Agent skills

### Issue tracker

GitHub Issues on `fabriceLatri/LogHightlighter`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
