#! /usr/local/bin/node

const TreeBase = require("./TreeBase.js")
const port = 4444
const app = new TreeBase(__dirname + "/planets/", __dirname + "/planets.grammar")
app.startApp(port)
