#!/usr/bin/env ts-node

// todo: make isomorphic

import { readFileSync } from "fs"
import jTreeTypes from "../core/jTreeTypes"
import { UnknownGrammarProgram } from "../core/UnknownGrammarProgram"
import jtree from "../core/jtree.node"

const testTree: jTreeTypes.testTree = {}

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
  const grammarFile = new UnknownGrammarProgram(input).inferGrammarFileForAPrefixLanguage("foobar")

  // Assert
  equal(grammarFile, readFileSync(__dirname + "/UnknownGrammar.expected.grammar", "utf8"), "predicted grammar correct")
}

testTree.inferAll = equal => {
  // Arrange/Act
  ;["hakon", "swarm", "dug", "stump", "project", "jibberish", "jibjab", "fire", "stamp", "zin", "newlang"].map(name => {
    // Arrange
    const path = __dirname + `/../langs/${name}/sample.${name}`
    const sampleCode = jtree.TreeNode.fromDisk(path).toString()

    // Act
    const grammarCode = new UnknownGrammarProgram(sampleCode).inferGrammarFileForAPrefixLanguage("foobar")
    const grammarProgram = new jtree.GrammarProgram(grammarCode)
    const rootProgramConstructor = grammarProgram.getRootConstructor()
    const program = new rootProgramConstructor(sampleCode)

    // Assert
    equal(grammarProgram.getAllErrors().length, 0, `no errors in inferred grammar program for language ${name}`)
    equal(program.getAllErrors().length, 0, `no errors in program from inferred grammar for ${name}`)
  })
}

testTree.emojis = equal => {
  const source = `⌨🕸🌐
 📈
  🏦😎
 📉
  💩`

  // Act
  const grammarFile = new UnknownGrammarProgram(source).inferGrammarFileForAPrefixLanguage("emojiLang")
  // Assert
  equal(grammarFile, readFileSync(__dirname + "/UnknownGrammar.expectedEmoji.grammar", "utf8"), "predicted grammar correct")
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.Utils.runTestTree(testTree)

export { testTree }
