import {type FbInterface} from "@vifjs/language-builder/pou";
import {Fb} from "@/src/wrap/pou/index.js"
import {Assign, Compare} from "@vifjs/language-builder/operations/basics";
import {If} from "@vifjs/language-builder/operations/program-control";
import {Bool} from "@/src/wrap/types/primitives/index.js";

export interface R_trig_interface extends FbInterface {
    input: {
        CLK: Bool
    },
    output: {
        Q: Bool
    },
    static: {
        Stat_Bit: Bool
    },
}

export class R_trig extends Fb<R_trig_interface> {
    constructor() {
        super({
            interface: {
            input: {
                CLK: new Bool()
            },
            output: {
                Q: new Bool()
            },
            static: {
                Stat_Bit: new Bool()
            },
        },
            body:
                function () {
                    return [
                        new If(new Compare(this.input.CLK, "<>", this.static.Stat_Bit, "AND", new Compare(this.input.CLK, "=", true)))
                            .then([new Assign(this.output.Q, true)])
                            .else([new Assign(this.output.Q, false)]
                            ),
                        new Assign(this.static.Stat_Bit, this.input.CLK),
            ]
        }})
    }
}