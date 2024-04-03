<template>
  <div class="w-full flex flex-col items-center gap-4">
    <div class="flex flex-row gap-2">
    <button @click="displaySnippet = !displaySnippet"
            class="flex flex-row p-2 gap-1 font-bold bg-gray-600 rounded-md hover:bg-gray-500 text-white">
      <ChevronDownIcon v-if="displaySnippet"/>
      <ChevronRightIcon v-else/>
      Toggle Simulation
    </button>
    </div>
    <div :id="`snippet_${snippetId}`" class="w-full">
      <Snippet  v-if="displaySnippet" :snippet-id="snippetId" :program="program" :params="params" :mode="mode" :output-blocks="outputBlocks"/>
    </div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, PropType, ref, toRefs} from "vue";

import {BuildSource} from "@vifjs/standard/source";
import Snippet from "./Snippet.vue";
import {ChevronDownIcon, ChevronRightIcon} from "vue-tabler-icons"
import {ContainerParams} from "@vifjs/sim-web";

const snippetId = Math.floor(Math.random() * Date.now())

const props = defineProps({
  program: {
    type: Object as PropType<ReturnType<typeof BuildSource>>,
    required: true
  },
  params: {
    type: Object as PropType<ContainerParams>,
    required: false,
  },
  mode: {
    type: String as PropType<"unit" | "start" | "parse">,
    required: true
  },
  outputBlocks: {
    type: Array as PropType<string[]>,
    required: false
  },
  openInView: {
    type: Boolean,
    required: false
  }
})

const { program, params, mode, outputBlocks, openInView } = toRefs(props)
const displaySnippet = ref(false)
const openOnce = ref(false)

onMounted(() => {
  if (openInView.value) {
    const callback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !displaySnippet.value && !openOnce.value) {
          displaySnippet.value = true
          openOnce.value = true
        }
      });
    }

    const observer = new IntersectionObserver(callback);
    observer.observe(document.getElementById(`snippet_${snippetId}`));
  }
})

</script>