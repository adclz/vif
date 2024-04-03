---
outline: deep
---

<script setup>
import Container from "../../../components/Container.vue";
import DisplaySnippet from "../../../components/snippet/DisplaySnippet.vue";

import {Provider, BuildSource} from "#source";
import {Ob, Fb, InstanceDb} from "#pou";
import {Bool, Time, Time_from} from "#primitives";
import {Instance} from "#complex";
import {UnitTest, UnitBlock, UnitLog} from "#unit";
import {Compare, Call} from "#basics";
import {If} from "#program-control";

const FTrigSnippet = () => {
const MyFb = new Fb({
    interface: {
        static: {
            f_trig_instance: new Instance(Provider.internal.F_TRIG, {}),
            clk: new Bool(),
            output: new Bool(),
        }
    },
    body() {
        return [
            new Call(this.static.f_trig_instance, {
                input: {
                    CLK: this.static.clk
                },
                output: {
                    Q: this.static.output
                }
            })
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
};

const RTrigSnippet = () => {
const MyFb = new Fb({
    interface: {
        static: {
            r_trig_instance: new Instance(Provider.internal.R_TRIG, {}),
            clk: new Bool(),
            output: new Bool(),
        }
    },
    body() {
        return [
            new Call(this.static.r_trig_instance, {
                input: {
                    CLK: this.static.clk
                },
                output: {
                    Q: this.static.output
                }
            })
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

# Signal Edges

:::info Provider specific ↗
Provider-specific feature.

All providers are free to implement it with custom behavior and name or simply avoid it.

To access this feature, you need to use the `internal` field of a `Provider` instance.
:::

Both Rising & Falling edges are supported.

## Rising edge

```ts twoslash
import {Provider} from "#source";
import {Ob, Fb, InstanceDb} from "#pou";
import {Bool} from "#primitives";
import {Instance} from "#complex";
import {Compare, Call} from "#basics";

const MyFb = new Fb({
    interface: {
        static: {
            r_trig_instance: new Instance(Provider.internal.R_TRIG, {}),
            clk: new Bool(),
            output: new Bool(),
        }
    },
    body() {
        return [
            new Call(this.static.r_trig_instance, {
                input: {
                    CLK: this.static.clk
                },
                output: {
                    Q: this.static.output
                }
            })
        ]
    }
})
```

<ClientOnly>
    <DisplaySnippet :program="RTrigSnippet()" mode="parse" :outputBlocks="['file:///MyFb']"/>
</ClientOnly>

## Falling edge

```ts twoslash
import {Provider} from "#source";
import {Ob, Fb, InstanceDb} from "#pou";
import {Bool} from "#primitives";
import {Instance} from "#complex";
import {Compare, Call} from "#basics";

const MyFb = new Fb({
    interface: {
        static: {
            f_trig_instance: new Instance(Provider.internal.F_TRIG, {}),
            clk: new Bool(),
            output: new Bool(),
        }
    },
    body() {
        return [
            new Call(this.static.f_trig_instance, {
                input: {
                    CLK: this.static.clk
                },
                output: {
                    Q: this.static.output
                }
            })
        ]
    }
})
```

<ClientOnly>
    <DisplaySnippet :program="FTrigSnippet()" mode="parse" :outputBlocks="['file:///MyFb']"/>
</ClientOnly>