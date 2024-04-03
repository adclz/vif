import {Compiler} from "@/src/source/index.js";
import {describe, expect, it} from "vitest";
import {Bool} from "@/src/types/primitives/index.js"
import {ExposeUdt} from "@/src/pou/index.js";
const TUdt = ExposeUdt()

const compiler = new Compiler()
compiler.useDefaultTransformers()

describe("Compiler", function () {
    describe("While operation", () => {

        it("", () => {
            const array = compiler.emit("while",
                {
                    ty: "while",
                    src: {
                        _while: {
                            ty: "compare",
                            src: {
                                compare: {
                                    ty: "Int",
                                    src: {
                                        value: 1
                                    }
                                },
                                operator: "=",
                                with: {
                                    ty: "Implicit",
                                    src: {
                                        value: 5
                                    }
                                }
                            }
                        }, _do: [
                            {
                                "ty": "asg",
                                "src": {
                                    "assign": {
                                        "ty": "local",
                                        "src": {
                                            "path": [
                                                "i"
                                            ]
                                        }
                                    },
                                    "to": {
                                        "ty": "calc",
                                        "src": {
                                            "calc": {
                                                "ty": "local",
                                                "src": {
                                                    "path": [
                                                        "i"
                                                    ]
                                                }
                                            },
                                            "with": {
                                                "ty": "Implicit",
                                                "src": {
                                                    "value": 1
                                                }
                                            },
                                            "operator": "+"
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                compiler, {})
            console.log(array)
        })
    })
})