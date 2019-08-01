#! /usr/bin/env node

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
  const errs = program.getAllErrors()

  // Assert
  if (errs.length) console.log(errs.map(err => err.getMessage()))
  equal(errs.length, 0, "should be no errors")
}

testTree.basics = equal => {
  // Arrange/Act
  const grammarProgram = new GrammarProgram(jibberishGrammarCode)
  const errs = grammarProgram.getAllErrors()

  // Assert
  if (errs.length) console.log(errs.map(err => err.getMessage()))
  equal(errs.length, 0, "should be no errors")
}

const makeGrammarProgram = code => makeProgram(grammarGrammar, code)

const makeJibberishProgram = code => {
  const grammarCode = fs.readFileSync(jibberishGrammarPath, "utf8")
  return makeProgram(grammarCode, code)
}

const makeNumbersProgram = code => makeProgram(numbersGrammar, code)

const makeProgram = (grammarCode, code) => {
  const grammarProgram = new GrammarProgram(grammarCode)
  const rootProgramConstructor = grammarProgram.getRootConstructor()
  return new rootProgramConstructor(code)
}

testTree.jibberish = equal => {
  // Arrange
  const sampleJibberishCode = fs.readFileSync(jibberishRootDir + "sample.jibberish", "utf8")

  // Act
  const program = makeJibberishProgram(sampleJibberishCode)

  // Assert
  equal(program.constructor.name, "jibberishNode", "correct program class")
  const errs = program.getAllErrors()
  equal(errs.length, 0, `should be 0 errors`)
  if (errs.length) console.log(errs.map(err => err.getMessage()))

  const defNode = program
    .getGrammarProgramRoot()
    .getNodeTypeFamilyTree()
    .getNode("topLevelNode nodeWithConstsNode nodeExpandsConstsNode")

  equal(defNode.toString(), "nodeExpandsConstsNode", "family tree works")

  // Act
  const fooNode = program.getNode("foo")
  const constNode = program.getNode("nodeWithConsts")
  const nodeExpandsConsts = program.getNode("nodeExpandsConsts")

  // Assert
  equal(fooNode.getNodeTypeId(), "fooNode")
  equal(constNode.getNodeTypeId(), "nodeWithConstsNode")
  equal(
    constNode
      .getDefinition()
      .getAncestorNodeTypeIdsArray()
      .join(" "),
    "topLevelNode nodeWithConstsNode"
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
  equal(addition.constructor.name, "plusNode", "correct constructor name")

  // Act/Assert
  equal(program.getNode("someCode echo").constructor.name, "lineOfCodeNode", "line of code class")

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
    "h1Node abstractHtmlNode topLevelNode"
  )
}

testTree.jibberishErrors = equal => {
  // Arrange
  const programWithBugs = makeJibberishProgram(`+ foo bar`)

  // Act/Assert
  equal(programWithBugs.getAllErrors().length, 2, "2 errors")

  // Act
  let count = 0
  for (let err of programWithBugs.getAllErrorsIterator()) {
    // 2 errors in 1 line
    equal(err.length, 2)
  }

  // Act/Asssert
  equal(programWithBugs.getInvalidNodeTypes().length, 0)
}

testTree.cellTypeTree = equal => {
  // Act
  const someJibberishProgram = makeJibberishProgram(`foo
+ 2 3 2`)

  const a = someJibberishProgram.nodeAt(1).getDefinition()

  // Assert
  equal(
    someJibberishProgram.getInPlaceCellTypeTree(),
    `topLevelPropertyCell
opSymbolCell intCell intCell intCell`,
    "word types should match"
  )
  equal(someJibberishProgram.findAllWordsWithCellType("intCell").length, 3)

  // Act
  const nodeTypes = someJibberishProgram.getInPlaceCellTypeTreeWithNodeConstructorNames()
  const treeWithNodeTypes = someJibberishProgram.getTreeWithNodeTypes()

  // Assert
  equal(
    nodeTypes,
    `fooNode topLevelPropertyCell
plusNode opSymbolCell intCell intCell intCell`,
    "nodeTypes word types should match"
  )
  equal(
    treeWithNodeTypes,
    `fooNode foo
plusNode + 2 3 2`,
    "treeWithNodeTypes word types should match"
  )
}

testTree.prettify = equal => {
  // Arrange
  const normalCode = `someLangNode
 root
topLevelNode
 abstract
abstractHtmlNode
 extends topLevelNode
 abstract
h1Node
 match html.h1
 extends abstractHtmlNode
colorPropertiesNode
 extends topLevelNode
 abstract
constrastNode
 extends colorPropertiesNode
hueNode
 extends colorPropertiesNode
saturationNode
 extends colorPropertiesNode`
  const grammarProgram = makeGrammarProgram(normalCode)
  const pretty = grammarProgram
    .sortNodesByInScopeOrder()
    .getSortedByInheritance()
    .toString()
  equal(pretty, normalCode, "code is already in pretty form")
}

