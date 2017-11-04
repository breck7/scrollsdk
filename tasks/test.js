#! /usr/local/bin/node

const recursiveReadSync = require("recursive-readdir-sync")

require("./unit.js")

const allFiles = recursiveReadSync(__dirname + "/../tests/")

allFiles.filter(file => file.endsWith(".test.js")).forEach(file => require(file))