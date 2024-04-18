import {Provider} from "@vifjs/language-builder/source";
import {F_trig} from "@/src/internal/operations/bit-logic/F_trig.js";
import {R_trig} from "@/src/internal/operations/bit-logic/R_trig.js";
import {IEC_Timer} from "@/src/internal/pou/udt/IEC_Timer.js"
import {IEC_Counter} from "@/src/internal/pou/udt/IEC_Counter.js"
import {TP} from "@/src/internal/operations/timer/TP.js";
import {TON} from "@/src/internal/operations/timer/TON";
import {TOF} from "@/src/internal/operations/timer/TOF";
import {CTU} from "@/src/internal/operations/counter/CTU";
import {CTD} from "@/src/internal/operations/counter/CTD";

const anyIntegerOrFloats = {
    "AnyInteger": ["AnyInteger", "AnyBinary", "AnyFloat"],
    "AnyBinary": ["AnyInteger", "AnyBinary", "AnyFloat"],
    "AnyFloat": ["AnyInteger", "PlcBinary", "AnyFloat"],
}

export default new Provider(
    {
        name: "@vifjs/s7-1500",
        agent: "vif-agent-s7",
        internal: {
                "F_TRIG": new F_trig(),
                "R_TRIG": new R_trig(),
                "TP": new TP(),
                "TON": new TON(),
                "TOF": new TOF(),
                "CTU": new CTU(),
                "CTD": new CTD(),
                "IEC_TIMER": new IEC_Timer(),
                "IEC_COUNTER": new IEC_Counter(),
        }, 
        overrideReturns: {
           "sub": {
               "Time": [["Tod", "Tod"]],
               "LTime": [["LTod", "LTod"]],
           }
        },
        excludeSections: {
                "output": ["IEC_TIMER", "IEC_COUNTER"],
                "temp": ["Instance", "IEC_TIMER", "IEC_COUNTER"],
                "constant": ["Instance", "Udt", "Struct", "Array", "IEC_TIMER", "IEC_COUNTER"],
                "return": ["Instance", "Struct", "Array", "IEC_TIMER", "IEC_COUNTER"],
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
