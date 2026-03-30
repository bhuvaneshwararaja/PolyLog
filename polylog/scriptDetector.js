/**
 * Detects the last <script>...</script> block range in the active editor's
 * document using the VS Code document API instead of re-reading the file
 * from disk.
 *
 * Returns { startLine, endLine } with 1-based line numbers matching the
 * original contract, or { startLine: -1, endLine: -1 } if no block is found.
 */
function findScriptBlockRange(document) {
    let startLine = -1;
    let endLine = -1;

    for (let i = 0; i < document.lineCount; i++) {
        const text = document.lineAt(i).text;
        if (text.includes("<script")) {
            startLine = i + 2;
        }
        if (text.includes("</script")) {
            endLine = i + 2;
        }
    }

    return { startLine, endLine };
}

module.exports = { findScriptBlockRange };
