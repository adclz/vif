import StackTrace from "stacktrace-js";
import * as path from "path";

export interface Traceable {
    // File trace
    __trace?: Trace
}

export interface Trace {
    file: string,
    column: number,
    line: number
}

/*
 * Get the file trace of the calling function with the error trick from "stacktrace-js"
 * 
 * For now, tracing only works in node environments.
 */
export const getTrace = function (ctor: InstanceType<any>) {
    if (typeof process !== 'undefined') {
        const stack = StackTrace.getSync()
        // Get the first block that called 'toAst'
        // Get the trace for operations
        let index = stack.findLastIndex(x => {
            if (!x.getFunctionName()) return false
            if (x.getFunctionName().includes("Fb.body") ||
                x.getFunctionName().includes("Fb.body") ||
                x.getFunctionName().includes("Ob.body")) return true
        })
        // Get the trace for POU blocks if not an operation
        if (index === -1) {
            index = stack.findLastIndex(x =>
                x.getFunctionName() === "new Fb" ||
                x.getFunctionName() === "new Fc" ||
                x.getFunctionName() === "new Ob"
            )
            if (index !== -1) index += 1
        }
        // Get the source
        if (index === -1) {
            index = stack.findLastIndex(x =>
                x.getFunctionName() === "new Source"
            )
            if (index !== -1) index += 2
        }
        if (index !== -1) {
            const trace = stack[index]
            const relative = path.normalize(path.relative(process.cwd(), trace.fileName!))
            ctor.__trace = {file: relative, column: trace.columnNumber, line: trace.lineNumber}
        }
    }
}