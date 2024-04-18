import {Compiler} from "@/src/source/compiler.js";
import {describe, expect, it} from "vitest";
import {Bool, Int} from "@/src/types/primitives/index.js"
import {ExposeUdt} from "@/src/pou/index.js";
const TUdt = ExposeUdt()

const compiler = new Compiler()
compiler.useDefaultTransformers()

describe("Compiler", function () {
    it("Udt [Nested Udt + nested array]", () => {
        const udt = compiler.emit("udt", {
            "ty": "udt",
            "src": {
                "name": "MyUdt",
                "interface": {
                    "MyVar": {
                        "ty": "Bool",
                        "src": {}
                    },
                    "MyVar2": {
                        "ty": "Bool",
                        "src": {}
                    },
                    "AnArray": {
                        "ty": "array",
                        "src": {
                            "length": 2,
                            "of": {
                                "ty": "Int",
                                "src": {}
                            },
                            "values": {
                                "ty": "array_values",
                                "src": []
                            }
                        }
                    },
                    "Nested": {
                        "ty": "udt_impl",
                        "src": {
                            "of": "MyUdt2",
                            "interface": {
                                "AnotherArray": {
                                    "ty": "array",
                                    "src": {
                                        "length": 1,
                                        "of": {
                                            "ty": "Int",
                                            "src": {}
                                        },
                                        "values": {
                                            "ty": "array_values",
                                            "src": []
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }, compiler, {
            varName: "Test"
        })

        expect(udt).toMatchObject([
            "TYPE \"\"",
            1,
            "STRUCT",
            1,
            "MyVar : Bool;",
            -1,
            1,
            "MyVar2 : Bool;",
            -1,
            1,
            "AnArray : Array[0..2] of Int;",
            -1,
            1,
            "Nested : \"MyUdt2\";",
            -1,
            "END_STRUCT;",
            -1,
            "",
            "END_TYPE"
        ])
    })
    it("Udt [Nested Udt + nested array [30]]", () => {
        const udt = compiler.emit("udt", {
            "ty": "udt",
            "src": {
                "name": "MyUdt",
                "interface": {
                    "MyVar": {
                        "ty": "Bool",
                        "src": {}
                    },
                    "MyVar2": {
                        "ty": "Bool",
                        "src": {}
                    },
                    "AnArray": {
                        "ty": "array",
                        "src": {
                            "length": 2,
                            "of": {
                                "ty": "Int",
                                "src": {}
                            },
                            "values": {
                                "ty": "array_values",
                                "src": []
                            }
                        }
                    },
                    "Nested": {
                        "ty": "udt_impl",
                        "src": {
                            "of": "MyUdt2",
                            "interface": {
                                "AnotherArray": {
                                    "ty": "array",
                                    "src": {
                                        "length": 1,
                                        "of": {
                                            "ty": "Int",
                                            "src": {}
                                        },
                                        "values": {
                                            "ty": "array_values",
                                            "src": [
                                                {
                                                    "target": {
                                                        "ty": "local",
                                                        "src": {
                                                            "path": [
                                                                "0"
                                                            ]
                                                        }
                                                    },
                                                    "value": {
                                                        "ty": "Implicit",
                                                        "src": {
                                                            "value": 30
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }, compiler, {
            varName: "Test"
        })

        expect(udt).toMatchObject([
            "TYPE \"\"",
            1,
            "STRUCT",
            1,
            "MyVar : Bool;",
            -1,
            1,
            "MyVar2 : Bool;",
            -1,
            1,
            "AnArray : Array[0..2] of Int;",
            -1,
            1,
            "Nested : \"MyUdt2\" := ([30]);",
            -1,
            "END_STRUCT;",
            -1,
            "",
            "END_TYPE"
        ])
    })
})