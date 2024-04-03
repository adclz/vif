<template>
  <div class="overflow-hidden p-2" style="background-color: var(--va-background-element)"/>
</template>

<script setup lang="ts">
import {useTerminal} from "~/stores/terminal.js";

onMounted(() => {
  const terminalEl = document.querySelector('#terminal') as HTMLDivElement

  useTerminal().open(terminalEl)
})

</script>

<style>
@import 'xterm/css/xterm.css';

.xterm-viewport {
  background-color: var(--va-background-element) !important;
  font-family: 'Raleway', sans-serif;
}

.xterm-rows {
  color: var(--va-text-primary) !important;
}

.xterm-rows > div > span {
  font-family: 'JetBrains Mono', monospace !important;
  letter-spacing: normal !important;
}
</style>