import child_process from "node:child_process";
import {fileURLToPath} from "node:url";
import {dirname} from "node:path";

export const runUi = (options) => (data, vifSim) => {
    const child = child_process.spawn("node",
        [`./server/index.mjs --server ${data.serverPort} --socket ${data.socketPort} ${options.browser ? '--browser' : ''}`],
        {
            shell: true,
            cwd: dirname(fileURLToPath(import.meta.url))
        })
    child.stdout.on("data", (e) => console.log(e.toString()))
    child.stdout.on("close", (e) => console.log(e.toString()))
    child.stdout.on("error", (e) => console.error(e))
    child.stderr.on("data", (e) => console.error(e.toString()))
}