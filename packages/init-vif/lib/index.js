#! /usr/bin/env node

const chalk = require("chalk");
const sao = require("sao")
const path = require('path')
const fs = require('fs')
const cac = require('cac')
const { version } = require('../package.json')

const cli = cac("create-vif")

const generator = path.resolve(__dirname, './');

const run = () => {
    cli
        .command("[out Dir]", 'Generate in a custom directory or current directory')
        .option('--overwrite-dir', 'Overwrite the target directory')
        .action( (outDir = ".", cliOptions) => {

            const { answers, overwriteDir, verbose } = cliOptions
            if (fs.existsSync(outDir) && fs.readdirSync(outDir).length && !overwriteDir) {
                const baseDir = outDir === '.' ? path.basename(process.cwd()) : outDir
                return console.error(chalk.red(
                    `Could not create project in ${chalk.bold(baseDir)} because the directory is not empty.`))
            }

            console.log(chalk`Generating Vif project in {cyan ${outDir}}`)
            
            sao({generator, outDir, logLevel: 2})
                .run()
                .catch((err) => {
                    console.trace(err)
                    process.exit(1)
                })
        })

    cli.help()

    cli.version(version)

    cli.parse()
}

try {
    run()
} catch (err) {
    // https://github.com/cacjs/cac/blob/f51fc2254d7ea30b4faea76f69f52fe291811e4f/src/utils.ts#L152
    // https://github.com/cacjs/cac/blob/f51fc2254d7ea30b4faea76f69f52fe291811e4f/src/Command.ts#L258
    if (err.name === 'CACError' && err.message.startsWith('Unknown option')) {
        console.error()
        console.error(chalk.red(err.message))
        console.error()
        cli.outputHelp()
    } else {
        console.error()
        console.error(err)
    }
    process.exit(1)
}