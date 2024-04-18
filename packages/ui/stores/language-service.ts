export const useLanguageService = defineStore({
    id: "language_service",

    state: () => ({
        providerName: null,
        runnerFile: null,
        protocol: null,
        ports: null,
        socket: null,
        serverUrl: null,
        socketUrl: null,
        transformers: null,
        ServicesState: {
            provider: {status: 0},
            program: {status: 0},
            compiler: {status: 0}
        }
    }),

    actions: {
        async initLanguageService() {
            const data_network = await useFetch('/api/get-ports')
            this.ports = data_network.data.value.ports as {
                baseUrl: string,
                socketUrl?: string,
                serverUrl?: string,
                socket: number,
                server: number
            }
            if (!this.ports)
                throw new Error("Invalid ports received")
            
            if (this.ports.socketUrl)
                this.socketUrl = this.ports.socketUrl
            else this.socketUrl = `ws://${this.ports.baseUrl}:${this.ports.socket}`

            if (this.ports.serverUrl)
                this.serverUrl = this.ports.serverUrl
            else this.serverUrl = `http://${this.ports.baseUrl}:${this.ports.server}`

            this.providerName = await fetch(`${this.serverUrl}/__get-provider-name`, {
                method: "GET"
            }).then(async x => await x.text())


            this.runnerFile = await fetch(`${this.serverUrl}/__get-runner-file`, {
                method: "GET"
            }).then(async x => await x.text())

            this.protocol = await fetch(`${this.serverUrl}/__get-protocol`, {
                method: "GET"
            }).then(async x => await x.text())

            this.socket = new WebSocket(this.socketUrl)
            this.socket!.onmessage = (ev: MessageEvent<any>) => {
                this.ServicesState = JSON.parse(ev.data)
            }

            const transformers = await fetch(`${this.serverUrl}/__get-transformers`, {
                method: "GET"
            }).then(async x => await x.json())
            this.transformers = Object.fromEntries(transformers.map(x => ([x.ty, new Function("ref", x.fn.substring(x.fn.indexOf("{") + 1, x.fn.lastIndexOf("}")))])))
        },

        async openInEditor(link: string) {
            await fetch(`${this.serverUrl}/__open-in-editor`, {
                headers: {"Content-type": "text/plain"},
                method: "POST",
                body: link.slice(8)
            })
        },

        async getProvider() {
            const p = await fetch(`${this.serverUrl}/__get-provider`, {
                method: "GET"
            }).then(async x => await x.json())
            return p
        },

        async getProgram() {
            const p = await fetch(`${this.serverUrl}/__get-program`, {
                method: "GET"
            }).then(async x => await x.json())
            return p
        },

        formatValue(value: { ty: string, src: { value: any } }) {
            return this.transformers[value.ty.toLowerCase()](value)
        },

        async getCompiled() {
            return await fetch(`${this.serverUrl}/__get-compiled`, {
                method: "GET"
            }).then(async x => await x.json())
        }
    }
})