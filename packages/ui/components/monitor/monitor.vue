<template>
  <div v-show="monitorSchemas.length" class="flex flex-row overflow-auto h-full w-full gap-2 p-5">
    <div class="flex flex-col">
      <VaInput
          v-model="searchValue"
          placeholder="Search"
      />
      <div class="flex flex-row gap-2 p-5">
        <div class="flex flex-col gap-1">
          <va-badge color="primary" text="Path"/>
          <MonitorPath :variable="variable" v-for="(variable, index) in monitorSchemas.filter((_x, i) => incl(i))"/>
        </div>
        <div class="flex flex-col gap-1">
          <va-badge color="primary" text="Type"/>
          <MonitorType :variable="variable" v-for="(variable, index) in monitorSchemas.filter((_x, i) => incl(i))"/>
        </div>
        <div class="flex flex-col gap-1">
          <va-badge color="primary" text="Value"/>
          <MonitorValue :variable="variable" v-for="(variable, index) in monitorSchemas.filter((_x, i) => incl(i))"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useContainer} from "~/stores/container.js";
import MiniSearch from "minisearch"

const {
  monitorSchemas,
} = storeToRefs(useContainer());

const searchValue = ref("")

const miniSearch = new MiniSearch({
  fields: ["path", "ty", "value"]
})

const incl = (index: number): boolean => searchResults.value.length ? searchResults.value.includes(index) : true

watch(monitorSchemas, m => {
  miniSearch.removeAll()
  miniSearch.addAll(m.map((x, id) => ({id, ...x})))
})

const searchResults = computed(() => miniSearch.search(searchValue.value).map(x => x.id))

</script>
