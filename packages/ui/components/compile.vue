<template>
  <va-button-group>
    <va-button @click="download" :disabled="ServicesState.compiler.status !== 1">
      <DownloadIcon/>
      Download
    </va-button>
    <va-button @click="exportVif" :disabled="ServicesState.compiler.status !== 1 && protocol">
      <PackageExportIcon/>
      Export
    </va-button>
  </va-button-group>
  <va-modal
      v-model="showTokenModal"
      hide-default-actions
  >
    <div class="flex flex-col gap-4 w-full items-center h-max">
      <span class="text-xl font-bold self-baseline"> Export </span>
      <div class="flex flex-row gap-2 items-end self-baseline">
        <va-input
            label="Compiler Url (optional)"
            v-model="CompilerURL"/>
        <va-button @click="openCompiler" class="w-max h-max">
          Open Compiler
        </va-button>
      </div>
      <div class="flex flex-row gap-2 self-baseline">
        <va-input
            type="text"
            placeholder="Paste your token here"
            v-model="token"
        />
        <va-button class="w-max"
                   :disabled="Exporting"
                   @click="tryExport()">Export
        </va-button>
      </div>
      <va-avatar
          v-if="Exporting || ExportingStatus"
          :color="ExportingStatus ? ExportingStatus === 'Ok' ? 'success' : 'danger' : 'success'"
          :loading="Exporting"
      >
        {{ ExportingStatus }}
      </va-avatar>
    </div>
    <template #footer="{ ok }">
      <VaButton @click="ok()"> Ok </VaButton>
    </template>
  </va-modal>
</template>

<script setup lang="ts">
import {DownloadIcon, PackageExportIcon} from "vue-tabler-icons";

const {
  ServicesState,
  protocol
} = storeToRefs(useLanguageService())

const CompilerURL = ref("http://127.0.0.1")

const download = async () => {
  const data = await compile()
  const aElement = document.createElement('a');
  aElement.setAttribute('download', "vif-file.json");
  const json = JSON.stringify(data);
  const blob = new Blob([json], {type: "application/json"});
  const href = URL.createObjectURL(blob);
  aElement.href = href;
  aElement.setAttribute('target', '_blank');
  aElement.click();
  URL.revokeObjectURL(href);
}

const showTokenModal = ref(false)
const token = ref("")
const Exporting = ref(false)
const ExportingStatus = ref("")

const exportVif = async () => {
  showTokenModal.value = true
}

const openCompiler = () => window.open(`${protocol.value}:--web`, "_self")

const tryExport = async () => {
  Exporting.value = true
  const data = await compile()
  if (data instanceof Error) {
    Exporting.value = false
    ExportingStatus.value = "Fail"
    return
  }
  const port = token.value.substring(0, token.value.indexOf('-'))
  fetch(`${CompilerURL.value}:${port}/`, {
    method: "POST",
    body: JSON.stringify(data)
  })
      .then(x => {
        console.log(x)
        Exporting.value = false
        ExportingStatus.value = "Ok"
      })
      .catch(x => {
        Exporting.value = false
        ExportingStatus.value = "Fail"
        throw x
      })
}

const compile = async () => {
  try {
    return await useLanguageService().getCompiled()
  } catch (e) {
    return e
  }
}

</script>