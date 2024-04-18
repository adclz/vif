import ast from "@/src/language/ast/ast.js";
import {fb_ast, fc_ast, global_db_ast, instance_db_ast, ob_ast, udt_ast, udt_impl_ast} from "@/src/pou/index.js";
import {
    access_ast,
    call_interface_ast,
    global_ref_ast,
    interface_ast,
    local_ref_ast,
    member_ast,
    primitive_ast, target_ast
} from "@/src/language/ast/index.js";
import {asg_ast, cmp_ast, calc_ast, call_ast} from "@/src/operations/basics/index.js";
import {array_ast, instance_ast, struct_ast} from "@/src/types/complex/index.js";
import {for_ast, if_ast, return_ast, while_ast} from "@/src/operations/program-control/index.js";
import {breakpoint_ast, log_ast, test_ast, unit_block_ast} from "@/src/operations/unit/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {resolve_template_ast} from "@/src/template/template.js";
import * as path from "path";
import * as fs from "fs";
import {
    acos_ast, asin_ast, atan_ast, ceil_ast,
    cos_ast,
    exp_ast, floor_ast,
    ln_ast, round_ast,
    sin_ast, sqr_ast, sqrt_ast,
    tan_ast,
    trunc_ast
} from "@/src/operations/math/index.js";
import {rotate_l_ast, rotate_r_ast, shl_ast, shr_ast, swap_ast} from "@/src/operations/binary/index.js";

type AddParameters<
    TFunction extends (...args: any) => any,
    TParameters extends [...args: any]
> = (
    ...args: [...Parameters<TFunction>, ...TParameters]
) => ReturnType<TFunction>;

type EventEmitterTypes = Record<string, (...args: any[]) => any>

class SingleEventEmitter<T extends EventEmitterTypes> {
    private readonly events: Record<keyof T, T[keyof T]> = {} as Record<keyof T, T[keyof T]>;
    private readonly afterEvents: Record<keyof T, AddParameters<T[keyof T], [result: ReturnType<T[keyof T]>]>> = {} as Record<keyof T, AddParameters<T[keyof T], [result: ReturnType<T[keyof T]>]>>

    constructor() {
    }

    protected on<Y extends keyof T>(event: Y, listener: T[Y]): void {
        this.events[event] = listener
    }

    protected after<Y extends keyof T>(event: Y, listener: AddParameters<T[Y], [result: ReturnType<T[Y]>]>): void {
        this.afterEvents[event] = listener
    }

    protected emit<Y extends keyof T>(event: Y, ...args: Parameters<T[Y]>): ReturnType<T[Y]> | null {
        const exec = this.events[event] ? this.events[event].call(this, ...args) : null
        if (!exec) return null
        if (this.afterEvents[event])
            return this.afterEvents[event].call(this, ...args, exec)
        else return exec
    }

    protected get<Y extends keyof T>(key: Y): T[Y] | null {
        const event = this.events[key]
        if (event) return event as T[Y]
        return null
    }
}

type TransformReturn = (string | number | null)[] | null

