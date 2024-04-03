---
outline: deep
---

# Vitest

[Vitest](https://vitest.dev/) can be used to test the [simulation unit tests](/en/language/operations/unit#unittest) of
your program.

You can check vitest website to see all the possibilities of this unit test framework.

## Integrate Vif Sim

### Imports

Since we need to simulate our code, you will have to install `@vifjs/sim-node`.

We will also need the [async executor](/en/simulation/async-executor) which provides an easier way to test our code.

```ts twoslash
import {describe, it} from "vitest"
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"

describe("MyTest", () => {
    
})
```

### Create a program

Next step we will create a small program with an unit test.

```ts twoslash
import {describe, it} from "vitest"
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
// ---cut---
import {BuildSource} from "#source";
import {Ob} from "#pou";
import {UnitTest} from "@vifjs/language-builder/operations/unit";
import {Bool} from "@vifjs/language-builder/types/primitives";

const Myprogram = BuildSource({
    blocks: {
        "Main": new Ob(
            {
                interface: {
                    temp: {
                        ThisBool: new Bool(true)
                    }
                },
                body() {
                    return [new UnitTest("My first unit test", this.temp.ThisBool, "=", true)]
                }
            }
        ),
    },
})

describe("MyTest", () => {

})
```

### Load the container & Async executor

Now load the container and the async executor:

```ts twoslash
import {describe, it} from "vitest"
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"

import {BuildSource, Provider} from "#source";
import {Ob} from "#pou";
import {UnitTest} from "@vifjs/language-builder/operations/unit";
import {Bool} from "@vifjs/language-builder/types/primitives";

const MyProgram = BuildSource({
    blocks: {
        "Main": new Ob(
            {
                interface: {
                    temp: {
                        ThisBool: new Bool(true)
                    }
                },
                body() {
                    return [new UnitTest("My first unit test", this.temp.ThisBool, "=", true)]
                }
            }
        ),
    },
})

// ---cut---
describe("MyTest", async () => {
    // Create a new Container instance and boot it
    const container = new Container()
    await container.boot()
    
    // Create a new plugin and get the async executor
    const plugin = new Plugin("vitest", 200)
    const getExecutor = await plugin.getAsyncExecutor().init(container)

    // Load the provider
    await getExecutor.loadProvider(Provider.toAst());
    // Load your program
    await getExecutor.loadProgram(MyProgram.toAst());
})
```

### Awaits for unit tests

```ts twoslash
import {describe, it, expect} from "vitest"
import {Container} from "@vifjs/sim-node/boot"
import {UnitTestStatus} from "@vifjs/sim-node"
import {Plugin} from "@vifjs/sim-node/plugin"

import {BuildSource, Provider} from "#source";
import {Ob} from "#pou";
import {UnitTest} from "@vifjs/language-builder/operations/unit";
import {Bool} from "@vifjs/language-builder/types/primitives";

const MyProgram = BuildSource({
    blocks: {
        "Main": new Ob(
            {
                interface: {
                    temp: {
                        ThisBool: new Bool(true)
                    }
                },
                body() {
                    return [new UnitTest("My first unit test", this.temp.ThisBool, "=", true)]
                }
            }
        ),
    }
})

// ---cut---
describe("MyTest", async () => {
    // Create a new Container instance and boot it
    const container = new Container()
    await container.boot()
    
    // Create a new plugin and get the async executor
    const plugin = new Plugin("vitest", 200)
    const getExecutor = await plugin.getAsyncExecutor().init(container)

    // Load the provider
    await getExecutor.loadProvider(Provider.toAst());
    // Load your program
    await getExecutor.loadProgram(MyProgram.toAst());
    
    // Start simulation with Main and await for unit test results
    const tests = await getExecutor.startAndWaitUnitTests("Main")

    tests.forEach(test => {
        it(test.description, () => {
            expect(test.status, test.fail_message + "\n")
                .to.be.equal(UnitTestStatus.Succeed)
        })
    })
})
```

### TimeOut security

If you're playing with [Timers](/en/language/operations/timers) or [UnitBlock](/en/language/operations/unit#unitblock) there's a chance that the simulation never ends.

To prevent an infinite simulation from happening, you can use the `stopAfter` parameter of the container.

```ts twoslash
import {describe, it, expect} from "vitest"
import {Container} from "@vifjs/sim-node/boot"
import {UnitTestStatus} from "@vifjs/sim-node"
import {Plugin} from "@vifjs/sim-node/plugin"

import {BuildSource, Provider} from "#source";
import {Ob} from "#pou";
import {UnitTest} from "@vifjs/language-builder/operations/unit";
import {Bool} from "@vifjs/language-builder/types/primitives";

const MyProgram = BuildSource({
    blocks: {
        "Main": new Ob(
            {
                interface: {
                    temp: {
                        ThisBool: new Bool(true)
                    }
                },
                body() {
                    return [new UnitTest("My first unit test", this.temp.ThisBool, "=", true)]
                }
            }
        ),
    }
})

// ---cut---
describe("MyTest", async () => {
    // Create a new Container instance and boot it
    const container = new Container()
    await container.boot()

    container.loadContainerParams({ // [!code ++]
        stopAfter: 6000 // [!code ++]
    }) // [!code ++]
    
    // Create a new plugin and get the async executor
    const plugin = new Plugin("vitest", 200)
    const getExecutor = await plugin.getAsyncExecutor().init(container)

    // Load the provider
    await getExecutor.loadProvider(Provider.toAst());
    // Load your program
    await getExecutor.loadProgram(MyProgram.toAst());
    
    // Start simulation with Main and await for unit test results
    const tests = await getExecutor.startAndWaitUnitTests("Main")

    tests.forEach(test => {
        it(test.description, () => {
            expect(test.status, test.fail_message + "\n")
                .to.be.equal(UnitTestStatus.Succeed)
        })
    })
})
```