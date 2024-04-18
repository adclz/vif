import {readFileSync} from "node:fs";

const validatePackageJson = (packageJson) => {
    const exports = packageJson.exports
    if (!exports) throw new Error("No exports found in package.json")

    if (!packageJson["type"]) throw new Error("No type found in package.json")
    const source = exports["./source"]
    if (!source) throw new Error("No ./source export found in package.json")
    
    const compiler = exports["./compiler"]
    if (!compiler) throw new Error("No ./compiler export found in package.json")

    const pou = exports["./pou"]
    if (!pou) throw new Error("No ./pou export found in package.json")

    const primitives = exports["./types/primitives"]
    if (!primitives) throw new Error("No ./types/primitives export found in package.json")

    const complex = exports["./types/complex"]
    if (!complex) throw new Error("No ./types/complex export found in package.json")

    const utilities = exports["./types/utilities"]
    if (!utilities) throw new Error("No ./types/utilities export found in package.json")

    const unit = exports["./operations/unit"]
    if (!unit) throw new Error("No ./operations/unit export found in package.json")

    const pc = exports["./operations/program-control"]
    if (!pc) throw new Error("No ./operations/program-control export found in package.json")

    const basics = exports["./operations/basics"]
    if (!basics) throw new Error("No ./operations/basics export found in package.json")

    const math = exports["./operations/math"]
    if (!math) throw new Error("No ./operations/math export found in package.json")

    const binary = exports["./operations/binary"]
    if (!binary) throw new Error("No ./operations/binary export found in package.json")
}

const validateTsConfig = (tsConfig) => {
    const compilerOptions = tsConfig.compilerOptions
    if (!compilerOptions) throw new Error("No compilerOptions found in tsconfig.json")

    const target = compilerOptions["target"]
    if (!target) throw new Error("No compilerOptions target found in tsconfig.json")
    if (target.toUpperCase() !== "ESNext".toUpperCase()) throw new Error("Invalid compilerOptions target in tsconfig.json: Only ESNext allowed")

    const module = compilerOptions["module"]
    if (!module) throw new Error("No compilerOptions module found in tsconfig.json")
    if (module.toUpperCase() !== "NodeNext".toUpperCase()) throw new Error("Invalid compilerOptions module in tsconfig.json: Only NodeNext allowed")

    const moduleResolution = compilerOptions["moduleResolution"]
    if (!moduleResolution) throw new Error("No compilerOptions moduleResolution found in tsconfig.json")
    if (moduleResolution.toUpperCase() !== "NodeNext".toUpperCase() || moduleResolution.toUpperCase() !== "Bundler".toUpperCase())
        throw new Error("Invalid compilerOptions moduleResolution in tsconfig.json: Only NodeNext or Bundler allowed")
}

const validate = () => {
    validatePackageJson(JSON.parse(readFileSync("./package.json", {encoding: "utf8"})));
    validateTsConfig(JSON.parse(readFileSync("./tsconfig.json", {encoding: "utf8"})));
}

export default validate