testTree.prettifyDo = equal => {
  // Arrange
  const unsortedCode = `someLangNode
 root
 inScope topLevelNode
topLevelNode
 abstract
h1Node
 match html.h1
 extends abstractHtmlNode
abstractHtmlNode
 extends topLevelNode
 abstract
intCell`
  const sortedCode = `intCell
someLangNode
 root
 inScope topLevelNode
topLevelNode
 abstract
abstractHtmlNode
 extends topLevelNode
 abstract
h1Node
 match html.h1
 extends abstractHtmlNode`
  // Act/Assert
  equal(
    makeGrammarProgram(unsortedCode)
      .sortNodesByInScopeOrder()
      .getSortedByInheritance()
      .toString(),
    sortedCode,
    "code was fixed"
  )
}

testTree.cokeRegression = equal => {
  // Arrange
  const lang = `cokeNode
 root
 inScope cokesNode
intCell
 highlightScope constant.numeric.integer
cokesNode
 catchAllCellType intCell`
  const code = `
cokes 22 11`

  // Act
  const program = makeGrammarProgram(lang, code)

  // Assert
  equal(program.getAllErrors().length, 0)
  equal(typeof program.getInPlaceHighlightScopeTree(), "string")
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
  equal(program.getAutocompleteResultsAt(1, 0).matches.length, 1, "should be 1 match")
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
  const program = makeGrammarProgram(`foobarNode
 root foo2`)

  // Act/Assert
  equal(program.getAllErrors().length, 1)
  equal(
    program.getInPlaceCellTypeTree(),
    `nodeTypeIdCell
 propertyKeywordCell extraWordCell`
  )
}

testTree.autocompleteAdditionalWords = equal => {
  // Arrange
  const program = makeGrammarProgram(`fooCell
 highlightScope comme`)

  // Act/Assert
  equal(program.getAutocompleteResultsAt(1, 20).matches.length, 5)
}

testTree.autocompleteAdvanced = equal => {
  // Arrange
  const program = makeGrammarProgram(`latinNode
 root
 catchAllNodeType anyNode
 inScope faveNumberNode
integerCell
anyNode
faveNumberNode
 cells in`)

  // Act/Assert
  equal(program.getAutocompleteResultsAt(7, 9).matches.length, 2)
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
  const grammarProgram = new GrammarProgram(jibberishGrammarCode)
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
    `anyLangNode
 root
 catchAllNodeType anyNode
anyNode
 catchAllCellType anyCell
anyCell`
  ).getRootConstructor()
  const program = new programConstructor()
  const grammarProgram = program.getGrammarProgramRoot()

  // Assert
  let errors = grammarProgram.getAllErrors()
  equal(errors.length, 0)
  errors = program.getAllErrors()
  equal(errors.length, 0)

  // Arrange/Act/Assert
  const constructor = new GrammarProgram().getRootConstructor()
  const errs = new constructor("foobar").getAllErrors()
  equal(errs.length, 0)
}

testTree.rootCatchAllNode = equal => {
  // Arrange
  const abcLang = new GrammarProgram(`abcNode
 root`).getRootConstructor()

  // Act/Assert
  const program = new abcLang("foobar")
  equal(program.getAllErrors().length, 0)
  equal(program.getInPlaceCellTypeTree(), "anyFirstCell")

  // Arrange
  const abcLangWithErrors = new GrammarProgram(`abcNode
 root
 catchAllNodeType errorNode
errorNode
 baseNodeType errorNode`).getRootConstructor()

  // Act/Assert
  equal(new abcLangWithErrors("foobar").getAllErrors().length, 1)
}

testTree.blankNodeId = equal => {
  // Arrange
  const abcLang = new GrammarProgram(`nodeType `).getRootConstructor()

  // Act/Assert
  equal(new abcLang("foobar").getAllErrors().length, 0)
}

testTree.grammarWithLoop = equal => {
  // Arrange/Act/Assert
  try {
    const programConstructor = new GrammarProgram(
      `langWithLoopNode
 root
 catchAllNodeType nodeANode
nodeANode
 extends nodeCNode
 catchAllCellType anyCell
nodeBNode
 extends nodeANode
nodeCNode
 extends nodeBNode
anyCell`
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
  const anyProgram = makeGrammarProgram(`someLangNode
 root
foobarCell
 regex test`)

  // Assert
  anyProgram.findAllNodesWithNodeType("regexNode").forEach(node => {
    node.setWord(0, "regexString")
  })
  equal(
    anyProgram.toString(),
    `someLangNode
 root
foobarCell
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

testTree.invalidGrammarRegression = equal => {
  // Arrange
  let program = new GrammarProgram(`oldStyle something
 root`)
  // Act
  let compiledParser = program.toNodeJsJavascript()
  // Assert
  equal(typeof compiledParser, "string")
}

testTree.examples = equal => {
  // Arrange/Act
  const jibberishGrammarProgram = new GrammarProgram(jibberishGrammarCode)

  // Assert
  let errors = jibberishGrammarProgram.getErrorsInGrammarExamples()
  equal(errors.length, 0)

  // Arrange/Act
  const badGrammarProgram = new GrammarProgram(
    `badNode
 root
 inScope addNode
addNode
 match +
 catchAllCellType intCell
 example This is a bad example.
  + 1 B
anyFirstCell
intCell`
  )

  // Assert
  errors = badGrammarProgram.getErrorsInGrammarExamples()
  equal(errors.length, 1)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../builder/testTreeRunner.js")(testTree)
module.exports = testTree
