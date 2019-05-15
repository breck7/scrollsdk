#! /usr/local/bin/node

const jtree = require("../index.js")
const fs = require("fs")
const recursiveReadSync = require("recursive-readdir-sync")
const runTestTree = require("../tests/testTreeRunner.js")

const allFiles = recursiveReadSync(__dirname + "/../tests/")

allFiles.filter(file => file.endsWith(".test.js")).forEach(file => runTestTree(require(file)))

allFiles
  .filter(file => file.endsWith(".swarm"))
  .forEach(file => jtree.executeFile(file, __dirname + "/../langs/swarm/swarm.grammar"))

const checkGrammarFile = grammarPath => {
  const testTree = {}
  testTree[`grammarCheckOf${grammarPath}`] = equal => {
    // Arrange/Act
    const program = jtree.GrammarProgram.newFromCondensed(fs.readFileSync(grammarPath, "utf8"), grammarPath)
    const errs = program.getProgramErrors()
    const exampleErrors = program.getErrorsInGrammarExamples()

    //Assert
    const message = errs.length ? errs : "no errors"
    equal(errs.length, 0, message)

    if (exampleErrors.length) console.log(exampleErrors)
    equal(exampleErrors.length, 0, exampleErrors.length ? "examples errs: " + exampleErrors : "no example errors")
  }

  runTestTree(testTree)
}

recursiveReadSync(__dirname + "/../langs/")
  .filter(file => file.endsWith(".grammar"))
  .forEach(checkGrammarFile)
