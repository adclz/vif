---
outline: deep
---

<script setup>
import Container from "../../../components/Container.vue";
import DisplaySnippet from "../../../components/snippet/DisplaySnippet.vue";

import {Provider, BuildSource} from "#source";
import {Ob, Fb, InstanceDb} from "#pou";
import {Bool, Int} from "#primitives";
import {UnitTest, UnitBlock, UnitLog} from "#unit";
import {Compare, Call, Assign} from "#basics";
import {If} from "#program-control";

const CTUSnippet = () => {
const MyFb = new Fb({
    interface: {
        static: {
            CTUInstance: Provider.internal.CTUInstance.self(),
            counter_up: new Bool(),
            counter_reset: new Bool(),
            counter_value: new Int(),
            counter_output: new Bool(),
        }
    },
    body() {
        return [
            Provider.internal.CTU.use(this.static.CTUInstance, {
                input: {
                        CU: this.static.counter_up,
                        RESET: this.static.counter_reset,
                        PV: new Int(5),
                    },
                    output: {
                        CV: this.static.counter_value,
                        Q: this.static.counter_output,
                    }
                }),

                new If(new Compare(this.static.counter_up, "=", true))
                    .then([new Assign(this.static.counter_up, false)])
                    .else([new Assign(this.static.counter_up, true)]),

                new UnitBlock("Trigger when Counter Q is true",
                    new If(new Compare(this.static.counter_output, "=", true))
                        .then([
                            new UnitTest("[When Counter reached] Counter value should be 5", this.static.counter_value, "=", new Int(5)),
                        ])
                ),
        ]
    }
});

    const fbInstance = new InstanceDb(MyFb);

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
                "MyFb": MyFb,
                "MyFb_Instance": fbInstance
            }
    });
}
</script>

# Counters

:::info Provider specific ↗
Provider-specific feature.

All providers are free to implement it with custom behavior and name or simply avoid it.

To access this feature, you need to use the `internal` field of a `Provider` instance.
:::

The `standard` provider used by this documentation has the following Counters available:

```ts twoslash
import {Provider} from "#source"

const {
    CTU,
    CTD
} = Provider.internal
```

Since Counters are like any other function blocks and need to store information, the provider will also give a way to create memory emplacement:

```ts twoslash
import {Provider} from "#source"

const {
    CTUInstance,
    CTDInstance
} = Provider.internal
```

## Example with CTU

In this example with CTU, we use a small flip-flop that forces the counter to increment on every cycle.

We also create an [UnitBlock](/en/language/operations/unit#unitblock) with an [UnitTest](/en/language/operations/unit#unittest) inside that checks if the counter value is equals 5 when Q is true.

```ts twoslash
import {Provider} from "#source"
import {Ob, Fb, InstanceDb} from "#pou";
import {Bool, Int} from "#primitives";
import {UnitTest, UnitBlock, UnitLog} from "#unit";
import {Compare, Call, Assign} from "#basics";
import {If} from "#program-control";

const MyFb = new Fb({
    interface: {
        static: {
            CTUInstance: Provider.internal.CTUInstance.self(),
            counter_up: new Bool(),
            counter_reset: new Bool(),
            counter_value: new Int(),
            counter_output: new Bool(),
        }
    },
    body() {
        return [
            Provider.internal.CTU.use(this.static.CTUInstance, {
                input: {
                        CU: this.static.counter_up,
                        RESET: this.static.counter_reset,
                        PV: new Int(5),
                    },
                    output: {
                        CV: this.static.counter_value,
                        Q: this.static.counter_output,
                    }
                }),

                // Reverts on every cycle
                new If(new Compare(this.static.counter_up, "=", true))
                    .then([new Assign(this.static.counter_up, false)])
                    .else([new Assign(this.static.counter_up, true)]),

                new UnitBlock("Trigger when Counter Q is true",
                    new If(new Compare(this.static.counter_output, "=", true))
                        .then([
                            new UnitTest("[When Counter reached] Counter value should be 5", this.static.counter_value, "=", new Int(5)),
                        ])
                ),
        ]
    }
})
```

<ClientOnly>
    <DisplaySnippet :program="CTUSnippet()" mode="unit" :outputBlocks="['file:///MyFb']"/>
</ClientOnly>