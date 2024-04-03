<template>
  <span style="color: var(--va-primary); background-color: var(--va-background-primary)" class="px-2"
        :id="variable.value.id">{{ variable.value.value }}</span>
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