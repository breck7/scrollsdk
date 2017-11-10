#! /usr/local/bin/node --use_strict

const quack = require("./quack.js")

const fs = require("fs")
const GrammarProgram = require("../src/grammar/GrammarProgram.js")
const jibberishProgram = require("./jibberish/jibberishProgram.js")
const jibberishNodes = require("./jibberish/jibberishNodes.js")

quack.quickTest("basics", equal => {
  // Arrange
  const program = new GrammarProgram()

  // Act

  // Assert
})

quack.quickTest("jibberish", equal => {
  // Arrange
  const grammarPath = __dirname + "/jibberish/jibberish.grammar"
  const jibberishGrammarCode = fs.readFileSync(grammarPath, "utf8")
  const sampleJibberishCode = fs.readFileSync(__dirname + "/jibberish/sample.jibberish", "utf8")

  // Act
  const grammarProgram = new GrammarProgram(jibberishGrammarCode, grammarPath)
  const rootJibberishParserClass = grammarProgram.getRootParserClass()
  const program = new rootJibberishParserClass(sampleJibberishCode)

  // Assert
  equal(program instanceof jibberishProgram, true, "correct program class")

  // Act
  const fooNode = program.getNode("foo")
  const fooDef = fooNode.getDefinition()
  const constNode = program.getNode("nodeWithConsts")
  const nodeDef = constNode.getDefinition()

  // Assert
  equal(fooDef.getId(), "foo")
  equal(nodeDef.getId(), "nodeWithConsts")

  // Act
  const constObj = nodeDef.getConstantsObject()

  // Assert
  equal(constObj.greeting, "hello world")

  // Act
  const addition = program.getNode("+")

  // Assert
  equal(addition instanceof jibberishNodes.additionNode, true)

  // Act
  const wordTypesProgram = new rootJibberishParserClass(`foo
+ 2 3 2`)
  const wordTypes = wordTypesProgram.getInPlaceSyntaxTree()

  // Assert
  equal(
    wordTypes,
    `keyword
keyword int int int`,
    "word types should match"
  )

  // Act
  const nodeTypes = wordTypesProgram.getInPlaceSyntaxTreeWithNodeTypes()
  const treeWithNodeTypes = wordTypesProgram.getTreeWithNodeTypes()

  // Assert
  equal(
    nodeTypes,
    `GrammarBackedTerminalNode keyword
additionNode keyword int int int`,
    "word types should match"
  )
  equal(
    treeWithNodeTypes,
    `GrammarBackedTerminalNode foo
additionNode + 2 3 2`,
    "word types should match"
  )

  // Arrange
  const programWithBugs = new rootJibberishParserClass(`+ foo bar`)

  // Act
  equal(programWithBugs.getProgramErrors().length, 2)
})
