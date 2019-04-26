#! /usr/local/bin/node

const jtree = require("../index.js")
const recursiveReadSync = require("recursive-readdir-sync")
const quack = require("../tests/quack.js")

quack.runTestTree(require("../tests/base.js"))

const allFiles = recursiveReadSync(__dirname + "/../tests/")

allFiles.filter(file => file.endsWith(".test.js")).forEach(file => require(file))

allFiles
  .filter(file => file.endsWith(".swarm"))
  .forEach(file => jtree.executeFile(file, __dirname + "/../langs/swarm/swarm.grammar"))
