import {WebSocketServer} from "ws";
import {PipeData} from "@/src/index.js";

export class Socket {
    private _socket: WebSocketServer
    private vifData: PipeData
    
    constructor(port: number, vifData: PipeData) {
        this.vifData = vifData
        this._socket = new WebSocketServer({port})
        
        this._socket.on("connection", ev => {
            ev.send(JSON.stringify(this.vifData.states))
        })

        console.log(`Socket listening on ${port}`);
    }

    public sendServicesState() {
        this._socket.clients.forEach(client => {
            client.send(JSON.stringify(this.vifData.states))
        })
    }
}