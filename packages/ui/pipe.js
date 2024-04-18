import child_process from "node:child_process";
import {fileURLToPath} from "node:url";
import {dirname} from "node:path";

/**
 * Run the Ui 
 * 
 * Should only be called once since this task will listen to the task runner using both server and socket.
 * 
 * @param {Object} options
 * @param {string} options.baseUrl baseUrl host, default localhost.
 * @param {number} options.server Override the task runner server port.
 * @param {number} options.socket Override the task runner socket port.
 * @param {string} options.serverUrl Override the task runner server url, ignoring server port param.
 * @param {string} options.socketUrl Override the task runner socket url, ignoring socket port param.
 * @param {boolean} options.browser Launch the browser automatically when the node server is ready.
 **/
export const runUi = (options) => (data, vifSim) => {
    let cmd = "./server/index.mjs "
    if (options.baseUrl) cmd += `--baseUrl ${options.baseUrl} `
    
    if (options.server) cmd += `--server ${options.server} ` 
    else cmd += `--server ${data.serverPort} `
    
    if (options.socket) cmd += `--socket ${options.socket} `
    else cmd += `--socket ${data.socketPort} `
    
    if (options.serverUrl) cmd += `--serverUrl ${options.serverUrl} `
    if (options.socketUrl) cmd += `--socketUrl ${options.socketUrl} `
    if (options.browser) cmd += `--browser `
    
    const child = child_process.spawn("node",
        [cmd],
        {
            shell: true,
            cwd: dirname(fileURLToPath(import.meta.url))
        })
    child.stdout.on("data", (e) => console.log(e.toString()))
    child.stdout.on("close", (e) => console.log(e.toString()))
    child.stdout.on("error", (e) => console.error(e))
    child.stderr.on("data", (e) => console.error(e.toString()))
}