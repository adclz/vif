export const useLayout = defineStore({
    id: "layout",
    state: () => ({
        "layoutData": null
    }),

    getters: {
        getLayoutData: state => state.layoutData
    },

    actions: {
        saveState(data: any) {
            this.layoutData = data
        }
    },
    persist: true
})