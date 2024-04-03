import fs from "node:fs"
import path from "node:path"

fs.writeFile(path.join("./.output/package.json"),
    `{
    "name": "@vifjs/ui",
    "version": "0.0.1",
    "type": "module",
    "exports": 
     {
        "./run": "./pipe.js"
     }
}`, err => {
        if (err)
            console.error(err)
    })

fs.copyFile(path.join("./pipe.js"), path.join("./.output/pipe.js"), () => {})
fs.copyFile(path.join("./README.MD"), path.join("./.output/README.MD"), () => {})
fs.copyFile(path.join("./Licence.txt"), path.join("./.output/Licence.txt"), () => {})