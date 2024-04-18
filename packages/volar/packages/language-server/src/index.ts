import { create as createTypeScriptServices } from 'volar-service-typescript';
import { createServer, createConnection, createTypeScriptProjectProviderFactory, TextDocument, Position, DiagnosticSeverity, loadTsdkByPath } from '@volar/language-server/node';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from "node:url"
import WebSocket from "ws"

const getPosOfFirstAndNext = (doc: TextDocument, line: number, character: number): { start: Position, end: Position } => {
    // todo!
    return { start: { line, character }, end: { line, character: character + 3 } }
}

const initFiles = (cwd: string) => {
    const nodeModules = path.join(cwd, "/node_modules")
    const vifCfgFolder = join(nodeModules, ".vif")
    const vifCfgFile = join(vifCfgFolder, "runner.json")

    // Check if .volar-vif exists
    if (!existsSync(vifCfgFolder)) {
        mkdirSync(vifCfgFolder, { recursive: true })
    }

    setInterval(() => {
        if (existsSync(vifCfgFile)) {
            const runnerPorts = JSON.parse(readFileSync(vifCfgFile, "utf-8")) as number[]

            for (let i = 0; i < runnerPorts.length; i++) {
                const port = runnerPorts[i]
                if (!runnerSockets[port]) {
                    const ws = wss(cwd, port)
                    if (ws) runnerSockets[port] = ws
                }
            }
        }
    }, 2000)
}


let runnerSockets: Record<string, WebSocket> = {}

const wss = (cwd: string, port: number) => {
    try {
        const ws = new WebSocket(`http://localhost:${port}`)
        console.log(`Attempting to connect to runner ${port}`)
        ws.onmessage = (event: any) => {
            const evv = JSON.parse(event.data) as
                {
                    "provider": { "status": 1 | 2, "error"?: any },
                    "program": { "status": 1 | 2, "error"?: any },
                    "compiler": { "status": 1 | 2, "error"?: any }
                }

            // 1 = error
            if (evv.program.status === 2 && evv.program.error.ty === "vif-error") {
                const error = evv.program.error.error as {
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
                        severity: DiagnosticSeverity.Error,
                        source: "Vif language server",
                        code: 0
                    })
                })
                server.projects.reloadProjects()
            } else {
                diagnostics = {}
                server.projects.reloadProjects()
            }
        }

        ws.onclose = () => {
            console.log(`Disconnected from runner ${port}`)
            delete runnerSockets[port]
        }

        ws.onerror = () => {
            delete runnerSockets[port]
        }

        console.log(`Ok`)
        return ws
    } catch (e) {
        console.log(e)
        return
    }
}

let diagnostics: Record<string, any[]> = {}

const connection = createConnection();
const server = createServer(connection);

connection.listen();

connection.onInitialize(params => {
    // c%3a
    const cwd = fileURLToPath(params.workspaceFolders![0]!.uri)
    initFiles(cwd)
    const tsdk = loadTsdkByPath(params.initializationOptions.typescript.tsdk, params.locale);
    return server.initialize(params,
        createTypeScriptProjectProviderFactory(tsdk.typescript, tsdk.diagnosticMessages),
        {
        getLanguagePlugins() {
            return []
        },
        getServicePlugins() {
            return [
                ...createTypeScriptServices(tsdk.typescript, {}),
                {
                    create(context) {
                        return {
                            provideSemanticDiagnostics(document, token) {
                                const safeUri = fileURLToPath(document.uri)
                                console.log(diagnostics)

                                const diags = diagnostics[safeUri]
                                if (!diags) return []

                                return diags.map((x: any) => ({
                                    range: getPosOfFirstAndNext(document, x.line - 1, x.column - 1),
                                    message: x.message,
                                    severity: x.severity,
                                    source: x.source,
                                    code: x.code,
                                }))
                            }
                        } 
                    },
                },
            ];
        },
    });
});

connection.onInitialized(server.initialized);

connection.onShutdown(server.shutdown);