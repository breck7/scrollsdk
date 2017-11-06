#! /usr/local/bin/node --use_strict

const quack = require("./quack.js")

const TreeTools = require("../index.js")

quack.quickTest("version", equal => {
  // Arrange/Act/Assert
  equal(!!TreeTools.getVersion(), true)
})
