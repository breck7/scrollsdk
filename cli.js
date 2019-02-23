#! /usr/bin/env node --use_strict

const fs = require("fs")

const ConsoleApp = require("./consoleApp.js")

const app = new ConsoleApp()

const action = process.argv[2]
const paramOne = process.argv[3]
const paramTwo = process.argv[4]
const print = console.log

if (app[action]) {
  app.addToHistory(action, paramOne, paramTwo)
  print(app[action](paramOne, paramTwo))
} else if (!action) {
  app.addToHistory()
  print(app.help())
} else if (fs.existsSync(action)) {
  app.addToHistory(undefined, action)
  print(app.run(action))
} else print(`Unknown command '${action}'. Type 'tree help' to see available commands.`)
