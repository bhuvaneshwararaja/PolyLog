const vscode = require('vscode');
const fs = require('fs');
const readline = require('readline');

function activate(context) {
    const statusBarItem = initializeStatusBar(context);

    const logCommand = vscode.commands.registerCommand('console.log', async () => {
        await updateLanguage(context, getDefaultLanguage());
        let userLanguage = await context.globalState.get('selectedLanguage');
        statusBarItem.text = `$(file-code) Language: ${userLanguage}`;
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const selectedText = editor.document.getText(editor.selection);
            const lineNumber = editor.selection.start.line;

            const line = editor.document.lineAt(lineNumber);
            const startCharacterPosition = line.firstNonWhitespaceCharacterIndex;

            if (selectedText) {
                const lineNumber = editor.selection.active.line + 1;
                await editor.edit(editBuilder => {
                    if (lineNumber >= editor.document.lineCount) {
                        editBuilder.insert(editor.document.lineAt(lineNumber - 1).range.end, '\n');
                    }
                })
                const line = editor.document.lineAt(lineNumber);
                const currentLineText = editor.document.lineAt(editor.selection.active.line).text;
                
                if (currentLineText.includes(`${selectedText} =`) ||
                    currentLineText.includes(`${selectedText}=`)  ||
                    currentLineText.includes(`${selectedText}:`) ||
                    currentLineText.includes(`${selectedText} :=`) ||
                    currentLineText.includes(`${selectedText}:`) ||
                    currentLineText.includes(`${selectedText} :=`)
                ) {
                    let log;

                    if (userLanguage === "JavaScript" || userLanguage === "TypeScript") {
                        log = await buildLogStatement(userLanguage, selectedText);
                    } else if (userLanguage === 'Php') {
                        log = await buildLogStatement(userLanguage, selectedText, lineNumber);
                    } else if (userLanguage === 'html') {
                        log = await buildLogStatement(userLanguage, selectedText, lineNumber);
                    } else if (userLanguage === 'Python') {
                        log = await buildLogStatement(userLanguage, selectedText);
                    } else if (userLanguage === 'Java') {
                        log = await buildLogStatement(userLanguage, selectedText);
                    } else if (userLanguage === 'Golang') {
                        log = await buildLogStatement(userLanguage, selectedText);
                    } else if (userLanguage === 'Dart') {
                        log = await buildLogStatement(userLanguage, selectedText);
                    } else {
                        return vscode.window.showInformationMessage('Language not supported right now!!');
                    }
                    if(log){
                        let intendation = " ".repeat(startCharacterPosition);
                        
                        editor.edit(editBuilder => {
                            editBuilder.insert(line.range.start, `\n${intendation}${log}`);
                        });
                    }
                    else{
                        vscode.window.showInformationMessage('Please select variable to add logger');
                    }
                } else {
                    vscode.window.showInformationMessage('Please select variable to add logger');
                }

            } else {
                vscode.window.showInformationMessage('Please select some text to add logger');
            }
        } else {
            vscode.window.showInformationMessage('No active editor found');
        }
    });

    context.subscriptions.push(logCommand);
}

const readFileLineByLine = async (lineForFile = "Php") => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor found');
        return;
    }

    const filePath = editor.document.fileName;
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let currentLine = 0;
    let startLine = -1;
    let endLine = -1;

    for await (const line of rl) {
        currentLine++;
        if (lineForFile === "Php") {
            if (line.includes("<script")) {
                startLine = currentLine + 1;
            }

            if (line.includes("</script")) {
                endLine = currentLine + 1;
            }
        }
    }
    return {
        "startLine": startLine,
        "endLine": endLine
    };
};

