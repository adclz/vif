# User Interface

::: tip
[init-vif](/en/install/install) will install this package automatically.
:::

<a href="https://www.npmjs.com/package/@vifjs/ui" target="_blank" class="flex flex-row gap-2 w-max">
    <img crossorigin="anonymous" alt="NPM License" src="https://img.shields.io/npm/l/@vifjs/ui">
    <img crossorigin="anonymous" alt="NPM Version" src="https://img.shields.io/npm/v/@vifjs/ui">
</a>


```sh [npx]
npx @vifjs/ui
```

VifUi is a [Nuxt](https://nuxt.com/) App running a graphical interface on top of [vif-sim](/en/simulation/introduction).

It uses the browser version of the simulation and can call an agent (if supported by browser / network configuration).

All the features of [vif-sim](/en/simulation/introduction) are present, from breakpoints to unit-tests and manual commands.

It can also listens for file changes in your IDE and open files locally if traces are present.