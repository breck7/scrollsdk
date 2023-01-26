#!/usr/bin/env ts-node

import { treeNotationTypes } from "../products/treeNotationTypes"
const path = require("path")
const { TestRacer } = require("../products/TestRacer.node.js")
const { Disk } = require("../products/Disk.node.js")
const { TreeNode } = require("../products/TreeNode.js")
const { HandGrammarProgram, UnknownGrammarProgram } = require("../products/GrammarLanguage.js")
const { GrammarCompiler } = require("../products/GrammarCompiler.js")

const testTree: treeNotationTypes.testTree = {}

// todo: turn prettier off for test running? seems like it might increase test time from 2s to 5s...
// todo: setup: make vms dir. cleanup? delete grammar file when done?

const outputDir = path.join(__dirname, "..", "ignore", "vms")
const langsDir = path.join(__dirname, "..", "langs")

const mkdirp = require("mkdirp")
mkdirp.sync(outputDir)

const makeProgram = (grammarCode: string, code: string) => {
  const grammarProgram = new HandGrammarProgram(grammarCode)
  const rootProgramConstructor = grammarProgram.compileAndReturnRootConstructor()
  return new rootProgramConstructor(code)
}

testTree.grammar = equal => {
  // Arrange
  const grammarGrammarPath = path.join(langsDir, "grammar", "grammar.grammar")
  try {
    const tempFilePath = GrammarCompiler.compileGrammarForNodeJs(grammarGrammarPath, outputDir, false)

    // Act
    const grammar = require(tempFilePath)

    // Assert
    equal(!!new grammar(), true, "it compiled")
  } catch (err) {
    console.error(err)
  } finally {
  }
}

testTree.compileAll = equal => {
  // Arrange/Act
  const langs = "hakon swarm dug stump project jibberish config poop jibjab fire stamp zin newlang chuck"
  langs.split(" ").map(name => {
    try {
      // Act
      const grammarPath = path.join(langsDir, name, `${name}.grammar`)
      const grammarCode = TreeNode.fromDisk(grammarPath)
      const tempFilePath = GrammarCompiler.compileGrammarForNodeJs(grammarPath, outputDir, false)
      const rootClass = require(tempFilePath)

      // Assert
      equal(true, true, `Expected to compile and include "${name}" without error.`)

      // Act
      // todo: should we have an example node for all langs?
      const exampleProgram = grammarCode.getNode("grammar example")
      if (exampleProgram) {
        const testProgram = new rootClass(exampleProgram.childrenToString())
        // todo: should we then execute it? compile it?

        // Assert
        equal(testProgram.getAllErrors().length, 0, `no errors in test ${name} program`)
      }

      // Act/ Assert
      equal(new rootClass(Disk.read(path.join(langsDir, name, `sample.${name}`))).getAllErrors().length, 0, `no errors in ${name} sample program`)
    } catch (err) {
      console.log(err)
      equal(true, false, "Hit an error")
    }
  })
}

testTree.jibberish = equal => {
  // Arrange
  try {
    const tempFilePath = GrammarCompiler.compileGrammarForNodeJs(path.join(langsDir, `jibberish/jibberish.grammar`), outputDir, false)

    // Act
    const jibberish = require(tempFilePath)

    // Assert
    equal(!!new jibberish(), true, "it compiled")

    // Arrange
    const program = new jibberish(`nodeWithConsts`)

    // Act/Assert
    equal(program.nodeAt(0).score1, 28, "constants work")
  } catch (err) {
    console.error(err)
  } finally {
  }
}

testTree.numbers = equal => {
  // Arrange
  const numbersGrammarPath = path.join(langsDir, `numbers/numbers.grammar`)
  const numbersGrammarCode = Disk.read(numbersGrammarPath)
  const makeNumbersRunTimeProgram = (code: string) => makeProgram(numbersGrammarCode, code)
  try {
    const tempFilePath = GrammarCompiler.compileGrammarForNodeJs(numbersGrammarPath, outputDir, false)

    // Act
    const numbers = require(tempFilePath)

    // Assert
    equal(!!new numbers(), true, "it compiled")

    // Arrange/Act
    const code = `+ 2 3
* 2 3 10`
    const program = new numbers(code)
    const firstNode = program.nodeAt(0)
    const runtimeProgram = makeNumbersRunTimeProgram(code)

    // Assert
    equal(firstNode.numbersCell.length, 2, "cell getters work")
    equal(firstNode.numbersCell[0], 2, "typings work")
    equal(program.execute().join(" "), "5 60", "execute works")
    equal(program.getAllErrors().length, 0, "no errors found")
    if (program.getAllErrors().length) console.log(program.getAllErrors())

    equal(firstNode.getDefinition().getLineHints(), "+: operatorCell numbersCell...", "line hints work")
    equal(program.toCellTypeTree(), runtimeProgram.toCellTypeTree(), "cell types worked")

    // Arrange/Act/Assert
    equal(new numbers(`+ 2 a`).getAllErrors().length, 1, "should be 1 error")
  } catch (err) {
    console.error(err)
  } finally {
  }
}

testTree.predictGrammarFile = equal => {
  // Arrange
  const input = Disk.read(path.join(__dirname, "UnknownGrammar.sample.tree"))

  // Act
  const grammarFile = new UnknownGrammarProgram(input).inferGrammarFileForAKeywordLanguage("foobar")

  // Assert
  equal(grammarFile, Disk.read(path.join(__dirname, "UnknownGrammar.expected.grammar")), "predicted grammar correct")
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
  equal(grammarFile, Disk.read(path.join(__dirname, "UnknownGrammar.expectedEmoji.grammar")), "predicted emoji grammar correct")
}

const langs = Disk.dir(langsDir)
langs.forEach((name: string) => {
  const folder = path.join(langsDir, `${name}`)
  if (!Disk.isDir(folder)) return
  testTree[`${name}InferPrefixGrammar`] = equal => {
    // Arrange
    const samplePath = path.join(langsDir, name, `sample.${name}`)
    const sampleCode = TreeNode.fromDisk(samplePath).toString()

    // todo: cleanup
    if (Disk.read(path.join(langsDir, name, `${name}.grammar`)).includes("nonPrefixGrammar")) return equal(true, true, `skipped ${name} beause not prefix grammar`)

    // Act
    const inferredPrefixGrammarCode = new UnknownGrammarProgram(sampleCode).inferGrammarFileForAKeywordLanguage("foobar")
    const inferredPrefixGrammarProgram = new HandGrammarProgram(inferredPrefixGrammarCode)
    const rootProgramConstructor = inferredPrefixGrammarProgram.compileAndReturnRootConstructor()
    const programParsedWithInferredGrammar = new rootProgramConstructor(sampleCode)

    // Assert
    equal(inferredPrefixGrammarProgram.getAllErrors().length, 0, `no errors in inferred grammar program for language ${name}`)
    equal(programParsedWithInferredGrammar.getAllErrors().length, 0, `no errors in program from inferred grammar for ${name}`)
  }
})

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)

export { testTree }
