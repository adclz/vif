<template>
  <div class="flex flex-col gap-2 w-max h-max">
    <h3> Program </h3>
    <div id="err-compiler"></div>
  </div>
</template>

<script setup lang="ts">

const {
  ServicesState
} = storeToRefs(useLanguageService())

const updateStatus = (states: any) => {
  const El = document.querySelector('#err-program') as HTMLDivElement

  const Term = useTerminal().getNewTerminal(El)

  if (states.compiler.status === 2)
    if (states.compiler.error["ty"] === "vif-error")
      useTerminal().printVifError(Term, states.compiler.error.error)
    else states.compiler.error.error.split("\n").forEach(x => Term.writeln(x))
}

onMounted(() => {
  watch(ServicesState.value, states => updateStatus(states))
  updateStatus(ServicesState.value)
})
</script>
