#! /usr/bin/env node --use_strict

const fs = require("fs")
const os = require("os")

const TreeProgram = require("./index.js")
const ConsoleApp = require("./consoleApp.js")

const languagesObj = new TreeProgram(fs.readFileSync(os.homedir() + "/languages.tree", "utf8")).toObject()
const app = new ConsoleApp(languagesObj)

const action = process.argv[2]
const param = process.argv[3]

if (app[action]) app[action](param)
else console.log(`Unknown command '${action}'. Type 'tree help' to see available commands.`)