type CompilerEvents = {
    // Pou
    "ob": (ast: ob_ast, compiler: Compiler, options: {}) => TransformReturn,
    "fb": (ast: fb_ast, compiler: Compiler, options: {}) => TransformReturn,
    "fc": (ast: fc_ast, compiler: Compiler, options: {}) => TransformReturn,
    "udt": (ast: udt_ast, compiler: Compiler, options: {}) => TransformReturn,
    "instance_db": (ast: instance_db_ast, compiler: Compiler, options: {}) => TransformReturn,
    "global_db": (ast: global_db_ast, compiler: Compiler, options: {}) => TransformReturn,

    // Interfaces
    "interface": (ast: interface_ast, compiler: Compiler, options: {
        typesOnly?: boolean,
        valuesOnly?: boolean,
        inline?: boolean
    }) => TransformReturn,
    "call_interface": (ast: call_interface_ast, compiler: Compiler, options: {}) => TransformReturn,
    "member": (ast: member_ast, compiler: Compiler, options: {}) => TransformReturn,

    // Simples
    "primitive": (ast: { ty: string, src: { value?: string | number | boolean } }, compiler: Compiler, options: {
        typesOnly?: boolean,
        valuesOnly?: boolean,
        valueOrDefault?: boolean,
        varName?: string,
        asTypedConstant?: boolean,
        inline?: boolean
    }) => TransformReturn,
    
    //Access
    "access": (ast: access_ast, compiler: Compiler, options: {}) => TransformReturn,

    // Complex types
    "array": (ast: array_ast, compiler: Compiler, options: {
        typesOnly?: boolean,
        valuesOnly?: boolean,
        varName: string,
        inline?: boolean
    }) => TransformReturn,
    "array:inline-values": (ast: array_ast, compiler: Compiler, options: {
        typesOnly?: boolean,
        valuesOnly?: boolean,
        varName?: string,
        inline?: boolean
    }) => TransformReturn,
    "struct": (ast: struct_ast, compiler: Compiler, options: {
        typesOnly?: boolean,
        valuesOnly?: boolean,
        varName: string,
        inline?: boolean
    }) => TransformReturn,
    "struct:inline-values": (ast: struct_ast | udt_impl_ast, compiler: Compiler, options: {
        typesOnly?: boolean,
        valuesOnly?: boolean,
        varName?: string,
        inline?: boolean
    }) => TransformReturn,
    "instance": (ast: instance_ast, compiler: Compiler, options: {
        typesOnly?: boolean,
        valuesOnly?: boolean,
        varName: string,
        inline?: boolean
    }) => TransformReturn,
    "udt_impl": (ast: udt_impl_ast, compiler: Compiler, options: {
        typesOnly?: boolean,
        valuesOnly?: boolean,
        varName: string,
        inline?: boolean
    }) => TransformReturn,

    // Operations
    "assign": (ast: asg_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "compare": (ast: cmp_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "calc": (ast: calc_ast, compiler: Compiler, options: {}) => TransformReturn, // Always inline
    "call": (ast: call_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,

    "if": (ast: if_ast, compiler: Compiler, options: {}) => TransformReturn,
    "for": (ast: for_ast, compiler: Compiler, options: {}) => TransformReturn,
    "while": (ast: while_ast, compiler: Compiler, options: {}) => TransformReturn,
    "return": (ast: return_ast, compiler: Compiler, options: {}) => TransformReturn,

    // Math
    
    "cos": (ast: cos_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "sin": (ast: sin_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "tan": (ast: tan_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "acos": (ast: acos_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "asin": (ast: asin_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "atan": (ast: atan_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "exp": (ast: exp_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "ln": (ast: ln_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "ceil": (ast: ceil_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "round": (ast: round_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "floor": (ast: floor_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "trunc": (ast: trunc_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "sqrt": (ast: sqrt_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "sqr": (ast: sqr_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    
    // Binary
    "rol": (ast: rotate_l_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "ror": (ast: rotate_r_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "shl": (ast: shl_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "shr": (ast: shr_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    "swap": (ast: swap_ast, compiler: Compiler, options: { inline?: boolean }) => TransformReturn,
    
    // Unit
    "unit_test": (ast: test_ast, compiler: Compiler, options: {}) => TransformReturn,
    "unit_log": (ast: log_ast, compiler: Compiler, options: {}) => TransformReturn,
    "unit_block": (ast: unit_block_ast, compiler: Compiler, options: {}) => TransformReturn,
    "breakpoint": (ast: breakpoint_ast, compiler: Compiler, options: {}) => TransformReturn,

    // Targets
    "global_ref": (ast: global_ref_ast, compiler: Compiler, options: {}) => TransformReturn,
    "local_ref": (ast: local_ref_ast, compiler: Compiler, options: {}) => TransformReturn,
    "local_out": (ast: local_ref_ast, compiler: Compiler, options: {}) => TransformReturn,

    // Template
    "resolve_template": (ast: resolve_template_ast, compiler: Compiler, options: {}) => TransformReturn

    // Primitives
    "bool": (ast: { ty: "Bool", src: { value?: boolean } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn

    "byte": (ast: { ty: "Byte", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "word": (ast: { ty: "Word", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "dword": (ast: { ty: "DWord", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "lword": (ast: { ty: "LWord", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn

    "sint": (ast: { ty: "SInt", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "usint": (ast: { ty: "USInt", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "int": (ast: { ty: "Int", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "uint": (ast: { ty: "UInt", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "dint": (ast: { ty: "DInt", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "udint": (ast: { ty: "UDInt", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "lint": (ast: { ty: "LInt", src: { value?: number | string } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "ulint": (ast: { ty: "ULInt", src: { value?: number | string } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn

    "real": (ast: { ty: "Real", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "lreal": (ast: { ty: "LReal", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn

    "char": (ast: { ty: "Char", src: { value?: string } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "wchar": (ast: { ty: "WChar", src: { value?: string } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "string": (ast: { ty: "String", src: { value?: string } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "wstring": (ast: { ty: "WString", src: { value?: string } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn

    "time": (ast: { ty: "Time", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "ltime": (ast: { ty: "LTime", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn

    "tod": (ast: { ty: "Tod", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn
    "ltod": (ast: { ty: "LTod", src: { value?: number } }, compiler: Compiler, options: {
        asTypedConstant?: boolean
    }) => TransformReturn

    "date": (ast: { ty: "Date", src: { value?: number } }, compiler: Compiler, options: { asTypedConstant?: boolean }) => TransformReturn
    
    "implicit": (ast: { ty: "Implicit", src : { value: number | string | boolean } }, compiler: Compiler, options: { asTypedConstant: ast }) => TransformReturn
}

export class Compiler extends SingleEventEmitter<CompilerEvents> {
    // Current file being compiled
    public readonly Current: {
        file: string,
        fileName: string
    } = {file: "root", fileName: "" }
    
    // Blocks interface
    public readonly references: Record<string, Record<string, ast>> = {}
    /*
     * Override or create a new transformer with the corresponding event.
     */
    public transform = super.on
    /*
     * Triggered after a specific transformer has finished building an output
     */
    public afterTransform = super.after
    /*
     * Call a specific transformer
     */
    public emit = super.emit
    /*
     * Get the associated transformer callback, null otherwise 
     */
    public getTransformer = super.get
    public isNotNull = ((any: any): any is string[] => any !== null)
    private Files: Record<string, string[]> = {}
    private Indentation: number = 0
    private EmitTrace = false

    constructor() {
        super()
    }

    /*
     * Enable trace as comments in output
     * default: true
     */
    public emitTrace(emit = true) {
        this.EmitTrace = emit
    }

    /*
     * Parse any vif ast token tree into the compiler output.
     * 
     * You can use this function to compile separate parts of an ast.
     * 
     * This function differs from emit because it recognizes automatically the ast node to parse.
     */
    public parse = (ast: ast, options: {
        varName?: string, // For interfaces: If varName is present, it is automatically inlined.
        typesOnly?: boolean, // For interfaces: Only display the type.
        valuesOnly?: boolean, // For interfaces: Only display the value.
        valueOrDefault?: boolean, // For interfaces: When valuesOnly is set, force the return of a default value instead of null.
        inline?: boolean // For interfaces & body : No comma should be added at the end (when true).
        asTypedConstant?: boolean, // For body: force the value to be displayed as a typed constant.
    } = {}): TransformReturn => {
        if (ast["ty"]) {
            if (this.isOb(ast)) return this.emit("ob", ast, this, options)
            if (this.isFb(ast)) return this.emit("fb", ast, this, options)
            if (this.isFc(ast)) return this.emit("fc", ast, this, options)
            if (this.isUdt(ast)) return this.emit("udt", ast, this, options)
            if (this.isInstanceDb(ast)) return this.emit("instance_db", ast, this, options)
            if (this.isGlobalDb(ast)) return this.emit("global_db", ast, this, options)

            if (this.isInterface(ast)) return this.emit("interface", ast, this, options!)
            if (this.isCallInterface(ast)) return this.emit("call_interface", ast, this, options)
            if (this.isMember(ast)) return this.emit("member", ast, this, options)

            if (this.isArray(ast)) return this.emit("array", ast, this, options as { varName: string })
            if (this.isStruct(ast)) return this.emit("struct", ast, this, options as { varName: string })
            if (this.isInstance(ast)) return this.emit("instance", ast, this, options as { varName: string })
            if (this.isUdtImpl(ast)) return this.emit("udt_impl", ast, this, options as { varName: string })

            if (this.isAssign(ast)) return this.emit("assign", ast, this, options)
            if (this.isCompare(ast)) return this.emit("compare", ast, this, options)
            if (this.isCalc(ast)) return this.emit("calc", ast, this, options)
            if (this.isCall(ast)) return this.emit("call", ast, this, options)

            if (this.isIf(ast)) return this.emit("if", ast, this, options)
            if (this.isFor(ast)) return this.emit("for", ast, this, options)
            if (this.isWhile(ast)) return this.emit("while", ast, this, options)
            if (this.isReturn(ast)) return this.emit("return", ast, this, options)

            if (this.isCos(ast)) return this.emit("cos", ast, this, options)
            if (this.isSin(ast)) return this.emit("sin", ast, this, options)
            if (this.isTan(ast)) return this.emit("tan", ast, this, options)
            if (this.isACos(ast)) return this.emit("acos", ast, this, options)
            if (this.isASin(ast)) return this.emit("asin", ast, this, options)
            if (this.isATan(ast)) return this.emit("atan", ast, this, options)
            if (this.isExp(ast)) return this.emit("exp", ast, this, options)
            if (this.isLn(ast)) return this.emit("ln", ast, this, options)
            if (this.isCeil(ast)) return this.emit("ceil", ast, this, options)
            if (this.isFloor(ast)) return this.emit("floor", ast, this, options)
            if (this.isRound(ast)) return this.emit("round", ast, this, options)
            if (this.isTrunc(ast)) return this.emit("trunc", ast, this, options)
            if (this.isSqrt(ast)) return this.emit("sqrt", ast, this, options)
            if (this.isSqr(ast)) return this.emit("sqr", ast, this, options)
            
            if (this.isRotateLeft(ast)) return this.emit("rol", ast, this, options)
            if (this.isRotateRight(ast)) return this.emit("ror", ast, this, options)
            if (this.isShl(ast)) return this.emit("shl", ast, this, options)
            if (this.isShr(ast)) return this.emit("shr", ast, this, options)
            if (this.isSwap(ast)) return this.emit("swap", ast, this, options)

            if (this.isUnitTest(ast)) return this.emit("unit_test", ast, this, options)
            if (this.isUnitLog(ast)) return this.emit("unit_log", ast, this, options)
            if (this.isBreakpoint(ast)) return this.emit("breakpoint", ast, this, options)
            if (this.isUnitBlock(ast)) return this.emit("unit_block", ast, this, options)

            if (this.isTarget(ast)) {
                if (this.isLocalOut(ast)) return this.emit("local_out", ast, this, options)
                if (this.isLocalRef(ast)) return this.emit("local_ref", ast, this, options)
            }

            if (this.isGlobalRef(ast)) return this.emit("global_ref", ast, this, options)
            if (this.isLocalOut(ast)) return this.emit("local_out", ast, this, options)
            if (this.isLocalRef(ast)) return this.emit("local_ref", ast, this, options)
            if (this.isTemplateResolve(ast)) return this.emit("resolve_template", ast, this, options)
            if (this.isImplicit(ast)) return this.emit("implicit", ast, this, options as any)
            if (this.isAccess(ast)) return this.emit("access", ast, this, options)

            // Primitives
            return this.emit("primitive", ast as {
                ty: string,
                src: { value?: string | number | boolean }
            }, this, options)
        } else return null
    }

    /**
     * Parse a full ast tree and returns the files as Record<string, string[]>
     *
     * Each file is an array of string, to turns the output into a valid code, just the values of the record with \n.
     *
     * @example
     * /...
     * const output = compiler.compile(ast)
     * const StOutput = Object.values(output).map(x => x.join("\n")).join("\n")
     */
    public compile(ast: Record<string, ast>) {
        this.Files = {}
        Object.keys(ast)
            .filter(x => x.startsWith("file"))
            .forEach(file => {
                
                this.Current.fileName = file.slice(file.lastIndexOf("/") + 1, file.length)
                this.Current.file = file
               
                const result = this.parse(ast[file])
                
                if (result !== null) {
                    const code = result
                        .filter(this.isNotNull)
                        .flat(Infinity)
                        .map(x => this.applyIndent(x!))
                        .filter(this.isNotNull)
                    this.Files[file] = code as string[]
                }
            })
        return this.Files
    }
    
    /**
     * Writes data to a file.
     * If the file doesn't exist, it will be created.
     * If the file already exists, the data can either be appended to the existing content or replace the existing content.
     *
     * @param {Object} data - The data to be written to the file.
     * @param {Object} data.files - The files emitted from the compiler. 
     *
     * @param {string} data.filePath - The path of the file to be written.
     * @param {boolean} [data.erase] - Whether to erase the existing content of the file. If true, the file will be overwritten completely.
     * @param {string} [data.cwd] - The current working directory. Defaults to the process's current working directory.
     */
    public pushToFile = (data: {
        files: Record<string, string[]>,
        filePath: string,
        erase?: boolean,
        cwd?: string 
    }) => {
        const cwd = data.cwd ?? process.cwd()
        const file = path.join(cwd, data.filePath)
        if (!fs.existsSync(file))
            fs.writeFileSync(file, JSON.stringify(data.files))
        else {
            if (data.erase)
                fs.writeFileSync(file, JSON.stringify(data.files))
            else {
                const content = JSON.parse(fs.readFileSync(file, "utf8"))
                fs.writeFileSync(file, JSON.stringify({...content, ...data.files }))
            }
        }
    }

    /*
     * Format type name.
     * 
     * All instances and udt must be surrounded with "".
     * 
     * All other types have their first letter set to upper case.
     */
    public getTypeName(ast: ast) {
        switch (true) {
            case this.isUdtImpl(ast):
                return `"${ast.src.of}"`
            case this.isInstance(ast):
                return `"${ast.src.of}"`
            default:
                return this.capitalizeFirstLetter(ast.ty)
        }
    }

    /**
     * Parse a block ast and push all the references at this.references
     *     
     *     
     * @param blockName
     * @param _interface
     */
    public parseBlockReferences = (blockName: string, _interface: interface_ast) => {
        const parseSection = (fullPath: string[], ast: interface_ast) => {
            Object.keys(ast.src)
                .forEach(sectionName => {
                    const section = ast.src[sectionName as keyof interface_ast["src"]]!
                    Object.keys(section)
                        .forEach(memberName => {
                            //@ts-ignore
                            const member = section[memberName as keyof Record<string, member_ast>]
                            parseAny(member, [...fullPath, memberName])                        
                        })
                })
        }

        const parseAny = (ast: member_ast | struct_ast | array_ast | udt_impl_ast | instance_ast, fullPath: string[]) => {
            switch (true) {
                case this.isStruct(ast): parseStruct(ast, fullPath)
                    break;
                case this.isArray(ast): parseArray(ast, fullPath)
                    break
                case this.isUdtImpl(ast): parseUdtImpl(ast, fullPath)
                    break
                default: {
                    let ref: any = this.references
                    fullPath.forEach((field, i) => {
                        if (!ref[field]) {
                            if (i === fullPath.length - 1)
                                ref[field] = ast
                            else ref[field] = {}
                        }
                        ref = ref[field]
                    })
                }
                    break
            }
        }

        const parseStruct = (ast: struct_ast, fullPath: string[]) => {
            Object.keys(ast.src.interface)
                .filter(x => typeof ast.src.interface[x] !== "undefined")
                .forEach(memberName => {
                    parseAny(ast.src.interface[memberName as keyof member_ast], [...fullPath, memberName])
                })
        }
        
        const parseArray = (ast: array_ast, fullPath: string[]) => {
            for (let i = 0; i < ast.src.length; i++) {
                parseAny(ast.src.of, [...fullPath, `[${i}]`])
            }
        }

        const parseUdtImpl = (ast: udt_impl_ast, fullPath: string[]) => {
            Object.keys(ast.src.interface)
                .filter(x => typeof ast.src.interface[x] !== "undefined")
                .forEach(memberName => {
                    parseAny(ast.src.interface[memberName as keyof member_ast], [...fullPath, memberName])
                })
        }
        
        parseSection([blockName], _interface)
    }
    
    public cleanTransformer = (output: TransformReturn | TransformReturn[]): FlatArray<any, any> => {
        return output?.flat(Infinity).filter(this.isNotNull) as any
    }
    
    /*
     * Seek for a local reference in a global / local interface.
     * 
     * Returns null if nothing found
     */
    public getTargetInInterface = (target: target_ast): ast | null => {
        switch (true) {
            case this.isLocalRef(target):
                //@ts-ignore Not friendly with ? operator
                return target.src.path.reduce((prev, curr) => prev?.[curr], this.references) || null
            case this.isLocalOut(target): {
                //@ts-ignore Not friendly with ? operator
                return target.src.path.reduce((prev, curr) => prev?.[curr], this.references) || null
            }
            default: return null
        }
    }

    public isOb = (ast: ast): ast is ob_ast => ast.ty === "ob"

    public isFb = (ast: ast): ast is fb_ast => ast.ty === "fb"

    public isFc = (ast: ast): ast is fc_ast => ast.ty === "fc"

    public isUdt = (ast: ast): ast is udt_ast => ast.ty === "udt"

    public isInstanceDb = (ast: ast): ast is instance_db_ast => ast.ty === "instance_db"

    public isGlobalDb = (ast: ast): ast is global_db_ast => ast.ty === "global_db"

    public isInterface = (ast: ast): ast is interface_ast => ast.ty === "interface"

    public isCallInterface = (ast: ast): ast is call_interface_ast => ast.ty === "call_interface"

    public isMember = (ast: ast): ast is member_ast => ast.ty === "member"

    public isArray = (ast: ast): ast is array_ast => ast.ty === "array"

    public isStruct = (ast: ast): ast is struct_ast => ast.ty === "Struct"

    public isInstance = (ast: ast): ast is instance_ast => ast.ty === "instance"

    public isUdtImpl = (ast: ast): ast is udt_impl_ast => ast.ty === "udt_impl"

    public isAssign = (ast: ast): ast is asg_ast => ast.ty === "asg"

    public isCompare = (ast: ast): ast is cmp_ast => ast.ty === "compare"

    public isCalc = (ast: ast): ast is calc_ast => ast.ty === "calc"

    public isCall = (ast: ast): ast is call_ast => ast.ty === "call"

    public isIf = (ast: ast): ast is if_ast => ast.ty === "if"

    public isFor = (ast: ast): ast is for_ast => ast.ty === "for"

    public isWhile = (ast: ast): ast is while_ast => ast.ty === "while"

    public isReturn = (ast: ast): ast is return_ast => ast.ty === "return"
    
    // Math

    public isCos = (ast: ast): ast is cos_ast => ast.ty === "cos"
    public isSin = (ast: ast): ast is sin_ast => ast.ty === "sin"
    public isTan = (ast: ast): ast is tan_ast => ast.ty === "tan"
    public isACos = (ast: ast): ast is acos_ast => ast.ty === "acos"
    public isASin = (ast: ast): ast is asin_ast => ast.ty === "asin"
    public isATan = (ast: ast): ast is atan_ast => ast.ty === "atan"
    public isExp = (ast: ast): ast is exp_ast => ast.ty === "exp"
    public isLn = (ast: ast): ast is ln_ast => ast.ty === "ln"
    public isCeil = (ast: ast): ast is ceil_ast => ast.ty === "ceil"
    public isFloor = (ast: ast): ast is floor_ast => ast.ty === "floor"
    public isRound = (ast: ast): ast is round_ast => ast.ty === "round"
    public isTrunc = (ast: ast): ast is trunc_ast => ast.ty === "trunc"
    public isSqrt = (ast: ast): ast is sqrt_ast => ast.ty === "sqrt"
    public isSqr = (ast: ast): ast is sqr_ast => ast.ty === "sqr"
    
    // Binary
    
    public isRotateLeft = (ast: ast): ast is rotate_l_ast => ast.ty === "rol"
    public isRotateRight = (ast: ast): ast is rotate_r_ast => ast.ty === "ror"
    public isShl = (ast: ast): ast is shl_ast => ast.ty === "shl"
    public isShr = (ast: ast): ast is shr_ast => ast.ty === "shr"
    public isSwap = (ast: ast): ast is swap_ast => ast.ty === "swap"


    // Unit

    public isUnitTest = (ast: ast): ast is test_ast => ast.ty === "unit_test"

    public isUnitLog = (ast: ast): ast is log_ast => ast.ty === "unit_log"

    public isBreakpoint = (ast: ast): ast is breakpoint_ast => ast.ty === "breakpoint"

    public isUnitBlock = (ast: ast): ast is unit_block_ast => ast.ty === "unit_block"

    public isTarget = (ast: ast): ast is local_ref_ast => ast.ty === ("global" || "local" || "local_out" || "constant")

    public isGlobalRef = (ast: ast): ast is global_ref_ast => ast.ty === "global"

    public isLocalRef = (ast: ast): ast is local_ref_ast => ast.ty === "local"

    public isLocalOut = (ast: ast): ast is local_ref_ast => ast.ty === "local_out"

    public isConstant = (ast: ast): ast is primitive_ast => ast.ty === "constant"

    public isTemplateResolve = (ast: ast): ast is resolve_template_ast => ast.ty === "resolve_template"
    
    // Primitives
    public isBool = (ast: ast): ast is { ty: "Bool", src: { value?: boolean } } => ast.ty === "Bool"

    public isByte = (ast: ast): ast is { ty: "Byte", src: { value?: number } } => ast.ty === "Byte"
    

    public isWord = (ast: ast): ast is { ty: "Word", src: { value?: number } } => ast.ty === "Word"

    public isDWord = (ast: ast): ast is { ty: "DWord", src: { value?: number } } => ast.ty === "DWord"

    public isLWord = (ast: ast): ast is { ty: "LWord", src: { value?: number } } => ast.ty === "LWord"

    public isSInt = (ast: ast): ast is { ty: "SInt", src: { value?: number } } => ast.ty === "SInt"

    public isUSInt = (ast: ast): ast is { ty: "USInt", src: { value?: number } } => ast.ty === "USInt"

    public isInt = (ast: ast): ast is { ty: "Int", src: { value?: number } } => ast.ty === "Int"

    public isUInt = (ast: ast): ast is { ty: "UInt", src: { value?: number } } => ast.ty === "UInt"

    public isDInt = (ast: ast): ast is { ty: "DInt", src: { value?: number } } => ast.ty === "DInt"

    public isUDInt = (ast: ast): ast is { ty: "UDInt", src: { value?: number } } => ast.ty === "UDInt"

    public isLInt = (ast: ast): ast is { ty: "LInt", src: { value?: number } } => ast.ty === "LInt"

    public isULInt = (ast: ast): ast is { ty: "ULInt", src: { value?: number } } => ast.ty === "ULInt"

    public isReal = (ast: ast): ast is { ty: "Real", src: { value?: number } } => ast.ty === "Real"

    public isLReal = (ast: ast): ast is { ty: "LReal", src: { value?: number } } => ast.ty === "LReal"

    public isChar = (ast: ast): ast is { ty: "Char", src: { value?: string } } => ast.ty === "Char"

    public isWChar = (ast: ast): ast is { ty: "WChar", src: { value?: string } } => ast.ty === "WChar"

    public isString = (ast: ast): ast is { ty: "String", src: { value?: string } } => ast.ty === "String"

    public isWString = (ast: ast): ast is { ty: "WString", src: { value?: string } } => ast.ty === "WString"

    public isTime = (ast: ast): ast is { ty: "Time", src: { value?: number } } => ast.ty === "Time"

    public isLTime = (ast: ast): ast is { ty: "LTime", src: { value?: number } } => ast.ty === "LTime"

    public isTod = (ast: ast): ast is { ty: "Tod", src: { value?: number } } => ast.ty === "Tod"

    public isLTod = (ast: ast): ast is { ty: "LTod", src: { value?: number } } => ast.ty === "LTod"

    public isDate = (ast: ast): ast is { ty: "Date", src: { value?: number } } => ast.ty === "Date"
    
    public isImplicit = (ast: ast): ast is { ty: "Implicit", src: { value: number | string | boolean } } => ast.ty === "Implicit"
    public isAccess = (ast: ast): ast is access_ast => ast.ty === "access"

    // Default transformers
    public useDefaultTransformers() {
        this.transform("fb", (fb, compiler, _options) => {
            const trace = this.getTrace(fb.src.trace)
            compiler.parseBlockReferences(this.Current.fileName, fb.src.interface)
            
            return [
                `FUNCTION_BLOCK "${compiler.Current.fileName}"`,
                ...compiler.parse(fb.src.interface) ?? '',
                "BEGIN",
                1,
                ...(trace ? [`// Block declared on ${trace}`, ""] : [null]),
                ...(fb.src.body ? (fb.src.body
                    .map(x => compiler.parse(x))
                    .filter(compiler.isNotNull)
                    .flat(Infinity) as string[]) : ''),
                -1,
                "",
                "END_FUNCTION_BLOCK"]
        })

        this.transform("fc", (fc, compiler, _options) => {
            const trace = this.getTrace(fc.src.trace)
            // Fc should only be referenced from the inside
            compiler.parseBlockReferences(this.Current.fileName, fc.src.interface)
            
            return [ 
                `FUNCTION "${compiler.Current.fileName}" : ${fc.src.interface.src.return ? compiler.parse(fc.src.interface.src.return, { typesOnly: true, inline: true }) : 'Void'}`, //+ Return type
                ...compiler.parse(fc.src.interface) ?? '',
                "BEGIN",
                1,
                ...(trace ? [`// Block declared on ${trace}`, ""] : [null]),
                ...(fc.src.body ? (fc.src.body
                    .map(x => compiler.parse(x))
                    .filter(compiler.isNotNull)
                    .flat(Infinity) as string[]) : ''),
                -1,
                "",
                "END_FUNCTION"]
        })

        this.transform("global_db", (db, compiler, _options) => {
            compiler.parseBlockReferences(this.Current.fileName, db.src.interface)

            return [
                `DATA_BLOCK "${compiler.Current.fileName}"`,
                ...compiler.parse(db.src.interface, {typesOnly: true}) ?? '',
                "",
                "BEGIN",
                ...compiler.parse(db.src.interface, {valuesOnly: true}) ?? '',
                "",
                "END_DATA_BLOCK", ""]
        })

        this.transform("instance_db", (db, compiler, _options) => {
            //compiler.parseBlockReferences(this.Current.fileName)

            return [
                `DATA_BLOCK "${compiler.Current.fileName}"`,
                `"${db.src.of}"`,
                "",
                "BEGIN",
                //...compiler.parse(db.src.interface, {valuesOnly: true}) ?? '',
                "",
                "END_DATA_BLOCK", ""]
        })

        this.transform("udt", (udt, compiler, _options) => {
            return [
                `TYPE "${compiler.Current.fileName}"`,
                1,
                'STRUCT',
                ...Object.entries(udt.src.interface!)
                    .map(member => {
                        return [
                            1,
                            compiler.parse(member[1], {varName: member[0]}),
                            -1
                        ]
                    }).filter(compiler.isNotNull)
                    .flat(Infinity) as string[],
                'END_STRUCT;',
                -1,
                "",
                'END_TYPE']
        })

        this.transform("interface", (_interface, compiler, options) => {
            return [
                ["input", "VAR_INPUT"],
                ["output", "VAR_OUTPUT"],
                ["inout", "VAR_IN_OUT"],
                ["static", "VAR"],
                ["temp", "VAR_TEMP"],
                ["constant", "VAR CONSTANT"]
            ]
                .map(key => {
                    if (key[0] in _interface.src) {
                        return [
                            // valuesOnly applies for DB where values are declared in body and not interface
                            options.valuesOnly ? null : 1,
                            options.valuesOnly ? null : key[1],
                            ...Object.entries(_interface.src[key[0] as keyof interface_ast["src"]]!)
                                .map(member => {
                                    return [
                                        1,
                                        compiler.parse(member[1], {...options, varName: member[0]}),
                                        -1
                                    ]
                                }),
                            options.valuesOnly ? null : "END_VAR",
                            options.valuesOnly ? null : -1]
                    } else
                        return null
                })
                .filter(compiler.isNotNull)
                .flat(Infinity) as string[]
        })

        this.transform("call_interface", (_interface, compiler, _options) => {
            return [
                ["input", ":="],
                ["inout", "=>"],
                ["output", "=>"]
            ]
                .map(key => {
                    if (key[0] in _interface.src) {
                        return [
                            1,
                            ...Object.entries(_interface.src[key[0] as keyof call_interface_ast["src"]]!)
                                .map((member, i, l) => {
                                    // Delete the comma at the end of output
                                    return [`${member[0]} ${key[1]} ${compiler.parse(member[1], { inline: true, valuesOnly: true })!}${key[0] === "output" && i === l.length - 1 ? "" : ","}`]
                                }),
                            -1
                        ]
                    } else
                        return [null]
                })
                .filter(compiler.isNotNull)
                .flat(Infinity) as string[]
        })

        this.transform("array", (member, compiler, options) => {
            // Only writes the types of an array, no values
            if (options.typesOnly) {
                const array_of = compiler.parse(member.src.of, {...options})!
                return [
                    `${options.varName} : Array[0..${member.src.length - 1}] of ${this.getTypeName(member.src.of)};`,
                    array_of.length > 1 ? array_of.splice(1, array_of.length) : null
                ]
                    .filter(compiler.isNotNull)
                    .flat(Infinity) as string[]
            }

            // Only writes the values
            if (options.valuesOnly) {
                return member.src.values?.src
                    .map(x => {
                        // If element has no value defined, we don't need to specify its value
                        const value = compiler.parse({
                            ty: x.value.ty.toLowerCase(),
                            src: x.value.src
                        }, {valuesOnly: true, inline: true})
                        if (!value) return null
                        if (!value.length) return null
                        return `${compiler.parse(x.target)} := ${value};`
                    }) as string[]
            }

            // Returns both types & default values
            const inline_values = compiler.emit("array:inline-values", member, compiler, {})
            return [
                `${options.varName} : Array[0..${member.src.length}] of ${this.getTypeName(member.src.of)}${inline_values ? ` := ${inline_values}` : ''};`,
            ] as string[]
        })

        /**
         * Inline array default values
         */
        this.transform("array:inline-values", (array, compiler, _options) => {
            if (!array.src.values) return null
            if (!array.src.values.src.length) return null
            const arr: any[] = []
            
            let default_value;
            if (compiler.isArray(array.src.of))
                default_value = compiler.emit("array:inline-values", array.src.of, compiler, {})
            if (compiler.isUdtImpl(array.src.of))
                default_value = compiler.emit("struct:inline-values", array.src.of, compiler, {})
            else
                default_value = compiler.parse(array.src.of!, {
                    valuesOnly: true,
                    valueOrDefault: true,
                    inline: true
                })!

            //Creates a whole array with default values
            for (let i = 0; i < array.src.length; i++) arr.push(default_value)

            // Next reads the default values in array_values
            array.src.values.src
                .forEach(x => {
                    const index = parseInt(x.target.src.path[0].replace("[", "").replace("]", ""))
                    if (Number.isNaN(index))
                        throw new Error(`Invalid index ${x.target.src.path} in array`)
                    
                    let value;
                    if (compiler.isArray(x.value))
                        value = compiler.emit("array:inline-values", x.value, compiler, {})
                    if (compiler.isUdtImpl(x.value))
                        value = compiler.emit("struct:inline-values", x.value, compiler, {})
                    else
                        value = compiler.parse(x.value!, {
                            valuesOnly: true,
                            valueOrDefault: true,
                            inline: true
                        })!
                    
                    if (typeof value !== null)
                        arr[index] = value as any
                })

            let val = arr.flat(Infinity).filter(compiler.isNotNull)
            if (!val.length) return null

            let currentValue: boolean | string | string[] | number | null = null
            let currentCounter = 1
            
            // Keeps increments the same index until it meets a different value, write the index, restart from the last index.
            return ["[", 
                val.reduce(
                (acc, value, _) => {
                    if (currentValue === null) {
                        currentCounter = 1
                        currentValue = value
                        acc.push(currentValue)
                    } else {
                        if (currentValue !== value) {
                            currentCounter = 1
                            currentValue = value
                            acc.push(currentValue)
                        } else {
                            currentCounter++
                            acc[acc.length - 1] = `${currentCounter}(${value})`
                        }
                    }
                    return acc
                },
                [] as (string | string[] | number | boolean)[]
            ), "]"].join("") as unknown as string[]
        })

        this.transform("struct", (member, compiler, options) => {
            if (options.typesOnly)
                return [`${options.varName} : Struct`,
                    1,
                    ...Object.entries(member.src.interface)
                        .map(member => {
                            return [
                                compiler.parse(member[1], {...options, varName: member[0]}),
                            ]
                        }),
                    -1,
                    "END_STRUCT;"].filter(compiler.isNotNull)
                    .flat(Infinity) as string[]
            
            // Same logic as array
            if (options.valuesOnly)
                return Object.entries(member.src.interface)
                    .map(member => {
                        // If element has no value defined, we don't need to specify its value
                        const value = compiler.parse(member[1], {
                            ...options,
                            varName: member[0] })?.flat(Infinity).filter(compiler.isNotNull)
                        if (!value) return null
                        if (!value.length) return null
                        return [
                            `${options.varName}.${value}`,
                        ]
                    }).filter(compiler.isNotNull)
                    .flat(Infinity) as string[]

            return [`${options.varName} : Struct`,
                1,
                ...Object.entries(member.src.interface)
                    .map(member => {
                        return [
                            compiler.parse(member[1], {...options, varName: member[0] }),
                        ]
                    }),
                -1,
                "END_STRUCT;"].filter(compiler.isNotNull)
                .flat(Infinity) as string[]
        })

        this.transform("udt_impl", (member, compiler, options) => {
            if (options.typesOnly)
                return [`${options.varName} : "${member.src.of}"${options.inline ? "" : ";"}`]

            if (options.valuesOnly)
                return Object.entries(member.src.interface)
                    .map(member => {
                        // If element has no value defined, we don't need to specify its value
                        const value = compiler.parse(member[1], {
                            ...options,
                            varName: member[0] })!.flat(Infinity).filter(compiler.isNotNull)
                        if (!value) return null
                        if (!value.length) return null
                        return [
                            `${options.varName}.${value})}`
                        ]
                    }).filter(compiler.isNotNull)
                    .flat(Infinity) as string[]

            const inline_values = compiler.emit("struct:inline-values", member, compiler, {})
            return [
                `${options.varName} : "${member.src.of}"${inline_values ? ` := ${inline_values}` : ''};`,
            ] as string[]
        })
        
        this.transform("struct:inline-values", (member, compiler, options) => {
            if (!member.src.interface) return null
            const values = [Object.values(member.src.interface)
                .map(x => {
                    if (compiler.isArray(x)) 
                        return compiler.emit("array:inline-values", x, compiler, {})
                    if (compiler.isUdtImpl(x))
                        return compiler.emit("struct:inline-values", x, compiler, {})
                    //@ts-ignore
                    if (typeof x.src["value"] === "undefined") return "()"
                    return compiler.parse(x, {
                        valuesOnly: true,
                        valueOrDefault: true,
                        inline: true
                    })
                })
            ].flat(Infinity).filter(compiler.isNotNull) as unknown as string[]
            if (!values.length) return null
            else return ["(", values, ")"].join("") as unknown as string[]
        })

        this.transform("local_ref", (ref, _compiler, _options) => {
            return [`#${ref.src.path!.map((x, i) => (i !== 0 && !x.startsWith("[")) ? `.${x}` : x).join("")}`]
        })

        this.transform("local_out", (ref, _compiler, _options) => {
            // We return path[0] with "" because this is the name of the global block where this reference belongs.
            // Despite path[0], the procedure is the same as the "local_ref" transformer.
            const path = ref.src.path!.map((x, i) => (i !== 0 && !x.startsWith("[")) ? `.${x}` : x)
            return [`"${path[0]}"${path.splice(1, path.length - 1).join("")}`]
        })

        this.transform("global_ref", (ref, _compiler, _options) => {
            // Returns a reference to a global block with ""
            return [`"${ref.src.path[0]}"`]
        })

        this.transform("instance", (member, compiler, options) => {
            return [`${options.varName} : "${member.src.of}"${options.inline ? "" : ";"}`]
        })

        this.transform("member", (member, compiler, options) => {
            return compiler.parse(member, options)
        })

        // Primitives

        this.transform("primitive", (member, compiler, options) => {
            // INT#5
            if (options.asTypedConstant)
                return compiler.emit(member.ty.toLowerCase() as any, member, compiler, { asTypedConstant: true })
            // `Var? : Int (;)`
            if (options.typesOnly)
                return [`${options.varName ? `${options.varName} : ` : ''}${member.ty}${options.inline ? "" : ";"}`]
            // `Var? := 5 (;)`
            // Returns if value is empty (default value)
            if (options.valuesOnly)
                if (typeof member.src.value !== "undefined") 
                    return [`${options.varName ? `${options.varName} := ` : ''}${compiler.emit(member.ty.toLowerCase() as any, member, compiler, {})}${options.inline ? "" : ";"}`]
                else if (options.valueOrDefault)
                    return [`${options.varName ? `${options.varName} := ` : ''}${compiler.emit(member.ty.toLowerCase() as any, member, compiler, {})}${options.inline ? "" : ";"}`]
                else return null
            // Full by default
            // `Var? : Int :=? 5? (;)`
            return [`${options.varName ? `${options.varName} : ` : ''}${member.ty}${member.src.value ? ` := ${compiler.emit(member.ty.toLowerCase() as any, member, compiler, {})}` : ''}${options.inline ? "" : ";"}`]
        })

        this.transform("bool", (ref, compiler, options) => {
            return [ref.src.value ? ref.src.value.toString() : "false"]
        });

        ["byte", "word", "dword", "lword"].forEach(type => {
            this.transform(type as "byte", (ref, _compiler, options) => {
                    const value = ref.src.value ? `16#${(typeof ref.src.value === "string" ? parseInt(ref.src.value) : ref.src.value).toString(16).toUpperCase()}` : 0
                    return [options.asTypedConstant ? `${ref.ty.toUpperCase()}#${value}` : value]
                }
            )
        });

        ["sint", "usint", "int", "uint", "dint", "udint", "lint", "ulint"].forEach(type => {
            this.transform(type as "sint", (ref, _compiler, options) => {
                    const value = ref.src.value ? ref.src.value.toString() : 0
                    return [options.asTypedConstant ? `${ref.ty.toUpperCase()}#${value}` : value]
                }
            )
        });

        ["real", "lreal"].forEach(type => {
            this.transform(type as "byte", (ref, _compiler, options) => {
                    const value = ref.src.value ? ref.src.value.toString() : 0.0
                    return [options.asTypedConstant ? `${ref.ty.toUpperCase()}#${value}` : value]
                }
            )
        });

        this.transform("char", (ref, _compiler, options) => {
                const value = ref.src.value ? `\'${ref.src.value}\'` : "\'\'"
                return [options.asTypedConstant ? `${ref.ty.toUpperCase()}#${value}` : value]
            }
        )

        this.transform("wchar", (ref, _compiler, options) => {
                const value = ref.src.value ? `\'${ref.src.value}\'` : "\'\'"
                return [`${ref.ty.toUpperCase()}#${value}`]
            }
        );

        this.transform("string", (ref, _compiler, options) => {
            const value = ref.src.value ? `\'${ref.src.value}\'` : "\'\'"
            return [options.asTypedConstant ? `${ref.ty.toUpperCase()}#${value}` : value]
        });

        this.transform("wstring", (ref, _compiler, options) => {
            const value = ref.src.value ? `\'${ref.src.value}\'` : "\'\'"
            return [`${ref.ty.toUpperCase()}#${value}`]
        });


        this.transform("date", (ref, compiler, options) => {
            const unix = new Date("1990-01-01")
            const value = ref.src.value ? ref.src.value : 0

            // Tomorrow ?
            unix.setDate(unix.getDate() + (value ? value + 1 : value))

            return [`D#${unix.toISOString().split('T')[0]}`]
        })

        this.transform("time", (ref, compiler, _options) => {
            const value = ref.src.value ? ref.src.value : 0
            const days = Math.trunc((value / 86_400_000) * (value < 0 ? -1 : 1))
            let remaining_ms = value % 86_400_000;

            let hours = Math.trunc((remaining_ms / 3_600_000) * (value < 0 ? -1 : 1))
            remaining_ms = remaining_ms % 3_600_000;

            let minutes = Math.trunc((remaining_ms / 60_000) * (value < 0 ? -1 : 1))
            remaining_ms = remaining_ms % 60_000;

            let seconds = Math.trunc((remaining_ms / 1000) * (value < 0 ? -1 : 1))
            let milliseconds = Math.trunc((remaining_ms % 1000) * (value < 0 ? -1 : 1))

            let time = ""
            if (milliseconds > 0) time += `${milliseconds}MS`
            if (seconds != 0) time = `${seconds}S${time.length ? '_' : ''}${time}`
            if (minutes != 0) time = `${minutes}M${time.length ? '_' : ''}${time}`
            if (hours != 0) time = `${hours}H${time.length ? '_' : ''}${time}`
            if (days != 0) time = `${days}D${time.length ? '_' : ''}${time}`

            return [`T#${value < 0 ? '-' : ''}${time}`]
        })

        this.transform("ltime", (ref, compiler, _options) => {
            const value = ref.src.value ? ref.src.value : 0
            const days = Math.trunc((value / 86_400_000_000_000) * (value < 0 ? -1 : 1))
            let remaining_ms = value % 86_400_000_000_000;

            let hours = Math.trunc((remaining_ms / 3_600_000_000_000) * (value < 0 ? -1 : 1))
            remaining_ms = remaining_ms % 3_600_000_000_000;

            let minutes = Math.trunc((remaining_ms / 60_000_000_000) * (value < 0 ? -1 : 1))
            remaining_ms = remaining_ms % 60_000_000_000;

            let seconds = Math.trunc((remaining_ms / 1_000_000_000) * (value < 0 ? -1 : 1))
            remaining_ms = remaining_ms % 1_000_000_000;

            let milliseconds = Math.trunc((remaining_ms / 1_000_000) * (value < 0 ? -1 : 1))
            remaining_ms = remaining_ms % 1_000_000;

            let microseconds = Math.trunc((remaining_ms / 1_000) * (value < 0 ? -1 : 1))
            remaining_ms = remaining_ms % 1_000;

            let nanoseconds = Math.trunc((remaining_ms % 1000) * (value < 0 ? -1 : 1))

            let time = ""
            if (nanoseconds > 0) time = `${nanoseconds}NS`
            if (microseconds != 0) time = `${microseconds}US${time.length ? '_' : ''}${time}`
            if (milliseconds > 0) time = `${milliseconds}MS${time.length ? '_' : ''}${time}`
            if (seconds != 0) time = `${seconds}S${time.length ? '_' : ''}${time}`
            if (minutes != 0) time = `${minutes}M${time.length ? '_' : ''}${time}`
            if (hours != 0) time = `${hours}H${time.length ? '_' : ''}${time}`
            if (days != 0) time = `${days}D${time.length ? '_' : ''}${time}`

            return [`LT#${value < 0 ? '-' : ''}${time}`]
        })

        this.transform("tod", (ref, compiler, _options) => {
            const value = ref.src.value ? ref.src.value : 0

            const hours = Math.trunc(value / 3_600_000);
            let remaining_ms = value % 3_600_000;

            const minutes = Math.trunc(remaining_ms / 60_000);
            remaining_ms = remaining_ms % 60_000;

            let seconds = Math.trunc(remaining_ms / 1000);
            let milliseconds = Math.trunc(remaining_ms % 1000);

            let tod = "TOD#"
            tod += `${hours ? hours.toString().padStart(2, "0") : "00"}:`
            tod += `${minutes ? minutes.toString().padStart(2, "0") : "00"}:`
            tod += `${seconds ? seconds.toString().padStart(2, "0") : "00"}`
            if (milliseconds != 0) tod += `.${milliseconds.toString().padStart(4, "0")}`
            return [tod]
        })

        this.transform("ltod", (ref, compiler, _options) => {
            const value = ref.src.value ? ref.src.value : 0

            const hours = Math.trunc((value / 3_600_000_000_000) * (value < 0 ? -1 : 1))
            let remaining_ms = value % 3_600_000_000_000;

            let minutes = Math.trunc((remaining_ms / 60_000_000_000) * (value < 0 ? -1 : 1))
            remaining_ms = remaining_ms % 60_000_000_000;

            let seconds = Math.trunc((remaining_ms / 1_000_000_000) * (value < 0 ? -1 : 1))
            let nanoseconds = Math.trunc((remaining_ms % 1_000_000_000) * (value < 0 ? -1 : 1))

            let date = "LTOD#"
            if (hours != 0) date += `:${hours}`
            if (minutes != 0) date += `:${minutes}`
            if (seconds != 0) date += `:${seconds}`
            if (nanoseconds > 0) date += `:${nanoseconds}`
            return [date]
        })
        
        this.transform("implicit", (implicit, compiler, options) => {
            //todo Is this enough ?
            return [implicit.src.value] as string[]
        })

        this.transform("access", (access, compiler, options) => {
            switch (access.src.type) {
                case "bit": return [`${this.cleanTransformer(compiler.parse(access.src.of, { inline: true }))}.${access.src.at}`]
                default: throw new Error("Only bit access is possible for now")
            }
        })
        
        // Operations

        this.transform("assign", (assign, compiler, options) => {
            const _assign = compiler.parse(assign.src.assign, { asTypedConstant: true })
            const assign_to = this.cleanTransformer(compiler.parse(assign.src.to, { inline: true }))
            
            return [this.getTrace(assign.src.trace), `${_assign} := ${assign_to}${ options.inline ? "": ";" }`]
        })

        this.transform("compare", (compare, compiler, options) => {
            // Compare a value / ref
            const _compare = compiler.parse(compare.src.compare, { asTypedConstant: true })
            const operator = compare.src.operator
            const _with = compiler.parse(compare.src.with)
            
            const cmp = [`${_compare} ${operator} ${_with}`]
            if (compare.src.cont_with) {
                return [this.getTrace(compare.src.trace), ...cmp, compare.src.cont!, ...compiler.parse(compare.src.cont_with)!]
            }
            return [this.getTrace(compare.src.trace), ...cmp]
        })

        this.transform("calc", (calc, compiler, _options) => {
            const _calc = compiler.parse(calc.src.calc, { asTypedConstant: true, inline: true })
            const operator = calc.src.operator
            const _with = compiler.parse(calc.src.with, { asTypedConstant: true, inline: true })
            
            return [
                this.getTrace(calc.src.trace), 
                `${_calc} ${operator} ${_with}`
            ]
        })

        this.transform("call", (call, compiler, _options) => {
            const st = `${compiler.parse(call.src.call)}(`
            const _interface = compiler.parse(call.src.interface)
            if (_interface)
                return [this.getTrace(call.src.trace), st, ..._interface, ");"]
            return [this.getTrace(call.src.trace), st, ");"]
        })
        
        // Loops
        this.transform("while", (_while, compiler, _options) => {
            // While comparison
            const while_cmp = this.cleanTransformer(compiler.parse(_while.src._while, { inline: true }))
            
            return [
                this.getTrace(_while.src.trace),
                `WHILE ${while_cmp} DO`,
                1,
                ...(_while.src._do ? (
                    this.cleanTransformer(_while.src._do.map(x => compiler.parse(x)))
                ) : ''),
                -1,
                ";", // Always add a comma at the end, just in case
                `END_WHILE;`
            ] as string[]
        })

        this.transform("for", (_for, compiler, _options) => {
            // For assign
            const for_assign = this.cleanTransformer(compiler.parse(_for.src._for))

            const to_assign = this.cleanTransformer(compiler.parse(_for.src.with))
            
            const to = this.cleanTransformer(compiler.parse(_for.src.to))
            
            // By is optional
            let by: TransformReturn | null = null
            if (_for.src.by)
              by = compiler.parse(_for.src.by)

            return [
                this.getTrace(_for.src.trace),
                `FOR ${for_assign} := ${to_assign} TO ${to}${by ? ` BY ${by}` : ''} DO`,
                1,
                ...(_for.src._do ? (
                    this.cleanTransformer(_for.src._do.map(x => compiler.parse(x)))
                    ) : ''),
                -1,
                ";", // Always add a comma at the end, just in case
                `END_FOR;`
            ] as string[]
        })
        
        this.transform("if", (_if, compiler, options) => {
            const if_first = compiler.parse(_if.src._if)!
                .flat(Infinity).filter(this.isNotNull)
                .join("")
            
            let _else = null
            if (_if.src._else.length)
                _else = 
                    [
                        'ELSE',
                        1,
                        this.cleanTransformer(_if.src._else.map(x => compiler.parse(x))),
                        -1
                    ]
            
            return [
                this.getTrace(_if.src.trace),
                `IF ${if_first} THEN`,
                1,
                ...(_if.src.then ? (
                    this.cleanTransformer(_if.src.then.map(x => compiler.parse(x)))
                    ) : ''),
                -1,
                _else,
                `;`,// Always add a comma at the end, just in case
                "END_IF;"
            ]
        });
        
        // One param operations
        ["sin", "cos", "tan", "asin", "acos", "atan", "sqrt", "sqr", "exp", "ln", "ceil", "round", "floor", "swap"].forEach(x => {
            this.transform(x as "cos", (math, compiler, options) => {
                //@ts-expect-error x can't be used to index...
                const tr = compiler.parse(math.src[x], { inline: true, valuesOnly: true })
                return [`${x.toUpperCase()}(${tr})${options.inline ? '' : ';'}`]
            })
        });
        
        // Shift
        ["shl", "shr"].forEach(x => {
            this.transform(x as "shl", (math, compiler, options) => {
                //@ts-expect-error x can't be used to index...
                const firstParam = compiler.parse(math.src[x], { inline: true, valuesOnly: true, asTypedConstant: true })
                //@ts-expect-error x can't be used to index...
                const secondParam = compiler.parse(math.src[`${x}_with`], { inline: true, valuesOnly: true })
                return [`${x.toUpperCase()}(IN := ${firstParam}, N := ${secondParam})${options.inline ? '' : ';'}`]
            })
        });

        // Rotate
        ["rol", "ror"].forEach(x => {
            this.transform(x as "rol", (math, compiler, options) => {
                const firstParam = compiler.parse(math.src["rotate"], { inline: true, valuesOnly: true, asTypedConstant: true })
                const secondParam = compiler.parse(math.src["rotate_with"], { inline: true, valuesOnly: true })
                return [`${x.toUpperCase()}(IN := ${firstParam}, N := ${secondParam})${options.inline ? '' : ';'}`]
            })
        });
    }

    /*
     * Add an indent char at each line.
     * 
     * The number of indentations is defined by this.Indentation
     * 
     * Everytime the compiler meets a number, it will increment this.Indentation.
     */
    private applyIndent(value: string | number) {
        if (typeof value === "number") {
            this.Indentation += value
            return null
        }

        let indent = ""
        for (let i = 0; i < this.Indentation; i++)
            indent += "\t"
        return `${indent}${value}`
    }

    private getTrace(trace?: Trace) {
        if (!trace || !this.EmitTrace) return null
        else return `// ${trace?.file}:${trace?.line}:${trace?.column}`
    }

    private capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}