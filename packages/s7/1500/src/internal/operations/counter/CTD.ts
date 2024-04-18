import {FcInterface, UdtImpl} from "@vifjs/language-builder/pou";
import {IEC_Counter_Interface} from "@/src/internal/pou/udt/IEC_Counter";
import {Bool} from "@/src/wrap/types/primitives";
import {Resolve, Template} from "@vifjs/language-builder/template";
import Operation from "@vifjs/language-builder/operation";
import {Counter_State_Machine} from "@vifjs/language-builder/internal/state-machines";
import {Internal_R_Trig, Internal_Reset} from "@vifjs/language-builder/internal/operations";
import {Assign, Compare} from "@vifjs/language-builder/operations/basics";


type CTD_Memory<T extends IEC_Counter_Interface> = UdtImpl<
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

export interface CTD_Call_Interface<T extends IEC_Counter_Interface> extends FcInterface {
    input: {
        CD: Bool,
        R: Bool,
        PV: T["PV"],
    },
    output: {
        QD: Bool,
        CV: T["CV"],
    }
}

export class CTD<T extends IEC_Counter_Interface> extends Template {
    constructor() {
        super(() => {
            return [
                new Counter_State_Machine({
                    increment: undefined,
                    
                    // Decrement on Positive edge of CD
                    // Check if R is set, CV can't change while R is true
                    decrement: new Compare(new Internal_R_Trig(new Resolve(["#inner", "CD"])), "=", true, "AND", new Compare(new Resolve(["#inner", "R"]), "<>", true)),
                    // Reset on R
                    // No edge signals, CV can't change while R is true
                    reset: new Compare(new Resolve(["#inner", "R"]), "=", true),
                    
                    preset_var: new Resolve(["#inner", "PV"]),
                    counter_var: new Resolve(["#inner", "CV"]),

                    // Set Q to true when counter reached CV
                    on_counter_down: [
                        new Assign(new Resolve(["#inner", "QD"]), true),
                    ], 
                    
                    // Set Q to false when counter reset
                    // Reset the CV value
                    on_counter_reset: [
                        new Assign(new Resolve(["#inner", "QD"]), false),
                        new Internal_Reset(new Resolve(["#inner", "CV"]))
                    ],
                    
                    // Nothing happens when counter reached up value
                    on_counter_up: [],
                })
            ]
        })
    }
    
    public use(counter_memory: CTD_Memory<T>, call_interface: CTD_Call_Interface<T>): Operation<void> {
        return super.build(counter_memory, call_interface)
    } 
}