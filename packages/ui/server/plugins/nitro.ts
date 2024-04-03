import {EventEmitter} from "node:events";
import child_process from "node:child_process";
import path from "node:path";
import getPort from "get-port"
import open from "open"

export default defineNitroPlugin(async (nitroApp) => {
    const args = process.argv
    let socketPort;
    if (process.env.SOCKET_PORT)
        socketPort = parseInt(process.env.SOCKET_PORT)
    else {
        const socket = args.findIndex(x => x === "--socket")
        if (socket === -1) throw new Error("Can't find socket port")
        socketPort = parseInt(args[socket + 1])
    }


    let serverPort;
    if (process.env.SERVER_PORT)
        serverPort = parseInt(process.env.SERVER_PORT)
    else {
        const socket = args.findIndex(x => x === "--server")
        if (socket === -1) throw new Error("Can't find server port")
        serverPort = parseInt(args[socket + 1])
    }

    console.log(`Listening runner on Socket: ${socketPort} & Server: ${serverPort}`)
    await useStorage().setItem<boolean>('vif-sim:launched', true)
    await useStorage().setItem<{ socket: number, server: number }>('vif-sim:ports', {
        socket: socketPort,
        server: serverPort
    })
})