---
outline: deep
---

<script setup>
import Container from "../../../components/Container.vue";
import DisplaySnippet from "../../../components/snippet/DisplaySnippet.vue";

import {SInt} from "#primitives";
import {Ob, Fb, InstanceDb} from "#pou";
import {Assign, Calc, Call, Compare} from "#basics";
import {BuildSource} from "#source";
import {UnitTest, UnitLog} from "#unit";
import {Bool} from "#primitives";

const ShowLog = () => {
const fb = new Fb({
            interface: {
                static: {
                    MyBool: new Bool(),
                    MyBool2: new Bool(true),
                }
            }, body() {
                return [
                    new UnitLog("Display MyBool1 {} \nDisplay MyBool2 {}", this.static.MyBool, this.static.MyBool2),
                    new UnitTest("UnitTest", this.static.MyBool, "=", true)
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

# Unit operations

Unit operations allow you to easily test your code inside the simulation.

:::info
Since they are specific functions for the simulation, they are not compiled by the `provider` compiler.
:::

## Breakpoint

Create a breakpoint, this will force the simulation to pause and send the current stack.

To resume a breakpoint, you can use the built-in container function `resume`.

A breakpoint can be anywhere inside an [Ob, Fb, Fc](/en/language/pou) operations.

```ts twoslash
import {BreakPoint} from "#unit";

new BreakPoint()
```

When a breakpoint is reached, the [breakpoint:statuses](/en/simulation/plugins#breakpoints-statuses) event of all plugins will be fired. 

:::tip
Breakpoints can be temporary disabled using the `disableBreakpoint()` function of container.

You can use `enableBreakpoint()` to reverse this operation.
:::

## UnitLog

Create a log which will be displayed on both `messages` and `stack` events of the simulation.

::: warning
`UnitLog` does not format values for performance reasons. 

Also logging too many values can drastically reduce the simulation performance, especially if you log [complex types](/en/language/types/complex).
:::

```ts twoslash
import {UnitLog} from "#unit";

new UnitLog("My log")
```

UnitLog supports formatting of custom variables.

Put brackets `{}` on where you want to see your variable.

<ClientOnly>
    <DisplaySnippet :program="ShowLog()"/>
</ClientOnly>

```ts twoslash
import {Bool} from "#primitives";
import {UnitLog} from "#unit";

const MyBool = new Bool(true)
const MyBool2 = new Bool(false)

new UnitLog(
    "Display MyBool {}, display MyBool2 {}",
    [MyBool, MyBool2]
)
```

::: tip
You can use ANSI colors to make your logs more readable, but make sure you have something which can parse ANSI
characters back when you will receive messages from the simulation.
:::

## UnitTest

UnitTest is a classic unit test operation.

The first argument of your unit test is the name / description of your test.

The second one the is a comparator operation, similar to `Compare`.

```ts twoslash
import {Bool} from "#primitives";
import {UnitTest} from "#unit";
import {Compare} from "#basics";

const MyBool = new Bool(true)

new UnitTest("My unit test", MyBool, "=", true)
```

UnitTest accepts the following operators:

- "=": equals
- ">":  greater
- "<":  lesser
- ">=":  greaterOrEqual
- "<=":  lesserOrEqual
- "<>":  different

::: info
The simulation will stop once all unit tests have been reached, depending on how you configured your container.
:::

## UnitBlock

An UnitBlock is a conditional block.

It accepts any operations, you can use it to execute arbitrary operations which will only exists in the simulation.

For example you can use the result of a rising / falling edge to trigger to execute specific unit tests.

:::warning
`UnitBlock` can lead to infinite simulations if the conditions for trigger are never met, if you're awaiting the
result of the unit tests make sure to set a [timeout](/en/simulation/vitest-integration#timeout-security).
:::

```ts 
import {UnitBlock} from "#unit";

new UnitBlock("Check if timer equals 5s when a rising edge is true",
    new If(new Compare(this.static.my_rising_edge, "=", true))
        .then([
            new UnitTest("Elapsed timer should be equal 5s", this.static.timer_elapsed, "=", Time_from({s: 5}))
        ])
```