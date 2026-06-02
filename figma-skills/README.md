# Figma import & export skills

Agent skills for **Figma → code** (`figma-import`) and **code → Figma** (`figma-export`).

## Install

Copy both folders into your project’s agent skills directory:

| Tool | Typical path |
|------|----------------|
| Cursor | `.cursor/skills/` or project `.agents/skills/` |
| Claude Code | `.claude/skills/` |

Example:

```bash
cp -R figma-import figma-export /path/to/your-project/.claude/skills/
```

## Requirements

- **Figma MCP** enabled (official Figma plugin / MCP server in Cursor or Claude).
- For import: Figma desktop app with Dev Mode MCP (`localhost:3845`) when using asset URLs from design context.
- For export: `use_figma`, `search_design_system`, `generate_figma_design` (or equivalent) on your MCP server.

## Usage triggers

- **figma-import** — Figma URL + target code path; `/figma-import`, “import this design to HTML/React”.
- **figma-export** — Source file + Figma file URL; `/figma-export`, “push this prototype to Figma”.

Each skill’s `SKILL.md` is the source of truth for the full workflow.
