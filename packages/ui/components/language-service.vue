<template>
  <va-button-group>
    <va-button @click="showProviderModal = !showProviderModal"
               :color="getStateColor(ServicesState.provider.status)"
               :disabled="ServicesState.provider.status !== 2">
      Provider
    </va-button>
    <va-button @click="showProgramModal = !showProgramModal"
               :color="getStateColor(ServicesState.program.status)"
               :disabled="ServicesState.program.status !== 2">
      Program
    </va-button>
    <va-button @click="showCompilerModal = !showCompilerModal"
               :color="getStateColor(ServicesState.compiler.status)"
               :disabled="ServicesState.compiler.status !== 2">
      Compiler
    </va-button>
  </va-button-group>
  <va-modal
      v-model="showProviderModal"
      hide-default-actions
  >
    <ProviderState/>
    <template #footer="{ ok }">
      <VaButton @click="ok()"> Ok </VaButton>
    </template>
  </va-modal>
  <va-modal
      v-model="showProgramModal"
      hide-default-actions
  >
    <ProgramState/>
    <template #footer="{ ok }">
      <VaButton @click="ok()"> Ok </VaButton>
    </template>
  </va-modal>
  <va-modal
      v-model="showCompilerModal"
      hide-default-actions
  >
    <CompilerState/>
    <template #footer="{ ok }">
      <VaButton @click="ok()"> Ok </VaButton>
    </template>
  </va-modal>
</template>

<script setup lang="ts">
import CompilerState from "@/components/modals/compiler-state.vue";
import ProgramState from "@/components/modals/program-state.vue";
import ProviderState from "@/components/modals/provider-state.vue";

const {
  ServicesState
} = storeToRefs(useLanguageService())

const showProviderModal = ref(false)
const showProgramModal = ref(false)
const showCompilerModal = ref(false)

const getStateColor = (state: State) => {
  switch (state) {
    case 0:
      return "#808080"
    case 1:
      return "success"
    case 2:
      return "danger"
  }
}

</script>