<template>
  <div class="flex flex-col gap-4 w-full items-center h-max">
    <span class="text-xl font-bold self-baseline"> Config </span>
    <div class="flex flex-row gap-2 h-max items-end">
      <va-select
          label="Simulation mode"
          v-model="SimulationMode"
          :options="[
              { text: 'Infinite', value: 0 },
              { text: 'Stop on Unit tests', value: 1 }
          ]">

      </va-select>
      <va-button @click="useContainer().loadParams({stopOn: SimulationMode.value})" class="h-max">
        Load params
      </va-button>
    </div>
    <div>
      <div>
        <span class="font-bold">Provider: </span> <span>{{ providerName }}</span>
      </div>
      <div>
        <span class="font-bold">Source file: </span> <span>{{ runnerFile }}</span>
      </div>
      <div>
        <span class="font-bold">Runner Server port: </span> <span>{{ ports.server }}</span>
      </div>
      <div>
        <span class="font-bold">Runner Socket port: </span> <span>{{ ports.socket }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {StopOn} from "@vifjs/sim-web";

const {
  providerName,
  runnerFile,
  ports
} = storeToRefs(useLanguageService())

const {
  loadParams
} = useContainer()



const SimulationMode = ref({text: 'Stop on Unit tests', value: 1})

</script>

<style scoped>

</style>