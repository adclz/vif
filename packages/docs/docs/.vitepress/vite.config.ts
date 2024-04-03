import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import { cjsInterop } from "vite-plugin-cjs-interop";
import wasm from "vite-plugin-wasm";
import metaUrlPlugin from '@chialab/esbuild-plugin-meta-url';

export default defineConfig({
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                metaUrlPlugin()
            ]
        },
        exclude: [
            "@vifjs/sim-web"
        ],
        include: [
            'mermaid'
        ]
    },
    worker: {
        plugins: () => [
            wasm(),
        ]
    },
    server: {
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin'
        },
        cors: true,
    },
    preview: {
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
        },
    },
    plugins: [
        UnoCSS(
            fileURLToPath(new URL('./uno.config.ts', import.meta.url)),
        ),
        cjsInterop({
            dependencies: [
                "xterm"
            ]
        }),
        {
            name: "configure-response-headers",
            configureServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    next();
                });
            },
        },
    ],
})
