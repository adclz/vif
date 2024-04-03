import {PipeData} from "@/src/index.js";
import {VifSim} from "@/src/vif-sim.js";
import {join} from "node:path";
import {existsSync, mkdirSync, rmSync, writeFileSync, readFileSync} from 'node:fs';

export const externSocket = (data: PipeData, vifSim: VifSim) => {
    const nodeModules = join(process.cwd(), "/node_modules")
    const vifCfgFolder = join(nodeModules, ".vif")
    const vifCfgFile = join(vifCfgFolder, "runner.json")

    if (!existsSync(vifCfgFolder)) {
        mkdirSync(vifCfgFolder, {recursive: true})
    }
    
    if (!existsSync(vifCfgFile)) {
        writeFileSync(vifCfgFile, JSON.stringify([data.socketPort]))
    } else {
        const ports = JSON.parse(readFileSync(vifCfgFile, "utf-8")) as number[]
        const index = ports.indexOf(data.socketPort)
        if (index === -1) {
            ports.push(data.socketPort)
            writeFileSync(vifCfgFile, JSON.stringify(ports))
        }
    }

    [`exit`].forEach((eventType) => {
        process.on(eventType, () => {
            if (existsSync(vifCfgFile)) {
                const ports = JSON.parse(readFileSync(vifCfgFile, "utf-8")) as number[]
                const index = ports.indexOf(data.socketPort)
                if (index !== -1) {
                    ports.splice(index, 1)
                    writeFileSync(vifCfgFile, JSON.stringify(ports))
                }
            }
        });
    })
}