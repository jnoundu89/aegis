# apps/desktop

> Tauri wrapper to be initialized here pointing to `apps/web/build`.

This directory will contain the Rust + Tauri desktop application that wraps the SvelteKit web front-end.

## Future setup

```bash
# From this directory, once Tauri CLI is installed:
pnpm tauri init
```

Configure `tauri.conf.json` to point `distDir` at `../web/build` and `devUrl` at the SvelteKit dev server (`http://localhost:5173`).
