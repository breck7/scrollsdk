#! /usr/local/bin/node --use_strict

const jtree = require("../index.js")
const CLI = require("../cli/cli.js")

const combined = jtree.combineFiles([__dirname + "/../langs/jibberish/jibberish.grammar", __dirname + "/../langs/jibjab/jibjab.gram"])

combined.delete("tooling")
const path = __dirname + "/../langs/jibjab/jibjab.grammar"
combined.toDisk(path)

new CLI().prettify(path)
