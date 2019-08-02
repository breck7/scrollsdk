#!/usr/bin/env ts-node

import jtree from "./jtree.node"
import jTreeTypes from "./jTreeTypes"
import { TestTreeRunner } from "../builder/TestTreeRunner"

const jibberishRootDir = __dirname + "/../langs/jibberish/"

const testTree: jTreeTypes.testTree = {}

testTree.makeProgram = equal => {
  // Arrange
  const programPath = jibberishRootDir + "sample.jibberish"
  const grammarPath = jibberishRootDir + "jibberish.grammar"

  // Act
  const program = jtree.makeProgram(programPath, grammarPath)
  const result = program.executeSync()

  // Assert
  equal(program.constructor.name, "jibberishNode", "parent program class parsed correctly")
  equal(result, 42)

  // jtree.getProgramClassFromGrammarFile
}

/*NODE_JS_ONLY*/ if (!module.parent) new TestTreeRunner().run(testTree)

export { testTree }
