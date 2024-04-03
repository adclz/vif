import {Compiler} from "@vifjs/language-builder/source";
import {fb_ast, fc_ast, global_db_ast, instance_db_ast} from "@vifjs/language-builder/pou";

const Compiler1200 = new Compiler()
Compiler1200.useDefaultTransformers()

const insert = function<T>(array: T[], index: number, ...items: T[] ) {
    array.splice( index, 0, ...items )
    return array
};

const ParseBlockAttributes = (block: fb_ast | fc_ast | instance_db_ast | global_db_ast, prior: (string | number)[] | null) => {
    if (!prior) return prior
    const attributes = {version: 0.1, s7oa: true}
    if (!block.src.attributes) return insert(prior, 1,
        `{ S7_Optimized_Access := '${attributes.s7oa ? 'TRUE' : 'FALSE'}' }`,
        `VERSION : ${attributes.version}`
    )
    attributes.s7oa = block.src.attributes.s7oa ?? false
    attributes.version = block.src.attributes.version ?? 0.1
    return insert(prior, 1,
        `{ S7_Optimized_Access := '${attributes.s7oa ? 'TRUE' : 'FALSE'}' }`,
        `VERSION : ${attributes.version}`
    )
}

Compiler1200.transform("access", (access, compiler, options) => {
    switch (access.src.type) {
        case "bit": return [`${compiler.cleanTransformer(compiler.parse(access.src.of, { inline: true }))}.%X${access.src.at}`]
        default: throw new Error("Only bit access is possible for now")
    }
})

Compiler1200.afterTransform("fb", (fb, compiler, options, prior) => {
    return ParseBlockAttributes(fb, prior)
})

Compiler1200.afterTransform("fc", (fb, compiler, options, prior) => {
    return ParseBlockAttributes(fb, prior)
})

Compiler1200.afterTransform("instance_db", (fb, compiler, options, prior) => {
    return ParseBlockAttributes(fb, prior)
})

Compiler1200.afterTransform("global_db", (fb, compiler, options, prior) => {
    return ParseBlockAttributes(fb, prior)
})

Compiler1200.afterTransform("udt_impl", (udt_impl, compiler, options, prior) => {
    if (!prior) return prior
    const varName = options.varName ? `${options.varName}` : ''
    switch (udt_impl.src.of) {
        case "IEC_TIMER": return [`${varName ? `${varName} ` : ''}{InstructionName := 'IEC_TIMER'; LibVersion := '1.0'; S7_SetPoint := 'False'} : IEC_TIMER`]
        case "IEC_LTIMER": return [`${varName ? `${varName} ` : ''}{InstructionName := 'IEC_LTIMER'; LibVersion := '1.0'; S7_SetPoint := 'False'} : IEC_LTIMER`]
        case "IEC_COUNTER": return [`${varName ? `${varName} ` : ''}{InstructionName := 'IEC_COUNTER'; LibVersion := '1.0'; S7_SetPoint := 'False'} : IEC_COUNTER`]
        case "IEC_SCOUNTER": return [`${varName ? `${varName} ` : ''}{InstructionName := 'IEC_SCOUNTER'; LibVersion := '1.0'; S7_SetPoint := 'False'} : IEC_SCOUNTER`]
        case "IEC_DCOUNTER": return [`${varName ? `${varName} ` : ''}{InstructionName := 'IEC_DCOUNTER'; LibVersion := '1.0'; S7_SetPoint := 'False'} : IEC_DCOUNTER`]
        case "IEC_USCOUNTER": return [`${varName ? `${varName} ` : ''}{InstructionName := 'IEC_USCOUNTER'; LibVersion := '1.0'; S7_SetPoint := 'False'} : IEC_USCOUNTER`]
        case "IEC_UCOUNTER": return [`${varName ? `${varName} ` : ''}{InstructionName := 'IEC_UCOUNTER'; LibVersion := '1.0'; S7_SetPoint := 'False'} : IEC_UCOUNTER`]
        case "IEC_UDCOUNTER": return [`${varName ? `${varName} ` : ''}{InstructionName := 'IEC_UDCOUNTER'; LibVersion := '1.0'; S7_SetPoint := 'False'} : IEC_UDCOUNTER`]
        case "IEC_LCOUNTER": return [`${varName ? `${varName} ` : ''}{InstructionName := 'IEC_LCOUNTER'; LibVersion := '1.0'; S7_SetPoint := 'False'} : IEC_LCOUNTER`]
        case "IEC_ULCOUNTER": return [`${varName ? `${varName} ` : ''}{InstructionName := 'IEC_LTIMER'; LibVersion := '1.0'; S7_SetPoint := 'False'} : IEC_ULCOUNTER`]
        default: return prior
    }
})

Compiler1200.afterTransform("instance", (udt_impl, compiler, options, prior) => {
    if (!prior) return prior
    const varName = options.varName ? `${options.varName}` : ''
    switch (udt_impl.src.of) {
        case "F_TRIG": return [`${varName ? `${varName} ` : ''}{InstructionName := 'F_TRIG'; LibVersion := '1.0';} : F_TRIG`]
        case "R_TRIG": return [`${varName ? `${varName} ` : ''}{InstructionName := 'R_TRIG'; LibVersion := '1.0';} : R_TRIG`]
       default: return prior
    }
})

Compiler1200.transform("resolve_template", (template, compiler, options) => {
    let call_interface = template.src.call_interface
    // Replace QU and QD outputs with Q (Swodt)
    switch (template.src.of) {
        case "CTD": delete Object.assign(call_interface.src["output"], {Q: call_interface.src["output"]["QD"] })["QD"];break
        case "CTU": delete Object.assign(call_interface.src["output"], {Q: call_interface.src["output"]["QU"] })["QU"];break
    }
    
    const _interface = compiler.parse(call_interface, options)
    const h = [
        `${compiler.parse(template.src.inner)}.${template.src.of}(`,
        ..._interface,
        ");"
    ]
    return h
})

export default Compiler1200