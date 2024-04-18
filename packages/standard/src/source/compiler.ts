import {Compiler} from "@vifjs/language-builder/source";
import {fb_ast, fc_ast, global_db_ast, instance_db_ast} from "@vifjs/language-builder/pou";

const StdCompiler = new Compiler()
StdCompiler.useDefaultTransformers()

StdCompiler.afterTransform("udt_impl", (udt_impl, compiler, options, prior) => {
    if (!prior) return prior
    const varName = options.varName ? `${options.varName}` : ''
    switch (udt_impl.src.of) {
        case "CTDInstance": return [`${varName ? `${varName} ` : ''}: CTD;`]
        case "CTUInstance": return [`${varName ? `${varName} ` : ''}: CTU;`]
        case "TPInstance": return [`${varName ? `${varName} ` : ''}: TP;`]
        case "TOFInstance": return [`${varName ? `${varName} ` : ''}: TOF;`]
        case "TONInstance": return [`${varName ? `${varName} ` : ''}: TON;`]
        default: return prior
    }
})

StdCompiler.transform("local_ref", (ref, _compiler, _options) => {
    return [`${ref.src.path!.map((x, i) => (i !== 0 && !x.startsWith("[")) ? `.${x}` : x).join("")}`]
})

StdCompiler.transform("resolve_template", (template, compiler, options) => {
    let call_interface = template.src.call_interface
    
    const _interface = compiler.parse(call_interface, options)
    const h = [
        `${compiler.parse(template.src.inner)}(`,
        ..._interface,
        ");"
    ]
    return h
})

StdCompiler.transform("access", (access, compiler, options) => {
    switch (access.src.type) {
        case "bit": return [`${compiler.cleanTransformer(compiler.parse(access.src.of, { inline: true }))}.${access.src.at}`]
        default: throw new Error("Only bit access is possible for now")
    }
})

export default StdCompiler