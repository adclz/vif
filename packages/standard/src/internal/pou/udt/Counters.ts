import {Udt} from "@/src/wrap/pou/index.js";
import {type StructInterface} from "@vifjs/language-builder/types/complex";
import {Bool, Int} from "@/src/wrap/types/primitives/index.js";

export const CTDInstance = new Udt({
    CD: new Bool(),
    LOAD: new Bool(),
    PV: new Int(),
    Q: new Bool(),
    CV: new Int()
})

export const CTUInstance = new Udt({
    CU: new Bool(),
    RESET: new Bool(),
    PV: new Int(),
    Q: new Bool(),
    CV: new Int()
})