#!/usr/bin/env ts-node

const { TestRacer } = require("../products/TestRacer.node.js")
const { GrammarCompiler } = require("../products/GrammarCompiler.js")
import { treeNotationTypes } from "../products/treeNotationTypes"

const testTree: treeNotationTypes.testTree = {}

testTree.compileGrammarAndCreateProgram = equal => {
  // Arrange
  const jibberishRootDir = __dirname + "/../langs/jibberish/"
  const programPath = jibberishRootDir + "sample.jibberish"
  const grammarPath = jibberishRootDir + "jibberish.grammar"

  // Act
  const program = GrammarCompiler.compileGrammarAndCreateProgram(programPath, grammarPath)
  const result = program.execute()

  // Assert
  equal(program.constructor.name, "jibberishNode", "parent program class parsed correctly")
  equal(result, 42)
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)

export { testTree }
