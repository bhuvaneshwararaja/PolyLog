const vscode = require('vscode');

const LOG_LEVELS = ["Log", "Warning", "Error"];

const CSS_COLORS = { Log: "green", Warning: "orange", Error: "red" };
const ANSI_COLORS = { Log: '\\033[97m', Warning: '\\033[93m', Error: '\\033[91m' };
const DART_COLORS = { Log: '\\x1B[97m', Warning: '\\x1B[93m', Error: '\\x1B[91m' };

async function promptLogLevel() {
    return await vscode.window.showQuickPick(LOG_LEVELS, {
        placeHolder: 'Select a log level',
        canPickMany: false
    }) || "Log";
}

function jsLogFormatter(logVariable, uniqueId, logLevel) {
    const color = CSS_COLORS[logLevel];
    const method = logLevel === "Warning" ? "warn" : logLevel.toLowerCase();
    return `console.${method}('%c[Log #${uniqueId}] ${logVariable}:', 'color: ${color}; font-weight: bold;', ${logVariable});\n`;
}

const LANGUAGES = {
    JavaScript: {
        extensions: ['js'],
        needsLogLevel: true,
        format(logVariable, uniqueId, logLevel) {
            return jsLogFormatter(logVariable, uniqueId, logLevel);
        }
    },
    TypeScript: {
        extensions: ['ts'],
        needsLogLevel: true,
        format(logVariable, uniqueId, logLevel) {
            return jsLogFormatter(logVariable, uniqueId, logLevel);
        }
    },
    Php: {
        extensions: ['php'],
        needsLogLevel: false,
        detectsScriptBlock: true,
        format(logVariable, uniqueId) {
            return `echo '[Log #${uniqueId}] ${logVariable}: ', ${logVariable};\n`;
        }
    },
    html: {
        extensions: ['html'],
        needsLogLevel: false,
        detectsScriptBlock: true,
        format() {
            return undefined;
        }
    },
    Python: {
        extensions: ['py'],
        needsLogLevel: true,
        format(logVariable, uniqueId, logLevel) {
            const color = ANSI_COLORS[logLevel];
            return `print(f"${color}[Log #${uniqueId}] ${logVariable}: {${logVariable}}{'\\033[0m'}")\n`;
        }
    },
    Java: {
        extensions: ['java'],
        needsLogLevel: true,
        format(logVariable, uniqueId, logLevel) {
            const method = logLevel === "Log" ? "System.out.println" : "System.err.println";
            const color = ANSI_COLORS[logLevel];
            return `${method}("${color}[Log #${uniqueId}] ${logVariable}: " + ${logVariable} + "\\033[0m");\n`;
        }
    },
    Golang: {
        extensions: ['go'],
        needsLogLevel: true,
        format(logVariable, uniqueId, logLevel) {
            const color = ANSI_COLORS[logLevel];
            return `fmt.Printf("${color}[Log #${uniqueId}] ${logVariable}: %v\\033[0m\\n", ${logVariable});\n`;
        }
    },
    Dart: {
        extensions: ['dart'],
        needsLogLevel: true,
        format(logVariable, uniqueId, logLevel) {
            const color = DART_COLORS[logLevel];
            return `print("${color}[Log #${uniqueId}] ${logVariable}: $${logVariable}\\x1B[0m");\n`;
        }
    }
};

const EXTENSION_TO_LANGUAGE = {};
for (const [name, config] of Object.entries(LANGUAGES)) {
    for (const ext of config.extensions) {
        EXTENSION_TO_LANGUAGE[ext] = name;
    }
}

function getLanguageForFile(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    return EXTENSION_TO_LANGUAGE[ext] || null;
}

async function buildLogStatement(languageName, logVariable, lineNumber, scriptRange) {
    const config = LANGUAGES[languageName];
    if (!config) {
        return null;
    }

    const uniqueId = Date.now();

    if (config.detectsScriptBlock && scriptRange) {
        const inScript = lineNumber >= scriptRange.startLine && lineNumber <= scriptRange.endLine;
        if (inScript) {
            return buildLogStatement("JavaScript", logVariable, lineNumber, null);
        }
        return config.format(logVariable, uniqueId);
    }

    const logLevel = config.needsLogLevel ? await promptLogLevel() : undefined;
    return config.format(logVariable, uniqueId, logLevel);
}

module.exports = {
    LANGUAGES,
    getLanguageForFile,
    buildLogStatement,
    promptLogLevel
};
