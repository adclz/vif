import {EventEmitter} from "node:events";
import child_process from "node:child_process";
import path from "node:path";
import getPort from "get-port"
import open from "open"

export default defineNitroPlugin(async (nitroApp) => {
    const args = process.argv
    
    let baseUrl = "localhost";
    const baseUrlIndex = args.findIndex(x => x === "--baseUrl")
    if (baseUrlIndex !== -1) baseUrl = args[baseUrlIndex + 1]

    let socketUrl;
    const socketUrlIndex = args.findIndex(x => x === "--socketUrl")
    if (socketUrlIndex !== -1) socketUrl = args[socketUrlIndex + 1]

    let serverUrl;
    const serverUrlIndex = args.findIndex(x => x === "--serverUrl")
    if (serverUrlIndex !== -1) serverUrl = args[serverUrlIndex + 1]
    
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

    console.log(`[Ui] listening task runner socket on ${socketUrl ? `ws://${socketUrl}` : `ws://${baseUrl}:${socketPort}`}`)
    console.log(`[Ui] listening task runner server on ${serverUrl ? `http://${serverUrl}` : `http://${baseUrl}:${serverPort}`}`)
    
    await useStorage().setItem<boolean>('vif-sim:launched', true)
    await useStorage().setItem<{ 
        baseUrl: string,
        socketUrl?: string,
        serverUrl?: string,
        socket: number,
        server: number
    }>('vif-sim:network', {
        baseUrl: baseUrl,
        socketUrl: socketUrl,
        serverUrl: serverUrl,
        socket: socketPort,
        server: serverPort
    })
})