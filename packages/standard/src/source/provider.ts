import {Provider as Provider_} from "@vifjs/language-builder/source";
import {F_trig} from "@/src/internal/operations/bit-logic/F_trig.js";
import {R_trig} from "@/src/internal/operations/bit-logic/R_trig.js";
import {CTUInstance, CTDInstance} from "@/src/internal/pou/udt/Counters.js"
import {TP} from "@/src/internal/operations/timer/TP.js";
import {TON} from "@/src/internal/operations/timer/TON";
import {TOF} from "@/src/internal/operations/timer/TOF";
import {CTU} from "@/src/internal/operations/counter/CTU";
import {CTD} from "@/src/internal/operations/counter/CTD";
import {TOFInstance, TONInstance, TPInstance} from "@/src/internal/pou/udt/Timers";

const anyIntegerOrFloats = {
    "AnyInteger": ["AnyInteger", "AnyBinary", "AnyFloat"],
    "AnyBinary": ["AnyInteger", "AnyBinary", "AnyFloat"],
    "AnyFloat": ["AnyInteger", "PlcBinary", "AnyFloat"],
}

export default new Provider_(
    {
        name: "@vifjs/standard",
        internal: {
                "F_TRIG": new F_trig(),
                "R_TRIG": new R_trig(),
                "TP": new TP(),
                "TON": new TON(),
                "TOF": new TOF(),
                "CTU": new CTU(),
                "CTD": new CTD(),
                "CTDInstance": CTDInstance,
                "CTUInstance": CTUInstance,
                "TPInstance": TPInstance,
                "TOFInstance": TOFInstance,
                "TONInstance": TONInstance,
        }, 
        overrideReturns: {
           "sub": {
               "Time": [["Tod", "Tod"]],
           }
        },
        excludeSections: {
                "temp": ["Instance"],
                "constant": ["Instance", "Udt", "Struct", "Array"],
                "return": ["Instance", "Struct", "Array"],
        }, 
        filterOperations: {
                "eq": {
                    ...anyIntegerOrFloats,
                    "Time": ["LTime", "Time"],
                },
                "cmp": {
                    ...anyIntegerOrFloats,
                    "Time": ["LTime", "Time"],
                },
                "mul": {
                    ...anyIntegerOrFloats,
                    "Time": ["AnyInteger"],
                    "LTime": ["AnyInteger"]
                },
                "div": {
                    ...anyIntegerOrFloats,
                    "Time": ["AnyInteger"],
                    "LTime": ["AnyInteger"]
                },
                "add": {
                    ...anyIntegerOrFloats,
                    "Time": ["Time", "DInt"],
                    "LTime": ["Time", "LTime", "LInt"],
                    "Tod": ["Time", "DInt"],
                    "LTod": ["Time", "LTime", "LInt"]
                },
                "sub": {
                    ...anyIntegerOrFloats,
                    "Time": ["Time", "DInt"],
                    "LTime": ["Time", "LTime", "LInt"],
                    "Tod": ["Time", "DInt"],
                    "LTod": ["Time", "LTime", "LInt"]
                }
            }
    })
