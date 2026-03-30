# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

PolyLog is a VS Code extension (JavaScript/CommonJS) that inserts language-specific log statements for selected variables. Source code is in `polylog/`. There is no backend, no database, and no running services — it's a pure client-side VS Code extension.

### Commands

All commands run from `polylog/`:

- **Lint**: `npm run lint` — runs ESLint via flat config (`eslint.config.mjs`)
- **Test**: `npm test` — runs `pretest` (lint) then `vscode-test`, which downloads a VS Code instance and executes integration tests in `test/extension.test.js`. dbus errors in the test output are harmless in headless/container environments.
- **Package**: `npx @vscode/vsce package --allow-missing-repository --baseImagesUrl https://example.com` — produces a `.vsix` file

### Manual testing

To test the extension interactively in VS Code Extension Development Host:

```
export DISPLAY=:1
/workspace/polylog/.vscode-test/vscode-linux-x64-*/bin/code --extensionDevelopmentPath=/workspace/polylog /workspace/polylog/testfiles/test.js
```

Then select a variable name, press `Ctrl+Shift+A`, pick a log level, and confirm the log statement is inserted.

### Gotchas

- The VS Code test binary is downloaded to `polylog/.vscode-test/` on first `npm test` run. Subsequent runs reuse the cached binary.
- `@vscode/vsce` is not a project dependency; install globally with `npm install -g @vscode/vsce` if you need to package.
- The extension's entry point is `polylog/extension.js` (CommonJS, no build step required).
