#! /usr/local/bin/node
const reporter = require("tap-mocha-reporter")
const exec = require("child_process").exec

const proc = exec("node " + __dirname + "/testAll.js")

proc.stdout.pipe(reporter("dot"))
proc.stderr.on("data", data => console.error("stderr: " + data.toString()))
