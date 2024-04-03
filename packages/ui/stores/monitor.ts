import {defineStore} from 'pinia'

export const useMonitorStore = defineStore({
    id: 'monitor',


    state: (): {
        stack: Stack[]
    } => ({
        stack: []
    }),

    getters: {
        getStack: state => state
    },

    actions: {
        setStack(stack: Stack[]) {
            this.stack = stack
        },
        reset() {
            this.stack = []
        }
    }
})

interface Stack {

}