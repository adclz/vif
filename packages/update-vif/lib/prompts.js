const child_process = require("node:child_process")

module.exports = [
    {
        type: "checkbox",
        name: "update",
        message: "update-vif will check and update all @vifjs related package to their latest version, continue ?",
        choices: [
            { name: "Yes", value: "y" },
            { name: "No", value: "n" },
        ]
    },
]

