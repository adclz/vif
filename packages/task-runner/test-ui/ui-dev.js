import {StartRunner} from "../dist/index.js";
import watch from "node-watch"
import child_process from "node:child_process";
import {dirname} from "node:path";
import {fileURLToPath} from "node:url";

const run = await
    StartRunner("./test-code/main.ts", {socketPort: 2005, serverPort: 2006})

run
    .once((data, sim, update) => {
        watch(data.runnerFile, {recursive: true}, async () => {
            await update()
        })
    })
    .once((data, sim) => {
        const child = child_process.spawn("cd",
            [`../../ui/ && pnpm run dev --server ${data.serverPort} --socket ${data.socketPort} --browser`],
            {
                shell: true,
                cwd: dirname(fileURLToPath(import.meta.url))
            })
        child.stdout.on("data", (e) => console.log(e.toString()))
        child.stdout.on("close", (e) => console.log(e.toString()))
        child.stdout.on("error", (e) => console.error(e))
        child.stderr.on("data", (e) => console.error(e.toString()))
    })