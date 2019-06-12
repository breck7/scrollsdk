#! /usr/local/bin/node --use_strict

const fs = require("fs")
const GrammarProgram = require("../built/GrammarLanguage.js").GrammarProgram

const grammarGrammarPath = __dirname + "/../langs/grammar/grammar.grammar"
const grammarGrammar = fs.readFileSync(grammarGrammarPath, "utf8")

const numbersPath = __dirname + "/../langs/numbers/numbers.grammar"
const numbersGrammar = fs.readFileSync(numbersPath, "utf8")

const testTree = {}

// todo: setup: make vms dir

testTree.grammar = equal => {
  // Arrange
  const tempFilePath = __dirname + `/../ignore/vms/GrammarLanguage.compiled.temp.js`
  const jtreePath = __dirname + "/../index.js"
  try {
    fs.writeFileSync(tempFilePath, new GrammarProgram(grammarGrammar, grammarGrammarPath).toNodeJsJavascript(jtreePath), "utf8")
    // fs.writeFileSync(tempFilePath + ".expanded.grammar", GrammarProgram._condensedToExpanded(grammarGrammar), "utf8")

    // Act
    const { GrammarProgramRoot } = require(tempFilePath)

    // Assert
    equal(!!new GrammarProgramRoot(), true, "it compiled")
  } catch (err) {
    console.error(err)
  } finally {
    // fs.unlinkSync(tempFilePath)
  }
}

testTree.numbers = equal => {
  // Arrange
  const tempFilePath = __dirname + `/../ignore/vms/NumbersLanguage.compiled.temp.js`
  const jtreePath = __dirname + "/../index.js"
  try {
    fs.writeFileSync(tempFilePath, new GrammarProgram(numbersGrammar, numbersPath).toNodeJsJavascript(jtreePath), "utf8")
    // fs.writeFileSync(tempFilePath + ".expanded.grammar", GrammarProgram._condensedToExpanded(numbersGrammar), "utf8")

    // Act
    const { NumbersProgramRoot, NumbersConstants } = require(tempFilePath)

    // Assert
    equal(!!new NumbersProgramRoot(), true, "it compiled")

    // Arrange
    const program = new NumbersProgramRoot(`+ 2 3
* 2 3 10`)

    // Act/Assert
    equal(NumbersConstants.cellTypes.float, "float", "constants generation works")
    equal(NumbersConstants.nodeTypes.comment, "comment", "constants generation works")
    equal(program.nodeAt(0).numbers.length, 2, "cell getters work")
    equal(program.nodeAt(0).numbers[0], 2, "typings work")
    equal(program.executeSync().join(" "), "5 60", "execute works")

    // [] cell typings
    // [] cell constants
    // [] cell defaults
    // [] cell improvs
    // [] typescript autocomplete when extending
    // [] init speed (no more compiling grammar every time)
    // [] parse speed (can do further optimizations perhaps? might not. doesnt seemt o be a bottleneck)
    // [] packaging for browser/node.js
    // [] swarm in browser
    // [] might eliminate need for constructor paths in grammar files
    // [] easily have native javascript types
    // [] easier to build new runtimes like golang, etc
    // [] we can also hopefully do it without breaking much/anything existing
    // [] would perhaps make imports easier (because just done once at compile time)
  } catch (err) {
    console.error(err)
  } finally {
    // fs.unlinkSync(tempFilePath)
  }
}

/*NODE_JS_ONLY*/ if (!module.parent) require("./testTreeRunner.js")(testTree)
module.exports = testTree
