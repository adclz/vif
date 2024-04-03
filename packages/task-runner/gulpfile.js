import {StartRunner} from "./dist/index.js";
import watch from "node-watch"
import {externSocket} from "./dist/externSocket.js";

const run = await
    StartRunner("./test-code/main.ts", {socketPort: 2005, serverPort: 2006})

run
    .once((data, sim, update) => {
        watch(data.runnerFile, {recursive: true}, async () => {
            await update()
        })
    })
    .once(externSocket)