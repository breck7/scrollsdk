#! /usr/local/bin/node --use_strict

// todo: make isomorphic

const fs = require("fs")
const GrammarProgram = require("../built/grammar/GrammarProgram.js").default
const jibberishRootDir = __dirname + "/../langs/jibberish/"
const jibberishProgramRoot = require(jibberishRootDir + "jibberishProgramRoot.js")
const jibberishNodes = require(jibberishRootDir + "jibberishNodes.js")

const numbersGrammar = fs.readFileSync(__dirname + "/../langs/numbers/numbers.grammar", "utf8")
const grammarGrammarPath = __dirname + "/../langs/grammar/grammar.grammar"
const grammarGrammar = fs.readFileSync(grammarGrammarPath, "utf8")
const jibberishGrammarPath = jibberishRootDir + "jibberish.grammar"
const jibberishGrammarCode = fs.readFileSync(jibberishGrammarPath, "utf8")

const testTree = {}

testTree.basic = equal => {
  // Arrange/Act/Assert
  const program = new GrammarProgram()
}

testTree.basics = equal => {
  // Arrange/Act
  const grammarProgram = GrammarProgram.newFromCondensed(jibberishGrammarCode, jibberishGrammarPath)
  const errs = grammarProgram.getProgramErrors()

  // Assert
  equal(errs.length, 0, errs.map(JSON.stringify).join(" "))
}

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

testTree.jibberish = equal => {
  // Arrange
  const sampleJibberishCode = fs.readFileSync(jibberishRootDir + "sample.jibberish", "utf8")

  // Act
  const program = makeJibberishProgram(sampleJibberishCode)

  // Assert
  equal(program instanceof jibberishProgramRoot, true, "correct program class")
  equal(program.getProgramErrors().length, 0, `${program.getProgramErrorMessages()}`)

  // Act
  const fooNode = program.getNode("foo")
  const fooDef = fooNode.getDefinition()
  const constNode = program.getNode("nodeWithConsts")
  const nodeDef = constNode.getDefinition()

  // Assert
  equal(fooDef.getNodeTypeIdFromDefinition(), "foo")
  equal(nodeDef.getNodeTypeIdFromDefinition(), "nodeWithConsts")

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
  equal(programWithBugs.getInvalidNodeTypes().length, 0)

  // Act
  const programWithNodeTypeBugs = makeJibberishProgram(`missing 1 2
missing2 true`)

  // Assert
  equal(programWithNodeTypeBugs.getInvalidNodeTypes().length, 2)
}

testTree.cellTypeTree = equal => {
  // Act
  const someJibberishProgram = makeJibberishProgram(`foo
+ 2 3 2`)

  // Assert
  equal(
    someJibberishProgram.getInPlaceCellTypeTree(),
    `topLevelProperty
opSymbol int int int`,
    "word types should match"
  )
  equal(someJibberishProgram.nodeAt(1).getParsedWords()[1], 2)

  // Act
  const nodeTypes = someJibberishProgram.getInPlaceCellTypeTreeWithNodeConstructorNames()
  const treeWithNodeTypes = someJibberishProgram.getTreeWithNodeTypes()

  // Assert
  equal(
    nodeTypes,
    `GrammarBackedTerminalNode topLevelProperty
additionNode opSymbol int int int`,
    "nodeTypes word types should match"
  )
  equal(
    treeWithNodeTypes,
    `GrammarBackedTerminalNode foo
additionNode + 2 3 2`,
    "treeWithNodeTypes word types should match"
  )
}

