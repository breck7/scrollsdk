#! /usr/local/bin/node --use_strict

const fs = require("fs")
const GrammarProgram = require("../built/grammar/GrammarLanguage.js").GrammarProgram

const grammarGrammarPath = __dirname + "/../langs/grammar/grammar.grammar"
const grammarGrammar = fs.readFileSync(grammarGrammarPath, "utf8")

const numbersPath = __dirname + "/../langs/numbers/numbers.grammar"
const numbersGrammar = fs.readFileSync(numbersPath, "utf8")

const testTree = {}

// todo: setup: make vms dir

testTree.grammar = equal => {
  // Arrange
  const tempFilePath = __dirname + `/../ignore/vms/GrammarProgram.compiled.temp.js`
  const jtreePath = __dirname + "/../index.js"
  try {
    fs.writeFileSync(tempFilePath, new GrammarProgram(grammarGrammar, grammarGrammarPath).toNodeJsJavascript(jtreePath), "utf8")
    // fs.writeFileSync(tempFilePath + ".expanded.grammar", GrammarProgram._condensedToExpanded(grammarGrammar), "utf8")

    // Act
    const GrammarProgramCompiled = require(tempFilePath)

    // Assert
    equal(!!new GrammarProgramCompiled(), true, "it compiled")
  } catch (err) {
    console.error(err)
  } finally {
    // fs.unlinkSync(tempFilePath)
  }
}

testTree.numbers = equal => {
  // Arrange
  const tempFilePath = __dirname + `/../ignore/vms/NumbersProgram.compiled.temp.js`
  const jtreePath = __dirname + "/../index.js"
  try {
    fs.writeFileSync(tempFilePath, new GrammarProgram(numbersGrammar, numbersPath).toNodeJsJavascript(jtreePath), "utf8")
    // fs.writeFileSync(tempFilePath + ".expanded.grammar", GrammarProgram._condensedToExpanded(numbersGrammar), "utf8")

    // Act
    const Program = require(tempFilePath)

    // Assert
    equal(!!new Program(), true, "it compiled")

    // Arrange
    program = new Program(`+ 2 3
* 2 3 10`)

    // Act/Assert
    equal(program.executeSync().join(" "), "5 60")

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
