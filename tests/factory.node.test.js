#! /usr/local/bin/node --use_strict

const jtree = require("../index.js")
const jibberishProgram = require("../langs/jibberish/jibberishProgram.js")

const testTree = {}

testTree.makeProgram = equal => {
  // Arrange
  const programPath = __dirname + "/../langs/jibberish/sample.jibberish"
  const grammarPath = __dirname + "/../langs/jibberish/jibberish.grammar"

  // Act
  const program = jtree.makeProgram(programPath, grammarPath)
  const result = program.executeSync()

  // Assert
  equal(program instanceof jibberishProgram, true, "parent program class parsed correctly")
  equal(result, 42)

  // jtree.getProgramClassFromGrammarFile
}

/*NODE_JS_ONLY*/ if (!module.parent) require("./testTreeRunner.js")(testTree)
module.exports = testTree
