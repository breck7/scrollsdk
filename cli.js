#! /usr/bin/env node --use_strict

const fs = require("fs")
const os = require("os")

const TreeProgram = require("./index.js")
const ConsoleApp = require("./consoleApp.js")

const languagesPath = os.homedir() + "/languages.tree"
const app = new ConsoleApp(languagesPath)

const action = process.argv[2]
const param = process.argv[3]

if (app[action]) app[action](param)
else if (!action) app.help()
else if (fs.existsSync(action)) app.run(action)
else console.log(`Unknown command '${action}'. Type 'tree help' to see available commands.`)
