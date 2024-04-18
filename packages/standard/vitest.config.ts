import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    test: {
        coverage: {
            enabled: true,
            reportsDirectory: './reports/coverage',
            provider: 'istanbul',
            reporter: ["html"]  
        }
    },
    plugins: [tsconfigPaths()],
})