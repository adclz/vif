const child_process = require("node:child_process")

const isProtocolInstalled = (provider) => {
    if (process.platform === "win32")
        if (provider === "@vifjs/s7-1200" || provider === "@vifjs/s7-1500")
            return child_process.spawnSync("powershell", [`
                $path = Get-Item -Path registry::HKEY_CLASSES_ROOT\\vif-agent-s7
                    if ($null -eq $path) {
                        exit 1
                    else {
                        exit 0
                    }'
                `]).status === 0
    return false
}

module.exports = [
    {
        name: 'name',
        message: 'Project Name:',
        default: '{outFolder}'
    },
    {
        type: 'list',
        name: 'provider',
        message: 'Provider:',
        choices: [
            { name: "Standard", value: '@vifjs/standard'},
            { name: "S7 1200", value: '@vifjs/s7-1200'},
            { name: "S7 1500", value: '@vifjs/s7-1500'}
        ],
        default: '@vifjs/standard'
    },
    {
        type: "checkbox",
        name: "options",
        message: "Options",
        choices: [
            { name: "Ui - Plc simulation in browser (will be added to task main)", value: "@vifjs/ui" },
            { name: "node-watch - Watch for file changes (will be added to task main)", value: "node-watch" },
            { name: "Vitest - Unit test framework", value: "vitest" },
        ]
    },
    {
        name: "protocol",
        message: "The provider you choose does not seem to have its protocol installed, check out https://vif.adclz.net/en/concept/agents",
        when: (answers) => isProtocolInstalled(answers.provider),
    }
]

