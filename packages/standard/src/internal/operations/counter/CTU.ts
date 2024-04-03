import {Bool, Int} from "@/src/wrap/types/primitives";
import {Resolve, Template} from "@vifjs/language-builder/template";
import Operation from "@vifjs/language-builder/operation";
import {Counter_State_Machine} from "@vifjs/language-builder/internal/state-machines";
import {Internal_R_Trig, Internal_Reset} from "@vifjs/language-builder/internal/operations";
import {Assign, Compare} from "@vifjs/language-builder/operations/basics";
import {CTUInstance} from "@/src/internal/pou/udt/Counters";

export class CTU extends Template {
    constructor() {
        super(() => {
            return [
                new Counter_State_Machine({
                    // Increment on Positive edge of CU
                    // Check if RESET is set, CV can't change while R is true
                    increment: new Compare(
                        new Internal_R_Trig(new Resolve(["#inner", "CU"])), "=", true, "AND",
                        new Compare(new Resolve(["#inner", "RESET"]), "<>", true)
                    ),
                    decrement: undefined,
                    // Reset on R
                    // No edge signals, CV can't change while R is true
                    reset: new Compare(new Resolve(["#inner", "RESET"]), "=", true),
                    
                    preset_var: new Resolve(["#inner", "PV"]),
                    counter_var: new Resolve(["#inner", "CV"]), 
                    
                    // Nothing happens when counter reached down value 
                    on_counter_down: [], 
                    
                    // Set Q to false when counter reset
                    // Reset the CV value
                    on_counter_reset: [
                        new Assign(new Resolve(["#inner", "Q"]), false),
                        new Internal_Reset(new Resolve(["#inner", "CV"]))
                    ],
                    
                    // Set Q to true when counter reached CV
                    on_counter_up: [
                        new Assign(new Resolve(["#inner", "Q"]), true),
                    ],
                })
            ]
        })
    }
    
    public use(counter_memory: ReturnType<typeof CTUInstance.self>, call_interface: {
        input: {
            CU: Bool,
            RESET: Bool,
            PV: Int,
        },
        output: {
            Q: Bool,
            CV: Int,
        }
    }): Operation<void> {
        return super.build(counter_memory, call_interface)
    }
}
