import {FcInterface, UdtImpl} from "@vifjs/language-builder/pou";
import {IEC_Counter_Interface} from "@/src/internal/pou/udt/IEC_Counter";
import {Bool} from "@/src/wrap/types/primitives";
import {Resolve, Template} from "@vifjs/language-builder/template";
import Operation from "@vifjs/language-builder/operation";
import {Counter_State_Machine} from "@vifjs/language-builder/internal/state-machines";
import {Internal_R_Trig, Internal_Reset} from "@vifjs/language-builder/internal/operations";
import {Assign, Compare} from "@vifjs/language-builder/operations/basics";

type CTU_Memory<T extends IEC_Counter_Interface> = UdtImpl<
    {
        CU: Bool,
        CD: Bool,
        R: Bool,
        LD: Bool,
        PV: T["PV"],
        QU: Bool,
        QD: Bool,
        CV: T["CV"],
    }, any>

export interface CTU_Call_Interface<T extends IEC_Counter_Interface> extends FcInterface {
    input: {
        CU: Bool,
        R: Bool,
        PV: T["PV"],
    },
    output: {
        QU: Bool,
        CV: T["CV"],
    }
}

export class CTU<T extends IEC_Counter_Interface> extends Template {
    constructor() {
        super(() => {
            return [
                new Counter_State_Machine({
                    // Increment on Positive edge of CU
                    // Check if R is set, CV can't change while R is true
                    increment: new Compare(
                        //@ts-ignore
                        new Internal_R_Trig(new Resolve(["#inner", "CU"])), "=", true, "AND",
                        new Compare(new Resolve(["#inner", "R"]), "<>", true)
                    ),
                    decrement: undefined,
                    // Reset on R
                    // No edge signals, CV can't change while R is true
                    reset: new Compare(new Resolve(["#inner", "R"]), "=", true),
                    
                    preset_var: new Resolve(["#inner", "PV"]),
                    counter_var: new Resolve(["#inner", "CV"]), 
                    
                    // Nothing happens when counter reached down value 
                    on_counter_down: [], 
                    
                    // Set Q to false when counter reset
                    // Reset the CV value
                    on_counter_reset: [
                        new Assign(new Resolve(["#inner", "QU"]), false),
                        new Internal_Reset(new Resolve(["#inner", "CV"]))
                    ],
                    
                    // Set Q to true when counter reached CV
                    on_counter_up: [
                        new Assign(new Resolve(["#inner", "QU"]), true),
                    ],
                })
            ]
        })
    }
    
    public use(counter_memory: CTU_Memory<T>, call_interface: CTU_Call_Interface<T>): Operation<void> {
        return super.build(counter_memory, call_interface)
    } 
}