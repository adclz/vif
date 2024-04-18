---
outline: deep
---

<script setup>
import Container from "../../../components/Container.vue";
import DisplaySnippet from "../../../components/snippet/DisplaySnippet.vue";

import {UnitTest, UnitLog} from "#unit";
import {Ob, Fb, InstanceDb, Udt} from "#pou";
import {Bool, Int} from "#primitives";
import {ArrayFrom, _Array, Struct, Instance} from "#complex";
import {Assign, Call} from "#basics";
import {BuildSource} from "#source";

const ArrayFromSnippet = () => {
const fb = new Fb({
    interface: {
        static: {
            MyArray: ArrayFrom(5, (v, i) => i % 2 ? new Bool(true) : new Bool())
        }    
    },
    body() {
        return [
            new UnitTest("0 should be false", this.static.MyArray[0], "=", false),
            new UnitTest("1 should be true", this.static.MyArray[1], "=", true),
            new UnitTest("2 should be false", this.static.MyArray[2], "=", false),
            new UnitTest("3 should be true", this.static.MyArray[3], "=", true),
            new UnitTest("4 should be false", this.static.MyArray[4], "=", false),
        ]
    }
});

    const fbInstance = new InstanceDb(fb);

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
                "OddFb": fb,
                "OddFb_Instance": fbInstance
            }
    });
};

const StructSnippet = () => {
const fb = new Fb({
    interface: {
        static: {
            MyStruct: new Struct({
                MyVar: new Bool(true),
                    NestedStruct: new Struct({
                        MyNestedVar: new Int(50)
                    })            
                })
            }    
        },
    body() {
        return [
            new UnitTest("MyStruct.MyVar should be true", this.static.MyStruct.MyVar, "=", true),
            new UnitTest("MyStruct.NestedStruct.MyNestedVar should be 50", this.static.MyStruct.NestedStruct.MyNestedVar, "=", 50),
        ]
    }
});

    const fbInstance = new InstanceDb(fb);

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
                "StructFb": fb,
                "StructFb_Instance": fbInstance
            }
    });
};

const UdtSnippet = () => {

const MyUdt = new Udt({
    AnotherArray: new _Array([new Int()])
});

const MyUdt2 = new Udt({
    MyVar: new Bool(),
    MyVar2: new Bool(),
    AnArray: new _Array([new Int(), new Int()]),
    Nested: MyUdt.self()
});

const fb = new Fb({
    interface: {
        static: {
            MyGlobalType: MyUdt2.implement({
                MyVar: new Bool(true),
                MyVar2: new Bool(true),
                AnArray: new _Array([new Int(30), new Int(50)]),
                Nested: MyUdt.implement({
                    AnotherArray: new _Array([new Int(60)])
                })
            })
        }
    },
    body() {
        return [
            new UnitTest("MyGlobalType.MyVar should be true", this.static.MyGlobalType.MyVar, "=", true),
            new UnitTest("MyGlobalType.MyVar2 should be true", this.static.MyGlobalType.MyVar2, "=", true),
            new UnitTest("MyGlobalType.AnArray[0] should be 30", this.static.MyGlobalType.AnArray[0], "=", 30),
            new UnitTest("MyGlobalType.AnArray[1] should be 50", this.static.MyGlobalType.AnArray[1], "=", 50),
            new UnitTest("MyGlobalType.Nested.AnotherArray[0] should be 60", this.static.MyGlobalType.Nested.AnotherArray[0], "=", 60),
        ]
    }
});

    const fbInstance = new InstanceDb(fb);

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
                "UdtFb": fb,
                "UdtFb_Instance": fbInstance,
                "MyUdt": MyUdt,
                "MyUdt2": MyUdt2
            }
    });
};

const InstanceDbSnippet = () => {
const MyFb = new Fb({
    interface: {
        static: {"MyVar": new Bool(true)}
    }
});

const MyFb2 = new Fb({
    interface: {
        static: {
            "AnInstance": new Instance(MyFb, {})
        }
    }
});

    return BuildSource({
        blocks:
            {
                "MyFb": MyFb,
                "MyFb2": MyFb2
            }
    });
}
</script>

# Complex types

Complex types are types that can be declared in an interface.

## Array

A static array.

An array is interpreted by typescript as a tuple, so the length of the array will depend on the number of elements you
have declared on the constructor.

```ts twoslash
import {Bool} from "#primitives"
import {_Array} from "#complex"

const MyArray = new _Array([new Bool(true)])
```

Since it would really be painful to declare a new instance of the type you want everytime you wish to grow your array,
Vif has the `ArrayFrom` static method.

```ts twoslash
import {ArrayFrom} from "#complex";
import {UnitTest} from "#unit";
import {Fb} from "#pou";
import {Bool} from "#primitives";

const OddFb = new Fb({
    interface: {
        static: {
            MyArray: ArrayFrom(5, (v: Bool, i) => i % 2 ? new Bool(true) : new Bool())
        }    
    },
    body() {
        return [
            new UnitTest("0 should be false", this.static.MyArray[0], "=", false),
            new UnitTest("1 should be true", this.static.MyArray[1], "=", true),
            new UnitTest("2 should be false", this.static.MyArray[2], "=", false),
            new UnitTest("3 should be true", this.static.MyArray[3], "=", true),
            new UnitTest("4 should be false", this.static.MyArray[4], "=", false),
        ]
    }
})
```

