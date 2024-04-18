<template>
  <div v-if="tests" class="flex flex-col p-5 overflow-auto">
    <div class="flex flex-row items-center space-x-2 w-max truncate" v-for="key in Object.keys(tests)">
      <VaBadge :id="tests[key].id" :color="getStatusColor(tests[key].status)"
               :text="getStatusText(tests[key].status)"></VaBadge>
      <span>{{ tests[key].description }}</span>
      <span v-if="tests[key].fail_message" class="text-red">{{ tests[key].fail_message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {UnitTestStatus} from "@vifjs/sim-web";
import {toRefs} from "vue";
import {VaBadge} from "vuestic-ui";

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

const props = defineProps({
  tests: {
    type: Object,
    required: true
  }
})

const { tests } = toRefs(props)
</script>

<style>

</style>