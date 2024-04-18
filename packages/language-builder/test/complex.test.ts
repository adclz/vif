import {ExposeArray, ExposeInstance, ExposeStruct} from "@/src/types/complex/index.js";
import {describe, expect, it} from "vitest";
import {Int, DInt, Word, USInt, UInt, LInt, DWord} from "@/src/types/primitives/index.js";
import {Bool} from "@/src/types/primitives/boolean/Bool.js";
import {ExposeFb, ExposeFc} from "@/src/pou/index.js";

const TArray = ExposeArray().Array_
const ArrayFrom = ExposeArray().ArrayFrom
const TStruct = ExposeStruct()
const TInstance = ExposeInstance()
const TFb = ExposeFb()

describe("Complex", function () {
    describe("Array", () => {
        it("Array indexes", () => {
            const arr = new TArray([new Bool(), new Bool()]);
            expect(arr[0]).toBeInstanceOf(Bool)
            expect(arr[1]).toBeInstanceOf(Bool)
            expect(arr[2]).to.be.equal(undefined)
        });
        it("Array from", () => {
            const arr = ArrayFrom(2, (v => new Bool()));
            expect(arr[0]).toBeInstanceOf(Bool) 
            expect(arr[1]).toBeInstanceOf(Bool) 
            expect(arr[2]).to.be.equal(undefined)
        });
        it("Array from with odd indexes", () => {
            const arr = ArrayFrom(2, (v: Bool<any>, i) => i % 2 ? new Bool(true) : new Bool())
            expect(arr[0].value).to.be.equal(undefined)
            expect(arr[1].value).to.be.equal(true)
        });
        it("Array ast", () => {
            const arr = new TArray([new Bool(), new Bool()]);
            const ast = arr.toAst()
            expect(ast).toMatchObject({
                ty: "array",
                src: {
                    of: {
                        ty: "Bool",
                        src: {}
                    },
                    values: {
                        ty: "array_values",
                        src: [],
                    },
                    length: 2,
                }
            })
        });
    })
    describe("Struct", () => {

        it("Basic Struct", () => {
            const struct = new TStruct({
                test: new Bool(true)
            });
            expect(struct.test.value).to.be.equal(true)
        });
        it("Nested Struct", () => {
            const struct = new TStruct({
                test: new TStruct({
                    nested: new Int(50)
                })
            });
            expect(struct.test.nested.value).to.be.equal(50)
        });
        it("Struct ast", () => {
            const struct = new TStruct({
                test: new Bool(true)
            });
            const ast = struct.toAst()
            expect(ast).toMatchObject({
                ty: "Struct",
                src: {
                    interface: {
                        test: {
                            ty: "Bool",
                            src: {}
                        }
                    }
                }
            })
        })
    })
    describe("Instance", () => {
        it("Instance of Fb", () => {
            const TTFb = new TFb({
                interface: {
                    static: {
                        test: new Bool(true)
                    }
                }
            })
            const instance = new TInstance(TTFb, {});
            expect(instance.static.test!.value).to.be.equal(true)
        });
    })
})