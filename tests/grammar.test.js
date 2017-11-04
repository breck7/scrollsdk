#! /usr/local/bin/node --use_strict

const quack = require("./quack.js")

const fs = require("fs")
const TreeProgram = require("../index.js")
const GrammarProgram = require("../src/grammar/GrammarProgram.js")
const jibberishProgram = require("./jibberish/jibberishProgram.js")

quack.quickTest("basics", equal => {
  // Arrange
  const program = new GrammarProgram()

  // Act

  // Assert
})

quack.quickTest("jibberish", equal => {
  // Arrange
  const grammarPath = __dirname + "/jibberish/jibberish.grammar"

  // Act
  const program = new GrammarProgram(fs.readFileSync(grammarPath, "utf8"), grammarPath)
  const rootParserClass = program.getRootParserClass()

  // Assert
  equal(rootParserClass, jibberishProgram)
})

