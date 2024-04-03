import {PipeData} from "@/src/index.js";
import {VifSim} from "@/src/vif-sim.js";
import child_process from "node:child_process";
import {join} from "node:path";
import {tmpdir} from 'node:os';
import {mkdtemp, rmSync, writeFileSync} from 'node:fs';

const isProtocolInstalled = (provider: string) => {
    if (process.platform === "win32")
        if (provider === "@vifjs/1200-pack" || provider === "@vifjs/1500-pack")
            return child_process.spawnSync("powershell", [`
                $path = Get-Item -Path registry::HKEY_CLASSES_ROOT\\vif-comp-s7
                    if ($null -eq $path) {
                        exit 1
                    else {
                        exit 0
                    }'
                `]).status === 0
    return false
}

export const runProtocol = (data: PipeData, vifSim: VifSim) => {
    const compiled = data.currentCompiled
    if (!compiled) throw Error("No valid compiled data could be found")
    
    const protocol = data.protocol
    if (!protocol) throw Error("No valid protocol could be found")

    const random = (Math.random() + 1).toString(36).substring(7)
    const dir = join(tmpdir(), `${data.protocol}-${random}`)
    
    if (!isProtocolInstalled(data.protocol))
        throw new Error(`Can't find the protocol ${data.protocol} on system`)
    
    mkdtemp(dir, (err, dir) => {
        if (err) throw err
        const output = join(dir, "./output.json")
        writeFileSync(output, JSON.stringify(compiled))
        const child = child_process.spawn("start",
            [`${data.protocol}:${output}`],
            {
                shell: true,
            })
        child.stdout.on("data", (e) => console.log(e.toString()))
        child.stdout.on("close", (e) => rmSync(dir, { recursive: true, force: true }))
        child.stderr.on("data", (e) => {
            rmSync(dir, { recursive: true, force: true })
            throw e
        })
    })
}