import {getTrace, Trace, Traceable} from "@/src/language/base-behavior/traceable.js";
import {CompilableToAst} from "@/src/language/base-behavior/compilable.js";

/*
 * Abstract class for all operations.
 * 
 * Calls getTrace automatically.
 */
export default abstract class Operation<T = void> implements Traceable, CompilableToAst {
    public readonly __return!: T
    public readonly __trace?: Trace
    protected constructor() {
        getTrace(this)
    }
    
    public abstract toAst(): any
}
