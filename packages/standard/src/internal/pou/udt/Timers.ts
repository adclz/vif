import {Udt} from "@/src/wrap/pou/index.js";
import {Bool, Time} from "@/src/wrap/types/primitives/index.js";
import {StructInterface} from "@vifjs/language-builder/types/complex";

export const TPInstance = new Udt({
    IN: new Bool(),
    PT: new Time(),
    Q: new Bool(),
    ET: new Time(),
})

export const TOFInstance  = new Udt({
    IN: new Bool(),
    PT: new Time(),
    Q: new Bool(),
    ET: new Time(),
})

export const TONInstance  = new Udt({
    IN: new Bool(),
    PT: new Time(),
    Q: new Bool(),
    ET: new Time(),
})
