---
outline: deep
---

# Install

::: info
Vif requires [Nodejs](https://nodejs.org/en) v18+
:::

## init-vif

<a href="https://www.npmjs.com/package/init-vif" target="_blank" class="flex flex-row gap-2 w-max">
    <img crossorigin="anonymous" alt="NPM License" src="https://img.shields.io/npm/l/init-vif">
    <img crossorigin="anonymous" alt="NPM Version" src="https://img.shields.io/npm/v/init-vif">
</a>

Vif provides a [npx](https://www.npmjs.com/package/npx) package which will set up a fresh dev environment.

```sh [npx]
npx init-vif
```

Usage:

```sh
npx init-vif [outDir]
```

```
┌  Generating Vif project in [outDir]
│
◇  Project Name:
│  My Project
│
◇  Provider:
│  ○ Standard
│  ○ S7-1200
│  ○ S7-1500
│
◇  Options:
│  ○ Ui - Plc simulation in browser (will be added to task main)
│  ○ node-watch - Watch for file changes (will be added to task main)
│  ○ Vitest - Unit test framework
│
```

If the provider you have chosen do not have a corresponding URL protocol installed, a warning will be raised.

For security reasons, [init-vif](/en/install/install) will not download any executable file, check [Agents](/en/concept/agents).

Once you have generated your project, you should see the following structure:

```
├── tasks
│   └──  main.js
│ 
├── code
│   └──  main.ts
│ 
├── tests
│   └──  main.test.ts
│
└── package.json
```

- main.js see [Task Runner](/en/concept/task-runner).
- main.ts see [Architecture](/en/concept/architecture).
- main.test.ts see [Vitest Integration](/en/simulation/vitest-integration).

By default, [init-vif](/en/install/install) will create all internal imports of the provider in your package.json.

Since all imports have to be the same on all providers, you can copy and paste all the code examples of this
documentation safely.

## Others

All other packages which are not installed by [init-vif](/en/install/install) have a dedicated page for installation:

 - [init-vif-provider](/en/advanced/set-up-a-provider)
 - [vif-agent-s7](/en/concept/s7)
 - [volar](/en/language/volar)
 - [ui](/en/simulation/user-interface)