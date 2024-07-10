#!/usr/bin/env ts-node

// todo: make isomorphic

import { scrollNotationTypes } from "../products/scrollNotationTypes"

const { Disk } = require("../products/Disk.node.js")
const { TestRacer } = require("../products/TestRacer.js")
const { HandParsersProgram } = require("../products/Parsers.js")
const path = require("path")

const jibberishRootDir = path.join(__dirname, "..", "langs", "jibberish")
const numbersPath = path.join(__dirname, "..", "langs", "numbers", "numbers.parsers")
const numbersParsers = Disk.read(numbersPath)
const arrowPath = path.join(__dirname, "..", "langs", "arrow", "arrow.parsers")
const arrowParsers = Disk.read(arrowPath)
const hakonPath = path.join(__dirname, "..", "langs", "hakon", "hakon.parsers")
const hakonParsers = Disk.read(hakonPath)
const parsersParsersPath = path.join(__dirname, "..", "langs", "parsers", "parsers.parsers")
const parsersParsers = Disk.read(parsersParsersPath)
const jibberishParsersPath = path.join(jibberishRootDir, "jibberish.parsers")
const jibberishParsersCode = Disk.read(jibberishParsersPath)
const poopParsersPath = path.join(__dirname, "..", "langs", "poop", "poop.parsers")

const testTree: scrollNotationTypes.testTree = {}

testTree.emptyProgram = equal => {
  // Arrange/Act/Assert
  const program = new HandParsersProgram()
  const errs = program.getAllErrors()

  // Assert
  if (errs.length) console.log(errs.map((err: any) => err.message))
  equal(errs.length, 0, "should be no errors")
}

testTree.parsersLangBasics = equal => {
  // Arrange/Act
  const parsersProgram = new HandParsersProgram(jibberishParsersCode)
  const errs = parsersProgram.getAllErrors()

  // Assert
  if (errs.length) console.log(errs.map((err: any) => err.message))
  equal(errs.length, 0, "should be no errors")
}

const makeParsersProgram = (code: string) => makeProgram(parsersParsers, code)

const makeJibberishProgram = (code: string) => {
  const parsersCode = Disk.read(jibberishParsersPath)
  return makeProgram(parsersCode, code)
}

const makePoopProgram = (code: string) => {
  const parsersCode = Disk.read(poopParsersPath)
  return makeProgram(parsersCode, code)
}

const makeIrisProgram = (code: string) => makeProgram(Disk.read(path.normalize(__dirname + "/../langs/iris/iris.parsers")), code)

const makeNumbersProgram = (code: string) => makeProgram(numbersParsers, code)

const makeProgram = (parsersCode: string, code: string) => {
  const parsersProgram = new HandParsersProgram(parsersCode)
  const rootParser = parsersProgram.compileAndReturnRootParser()
  return new rootParser(code)
}

testTree.trainAndPredict = equal => {
  // Arrange/Act
  const parsersProgram = new HandParsersProgram(hakonParsers)
  const hakonParser = parsersProgram.compileAndReturnRootParser()
  const testBlankProgram = new hakonParser()
  const handParsersProgram = testBlankProgram.handParsersProgram
  const examples = handParsersProgram.getNodesByGlobPath("* example").map((node: any) => node.childrenToString())
  const model = parsersProgram.trainModel(examples)

  // Assert
  const predictions = handParsersProgram.predictChildren(model, testBlankProgram)
  equal(predictions[0].id, "selectorParser")

  // Act
  const bodyNode = testBlankProgram.appendLine("body")

  // Assert
  const predictions2 = handParsersProgram.predictChildren(model, bodyNode)
  equal(predictions2[0].id, "propertyParser")

  // Act
  const fontSizeNode = testBlankProgram.appendLine("font-size")

  // Assert
  const predictions3 = handParsersProgram.predictParents(model, fontSizeNode)
  equal(predictions3[0].id, "selectorParser")
}

