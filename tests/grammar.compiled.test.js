#! /usr/local/bin/node --use_strict

const fs = require("fs")
const GrammarProgram = require("../built/grammar/GrammarProgram.js").default
const grammarGrammarPath = __dirname + "/../langs/grammar/grammar.grammar"
const grammarGrammar = fs.readFileSync(grammarGrammarPath, "utf8")

const testTree = {}

testTree.basic = equal => {
  // Arrange
  const tempFilePath = __dirname + `/GrammarProgram.compiled.temp.js`
  const jtreePath = __dirname + "/../index.js"
  try {
    fs.writeFileSync(tempFilePath, GrammarProgram.newFromCondensed(grammarGrammar).toNodeJsJavascript(jtreePath), "utf8")

    // Act
    const GrammarProgramCompiled = require(tempFilePath)

    // Assert
    equal(!!new GrammarProgramCompiled(), true)
  } catch (err) {
    console.error(err)
  } finally {
    // fs.unlinkSync(tempFilePath)
  }
}

/*NODE_JS_ONLY*/ if (!module.parent) require("./testTreeRunner.js")(testTree)
module.exports = testTree
