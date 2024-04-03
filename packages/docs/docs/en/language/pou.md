---
outline: deep
---

<script setup>
import Container from "../../components/Container.vue";
import DisplaySnippet from "../../components/snippet/DisplaySnippet.vue";

import {UnitTest, UnitLog} from "#unit";
import {Ob, Fb, Fc, InstanceDb, GlobalDb, Udt} from "#pou";
import {Bool, Int} from "#primitives";
import {ArrayFrom, _Array, Struct, Instance} from "#complex";
import {Assign, Call} from "#basics";
import {BuildSource} from "#source";

const FbSnippet = () => {
const fb = new Fb({
    interface: {
        static: {
            "MyVar": new Bool(true)
        }
    },
    body() {
        return [new Assign(this.static.MyVar, false)]
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
                "MyFb": fb,
                "MyFb_Instance": fbInstance
            }
    });
};

const FcSnippet = () => {
const fc = new Fc({
    interface: {
        temp: {
            "MyVar": new Bool(true)
        }
    },
    body() {
        return [new Assign(this.temp.MyVar, false)]
    }
});

    return BuildSource({
        blocks:
            {
                "Main": new Ob(
                    {
                        body() {
                            return [new Call(fc, {})]
                        }
                    }
                ),
                "MyFc": fc
            }
    });
};

const UdtSnippet = () => {
const MyUdt = new Udt({
   "MyVar": new Bool()
});

    return BuildSource({
        blocks:
            {
                "MyUdt": MyUdt
            }
    });
};

const InstanceDbSnippet = () => {
const MyFb = new Fb({
    interface: {
        input: {
            "MyVar": new Bool()
        }
    }
});

const MyInstanceDb = new InstanceDb(MyFb);

    return BuildSource({
        blocks:
            {
                "MyFb": MyFb,
                "MyInstanceDb": MyInstanceDb
            }
    });
};

const GlobalDbSnippet = () => {
const MyGlobalDb = new GlobalDb({
    "MyFirstVar": new Bool(),
    "MySecondVar": new Int()
});

    return BuildSource({
        blocks:
            {
                "MyGlobalDb": MyGlobalDb
            }
    });
}
</script>

# Program Organization unit

## Ob

Ob blocks can have different meaning depending on how a plc manufacturer implements it.

In Vif, Ob is just an [entry point](https://en.wikipedia.org/wiki/Entry_point) to your program and serve no other
purposes, they can be seen as multiple `Main` functions.

Obs won't appear in the output code of the `provider` compiler and only exists for testing purposes.

Ob has 2 parameters:

- `interface` where you declare the interface of your Ob, can be:
    - temp, constant.
- `body` where you declare the operations as an Array of operations.

```ts twoslash
import {Ob} from "#pou"
```

Since Ob blocks cannot be referenced from the outside, you can inline them directly in your `CreateSource` function.

```ts twoslash
import {Ob, Fb} from "#pou"
import {Assign} from "#basics"
import {Bool} from "#primitives"
import {BuildSource} from "#source"

const MyFb = new Fb({
   interface: {
      static: {
         "MyVar": new Bool(true)
      }
   },
   body() {
      return [new Assign(this.static.MyVar, false)]
   }
})

// ---cut---
export default BuildSource({
   blocks: {
       "MyFb": MyFb,
       "MyOb": new Ob({
           interface: {
               temp: {MyBool: new Bool()}
           },
           body() {
               return []
           }
       })
   }
})
```

:::info
When you start the simulation, [vif-sim](/en/simulation/introduction) needs the name of one Ob block which will be the entry point of the simulation.

So if you register multiple Ob blocks, you can write different configurations of the same program.
:::

## Fb

```ts twoslash
import {Fb} from "#pou"
```

Standard Function Block, in which you can define an interface and operations.
This block cannot be called directly in your operations, you first need to create an instance or an instanceDb.

Fb has 3 parameters:

- `interface` where you declare the interface of your Fb, can be:
    - input, output, inout, static, temp, constant.
- `body` where you declare the operations as an Array of operations.
- `attributes` provider specific.

Fb has to be declared globally in a `CreateSource` object and has to be instanced with either [InstanceDb](/en/language/pou#instancedb) or `Instance`.

Then, you need to use the `Call` operation to activate the instance in a block operations?

```ts twoslash
import {Fb} from "#pou"
import {Assign} from "#basics"
import {Bool} from "#primitives"

const MyFb = new Fb({
    interface: {
        static: {
            "MyVar": new Bool(true)
        }
    },
    body() {
        return [new Assign(this.static.MyVar, false)]
    }
})
```

<ClientOnly>
    <DisplaySnippet :program="FbSnippet()" mode="parse" :outputBlocks="['file:///MyFb']"/>
</ClientOnly>

## Fc

```ts twoslash
import {Fc} from "#pou"
```

Standard function that can be called directly without instance.

Works the same as Fb except it does not have a `static` field but contains a `return` field.

Fc can be called directly without being instanced.

```ts twoslash
import {Fc} from "#pou"
import {Assign} from "#basics"
import {Bool} from "#primitives"

const MyFc = new Fc({
    interface: {
        temp: {
            "MyVar": new Bool(true)
        }
    },
    body() {
        return [new Assign(this.temp.MyVar, false)]
    }
})
```

<ClientOnly>
    <DisplaySnippet :program="FcSnippet()" mode="parse" :outputBlocks="['file:///MyFc']"/>
</ClientOnly>

## Udt

An User-Defined Data type, basically a globally declared struct which then can be implemented in a block interface or
with an [InstanceDb](/en/language/pou#instancedb).

```ts twoslash
import {Udt} from "#pou"
import {Assign} from "#basics"
import {Bool} from "#primitives"

const MyUdt = new Udt({
   "MyVar": new Bool()
})
```

<ClientOnly>
    <DisplaySnippet :program="UdtSnippet()" mode="parse" :outputBlocks="['file:///MyUdt']"/>
</ClientOnly>

## InstanceDb

An instance of [Fb](/en/language/pou#fb) but can be accessed everywhere.

```ts twoslash
import {Fb, InstanceDb} from "#pou"
import {Bool} from "#primitives"

const MyFb = new Fb({
    interface: {
        input: {
            "MyVar": new Bool()
        }
    }
})

const MyInstanceDb = new InstanceDb(MyFb)
```

<ClientOnly>
    <DisplaySnippet :program="InstanceDbSnippet()" mode="parse"/>
</ClientOnly>

## GlobalDb

A DataBlock with arbitrary values or [Udt](/en/language/pou#Udt) inside that can be accessed everywhere.

```ts twoslash
import {GlobalDb} from "#pou"
import {Bool, Int} from "#primitives"

const MyGlobalDb = new GlobalDb({
    "MyFirstVar": new Bool(),
    "MySecondVar": new Int()
})
```

<ClientOnly>
    <DisplaySnippet :program="GlobalDbSnippet()" mode="parse"/>
</ClientOnly>