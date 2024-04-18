import {Bool, Time} from "@/src/wrap/types/primitives/index.js";
import {Timer_State_Machine} from "@vifjs/language-builder/internal/state-machines";
import {Assign, Compare} from "@vifjs/language-builder/operations/basics";
import {Resolve, Template} from "@vifjs/language-builder/template";
import Operation from "@vifjs/language-builder/operation";
import {Internal_Reset} from "@vifjs/language-builder/internal/operations";
import {TPInstance} from "@/src/internal/pou/udt/Timers";
import {PrimitiveLike} from "@vifjs/language-builder/types/primitives";

/*
 * Timer Pulse
 */
export class TP extends Template {
    constructor() {
        super(() => {
            return [
                //Assign inputs
                new Timer_State_Machine({
                    // Start when IN is true
                    start: new Compare(new Resolve(["#inner", "IN"]), "=", true),
                    
                    // TP cannot be cancelled until it's elapsed
                    reset: undefined,
                    preset_var: new Resolve(["#inner", "PT"]),
                    timer_var: new Resolve(["#inner", "ET"]),
                    
                    // Q is always true while the timer is on
                    on_timer_start: [new Assign(new Resolve(["#inner", "Q"]), true)],
                    on_timer_elapsed: [
                        new Assign(new Resolve(["#inner", "Q"]), false), // Set Q to false when the timer is stopped
                        new Internal_Reset(new Resolve(["#inner", "ET"])) // Reset the elapsed time
                    ],
                    
                    // No need to have reset operations
                    on_timer_reset: []
                }),
         ]
        })
    }
    
    public use(timer_memory: ReturnType<typeof TPInstance.self>, call_interface: {
        input: {
            IN: PrimitiveLike<Bool>,
            PT: PrimitiveLike<Time>
        },
        output: {
            Q: Bool,
            ET: Time
        }
    }): Operation<void> {
        return super.build(timer_memory, call_interface)
    }
}
