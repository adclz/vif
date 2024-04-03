import {useTerminal} from "@/stores/terminal";
import {useLanguageService} from "@/stores/language-service.js";
import {type MonitorSchema, type Stack, type UnitTest, type BreakPoint, type ContainerParams} from "@vifjs/sim-web"
import {Container} from "@vifjs/sim-web/boot"
import {ParseStatus, SimulationStatus, UnitTestStatus} from "@vifjs/sim-web"
import {Plugin} from "@vifjs/sim-web/plugin"

export const useContainer = defineStore({
    id: "container",

    state: (): {
        container: Container | null,
        started: boolean,
        paused: boolean,
        simulationStatus: SimulationStatus,
        providerStatus: ParseStatus,
        programStatus: ParseStatus,
        error: boolean,
        entryPoints: string[]
        entrySelected: string

        stack: Stack,
        invalidateStack: boolean,
        monitorSchemas: MonitorSchema[],
        monitorValueT: Record<string, string>,
        monitorValueDivs: Record<string, HTMLElement>,
        unitTests: Record<string, UnitTest & { status: UnitTestStatus }>,
        breakpoints: BreakPoint[],
        triggeredBreakpoint: null | number
    } => ({
        container: null,
        started: false,
        paused: false,
        simulationStatus: SimulationStatus.Unavailable,
        providerStatus: ParseStatus.Empty,
        programStatus: ParseStatus.Empty,
        error: false,
        entryPoints: [],
        entrySelected: "",

        invalidateStack: false,
        stack: {},
        monitorSchemas: [],
        monitorValueT: {},
        monitorValueDivs: [],
        unitTests: {},
        breakpoints: [],
        triggeredBreakpoint: null
    }),

    getters: {
        getContainer: state => state.container,
        getstarted: state => state.started,
        getPaused: state => state.paused,
        getError: state => state.error,

        getSimulationStatus: state => state.simulationStatus,
        getProviderStatus: state => state.providerStatus,
        getProgramStatus: state => state.programStatus,
        getEntryPoints: state => state.entryPoints,

        getSelectedEntry: state => state.entrySelected
    },

    actions: {
        async initContainer() {
            this.container = new Container()
            this.container.on("container:error", ev => {
                const terminal = useTerminal()
                this.error = true
                terminal.writeln("\x1b[1;31m" + ev.message + "\x1b[0;37m")

                if (ev.sim_stack) {
                    terminal.writeln("> Simulation stack:")
                    ev.sim_stack.forEach(stack => terminal.writeln("  at - " + stack))
                }

                if (ev.file_stack) {
                    terminal.writeln("> File trace:")
                    ev.file_stack.forEach(x => terminal.writeln(` at - file:///${x.file.replace("\\", "/")}:${x.line}:${x.column}`))
                }
            })
            this.container.on("container:ready", async ev => {
                const plugin = new Plugin("Vif-Sim-Ui", 200)
                const terminal = useTerminal()

                plugin.on("simulation:status", ev => updateSimulationStatus(ev))
                plugin.on("parse-provider:status", ev => this.providerStatus = ev)
                plugin.on("parse-program:status", ev => {
                    this.programStatus = ev
                    if (this.programStatus === 0) {
                        this.stack = {}
                        this.monitorSchemas = []
                        this.monitorValueT = {}
                        this.monitorValueDivs = []
                        this.unitTests = {}
                        this.breakpoints = []
                    }
                })

                plugin.on("messages", ev => {
                    console.log(ev)
                    if (!this.error)
                        terminal.clear()
                    ev.forEach(x => terminal.writeln(x))
                })
                plugin.on("warnings", ev => ev.forEach(x => terminal.writeln(x)))
                plugin.on("error", ev => {
                    this.error = true
                    terminal.writeln("\x1b[1;31m" + ev.error + "\x1b[0;37m")

                    if (ev.sim_stack) {
                        terminal.writeln("> Simulation stack:")
                        ev.sim_stack.forEach(stack => terminal.writeln("  at - " + stack))
                    }

                    if (ev.file_stack) {
                        terminal.writeln("> File trace:")
                        ev.file_stack.forEach(x => terminal.writeln("  at - " + `file:///${x.file.replace("\\", "/")}:${x.line}:${x.column}`))
                    }
                })
                plugin.on("simulation:stack", ev => {
                    console.log(ev)
                    this.stack = ev
                })

                // Monitor

                plugin.on("monitor:schemas", async ev => {
                    this.monitorSchemas = ev
                    this.monitorValueDivs = {}
                    await nextTick()
                    this.monitorSchemas.forEach(x => {
                        this.monitorValueDivs[x.value.id] = document.getElementById(x.value.id.toString())!
                        this.monitorValueT[x.value.id] = x.value.ty
                    })
                })

                plugin.on("monitor:changes", ev => {
                    ev.forEach(x => {
                        if (this.monitorValueDivs[x.id])
                            this.monitorValueDivs[x.id].innerText = useLanguageService().formatValue({
                                ty: this.monitorValueT[x.id],
                                src: {value: x.value}
                            })
                    })
                })

                plugin.on("breakpoints", ev => {
                    this.breakpoints = ev
                })
                plugin.on("breakpoints:statuses", ev => {
                    ev.forEach(x => {
                        this.breakpoints.find(b => b.id === x.id).status = x.status
                    })
                })

                plugin.on("simulation:entry-points", ev => {
                    this.entryPoints = ev
                    console.log(this.entryPoints)
                })

                plugin.on("unit-tests", ev => {
                    this.unitTests = {}
                    ev.forEach(x => {
                        this.unitTests[x.id] = {
                            id: x.id,
                            description: x.description,
                            path: x.path,
                            status: UnitTestStatus.Unreached
                        }
                    })
                })
                plugin.on("unit-tests:statuses", ev => {
                    ev.forEach(x => {
                        if (this.unitTests[x.id])
                            this.unitTests[x.id].status = x.status
                    })
                })
                plugin.init(this.container!)

            })
            await useLanguageService().initLanguageService()
            await this.container.boot()
        },

        async loadProviderPack() {
            if (this.started) return
            const ast = await useLanguageService().getProvider()
            if (!ast)
                useTerminal().writeln("Invalid provider, got undefined")
            else this.container?.loadProvider(ast)
            console.log(ast)
        },

        async loadProgramPack() {
            if (this.started) return
            useLanguageService().programChanged = false
            const ast = await useLanguageService().getProgram()
            if (!ast)
                useTerminal().writeln("Invalid program, got undefined")
            else this.container!.loadProgram(ast)
        },

        loadParams(params: ContainerParams) {
            this.container.loadContainerParams(params)
        },

        start() {
            if (!this.getSelectedEntry.length)
                useTerminal().writeln("No valid entry selected")
            else this.container?.start(this.getSelectedEntry)
        },

        pauseOrResume() {
            if (this.getPaused) this.resume()
            else this.pause()
        },

        pause() {
            if (this.paused) this.resume()
            else this.container?.pause()
        },

        reset() {
            this.container?.clearProgram()
            this.error = false
            useLanguageService().programChanged = false
        },

        resume() {
            this.triggeredBreakpoint = null
            this.container?.resume()
        },

        stop() {
            this.container?.stop()
        },

        enableBreakpoint(id: number) {
            this.container?.enableBreakpoint(id)
        },

        disableBreakpoint(id: number) {
            this.container?.disableBreakpoint(id)
        },

        enableAllBreakpoints() {
            this.container?.enableAllBreakpoints()
        },

        disableAllBreakpoints() {
            this.container?.disableAllBreakpoints()
        }
    }
})

const updateSimulationStatus = (status: SimulationStatus) => {
    const container = useContainer()
    console.log(status)
    switch (status) {
        case SimulationStatus.Start:
            container.started = true
            container.paused = false
            container.invalidateStack = true
            break;
        case SimulationStatus.Stop:
            container.invalidateStack = false
            container.started = false
            container.paused = false
            break;
        case SimulationStatus.Pause:
            container.started = true
            container.paused = true
            container.invalidateStack = false
            break;
        case SimulationStatus.Unavailable:
            container.started = false
            container.paused = false
            break;
    }
}