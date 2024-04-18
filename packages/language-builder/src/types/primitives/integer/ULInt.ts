import {PlcInteger} from "./PlcInteger.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";
import {Tuple} from "@/src/misc/tuple-type.js";

/**
 * Creates a new ULInt.
 *
 * Min: 0 - Max: 18_446_744_073_709_551_615n
 *
 * @example
 * const MyULInt = new ULInt(18446744073709551615n)
 *
 */
export class ULInt<Attributes> extends PlcInteger<Attributes> {
    public override readonly __type = 'ULInt'
    public override readonly offset = 8.0
    public override readonly defaultValue = 0
    public override readonly representation = 10
    constructor(value?: number | bigint, attributes?: Attributes) {
        super(value, attributes)
    }

    public getBit<T extends number>(index: BitAccess extends Tuple<BitAccess, 63>[T] ? T : never) { return new BitAccess(this, index) }

}