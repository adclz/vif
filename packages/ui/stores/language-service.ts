export const useLanguageService = defineStore({
    id: "language_service",

    state: () => ({
        providerName: null,
        runnerFile: null,
        protocol: null,
        ports: null,
        socket: null,
        transformers: null,
        ServicesState: {
            provider: {status: 0},
            program: {status: 0},
            compiler: {status: 0}
        }
    }),

    actions: {
        async initLanguageService() {
            const data_ports = await useFetch('/api/get-ports')
            this.ports = data_ports.data.value.ports as { socket: number, server: number }
            if (!this.ports)
                throw new Error("Invalid ports received")

            this.providerName = await fetch(`http://localhost:${this.ports.server}/__get-provider-name`, {
                method: "GET"
            }).then(async x => await x.text())


            this.runnerFile = await fetch(`http://localhost:${this.ports.server}/__get-runner-file`, {
                method: "GET"
            }).then(async x => await x.text())

            this.protocol = await fetch(`http://localhost:${this.ports.server}/__get-protocol`, {
                method: "GET"
            }).then(async x => await x.text())

            this.socket = new WebSocket(`ws://localhost:${this.ports.socket}`)
            this.socket!.onmessage = (ev: MessageEvent<any>) => {
                this.ServicesState = JSON.parse(ev.data)
            }

            const transformers = await fetch(`http://localhost:${this.ports.server}/__get-transformers`, {
                method: "GET"
            }).then(async x => await x.json())
            this.transformers = Object.fromEntries(transformers.map(x => ([x.ty, new Function("ref", x.fn.substring(x.fn.indexOf("{") + 1, x.fn.lastIndexOf("}")))])))
        },

        async openInEditor(link: string) {
            await fetch(`http://localhost:${this.ports.server}/__open-in-editor`, {
                headers: {"Content-type": "text/plain"},
                method: "POST",
                body: link.slice(8)
            })
        },

        async getProvider() {
            const p = await fetch(`http://localhost:${this.ports.server}/__get-provider`, {
                method: "GET"
            }).then(async x => await x.json())
            return p
        },

        async getProgram() {
            const p = await fetch(`http://localhost:${this.ports.server}/__get-program`, {
                method: "GET"
            }).then(async x => await x.json())
            return p
        },

        formatValue(value: { ty: string, src: { value: any } }) {
            return this.transformers[value.ty.toLowerCase()](value)
        },

        async getCompiled() {
            return await fetch(`http://localhost:${this.ports.server}/__get-compiled`, {
                method: "GET"
            }).then(async x => await x.json())
        }
    }
})