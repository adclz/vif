import {Bool, Time} from "@/src/wrap/types/primitives/index.js";
import {Timer_State_Machine} from "@vifjs/language-builder/internal/state-machines";
import {Assign, Compare} from "@vifjs/language-builder/operations/basics";
import {Resolve, Template} from "@vifjs/language-builder/template";
import Operation from "@vifjs/language-builder/operation";
import {Internal_F_Trig, Internal_Reset} from "@vifjs/language-builder/internal/operations";
import {If} from "@vifjs/language-builder/operations/program-control";
import {TOFInstance} from "@/src/internal/pou/udt/Timers";
import {PrimitiveLike} from "@vifjs/language-builder/types/primitives";

export class TOF<T extends typeof TOFInstance> extends Template {
    constructor() {
        super(() => {
            return [
                // Q is always true if IN is true
                new If(new Compare(new Resolve(["#inner", "IN"]), "=", true))
                    .then([new Assign(new Resolve(["#inner", "Q"]), true)]),
                
                new Timer_State_Machine({
                    // Start when Falling edge of IN is true (IN went false)
                    start: new Internal_F_Trig(new Resolve(["#inner", "IN"])),
                    
                    // Stop when IN is true, this will trigger the falling edge above
                    reset: new Compare(new Resolve(["#inner", "IN"]), "=", true),
                    
                    preset_var: new Resolve(["#inner", "PT"]),
                    timer_var: new Resolve(["#inner", "ET"]),

                    // Q is true while the timer is on
                    on_timer_start: [
                        new Assign(new Resolve(["#inner", "Q"]), true),
                    ],
                    
                    // Q is false once the timer has elapsed
                    on_timer_elapsed: [
                        new Assign(new Resolve(["#inner", "Q"]), false),
                        new Internal_Reset(new Resolve(["#inner", "ET"]))
                    ],

                    // Q is false when the timer is reset
                    on_timer_reset: [
                        new Assign(new Resolve(["#inner", "Q"]), false),
                        new Internal_Reset(new Resolve(["#inner", "ET"]))
                    ],
                }),
            ]
        })
    }
    
    public use(timer_memory: ReturnType<typeof TOFInstance.self>, call_interface: {
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
