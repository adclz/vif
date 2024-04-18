// https://nuxt.com/docs/api/configuration/nuxt-config
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import wasm from "vite-plugin-wasm";
import metaUrlPlugin from '@chialab/esbuild-plugin-meta-url';
import {fileURLToPath} from "node:url";

export default defineNuxtConfig({
    devServer: {
        port: 3001
    },
    ssr: false,
    modules: [
        "@vuestic/nuxt",
        "@nuxtjs/tailwindcss",
        "@pinia/nuxt"
    ],
    routeRules: {
        '/**': {
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Expose-Headers': '*',
                "Cross-Origin-Embedder-Policy": "require-corp",
                "Cross-Origin-Opener-Policy": "same-origin"
            },
        },
        '/_nuxt/**': {
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Expose-Headers': '*',
                "Cross-Origin-Embedder-Policy": "require-corp",
                "Cross-Origin-Opener-Policy": "same-origin"
            },
        },
    },
    // Hacky, but works 
    ...(process.env.NODE_ENV === "production" && {
        nitro: {
            entry: fileURLToPath(new URL("./preset/entry.ts", import.meta.url))
        }
    }),
    vite: {
        plugins: [
            {
                name: "configure-response-headers",
                configureServer: (server) => {
                    server.middlewares.use((_req, res, next) => {
                        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                        next();
                    });
                },
            },
            wasm()
        ],
        optimizeDeps: {
            exclude: [
                "@vifjs/sim-web"
            ],
            esbuildOptions: {
                plugins: [
                    metaUrlPlugin()
                ]
            }
        },
        worker: {
            plugins: () => [
                wasm(),
            ]
        },
        build: {
            target: 'esnext',
            rollupOptions: {
                external: [
                    "@vifjs/sim-node",
                    "@vifjs/language-service",
                    "@vifjs/standard"
                ],
                plugins: [
                    dynamicImportVars({
                        include: [
                            "./components/**"
                        ]
                    })
                ]
            }
        },
        server: {
            headers: {
                'Cross-Origin-Embedder-Policy': 'require-corp',
                'Cross-Origin-Opener-Policy': 'same-origin',
            },
            cors: true,
        },
        preview: {
            headers: {
                'Cross-Origin-Embedder-Policy': 'require-corp',
                'Cross-Origin-Opener-Policy': 'same-origin',
            },
        },
    },
    devtools: {enabled: true},
})
