import {describe, expect, it} from "vitest";
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
    LInt,
    LReal,
    LTime_from,
    LWord,
    Real,
    SInt,
    Time_from,
    UDInt,
    UInt,
    ULInt,
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
                    test_lword: new LWord(8),
                    test_lword_bigint: new LWord(8),

                    test_sint: new SInt(8),
                    test_usint: new USInt(8),
                    test_int: new Int(8),
                    test_uint: new UInt(8),
                    test_dint: new DInt(8),
                    test_udint: new UDInt(8),
                    test_lint: new LInt(8),
                    test_lint_bigint: new LInt(8),
                    test_ulint: new ULInt(8),
                    test_ulint_bigint: new ULInt(8),

                    test_real: new Real(0.9),
                    test_lreal: new LReal(0.9),

                    test_time: Time_from({s: 5, ms: 5}),
                    test_ltime: LTime_from({s: 5, ms: 5})
                }
            },
            body() {
                return [
                    new Assign(this.temp.test_byte, new Calc(this.temp.test_byte, "-", 8)),
                    new UnitTest("Byte sub", this.temp.test_byte, "=", 0),

                    new Assign(this.temp.test_word, new Calc(this.temp.test_word, "-", 8)),
                    new UnitTest("Word sub", this.temp.test_word, "=", 0),
                    new Assign(this.temp.test_dword, new Calc(this.temp.test_dword, "-", 8)),
                    new UnitTest("DWord sub", this.temp.test_dword, "=", 0),
                    new Assign(this.temp.test_lword, new Calc(this.temp.test_lword, "-", 8)),
                    new UnitTest("LWord sub", this.temp.test_lword, "=", 0),

                    new Assign(this.temp.test_usint, new Calc(this.temp.test_usint, "-", 8)),
                    new UnitTest("USInt sub", this.temp.test_usint, "=", 0),
                    new Assign(this.temp.test_sint, new Calc(this.temp.test_sint, "-", 8)),
                    new UnitTest("SInt sub", this.temp.test_sint, "=", 0),
                    new Assign(this.temp.test_uint, new Calc(this.temp.test_uint, "-", 8)),
                    new UnitTest("UInt sub", this.temp.test_uint, "=", 0),
                    new Assign(this.temp.test_int, new Calc(this.temp.test_int, "-", 8)),
                    new UnitTest("Int sub", this.temp.test_int, "=", 0),
                    new Assign(this.temp.test_udint, new Calc(this.temp.test_udint, "-", 8)),
                    new UnitTest("UDInt sub", this.temp.test_udint, "=", 0),
                    new Assign(this.temp.test_dint, new Calc(this.temp.test_dint, "-", 8)),
                    new UnitTest("DInt sub", this.temp.test_dint, "=", 0),
                    new Assign(this.temp.test_ulint, new Calc(this.temp.test_ulint, "-", 8)),
                    new UnitTest("ULInt sub", this.temp.test_ulint, "=", 0),
                    new Assign(this.temp.test_lint, new Calc(this.temp.test_lint, "-", 8)),
                    new UnitTest("LInt sub", this.temp.test_lint, "=", 0),

                    new Assign(this.temp.test_real, new Calc(this.temp.test_real, "-", 0.9)),
                    new UnitTest("Real sub", this.temp.test_real, "=", 0.0),
                    new Assign(this.temp.test_lreal, new Calc(this.temp.test_lreal, "-", 0.9)),
                    new UnitTest("Real sub", this.temp.test_lreal, "=", 0.0),

                    new Assign(this.temp.test_time, new Calc(this.temp.test_time, "-", Time_from({s: 5, ms: 5}))),
                    new UnitTest("Time sub", this.temp.test_time, "=", 0),
                    new Assign(this.temp.test_ltime, new Calc(this.temp.test_ltime, "-", LTime_from({s: 5, ms: 5}))),
                    new UnitTest("LTime sub", this.temp.test_ltime, "=", 0)

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
                "Sub_Fb": fb,
                "Sub_Fb_Instance": fbInstance
            }
    })
}

describe("Simulation primitives", async () => {
    describe("Assign Values -= 8", async () => {
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
                    expect(output["file:///Sub_Fb"]).to.toMatchObject([
                        "FUNCTION_BLOCK \"Sub_Fb\"",
                        "{ S7_Optimized_Access := 'TRUE' }",
                        "VERSION : 0.1",
                        "	VAR_TEMP",
                        "		test_byte : Byte := 16#8;",
                        "		test_word : Word := 16#8;",
                        "		test_dword : DWord := 16#8;",
                        "		test_lword : LWord := 16#8;",
                        "		test_lword_bigint : LWord := 16#8;",
                        "		test_sint : SInt := 8;",
                        "		test_usint : USInt := 8;",
                        "		test_int : Int := 8;",
                        "		test_uint : UInt := 8;",
                        "		test_dint : DInt := 8;",
                        "		test_udint : UDInt := 8;",
                        "		test_lint : LInt := 8;",
                        "		test_lint_bigint : LInt := 8;",
                        "		test_ulint : ULInt := 8;",
                        "		test_ulint_bigint : ULInt := 8;",
                        "		test_real : Real := 0.9;",
                        "		test_lreal : LReal := 0.9;",
                        "		test_time : Time := T#5S_5MS;",
                        "		test_ltime : LTime := LT#5S_5MS;",
                        "	END_VAR",
                        "BEGIN",
                        "	#test_byte := #test_byte - 8;",
                        "	#test_word := #test_word - 8;",
                        "	#test_dword := #test_dword - 8;",
                        "	#test_lword := #test_lword - 8;",
                        "	#test_usint := #test_usint - 8;",
                        "	#test_sint := #test_sint - 8;",
                        "	#test_uint := #test_uint - 8;",
                        "	#test_int := #test_int - 8;",
                        "	#test_udint := #test_udint - 8;",
                        "	#test_dint := #test_dint - 8;",
                        "	#test_ulint := #test_ulint - 8;",
                        "	#test_lint := #test_lint - 8;",
                        "	#test_real := #test_real - 0.9;",
                        "	#test_lreal := #test_lreal - 0.9;",
                        "	#test_time := #test_time - T#5S_5MS;",
                        "	#test_ltime := #test_ltime - LT#5S_5MS;",
                        "",
                        "END_FUNCTION_BLOCK",
                    ])
                })
            })
        })
    })
})
