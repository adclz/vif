---
outline: deep
---

<script setup>
import Container from "../../../components/Container.vue";
import DisplaySnippet from "../../../components/snippet/DisplaySnippet.vue";

import {Provider, BuildSource} from "#source";
import {Ob, Fb, InstanceDb} from "#pou";
import {Bool, Time, Time_from} from "#primitives";
import {UnitTest, UnitBlock, UnitLog} from "#unit";
import {Compare, Call} from "#basics";
import {If} from "#program-control";

const TPSnippet = () => {
const MyFb = new Fb({
    interface: {
        static: {
            TONInstance: Provider.internal.TONInstance.self(),
            ET: new Time(),
            Q: new Bool()
        },
        constant: {
            time_5s: Time_from({s:5})
        }
    },
    body() {
        return [
            Provider.internal.TON.use(this.static.TONInstance, {
                input: {
                    IN: true,
                    PT: this.constant.time_5s
                },
                output: {
                    ET: this.static.ET,
                    Q: this.static.Q
                }
            }),

            new UnitLog("Elapsed: {}", this.static.ET),

            new UnitBlock("Trigger when Q is true",
                new If(new Compare(this.static.Q, "=", true))
                    .then([
                        new UnitTest("[When Q is true] ET should be 5s", this.static.ET, "=", this.constant.time_5s),
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

# Timers

:::info Provider specific ↗
Provider-specific feature.

All providers are free to implement it with custom behavior and name or simply avoid it.

To access this feature, you need to use the `internal` field of a `Provider` instance.
:::

For example the `standard` provider used by this documentation has the following Timers available:

```ts twoslash
import {Provider} from "#source"

const {
    TP,
    TON,
    TOF
} = Provider.internal
```

Since Timers are like any other function blocks and need to store information, the provider will also give a way to create memory emplacement:

```ts twoslash
import {Provider} from "#source"

const {
    TPInstance,
    TONInstance,
    TOFInstance
} = Provider.internal
```

## Example with TON

In this example with TON, we trigger the timer immediately by setting **IN** to true. 

We create an [UnitBlock](/en/language/operations/unit#unitblock) with an [UnitTest](/en/language/operations/unit#unittest) inside that checks if the elapsed Time is equals 5S when Q is true.

```ts twoslash
import {Provider} from "#source"
import {Fb} from "#pou"
import {Bool, Time, Time_from} from "#primitives";
import {Compare, Call} from "#basics";
import {If} from "#program-control";
import {UnitTest, UnitBlock, UnitLog} from "#unit";

const MyFb = new Fb({
    interface: {
        static: {
            TONInstance: Provider.internal.TONInstance.self(),
            ET: new Time(),
            Q: new Bool()
        },
        constant: {
            time_5s: Time_from({s:5})
        }
    },
    body() {
        return [
            Provider.internal.TON.use(this.static.TONInstance, {
                input: {
                    IN: true,
                    PT: this.constant.time_5s
                },
                output: {
                    ET: this.static.ET,
                    Q: this.static.Q
                }
            }),

            new UnitLog("Elapsed: {}", this.static.ET),

            new UnitBlock("Trigger when Q is true",
                new If(new Compare(this.static.Q, "=", true))
                    .then([
                        new UnitTest("[When Q is true] ET should be 5s", this.static.ET, "=", this.constant.time_5s),
                    ])
            ),
        ]
    }
})
```

<ClientOnly>
    <DisplaySnippet :program="TPSnippet()" mode="unit" :outputBlocks="['file:///MyFb']"/>
</ClientOnly>
