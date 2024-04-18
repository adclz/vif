import {PlcBinary} from "./PlcBinary.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";
import {Tuple} from "@/src/misc/tuple-type.js";

/**
 * Creates a new DWord.
 *
 * Min: 0 - Max: 4_294_967_295
 *
 * @example
 * const MyDWord = new DWord(4_294_967_295)
 * const MyDWord = new DWord(0xFFFFFFFF)
 * const MyDWord = new DWord(0b100001)
 *
 */
export class DWord<Attributes> extends PlcBinary<Attributes> {
    public override readonly __type = 'DWord'
    public override readonly offset = 4.0
    public override readonly defaultValue = 0
    public override readonly representation = 16
    constructor(value?: number, attributes?: Attributes) {
        super(value, attributes)
    }

    public getBit<T extends number>(index: BitAccess extends Tuple<BitAccess, 31>[T] ? T : never) { return new BitAccess(this, index) }

}