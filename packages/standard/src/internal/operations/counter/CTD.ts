import {Bool, Int} from "@/src/wrap/types/primitives";
import {Resolve, Template} from "@vifjs/language-builder/template";
import Operation from "@vifjs/language-builder/operation";
import {Counter_State_Machine} from "@vifjs/language-builder/internal/state-machines";
import {Internal_R_Trig, Internal_Reset} from "@vifjs/language-builder/internal/operations";
import {Assign, Compare} from "@vifjs/language-builder/operations/basics";
import {CTDInstance} from "@/src/internal/pou/udt/Counters";
import {PrimitiveLike} from "@vifjs/language-builder/types/primitives";

export class CTD extends Template {
    constructor() {
        super(() => {
            return [
                new Counter_State_Machine({
                    increment: undefined,

                    // Decrement on Positive edge of CD
                    // Check if R is set, CV can't change while R is true
                    decrement: new Compare(new Internal_R_Trig(new Resolve(["#inner", "CD"])), "=", true, "AND", new Compare(new Resolve(["#inner", "LOAD"]), "<>", true)),
                    // Reset on R
                    // No edge signals, CV can't change while R is true
                    reset: new Compare(new Resolve(["#inner", "LOAD"]), "=", true),

                    preset_var: new Resolve(["#inner", "PV"]),
                    counter_var: new Resolve(["#inner", "CV"]),

                    // Set Q to true when counter reached CV
                    on_counter_down: [
                        new Assign(new Resolve(["#inner", "Q"]), true),
                    ],

                    // Set Q to false when counter reset
                    // Reset the CV value
                    on_counter_reset: [
                        new Assign(new Resolve(["#inner", "Q"]), false),
                        new Internal_Reset(new Resolve(["#inner", "CV"]))
                    ],

                    // Nothing happens when counter reached up value
                    on_counter_up: [],
                })
            ]
        })
    }

    public use(counter_memory: typeof CTDInstance.self, call_interface: {
        input: {
            CD: PrimitiveLike<Bool>,
            LOAD: PrimitiveLike<Bool>,
            PV: PrimitiveLike<Int>,
        },
        output: {
            Q: Bool,
            CV: Int,
        }
    }): Operation<void> {
        return super.build(counter_memory, call_interface)
    }
}