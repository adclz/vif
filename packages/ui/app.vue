<template>
  <div class="w-full h-screen" style="background-color: var(--va-background-primary)">
    <va-navbar id="navbar">
      <template #left>
        <va-navbar-item class="logo">
          VifUi
        </va-navbar-item>
        <va-navbar-item class="logo">
          {{ runnerFile ? runnerFile : 'Unknown' }}
        </va-navbar-item>
        <va-navbar-item>
          <VaButton @click="showConfigModal = !showConfigModal">
            Config
          </VaButton>
          <VaModal
              v-model="showConfigModal"
              hide-default-actions
          >
            <ConfigModal/>
            <template #footer="{ ok }">
              <VaButton @click="ok()"> Ok </VaButton>
            </template>
          </VaModal>
        </va-navbar-item>
        <va-navbar-item>
          <Compile/>
        </va-navbar-item>
      </template>
      <template #center>
        <LanguageService/>
      </template>
      <template #right>
        <div @click="next()">
          <DeviceTvIcon v-if="state === 'auto'" class="cursor-pointer"/>
          <Brightness2Icon v-if="state === 'light'" class="cursor-pointer"/>
          <MoonIcon v-if="state === 'dark'" class="cursor-pointer"/>
        </div>
      </template>
    </va-navbar>
    <DockLayout ref="dockLayout" class="w-full" :class="`height: 100vh - ${navbarHeight}px`"
                :style="`height: calc(100vh - ${navbarHeight}px - 4px)`" :theme="colorMode">
      <template #panelRender="{ panel }">
        <template v-if="panel.key==='plc'">
          <div id="plc"/>
          <Suspense>
            <Plc/>
          </Suspense>
        </template>
        <template @resize="useTerminal().fit()" v-else-if="panel.key==='terminal'">
          <Terminal id="terminal"/>
        </template>
        <template v-else-if="panel.key==='breakpoints'">
          <Breakpoints id="breakpoints"/>
        </template>
        <template v-else-if="panel.key==='unit-tests'">
          <div id="unit_tests"/>
          <Suspense>
            <UnitTests/>
          </Suspense>
        </template>
        <template v-else-if="panel.key==='monitor'">
          <div id="monitor"/>
          <Suspense>
            <Monitor/>
          </Suspense>
        </template>
        <template v-else-if="panel.key==='stack'">
          <Stack id="stack"/>
        </template>
      </template>
      <template #tabItemRender="{ dockData, panel, onTabItemMouseDown, onTabItemDragStart, onTabItemDragEnd }">
        <div
            class="w-max" style="background-color: var(--va-background-primary)"
            :draggable="true"
        >
          {{ panel.title }}
        </div>
      </template>
    </DockLayout>
  </div>
</template>
<script setup lang="ts">
import {Brightness2Icon, DeviceTvIcon, MoonIcon} from "vue-tabler-icons";
import {useColorMode, useCycleList} from "@vueuse/core";
import {useColors} from "vuestic-ui";
import {useTerminal} from "~/stores/terminal";
import Breakpoints from "~/components/breakpoints.vue";
import {DockLayout, type DockLayoutInterface} from '@imengyu/vue-dock-layout';
import {ref} from "vue";
import ConfigModal from "@/components/modals/config-modal.vue";
import CompileProgram from "@/components/compile.vue";
import {useLayout} from "@/stores/dock-layout.js";
import type {State} from "@vifjs/language-service/dist/service.js";
import LanguageService from "@/components/language-service.vue";

const mode = useColorMode<"auto" | "light" | "dark">({emitAuto: true})
const colorMode = computed(() => mode.store.value === 'auto' ? mode.system.value : mode.store.value)
const {applyPreset} = useColors()
const {state, next} = useCycleList(['auto', 'dark', 'light'], {initialValue: mode})
watch(colorMode, mode => applyPreset(mode))
const dockLayout = ref<DockLayoutInterface>();
const showConfigModal = ref(false)
const showExportModal = ref(false)

const {
  providerName,
  runnerFile,
  ServicesState
} = storeToRefs(useLanguageService())

