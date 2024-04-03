import Operation from "@/src/operations/operation.js";
import {Bool} from "@/src/types/primitives/boolean/Bool.js";
import {get_target_ast} from "@/src/language/ast/target.js";
import ast from "@/src/language/ast/ast.js";
import {PrimitiveLike} from "@/src/types/primitives/primitive-like.js";
import {PlcTime} from "@/src/types/primitives/time/PlcTime.js";

export interface TimerSM_ast {
    ty: "#timer_sm",
    src: {
        start: ast,
        reset: ast | undefined,
        preset_var: ast,
        timer_var: ast,
        on_timer_start: ast[],
        on_timer_elapsed: ast[]
        on_timer_reset: ast[]
    }
}

export class Timer_State_Machine extends Operation<void> {
    start: Operation<Bool<any>>
    reset?: Operation<Bool<any>>
    preset_var: PrimitiveLike<PlcTime<any>>
    timer_var: PrimitiveLike<PlcTime<any>>
    
    on_timer_start: Operation<void>[]
    on_timer_elapsed: Operation<void>[]
    on_timer_reset: Operation<void>[]
    constructor(data: {
            start: Operation<Bool<any>>, 
            reset?: Operation<Bool<any>>, 
            preset_var: PrimitiveLike<PlcTime<any>>, 
            timer_var: PrimitiveLike<PlcTime<any>>,
            on_timer_start: Operation<void>[], 
            on_timer_elapsed: Operation<void>[],
            on_timer_reset: Operation<void>[], 
    }) {
        super()
        this.start = data.start
        this.reset = data.reset
        this.preset_var = data.preset_var
        this.timer_var = data.timer_var
        
        this.on_timer_start = data.on_timer_start
        this.on_timer_elapsed = data.on_timer_elapsed
        this.on_timer_reset = data.on_timer_reset
    }
    
    public toAst(): TimerSM_ast {
        return {
            ty: "#timer_sm",
            src: {
                start: this.start.toAst(),
                reset: this.reset ? this.reset.toAst() : undefined,
                preset_var: get_target_ast(this.preset_var),
                timer_var: get_target_ast(this.timer_var),
                
                on_timer_start: this.on_timer_start.map(x => x.toAst()),
                on_timer_elapsed: this.on_timer_elapsed.map(x => x.toAst()),
                on_timer_reset: this.on_timer_reset.map(x => x.toAst()),
            }
        }
    }
}
