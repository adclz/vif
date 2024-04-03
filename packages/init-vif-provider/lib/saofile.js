const path = require('path')
const fs = require('fs')
const chalk = require('chalk')

module.exports = {
    prompts: require('./prompts'),
    actions() {
        const projectName = this.answers.name
        const hasVitest = this.answers.options.includes("vitest")

        const actions = [{
            type: 'add',
            files: [
                '.gitignore',
                'package.json',
                'tsconfig.json',
                'src/internal/index.ts',
                'src/source/index.ts',
                'src/wrap/index.ts',
                'validate.js'
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
                            "build": "node validate.js && tsc --build ./tsconfig.prod.json && tsc-alias"
                        },
                        dependencies: {
                            "@vifjs/language-builder": "latest",
                        },
                        devDependencies: {
                            "tsc": "latest",
                            "tsc-alias": "latest",
                            ...(hasVitest && { ["vitest"]: "latest" }),
                            ...(hasVitest && { ["vite-tsconfig-paths"]: "latest" })
                        }
                    }
                }
            },
        ]

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
        console.log(chalk.green("Completed"));
        console.log(chalk`  {bold Next:}`)
        console.log(`\t cd ${this.answers.name}`);
        console.log(`\t [npm/pnpm/yarn] install`);
    }
}
