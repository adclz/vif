export default defineEventHandler(async (event) => {
    return {ports: await useStorage().getItem<{ baseUrl: string, socket: number, server: number }>('vif-sim:network')}
})