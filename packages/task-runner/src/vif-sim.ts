import {ParseStatus} from "@vifjs/sim-node";
import {Container} from "@vifjs/sim-node/boot";
import {Plugin} from "@vifjs/sim-node/plugin";
import {Socket} from "@/src/socket.js";
import {Server} from "@/src/server.js";
import {PipeData} from "@/src/index.js";

export class VifSim {
    private socket: Socket
    private server: Server
    private container: Container
    private plugin: Plugin
    private asyncExecutor: any
    private vifData: PipeData
    
    private constructor(container: Container, plugin, asyncExecutor, vifData: PipeData) {
        this.container = container
        this.plugin = plugin
        this.asyncExecutor = asyncExecutor
        this.vifData = vifData

        this.plugin.on("parse-program:status", status => {
            if (status === ParseStatus.Loaded)
                this.container.clearProgram()
        })

        this.plugin.on("messages", messages => {
            messages.forEach(x => {
                console.log(x)
            })
        })

        this.plugin.on("error", messages => {
            console.error(messages)
        })
    }
    
    public static InitAsync = async (vifData: PipeData) => {
        const container = new Container()
        await container.boot()
        const plugin = new Plugin("gulp-dev-ui", 100)
        return new VifSim(container, plugin, await plugin.getAsyncExecutor().init(container), vifData)
    }
    
    public getContainer = () => this.container
    public getPlugin = () => this.plugin
    public getAsyncExecutor = () => this.asyncExecutor

}