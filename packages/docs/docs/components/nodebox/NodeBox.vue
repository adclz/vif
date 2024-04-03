<template>
  <iframe credentialless :id="`nodebox_runtime_${snippetId}`"></iframe>
  <iframe credentialless :id="`nodebox_preview_${snippetId}`"></iframe>
</template>

<script setup lang="ts">
import { Nodebox } from "@codesandbox/nodebox";
import {onMounted} from "vue";

const snippetId = Math.floor(Math.random() * Date.now())

onMounted(async () => {
  const previewIframe = document.getElementById(`nodebox_preview_${snippetId}`)
  const runtimeIframe = document.getElementById(`nodebox_runtime_${snippetId}`)
  
  const emulator = new Nodebox({
    iframe: runtimeIframe,
  });
  
  await emulator.connect();
  await emulator.fs.init({
    "package.json": JSON.stringify({
      name: "my-app",
      scripts: {
        dev: "vitest --ui",
      },
      dependencies: {
        "vitest": "latest",
        "@vitest/ui": "latest",
      },
    }),
    "main.js": `
    import { exec } from 'node:child_process';
    
    await exec('npm run test')
    `,
    "main.test.ts": `
    
import { describe, expect, it } from 'vitest';

describe('MAIN', () => {
  const h = new BroadcastChannel("kllh")
  it('J', () => expect(true).to.be.equal(true));
});`
  });
  const shell = emulator.shell.create();
  shell.on("progress", (status) => console.log(status));
  shell.stderr.on("data", (data) => {
    console.log("Error:", data);
  });
  shell.stdout.on("data", (data) => {
    console.log("Output:", data);
  });
  shell.on("exit", (status) => console.log(status));
  const serverCommand = await shell.runCommand("dev", [""]);
  console.log(serverCommand);

  const previewInfo = await emulator.preview.getByShellId(serverCommand.id);

  previewIframe.setAttribute("src", previewInfo.url);
})
</script>

<style scoped>

</style>