testTree.highlightScopes = equal => {
  // Arrange
  const someJibberishProgram = makeJibberishProgram(`foo
+ 2 3 2`)

  // Act
  const scopes = someJibberishProgram.getInPlaceHighlightScopeTree()

  // Assert
  equal(
    scopes,
    `constant.language
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
    `constant.language source
 invalid`
  )
  equal(program.getProgramErrors().length, 1)
}

testTree.autocomplete = equal => {
  // Arrange
  let program = makeNumbersProgram(`+ 2 3
com
`)

  // Act/Assert
  equal(program.getAutocompleteResultsAt(1, 0).matches.length, 1)
  equal(program.getAutocompleteResultsAt(1, 2).matches.length, 1, "should complete comment")
  equal(program.getAutocompleteResultsAt(1, 3).matches.length, 1, "should complete comment")
  equal(program.getAutocompleteResultsAt(2, 0).matches.length, 8, "all nodes")
  equal(program.getAutocompleteResultsAt(0, 2).matches.length, 0, "should be none")

  equal(program.getAutocompleteResultsAt(0, 2).matches.length, 0)
  // todo: test for descriptions in addition to returned words

  // Arrange/Act/Assert
  equal(makeNumbersProgram(``).getAutocompleteResultsAt(0, 0).matches.length, 8, "should be 7 results at root level")

  // Arrange
  program = makeNumbersProgram(`+ 2 3
* 2 3 10`)

  // Act/Assert
  equal(program.executeSync().join(" "), "5 60")
}

testTree.autocompleteAdditionalWords = equal => {
  // Arrange
  const program = makeGrammarProgram(`cellType foo
 highlightScope comme`)

  // Act/Assert
  equal(program.getAutocompleteResultsAt(1, 20).matches.length, 5)
}

testTree.autocompleteAdvanced = equal => {
  // Arrange
  const program = makeGrammarProgram(`grammar
 name latin
 catchAllNodeType any
 nodeTypes
  faveNumber
cellType integer
nodeType any
nodeType faveNumber
 cells in`)

  // Act/Assert
  equal(program.getAutocompleteResultsAt(8, 9).matches.length, 1)
}

testTree.autocompleteCustom = equal => {
  // Arrange/Act/Assert
  equal(makeJibberishProgram(`xColumnName `).getAutocompleteResultsAt(0, 12).matches.length, 3)
  equal(makeJibberishProgram(`xColumnName eight`).getAutocompleteResultsAt(0, 12).matches.length, 2)
  equal(makeJibberishProgram(`xColumnName gender`).getProgramErrors().length, 0)
  equal(makeJibberishProgram(`xColumnName genders`).getProgramErrors().length, 1, "should have 1 error. genders doesnt fit.")
}

testTree.blobNodes = equal => {
  // Arrange/Act
  const anyProgram = makeJibberishProgram(`text foobar
 This is a blob node.
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
}

testTree.sublimeSyntaxFile = equal => {
  // Arrange/Act
  const grammarProgram = GrammarProgram.newFromCondensed(jibberishGrammarCode, jibberishGrammarPath)
  const code = grammarProgram.toSublimeSyntaxFile()

  // Assert
  equal(code.includes("scope:"), true)
}

testTree.requiredNodeTypes = equal => {
  // Arrange/Act
  const path = grammarGrammarPath
  const anyProgram = makeProgram(
    fs.readFileSync(path, "utf8"),
    `cellType word any
nodeType baseNode`,
    path
  )

  // Assert
  let errors = anyProgram.getProgramErrorMessages()
  equal(errors.length, 1)
}

testTree.minimumGrammar = equal => {
  // Arrange/Act
  const programConstructor = GrammarProgram.newFromCondensed(
    `grammar
 name any
 catchAllNodeType anyNode
nodeType anyNode
 catchAllCellType any
cellType any`
  ).getRootConstructor()
  const program = new programConstructor()
  const grammarProgram = program.getGrammarProgram()

  // Assert
  let errors = grammarProgram.getProgramErrors()
  equal(errors.length, 0)
  errors = program.getProgramErrors()
  equal(errors.length, 0)
}

testTree.grammarWithLoop = equal => {
  // Arrange/Act/Assert
  try {
    const programConstructor = GrammarProgram.newFromCondensed(
      `grammar
 name any
 catchAllNodeType nodeA
nodeType nodeA nodeC
 catchAllCellType any
nodeType nodeB nodeA
nodeType nodeC nodeB
cellType any`
    ).getRootConstructor()
    equal(false, true, "Should have thrown error")
  } catch (err) {
    equal(err.toString().includes("Loop"), true, `Expected correct error thrown when grammar. Got: ${err.toString()}`)
  }
}

testTree.duplicateNodeTypes = equal => {
  // Arrange/Act
  const anyProgram = makeJibberishProgram(`type foo
type bar`)

  // Assert
  let errors = anyProgram.getProgramErrorMessages()
  equal(errors.length, 2)
}

testTree.abstractNodeTypes = equal => {
  // Arrange/Act
  const anyProgram = makeJibberishProgram(`someAbstractClass
extendsAbstract 2`)

  // Assert
  let errors = anyProgram.getProgramErrorMessages()
  equal(errors.length, 1)
}

testTree.updateNodeTypeIds = equal => {
  // Arrange/Act
  const anyProgram = makeGrammarProgram(`grammar
 name someLang
cellType foobar
 regex test`)

  // Assert
  let errors = anyProgram.updateNodeTypeIds(`grammar language
name grammarName
cellType cellSpace
regex regexString`)
  equal(
    anyProgram.toString(),
    `language
 grammarName someLang
cellSpace foobar
 regexString test`
  )
}

testTree.examples = equal => {
  // Arrange/Act
  const jibberishGrammarProgram = GrammarProgram.newFromCondensed(jibberishGrammarCode, jibberishGrammarPath)

  // Assert
  let errors = jibberishGrammarProgram.getErrorsInGrammarExamples()
  equal(errors.length, 0)

  // Arrange/Act
  const badGrammarProgram = GrammarProgram.newFromCondensed(
    `grammar
 name bad
 nodeTypes
  +
nodeType +
 catchAllCellType int
 example This is a bad example.
  + 1 B
cellType anyFirstWord
cellType int`
  )

  // Assert
  errors = badGrammarProgram.getErrorsInGrammarExamples()
  equal(errors.length, 1)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("./testTreeRunner.js")(testTree)
module.exports = testTree
