import {PlcInteger} from "./PlcInteger.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";
import {Tuple} from "@/src/misc/tuple-type.js";

/**
 * Creates a new UDInt.
 *
 * Min: 0 - Max: 4_294_967_295
 *
 * @example
 * const MyUDInt = new UDInt(4_294_967_295);
 *
 */
export class UDInt<Attributes> extends PlcInteger<Attributes> {
    public override readonly __type = 'UDInt'
    public override readonly offset = 4.0
    public override readonly defaultValue = 0
    public override readonly representation = 10
    constructor(value?: number, attributes?: Attributes) {
        super(value, attributes)
    }

    public getBit<T extends number>(index: BitAccess extends Tuple<BitAccess, 31>[T] ? T : never) { return new BitAccess(this, index) }

}