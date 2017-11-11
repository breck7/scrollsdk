#! /usr/bin/env node --use_strict

const fs = require("fs")

const ConsoleApp = require("./consoleApp.js")

const app = new ConsoleApp()

const action = process.argv[2]
const paramOne = process.argv[3]
const paramTwo = process.argv[4]

if (app[action]) {
  app.addToHistory(action, paramOne, paramTwo)
  console.log(app[action](paramOne, paramTwo))
} else if (!action) {
  app.addToHistory()
  console.log(app.help())
} else if (fs.existsSync(action)) {
  app.addToHistory(undefined, action)
  console.log(app.run(action))
} else console.log(`Unknown command '${action}'. Type 'tree help' to see available commands.`)
