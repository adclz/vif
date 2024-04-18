// Not much i can do before waiting for next PR
// https://github.com/xtermjs/xterm.js/issues/3764#issuecomment-1870984332
import fs from 'node:fs'
import path from 'node:path'

const xtermAddon = path.join(process.cwd(), "../../node_modules/.pnpm/xterm-addon-fit@0.8.0_xterm@5.3.0/node_modules/xterm-addon-fit/lib/xterm-addon-fit.js")

fs.readFile(xtermAddon, 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    const result = data.replace(/self/g, 'globalThis');

    fs.writeFile(xtermAddon, result, 'utf8', function (err) {
        if (err) return console.log(err)
    })
})