testTree.jibberish = equal => {
  // Arrange
  const sampleJibberishCode = Disk.read(path.join(jibberishRootDir, "sample.jibberish"))

  // Act
  const program = makeJibberishProgram(sampleJibberishCode)

  // Assert
  equal(program.constructor.name, "jibberishParser", "correct program class")
  const errs = program.getAllErrors()
  equal(errs.length, 0, `should be 0 errors`)
  if (errs.length) console.log(errs.map((err: any) => err.message))

  const parserDef = program.handParsersProgram.parserFamilyTree.getNode("abstractTopLevelParser nodeWithConstsParser nodeExpandsConstsParser")

  equal(parserDef.toString(), "nodeExpandsConstsParser", "family tree works")

  // Act
  const fooNode = <any>program.getNode("foo")
  const constNode = <any>program.getNode("nodeWithConsts")
  const nodeExpandsConsts = <any>program.getNode("nodeExpandsConsts")

  // Assert
  equal(fooNode.parserId, "fooParser")
  equal(constNode.parserId, "nodeWithConstsParser")
  equal(constNode.definition.ancestorParserIdsArray.join(" "), "abstractTopLevelParser nodeWithConstsParser")
  equal(constNode.definition.greeting, "hello world", "constants are also present on parsers definition nodes")

  // Assert
  equal(constNode.greeting, "hello world", "constant strings should work")
  equal(constNode.score1, 28, "constant insts should work")
  equal(constNode.score2, 3.01, "constant floats should work")
  equal(constNode.win, true, "constant booleans should work")
  const obj = constNode.definition.constantsObject
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
  const obj2 = nodeExpandsConsts.definition.constantsObject
  equal(obj2.greeting, "hola", "expanding constants works and last wins")
  equal(obj2.win, true, "expanding constants works")

  // Act
  const addition = program.getNode("+")

  // Assert
  equal(addition.constructor.name, "plusParser", "correct constructor name")

  // Act/Assert
  equal(program.getNode("someCode echo").constructor.name, "lineOfCodeParser", "line of code class")

  // Act
  const programWithParserBugs = makeJibberishProgram(`missing 1 2
missing2 true`)

  // Assert
  equal(programWithParserBugs.invalidParsers.length, 2)

  // Grandchild inheritance
  // Arrange
  const def = (<any>program.getNode("html.h1")).definition

  // Act/Assert
  equal(
    def
      ._getAncestorsArray()
      .map((def: any) => def.parserIdFromDefinition)
      .join(" "),
    "h1Parser abstractHtmlParser abstractTopLevelParser"
  )
}

const langs = Disk.dir(path.normalize(__dirname + `/../langs/`))
langs.forEach((lang: string) => {
  const folder = path.normalize(`${__dirname}/../langs/${lang}`)
  if (!Disk.isDir(folder)) return
  testTree[`${lang}SimTest`] = equal => {
    const parsersCode = Disk.read(path.normalize(`${folder}/${lang}.parsers`))
    const parsersProgram = new HandParsersProgram(parsersCode)
    const rootParser = parsersProgram.compileAndReturnRootParser()

    // Act
    const simulatedProgram = parsersProgram.rootParserDefinition.synthesizeNode().join("\n")

    // Assert
    const errors = new rootParser(simulatedProgram).getAllErrors()
    //if (errors.length) console.log(simulatedProgram, errors)
    equal(errors.length, 0, `should be no errors in simulated ${lang} program`)
  }
})

testTree.iris = equal => {
  // Arrange
  const programWithBugs = makeIrisProgram(`6.1 3 4.9  virginica`)

  // Act/Assert
  equal(programWithBugs.toCellTypeTree(), `sepalLengthCell sepalWidthCell petalLengthCell petalWidthCell speciesCell`)
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
  equal(programWithBugs.invalidParsers.length, 0)
}

testTree.toTypeScriptInterface = equal => {
  // Arrange
  const parsersProgram = new HandParsersProgram(arrowParsers).compileAndReturnRootParser()
  // Act // Assert
  equal(
    new parsersProgram().definition.toTypeScriptInterface(),
    `// A credit card charge
interface chargeParser {
 amount: any
 cardNumber: any
 currency: any
 description: any
 token?: any
}

interface arrowParser {
 Comment?: any
 charge?: chargeParser
}`
  )
}

