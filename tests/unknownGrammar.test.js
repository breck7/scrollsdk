#! /usr/local/bin/node --use_strict

// todo: make isomorphic

const fs = require("fs")
const UnknownGrammarProgram = require("../built/grammar/UnknownGrammarProgram.js").default

const testTree = {}

testTree.predictGrammarFile = equal => {
  // Arrange
  const input = `file rain
 size 28
 digits 321 4324
 open true
 temp 32.1
 description Lorem ipsum, unless ipsum lorem.
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
  const expected = `grammar
 name foobar
 keywords
  size
  digits
  open
  temp
  description
  account
keyword size int
keyword digits
 cells int int
keyword open bool
keyword temp float
keyword description
 catchAllCellType any
keyword account
 any`

  // Act
  const types = new UnknownGrammarProgram(input).getPredictedGrammarFile("foobar")

  // Assert
  equal(types, expected)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("./testTreeRunner.js")(testTree)
module.exports = testTree
