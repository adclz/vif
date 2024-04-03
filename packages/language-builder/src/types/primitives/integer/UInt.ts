import {PlcInteger} from "./PlcInteger.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";
import {Tuple} from "@/src/misc/tuple-type.js";

/**
 * Creates a new UInt.
 *
 * Min: 0 - Max: 65_535
 *
 * @example
 * const MyUInt = new UInt(65_535);
 *
 */
export class UInt<Attributes> extends PlcInteger<Attributes> {
    public override readonly __type = 'UInt'
    public override readonly offset = 2.0
    public override readonly defaultValue = 0
    public override readonly representation = 10
    constructor(value?: number, attributes?: Attributes) {
        super(value, attributes)
    }

    public getBit<T extends number>(index: BitAccess extends Tuple<BitAccess, 15>[T] ? T : never) { return new BitAccess(this, index) }

}