<ClientOnly>
    <DisplaySnippet :program="ArrayFromSnippet()" mode="unit" :outputBlocks="['file:///OddFb']"/>
</ClientOnly>

:::tip
When making abstractions of Array, you may need to use a variable and not a const number as an array index.

TypeScript won't let you use a number generic so a good way to fix this is to use an `UNSAFE_INDEX` type set to 0.

```ts
type UNSAFE_INDEX = 0
```

Then you can cast your index variable with as keyword.

This is also a good way to remind anyone that the abstraction you have made might generate invalid array indexes. 
:::

## Struct

A local structure.

Struct is just a `Record<string, {}>` where `{}` can be any primitive / other complex type (event a nested struct).

```ts twoslash
import {Bool, Int} from "#primitives";
import {Struct} from "#complex";
import {Fb} from "#pou";
import {UnitTest} from "#unit";

const StructFb = new Fb({
    interface: {
        static: {
            MyStruct: new Struct({
                MyVar: new Bool(true),
                NestedStruct: new Struct({
                    MyNestedVar: new Int(50)
                })
            })
        }
    },
    body() {
        return [
            new UnitTest("MyStruct.MyVar should be true", this.static.MyStruct.MyVar, "=", true),
            new UnitTest("MyStruct.NestedStruct.MyNestedVar should be 50", this.static.MyStruct.NestedStruct.MyNestedVar, "=", 50),
        ]
    }
})
```
<ClientOnly>
    <DisplaySnippet :program="StructSnippet()" mode="unit" :outputBlocks="['file:///StructFb']"/>
</ClientOnly>

## Instance

An instance of [Fb](/en/language/pou#fb).

Instance works the same way as [InstanceDb](/en/language/pou#instancedb) excepts it cannot be declared globally and has to be inside the interface
of a block.

```ts twoslash
import {Bool} from "#primitives"
import {Instance} from "#complex"
import {Fb} from "#pou"

const MyFb = new Fb({
    interface: {
        static: {"MyVar": new Bool(true)}
    }
})

const MyFb2 = new Fb({
    interface: {
        static: {
            "AnInstance": new Instance(MyFb, {})
        }
    }
})

```

<ClientOnly>
    <DisplaySnippet :program="InstanceDbSnippet()" mode="parse" :outputBlocks="['file:///MyFb', 'file:///MyFb2']"/>
</ClientOnly>

## Udt_impl

Similar to struct, except the interface is copied from an [Udt](/en/language/pou#Udt) declared globally.

Udt_impl cannot be created directly, instead you must call the `implement` or `self` method of an existing [Udt](/en/language/pou#Udt)
to create it.

```ts twoslash
import {Bool} from "#primitives"
import {Udt} from "#pou"

const MyUdt = new Udt({
    "MyVar": new Bool(true)
})

const MyUdtImpl = MyUdt.self()

const MyUdtWithOverride = MyUdt.implement({
    "MyVar": new Bool(false)
})
```

You can also declare nested Udt inside another Udt.

Vif can support complex scenarios.

```ts twoslash
import {Bool, Int} from "#primitives"
import {_Array} from "#complex"
import {Udt, Fb} from "#pou"
import {UnitTest} from "#unit"

// ---cut---
const MyUdt = new Udt({
    AnotherArray: new _Array([new Int()])
})

const MyUdt2 = new Udt({
    MyVar: new Bool(),
    MyVar2: new Bool(),
    AnArray: new _Array([new Int(), new Int()]),
    Nested: MyUdt.self()
})

const UdtFb = new Fb({
    interface: {
        static: {
            MyGlobalType: MyUdt2.implement({
                MyVar: new Bool(true),
                MyVar2: new Bool(true),
                AnArray: new _Array([new Int(30), new Int(50)]),
                Nested: MyUdt.implement({
                    AnotherArray: new _Array([new Int(60)])
                })
            })
        }
    },
    body() {
        return [
            new UnitTest("MyGlobalType.MyVar should be true", this.static.MyGlobalType.MyVar, "=", true),
            new UnitTest("MyGlobalType.MyVar2 should be true", this.static.MyGlobalType.MyVar2, "=", true),
            new UnitTest("MyGlobalType.AnArray[0] should be 30", this.static.MyGlobalType.AnArray[0], "=", 30),
            new UnitTest("MyGlobalType.AnArray[1] should be 50", this.static.MyGlobalType.AnArray[1], "=", 50),
            new UnitTest("MyGlobalType.Nested.AnotherArray[0] should be 60", this.static.MyGlobalType.Nested.AnotherArray[0], "=", 60),
        ]
    }
})
```

<ClientOnly>
    <DisplaySnippet :program="UdtSnippet()" mode="unit" :outputBlocks="['file:///MyUdt', 'file:///MyUdt2', 'file:///UdtFb']"/>
</ClientOnly>