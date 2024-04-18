<template>
  <div class="w-full flex flex-col rounded-md p-2"        
       style="background-color: var(--vp-code-block-bg) !important">
    <div class="w-full flex flex-row gap-2">
    <button @click="run()"
            class="flex flex-row p-2 gap-1 font-bold bg-gray-700 rounded-md hover:bg-gray-500 text-white">
      <PlayerPlayIcon/>
      Run
    </button>
    <button 
        v-if="success"
        @click="showOutput = !showOutput; createOutput()"
        class="flex flex-row p-2 gap-1 font-bold bg-gray-700 rounded-md hover:bg-gray-500 text-white">
      <ChevronDownIcon v-if="showOutput"/>
      <ChevronRightIcon v-else/>
      See output
    </button>
    </div>
    <div v-show="!showOutput" :id="`snippet_wrapper${snippetId}`" 
       class="flex flex-col w-full p-2">
      <div :id="`terminal_wrapper${snippetId}`" class="pt-4 px-2">
        <div class="overflow-hidden" :id="`terminal${snippetId}`"/>
      </div>
      <Unit_tests :id="`unit_tests${snippetId}`" v-if="tests" :tests="tests"/>
    </div>
    <div class="snippetOutput p-2 overflow-auto max-h-2xl"v-show="showOutput">
      <div :id="`output${snippetId}`"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import {onMounted, PropType, ref, toRefs, watch} from "vue";
import {BuildSource} from "@vifjs/standard/source";
import {Plugin} from "@vifjs/sim-web/plugin";
import Unit_tests from "./UnitTests.vue";
import {CreateSnippet, Compile} from "./snippet";
import { codeToHtml } from 'shiki'
import {PlayerPlayIcon, ExternalLinkIcon, ChevronRightIcon, ChevronDownIcon} from "vue-tabler-icons";
import {VaModal, useColors} from "vuestic-ui";
import {ContainerParams} from "@vifjs/sim-web";

const props = defineProps({
  snippetId: {
    type: Number,
    required: true
  },
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
  }
})

const { program, params, mode, outputBlocks, snippetId } = toRefs(props)

const tests = ref()
const success = ref(false)
const showOutput = ref(false)
const terminal = ref<Terminal>()

const parseResultError = (result: any) => {
  const errp = JSON.parse(JSON.stringify(result)).error

  terminal.value.writeln("\x1b[1;31m" + errp.error + "\x1b[0;37m")
  if (errp.sim_stack.length) {
    terminal.value.writeln("> Simulation stack:")
    errp.sim_stack.forEach(stack => terminal.value.writeln("  at - " + stack))
  }

  if (errp.file_stack.length) {
    terminal.value.writeln("> File trace:")
    errp.file_stack.forEach(x => terminal.value.writeln(` at - file:///${x.file.replace("\\", "/")}:${x.line}:${x.column}`))
  }
}
const run = async () => {
  showOutput.value = false
  tests.value = null
  success.value = false
  const plugin = new Plugin("snippet", 100)
  plugin.on("messages", m => {
    terminal.value.clear()
    m.forEach(x => terminal.value.writeln(x))
  })
  
  const result = await CreateSnippet(program.value, plugin, "Main", mode.value, params.value)
  switch (mode.value) {
    case "unit": {
      if (result["ty"] == "vif-error") parseResultError(result)
      else {
        tests.value = result
        success.value = true
      }
      break;
    }
    case "parse":  {
      success.value = true
      break;
    }
    default: {
      if (result["ty"] == "vif-error") parseResultError(result)
      else success.value = true
      break;
    }
  }
}

const createOutput = async () => {
    const code = program.value.compileProgram()
    let fmtcode = ""
    console.log(program.value.toAst())
    if (outputBlocks.value) {
      Object.keys(code)
          .filter(x => outputBlocks.value.includes(x))
          .forEach(x => {
            code[x].forEach(y => fmtcode += y + "\n")
            fmtcode += "\n"
          })
    } 
    else Object.values(code)
        .forEach(x => x.forEach(y => fmtcode += y + "\n"))
    
    const html = codeToHtml(fmtcode, {
      lang: 'json',
      theme: 'vitesse-dark'
    })
        
  document.getElementById(`output${snippetId.value}`).innerHTML = await html
}

onMounted(async () => {
  const {applyPreset} = useColors()
  applyPreset("dark")
  
  const fitAddon = new FitAddon()

  terminal.value = new Terminal({
    convertEol: true,
    cursorBlink: true,
    lineHeight: 1.3,
    rows: 10,
    fontWeight: "100",
    theme: {
      selectionBackground: "rgba(37, 116, 169, 0.8)"
    }
  })

  terminal.value.open(document.getElementById(`terminal${snippetId.value}`))
  terminal.value.loadAddon(fitAddon)
  fitAddon.fit()
  
  const resizeObserver = new ResizeObserver(() => {
    fitAddon.fit()
  })

  resizeObserver.observe(document.getElementById(`snippet_wrapper${snippetId.value}`))
  await run()
})

</script>

<style>
@import 'xterm/css/xterm.css';

.xterm-viewport {
  background-color: var(--vp-code-block-bg) !important;
  font-family: 'Raleway', sans-serif;
  z-index: 0;
}

.xterm-rows {
  color: var(--va-text-primary) !important;
}

.xterm-rows > div > span {
  font-family: 'JetBrains Mono', monospace !important;
  letter-spacing: normal !important;
}

.snippetOutput .shiki {
  background-color: var(--vp-code-block-bg) !important;
}
</style>