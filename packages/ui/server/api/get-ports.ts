export default defineEventHandler(async (event) => {
    return {ports: await useStorage().getItem<{ socket: number, server: number }>('vif-sim:ports')}
})