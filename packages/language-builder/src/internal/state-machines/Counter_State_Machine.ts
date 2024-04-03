import Operation from "@/src/operations/operation.js";
import {Bool} from "@/src/types/primitives/boolean/Bool.js";
import {get_target_ast} from "@/src/language/ast/target.js";
import ast from "@/src/language/ast/ast.js";
import {PrimitiveLike} from "@/src/types/primitives/primitive-like.js";
import {PlcInteger} from "@/src/types/primitives/integer/PlcInteger.js";

export interface CounterSM_ast {
    ty: "#counter_sm",
    src: {
        increment?: ast,
        decrement?: ast,
        reset?: ast,
        load?: ast,
        preset_var: ast,
        counter_var: ast,
        on_counter_up: ast[],
        on_counter_down: ast[],
        on_counter_reset: ast[]
    }
}

export class Counter_State_Machine extends Operation<void> {
    increment?: Operation<Bool<any>>
    decrement?: Operation<Bool<any>>
    reset?: Operation<Bool<any>>
    load?: Operation<Bool<any>>

    preset_var: PrimitiveLike<PlcInteger<any>>
    counter_var: PrimitiveLike<PlcInteger<any>>

    on_counter_up: Operation<void>[]
    on_counter_down: Operation<void>[]
    on_counter_reset: Operation<void>[]
    constructor(data: {
        increment?: Operation<Bool<any>>
        decrement?: Operation<Bool<any>>,
        reset?: Operation<Bool<any>>, 
        load?: Operation<Bool<any>>,
        
        preset_var: PrimitiveLike<PlcInteger<any>>,
        counter_var: PrimitiveLike<PlcInteger<any>>,
        
        on_counter_up: Operation<void>[],
        on_counter_down: Operation<void>[]
        on_counter_reset: Operation<void>[]
    }) {
        super()
        this.increment = data.increment
        this.decrement = data.decrement
        this.reset = data.reset
        this.load = data.load
        
        this.preset_var = data.preset_var
        this.counter_var = data.counter_var
        
        this.on_counter_up = data.on_counter_up
        this.on_counter_down = data.on_counter_down
        this.on_counter_reset = data.on_counter_reset
    }
    
    public toAst(): CounterSM_ast {
        return {
            ty: "#counter_sm",
            src: {
                increment: this.increment ? this.increment.toAst() : undefined,
                decrement: this.decrement ? this.decrement.toAst() : undefined,
                reset: this.reset ? this.reset.toAst() : undefined,
                load: this.load ? this.load.toAst() : undefined,
                preset_var: get_target_ast(this.preset_var),
                counter_var: get_target_ast(this.counter_var),

                on_counter_up: this.on_counter_up.map(x => x.toAst()),
                on_counter_down: this.on_counter_down.map(x => x.toAst()),
                on_counter_reset: this.on_counter_reset.map(x => x.toAst()),
            }
        }
    }
}
