#! /usr/bin/env node

// todo: make isomorphic

const fs = require("fs")
const UnknownGrammarProgram = require("../built/tools/UnknownGrammarProgram.js").default

const testTree = {}

testTree.predictGrammarFile = equal => {
  // Arrange
  const input = `file rain
 size 28
 digits 321 4324
 open true
 temp 32.1
 description Lorem ipsum, unless ipsum lorem.
 edits
  0
   data Test
  1
   data Test2
 account
  balance 24
  transactions 32
  source no http://www.foo.foo 32
file test
 digits 321 435
 size 3
 description None.
 open false
 temp 32.0
 account
  balance 32.12
  transactions 321
  source yes http://to.to.to 31`

  // Act
  const types = new UnknownGrammarProgram(input).getPredictedGrammarFile("foobar")

  // Assert
  equal(types, fs.readFileSync(__dirname + "/unknownGrammar.expected.grammar", "utf8"), "predicted grammar correct")
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../builder/testTreeRunner.js")(testTree)
module.exports = testTree
