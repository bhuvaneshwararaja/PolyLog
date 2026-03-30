const vscode = require('vscode');
const { getLanguageForFile, buildLogStatement, LANGUAGES } = require('./languages');
const { findScriptBlockRange } = require('./scriptDetector');

function activate(context) {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    const logCommand = vscode.commands.registerCommand('console.log', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return vscode.window.showInformationMessage('No active editor found');
        }

        const languageName = getLanguageForFile(editor.document.fileName);
        if (!languageName) {
            return vscode.window.showInformationMessage('Language not supported right now!!');
        }

        statusBarItem.text = `$(file-code) Language: ${languageName}`;

        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
            return vscode.window.showInformationMessage('Please select some text to add logger');
        }

        const currentLineText = editor.document.lineAt(editor.selection.active.line).text;
        if (!isVariableAssignment(currentLineText, selectedText)) {
            return vscode.window.showInformationMessage('Please select variable to add logger');
        }

        const indentation = " ".repeat(
            editor.document.lineAt(editor.selection.start.line).firstNonWhitespaceCharacterIndex
        );

        const insertLineIndex = editor.selection.active.line + 1;
        await editor.edit(editBuilder => {
            if (insertLineIndex >= editor.document.lineCount) {
                editBuilder.insert(editor.document.lineAt(insertLineIndex - 1).range.end, '\n');
            }
        });

        const langConfig = LANGUAGES[languageName];
        const scriptRange = langConfig.detectsScriptBlock
            ? findScriptBlockRange(editor.document)
            : null;

        const log = await buildLogStatement(languageName, selectedText, insertLineIndex, scriptRange);
        if (!log) {
            return vscode.window.showInformationMessage('Please select variable to add logger');
        }

        const insertLine = editor.document.lineAt(insertLineIndex);
        await editor.edit(editBuilder => {
            editBuilder.insert(insertLine.range.start, `\n${indentation}${log}`);
        });
    });

    context.subscriptions.push(logCommand);
}

function isVariableAssignment(lineText, variable) {
    return lineText.includes(`${variable} =`)
        || lineText.includes(`${variable}=`)
        || lineText.includes(`${variable}:`)
        || lineText.includes(`${variable} :=`);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
