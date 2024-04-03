<template>
  <div class="flex flex-col p-5 w-max">
    <div class="flex flex-row w-max items-around h-full">
      <div class="flex flex-col w-full h-full p-5 space-y-2">
        <va-button icon="play_arrow" @click="useContainer().start()"
                   :disabled="(useContainer().getProgramStatus === SimulationStatus.Stop ? started: true) 
                       && entrySelected.length === 0
                       && programStatus !== ParseStatus.Loaded"
                   color="#d9d9d9"
                   :class="started ? 'animate-blink': 'animate-blink'">
        </va-button>
        <va-button @click="useContainer().stop()"
                   :disabled="!useContainer().started"
                   icon="stop"
                   color="#d9d9d9">
        </va-button>
        <va-button @click="useContainer().pauseOrResume()"
                   :disabled="!useContainer().started"
                   :icon="paused ? 'skip_next' : 'pause'"
                   color="#d9d9d9">
        </va-button>
      </div>
      <div class="flex flex-col w-max p-6 h-full place-content-center items-center space-y-2">
        <va-badge text="Run" :class="started ? '' : 'grayscale'" color="success"/>
        <va-badge text="Pause" :class="paused ? '' : 'grayscale'" color="warning"/>
        <va-badge text="OnError" :class="error ? 'animate-blink' : 'grayscale'" color="danger"/>
      </div>
    </div>
    <div class="flex flex-col place-content-center space-y-4 w-full">
      <div class="flex flex-row space-x-2">
        <va-chip :disabled="providerStatus === ParseStatus.Loaded" size="small" color="info" square>
                <span
                    class="italic whitespace-nowrap">{{
                    providerName ? providerName : "Unknown"
                  }}</span>
        </va-chip>
        <va-button
            :disabled="providerStatus === ParseStatus.Loaded && !started"
            @click="useContainer().loadProviderPack()"
            size="small" square>
          Load
        </va-button>
      </div>
      <div class="flex flex-row space-x-2">
        <va-chip :disabled="providerStatus !== ParseStatus.Loaded && simulationStatus !== SimulationStatus.Start"
                 size="small" color="info" square>
          <span class="italic">Program</span>
        </va-chip>
        <div class="flex flex-row space-x-2">
          <va-button
              :disabled="providerStatus !== ParseStatus.Loaded && simulationStatus !== SimulationStatus.Start"
              @click="useContainer().loadProgramPack()" size="small" square>
            Load
          </va-button>
          <va-button
              :disabled="
                        simulationStatus !== SimulationStatus.Start &&
                        programStatus === ParseStatus.Empty"
              @click="useContainer().reset()" size="small" square color="warning">
            Reset
          </va-button>
        </div>
      </div>
      <va-select
          :options="entryPoints" class="max-h-1 w-max"
          :disabled="programStatus === ParseStatus.Empty"
          placeholder="Select an entry"
          v-model="entrySelected">
      </va-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useContainer} from "~/stores/container";
import {ParseStatus, SimulationStatus} from "@vifjs/sim-web";

const {
  entrySelected,
  started,
  paused,
  error,
  providerStatus,
  programStatus,
  simulationStatus,
  entryPoints
} = storeToRefs(useContainer());

const {
  ServicesState,
  providerName
} = storeToRefs(useLanguageService())
</script>

<style>
.va-dropdown__content-wrapper {
  z-index: 99 !important;
}
</style>