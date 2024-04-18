import {PlcBinary} from "./PlcBinary.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";
import {Tuple} from "@/src/misc/tuple-type.js";

/**
 * Creates a new LWord.
 *
 * Min: 0 - Max: 18_446_744_073_709_551_615
 *
 * @example
 * const MyLWord = new LWord(18_446_744_073_709_551_615n)
 * const MyLWord = new LWord(0xFFFFFFFFFFFFFFFF)
 * const MyLWord = new LWord(0b10010101)
 *
 */
export class LWord<Attributes> extends PlcBinary<Attributes> {
    public override readonly __type = 'LWord'
    public override readonly offset = 8.0
    public override readonly defaultValue = 0
    public override readonly representation = 16
    constructor(value?: number | bigint, attributes?: Attributes) {
        super(value, attributes)
    }

    public getBit<T extends number>(index: BitAccess extends Tuple<BitAccess, 63>[T] ? T : never) { return new BitAccess(this, index) }

}