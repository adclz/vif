import {Bool} from "@/src/wrap/types/primitives/index.js";
import {IEC_Timer_Interface} from "@/src/internal/pou/udt/IEC_Timer.js";
import {Timer_State_Machine} from "@vifjs/language-builder/internal/state-machines";
import {Assign, Compare} from "@vifjs/language-builder/operations/basics";
import {Resolve, Template} from "@vifjs/language-builder/template";
import {UdtImpl} from "@vifjs/language-builder/pou";
import Operation from "@vifjs/language-builder/operation";
import {Internal_Reset} from "@vifjs/language-builder/internal/operations";

type TON_Memory<T extends IEC_Timer_Interface> = UdtImpl<
    { 
        IN: Bool,
        PT: T["PT"]
        Q: Bool,
        ET: T["ET"]
    }, any>

export interface TON_Call_interface<T extends IEC_Timer_Interface> {
    input: {
        IN: Bool,
        PT: T["PT"]
    },
    output: {
        Q: Bool,
        ET: T["ET"]
    }
}

export class TON<T extends IEC_Timer_Interface> extends Template {
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
    
    public use(timer_memory: TON_Memory<T>, call_interface: TON_Call_interface<T>): Operation<void> {
        return super.build(timer_memory, call_interface)
    }
}
