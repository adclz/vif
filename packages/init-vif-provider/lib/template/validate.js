const validatePackageJson = (packageJson) => {
    const exports = packageJson.exports
    if (!exports) throw new Error("No exports found in package.json")

    if (!packageJson["type"]) throw new Error("No type found in package.json")
    const source = exports["./source"]
    if (!source) throw new Error("No source export found in package.json")
    const compiler = exports["./compiler"]
    if (!compiler) throw new Error("No compiler export found in package.json")
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