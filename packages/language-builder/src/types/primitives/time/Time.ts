import {PlcTime} from "./PlcTime.js";

export type TimeStruct = { negative?: boolean, d?: number, h?: number, m?: number, s?: number, ms?: number }

export class Time<Attributes> extends PlcTime<Attributes> {
    public override readonly __type = 'Time'
    public override readonly offset = 4.0
    public override readonly defaultValue = 0
    public override readonly representation = 10

    constructor(value?: number, attributes?: Attributes){
        super(value, attributes)
    }
    
    public toString() {
        const value = this.value ?? this.defaultValue
        const days = Math.trunc((value / 86_400_000) * (value < 0 ? -1 : 1))
        let remaining_ms = value % 86_400_000;

        let hours = Math.trunc((remaining_ms / 3_600_000) * (value < 0 ? -1 : 1))
        remaining_ms = remaining_ms % 3_600_000;

        let minutes = Math.trunc((remaining_ms / 60_000) * (value < 0 ? -1 : 1))
        remaining_ms = remaining_ms % 60_000;

        let seconds = Math.trunc((remaining_ms / 1000) * (value < 0 ? -1 : 1))
        let milliseconds = Math.trunc((remaining_ms % 1000) * (value < 0 ? -1 : 1))

        let time = ""
        if (milliseconds > 0) time += `${milliseconds}MS`
        if (seconds != 0) time = `${seconds}S${time.length ? '_' : ''}${time}`
        if (minutes != 0) time = `${minutes}M${time.length ? '_' : ''}${time}`
        if (hours != 0) time = `${hours}H${time.length ? '_' : ''}${time}`
        if (days != 0) time = `${days}D${time.length ? '_' : ''}${time}`
        
        return `T#${value < 0 ? '-' : ''}${time}`
    }
}

export const Time_from = <Attributes>(struct: TimeStruct, attributes?: Attributes) => {
    const d = struct.d ? (struct.d * 86_400_000) : 0
    const h = struct.h ? (struct.h * 3_600_000) : 0
    const m = struct.m ? (struct.m * 60_000) : 0
    const s = struct.s ? (struct.s * 1000) : 0
    const ms = struct.ms ? struct.ms : 0

    const value = d + h + m + s + ms
    return new Time(struct.negative ? value * -1 : value, attributes)
}