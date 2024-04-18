const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const {spawn} = require("node:child_process")

let mustUpdate = false

module.exports = {
    prompts: require('./prompts'),
    async actions() {
        mustUpdate = this.answers.update[0] === "y"

        if (mustUpdate) {
            const pkgPath = path.join(process.cwd(), "/package.json")
            if (!fs.existsSync(pkgPath)) throw new Error(`Could not find a valid package.json at ${pkgPath}`)

            const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))

            if (pkg["dependencies"])
                for (const dep in pkg["dependencies"]) {
                    if (dep.startsWith("@vifjs")) {
                        const npm = await (await fetch(`https://registry.npmjs.com/${dep}`, {
                            method: "GET"
                        })).json()
                        pkg["dependencies"][dep] = npm["dist-tags"]["latest"]
                    }
                }

            if (pkg["devDependencies"])
                for (const dep in pkg["devDependencies"]) {
                    if (dep.startsWith("@vifjs")) {
                        const npm = await (await fetch(`https://registry.npmjs.com/${dep}`, {
                            method: "GET"
                        })).json()
                        pkg["devDependencies"][dep] = npm["dist-tags"]["latest"]
                    }
                }

            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
        }

        return []
    },
    async completed() {
        if (mustUpdate) {
            const root = fs.readdirSync(process.cwd())

            if (root.includes("package-lock.json")) await spawnInstall("npm")
            else if (root.includes("pnpm-lock.yaml")) await spawnInstall("pnpm")
            else if (root.includes("yarn.lock")) await spawnInstall("yarn")
            else console.log(chalk.yellow("Could not determine the package manager, install step skipped."))
            console.log(chalk.green("Completed"))
        } else
            console.log(chalk.red("Aborted"))
    }
}

const spawnInstall = async (manager) => {
    return new Promise(async (resolve, reject) => {
        const task = await spawn(manager, ["install"], { cwd: process.cwd() })
        task.stdout.on('data', (data) => {
            console.log(`${data}`);
        });

        task.stderr.on('data', (data) => {
            console.error(`${data}`);
        });

        task.on('close', (code) => {
            console.log(`install process exited with code ${code}`);
            resolve()
        });  
    })
}