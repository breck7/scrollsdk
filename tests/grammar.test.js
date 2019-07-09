#! /usr/local/bin/node --use_strict

// todo: make isomorphic

const fs = require("fs")
const GrammarProgram = require("../built/GrammarLanguage.js").GrammarProgram
const jibberishRootDir = __dirname + "/../langs/jibberish/"

const numbersPath = __dirname + "/../langs/numbers/numbers.grammar"
const numbersGrammar = fs.readFileSync(numbersPath, "utf8")
const grammarGrammarPath = __dirname + "/../langs/grammar/grammar.grammar"
const grammarGrammar = fs.readFileSync(grammarGrammarPath, "utf8")
const jibberishGrammarPath = jibberishRootDir + "jibberish.grammar"
const jibberishGrammarCode = fs.readFileSync(jibberishGrammarPath, "utf8")

const testTree = {}

testTree.emptyProgram = equal => {
  // Arrange/Act/Assert
  const program = new GrammarProgram()
}

testTree.basics = equal => {
  // Arrange/Act
  const grammarProgram = new GrammarProgram(jibberishGrammarCode, jibberishGrammarPath)
  const errs = grammarProgram.getAllErrors()

  // Assert
  if (errs.length) console.log(errs.map(err => err.getMessage()))
  equal(errs.length, 0, "should be no errors")
}

const makeGrammarProgram = code => makeProgram(grammarGrammar, code)

const makeJibberishProgram = code => {
  const grammarCode = fs.readFileSync(jibberishGrammarPath, "utf8")
  return makeProgram(grammarCode, code, jibberishGrammarPath)
}

const makeNumbersProgram = code => makeProgram(numbersGrammar, code)

const makeProgram = (grammarCode, code, grammarPath = undefined) => {
  const grammarProgram = new GrammarProgram(grammarCode, grammarPath)
  const rootProgramConstructor = grammarProgram.getRootConstructor()
  return new rootProgramConstructor(code)
}

