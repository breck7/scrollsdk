#! /usr/local/bin/node --use_strict

const quack = require("./quack.js")

const fs = require("fs")
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
  const jibberishGrammarCode = fs.readFileSync(grammarPath, "utf8")
  const sampleJibberishCode = fs.readFileSync(__dirname + "/jibberish/sample.jibberish", "utf8")

  // Act
  const grammarProgram = new GrammarProgram(jibberishGrammarCode, grammarPath)
  const rootParserClass = grammarProgram.getRootParserClass()
  const program = new rootParserClass(sampleJibberishCode)

  // Assert
  equal(program instanceof jibberishProgram, true, "correct program class")

  // Act
  const fooNode = program.getNode("foo")
  const fooDef = fooNode.getDefinition()
  const constNode = program.getNode("nodeWithConsts")
  const nodeDef = constNode.getDefinition()

  // Assert
  equal(fooDef.getKeyword(), "foo")
  equal(nodeDef.getKeyword(), "nodeWithConsts")

  // Act
  const constObj = nodeDef.getConstantsObject()

  // Assert
  equal(constObj.greeting, "hello world")
})
