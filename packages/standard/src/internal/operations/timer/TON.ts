import {Bool, Time} from "@/src/wrap/types/primitives/index.js";
import {Timer_State_Machine} from "@vifjs/language-builder/internal/state-machines";
import {Assign, Compare} from "@vifjs/language-builder/operations/basics";
import {Resolve, Template} from "@vifjs/language-builder/template";
import Operation from "@vifjs/language-builder/operation";
import {Internal_Reset} from "@vifjs/language-builder/internal/operations";
import {TONInstance} from "@/src/internal/pou/udt/Timers";
import {PrimitiveLike} from "@vifjs/language-builder/types/primitives";

export class TON extends Template {
    constructor() {
        super(() => {
            return [
                new Timer_State_Machine({
                    // Start when IN is true
                    start: new Compare(new Resolve(["#inner", "IN"]), "=", true),
                    
                    // Reset when IN is false
                    reset: new Compare(new Resolve(["#inner", "IN"]), "=", false),
                    
                    preset_var: new Resolve(["#inner", "PT"]),
                    timer_var: new Resolve(["#inner", "ET"]),

                    // Q is false while the timer is on
                    on_timer_start: [
                        new Assign(new Resolve(["#inner", "Q"]), false),
                    ],
                    
                    // Q is true once the timer has elapsed
                    on_timer_elapsed: [
                        new Assign(new Resolve(["#inner", "Q"]), true),
                        new Assign(new Resolve(["#inner", "ET"]), new Resolve(["#inner", "PT"]))
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
    
    public use(timer_memory: ReturnType<typeof TONInstance.self>, call_interface: {
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
