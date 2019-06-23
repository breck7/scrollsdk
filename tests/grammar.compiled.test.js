#! /usr/local/bin/node --use_strict

const jtree = require("../index.js")
const fs = require("fs")

const testTree = {}

// todo: setup: make vms dir. cleanup? delete grammar file when done?

const outputDir = __dirname + `/../ignore/vms/`

const makeProgram = (grammarCode, code, grammarPath = undefined) => {
  const grammarProgram = jtree.GrammarProgram.newFromCondensed(grammarCode, grammarPath)
  const rootProgramConstructor = grammarProgram.getRootConstructor()
  return new rootProgramConstructor(code)
}

testTree.grammar = equal => {
  // Arrange
  const grammarGrammarPath = __dirname + "/../langs/grammar/grammar.grammar"
  try {
    const tempFilePath = jtree.compileGrammar(grammarGrammarPath, outputDir)

    // Act
    const { GrammarProgramRoot } = require(tempFilePath)

    // Assert
    equal(!!new GrammarProgramRoot(), true, "it compiled")
  } catch (err) {
    console.error(err)
  } finally {
  }
}

testTree.compileAll = equal => {
  // Arrange/Act
  ;["swarm", "stump", "hakon", "project", "jibberish", "fire", "stamp"].map(name => {
    try {
      require(jtree.compileGrammar(__dirname + `/../langs/${name}/${name}.grammar`, outputDir))
      // Assert
      equal(true, true, `Expected to compile and include "${name}" without error.`)
    } catch (err) {
      console.log(err)
      equal(true, false, "Hit an error")
    }
  })
}

testTree.jibberish = equal => {
  // Arrange
  try {
    const tempFilePath = jtree.compileGrammar(__dirname + "/../langs/jibberish/jibberish.grammar", outputDir)

    // Act
    const { JibberishProgramRoot } = require(tempFilePath)

    // Assert
    equal(!!new JibberishProgramRoot(), true, "it compiled")

    // Arrange
    const program = new JibberishProgramRoot(`nodeWithConsts`)

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
    const tempFilePath = jtree.compileGrammar(numbersGrammarPath, outputDir)

    // Act
    const { NumbersProgramRoot, NumbersConstants } = require(tempFilePath)

    // Assert
    equal(!!new NumbersProgramRoot(), true, "it compiled")

    // Arrange/Act
    const code = `+ 2 3
* 2 3 10`
    const program = new NumbersProgramRoot(code)
    const firstNode = program.nodeAt(0)
    const runtimeProgram = makeNumbersRunTimeProgram(code)

    // Assert
    equal(NumbersConstants.cellTypes.float, "float", "constants generation works")
    equal(NumbersConstants.nodeTypes.comment, "comment", "constants generation works")
    equal(firstNode.numbers.length, 2, "cell getters work")
    equal(firstNode.numbers[0], 2, "typings work")
    equal(program.executeSync().join(" "), "5 60", "execute works")
    equal(program.getAllErrors().length, 0, "no errors found")
    if (program.getAllErrors().length) console.log(program.getAllErrors())

    equal(firstNode.getLineHints(), "+:  numbers...", "line hints work")
    equal(program.getInPlaceCellTypeTree(), runtimeProgram.getInPlaceCellTypeTree(), "cell types worked")

    // Arrange/Act/Assert
    equal(new NumbersProgramRoot(`+ 2 a`).getAllErrors().length, 1, "should be 1 error")

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
  }
}

/*NODE_JS_ONLY*/ if (!module.parent) require("./testTreeRunner.js")(testTree)
module.exports = testTree