const Plc = defineAsyncComponent(() =>
    import('./components/plc.vue')
);

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

const navbarHeight = ref(0)

onMounted(async () => {
  watchEffect(() => mode.value = state.value as any)

  const color = useColorMode().value
  applyPreset(color)

  useTerminal().fit()
  await useContainer().initContainer()

  const persistLayout = useLayout().getLayoutData
  if (persistLayout)
    dockLayout.value?.setData(persistLayout)
  else {
    dockLayout.value?.setData({
      name: 'root',
      size: 0,
      grids: [
        {
          size: 20,
          name: 'left',
          grids: [
            {
              size: 50,
              name: 'leftA',
            },
            {
              size: 50,
              name: 'leftB',
            },
          ]
        },
        {
          size: 60,
          name: 'center',
          grids: [
            {
              size: 75,
              name: 'centerA',
            },
            {
              size: 25,
              name: 'centerB',
            },
          ]
        },
        {
          size: 20,
          name: 'right',
          grids: [
            {
              size: 50,
              name: 'rightA',
            },
            {
              size: 50,
              name: 'rightB',
            },
          ]
        },
      ],
    });
  }

  dockLayout.value?.addPanels([
    {
      key: 'plc',
      title: 'Plc',
    },
  ], 'leftA');
  dockLayout.value?.addPanels([
    {
      key: 'breakpoints',
      title: 'Breakpoints',
    },
  ], 'leftB');
  dockLayout.value?.addPanel({
    key: 'terminal',
    title: 'Terminal',
  }, 'centerA');
  dockLayout.value?.addPanels([
    {
      key: 'unit-tests',
      title: 'Unit tests',
    },
  ], 'centerB');
  dockLayout.value?.addPanels([
    {
      key: 'monitor',
      title: 'Monitor',
    },
  ], 'rightB');
  dockLayout.value?.addPanels([
    {
      key: 'stack',
      title: 'Stack',
    },
  ], 'rightA');

  await nextTick()

  const terminalEl = document.querySelector('#terminal') as HTMLDivElement
  const plcWrapper = document.querySelector('#plc') as HTMLDivElement
  const monitorWrapper = document.querySelector('#monitor') as HTMLDivElement
  const stackWrapper = document.querySelector('#stack') as HTMLDivElement
  const breakpointsWrapper = document.querySelector('#breakpoints') as HTMLDivElement
  const unitTestsWrapper = document.querySelector('#unit_tests') as HTMLDivElement

  const rs = new ResizeObserver((ev) => {
    terminalEl!.style.height = terminalEl.parentElement!.style.height
    terminalEl!.style.width = terminalEl.parentElement!.style.width
    useTerminal().fit()
  })

  rs.observe(monitorWrapper.parentElement!)
  rs.observe(stackWrapper.parentElement!)
  rs.observe(plcWrapper.parentElement!)
  rs.observe(breakpointsWrapper.parentElement!)
  rs.observe(unitTestsWrapper.parentElement!)

  window.addEventListener('beforeunload', (event) => {
    useLayout().saveState(dockLayout.value?.getSaveData())
  })

  const navBarEl = document.getElementById("navbar")!
  const nbRs = new ResizeObserver((ev) => {
    navbarHeight.value = navBarEl.clientHeight
  })

  nbRs.observe(navBarEl)
})

</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@200&family=Raleway:wght@100;200;300;400;500;600;700;800;900&display=swap');
@import '@imengyu/vue-dock-layout/lib/vue-dock-layout.css';

.dock-split-dragger:hover {
  background-color: var(--va-info) !important;
  z-index: 99 !important;
}

.dock-split-dragger {
  border: none !important;
}

*::-webkit-scrollbar {
  background-color: var(--va-background-element);
}

*::-webkit-scrollbar-thumb {
  background-color: var(--va-background-border);
}

@keyframes blink-grayscale {
  0% {
    filter: grayscale(100%);
  }
  100% {
    filter: grayscale(0%);
  }
}

.animate-blink {
  animation: blink-grayscale 1s infinite;
}

.va-modal {
  z-index: 99;
}

</style>