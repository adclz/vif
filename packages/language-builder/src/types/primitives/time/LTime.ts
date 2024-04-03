import {PlcTime} from "./PlcTime.js";

/**
 * Represents a time structure with optional components.
 *
 * @property {number} [d] - The number of days.
 * @property {number} [h] - The number of hours.
 * @property {number} [m] - The number of minutes.
 * @property {number} [s] - The number of seconds.
 * @property {number} [ms] - The number of milliseconds.
 * @property {number} [us] - The number of microseconds.
 * @property {number} [ns] - The number of nanoseconds.
 */
export interface LTimeStruct { negative?: boolean, d?: number, h?: number, m?: number, s?: number, ms?: number, us?: number, ns?: number }

/**
 * Represents a time value in the LTime format.
 * Extends from the PlcTime family.
 */
export class LTime<Attributes> extends PlcTime<Attributes> {
    public override readonly __type = 'LTime'
    public override readonly offset = 4.0
    public override readonly defaultValue = 0
    public override readonly representation = 10

    constructor(value?: number, attributes?: Attributes){
        super(value, attributes)
    }

    /**
     * Returns a string representation of the value in a formatted date format.
     * 
     * The format follows the ISO 8601 duration format.
     *
     * @return {string} The string representation of the value.
     */
    public toString(): string {
        const value = this.value ?? this.defaultValue
        const days = Math.trunc((value / 86_400_000_000_000) * (value < 0 ? -1 : 1))
        let remaining_ms = value % 86_400_000_000_000;

        let hours = Math.trunc((remaining_ms / 3_600_000_000_000) * (value < 0 ? -1 : 1))
        remaining_ms = remaining_ms % 3_600_000_000_000;

        let minutes = Math.trunc((remaining_ms / 60_000_000_000) * (value < 0 ? -1 : 1))
        remaining_ms = remaining_ms % 60_000_000_000;

        let seconds = Math.trunc((remaining_ms / 1_000_000_000) * (value < 0 ? -1 : 1))
        remaining_ms = remaining_ms % 1_000_000_000;

        let milliseconds = Math.trunc((remaining_ms / 1_000_000) * (value < 0 ? -1 : 1))
        remaining_ms = remaining_ms % 1_000_000;

        let microseconds = Math.trunc((remaining_ms / 1_000) * (value < 0 ? -1 : 1))
        remaining_ms = remaining_ms % 1_000;
        
        let nanoseconds = Math.trunc((remaining_ms % 1000) * (value < 0 ? -1 : 1))

        let time = ""
        if (nanoseconds > 0) time = `${nanoseconds}NS`
        if (microseconds != 0) time = `${microseconds}US${time.length ? '_' : ''}${time}`
        if (milliseconds > 0) time = `${milliseconds}MS${time.length ? '_' : ''}${time}`
        if (seconds != 0) time = `${seconds}S${time.length ? '_' : ''}${time}`
        if (minutes != 0) time = `${minutes}M${time.length ? '_' : ''}${time}`
        if (hours != 0) time = `${hours}H${time.length ? '_' : ''}${time}`
        if (days != 0) time = `${days}D${time.length ? '_' : ''}${time}`

        return `LT#${value < 0 ? '-' : ''}${time}`
    }
}

/**
 * Use this static function to generate LTime with explicit time values.
 *
 * @param {LTimeStruct} struct - The LTimeStruct object to be converted.
 * @param attributes
 * @returns {LTime} - The converted LTime object.
 */
export const LTime_from = <Attributes>(struct: LTimeStruct, attributes?: Attributes) => {
    const d = struct.d ? (struct.d * 86_400_000_000_000) : 0
    const h = struct.h ? (struct.h * 3_600_000_000_000) : 0
    const m = struct.m ? (struct.m * 60_000_000_000) : 0
    const s = struct.s ? (struct.s * 1_000_000_000) : 0
    const ms = struct.ms ? (struct.ms * 1_000_000) : 0
    const us = struct.us ? (struct.us * 1_000) : 0
    const ns = struct.ns ? struct.ns : 0

    const value = d + h + m + s + ms + us + ns
    return new LTime(struct.negative ? value * -1 : value, attributes)
}