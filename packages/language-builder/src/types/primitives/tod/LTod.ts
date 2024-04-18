import {PlcTod} from "@/src/types/primitives/tod/PlcTod.js";

export type LTodStruct = { h?: number, m?: number, s?: number, ns?: number }

export class LTod<Attributes> extends PlcTod<Attributes> {
    public override readonly __type = 'LTime_Of_Day'
    public override readonly offset = 4.0
    public override readonly defaultValue = 0
    public override readonly representation = 10
    
    constructor(value?: number, attributes?: Attributes) {
        super(value, attributes)
    }

    public toString() {
        const value = this.value ?? this.defaultValue
        const hours = Math.trunc(value / 3_600_000_000_000);
        let remaining_ms = value % 3_600_000_000_000;

        const minutes = Math.trunc(remaining_ms / 60_000_000_000);
        remaining_ms = remaining_ms % 60_000_000_000;

        let seconds = Math.trunc(remaining_ms / 1_000_000_000);
        let nanoseconds = Math.trunc(remaining_ms % 1_000_000_000);

        let ltod = "LTOD#"
        ltod += `${hours ? hours.toString().padStart(2, "0") : "00"}:`
        ltod += `${minutes ? minutes.toString().padStart(2, "0") : "00"}:`
        ltod += `${seconds ? seconds.toString().padStart(2, "0") : "00"}`
        if (nanoseconds != 0) ltod += `.${nanoseconds.toString().padStart(9, "0")}`
        return ltod
    }
}

export const LTod_from = <Attributes>(struct: LTodStruct, attributes?: Attributes) => {
    const h = struct.h ? (struct.h * 3_600_000_000_000) : 0
    const m = struct.m ? (struct.m * 60_000_000_000) : 0
    const s = struct.s ? (struct.s * 1_000_000_000) : 0
    const ns = struct.ns ? struct.ns : 0

    const value = h + m + s + ns
    return new LTod(value, attributes)
}