import {PlcTod} from "@/src/types/primitives/tod/PlcTod.js";

export type TodStruct = { h?: number, m?: number, s?: number, ms?: number }


export class Tod<Attributes> extends PlcTod<Attributes> {
    public override readonly __type = 'Tod'
    public override readonly offset = 4.0
    public override readonly defaultValue = 0
    public override readonly representation = 10

    constructor(value?: number, attributes?: Attributes) {
        super(value, attributes)
    }
    
    public toString() {
        const value = this.value ?? this.defaultValue
        const hours = Math.trunc(value / 3_600_000);
        let remaining_ms = value % 3_600_000;

        const minutes = Math.trunc(remaining_ms / 60_000);
        remaining_ms = remaining_ms % 60_000;

        let seconds = Math.trunc(remaining_ms / 1000);
        let milliseconds = Math.trunc(remaining_ms % 1000);

        let tod = "TOD#"
        tod += `${hours ? hours.toString().padStart(2, "0") : "00"}:`
        tod += `${minutes ? minutes.toString().padStart(2, "0") : "00"}:`
        tod += `${seconds ? seconds.toString().padStart(2, "0") : "00"}`
        if (milliseconds != 0) tod += `.${milliseconds.toString().padStart(4, "0")}`
        return tod
    }
}

export const Tod_from = <Attributes>(struct: TodStruct, attributes?: Attributes) => {
    const h = struct.h ? (struct.h * 3_600_000) : 0
    const m = struct.m ? (struct.m * 60_000) : 0
    const s = struct.s ? (struct.s * 1000) : 0
    const ms = struct.ms ? struct.ms : 0

    const value = h + m + s + ms
    return new Tod(value, attributes)
}