const buildLogStatement = async (language, logVariable, lineNumber = 0) => {
    const uniqueId = Date.now();
    switch (language) {
        case "JavaScript":
        case "TypeScript": {
            const selectLogLevel = await vscode.window.showQuickPick(
                ["Log", "Warning", "Error"], {
                    placeHolder: 'Select a log level',
                    canPickMany: false
                }
            ) || "Log";

            const logColor = getLogColor(selectLogLevel);
            return `console.${selectLogLevel === "Warning" ? "warn" : selectLogLevel.toLowerCase()}('%c[Log #${uniqueId}] ${logVariable}:', 'color: ${logColor}; font-weight: bold;', ${logVariable});\n`;
        }
        case "Php": {
            const lineRange = await readFileLineByLine();
            if (lineNumber >= lineRange.startLine && lineNumber <= lineRange.endLine) {
                return buildLogStatement("JavaScript", logVariable);
            }

            return `echo '[Log #${uniqueId}] ${logVariable}: ', ${logVariable};\n`;
        }
        case "html": {
            const lineRange = await readFileLineByLine();
            if (lineNumber >= lineRange.startLine && lineNumber <= lineRange.endLine) {
                return buildLogStatement("JavaScript", logVariable);
            }

            return;
        }
        case "Python":{
            const selectLogLevel = await vscode.window.showQuickPick(
                ["Log", "Warning", "Error"], {
                    placeHolder: 'Select a log level',
                    canPickMany: false
                }
            ) || "Log";

            const pythonLogColor = getXLogColor(selectLogLevel);
            
            return `print(f"${pythonLogColor}[Log #${uniqueId}] ${logVariable}: {${logVariable}}{'\\033[0m'}")\n`;
        }
        case "Java":{
            const selectLogLevel = await vscode.window.showQuickPick(
                ["Log", "Warning", "Error"], {
                    placeHolder: 'Select a log level',
                    canPickMany: false
                }
            ) || "Log";

            const logLevelMap = {
                "Log": "System.out.println",
                "Warning": "System.err.println",
                "Error": "System.err.println"
            };

            const javaLogColor = getXLogColor(selectLogLevel);

            return `${logLevelMap[selectLogLevel]}("${javaLogColor}[Log #${uniqueId}] ${logVariable}: " + ${logVariable} + "\\033[0m");\n`;
        }
        case 'Golang': {
            const selectLogLevel = await vscode.window.showQuickPick(
                ["Log", "Warning", "Error"], {
                    placeHolder: 'Select a log level',
                    canPickMany: false
                }
            ) || "Log";

            const goLogColor = getXLogColor(selectLogLevel);

            return `fmt.Printf("${goLogColor}[Log #${uniqueId}] ${logVariable}: %v\\033[0m\\n", ${logVariable});\n`;
        }
        case 'Dart': {
            const selectLogLevel = await vscode.window.showQuickPick(
                ["Log", "Warning", "Error"], {
                    placeHolder: 'Select a log level',
                    canPickMany: false
                }
            ) || "Log";

            const dartLogColor = getDartLogColor(selectLogLevel);
            
            return `print("${dartLogColor}[Log #${uniqueId}] ${logVariable}: $${logVariable}\\x1B[0m");\n`;
        }
        default:
            return `console.log('');`;
    }
};

const getXLogColor = (logLevel) => {
    const Colors = {
        "Warning": '\\033[93m', // Yellow
        "Error": '\\033[91m',   // Red
        "Log": '\\033[97m',     // Green
    };
    return Colors[logLevel] || Colors.LOG;
}

const getDartLogColor = (logLevel) => {
    const Colors = {
        "Warning": '\\x1B[93m', // Yellow
        "Error": '\\x1B[91m',   // Red
        "Log": '\\x1B[97m',     // Green
    };
    return Colors[logLevel] || Colors.LOG;
}

const getLogColor = (logLevel) => {
    switch (logLevel) {
        case "Error":
            return "red";
        case "Warning":
            return "orange";
        default:
            return "green";
    }
};

const getDefaultLanguage = () => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const fileExtension = editor.document.fileName.split('.').pop().toLowerCase();
        const languageMap = {
            js: "JavaScript",
            php: "Php",
            html: "html",
            ts: "TypeScript",
            py: "Python",
            java: "Java",
            go: "Golang",
            dart: "Dart"
        };

        return languageMap[fileExtension] || null;
    } else {
        vscode.window.showInformationMessage('No active editor found');
        return null;
    }
};

function initializeStatusBar(context) {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    return statusBarItem;
}

async function updateLanguage(context, defaultLanguage) {
    let userLanguage = await context.globalState.get('selectedLanguage');
    userLanguage = defaultLanguage;
    await context.globalState.update('selectedLanguage', userLanguage);
}


function deactivate() {}

module.exports = {
    activate,
    deactivate
};
