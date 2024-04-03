import {Bool, Time} from "@/src/wrap/types/primitives/index.js";
import {FcInterface, Udt, UdtImpl} from "@vifjs/language-builder/pou";
import {StructInterface} from "@vifjs/language-builder/types/complex";

export interface IEC_Timer_Interface extends StructInterface {
    IN: Bool,
    PT: Time,
    Q: Bool
    ET: Time
}

export class IEC_Timer extends Udt<IEC_Timer_Interface, any, any> {
    public __attributes = {
        author: "Simatic",
        family: "IEC",
        instructionName: "IEC_TIMER",
        libVersion: 1.0,
        name: "IEC_TMR"
    }

    public constructor() {
        super({
                IN: new Bool(),
                PT: new Time(),
                Q: new Bool(),
                ET: new Time(),
            }
        )
    }
}
