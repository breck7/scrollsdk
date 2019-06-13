#! /usr/local/bin/node --use_strict

const fs = require("fs")
const jtree = require("../index.js")
const TreeNode = jtree.TreeNode
const GrammarProgram = jtree.GrammarProgram

const testTree = {}

const compileGrammar = pathToGrammar => {
  const grammarCode = TreeNode.fromDisk(pathToGrammar)
  let name = grammarCode.get("grammar name")
  name = name[0].toUpperCase() + name.slice(1)
  const pathToJtree = __dirname + "/../index.js"
  const tempFilePath = __dirname + `/../ignore/vms/${name}Language.compiled.temp.js`
  fs.writeFileSync(tempFilePath, new GrammarProgram(grammarCode.toString(), pathToGrammar).toNodeJsJavascriptPrettier(pathToJtree), "utf8")
  // fs.writeFileSync(name + ".expanded.grammar", GrammarProgram._condensedToExpanded(pathToGrammar), "utf8")
  return tempFilePath
}

// todo: setup: make vms dir

testTree.grammar = equal => {
  // Arrange
  const grammarGrammarPath = __dirname + "/../langs/grammar/grammar.grammar"
  try {
    const tempFilePath = compileGrammar(grammarGrammarPath)

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

testTree.compileAll = equal => {
  // Arrange/Act
  ;["swarm", "stump", "hakon", "project", "jibberish", "fire", "stamp"].map(name => {
    try {
      require(compileGrammar(__dirname + `/../langs/${name}/${name}.grammar`))
      // Assert
      equal(true, true, `Expected to compile and include "${name}" without error.`)
    } catch (err) {
      console.log(err)
      equal(true, false, "Hit an error")
    }
  })
}

testTree.numbers = equal => {
  // Arrange
  const numbersGrammarPath = __dirname + "/../langs/numbers/numbers.grammar"
  try {
    const tempFilePath = compileGrammar(numbersGrammarPath)

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

    // program errors
    // autocomplete
    // line hints
    // syntax highlighting
    // examples

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
    // fs.unlinkSync(tempFilePath)
  }
}

/*NODE_JS_ONLY*/ if (!module.parent) require("./testTreeRunner.js")(testTree)
module.exports = testTree
