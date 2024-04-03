---
outline: deep
---

# State Machines

State machines are built-in vif functions which tells vif sim how to behave on certain cases.

Indeed, [vif-sim](/en/simulation/introduction) is silly, it does not know timers are supposed to works, neither for counters.

Instead of writing directly the behavior of each timer & counter blocks, Vif gives you state machines operations and the
possibility to execute specific operations on each state.

## Timers

```ts twoslash
import {Timer_State_Machine} from "@vifjs/language-builder/internal/state-machines";
```

`Timer_State_Machine` has the following fields:

 - **start**: An operation that must return a boolean telling if the timer must be started or not.
 - **reset**: An operation that must return a boolean telling if the timer has to be reset, regardless of its state (optional).
 - **preset_var**: The Preset Time variable, can be Time or LTime.
 - **timer_var**: The Elapsed Time variable, can be Time or LTime.
 - **on_timer_elapsed**: List of void operations to execute when elapsed time has reached preset time.
 - **on_timer_reset**: List of void operations to execute when the timer has been reset.

## Counters

```ts twoslash
import {Counter_State_Machine} from "@vifjs/language-builder/internal/state-machines";
```

`Counter_State_Machine` has the following fields:

 - **increment**: An operation that must return a boolean telling if the counter has to be incremented.
 - **decrement**: An operation that must return a boolean telling if the counter has to be decremented (optional).
 - **reset** An operation that must return a bool telling if the counter has to be reset, regardless of its state (optional).
 - **preset_var**: The Preset Value variable, can be any integer.
 - **counter_var**: The Elapsed Value variable, can be any integer.
 - **on_counter_down**: List of void operations to execute when Elapsed Value has reached Preset Value (when decrementing).
 - **on_counter_up**: List of void operations to execute when Elapsed Value has reached Preset Value (when incrementing).
 - **on_counter_reset**: List of void operations to execute when the counter has been reset