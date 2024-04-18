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


const InfiniteLoop = () => {
const fb = new Fb({
            interface: {
                temp: {
                    i: new SInt(6),
                }
            }, body() {
                return [
                    new While(new Compare(this.temp.i, ">", 5))
                        .do([
                            new Assign(this.temp.i, new Calc(this.temp.i, "+", 1))
                        ]),
                    new UnitTest("While i < 5", this.temp.i, "=", 5),
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
                "Tan_Fb": fb,
                "Tan_Fb_Instance": fbInstance
            }
    })
}

</script>

# Program control

## If

If operation which expects a `Compare` operation to return and execute the operations if true.

```ts twoslash
import {If} from "#program-control"
```

Use the `then` or `else` chained methods to control the flow.

```ts twoslash
import {Bool} from "#primitives"
import {Assign, Compare} from "#basics"
import {If} from "#program-control"

const MyBool = new Bool(true)

const MyIf = new If(new Compare(MyBool, "=", true))
    .then([new Assign(MyBool, false)])
    .else([new Assign(MyBool, true)])
```

## ForOf

A For-Of loop, increments a reference until it has reached a specified value.

```ts twoslash
import {ForOf} from "#program-control"
```

ForOf has 3 mandatory parameters:

- For: the variable which will be incremented
- With: the initial value of `For`
- To: the target value for `For`

Use the `do` chained method to add operations.

```ts twoslash
import {Int} from "#primitives"
import {Assign, Calc} from "#basics"
import {ForOf} from "#program-control"

const MyInt = new Int()

// For i := 5 to 10
const MyForOf = new ForOf(MyInt, 5, 10)
    .do([
        new Assign(MyInt, new Calc(MyInt, "+", 1))
    ])
```

A 4th parameter tells how the loop should be incremented.

```ts twoslash
import {Int} from "#primitives"
import {ForOf} from "#program-control"

const MyInt = new Int()

// For i := 5 to 10 By 1
const MyForOf = new ForOf(MyInt, 5, 10, 1)
    .do([])
```

## Return

Force an immediate return.

Return do not have any parameters.

```ts twoslash
import {Return} from "#program-control"

const MyReturn = new Return()
```

## While

A while loop, first parameter has to be a `Compare` operation which will break the loop once it returns true.

```ts twoslash
import {Int} from "#primitives"
import {Assign, Calc, Compare} from "#basics"
import {While} from "#program-control"

const MyInt = new Int()

// While i < 10
const MyWhile = new While(new Compare(MyInt, "<", 10))
    .do([
        new Assign(MyInt, new Calc(MyInt, "+", 1))
    ])


```

### Loop safety

[vif-sim](/en/simulation/introduction) has a loop security built-in, it does not know if the loop is [infinite](https://en.wikipedia.org/wiki/Halting_problem) but will stop automatically if the loop takes longer than 100ms to execute.

Also there's a chance that the loop will trigger an integer overflow at some point and stops the program.

The following code will crash because `i` will reach 127 before the loop ends:

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
                    i: new SInt(6),
                }
            }, body() {
                return [
                    new While(new Compare(this.temp.i, ">", 5))
                        .do([
                            new Assign(this.temp.i, new Calc(this.temp.i, "+", 1))
                        ]),
                    new UnitTest("Unreachable", this.temp.i, "=", 5),
                ]
            }
        }
    );

```

<ClientOnly>
    <DisplaySnippet :program="InfiniteLoop()"/>
</ClientOnly>