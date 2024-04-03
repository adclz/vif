import {Udt} from "@/src/wrap/pou/index.js";
import {type StructInterface} from "@vifjs/language-builder/types/complex";
import {Bool, Int} from "@/src/wrap/types/primitives/index.js";

export interface IEC_Counter_Interface extends StructInterface {
    CU: Bool,
    CD: Bool,
    R: Bool,
    LD: Bool,
    PV: Int,
    QU: Bool,
    QD: Bool,
    CV: Int
}

export class IEC_Counter extends Udt<IEC_Counter_Interface> {
    public static readonly __author: string = "Simatic"
    public static readonly __family: string = "IEC"
    public static readonly __instructionName: string = "IEC_COUNTER"
    public static readonly __libVersion: number = 1.2
    public static readonly __name: string = "CNTR"

    public constructor() {
        super({
            CU: new Bool(),
            CD: new Bool(),
            R: new Bool(),
            LD: new Bool(),
            PV: new Int(),
            QU: new Bool(),
            QD: new Bool(),
            CV: new Int()
        })
    }
}

 
