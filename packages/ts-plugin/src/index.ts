import ts from "typescript"
import * as path from "node:path";
import * as fs from "node:fs";
import * as url from "node:url";
import WebSocket from "ws"
import * as utils from "tsutils";

let runnerSockets: Record<string, WebSocket> = {}
let diagnostics: Record<string, { 
    line: number,
    column: number,
    message: string,
    severity: ts.DiagnosticCategory,
    source: string,
    code: number
}[]> = {}

const getPosOfFirstAndNext = (doc: ts.SourceFile, line: number, char: number) => {
    const intialPos = doc.getPositionOfLineAndCharacter(line, char)

    const initialToken = utils.getTokenAtPosition(doc, intialPos)
    const initialTokenWidth = initialToken?.getWidth()

    const nextToken = utils.getTokenAtPosition(doc, intialPos + initialTokenWidth!)
    const nextTokenWith = nextToken?.getWidth()

    return {from: initialTokenWidth!, to: nextTokenWith!, length: initialTokenWidth! + nextTokenWith! + 1}
}


const getPosOfLast = (doc: ts.SourceFile, line: number, char: number) => {
    const intialPos = doc.getPositionOfLineAndCharacter(line, char)

    const initialToken = utils.getTokenAtPosition(doc, intialPos)
    const initialTokenWidth = initialToken?.getWidth()

    const nextToken = utils.getTokenAtPosition(doc, intialPos + initialTokenWidth!)
    const nextTokenWith = nextToken?.getWidth()

    return intialPos + initialTokenWidth! + nextTokenWith! + 1
}

// Loads the runner json file 
const initFiles = (cwd: string, info: ts.server.PluginCreateInfo) => {
    const logger = info.project.projectService.logger

    const nodeModules = path.join(cwd, "/node_modules");
    const vifCfgFolder = path.join(nodeModules, ".vif");
    const vifCfgFile = path.join(vifCfgFolder, "runner.json");

    logger.info(`Watching runner file on ${vifCfgFile}`);
    // Check if .vif exists
    if (!fs.existsSync(vifCfgFolder)) {
        fs.mkdirSync(vifCfgFolder, { recursive: true });
    }
    setInterval(() => {
        if (fs.existsSync(vifCfgFile)) {
            const runnerPorts = JSON.parse(fs.readFileSync(vifCfgFile, "utf-8"));
            for (let i = 0; i < runnerPorts.length; i++) {
                const port = runnerPorts[i];
                if (!runnerSockets[port]) {
                    const ws = wss(cwd, port, info);
                    if (ws)
                        runnerSockets[port] = ws;
                }
            }
        }
    }, 2000);
};

/// Load WebSocket client that listens to runner socket
const wss = (cwd: string, port: number, info: ts.server.PluginCreateInfo) => {
    const logger = info.project.projectService.logger
    try {
        const ws = new WebSocket(`http://localhost:${port}`)
        logger.info(`Attempting to connect to runner ${port}`);
        ws.onmessage = (event: any) => {
            const evv = JSON.parse(event.data) as
                {
                    "provider": { "status": 1 | 2, "err"?: any },
                    "program": { "status": 1 | 2, "err"?: any },
                    "compiler": { "status": 1 | 2, "err"?: any }
                }

            // 1 = error
            if (evv.program.status === 2 && evv.program.err.ty === "vif-err") {
                const error = evv.program.err as {
                    error: string,
                    file_stack: { line: number, column: number, file: string }[],
                    sim_stack: string[]
                }

                // Add file stack
                error.file_stack.forEach(trace => {
                    const fileName = path.normalize(path.join(cwd, trace.file))

                    if (!diagnostics[fileName]) diagnostics[fileName] = []
                    diagnostics[fileName].push({
                        line: trace.line,
                        column: trace.column,
                        message: error.error,
                        severity: ts.DiagnosticCategory.Error,
                        source: "Vif language service",
                        code: 0
                    })
                })
                info.project.refreshDiagnostics()
            } else {
                diagnostics = {}
                info.project.refreshDiagnostics()
            }
        }

        ws.onclose = () => {
            logger.info(`Disconnected from runner ${port}`)
            delete runnerSockets[port]
        }

        ws.onerror = () => {
            delete runnerSockets[port]
        }

        return ws
    } catch (e) {
        logger.error(e)
        return
    }
}
function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
    //@ts-ignore
    function create(info: ts.server.PluginCreateInfo) {
        const logger = info.project.projectService.logger
        const tsconfig: ts.CompilerOptions = JSON.parse(JSON.stringify(info.project.getCompilerOptions()))
        const rootDir = tsconfig.baseUrl ? tsconfig.baseUrl : tsconfig.pathsBasePath as string
        
        // c%3a
        initFiles(rootDir, info);
        logger.info("Vif ts plugin loaded!")
        
        const proxy: ts.LanguageService = Object.create(null);

        for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
            const x = info.languageService[k]!;
            //@ts-ignore
            proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
        }

        proxy.getSemanticDiagnostics = (filename): ts.Diagnostic[] => {
            const prior = info.languageService.getSemanticDiagnostics(filename);
            const doc = info.languageService.getProgram()?.getSourceFile(filename) as ts.SourceFile;

            if (!doc) return prior
            const normalizedFileName = path.normalize(filename)

            const diags = 
                diagnostics[normalizedFileName]
                .map(x => {
                    return {
                        file: doc,
                        start: doc.getPositionOfLineAndCharacter(x.line - 1, x.column - 1),
                        length: getPosOfFirstAndNext(doc, x.line - 1, x.column - 1).length,
                        messageText: x.message,
                        category: x.severity,
                        source: x.source,
                        code: x.code
                    }
                })
            if (!diags)
                return prior;
            const fmdiags = diags.map(x => {
                return {
                    file: doc,
                    start: doc.getPositionOfLineAndCharacter(x.line - 1, x.column - 1),
                    length: getPosOfFirstAndNext(doc, x.line - 1, x.column - 1).length,
                    messageText: x.message,
                    category: x.severity,
                    source: x.source,
                    code: x.code
                };
            });
            return [
                ...prior,
                ...fmdiags
            ];
        }

        return proxy;
    }

    return {create};
}

export = init;