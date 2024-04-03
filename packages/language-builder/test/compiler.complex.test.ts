import {Compiler} from "@/src/source/index.js";
import {describe, expect, it} from "vitest";
import {Bool, Int} from "@/src/types/primitives/index.js"
import {ExposeUdt} from "@/src/pou/index.js";
const TUdt = ExposeUdt()

const compiler = new Compiler()
compiler.useDefaultTransformers()

describe("Compiler", function () {
    describe("Compiler complex types transformers", () => {
        describe("Array", () => {
            it("Array of 2 booleans", () => {
                const array = compiler.emit("array", {ty: "array", src: {length: 2, of: {ty: "Bool", src: {}}}},
                    compiler, {
                        varName: "Test"
                    })
                expect(array).toMatchObject(["Test : Array[0..2] of Bool;"])
            })
            it("Array of 2 booleans [Inlined Values (2 true)]", () => {
                const array = compiler.emit("array", {
                        ty: "array", src: {
                            length: 2, of: {ty: "Bool", src: {}},
                            values: {
                                ty: "array_values",
                                src: [
                                    {
                                        target: {
                                            ty: "local",
                                            src: {
                                                path: ["[0]"]
                                            }
                                        },
                                        value: {
                                            ty: "Bool",
                                            src: {
                                                value: true
                                            }
                                        }
                                    },
                                    {
                                        target: {
                                            ty: "local",
                                            src: {
                                                path: ["[1]"]
                                            }
                                        },
                                        value: {
                                            ty: "Bool",
                                            src: {
                                                value: true
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    compiler, {
                        varName: "Test",
                    })
                expect(array).toMatchObject(["Test : Array[0..2] of Bool := [2(true)];"])
            })
            it("Array of 2 booleans [Inlined Values (1 true, 1 false)]", () => {
                const array = compiler.emit("array", {
                        ty: "array", src: {
                            length: 2, of: {ty: "Bool", src: {}},
                            values: {
                                ty: "array_values",
                                src: [
                                    {
                                        target: {
                                            ty: "local",
                                            src: {
                                                path: ["[0]"]
                                            }
                                        },
                                        value: {
                                            ty: "Bool",
                                            src: {
                                                value: true
                                            }
                                        }
                                    },
                                    {
                                        target: {
                                            ty: "local",
                                            src: {
                                                path: ["[1]"]
                                            }
                                        },
                                        value: {
                                            ty: "Bool",
                                            src: {
                                                value: false
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    compiler, {
                        varName: "Test",
                    })
                expect(array).toMatchObject(["Test : Array[0..2] of Bool := [true,false];"])
            })
            it("Array of 2 booleans [Inlined Values (1 false, 1 true, 1 false, 1 true, 1 false, 1 true)]", () => {
                const array = compiler.emit("array", {
                        ty: "array", src: {
                            "length": 5,
                            "of": {
                                "ty": "Bool",
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
                                                    "[1]"
                                                ]
                                            }
                                        },
                                        "value": {
                                            "ty": "Implicit",
                                            "src": {
                                                "value": true
                                            }
                                        }
                                    },
                                    {
                                        "target": {
                                            "ty": "local",
                                            "src": {
                                                "path": [
                                                    "[3]"
                                                ]
                                            }
                                        },
                                        "value": {
                                            "ty": "Implicit",
                                            "src": {
                                                "value": true
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    compiler, {
                        varName: "Test",
                    })
                expect(array).toMatchObject(["Test : Array[0..5] of Bool := [false,true,false,true,false];"])
            })

            it("Array of 2 booleans [Inlined Values (No default)]", () => {
                const array = compiler.emit("array", {
                        ty: "array", src: {
                            length: 2, of: {ty: "Bool", src: {}},
                            values: {
                                ty: "array_values",
                                src: []
                            }
                        }
                    },
                    compiler, {
                        varName: "Test",
                    })
                expect(array).toMatchObject(["Test : Array[0..2] of Bool;"])
            })

            it("Array of 2 booleans [Values only]", () => {
                const array = compiler.emit("array", {
                        ty: "array", src: {
                            length: 2, of: {ty: "Bool", src: {}},
                            values: {
                                ty: "array_values",
                                src: [
                                    {
                                        target: {
                                            ty: "local",
                                            src: {
                                                path: ["Test", "[0]"]
                                            }
                                        },
                                        value: {
                                            ty: "Bool",
                                            src: {
                                                value: true
                                            }
                                        }
                                    },
                                    {
                                        target: {
                                            ty: "local",
                                            src: {
                                                path: ["Test", "[1]"]
                                            }
                                        },
                                        value: {
                                            ty: "Bool",
                                            src: {
                                                value: true
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    compiler, {
                        varName: "Test",
                        valuesOnly: true,
                    })
                expect(array).toMatchObject([
                    "#Test[0] := true;",
                    "#Test[1] := true;"
                ])
            })
        })
        describe("Struct", () => {
            it("Struct with 2 bools", () => {
                const array = compiler.emit("struct", {ty: "Struct", src: {
                    interface: {
                        "true_bool": {
                            ty: "Bool",
                            src: {
                                value: "true"
                            }
                        },
                        "false_bool": {
                            ty: "Bool",
                            src: {}
                        }
                    }}},
                    compiler, {
                        varName: "Test"
                    })
                expect(array).toMatchObject(
                    [
                        "Test : Struct",
                        1,
                        "true_bool : Bool := true;",
                        "false_bool : Bool;",
                        -1,
                        "END_STRUCT;"
                    ]
                )
            })
            it("Struct with nested struct", () => {
                const array = compiler.emit("struct", {ty: "Struct", src: {
                     interface: {
                         "nested_struct": {
                             ty: "Struct", 
                             src: {
                                 interface: {
                                     "nested_bool": {
                                         ty: "Bool",
                                         src: {
                                             value: "true"
                                         }
                                     }
                                 }
                             }
                             },
                     }}},
                    compiler, {
                        varName: "Test"
                    })
                expect(array).toMatchObject(
                    [
                        "Test : Struct",
                        1,
                        "nested_struct : Struct",
                        1,
                        "nested_bool : Bool := true;",
                        -1,
                        "END_STRUCT;",
                        -1,
                        "END_STRUCT;"
                    ]
                )
            })
            it("Struct with 2 bools [Inline Values (2 true)]", () => {
                const array = compiler.emit("struct", {ty: "Struct", src: {
                            interface: {
                                "true_bool": {
                                    ty: "Bool",
                                    src: {
                                        value: "true"
                                    }
                                },
                                "false_bool": {
                                    ty: "Bool",
                                    src: {
                                        value: "true"
                                    }
                                }
                            }}},
                    compiler, {
                        varName: "Test",
                        valuesOnly: true
                    })
                expect(array).toMatchObject([
                    "Test.true_bool := true;",
                    "Test.false_bool := true;"
                ])
            })
            it("Struct with 2 bools [Inline Values (1 true, 1 false)]", () => {
                const array = compiler.emit("struct", {ty: "Struct", src: {
                            interface: {
                                "true_bool": {
                                    ty: "Bool",
                                    src: {
                                        value: "true"
                                    }
                                },
                                "false_bool": {
                                    ty: "Bool",
                                    src: {
                                        value: "false"
                                    }
                                }
                            }}},
                    compiler, {
                        varName: "Test",
                        valuesOnly: true
                    })
                expect(array).toMatchObject([
                    "Test.true_bool := true;",
                    "Test.false_bool := false;"
                ])
            })
            it("Struct with 2 bools [Inline Values (no default)]", () => {
                const array = compiler.emit("struct", {ty: "Struct", src: {
                            interface: {
                                "true_bool": {
                                    ty: "Bool",
                                    src: {}
                                },
                                "false_bool": {
                                    ty: "Bool",
                                    src: {}
                                }
                            }}},
                    compiler, {
                        varName: "Test",
                        valuesOnly: true
                    })
                expect(array).toMatchObject([])
            })
        })
        describe("udt_impl", () => {
            it("Udt_impl (true, false)", () => {
                const udtImpl =  compiler.emit("udt_impl", {
                    ty: "udt_impl",
                    src: {
                        of: "AnyUdt",
                        interface: {
                            "MyVar": {
                                "ty": "Bool",
                                "src": {
                                    "value": true
                                }
                            },
                            "MyVar2": {
                                "ty": "Bool",
                                "src": {
                                    "value": false
                                }
                            }
                        }
                    }
                }, compiler,{
                    varName: "Test"
                })

                expect(udtImpl).toMatchObject(["Test : \"AnyUdt\" := (true,false);"])
            })
            it("Udt_impl [Nested Array of Int with default values [30, 50]]", () => {
                const udtImpl =  compiler.emit("udt_impl", {
                    ty: "udt_impl",
                    src: {
                        of: "AnyUdt",
                        interface: {
                            "AnArray": {
                                "ty": "array",
                                "src": {
                                    "length": 2,
                                    "of": {
                                        "ty": "Int",
                                        "src": {
                                            "value": 30
                                        }
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
                                            },
                                            {
                                                "target": {
                                                    "ty": "local",
                                                    "src": {
                                                        "path": [
                                                            "1"
                                                        ]
                                                    }
                                                },
                                                "value": {
                                                    "ty": "Implicit",
                                                    "src": {
                                                        "value": 50
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }, compiler,{
                    varName: "Test"
                })

                expect(udtImpl).toMatchObject(["Test : \"AnyUdt\" := ([30,50]);"])
            })
            it("Udt_impl [Nested Udt + nested array]", () => {
                const udtImpl =  compiler.emit("udt_impl", {
                    "ty": "udt_impl",
                    "src": {
                        "of": "MyUdt",
                        "interface": {
                            "MyVar": {
                                "ty": "Bool",
                                "src": {
                                    "value": true
                                }
                            },
                            "MyVar2": {
                                "ty": "Bool",
                                "src": {
                                    "value": true
                                }
                            },
                            "AnArray": {
                                "ty": "array",
                                "src": {
                                    "length": 2,
                                    "of": {
                                        "ty": "Int",
                                        "src": {
                                            "value": 30
                                        }
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
                                            },
                                            {
                                                "target": {
                                                    "ty": "local",
                                                    "src": {
                                                        "path": [
                                                            "1"
                                                        ]
                                                    }
                                                },
                                                "value": {
                                                    "ty": "Implicit",
                                                    "src": {
                                                        "value": 50
                                                    }
                                                }
                                            }
                                        ]
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
                                                    "src": {
                                                        "value": 60
                                                    }
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
                                                                    "value": 60
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
                }, compiler,{
                    varName: "Test"
                })

                expect(udtImpl).toMatchObject(["Test : \"MyUdt\" := (true,true,[30,50],([60]));"])
            })

        })
    })
})