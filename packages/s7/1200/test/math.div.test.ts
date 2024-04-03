﻿import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, InstanceDb, Ob} from "#pou";

import {BuildSource, Provider} from "#source";
import {UnitTest} from "#unit";
import {Assign, Calc, Call} from "#basics";
import {
    Byte,
    DInt,
    DWord,
    Int,
    LReal,
    Real,
    SInt,
    Time_from,
    UDInt,
    UInt,
    USInt,
    Word
} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-node";

const TestProgram = () => {
    const fb = new Fb({
            interface: {
                temp: {
                    test_byte: new Byte(8),
                    test_word: new Word(8),
                    test_dword: new DWord(8),

                    test_sint: new SInt(8),
                    test_usint: new USInt(8),
                    test_int: new Int(8),
                    test_uint: new UInt(8),
                    test_dint: new DInt(8),
                    test_udint: new UDInt(8),

                    test_real: new Real(0.9),
                    test_lreal: new LReal(0.9),

                    test_time: Time_from({s: 10, ms: 10}),
                }
            },
            body() {
                return [
                    new Assign(this.temp.test_byte, new Calc(this.temp.test_byte, "/", 2)),
                    new UnitTest("Byte div", this.temp.test_byte, "=", 4),

                    new Assign(this.temp.test_word, new Calc(this.temp.test_word, "/", 2)),
                    new UnitTest("Word div", this.temp.test_word, "=", 4),
                    new Assign(this.temp.test_dword, new Calc(this.temp.test_dword, "/", 2)),
                    new UnitTest("DWord div", this.temp.test_dword, "=", 4),

                    new Assign(this.temp.test_usint, new Calc(this.temp.test_usint, "/", 2)),
                    new UnitTest("USInt div", this.temp.test_usint, "=", 4),
                    new Assign(this.temp.test_sint, new Calc(this.temp.test_sint, "/", 2)),
                    new UnitTest("SInt div", this.temp.test_sint, "=", 4),
                    new Assign(this.temp.test_uint, new Calc(this.temp.test_uint, "/", 2)),
                    new UnitTest("UInt div", this.temp.test_uint, "=", 4),
                    new Assign(this.temp.test_int, new Calc(this.temp.test_int, "/", 2)),
                    new UnitTest("Int div", this.temp.test_int, "=", 4),
                    new Assign(this.temp.test_udint, new Calc(this.temp.test_udint, "/", 2)),
                    new UnitTest("UDInt div", this.temp.test_udint, "=", 4),
                    new Assign(this.temp.test_dint, new Calc(this.temp.test_dint, "/", 2)),
                    new UnitTest("DInt div", this.temp.test_dint, "=", 4),

                    new Assign(this.temp.test_real, new Calc(this.temp.test_real, "/", 2)),
                    new UnitTest("Real div", this.temp.test_real, "=", 0.450),
                    new Assign(this.temp.test_lreal, new Calc(this.temp.test_lreal, "/", 2)),
                    new UnitTest("Real div", this.temp.test_lreal, "=", 0.450),

                    new Assign(this.temp.test_time, new Calc(this.temp.test_time, "/", new USInt(2))),
                    new UnitTest("Time div", this.temp.test_time, "=", Time_from({s: 5, ms: 5}))
                ]
            }
        }
    )

    const fbInstance = new InstanceDb(fb)

    return BuildSource({
        blocks:
            {
                "Main": new Ob(
                    {
                        body() {
                            return [new Call(fbInstance, {})]
                        }
                    }
                ),
                "Div_Fb": fb,
                "Div_Fb_Instance": fbInstance
            }
    })
}

describe("Simulation primitives", async () => {
    describe("Assign Values /= 2", async () => {
        describe("Simulation tests", async () => {
            const container = new Container()
            await container.boot()
            const plugin = new Plugin("vitest", 200)
            plugin.on("messages", messages => {
                messages.forEach(x => console.log(x))
            })

            plugin.on("warnings", warnings => {
                console.log(warnings)
            })

            const getExecutor = await plugin.getAsyncExecutor().init(container)

            const program = TestProgram()

            await getExecutor.loadProvider(Provider.toAst());
            await getExecutor.loadProgram(program.toAst());
            const tests = await getExecutor.startAndWaitUnitTests("Main")
            tests.forEach(test => {
                it(test.description, () => {
                    expect(test.status, test.fail_message + "\n")
                        .to.be.equal(UnitTestStatus.Succeed)
                })
            })
            describe("Compiler output", () => {
                const output = program.compileProgram()
                it("output", () => {

                    Object.values(output)
                        .forEach(x => console.log(x.join("\n")))

                    expect(output["file:///Div_Fb"]).to.toMatchObject([
                        "FUNCTION_BLOCK \"Div_Fb\"",
                        "{ S7_Optimized_Access := 'TRUE' }",
                        "VERSION : 0.1",
                        "	VAR_TEMP",
                        "		test_byte : Byte := 16#8;",
                        "		test_word : Word := 16#8;",
                        "		test_dword : DWord := 16#8;",
                        "		test_sint : SInt := 8;",
                        "		test_usint : USInt := 8;",
                        "		test_int : Int := 8;",
                        "		test_uint : UInt := 8;",
                        "		test_dint : DInt := 8;",
                        "		test_udint : UDInt := 8;",
                        "		test_real : Real := 0.9;",
                        "		test_lreal : LReal := 0.9;",
                        "		test_time : Time := T#10S_10MS;",
                        "	END_VAR",
                        "BEGIN",
                        "	#test_byte := #test_byte / 2;",
                        "	#test_word := #test_word / 2;",
                        "	#test_dword := #test_dword / 2;",
                        "	#test_usint := #test_usint / 2;",
                        "	#test_sint := #test_sint / 2;",
                        "	#test_uint := #test_uint / 2;",
                        "	#test_int := #test_int / 2;",
                        "	#test_udint := #test_udint / 2;",
                        "	#test_dint := #test_dint / 2;",
                        "	#test_real := #test_real / 2;",
                        "	#test_lreal := #test_lreal / 2;",
                        "	#test_time := #test_time / USINT#2;",
                        "",
                        "END_FUNCTION_BLOCK",
                    ])
                })
            })

        })
    })
})