testTree.jibberish = equal => {
  // Arrange
  const sampleJibberishCode = fs.readFileSync(jibberishRootDir + "sample.jibberish", "utf8")

  // Act
  const program = makeJibberishProgram(sampleJibberishCode)

  // Assert
  equal(program.constructor.name, "jibberish", "correct program class")
  const errs = program.getAllErrors()
  equal(errs.length, 0, `should be 0 errors`)
  if (errs.length) console.log(errs.map(err => err.getMessage()))

  const defNode = program
    .getGrammarProgramRoot()
    .getNodeTypeFamilyTree()
    .getNode("topLevel nodeWithConsts nodeExpandsConsts")

  equal(defNode.toString(), "nodeExpandsConsts", "family tree works")

  // Act
  const fooNode = program.getNode("foo")
  const constNode = program.getNode("nodeWithConsts")
  const nodeExpandsConsts = program.getNode("nodeExpandsConsts")

  // Assert
  equal(fooNode.getNodeTypeId(), "foo")
  equal(constNode.getNodeTypeId(), "nodeWithConsts")
  equal(
    constNode
      .getDefinition()
      .getAncestorNodeTypeIdsArray()
      .join(" "),
    "topLevel nodeWithConsts"
  )

  // Assert
  equal(constNode.greeting, "hello world", "constant strings should work")
  equal(constNode.score1, 28, "constant insts should work")
  equal(constNode.score2, 3.01, "constant floats should work")
  equal(constNode.win, true, "constant booleans should work")
  const obj = constNode.getDefinition().getConstantsObject()
  equal(obj.score1, 28, "constants int works")
  equal(obj.score2, 3.01, "constants floats works")
  equal(obj.win, true, "constants bool works")
  equal(obj.greeting, "hello world", "constants string works")
  equal(
    obj.longText,
    `hello
world`,
    "constants multiline string works"
  )
  const obj2 = nodeExpandsConsts.getDefinition().getConstantsObject()
  equal(obj2.greeting, "hola", "expanding constants works and last wins")
  equal(obj2.win, true, "expanding constants works")

  // Act
  const addition = program.getNode("+")

  // Assert
  equal(addition.constructor.name, "plus", "correct constructor name")

  // Act/Assert
  equal(program.getNode("someCode echo").constructor.name, "lineOfCode", "line of code class")

  // Arrange
  const programWithBugs = makeJibberishProgram(`+ foo bar`)

  // Act/Assert
  equal(programWithBugs.getAllErrors().length, 2)

  // Act
  let count = 0
  for (let err of programWithBugs.getAllErrorsIterator()) {
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

  // Grandchild inheritance
  // Arrange
  const def = program.getNode("html.h1").getDefinition()

  // Act/Assert
  equal(
    def
      ._getAncestorsArray()
      .map(def => def.getNodeTypeIdFromDefinition())
      .join(" "),
    "h1Node abstractHtml topLevel"
  )
}

testTree.cellTypeTree = equal => {
  // Act
  const someJibberishProgram = makeJibberishProgram(`foo
+ 2 3 2`)

  const a = someJibberishProgram.nodeAt(1).getDefinition()

  // Assert
  equal(
    someJibberishProgram.getInPlaceCellTypeTree(),
    `topLevelProperty
opSymbol int int int`,
    "word types should match"
  )

  // Act
  const nodeTypes = someJibberishProgram.getInPlaceCellTypeTreeWithNodeConstructorNames()
  const treeWithNodeTypes = someJibberishProgram.getTreeWithNodeTypes()

  // Assert
  equal(
    nodeTypes,
    `foo topLevelProperty
plus opSymbol int int int`,
    "nodeTypes word types should match"
  )
  equal(
    treeWithNodeTypes,
    `foo foo
plus + 2 3 2`,
    "treeWithNodeTypes word types should match"
  )
}

testTree.prettify = equal => {
  // Arrange
  const normalCode = `nodeType someLang
 root
nodeType topLevel
 abstract
nodeType abstractHtml
 extends topLevel
 abstract
nodeType h1Node
 match html.h1
 extends abstractHtml
nodeType colorProperties
 extends topLevel
 abstract
nodeType constrast
 extends colorProperties
nodeType hue
 extends colorProperties
nodeType saturation
 extends colorProperties`
  const grammarProgram = makeGrammarProgram(normalCode)
  const pretty = grammarProgram.getPrettified()
  equal(pretty, normalCode, "code is already in pretty form")
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
  equal(program.getAllErrors().length, 1)
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

testTree.extraWord = equal => {
  // Arrange
  const program = makeGrammarProgram(`nodeType foobar foo2
 root`)

  // Act/Assert
  equal(program.getAllErrors().length, 1)
  equal(
    program.getInPlaceCellTypeTree(),
    `nodeTypeIdConstant nodeTypeId extraWord
 propertyName`
  )
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
  const program = makeGrammarProgram(`nodeType latin
 root
 catchAllNodeType any
 inScope faveNumber
cellType integer
nodeType any
nodeType faveNumber
 cells in`)

  // Act/Assert
  equal(program.getAutocompleteResultsAt(7, 9).matches.length, 1)
}

testTree.autocompleteCustom = equal => {
  // Arrange/Act/Assert
  equal(makeJibberishProgram(`xColumnName `).getAutocompleteResultsAt(0, 12).matches.length, 3)
  equal(makeJibberishProgram(`xColumnName eight`).getAutocompleteResultsAt(0, 12).matches.length, 2)
  equal(makeJibberishProgram(`xColumnName gender`).getAllErrors().length, 0)
  equal(makeJibberishProgram(`xColumnName genders`).getAllErrors().length, 1, "should have 1 error. genders doesnt fit.")
}

testTree.blobNodes = equal => {
  // Arrange/Act
  const anyProgram = makeJibberishProgram(`text foobar
 This is a blob node.
 this is some text.
 hello world
 
 1+1`)

  // Assert
  equal(anyProgram.getAllErrors().length, 0)

  // Act
  for (let err of anyProgram.getAllErrorsIterator()) {
    // Should be no errors
    equal(true, false)
  }
}

testTree.sublimeSyntaxFile = equal => {
  // Arrange/Act
  const grammarProgram = new GrammarProgram(jibberishGrammarCode, jibberishGrammarPath)
  const code = grammarProgram.toSublimeSyntaxFile()

  // Assert
  equal(code.includes("scope:"), true)
}

// todo: reenable once we have the requirement of at least 1 root node
// testTree.requiredNodeTypes = equal => {
//   // Arrange/Act
//   const path = grammarGrammarPath
//   const anyProgram = makeProgram(
//     fs.readFileSync(path, "utf8"),
//     `cellType word
// nodeType baseNode`,
//     path
//   )

//   // Assert
//   const errs = anyProgram.getAllErrors()
//   equal(errs.length, 1)
// }

testTree.minimumGrammar = equal => {
  // Arrange/Act
  const programConstructor = new GrammarProgram(
    `nodeType any
 root
 catchAllNodeType anyNode
nodeType anyNode
 catchAllCellType any
cellType any`
  ).getRootConstructor()
  const program = new programConstructor()
  const grammarProgram = program.getGrammarProgramRoot()

  // Assert
  let errors = grammarProgram.getAllErrors()
  equal(errors.length, 0)
  errors = program.getAllErrors()
  equal(errors.length, 0)

  // Arrange/Act/Assert
  const constructor = GrammarProgram.getTheAnyLanguageRootConstructor()
  const errs = new constructor("foobar").getAllErrors()
  equal(errs.length, 0)
}

testTree.grammarWithLoop = equal => {
  // Arrange/Act/Assert
  try {
    const programConstructor = new GrammarProgram(
      `nodeType langWithLoop
 root
 catchAllNodeType nodeA
nodeType nodeA
 extends nodeC
 catchAllCellType anyCell
nodeType nodeB
 extends nodeA
nodeType nodeC
 extends nodeB
cellType anyCell`
    ).getRootConstructor()

    new programConstructor("nodeA")
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
  equal(anyProgram.getAllErrors().length, 2)
}

testTree.abstractNodeTypes = equal => {
  // Arrange/Act
  const anyProgram = makeJibberishProgram(`someAbstractClass
extendsAbstract 2`)

  // Assert
  equal(anyProgram.getAllErrors().length, 1)
}

testTree.updateNodeTypeIds = equal => {
  // Arrange/Act
  const anyProgram = makeGrammarProgram(`nodeType someLang
 root
cellType foobar
 regex test`)

  // Assert
  let errors = anyProgram.updateNodeTypeIds(`nodeType fooType
regex regexString`)
  equal(
    anyProgram.toString(),
    `fooType someLang
 root
cellType foobar
 regexString test`
  )
}

testTree.toNodeJsJavascript = equal => {
  // Arrange
  let program = new GrammarProgram(grammarGrammar)
  // Act
  let compiledParser = program.toNodeJsJavascript()
  // Assert
  equal(typeof compiledParser, "string")
}

testTree.examples = equal => {
  // Arrange/Act
  const jibberishGrammarProgram = new GrammarProgram(jibberishGrammarCode, jibberishGrammarPath)

  // Assert
  let errors = jibberishGrammarProgram.getErrorsInGrammarExamples()
  equal(errors.length, 0)

  // Arrange/Act
  const badGrammarProgram = new GrammarProgram(
    `nodeType bad
 root
 inScope addNode
nodeType addNode
 match +
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
