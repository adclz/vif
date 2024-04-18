import {Trace} from "@/src/language/base-behavior/traceable.js";

/*
 * Base interface for all ast nodes in vif.
 */
export default interface ast {
    ty: string,
    src: Record<string, any> & { trace?: Trace }
}