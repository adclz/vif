import {describe, expect, it} from "vitest";
import {Bool, Int} from "@/src/types/primitives/index.js";
import {Ob, ExposeFb, ExposeFc, ExposeUdt, ExposeInstanceDb, ExposeGlobalDb} from "@/src/pou/index.js";
import {ExposeSource} from "@/src/source/source.js";
import {Compiler} from "@/src/source/compiler.js";
import {Provider} from "@/src/source/provider.js";
import {Assign} from "@/src/operations/basics/index.js";
import {Call} from "@/src/operations/basics/index.js";
import {ExposeArray, ExposeStruct} from "@/src/types/complex/index.js";
import {UnitTest} from "@/src/operations/unit/index.js";

const TStruct = ExposeStruct()
const TArray = ExposeArray()
const TFb = ExposeFb()
const TFc = ExposeFc()
const TUdt = ExposeUdt()
const TInstanceDb = ExposeInstanceDb()
const TGlobalDb = ExposeGlobalDb()
const comp = new Compiler()
comp.useDefaultTransformers()
const CreateSource = ExposeSource(new Provider({}), comp)

describe("Pou", function () {
    describe("Ob", () => {
        it("Ob interface", () => {
            const TOb = new Ob({
                interface: {
                    temp: {
                        test: new Bool(true)
                    },
                    constant: {
                        test2: new Bool(true)
                    }
                }})
            // Ob interface can't be accessed from the outside
            expect(TOb.temp.test.value).to.be.equal(true)
            expect(TOb.constant.test2.value).to.be.equal(true)
        })
    })
    describe("Fb", () => {
        it("Fb interface", () => {
            const TOb = new TFb({
                interface: {
                temp: {
                    test: new Bool(true)
                },
                constant: {
                    test2: new Bool(true)
                }
            }})
            expect(TOb.temp.test.value).to.be.equal(true)
            expect(TOb.constant.test2.value).to.be.equal(true)
        });
    })
    describe("Fc", () => {
        it("Fc interface", () => {
            const TOb = new TFc({
                interface: {
                temp: {
                    test: new Bool(true)
                },
                constant: {
                    test2: new Bool(true)
                }
            }})
            expect(TOb.temp!.test.value).to.be.equal(true)
            expect(TOb.constant!.test2.value).to.be.equal(true)
        });
    })
    describe("Fc return", () => {
        it("Fc interface", () => {
            const TOb = new TFc({
                interface: {
                temp: {
                    test: new Bool(true)
                },
                constant: {
                    test2: new Bool(true)
                }, 
                    return: new Bool(true),
            },
                body() {
                    return [
                        new Assign(this.temp.test, true),
                        new Assign(this.return, true),
                    ]
                },
            })
            expect(TOb.temp!.test.value).to.be.equal(true)
            expect(TOb.constant!.test2.value).to.be.equal(true)
            expect(TOb.return!.value).to.be.equal(true)
            
            const Source = CreateSource({
                blocks: {
                    Tob: TOb
                }
            })
        });
    })
    describe("Udt", () => {
        it("Udt interface", () => {
            const Udt = new TUdt({
                test: new Bool(true),
                test2: new Bool(true)
            })
            expect(Udt.test.value).to.be.equal(true)
            expect(Udt.test2.value).to.be.equal(true)
        })
        it("Udt with array", () => {
            const MyUdt = new TUdt({
                MyVar: new Bool(),
                MyVar2: new Int(10),
                AnArray: new TArray.Array_([new Int(10), new Int(10)])
            });

            const fb = new TFb({
                interface: {
                    static: {
                        MyGlobalType: MyUdt.implement({
                            MyVar: new Bool(true),
                            MyVar2: new Bool(true),
                            AnArray: new TArray.Array_([new Int(50), new Int(50)])
                        })
                    }
                },
                body() {
                    return []
                }
            });

            const fbInstance = new TInstanceDb(fb);

            const source = CreateSource({
                blocks:
                    {
                        "UdtFb": fb,
                        "UdtFb_Instance": fbInstance,
                        "MyUdt": MyUdt
                    },
            })
            
        })
    })
    describe("GlobalDb of Udt", () => {
        it("Udt interface", () => {
            const Udt = new TUdt({
                test: new Bool(true),
                nested: new TStruct({
                    test2: new Int()
                })
            })
            
            const Idb = new TGlobalDb(Udt)
            
            expect(Idb.static.test.value).to.be.equal(true)
            expect(Idb.static.nested.test2).to.not.be.undefined

            const fc = new TFc({
                body() {
                    return [
                        new Assign(Idb.static.nested.test2, 5)
                    ]
                },
            })

            const source = CreateSource({
                blocks: {
                    "Test_Fc": fc,
                    "Idb": Idb,
                    "AnUdt": Udt,
                    "Main": new Ob({
                        body() {
                            return [new Assign(Idb.static.test, true)]
                        },
                    })
                }
            })

            const program = source.compileProgram()
            expect(program["file:///AnUdt"]).toMatchObject([
                "TYPE \"AnUdt\"",
                "	STRUCT",
                "		test : Bool := true;",
                "		nested : Struct",
                "			test2 : Int;",
                "		END_STRUCT;",
                "	END_STRUCT;",
                "",
                "END_TYPE",
            ])

            expect(program["file:///Idb"]).toMatchObject([
                "DATA_BLOCK \"Idb\"",
                "	VAR",
                "		test : Bool;",
                "		nested : Struct",
                "			test2 : Int;",
                "		END_STRUCT;",
                "	END_VAR",
                "",
                "BEGIN",
                "	test := true;",
                "",
                "END_DATA_BLOCK",
                "",
            ])

            expect(program["file:///Test_Fc"]).toMatchObject([
                "FUNCTION \"Test_Fc\" : Void",
                "BEGIN",
                "	\"Idb\".nested.test2 := 5;",
                "",
                "END_FUNCTION",
            ])
        })
    })
    describe("Udt Implementation & nested array of udt", () => {
        const MyUdt2 = new TUdt({
            Nested: new Bool(true)
        });

        const MyUdt = new TUdt({
            AnArray: new TArray.Array_([MyUdt2.self()])
        });

        const fb = new TFb({
            interface: {
                static: {
                    MyGlobalType: MyUdt.implement({
                        AnArray: new TArray.Array_([MyUdt2.implement({
                            Nested: new Bool(true)
                        })]),
                    })
                }
            },
            body() {
                return [
                    new UnitTest("NestedBool should be true", this.static.MyGlobalType.AnArray[0].Nested, "=", true)
                ]
            }
        });

        const fbInstance = new TInstanceDb(fb);

        const source = CreateSource({
            blocks:
                {
                    "Main": new Ob(
                        {
                            body() {
                                return [new Call(fbInstance, {})]
                            }
                        }
                    ),
                    "UdtFb": fb,
                    "UdtFb_Instance": fbInstance,
                    "MyUdt": MyUdt,
                    "MyUdt2": MyUdt2
                }
        })

        const program = source.compileProgram()

        it("Compiler Output", () => {
            expect(program["file:///MyUdt"]).toMatchObject([
                "TYPE \"MyUdt\"",
                "	STRUCT",
                "		AnArray : Array[0..1] of \"MyUdt2\";",
                "	END_STRUCT;",
                "",
                "END_TYPE",
            ])

            expect(program["file:///MyUdt2"]).toMatchObject([
                "TYPE \"MyUdt2\"",
                "	STRUCT",
                "		Nested : Bool := true;",
                "	END_STRUCT;",
                "",
                "END_TYPE",
            ])

            expect(program["file:///UdtFb"]).toMatchObject([
                "FUNCTION_BLOCK \"UdtFb\"",
                "	VAR",
                "		MyGlobalType : \"MyUdt\" := ([(true)]);",
                "	END_VAR",
                "BEGIN",
                "",
                "END_FUNCTION_BLOCK",
            ])
        })
    })
})