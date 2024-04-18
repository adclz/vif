<template>
  <div class="flex flex-col p-5">
    <div v-if="unitTests" class="flex flex-row items-center space-x-2" v-for="key in Object.keys(unitTests)">
      <va-badge :id="unitTests[key].id" :color="getStatusColor(unitTests[key].status)"
                :text="getStatusText(unitTests[key].status)"></va-badge>
      <span>[{{ unitTests[key].id }}]</span>
      <span>{{ unitTests[key].description }}</span>
      <span v-if="!unitTests[key].path">[No trace]</span>
      <span v-else
            @click="useLanguageService().openInEditor(`file:///${unitTests[key].path.file.replace('\\', '/')}:${unitTests[key].path.line}:${unitTests[key].path.column}`)"
            class="cursor-pointer hover:border-b">
            {{
          `${unitTests[key].path.file.replace("\\", "/")}:${unitTests[key].path.line}:${unitTests[key].path.column}`
        }}
          </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useContainer} from "~/stores/container.js";
import {UnitTestStatus} from "@vifjs/sim-web";

const getStatusText = (status: UnitTestStatus) => {
  switch (status) {
    case UnitTestStatus.Unreached:
      return '-'
    case UnitTestStatus.Failed:
      return "FAIL"
    case UnitTestStatus.Succeed:
      return "SUCCESS"
  }
}

const getStatusColor = (status: UnitTestStatus) => {
  switch (status) {
    case UnitTestStatus.Unreached:
      return 'warning'
    case UnitTestStatus.Failed:
      return "danger"
    case UnitTestStatus.Succeed:
      return "success"
  }
}

const {
  unitTests
} = storeToRefs(useContainer())
</script>

<style>

</style>