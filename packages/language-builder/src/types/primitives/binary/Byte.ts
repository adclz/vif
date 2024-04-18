import {PlcBinary} from "./PlcBinary.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";
import {Tuple} from "@/src/misc/tuple-type.js";

/**
 * Creates a new Byte.
 * 
 * Min: 0 - Max: 255
 *
 * @example
 * const MyByte = new Byte(255)
 * const MyByte = new Byte(0xFF)
 * const MyByte = new Byte(0b100001)
 *
 */
export class Byte<Attributes> extends PlcBinary<Attributes> {
    public override readonly __type = 'Byte'
    public override readonly offset = 1.0
    public override readonly defaultValue = 0
    public override readonly representation = 16
    constructor(value?: number, attributes?: Attributes) {
        super(value, attributes)
    }

    public getBit<T extends number>(index: BitAccess extends Tuple<BitAccess, 8>[T] ? T : never) { return new BitAccess(this, index) }

}