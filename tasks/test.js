#! /usr/local/bin/node

const jtree = require("../index.js")
const recursiveReadSync = require("recursive-readdir-sync")

require("./base.js")

const allFiles = recursiveReadSync(__dirname + "/../tests/")

allFiles.filter(file => file.endsWith(".test.js")).forEach(file => require(file))

allFiles
  .filter(file => file.endsWith(".swarm"))
  .forEach(file => jtree.executeFile(file, "/Users/breck/swarm/src/swarm.grammar"))
