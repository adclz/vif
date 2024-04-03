import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    test: {
        coverage: {
            enabled: true,
            all: true,
            reporter: ["html"]
        }
    },
    plugins: [tsconfigPaths()]
})