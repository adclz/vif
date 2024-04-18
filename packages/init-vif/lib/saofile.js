const path = require('path')
const fs = require('fs')
const chalk = require('chalk')

module.exports = {
    prompts: require('./prompts'),
    actions() {
        const projectName = this.answers.name
        const provider = this.answers.provider
        const hasVifUi = this.answers.options.includes("@vifjs/ui")
        const hasNodeWatch = this.answers.options.includes("node-watch")
        const hasVitest = this.answers.options.includes("vitest")
        const hasTsPlugin = this.answers.options.includes("ts-plugin")
        
        const actions = [{
            type: 'add',
            files: [
                '.gitignore',
                'package.json',
                'tsconfig.json',
                'code/main.ts',
                'code/blocks/myFirstFb.ts',
                'code/blocks/myFirstInstanceDb.ts',
                'tasks/main.js',
            ],
        },
            {
                type: "modify",
                files: "package.json",
                handler(data) {
                    return {
                        ...data,
                        name: projectName,
                        scripts: {
                          "main": "node ./tasks/main.js",
                            ...(hasVitest && { ["test"]: "vitest" }),  
                        },
                        dependencies: {
                            [provider]: "latest",
                            "tsx": "latest",
                            "@vifjs/task-runner": "latest",
                            "@vifjs/sim-node": "latest",
                            ...(hasVifUi && { ["@vifjs/ui"]: "latest" }),
                            ...(hasVitest && { ["vitest"]: "latest" }),
                            ...(hasVitest && { ["vite-tsconfig-paths"]: "latest" }),
                            ...(hasNodeWatch && { ["node-watch"]: "latest" })
                            
                        },
                        imports: {
                            "#source": `${provider}/source`,
                            "#compiler":`${provider}/compiler`,
                            "#pou": `${provider}/pou`,
                            "#primitives": `${provider}/types/primitives`,
                            "#complex": `${provider}/types/complex`,
                            "#utilities": `${provider}/types/utilities`,
                            "#unit": `${provider}/operations/unit`,
                            "#program-control": `${provider}/operations/program-control`,
                            "#basics": `${provider}/operations/basics`,
                            "#math": `${provider}/operations/math`,
                            "#binary": `${provider}/operations/binary`
                        }
                    }
                }
            }
        ]
        
        if (hasNodeWatch) {
            actions.push({
                type: "modify",
                files: "tasks/main.js",
                handler(data) {
                    let fmt = 
                        `import watch from "node-watch"
${data}
    run.once((data, sim, update) => {
        watch("./code", { recursive: true }, async () => {
            await update()
        })
    })`
                    return fmt.replace(/^\uFEFF/gm, "").replace(/^\u00BB\u00BF/gm,"")
                }
            })
        }

        if (hasVifUi) {
            actions.push({
                type: "modify",
                files: "tasks/main.js",
                handler(data) {
                    let fmt =
                        `import {runUi} from "@vifjs/ui/run"
${data}
    run.once(runUi({ browser: true }))`
                    return fmt.replace(/^\uFEFF/gm, "").replace(/^\u00BB\u00BF/gm,"")
                }
            })
        }
        
        if (hasVitest)
            actions.push({
                type: "add",
                files: [
                    "vitest.config.ts",
                    "tests/main.test.ts"
                ]
            })
        return actions
    },
    async completed() {
        console.log(chalk.green("Completed"))
        console.log(chalk`  {bold Next:}`)
        console.log(`\t cd ${this.answers.name}`)
        console.log(`\t [npm/pnpm/yarn] install`)
    }
}
