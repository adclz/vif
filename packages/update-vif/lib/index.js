#! /usr/bin/env node

const chalk = require("chalk");
const sao = require("sao")
const path = require('path')
const fs = require('fs')
const cac = require('cac')
const { version } = require('../package.json')

const cli = cac("create-vif")

const generator = path.resolve(__dirname, './');

sao({generator, outDir: "./", logLevel: 2})     
    .run()
    .catch((err) => {
        console.trace(err)
        process.exit(1)
    })
 