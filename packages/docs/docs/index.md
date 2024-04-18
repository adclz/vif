---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "ViF"
  text: "A Typescript-based plc language"
  tagline: "A subtle work of experimentation and improbability"
  image: "vif-logo-gray.svg"
  actions:
    - theme: brand
      text: Core
      link: /en/concept/core
    - theme: alt
      text: Install
      link: /en/install/install

features:
  - title: Run everywhere
    icon: 🌐
    details: Vif is built on top of typescript. It can run on (almost) all IDE.
  - title: Deploy everywhere
    icon: 📦
    details: Use any CI/CD, package manager, or git tools you want.
  - title: Simulate everywhere
    icon: 🕹️
    details: Plc simulator that can run in both browser & Node environments.
  - title: Batteries included
    icon: 🤖
    details: Highly customizable API.
---

<style>
.container .image .image-container .image-bg {
      animation: shoot 5s infinite linear;
}

@keyframes shoot {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}
</style>
<script setup>
import Container from "./components/Container.vue";
import DisplaySnippet from "./components/snippet/DisplaySnippet.vue";

import {UnitTest, UnitLog} from "#unit";
import {Ob, Fb, InstanceDb} from "#pou";
import {Bool} from "#primitives";
import {ArrayFrom} from "#complex";
import {Assign, Call} from "#basics";
import {BuildSource} from "#source";


const Program = () => {
  const Fibonacci_Suite_Until_10 = (OnFibNumber) =>
      new Array(9)
          .fill(1)
          .reduce((arr, _, i) => {
            arr.push((i <= 1) ? i : arr[i - 2] + arr[i - 1]);
            return arr
          }, [])
          .map(OnFibNumber);

  const MyFb = new Fb({
    interface: {
      static: {
        Fibonacci_Array_Until_10: ArrayFrom(34, () => new Bool())
      }
    },
    body() {
      return [
        ...Fibonacci_Suite_Until_10((FibNumber) => new Assign(this.static.Fibonacci_Array_Until_10[FibNumber], true)),
        ...Fibonacci_Suite_Until_10((FibNumber) => new UnitTest(
            `Checking index ${FibNumber} ...`,
            this.static.Fibonacci_Array_Until_10[FibNumber], "=", true)
        ),
        ...Fibonacci_Suite_Until_10((FibNumber) => new UnitLog(`\x1b[0;3${FibNumber}m A cool log!`))
      ]
    }
  });

  const InstanceDbOfFib = new InstanceDb(MyFb);

  return BuildSource({
    blocks: {
      "Main": new Ob({
        body() {
          return [new Call(InstanceDbOfFib, {})]
        }
      }),
      "MyFb": MyFb,
      "InstanceDbOfFib": InstanceDbOfFib
    }
  });
}
</script>

<Container>
<div class="flex flex-col items-center gap-10">
<div class="flex flex-wrap items-center justify-center gap-10 pt-10">
    <span class="text-5xl font-bold">Start coding <span class="text-blue">right now</span></span>

```sh [npx]
npx init-vif
```

</div>

<div class="flex flex-col gap-10 max-w-200 overflow-hidden">
    <span class="text-5xl font-bold">Create 🔨</span>
    <span>Anything that comes out of your mind.</span>
</div>

<div class="w-full">

::: code-group

```ts twoslash [Functionnal]
type UNSAFE_INDEX = 0

import {UnitTest, UnitLog} from "#unit";
import {Fb} from "#pou";
import {Bool} from "#primitives";
import {ArrayFrom} from "#complex";
import {Assign, Compare} from "#basics";

// ---cut---
const Fibonacci_Suite_Until_10 = <T>(OnFibNumber: (FibNumber: number) => T): T[] =>
    new Array(9)
        .fill(1)
        .reduce((arr, _, i) => {
            arr.push((i <= 1) ? i : arr[i - 2] + arr[i - 1])
            return arr
        }, [])
        .map(OnFibNumber)

const MyFb = new Fb({
    interface: {
        static: {
            Fibonacci_Array_Until_10: ArrayFrom(34, () => new Bool())
        }
    }, 
    body() {
        return [
            ...Fibonacci_Suite_Until_10((FibNumber) => new Assign(this.static.Fibonacci_Array_Until_10[FibNumber as UNSAFE_INDEX], true)),
            // Only for simulations
            ...Fibonacci_Suite_Until_10((FibNumber) => new UnitTest(
                `Checking index ${FibNumber} ...`,
                this.static.Fibonacci_Array_Until_10[FibNumber as UNSAFE_INDEX], "=", true)
            ),
            ...Fibonacci_Suite_Until_10((FibNumber) => new UnitLog(`\x1b[0;3${FibNumber}m A cool log!`))
        ]
    }
})
```
```ts twoslash [Imperative]
// @errors: 2345
type UNSAFE_INDEX = 0

import {UnitTest, UnitLog} from "#unit";
import {Fb} from "#pou";
import {Bool} from "#primitives";
import {ArrayFrom} from "#complex";
import {Assign, Compare} from "#basics";

// ---cut---
const MyFb = new Fb({
    interface: {
        static: {
            Fibonacci_Array_Until_10: ArrayFrom(34, () => new Bool())
        }
    }, 
    body() {
        return [
            ...(() => {
                let n1 = 0
                let n2 = 1
                let nextTerm
                let assign_operations = []
                let unit_operations = []
                let log_operations = []
                for (let i = 1; i <= 10; i++) {
                    assign_operations.push(new Assign(this.static.Fibonacci_Array_Until_10[i as UNSAFE_INDEX], true))
                    // Only for simulations
                    unit_operations.push(new UnitTest(
                        `Checking index ${i} ...`,
                        this.static.Fibonacci_Array_Until_10[i as UNSAFE_INDEX], "=", true
                    ))
                    log_operations.push(new UnitLog(`\x1b[0;3${i}m A cool log!`))
                    nextTerm = n1 + n2;
                    n1 = n2;
                    n2 = nextTerm
                }
                return [assign_operations, unit_operations].flat()
            })()
        ]
    }
})
```

:::

</div>

<div class="flex flex-col items-center w-full gap-10">
    <span class="text-5xl font-bold">Simulate 🎰</span>
    <div class="flex flex-col gap-10 w-full">
        <span class="text-center">Plc simulator with unit tests, logs, breakpoints and more</span>
        <ClientOnly>
            <DisplaySnippet :openInView="true" :program="Program()" mode="unit" :outputBlocks="['file:///MyFb']"/>
        </ClientOnly>
    </div>
</div>

<div class="flex flex-wrap w-full justify-around items-center gap-10">
    <a style="text-decoration: none !important; color: var(--vp-c-text-1) !important;" href="https://vif.adclz.net/en/simulation/vitest-integration">
        <div class="flex flex-col items-center gap-10 p-6 cursor-pointer rounded VPFeature"
            style="background-color: var(--vp-c-bg-soft);">
            <span class="text-3xl font-bold">Vitest integration ⚡</span>
        </div>
    </a>
    <a style="text-decoration: none !important; color: var(--vp-c-text-1) !important;" href="https://vif.adclz.net/en/simulation/user-interface">
        <div class="flex flex-col items-center gap-10 p-6 cursor-pointer rounded VPFeature"
            style="background-color: var(--vp-c-bg-soft);">
            <span class="text-3xl font-bold">User Interface 🎲</span>
        </div>
    </a>
</div>

</div>
</Container>


