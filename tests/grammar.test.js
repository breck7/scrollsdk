#! /usr/local/bin/node --use_strict

const quack = require("./quack.js")

const fs = require("fs")
const GrammarProgram = require("../built/grammar/GrammarProgram.js").default
const jibberishProgram = require("./jibberish/jibberishProgram.js")
const jibberishNodes = require("./jibberish/jibberishNodes.js")

quack.quickTest("basics", equal => {
  // Arrange
  const program = new GrammarProgram()

  // Act

  // Assert
})

const makeJibberishProgram = code => {
  // Arrange
  const grammarPath = __dirname + "/jibberish/jibberish.grammar"
  const jibberishGrammarCode = fs.readFileSync(grammarPath, "utf8")

  // Act
  const grammarProgram = GrammarProgram.newFromCondensed(jibberishGrammarCode, grammarPath)
  const rootJibberishParserClass = grammarProgram.getRootParserClass()
  return new rootJibberishParserClass(code)
}

quack.quickTest("jibberish", equal => {
  // Arrange
  const sampleJibberishCode = fs.readFileSync(__dirname + "/jibberish/sample.jibberish", "utf8")

  // Act
  const program = makeJibberishProgram(sampleJibberishCode)

  // Assert
  equal(program instanceof jibberishProgram, true, "correct program class")
  equal(program.getProgramErrors().length, 0, `${program.getProgramErrorMessages()}`)

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
  const wordTypesProgram = makeJibberishProgram(`foo
+ 2 3 2`)
  const wordTypes = wordTypesProgram.getInPlaceSyntaxTree()

  // Assert
  equal(
    wordTypes,
    `keyword
keyword int int int`,
    "word types should match"
  )
  equal(wordTypesProgram.nodeAt(1).getParsedWords()[0], 2)

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
  const programWithBugs = makeJibberishProgram(`+ foo bar`)

  // Act/Assert
  equal(programWithBugs.getProgramErrorMessages().length, 2)

  // Act
  let count = 0
  for (let err of programWithBugs.getProgramErrorsIterator()) {
    // 2 errors in 1 line
    equal(err.length, 2)
  }

  // Act/Asssert
  equal(programWithBugs.getInvalidKeywords().length, 0)

  // Act
  const programWithKeywordBugs = makeJibberishProgram(`missing 1 2
missing2 true`)

  // Assert
  equal(programWithKeywordBugs.getInvalidKeywords().length, 2)
})

quack.quickTest("any nodes", equal => {
  // Arrange/Act
  const anyProgram = makeJibberishProgram(`text foobar
 This is an any node.
 this is some text.
 hello world
 
 1+1`)

  // Assert
  let errors = anyProgram.getProgramErrorMessages().join("\n")
  equal(errors, "")

  // Act
  for (let err of anyProgram.getProgramErrorsIterator()) {
    // Should be no errors
    equal(true, false)
  }
})

quack.quickTest("predictGrammarFile", equal => {
  // Arrange
  const input = `file rain
 size 28
 digits 321 4324
 open true
 temp 32.1
 description Lorem ipsum, unless ipsum lorem.
 account
  balance 24
  transactions 32
  source no http://www.foo.foo 32
file test
 digits 321 435
 size 3
 description None.
 open false
 temp 32.0
 account
  balance 32.12
  transactions 321
  source yes http://to.to.to 31`
  const expected = `@keyword size int
@keyword digits
 @columns int int
@keyword open bool
@keyword temp float
@keyword description any*
@keyword account
 @any`

  // Act
  const types = GrammarProgram.predictGrammarFile(input)

  // Assert
  equal(types, expected)
})

quack.quickTest("abstract keywords", equal => {
  // Arrange/Act
  const anyProgram = makeJibberishProgram(`someAbstractClass
extendsAbstract 2`)

  // Assert
  let errors = anyProgram.getProgramErrorMessages()
  equal(errors.length, 1)
})
