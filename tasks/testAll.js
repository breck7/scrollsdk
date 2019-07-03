#! /usr/local/bin/node

const jtree = require("../index.js")
const fs = require("fs")
const recursiveReadSync = require("recursive-readdir-sync")
const runTestTree = require("../tests/testTreeRunner.js")

const allFiles = recursiveReadSync(__dirname + "/../tests/")

allFiles.filter(file => file.endsWith(".test.js")).forEach(file => runTestTree(require(file)))

allFiles.filter(file => file.endsWith(".swarm")).forEach(file => jtree.executeFile(file, __dirname + "/../langs/swarm/swarm.grammar"))

// todo: test both with grammar.grammar and hard coded grammar program (eventually the latter should be generated from the former).
const checkGrammarFile = grammarPath => {
  const testTree = {}
  testTree[`hardCodedGrammarCheckOf${grammarPath}`] = equal => {
    // Arrange/Act
    const program = new jtree.GrammarProgram(fs.readFileSync(grammarPath, "utf8"), grammarPath)
    const errs = program.getAllErrors()
    const exampleErrors = program.getErrorsInGrammarExamples()

    //Assert
    equal(errs.length, 0, "should be no errors")
    if (errs.length) console.log(errs.join("\n"))

    if (exampleErrors.length) console.log(exampleErrors)
    equal(exampleErrors.length, 0, exampleErrors.length ? "examples errs: " + exampleErrors : "no example errors")
  }

  testTree[`grammarGrammarCheckOf${grammarPath}`] = equal => {
    // Arrange/Act
    const program = jtree.makeProgram(grammarPath, __dirname + "/../langs/grammar/grammar.grammar")
    const errs = program.getAllErrors()

    //Assert

    equal(errs.length, 0, "should be no errors")
    if (errs.length) console.log(errs.join("\n"))
  }

  runTestTree(testTree)
}

const allLangFiles = recursiveReadSync(__dirname + "/../langs/")

allLangFiles.filter(file => file.endsWith(".grammar")).forEach(checkGrammarFile)

allLangFiles.filter(file => file.endsWith(".swarm")).forEach(file => jtree.executeFile(file, __dirname + "/../langs/swarm/swarm.grammar"))
