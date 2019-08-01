#! /usr/bin/env node

const jtree = require("../index.js")
const fs = require("fs")

const testTree = {}

// todo: turn prettier off for test running? seems like it might increase test time from 2s to 5s...

// todo: setup: make vms dir. cleanup? delete grammar file when done?

const outputDir = __dirname + `/../ignore/vms/`

const mkdirp = require("mkdirp")
mkdirp.sync(outputDir)

const makeProgram = (grammarCode, code) => {
  const grammarProgram = new jtree.GrammarProgram(grammarCode)
  const rootProgramConstructor = grammarProgram.getRootConstructor()
  return new rootProgramConstructor(code)
}

testTree.grammar = equal => {
  // Arrange
  const grammarGrammarPath = __dirname + "/../langs/grammar/grammar.grammar"
  try {
    const tempFilePath = jtree.compileGrammarForNodeJs(grammarGrammarPath, outputDir, false)

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
  ;["hakon", "swarm", "dug", "stump", "project", "jibberish", "jibjab", "fire", "stamp", "zin", "newlang"].map(name => {
    try {
      // Act
      const path = __dirname + `/../langs/${name}/${name}.grammar`
      const grammarCode = jtree.TreeNode.fromDisk(path)
      const tempFilePath = jtree.compileGrammarForNodeJs(path, outputDir, false)
      const rootClass = require(tempFilePath)

      // Assert
      equal(true, true, `Expected to compile and include "${name}" without error.`)

      // Act
      const exampleProgram = grammarCode.getNode("grammar example")
      if (exampleProgram) {
        const testProgram = new rootClass(exampleProgram.childrenToString())
        // todo: should we then execute it? compile it?

        // Assert
        equal(testProgram.getAllErrors().length, 0, `no errors in test ${name} program`)
      }
    } catch (err) {
      console.log(err)
      equal(true, false, "Hit an error")
    }
  })
}

testTree.jibberish = equal => {
  // Arrange
  try {
    const tempFilePath = jtree.compileGrammarForNodeJs(__dirname + "/../langs/jibberish/jibberish.grammar", outputDir, false)

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
  const numbersGrammarPath = __dirname + "/../langs/numbers/numbers.grammar"
  const numbersGrammarCode = fs.readFileSync(numbersGrammarPath, "utf8")
  const makeNumbersRunTimeProgram = code => makeProgram(numbersGrammarCode, code)
  try {
    const tempFilePath = jtree.compileGrammarForNodeJs(numbersGrammarPath, outputDir, false)

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
    equal(program.executeSync().join(" "), "5 60", "execute works")
    equal(program.getAllErrors().length, 0, "no errors found")
    if (program.getAllErrors().length) console.log(program.getAllErrors())

    equal(firstNode.getDefinition().getLineHints(), "addNode:  numbersCell...", "line hints work")
    equal(program.getInPlaceCellTypeTree(), runtimeProgram.getInPlaceCellTypeTree(), "cell types worked")

    // Arrange/Act/Assert
    equal(new numbers(`+ 2 a`).getAllErrors().length, 1, "should be 1 error")

    // program errors
    // autocomplete
    // line hints
    // syntax highlighting
    // examples

    // [] todo: test that groups work in compiled

    // [~] cell typings
    // [] cell constants
    // [] cell defaults
    // [] cell improvs
    // [] typescript autocomplete when extending
    // [] init speed (no more compiling grammar every time)
    // [] parse speed (can do further optimizations perhaps? might not. doesnt seemt o be a bottleneck)
    // [] packaging for browser/node.js
    // [] swarm in browser
    // [] might eliminate need for constructor paths in grammar files
    // [~] easily have native javascript types
    // [] easier to build new runtimes like golang, etc
    // [~] we can also hopefully do it without breaking much/anything existing
    // [] would perhaps make imports easier (because just done once at compile time)
  } catch (err) {
    console.error(err)
  } finally {
  }
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../builder/testTreeRunner.js")(testTree)
module.exports = testTree
