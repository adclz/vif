<template>
  <div class="flex flex-col p-5 gap-2">
    <va-button-group>
      <va-button v-if="breakpoints.length" class="w-max" size="small" color="warning"
                 :disabled="disabledEnableAll"
                 @click="enableAllBreakpoints()">Enable All
      </va-button>
      <va-button v-if="breakpoints.length" class="w-max" size="small" color="warning"
                 :disabled="disabledDisableAll"
                 @click="disableAllBreakpoints()">Disable All
      </va-button>
    </va-button-group>
    <div v-if="breakpoints.length"
         :class="breakpoint.status === BreakPointStatus.Active ? 'bg-blue-900 px-1 rounded blink' : ''"
         class="flex flex-row items-center gap-2 w-max"
         v-for="breakpoint in breakpoints">
      <va-button v-if="breakpoint.status !== BreakPointStatus.Disabled"
                 @click="disableBreakpoint(breakpoint.id)"
                 :disabled="disabledButtons[breakpoint.id]"
                 size="small" color="info">Disable
      </va-button>
      <va-button v-else
                 @click="enableBreakpoint(breakpoint.id)"
                 :disabled="disabledButtons[breakpoint.id]"
                 size="small" color="warning">Enable
      </va-button>
      <span>[{{ breakpoint.id }}]</span>
      <span v-if="!breakpoint.path">[No trace]</span>
      <span v-else
            @click="useLanguageService().openInEditor(`file:///${breakpoint.path.file.replace('\\', '/')}:${breakpoint.path.line}:${breakpoint.path.column}`)"
            class="cursor-pointer hover:border-b">
            {{ `${breakpoint.path.file.replace("\\", "/")}:${breakpoint.path.line}:${breakpoint.path.column}` }}
          </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useContainer} from "~/stores/container.js";
import {useLanguageService} from "~/stores/language-service.js";
import {BreakPointStatus} from "@vifjs/sim-web";
import {watch} from "vue"

const {
  breakpoints,
  pause
} = storeToRefs(useContainer())

const disabledButtons = ref({})
const disabledEnableAll = ref(false)
const disabledDisableAll = ref(false)

const enableBreakpoint = (bp: number) => {
  useContainer().enableBreakpoint(bp)
  disabledButtons.value[bp] = true
}

const disableBreakpoint = (bp: number) => {
  useContainer().disableBreakpoint(bp)
  disabledButtons.value[bp] = true
}

const enableAllBreakpoints = () => {
  disabledEnableAll.value = true
  useContainer().enableAllBreakpoints()
}

const disableAllBreakpoints = () => {
  disabledDisableAll.value = true
  useContainer().disableAllBreakpoints()
}

watch(breakpoints, () => {
  disabledButtons.value = {}
  disabledEnableAll.value = false
  disabledDisableAll.value = false
}, {deep: true})

</script>

<style>
.blink {
  -webkit-animation: blink 3s infinite both;
  animation: blink 3s infinite both;
}

@-webkit-keyframes blink {
  0%,
  50%,
  100% {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0.5;
  }
}

@keyframes blink {
  0%,
  50%,
  100% {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0.5;
  }
}
</style>