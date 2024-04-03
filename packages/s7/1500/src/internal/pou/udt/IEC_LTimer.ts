import {Udt} from "@/src/wrap/pou/index.js";
import {type StructInterface} from "@vifjs/language-builder/types/complex";
import {Bool, LTime} from "@/src/wrap/types/primitives/index.js";

export interface IEC_LTimer_Interface extends StructInterface {
    IN: Bool,
    PT: LTime,
    Q: Bool
    ET: LTime
}

export class IEC_LTimer extends Udt<IEC_LTimer_Interface> {
    public static readonly __author: string = "Simatic"
    public static readonly __family: string = "IEC"
    public static readonly __instructionName: string = "IEC_TIMER"
    public static readonly __libVersion: number = 1.0
    public static readonly __name: string = "IEC_TMR"


    public constructor() {
        super({
                IN: new Bool(),
                PT: new LTime(),
                Q: new Bool(),
                ET: new LTime(),
            } as any,
        )
    }
}

