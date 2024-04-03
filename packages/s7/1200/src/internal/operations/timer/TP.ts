import {Bool, Time} from "@/src/wrap/types/primitives/index.js";
import {IEC_Timer_Interface} from "@/src/internal/pou/udt/IEC_Timer.js";
import {Timer_State_Machine} from "@vifjs/language-builder/internal/state-machines";
import {Assign, Compare} from "@vifjs/language-builder/operations/basics";
import {Resolve, Template} from "@vifjs/language-builder/template";
import {FcInterface, UdtImpl} from "@vifjs/language-builder/pou";
import Operation from "@vifjs/language-builder/operation";
import {Internal_Reset} from "@vifjs/language-builder/internal/operations";

type TP_Memory<T extends IEC_Timer_Interface> = UdtImpl<
    {
        IN: Bool,
        PT: T["PT"]
        Q: Bool,
        ET: T["ET"]
    }, any>

interface TP_Call_Interface<T extends IEC_Timer_Interface> extends FcInterface {
    input: {
        IN: Bool,
        PT: T["PT"]
    },
    output: {
        Q: Bool,
        ET: T["ET"]
    }
}

/*
 * Timer Pulse
 */
export class TP<T extends IEC_Timer_Interface> extends Template {
    constructor() {
        super(() => {
            return [
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
    
    public use(timer_memory: TP_Memory<T>, call_interface: TP_Call_Interface<T>): Operation<void> {
        return super.build(timer_memory, call_interface)
    }
}
