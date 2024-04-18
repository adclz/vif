import persistedstate from "pinia-plugin-persistedstate"

export default defineNuxtPlugin(({$pinia}) => {
    $pinia.use(persistedstate)
})