<template>
  <iframe class="" :id="`webcontainer_${snippetId}`"></iframe>
</template>

<script setup lang="ts">
import { WebContainer } from "@webcontainer/api";
import { files } from './files';
import {onMounted} from "vue";

const snippetId = Math.floor(Math.random() * Date.now())

onMounted(async () => {
  /** @type {import('@webcontainer/api').WebContainer}  */
  let webcontainerInstance;
  
  // Call only once
  webcontainerInstance = await WebContainer.boot();
  await webcontainerInstance.mount(files);

  const exitCode = await installDependencies();
  if (exitCode !== 0) {
    throw new Error('Installation failed');
  };

  startDevServer();
  async function installDependencies() {
    // Install dependencies
    const installProcess = await webcontainerInstance.spawn('npm', ['install']);
    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
      }
    }))
    // Wait for install command to exit
    return installProcess.exit;
  }

  async function startDevServer() {
    // Run `npm run start` to start the Express app
    await webcontainerInstance.spawn('npm', ['run', 'test']);

    // Wait for `server-ready` event
    webcontainerInstance.on('server-ready', (port, url) => {
      document.getElementById(`webcontainer_${snippetId}`)!.src = `${url}/__vitest__/`;
    });
  }
})
</script>

<style scoped>

</style>