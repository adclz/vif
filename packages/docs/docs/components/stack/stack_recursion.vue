<template>
  <div  class="h-full w-full overflow-auto no-va p-1 border rounded-md">
    <div @click="toggleChildren = !toggleChildren"
         class="flex flex-row gap-2 cursor-pointer">
      <IconChevronRight v-if="!toggleChildren"/>
      <IconChevronDown v-else class="w-5"/>
      <span class="rounded px-1 text-white"
            :class="stack['ty'] === 'Fb' ? 'bg-cyan-600' :
                    stack['ty'] === 'ob' ? 'bg-purple-700' :
                    stack['ty'] === 'Unit_block' ? 'bg-amber-700' : ''">
        {{ stack['ty'] }}
      </span>
      <span>{{ stack['name'] }}</span>
    </div>
    <div v-if="toggleChildren && stack['content']" class="pl-6 pt-2"
         v-for="content in stack['content']">
      <div v-if="typeof content === 'string'" v-html="convert.toHtml(content)"/>
      <StackRecursion v-else :stack="content"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {IconChevronRight, IconChevronDown} from "@tabler/icons-vue";
import Convert from "ansi-to-html";
import {toRefs, ref} from "vue";

const props = defineProps({
  stack: Object
})

const {stack} = props

const convert = new Convert({
  colors: [
    "#2e3436",
    "#cc0000",
    "#4e9a06",
    "#c4a000",
    "#3465a4",
    "#75507b",
    "#06989a",
    "#d3d7cf",
    "#555753",
    "#ef2929",
    "#8ae234",
    "#fce94f",
    "#729fcf",
    "#ad7fa8",
    "#34e2e2",
    "#eeeeec"
  ]
})

const toggleChildren = ref(false)
</script>