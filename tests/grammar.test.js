#! /usr/local/bin/node --use_strict

const quack = require("./quack.js")

const fs = require("fs")
const GrammarProgram = require("../built/grammar/GrammarProgram.js").default
const jibberishProgram = require("./jibberish/jibberishProgram.js")
const jibberishNodes = require("./jibberish/jibberishNodes.js")

const numbersGrammar = fs.readFileSync(__dirname + "/numbers.grammar", "utf8")
const grammarGrammar = fs.readFileSync(__dirname + "/../grammar.grammar", "utf8")
const jibberishGrammarPath = __dirname + "/jibberish/jibberish.grammar"

quack.quickTest("basic", equal => {
  // Arrange/Act/Assert
  const program = new GrammarProgram()
})

quack.quickTest("basics", equal => {
  // Arrange
  const jibberishGrammarCode = fs.readFileSync(jibberishGrammarPath, "utf8")

  // Act
  const grammarProgram = GrammarProgram.newFromCondensed(jibberishGrammarCode, jibberishGrammarPath)
  const errs = grammarProgram.getProgramErrors()

  // Assert
  equal(errs.length, 0, errs.map(JSON.stringify).join(" "))
})

const makeNumbersProgram = code => makeProgram(numbersGrammar, code)

const makeGrammarProgram = code => makeProgram(grammarGrammar, code)

const makeJibberishProgram = code => {
  const grammarCode = fs.readFileSync(jibberishGrammarPath, "utf8")
  return makeProgram(grammarCode, code, jibberishGrammarPath)
}

const makeProgram = (grammarCode, code, grammarPath = undefined) => {
  const grammarProgram = GrammarProgram.newFromCondensed(grammarCode, grammarPath)
  const rootProgramConstructor = grammarProgram.getRootConstructor()
  return new rootProgramConstructor(code)
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

  // Act/Assert
  equal(program.getNode("someCode echo") instanceof jibberishNodes.LineOfCodeNode, true, "line of code class")

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
    "nodeTypes word types should match"
  )
  equal(
    treeWithNodeTypes,
    `GrammarBackedTerminalNode foo
additionNode + 2 3 2`,
    "treeWithNodeTypes word types should match"
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

quack.quickTest("highlight scopes", equal => {
  // Arrange
  const wordTypesProgram = makeJibberishProgram(`foo
+ 2 3 2`)

  // Act
  const scopes = wordTypesProgram.getInPlaceHighlightScopeTree()

  // Assert
  equal(
    scopes,
    `source
keyword.operator.arithmetic constant.numeric constant.numeric constant.numeric`
  )

  // Arrange/Act/Assert
  equal(makeJibberishProgram(`fault`).getInPlaceHighlightScopeTree(), `invalid`)
  equal(makeJibberishProgram(`fault fault`).getInPlaceHighlightScopeTree(), `invalid invalid`)
  equal(makeNumbersProgram(`+ 2`).getInPlaceHighlightScopeTree(), `keyword.operator.arithmetic constant.numeric`)

  // Arrange
  const program = makeJibberishProgram(`lightbulbState on
 someerror`)

  // Act/Assert
  equal(
    program.getInPlaceHighlightScopeTree(),
    `source source
 invalid`
  )
  equal(program.getProgramErrors().length, 1)
})

quack.quickTest("autocomplete", equal => {
  // Arrange
  const program = makeNumbersProgram(`+ 2 3
com
`)

  // Act/Assert
  equal(program.getAutocompleteResultsAt(1, 0).matches.length, 1)
  equal(program.getAutocompleteResultsAt(1, 2).matches.length, 1, "should complete comment")
  equal(program.getAutocompleteResultsAt(1, 3).matches.length, 1, "should complete comment")
  equal(program.getAutocompleteResultsAt(2, 0).matches.length, 3)
  equal(program.getAutocompleteResultsAt(0, 2).matches.length, 0)

  equal(program.getAutocompleteResultsAt(0, 2).matches.length, 0)
  // todo: test for descriptions in addition to returned words
})

quack.quickTest("autocomplete additional words", equal => {
  // Arrange
  const program = makeGrammarProgram(`@keyword foo
 @highlightScope comme`)

  // Act/Assert
  equal(program.getAutocompleteResultsAt(1, 20).matches.length, 5)
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

quack.quickTest("sublimeSyntaxFile", equal => {
  // Arrange
  const grammarPath = __dirname + "/jibberish/jibberish.grammar"
  const jibberishGrammarCode = fs.readFileSync(grammarPath, "utf8")

  // Act
  const grammarProgram = GrammarProgram.newFromCondensed(jibberishGrammarCode, grammarPath)
  const code = grammarProgram.toSublimeSyntaxFile()

  // Assert
  equal(code.includes("scope:"), true)
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

quack.quickTest("required keywords", equal => {
  // Arrange/Act
  const path = __dirname + "/../grammar.grammar"
  const anyProgram = makeProgram(
    fs.readFileSync(path, "utf8"),
    `@wordType word any
@keyword baseNode`,
    path
  )

  // Assert
  let errors = anyProgram.getProgramErrorMessages()
  equal(errors.length, 1)
})

quack.quickTest("minimum grammar", equal => {
  // Arrange/Act
  const programConstructor = GrammarProgram.newFromCondensed(
    `@grammar any
 @catchAllKeyword any
@keyword any
 @columns any*
@wordType any`
  ).getRootConstructor()
  const program = new programConstructor()
  const grammarProgram = program.getGrammarProgram()

  // Assert
  let errors = grammarProgram.getProgramErrors()
  equal(errors.length, 0)
  errors = program.getProgramErrors()
  equal(errors.length, 0)
})

quack.quickTest("duplicate keywords", equal => {
  // Arrange/Act
  const anyProgram = makeJibberishProgram(`type foo
type bar`)

  // Assert
  let errors = anyProgram.getProgramErrorMessages()
  equal(errors.length, 2)
})

quack.quickTest("abstract keywords", equal => {
  // Arrange/Act
  const anyProgram = makeJibberishProgram(`someAbstractClass
extendsAbstract 2`)

  // Assert
  let errors = anyProgram.getProgramErrorMessages()
  equal(errors.length, 1)
})
