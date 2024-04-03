export default defineEventHandler(async (event) => {
    return {config: await useStorage().getItem<boolean>('vif-sim:launched')}
})