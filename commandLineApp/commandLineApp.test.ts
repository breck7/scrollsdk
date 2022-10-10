#!/usr/bin/env ts-node

const fs = require("fs")
const mkdirp = require("mkdirp")

const { jtree } = require("../index.js")

import { CommandLineApp } from "./commandLineApp.node"
import { treeNotationTypes } from "../products/treeNotationTypes"

const testTree: treeNotationTypes.testTree = {}

const commandLineAppTempHome = __dirname + `/../ignore/commandLineAppTempHome/`
const commandLineAppTempRegistryFile = commandLineAppTempHome + "grammars.ssv"
const grammarPath = __dirname + "/../langs/grammar/grammar.grammar"

if (fs.existsSync(commandLineAppTempHome) && fs.existsSync(commandLineAppTempRegistryFile)) fs.unlinkSync(commandLineAppTempRegistryFile)
mkdirp.sync(commandLineAppTempHome)

testTree.consoleBasics = equal => {
  // Arrange
  const app = new CommandLineApp(commandLineAppTempRegistryFile)

  if (!app.isRegistered("grammar")) app.register(grammarPath)

  // Act/Assert
  equal(typeof app.getGrammars().toString(), "string")
  equal(typeof app.help(), "string")
  equal(typeof app.list(), "string", "list works")
  equal(typeof app.version(), "string", "version ok")

  // Act
  const grammarErrors = app.check(grammarPath)
  const jibErrors = app.check(__dirname + "/../langs/jibberish/jibberish.grammar")

  // Assert
  equal(grammarErrors.includes("0 errors"), true, grammarErrors)
  equal(jibErrors.includes("0 errors"), true, jibErrors)
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)

export { testTree }
