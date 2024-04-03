import {defineStore} from 'pinia'
import {Terminal} from "xterm";
import {FitAddon} from "@xterm/addon-fit";
import {WebLinksAddon} from "@xterm/addon-web-links";
import {useLanguageService} from "~/stores/language-service";

export const useTerminal = defineStore({
    id: 'terminal',

    state: (): {
        terminal: Terminal,
        colors: string[]
        fitAddon: FitAddon,
        webLinksAddon: WebLinksAddon
    } => ({
        terminal: new Terminal({
            convertEol: true,
            cursorBlink: true,
            lineHeight: 1.3,
            fontWeight: "100",
            theme: {
                selectionBackground: "rgba(37, 116, 169, 0.8)"
            }
        }),
        colors: [
            "#2e3436",
            "#cc0000",
            "#4e9a06",
            "#c4a000",
            "#3465a4",
            "#75507b",
            "#06989a",
            "#d3d7cf",
            "#555753",
            "#ef2929",
            "#8ae234",
            "#fce94f",
            "#729fcf",
            "#ad7fa8",
            "#34e2e2",
            "#eeeeec"
        ],
        fitAddon: new FitAddon(),
        webLinksAddon: new WebLinksAddon(
            async (ev, link) => {
                if (link.startsWith("https://")) window.open(link, "blank")
                else if (link.startsWith("file"))
                    await useLanguageService().openInEditor(link)
            }
            , {urlRegex: /(https?:\/\/[^\s"'!*(){}|\\^<>`]*[^\s"':,.!?{}|\\\^~\[\]`()<>]|file:\/\/[\w\d\.\-\\/]+:\d+:\d+|C:\\[\w\d\.\-\\/]+:\d+:\d+)/})
    }),

    getters: {
        getTerminal: state => state.terminal,
        getColors: state => state.colors
    },

    actions: {
        open(element: HTMLElement) {
            this.terminal.loadAddon(this.fitAddon)
            this.terminal.loadAddon(this.webLinksAddon)
            this.terminal.open(element)
        },
        write(data: string) {
            this.terminal.write(data)
        },
        writeln(data: string) {
            this.terminal.writeln(data)
        },
        clear() {
            this.terminal.clear()
        },
        fit() {
            this.fitAddon.fit()
        },
        getNewTerminal(element: HTMLElement) {
            const terminal = new Terminal({
                convertEol: true,
                cursorBlink: true,
                lineHeight: 1.3,
                fontWeight: "100",
                theme: {
                    selectionBackground: "rgba(37, 116, 169, 0.8)"
                }
            })
            terminal.loadAddon(new FitAddon())
            terminal.loadAddon(new WebLinksAddon(
                async (ev, link) => {
                    if (link.startsWith("https://")) window.open(link, "blank")
                    else if (link.startsWith("file"))
                        await useLanguageService().openInEditor(link)
                }
                , {urlRegex: /(https?:\/\/[^\s"'!*(){}|\\^<>`]*[^\s"':,.!?{}|\\\^~\[\]`()<>]|file:\/\/[\w\d\.\-\\/]+:\d+:\d+)/})
            )
            terminal.open(element)
            return terminal
        },
        printVifError(terminal: any, err: any) {
            terminal.writeln("\x1b[1;31m" + err.error + "\x1b[0;37m")

            if (err.sim_stack) {
                terminal.writeln("> Simulation stack:")
                err.sim_stack.forEach(stack => terminal.writeln("  at - " + stack))
            }

            if (err.file_stack) {
                terminal.writeln("> File trace:")
                err.file_stack.forEach(x => terminal.writeln("  at - " + `file:///${x.file.replace("\\", "/")}:${x.line}:${x.column}`))
            }
        }
    }
})