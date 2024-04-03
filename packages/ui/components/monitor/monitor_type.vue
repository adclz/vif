<template>
  <span>{{ variable.value.ty }}</span>
</template>

<script setup lang="ts">
const props = defineProps({
  variable: {
    type: Object,
    required: true
  }
})

const {variable} = toRefs(props)
</script>

<style scoped>

</style>