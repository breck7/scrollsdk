#!/usr/bin/env ts-node

// todo: make isomorphic

const { Disk } = require("../products/Disk.node.js")

import { treeNotationTypes } from "../products/treeNotationTypes"
import { UnknownGrammarProgram } from "../core/UnknownGrammarProgram"
const { jtree } = require("../index.js")

const testTree: treeNotationTypes.testTree = {}

testTree.predictGrammarFile = equal => {
  // Arrange
  const input = Disk.read(__dirname + "/UnknownGrammar.sample.tree")

  // Act
  const grammarFile = new UnknownGrammarProgram(input).inferGrammarFileForAKeywordLanguage("foobar")

  // Assert
  equal(grammarFile, Disk.read(__dirname + "/UnknownGrammar.expected.grammar"), "predicted grammar correct")
}

testTree.emojis = equal => {
  const source = `⌨🕸🌐
 📈
  🏦😎
 📉
  💩`

  // Act
  const grammarFile = new UnknownGrammarProgram(source).inferGrammarFileForAKeywordLanguage("emojiLang")
  // Assert
  equal(grammarFile, Disk.read(__dirname + "/UnknownGrammar.expectedEmoji.grammar"), "predicted emoji grammar correct")
}

const langs = Disk.dir(__dirname + `/../langs/`)
langs.forEach((name: string) => {
  const folder = `${__dirname}/../langs/${name}`
  if (!Disk.isDir(folder)) return
  testTree[`${name}InferPrefixGrammar`] = equal => {
    // Arrange
    const path = __dirname + `/../langs/${name}/sample.${name}`
    const sampleCode = jtree.TreeNode.fromDisk(path).toString()

    // todo: cleanup
    if (Disk.read(__dirname + `/../langs/${name}/${name}.grammar`).includes("nonPrefixGrammar")) return equal(true, true, `skipped ${name} beause not prefix grammar`)

    // Act
    const inferredPrefixGrammarCode = new UnknownGrammarProgram(sampleCode).inferGrammarFileForAKeywordLanguage("foobar")
    const inferredPrefixGrammarProgram = new jtree.HandGrammarProgram(inferredPrefixGrammarCode)
    const rootProgramConstructor = inferredPrefixGrammarProgram.compileAndReturnRootConstructor()
    const programParsedWithInferredGrammar = new rootProgramConstructor(sampleCode)

    // Assert
    equal(inferredPrefixGrammarProgram.getAllErrors().length, 0, `no errors in inferred grammar program for language ${name}`)
    equal(programParsedWithInferredGrammar.getAllErrors().length, 0, `no errors in program from inferred grammar for ${name}`)
  }
})

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)

export { testTree }
