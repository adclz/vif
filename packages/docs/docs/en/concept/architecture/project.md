---
outline: deep
---

# Architecture

The basic architecture of a freshly started Vif project looks like this: 

```mermaid
flowchart LR
    A("Your code"):::Blue --> C:::Blue
    B("Provider"):::Blue --> C
    C("Final code") ===> Vitest:::Green
    C("Final code") ===> D("Task Runner"):::Red
    D("Task Runner") -..-> Agents:::Red
    D("Task Runner") -..-> E("User Interface"):::Red
    D("Task Runner") -..-> F("Custom tasks"):::Red
    
    classDef Red stroke:#f00
    classDef Blue stroke:#00f
    classDef Green stroke:#0f0
    
    click B href "/en/concept/architecture/providers" _blank
    click D href "/en/concept/architecture/task-runner" _blank
    click E href "/en/simulation/user-interface" _blank
    click Vitest href "/en/simulation/vitest-integration" _blank
    click Agents href "/en/concept/architecture/agents" _blank
```

To start a new Vif project, go to the [Install](/en/install/install) page.

## Basic usage

### Providers

See [Providers](/en/concept/architecture/providers)

### Task Runner

See [Task Runner](/en/concept/architecture/task-runner)

## Advanced

### Vitest

See [Vitest Integration](/en/simulation/vitest-integration)

### User Interface

See [User Interface](/en/simulation/user-interface)
