import {PlcBinary} from "./PlcBinary.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";
import {Tuple} from "@/src/misc/tuple-type.js";

/**
 * Creates a new Word.
 *
 * Min: 0 - Max: 65535
 *
 * @example
 * const MyWord = new Word(65535)
 * const MyWord = new Word(0xFFFF)
 * const MyWord = new Word(0b11010)
 *
 */
export class Word<Attributes> extends PlcBinary<Attributes> {
    public override readonly __type = 'Word'
    public override readonly offset = 2.0
    public override readonly defaultValue = 0
    public override readonly representation = 16
    constructor(value?: number, attributes?: Attributes) {
        super(value, attributes)
    }

    public getBit<T extends number>(index: BitAccess extends Tuple<BitAccess, 15>[T] ? T : never) { return new BitAccess(this, index) }

}