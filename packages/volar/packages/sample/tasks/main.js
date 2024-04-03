import {externSocket} from "@vifjs/task-runner/extern"
//import {runUi} from "@vifjs/vif-ui/run"
import watch from "node-watch"
import {StartRunner} from "@vifjs/task-runner/runner";

const run = await StartRunner("./code/main.ts")
    run.once((data, sim, update) => {
        watch("./code", { recursive: true }, async () => {
            await update()
        })
    })
    //run.once(runUi({ browser: true }))
    run.once(externSocket)