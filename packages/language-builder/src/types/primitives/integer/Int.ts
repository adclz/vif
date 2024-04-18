import {PlcInteger} from "./PlcInteger.js";
import {get_target_ast} from "@/src/language/ast/index.js";
import {Tuple} from "@/src/misc/tuple-type.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";

/**
 * Creates a new Int.
 *
 * Min: -32_768 - Max: 32_767
 *
 * @example
 * const MyInt = new Int(32_767)
 * const MyNegativeInt = new Int(-32_768)
 *
 */
export class Int<Attributes> extends PlcInteger<Attributes> {
    public override readonly __type = 'Int'
    public override readonly offset = 2.0
    public override readonly defaultValue = 0
    public override readonly representation = 10
    constructor(value?: number, attributes?: Attributes) {
        super(value, attributes)
    }
    
    public getBit<T extends number>(index: BitAccess extends Tuple<BitAccess, 15>[T] ? T : never) { return new BitAccess(this, index) }
}