testTree.cellTypeTree = equal => {
  // Act
  const someJibberishProgram = makeJibberishProgram(`foo
+ 2 3 2`)

  const a = (<any>someJibberishProgram.nodeAt(1)).definition

  // Assert
  equal(
    someJibberishProgram.toCellTypeTree(),
    `topLevelPropertyCell
opSymbolCell intCell intCell intCell`,
    "word types should match"
  )
  equal(someJibberishProgram.findAllWordsWithCellType("intCell").length, 3)

  // Act
  const parsers = someJibberishProgram.asCellTypeTreeWithParserIds
  const treeWithParsers = someJibberishProgram.asTreeWithParsers

  // Assert
  equal(
    parsers,
    `fooParser topLevelPropertyCell
plusParser opSymbolCell intCell intCell intCell`,
    "parsers word types should match"
  )
  equal(
    treeWithParsers,
    `fooParser foo
plusParser + 2 3 2`,
    "treeWithParsers word types should match"
  )
}

testTree.preludeTypes = equal => {
  // Act/Assert
  equal(makeNumbersProgram(`+ 2`).nodeAt(0).getLineCellPreludeTypes(), `anyCell floatCell`)
}

testTree.format = equal => {
  // Arrange
  const normalCode = `someLangParser
 root
abstractTopLevelParser
abstractHtmlParser
 extends abstractTopLevelParser
h1Parser
 crux html.h1
 extends abstractHtmlParser
abstractColorPropertiesParser
 extends abstractTopLevelParser
constrastParser
 extends abstractColorPropertiesParser
hueParser
 extends abstractColorPropertiesParser
saturationParser
 extends abstractColorPropertiesParser`
  const parsersProgram = makeParsersProgram(normalCode)
  const formatted = parsersProgram.format().toString()
  equal(formatted, normalCode, "code is already in formatted form")
}

testTree.formatDo = equal => {
  // Arrange
  const unsortedCode = `someLangParser
 root
 inScope abstractTopLevelParser
abstractTopLevelParser
h1Parser
 crux html.h1
 extends abstractHtmlParser
abstractHtmlParser
 extends abstractTopLevelParser
intCell`
  const sortedCode = `intCell
someLangParser
 root
 inScope abstractTopLevelParser
abstractTopLevelParser
abstractHtmlParser
 extends abstractTopLevelParser
h1Parser
 crux html.h1
 extends abstractHtmlParser`
  // Act/Assert
  equal(makeParsersProgram(unsortedCode).format().toString(), sortedCode, "code was fixed")
}

testTree.cokeRegression = equal => {
  // Arrange
  const lang = `cokeParser
 root
 inScope cokesParser
intCell
 highlightScope constant.numeric.integer
anyCell
cokesParser
 cells anyCell
 catchAllCellType intCell`
  const code = `
cokes 22 11`

  // Act
  const program = makeProgram(lang, code)

  // Assert
  const errs = program.getAllErrors()
  equal(errs.length, 0)
  if (errs.length) console.log(errs.map((err: any) => err.message).join("\n"))
  equal(typeof program.toHighlightScopeTree(), "string")
}

