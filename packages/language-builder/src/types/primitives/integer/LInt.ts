import {PlcInteger} from "./PlcInteger.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";
import {Tuple} from "@/src/misc/tuple-type.js";

/**
 * Creates a new LInt.
 *
 * Min: -9_223_372_036_854_775_808n - Max: 9_223_372_036_854_775_807n
 *
 * @example
 * const MyLInt = new LInt(9_223_372_036_854_775_807)
 * const MyNegativeLInt = new LInt(-9_223_372_036_854_775_808)
 *
 */
export class LInt<Attributes> extends PlcInteger<Attributes> {
    public override readonly __type = 'LInt'
    public override readonly offset = 8.0
    public override readonly defaultValue = 0
    public override readonly representation = 10
    constructor(value?: number | bigint, attributes?: Attributes) {
        super(value, attributes)
    }

    public getBit<T extends number>(index: BitAccess extends Tuple<BitAccess, 63>[T] ? T : never) { return new BitAccess(this, index) }

}