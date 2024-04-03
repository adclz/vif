import {defineConfig} from 'vitepress'
import vite from './vite.config'
import {withMermaid} from "vitepress-plugin-mermaid";
import {transformerTwoslash} from '@shikijs/vitepress-twoslash'

const CONCEPT = [
    {text: 'Core', link: '/en/concept/core'},
    {text: 'Architecture', link: '/en/concept/architecture'},
    {text: 'Task Runner', link: '/en/concept/task-runner'},
    {text: 'Agents', link: '/en/concept/agents'},
    {
        text: 'Agents', collapsed: true, items: [
            {text: 'S7', link: '/en/concept/s7'}
        ]
    }
]

const LANGUAGE = [
    {text: 'Pou', link: '/en/language/pou'},
    {
        text: 'Types', collapsed: true, items: [
            {text: 'Primitives', link: '/en/language/types/primitives'},
            {text: 'Complex', link: '/en/language/types/complex'},
            {text: 'Generics', link: '/en/language/types/generics'},
        ]
    },
    {
        text: 'Operations', collapsed: true, items: [
            {text: 'Basics', link: '/en/language/operations/basics'},
            {text: 'Program Control', link: '/en/language/operations/program-control'},
            {text: 'Math', link: '/en/language/operations/math'},
            {text: 'Binary', link: '/en/language/operations/binary'},
            {text: 'Unit', link: '/en/language/operations/unit'},
            {text: 'Timers ↗', link: '/en/language/operations/timers'},
            {text: 'Counters ↗', link: '/en/language/operations/counters'},
            {text: 'Signal Edges ↗', link: '/en/language/operations/signal-edges'},
        ]
    },
    {
        text: 'Other', collapsed: true, items: [
            {text: 'Volar', link: '/en/language/volar'},
            {text: 'Ai Assistants', link: '/en/language/ai-assistants'}
        ]
    }
]

const SIMULATION = [
    {text: 'Introduction', link: '/en/simulation/introduction'},
    {text: 'Boot', link: '/en/simulation/boot'},
    {text: 'Plugins', link: '/en/simulation/plugins'},
    {text: 'Async executor', link: '/en/simulation/async-executor'},
    {text: 'Vitest integration', link: '/en/simulation/vitest-integration'},
    {text: 'User Interface', link: '/en/simulation/user-interface'}
]

const ADVANCED = [
    {text: 'Abstract syntax tree', link: '/en/advanced/ast'},
    {
        text: 'Create a provider', collapsed: true, items: [
            {text: 'Set up a provider', link: '/en/advanced/set-up-a-provider'},
            {text: 'Factories', link: '/en/advanced/factories'},
            {text: 'Templates', link: '/en/advanced/template'},
            {text: 'State Machines', link: '/en/advanced/state-machines'},
            {text: 'Internal Operations', link: '/en/advanced/internal-operations'},
            {text: 'Compiler', link: '/en/advanced/compiler'}
        ]
    },
]


// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
    title: "Vif",
    description: "Vif official website",
    markdown: {
        theme: {
            light: "light-plus",
            dark: "dark-plus"
        },
        codeTransformers: [
            transformerTwoslash({
                explicitTrigger: true,
                twoslashOptions: {
                    compilerOptions: {
                        "module": 199,
                        "moduleResolution": 99,
                        "target": 99,
                        "strict": true
                    },
                }
            }),
        ],
    },
    vite,
    themeConfig: {
        logo: '/vif-logo-gray.svg',
        editLink: {
            pattern: 'https://github.com/adclz/vif/tree/main/packages/docs/docs/:path'
        },
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: 'Concept', items: CONCEPT, activeMatch: '/en/concept'},
            {text: 'Install', link: '/en/install/install', collapsed: false, activeMatch: '/en/install'},
            {text: 'Language', items: LANGUAGE, activeMatch: '/en/language'},
            {text: 'Simulation', items: SIMULATION, activeMatch: '/en/simulation'},
            {text: 'Advanced', items: ADVANCED, activeMatch: '/en/advanced'},
            {text: 'Notes', link: '/en/notes/notes'}
        ],

        search: {
            provider: "local"
        },

        sidebar: [
            {
                items: [
                    {text: 'Concept', items: CONCEPT, collapsed: true},
                    {text: 'Install', link: '/en/install/install', collapsed: false},
                    {text: 'Language', items: LANGUAGE, collapsed: true},
                    {text: 'Simulation', items: SIMULATION, collapsed: true},
                    {text: 'Advanced', items: ADVANCED, collapsed: true},
                ]
            }
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/adclz/vif/' },
            { icon: 'mail', link: 'me@adclz.net' },
        ],
        footer: {
            message: 'Released under the <a href="https://github.com/adclz/vif/blob/main/Licence.txt">MIT License</a>.',
            copyright: 'Copyright © 2023-present <a href="https://github.com/adclz/vif/">Adrien Clauzel</a> - <a href="mailto:me@adclz.net">me@adclz.net</a>'
        },
        head: [
            ['meta', { name: 'theme-color', content: '#ffffff' }],
            ['link', { rel: 'icon', href: '/vif-logo-gray.svg', type: 'image/svg+xml' }],
            ['meta', { name: 'author', content: 'PAdrien Clauzel' }],
            ['meta', { property: 'og:title', content: 'Shiki' }],
            ['meta', { property: 'og:description', content: 'A javascript base plc language' }],
            ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }],
        ],
    }
}))

