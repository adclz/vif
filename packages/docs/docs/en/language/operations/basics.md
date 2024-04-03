---
outline: deep
---

<script setup>
import Container from "../../../components/Container.vue";
import DisplaySnippet from "../../../components/snippet/DisplaySnippet.vue";

import {SInt} from "#primitives";
import {Ob, Fb, InstanceDb} from "#pou";
import {Assign, Calc, Call, Compare} from "#basics";
import {While} from "#program-control";
import {BuildSource} from "#source";
import {UnitTest} from "#unit";


const InvalidAssign = () => {
const fb = new Fb({
            interface: {
                temp: {
                    a_sint: new SInt(6),
                }
            }, body() {
                return [
                    new Assign(new SInt(0), 0)
                ]
            }
        }
    );

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
    })
}

</script>

# Basic operations

## Assign

Assign a reference from a block interface

```ts twoslash
import {Assign} from "#basics"
```

Assign works with any `primitive`, you cannot set the first parameter with a constant value.

The following example works with TypeScript, but [vif-sim](/en/simulation/introduction) won't allow the operation.

```ts twoslash

import {SInt} from "#primitives";
import {Ob, Fb, InstanceDb} from "#pou";
import {Assign, Calc, Call, Compare} from "#basics";
import {While} from "#program-control";
import {BuildSource} from "#source";
import {UnitTest} from "#unit";

// ---cut---
const fb = new Fb({
            interface: {
                temp: {
                    a_sint: new SInt(6),
                }
            }, body() {
                return [
                    new Assign(new SInt(0), 0)
                ]
            }
        }
    );
```

<ClientOnly>
    <DisplaySnippet :program="InvalidAssign()"/>
</ClientOnly>

You can check how TypeScript handle Assign [here](/en/language/types/primitives#about-typescript)

```ts twoslash
import {Assign} from "#basics"
import {Bool} from "#primitives"
import {Fb} from "#pou"

const MyFb = new Fb({
    interface: {
        static: {
            "MyVar": new Bool()
        }
    },
    body() {
        return [
            new Assign(this.static.MyVar, true)
        ]
    }
})
```

:::warning
Assign can `only` assign references, since TypeScript won't tell the difference between a constant value and a
reference you have to be careful.

`[vif-sim](/en/simulation/introduction)` will return an error anyway.
:::

## Compare

Compare 2 variables or operations that returns a primitive.

```ts twoslash
import {Compare} from "#basics"
```

```ts twoslash
import {Bool, Int, Real} from "#primitives"
import {Assign, Call, Compare} from "#basics"

const MyBool = new Bool(true)
const MyInt = new Int(524)
const MyReal = new Real(0.5)

const MyCompare = new Compare(MyBool, "=", true)
const MyCompare2 = new Compare(MyInt, ">", 523)
const MyCompare3 = new Compare(MyReal, "<", 0.9)
```

Compare accepts the following operators:

- "=": equals
- ">":  greater
- "<":  lesser
- ">=":  greaterOrEqual
- "<=":  lesserOrEqual
- "<>":  different

For example a `Call` of a [Fc](/en/language/pou#Fc).

```ts twoslash
import {Bool} from "#primitives"
import {Assign, Call, Compare} from "#basics"
import {If} from "#program-control"
import {Fc} from "#pou"

const MyFc = new Fc({
    interface: {
        return: new Bool()
    }
})

const MyIf = new If(new Compare(new Call(MyFc, {}), "=", true))
    .then([])
```

## Calc

Mathematical expressions.

See [math](/en/language/operations/math) for advanced operations.

```ts twoslash
import {Calc} from "#basics"
```

Calc accepts the following operators:

- "+": add
- "-": subtract
- "*":  multiply
- "`":  pow
- "/":  division
- "MOD":  modulo

```ts twoslash
import {Int} from "#primitives"
import {Calc} from "#basics"

const MyInt1 = new Int()
const MyInt2 = new Int()

const MyCalc = new Calc(MyInt1, "+", MyInt2)
```

Calc always returns the same type as the first parameter.

## Call

Call an `Instance` or [InstanceDb](/en/language/pou#instancedb) of [Fb](/en/language/pou#fb) or a [Fc](/en/language/pou#Fc).

```ts twoslash
import {Call} from "#basics"
```

Call provides a second argument which corresponds to the interface of the block called.

All `input`, `output` and `inout` fields are mandatory, be careful to not use constant with the outputs.

### Example with Fb

```ts twoslash
import {Fb, InstanceDb} from "#pou"
import {Int} from "#primitives"
import {Call} from "#basics"

const MyFb = new Fb({
    interface: {
        input: {
            "MyInput": new Int()
        }
    }
})

const InstanceDbOfMyFb = new InstanceDb(MyFb)

const MyCall = new Call(InstanceDbOfMyFb, {
    input: {
        "MyInput": 52
    }
})
```

### Example with Fc

Exactly the same way but Fc can be called directly.

Another difference is that Fc has a return `field` which transforms Call as an Operation that returns the same type as
return.

```ts twoslash
import {Fc} from "#pou"
import {Bool, Int} from "#primitives"
import {Call} from "#basics"

const MyFc = new Fc({
    interface: {
        input: {
            "MyInput": new Int()
        }
    }
})

// MyCall is now an Operation<Bool>
const MyCall = new Call(MyFc, {
    input: {
        "MyInput": 52
    }
})
```