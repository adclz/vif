module.exports = [
    {
        name: 'name',
        message: 'Provider Name:',
        default: '{outFolder}'
    },
    {
        type: "checkbox",
        name: "options",
        message: "Options",
        choices: [
            { name: "vitest - Unit test framework", value: "vitest" }
        ]
    }
]