testTree.highlightScopes = equal => {
  // Arrange
  const someJibberishProgram = makeJibberishProgram(`foo
+ 2 3 2`)

  // Act
  const scopes = someJibberishProgram.toHighlightScopeTree()

  // Assert
  equal(
    scopes,
    `constant.language
keyword.operator.arithmetic constant.numeric constant.numeric constant.numeric`
  )

  // Arrange/Act/Assert
  equal(makeJibberishProgram(`fault`).toHighlightScopeTree(), `invalid`)
  equal(makeJibberishProgram(`fault fault`).toHighlightScopeTree(), `invalid invalid`)
  equal(makeNumbersProgram(`+ 2`).toHighlightScopeTree(), `keyword.operator.arithmetic constant.numeric`)

  // Arrange
  const program = makeJibberishProgram(`lightbulbState on
 someerror`)

  // Act/Assert
  equal(
    program.toHighlightScopeTree(),
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
  const acResults = program.getAutocompleteResultsAt(2, 0).matches
  equal(acResults.length, 7, "all nodes")
  equal(program.getAutocompleteResultsAt(0, 2).matches.length, 0, "should be none")

  equal(program.getAutocompleteResultsAt(0, 2).matches.length, 0)
  // todo: test for descriptions in addition to returned words

  // Arrange/Act/Assert
  equal(makeNumbersProgram(``).getAutocompleteResultsAt(0, 0).matches.length, 7, "should be 7 results at root level")

  // Arrange
  program = makeNumbersProgram(`+ 2 3
* 2 3 10`)

  // Act/Assert
  equal(program.execute().join(" "), "5 60")
}

testTree.extraWord = equal => {
  // Arrange
  const program = makeParsersProgram(`foobarParser
 root foo2`)

  // Act/Assert
  equal(program.getAllErrors().length, 1)
  equal(
    program.toCellTypeTree(),
    `parserIdCell
 propertyKeywordCell extraWordCell`
  )
}

testTree.autocompleteAdditionalWords = equal => {
  // Arrange
  const program = makeParsersProgram(`fooCell
 highlightScope comme`)

  // Act/Assert
  equal(program.getAutocompleteResultsAt(1, 20).matches.length, 5)
}

testTree.autocompleteAdvanced = equal => {
  // Arrange
  const program = makeParsersProgram(`latinParser
 root
 catchAllParser anyParser
 inScope faveNumberParser
integerCell
anyParser
faveNumberParser
 cells in`)

  // Act/Assert
  equal(program.getAutocompleteResultsAt(7, 9).matches.length, 2)

  equal(program.toSideBySide([program.toDefinitionLineNumberTree()]).numberOfLines, 8)
}

// todo: fix autocomplete for omnifix languages
// testTree._autocompleteUnicode = equal => {
//   // Arrange/Act/Assert
//   equal(makePoopProgram(``).getAutocompleteResultsAt(0, 0).matches.length, 5)
// }

testTree.autocompleteCustom = equal => {
  // Arrange/Act/Assert
  equal(makeJibberishProgram(`xColumnName `).getAutocompleteResultsAt(0, 12).matches.length, 3)
  equal(makeJibberishProgram(`xColumnName eight`).getAutocompleteResultsAt(0, 12).matches.length, 2)
  equal(makeJibberishProgram(`xColumnName gender`).getAllErrors().length, 0)
  equal(makeJibberishProgram(`xColumnName genders`).getAllErrors().length, 1, "should have 1 error. genders doesnt fit.")
}

testTree.blobParsers = equal => {
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

  // Regression test. The below should not throw
  equal(anyProgram.topDownArray.map((node: any) => node.parserId).length > 0, true, "passed blob regression")
}

testTree.sublimeSyntaxFile = equal => {
  // Arrange/Act
  const parsersProgram = new HandParsersProgram(jibberishParsersCode)
  const code = parsersProgram.toSublimeSyntaxFile()

  // Assert
  equal(code.includes("scope:"), true)
}

testTree.toStumpString = equal => {
  // Arrange/Act
  const parsersProgram = new HandParsersProgram(arrowParsers).compileAndReturnRootParser()
  const code = new parsersProgram().definition.getParserDefinitionByParserId("chargeParser").toStumpString()
  const expected = `div
 label amount
 input
  name amount
  type number
  placeholder 9.99
  min 0
  max 99999
div
 label currency
 select
  name currency
  option usd
  option cad
  option jpy
div
 label cardNumber
 input
  name cardNumber
  placeholder 1111222233334444
div
 label token
 input
  name token
  placeholder sk_test_4eC39H`

  // Assert
  equal(code, expected, "form correct")
}

// todo: reenable once we have the requirement of at least 1 root node
// testTree.requiredParsers = equal => {
//   // Arrange/Act
//   const path = parsersParsersPath
//   const anyProgram = makeProgram(
//     readFileSync(path, "utf8"),
//     `cellType word
// parser baseParser`,
//     path
//   )

//   // Assert
//   const errs = anyProgram.getAllErrors()
//   equal(errs.length, 1)
// }

testTree.minimumParsers = equal => {
  // Arrange/Act
  const rootParser = new HandParsersProgram(
    `anyLangParser
 root
 catchAllParser anyParser
anyParser
 catchAllCellType anyCell
anyCell`
  ).compileAndReturnRootParser()
  const program = new rootParser()
  const handParsersProgram = program.handParsersProgram

  // Assert
  let errors = handParsersProgram.getAllErrors()
  equal(errors.length, 0)
  errors = program.getAllErrors()
  equal(errors.length, 0)

  // Arrange/Act/Assert
  const constructor = new HandParsersProgram().compileAndReturnRootParser()
  const errs = new constructor("foobar").getAllErrors()
  equal(errs.length, 0)
}

testTree.rootCatchAllParser = equal => {
  // Arrange
  const abcLang = new HandParsersProgram(`abcParser
 root`).compileAndReturnRootParser()

  // Act/Assert
  const program = new abcLang("foobar")
  equal(program.getAllErrors().length, 0)
  equal(program.toCellTypeTree(), "extraWordCell", "one word")

  // Arrange
  const abcLangWithErrors = new HandParsersProgram(`abcParser
 root
 catchAllParser errorParser
errorParser
 baseParser errorParser`).compileAndReturnRootParser()

  // Act/Assert
  equal(new abcLangWithErrors("foobar").getAllErrors().length, 1)
}

testTree.blankParserId = equal => {
  // Arrange
  const abcLang = new HandParsersProgram(`parser `).compileAndReturnRootParser()

  // Act/Assert
  equal(new abcLang("foobar").getAllErrors().length, 0)
}

testTree.parsersWithLoop = equal => {
  // Arrange/Act/Assert
  try {
    const rootParser = new HandParsersProgram(
      `langWithLoopParser
 root
 catchAllParser nodeAParser
nodeAParser
 extends nodeCParser
 catchAllCellType anyCell
nodeBParser
 extends nodeAParser
nodeCParser
 extends nodeBParser
anyCell`
    ).compileAndReturnRootParser()

    new rootParser("nodeA")
    equal(false, true, "Should have thrown error")
  } catch (err) {
    equal(err.toString().includes("Loop"), true, `Expected correct error thrown when parsers. Got: ${err.toString()}`)
  }
}

testTree.duplicateParsers = equal => {
  // Arrange/Act
  const anyProgram = makeJibberishProgram(`type foo
type bar`)

  // Assert
  equal(anyProgram.getAllErrors().length, 2)
}

testTree.abstractParsers = equal => {
  // Arrange/Act
  const anyProgram = makeJibberishProgram(`someAbstractClass
extendsAbstract 2`)

  // Assert
  equal(anyProgram.getAllErrors().length, 1)
}

testTree.updateParserIds = equal => {
  // Arrange/Act
  const anyProgram = makeParsersProgram(`someLangParser
 root
foobarCell
 regex test`)

  // Assert
  anyProgram.findAllNodesWithParser("regexParser").forEach((node: any) => {
    node.setWord(0, "regexString")
  })
  equal(
    anyProgram.toString(),
    `someLangParser
 root
foobarCell
 regexString test`
  )
}

testTree.toNodeJsJavascript = equal => {
  // Arrange
  let program = new HandParsersProgram(parsersParsers)
  // Act
  let compiledParser = program.toNodeJsJavascript()
  // Assert
  equal(typeof compiledParser, "string")
}

testTree.invalidParsersRegression = equal => {
  // Arrange
  let program = new HandParsersProgram(`oldStyle something
 root`)
  // Act
  let compiledParser = program.toNodeJsJavascript()
  // Assert
  equal(typeof compiledParser, "string")
}

testTree.bundler = equal => {
  // Arrange
  const jibberishParsersProgram = new HandParsersProgram(jibberishParsersCode)

  // Act
  const bundle = jibberishParsersProgram.toBundle()

  // Assert
  equal(bundle["readme.md"].includes("Installing"), true)
}

const jibberishParsersProgram = new HandParsersProgram(jibberishParsersCode)
Object.assign(testTree, jibberishParsersProgram.examplesToTestBlocks())

// Arrange/Act
const badParsersProgram = new HandParsersProgram(
  `badParser
 root
 inScope addParser
addParser
 crux +
 catchAllCellType intCell
 cells keywordCell
 example This is a bad example.
  + 1 B
keywordCell
intCell`
)
Object.assign(testTree, badParsersProgram.examplesToTestBlocks(undefined, `InvalidWord at line 9 cell 2. "B" does not fit in cellType "intCell".`))

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)

export { testTree }
