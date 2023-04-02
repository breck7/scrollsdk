const { Utils } = require("../products/Utils.js")
const { TreeNode, TreeWord, ExtendibleTreeNode, AbstractExtendibleTreeNode } = require("../products/TreeNode.js")

import { treeNotationTypes } from "../products/treeNotationTypes"

interface AbstractRuntimeProgramConstructorInterface {
  new (code?: string): GrammarBackedNode
}

declare type parserInfo = { firstWordMap: { [firstWord: string]: parserDefinitionParser }; regexTests: treeNotationTypes.regexTestDef[] }

// Compiled language parsers will include these files:
const GlobalNamespaceAdditions: treeNotationTypes.stringMap = {
  Utils: "Utils.js",
  TreeNode: "TreeNode.js",
  HandGrammarProgram: "GrammarLanguage.js",
  GrammarBackedNode: "GrammarLanguage.js"
}

interface SimplePredictionModel {
  matrix: treeNotationTypes.int[][]
  idToIndex: { [id: string]: treeNotationTypes.int }
  indexToId: { [index: number]: string }
}

enum GrammarConstantsCompiler {
  stringTemplate = "stringTemplate", // replacement instructions
  indentCharacter = "indentCharacter",
  catchAllCellDelimiter = "catchAllCellDelimiter",
  openChildren = "openChildren",
  joinChildrenWith = "joinChildrenWith",
  closeChildren = "closeChildren"
}

enum GrammarConstantsMisc {
  doNotSynthesize = "doNotSynthesize"
}

enum PreludeCellTypeIds {
  anyCell = "anyCell",
  keywordCell = "keywordCell",
  extraWordCell = "extraWordCell",
  floatCell = "floatCell",
  numberCell = "numberCell",
  bitCell = "bitCell",
  boolCell = "boolCell",
  intCell = "intCell"
}

enum GrammarConstantsConstantTypes {
  boolean = "boolean",
  string = "string",
  int = "int",
  float = "float"
}

enum GrammarBundleFiles {
  package = "package.json",
  readme = "readme.md",
  indexHtml = "index.html",
  indexJs = "index.js",
  testJs = "test.js"
}

enum GrammarCellParser {
  prefix = "prefix",
  postfix = "postfix",
  omnifix = "omnifix"
}

enum GrammarConstants {
  // node types
  extensions = "extensions",
  comment = "//",
  version = "version",
  parser = "parser",
  cellType = "cellType",

  grammarFileExtension = "grammar",

  abstractParserPrefix = "abstract",
  parserSuffix = "Parser",
  cellTypeSuffix = "Cell",

  // error check time
  regex = "regex", // temporary?
  reservedWords = "reservedWords", // temporary?
  enumFromCellTypes = "enumFromCellTypes", // temporary?
  enum = "enum", // temporary?
  examples = "examples",
  min = "min",
  max = "max",

  // baseParsers
  baseParser = "baseParser",
  blobParser = "blobParser",
  errorParser = "errorParser",

  // parse time
  extends = "extends",
  root = "root",
  crux = "crux",
  cruxFromId = "cruxFromId",
  pattern = "pattern",
  inScope = "inScope",
  cells = "cells",
  listDelimiter = "listDelimiter",
  contentKey = "contentKey",
  childrenKey = "childrenKey",
  uniqueFirstWord = "uniqueFirstWord",
  catchAllCellType = "catchAllCellType",
  cellParser = "cellParser",
  catchAllParser = "catchAllParser",
  constants = "constants",
  required = "required", // Require this parser to be present in a node or program
  single = "single", // Have at most 1 of these
  uniqueLine = "uniqueLine", // Can't have duplicate lines.
  tags = "tags",

  _extendsJsClass = "_extendsJsClass", // todo: remove
  _rootNodeJsHeader = "_rootNodeJsHeader", // todo: remove

  // default catchAll parser
  BlobParser = "BlobParser",
  DefaultRootParser = "DefaultRootParser",

  // code
  javascript = "javascript",

  // compile time
  compilerParser = "compiler",
  compilesTo = "compilesTo",

  // develop time
  description = "description",
  example = "example",
  sortTemplate = "sortTemplate",
  frequency = "frequency", // todo: remove. switch to conditional frequencies. potentially do that outside this core lang.
  highlightScope = "highlightScope"
}

class TypedWord extends TreeWord {
  private _type: string
  constructor(node: TreeNode, cellIndex: number, type: string) {
    super(node, cellIndex)
    this._type = type
  }
  get type() {
    return this._type
  }
  toString() {
    return this.word + ":" + this.type
  }
}

// todo: can we merge these methods into base TreeNode and ditch this class?
abstract class GrammarBackedNode extends TreeNode {
  private _definition: AbstractParserDefinitionParser | HandGrammarProgram | parserDefinitionParser
  get definition(): AbstractParserDefinitionParser | HandGrammarProgram | parserDefinitionParser {
    if (this._definition) return this._definition

    this._definition = this.isRoot() ? this.handGrammarProgram : this.parent.definition.getParserDefinitionByParserId(this.constructor.name)
    return this._definition
  }

  get rootGrammarTree() {
    return this.definition.root
  }

  getAutocompleteResults(partialWord: string, cellIndex: treeNotationTypes.positiveInt) {
    return cellIndex === 0 ? this._getAutocompleteResultsForFirstWord(partialWord) : this._getAutocompleteResultsForCell(partialWord, cellIndex)
  }

  private _nodeIndex: {
    [parserId: string]: GrammarBackedNode[]
  }

  protected get nodeIndex() {
    // StringMap<int> {firstWord: index}
    // When there are multiple tails with the same firstWord, _index stores the last content.
    // todo: change the above behavior: when a collision occurs, create an array.
    return this._nodeIndex || this._makeNodeIndex()
  }

  _clearIndex() {
    delete this._nodeIndex
    return super._clearIndex()
  }

  protected _makeIndex(startAt = 0) {
    if (this._nodeIndex) this._makeNodeIndex(startAt)
    return super._makeIndex(startAt)
  }

  protected _makeNodeIndex(startAt = 0) {
    if (!this._nodeIndex || !startAt) this._nodeIndex = {}
    const nodes = this._getChildrenArray() as GrammarBackedNode[]
    const newIndex = this._nodeIndex
    const length = nodes.length

    for (let index = startAt; index < length; index++) {
      const node = nodes[index]
      const ancestors = Array.from(node.definition._getAncestorSet()).forEach(id => {
        if (!newIndex[id]) newIndex[id] = []
        newIndex[id].push(node)
      })
    }

    return newIndex
  }

  getChildInstancesOfParserId(parserId: treeNotationTypes.parserId): GrammarBackedNode[] {
    return this.nodeIndex[parserId] || []
  }

  doesExtend(parserId: treeNotationTypes.parserId) {
    return this.definition._doesExtend(parserId)
  }

  _getErrorParserErrors() {
    return [this.firstWord ? new UnknownParserError(this) : new BlankLineError(this)]
  }

  _getBlobParserCatchAllParser() {
    return BlobParser
  }

  private _getAutocompleteResultsForFirstWord(partialWord: string) {
    const keywordMap = this.definition.firstWordMapWithDefinitions
    let keywords: string[] = Object.keys(keywordMap)

    if (partialWord) keywords = keywords.filter(keyword => keyword.includes(partialWord))

    return keywords
      .map(keyword => {
        const def = keywordMap[keyword]
        if (def.suggestInAutocomplete === false) return false
        const description = def.description
        return {
          text: keyword,
          displayText: keyword + (description ? " " + description : "")
        }
      })
      .filter(i => i)
  }

  private _getAutocompleteResultsForCell(partialWord: string, cellIndex: treeNotationTypes.positiveInt) {
    // todo: root should be [] correct?
    const cell = this.parsedCells[cellIndex]
    return cell ? cell.getAutoCompleteWords(partialWord) : []
  }

  // note: this is overwritten by the root node of a runtime grammar program.
  // some of the magic that makes this all work. but maybe there's a better way.
  get handGrammarProgram(): HandGrammarProgram {
    if (this.isRoot()) throw new Error(`Root node without getHandGrammarProgram defined.`)
    return (<any>this.root).handGrammarProgram
  }

  getRunTimeEnumOptions(cell: AbstractGrammarBackedCell<any>): string[] {
    return undefined
  }

  private _sortNodesByInScopeOrder() {
    const parserOrder = this.definition._getMyInScopeParserIds()
    if (!parserOrder.length) return this
    const orderMap: treeNotationTypes.stringMap = {}
    parserOrder.forEach((word, index) => (orderMap[word] = index))
    this.sort(Utils.makeSortByFn((runtimeNode: GrammarBackedNode) => orderMap[runtimeNode.definition.parserIdFromDefinition]))
    return this
  }

  protected get requiredNodeErrors() {
    const errors: treeNotationTypes.TreeError[] = []
    Object.values(this.definition.firstWordMapWithDefinitions).forEach(def => {
      if (def.isRequired() && !this.nodeIndex[def.id]) errors.push(new MissingRequiredParserError(this, def.id))
    })
    return errors
  }

  get programAsCells() {
    // todo: what is this?
    return this.topDownArray.map((node: GrammarBackedNode) => {
      const cells = node.parsedCells
      let indents = node.getIndentLevel() - 1
      while (indents) {
        cells.unshift(undefined)
        indents--
      }
      return cells
    })
  }

  get programWidth() {
    return Math.max(...this.programAsCells.map(line => line.length))
  }

  get allTypedWords() {
    const words: TypedWord[] = []
    this.topDownArray.forEach((node: GrammarBackedNode) => node.wordTypes.forEach((cell, index) => words.push(new TypedWord(node, index, cell.cellTypeId))))
    return words
  }

  findAllWordsWithCellType(cellTypeId: treeNotationTypes.cellTypeId) {
    return this.allTypedWords.filter(typedWord => typedWord.type === cellTypeId)
  }

  findAllNodesWithParser(parserId: treeNotationTypes.parserId) {
    return this.topDownArray.filter((node: GrammarBackedNode) => node.definition.parserIdFromDefinition === parserId)
  }

  toCellTypeTree() {
    return this.topDownArray.map(child => child.indentation + child.lineCellTypes).join("\n")
  }

  getParseTable(maxColumnWidth = 40) {
    const tree = new TreeNode(this.toCellTypeTree())
    return new TreeNode(
      tree.topDownArray.map((node, lineNumber) => {
        const sourceNode = this.nodeAtLine(lineNumber)
        const errs = sourceNode.getErrors()
        const errorCount = errs.length
        const obj: any = {
          lineNumber: lineNumber,
          source: sourceNode.indentation + sourceNode.getLine(),
          parser: sourceNode.constructor.name,
          cellTypes: node.content,
          errorCount: errorCount
        }
        if (errorCount) obj.errorMessages = errs.map(err => err.message).join(";")
        return obj
      })
    ).toFormattedTable(maxColumnWidth)
  }

  // Helper method for selecting potential parsers needed to update grammar file.
  get invalidParsers() {
    return Array.from(
      new Set(
        this.getAllErrors()
          .filter(err => err instanceof UnknownParserError)
          .map(err => err.getNode().firstWord)
      )
    )
  }

  private _getAllAutoCompleteWords() {
    return this.getAllWordBoundaryCoordinates().map(coordinate => {
      const results = this.getAutocompleteResultsAt(coordinate.lineIndex, coordinate.charIndex)
      return {
        lineIndex: coordinate.lineIndex,
        charIndex: coordinate.charIndex,
        wordIndex: coordinate.wordIndex,
        word: results.word,
        suggestions: results.matches
      }
    })
  }

  toAutoCompleteCube(fillChar = "") {
    const trees: any[] = [this.clone()]
    const filled = this.clone().fill(fillChar)
    this._getAllAutoCompleteWords().forEach(hole => {
      hole.suggestions.forEach((suggestion, index) => {
        if (!trees[index + 1]) trees[index + 1] = filled.clone()
        trees[index + 1].nodeAtLine(hole.lineIndex).setWord(hole.wordIndex, suggestion.text)
      })
    })
    return new TreeNode(trees)
  }

  toAutoCompleteTable() {
    return new TreeNode(
      <any>this._getAllAutoCompleteWords().map(result => {
        result.suggestions = <any>result.suggestions.map((node: any) => node.text).join(" ")
        return result
      })
    ).asTable
  }

  getAutocompleteResultsAt(lineIndex: treeNotationTypes.positiveInt, charIndex: treeNotationTypes.positiveInt) {
    const lineNode = this.nodeAtLine(lineIndex) || this
    const nodeInScope = <GrammarBackedNode>lineNode.getNodeInScopeAtCharIndex(charIndex)

    // todo: add more tests
    // todo: second param this.childrenToString()
    // todo: change to getAutocomplete definitions

    const wordIndex = lineNode.getWordIndexAtCharacterIndex(charIndex)
    const wordProperties = lineNode.getWordProperties(wordIndex)
    return {
      startCharIndex: wordProperties.startCharIndex,
      endCharIndex: wordProperties.endCharIndex,
      word: wordProperties.word,
      matches: nodeInScope.getAutocompleteResults(wordProperties.word, wordIndex)
    }
  }

  private _sortWithParentParsersUpTop() {
    const familyTree = new HandGrammarProgram(this.toString()).parserFamilyTree
    const rank: treeNotationTypes.stringMap = {}
    familyTree.topDownArray.forEach((node, index) => {
      rank[node.getWord(0)] = index
    })
    const nodeAFirst = -1
    const nodeBFirst = 1
    this.sort((nodeA, nodeB) => {
      const nodeARank = rank[nodeA.getWord(0)]
      const nodeBRank = rank[nodeB.getWord(0)]
      return nodeARank < nodeBRank ? nodeAFirst : nodeBFirst
    })
    return this
  }

  format() {
    if (this.isRoot()) {
      this._sortNodesByInScopeOrder()

      try {
        this._sortWithParentParsersUpTop()
      } catch (err) {
        console.log(`Warning: ${err}`)
      }
    }
    this.topDownArray.forEach(child => {
      child.format()
    })
    return this
  }

  sortFromSortTemplate() {
    if (!this.length) return this

    // Recurse
    this.forEach((node: any) => node.sortFromSortTemplate())

    const def = this.isRoot() ? this.definition.rootParserDefinition : this.definition
    const { sortIndices, sortSections } = def.sortSpec

    // Sort and insert section breaks
    if (sortIndices.size) {
      // Sort keywords
      this.sort((nodeA: any, nodeB: any) => {
        const aIndex = sortIndices.get(nodeA.firstWord) ?? sortIndices.get(nodeA.sortKey)
        const bIndex = sortIndices.get(nodeB.firstWord) ?? sortIndices.get(nodeB.sortKey)
        if (aIndex === undefined) console.error(`sortTemplate is missing "${nodeA.firstWord}"`)

        const a = aIndex ?? 1000
        const b = bIndex ?? 1000
        return a > b ? 1 : a < b ? -1 : nodeA.getLine() > nodeB.getLine()
      })

      // pad sections
      let currentSection = 0
      this.forEach((node: any) => {
        const nodeSection = sortSections.get(node.firstWord) ?? sortSections.get(node.sortKey)
        const sectionHasAdvanced = nodeSection > currentSection
        if (sectionHasAdvanced) {
          currentSection = nodeSection
          node.prependSibling("") // Put a blank line before this section
        }
      })
    }

    return this
  }

  getParserUsage(filepath = "") {
    // returns a report on what parsers from its language the program uses
    const usage = new TreeNode()
    const handGrammarProgram = this.handGrammarProgram
    handGrammarProgram.validConcreteAndAbstractParserDefinitions.forEach((def: AbstractParserDefinitionParser) => {
      const requiredCellTypeIds = def.cellParser.getRequiredCellTypeIds()
      usage.appendLine([def.parserIdFromDefinition, "line-id", "parser", requiredCellTypeIds.join(" ")].join(" "))
    })
    this.topDownArray.forEach((node: GrammarBackedNode, lineNumber: number) => {
      const stats = usage.getNode(node.parserId)
      stats.appendLine([filepath + "-" + lineNumber, node.words.join(" ")].join(" "))
    })
    return usage
  }

  toHighlightScopeTree() {
    return this.topDownArray.map((child: GrammarBackedNode) => child.indentation + child.getLineHighlightScopes()).join("\n")
  }

  toDefinitionLineNumberTree() {
    return this.topDownArray.map((child: GrammarBackedNode) => child.definition.lineNumber + " " + child.indentation + child.cellDefinitionLineNumbers.join(" ")).join("\n")
  }

  get asCellTypeTreeWithParserIds() {
    return this.topDownArray.map((child: GrammarBackedNode) => child.constructor.name + this.wordBreakSymbol + child.indentation + child.lineCellTypes).join("\n")
  }

  toPreludeCellTypeTreeWithParserIds() {
    return this.topDownArray.map((child: GrammarBackedNode) => child.constructor.name + this.wordBreakSymbol + child.indentation + child.getLineCellPreludeTypes()).join("\n")
  }

  get asTreeWithParsers() {
    return this.topDownArray.map((child: GrammarBackedNode) => child.constructor.name + this.wordBreakSymbol + child.indentation + child.getLine()).join("\n")
  }

  getCellHighlightScopeAtPosition(lineIndex: number, wordIndex: number): treeNotationTypes.highlightScope | undefined {
    this._initCellTypeCache()
    const typeNode = this._cache_highlightScopeTree.topDownArray[lineIndex - 1]
    return typeNode ? typeNode.getWord(wordIndex - 1) : undefined
  }

  private _cache_programCellTypeStringMTime: number
  private _cache_highlightScopeTree: TreeNode
  private _cache_typeTree: TreeNode

  protected _initCellTypeCache(): void {
    const treeMTime = this.getLineOrChildrenModifiedTime()
    if (this._cache_programCellTypeStringMTime === treeMTime) return undefined

    this._cache_typeTree = new TreeNode(this.toCellTypeTree())
    this._cache_highlightScopeTree = new TreeNode(this.toHighlightScopeTree())
    this._cache_programCellTypeStringMTime = treeMTime
  }

  createParserCombinator() {
    return this.isRoot() ? new TreeNode.ParserCombinator(BlobParser) : new TreeNode.ParserCombinator(this.parent._getParser()._getCatchAllParser(this.parent), {})
  }

  get parserId(): treeNotationTypes.parserId {
    return this.definition.parserIdFromDefinition
  }

  get wordTypes() {
    return this.parsedCells.filter(cell => cell.getWord() !== undefined)
  }

  private get cellErrors() {
    return this.parsedCells.map(check => check.getErrorIfAny()).filter(identity => identity)
  }

  private get singleParserUsedTwiceErrors() {
    const errors: treeNotationTypes.TreeError[] = []
    const parent = this.parent as GrammarBackedNode
    const hits = parent.getChildInstancesOfParserId(this.definition.id)

    if (hits.length > 1)
      hits.forEach((node, index) => {
        if (node === this) errors.push(new ParserUsedMultipleTimesError(<GrammarBackedNode>node))
      })
    return errors
  }

  private get uniqueLineAppearsTwiceErrors() {
    const errors: treeNotationTypes.TreeError[] = []
    const parent = this.parent as GrammarBackedNode
    const hits = parent.getChildInstancesOfParserId(this.definition.id)

    if (hits.length > 1) {
      const set = new Set()
      hits.forEach((node, index) => {
        const line = node.getLine()
        if (set.has(line)) errors.push(new ParserUsedMultipleTimesError(<GrammarBackedNode>node))
        set.add(line)
      })
    }
    return errors
  }

  get scopeErrors() {
    let errors: treeNotationTypes.TreeError[] = []
    const def = this.definition
    if (def.isSingle) errors = errors.concat(this.singleParserUsedTwiceErrors)
    if (def.isUniqueLine) errors = errors.concat(this.uniqueLineAppearsTwiceErrors)

    const { requiredNodeErrors } = this
    if (requiredNodeErrors.length) errors = errors.concat(requiredNodeErrors)
    return errors
  }

  getErrors() {
    return this.cellErrors.concat(this.scopeErrors)
  }

  get parsedCells(): AbstractGrammarBackedCell<any>[] {
    return this.definition.cellParser.getCellArray(this)
  }

  // todo: just make a fn that computes proper spacing and then is given a node to print
  get lineCellTypes() {
    return this.parsedCells.map(slot => slot.cellTypeId).join(" ")
  }

  getLineCellPreludeTypes() {
    return this.parsedCells
      .map(slot => {
        const def = slot.cellTypeDefinition
        //todo: cleanup
        return def ? def.preludeKindId : PreludeCellTypeIds.anyCell
      })
      .join(" ")
  }

  getLineHighlightScopes(defaultScope = "source") {
    return this.parsedCells.map(slot => slot.highlightScope || defaultScope).join(" ")
  }

  get cellDefinitionLineNumbers() {
    return this.parsedCells.map(cell => cell.definitionLineNumber)
  }

  protected _getCompiledIndentation() {
    const indentCharacter = this.definition._getCompilerObject()[GrammarConstantsCompiler.indentCharacter]
    const indent = this.indentation
    return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent
  }

  private _getFields() {
    // fields are like cells
    const fields: any = {}
    this.forEach(node => {
      const def = node.definition
      if (def.isRequired() || def.isSingle) fields[node.getWord(0)] = node.content
    })
    return fields
  }

  protected _getCompiledLine() {
    const compiler = this.definition._getCompilerObject()
    const catchAllCellDelimiter = compiler[GrammarConstantsCompiler.catchAllCellDelimiter]
    const str = compiler[GrammarConstantsCompiler.stringTemplate]
    return str !== undefined ? Utils.formatStr(str, catchAllCellDelimiter, Object.assign(this._getFields(), this.cells)) : this.getLine()
  }

  protected get listDelimiter() {
    return this.definition._getFromExtended(GrammarConstants.listDelimiter)
  }

  protected get contentKey() {
    return this.definition._getFromExtended(GrammarConstants.contentKey)
  }

  protected get childrenKey() {
    return this.definition._getFromExtended(GrammarConstants.childrenKey)
  }

  protected get childrenAreTextBlob() {
    return this.definition._isBlobParser()
  }

  protected get isArrayElement() {
    return this.definition._hasFromExtended(GrammarConstants.uniqueFirstWord) ? false : !this.definition.isSingle
  }

  get list() {
    return this.listDelimiter ? this.content.split(this.listDelimiter) : super.list
  }

  get typedContent() {
    // todo: probably a better way to do this, perhaps by defining a cellDelimiter at the node level
    // todo: this currently parse anything other than string types
    if (this.listDelimiter) return this.content.split(this.listDelimiter)

    const cells = this.parsedCells
    if (cells.length === 2) return cells[1].parsed
    return this.content
  }

  get typedTuple() {
    const key = this.firstWord
    if (this.childrenAreTextBlob) return [key, this.childrenToString()]

    const { typedContent, contentKey, childrenKey } = this

    if (contentKey || childrenKey) {
      let obj: any = {}
      if (childrenKey) obj[childrenKey] = this.childrenToString()
      else obj = this.typedMap

      if (contentKey) {
        obj[contentKey] = typedContent
      }
      return [key, obj]
    }

    const hasChildren = this.length > 0

    const hasChildrenNoContent = typedContent === undefined && hasChildren
    const shouldReturnValueAsObject = hasChildrenNoContent
    if (shouldReturnValueAsObject) return [key, this.typedMap]

    const hasChildrenAndContent = typedContent !== undefined && hasChildren
    const shouldReturnValueAsContentPlusChildren = hasChildrenAndContent

    // If the node has a content and a subtree return it as a string, as
    // Javascript object values can't be both a leaf and a tree.
    if (shouldReturnValueAsContentPlusChildren) return [key, this.contentWithChildren]

    return [key, typedContent]
  }

  get _shouldSerialize() {
    const should = (<any>this).shouldSerialize
    return should === undefined ? true : should
  }

  get typedMap() {
    const obj: treeNotationTypes.stringMap = {}
    this.forEach((node: GrammarBackedNode) => {
      if (!node._shouldSerialize) return true

      const tuple = node.typedTuple
      if (!node.isArrayElement) obj[tuple[0]] = tuple[1]
      else {
        if (!obj[tuple[0]]) obj[tuple[0]] = []
        obj[tuple[0]].push(tuple[1])
      }
    })
    return obj
  }

  fromTypedMap() {}

  compile() {
    if (this.isRoot()) return super.compile()
    const def = this.definition
    const indent = this._getCompiledIndentation()
    const compiledLine = this._getCompiledLine()

    if (def.isTerminalParser()) return indent + compiledLine

    const compiler = def._getCompilerObject()
    const openChildrenString = compiler[GrammarConstantsCompiler.openChildren] || ""
    const closeChildrenString = compiler[GrammarConstantsCompiler.closeChildren] || ""
    const childJoinCharacter = compiler[GrammarConstantsCompiler.joinChildrenWith] || "\n"

    const compiledChildren = this.map(child => child.compile()).join(childJoinCharacter)

    return `${indent + compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`
  }

  // todo: remove
  get cells() {
    const cells: treeNotationTypes.stringMap = {}
    this.parsedCells.forEach(cell => {
      const cellTypeId = cell.cellTypeId
      if (!cell.isCatchAll()) cells[cellTypeId] = cell.parsed
      else {
        if (!cells[cellTypeId]) cells[cellTypeId] = []
        cells[cellTypeId].push(cell.parsed)
      }
    })
    return cells
  }
}

class BlobParser extends GrammarBackedNode {
  createParserCombinator() {
    return new TreeNode.ParserCombinator(BlobParser, {})
  }

  getErrors(): treeNotationTypes.TreeError[] {
    return []
  }
}

// todo: can we remove this? hard to extend.
class UnknownParserNode extends GrammarBackedNode {
  createParserCombinator() {
    return new TreeNode.ParserCombinator(UnknownParserNode, {})
  }

  getErrors(): treeNotationTypes.TreeError[] {
    return [new UnknownParserError(this)]
  }
}

/*
A cell contains a word but also the type information for that word.
*/
abstract class AbstractGrammarBackedCell<T> {
  constructor(node: GrammarBackedNode, index: treeNotationTypes.int, typeDef: cellTypeDefinitionParser, cellTypeId: string, isCatchAll: boolean, parserDefinitionParser: AbstractParserDefinitionParser) {
    this._typeDef = typeDef
    this._node = node
    this._isCatchAll = isCatchAll
    this._index = index
    this._cellTypeId = cellTypeId
    this._parserDefinitionParser = parserDefinitionParser
  }

  getWord() {
    return this._node.getWord(this._index)
  }

  get definitionLineNumber() {
    return this._typeDef.lineNumber
  }

  private _node: GrammarBackedNode
  protected _index: treeNotationTypes.int
  private _typeDef: cellTypeDefinitionParser
  private _isCatchAll: boolean
  private _cellTypeId: string
  protected _parserDefinitionParser: AbstractParserDefinitionParser

  get cellTypeId() {
    return this._cellTypeId
  }

  static parserFunctionName = ""

  getNode() {
    return this._node
  }

  get cellIndex() {
    return this._index
  }

  isCatchAll() {
    return this._isCatchAll
  }

  get min() {
    return this.cellTypeDefinition.get(GrammarConstants.min) || "0"
  }

  get max() {
    return this.cellTypeDefinition.get(GrammarConstants.max) || "100"
  }

  get placeholder() {
    return this.cellTypeDefinition.get(GrammarConstants.examples) || ""
  }

  abstract get parsed(): T

  get highlightScope(): string | undefined {
    const definition = this.cellTypeDefinition
    if (definition) return definition.highlightScope // todo: why the undefined?
  }

  getAutoCompleteWords(partialWord: string = "") {
    const cellDef = this.cellTypeDefinition
    let words = cellDef ? cellDef._getAutocompleteWordOptions(<GrammarBackedNode>this.getNode().root) : []

    const runTimeOptions = this.getNode().getRunTimeEnumOptions(this)
    if (runTimeOptions) words = runTimeOptions.concat(words)

    if (partialWord) words = words.filter(word => word.includes(partialWord))
    return words.map(word => {
      return {
        text: word,
        displayText: word
      }
    })
  }

  synthesizeCell(seed = Date.now()): string {
    // todo: cleanup
    const cellDef = this.cellTypeDefinition
    const enumOptions = cellDef._getFromExtended(GrammarConstants.enum)
    if (enumOptions) return Utils.getRandomString(1, enumOptions.split(" "))

    return this._synthesizeCell(seed)
  }

  _getStumpEnumInput(crux: string): string {
    const cellDef = this.cellTypeDefinition
    const enumOptions = cellDef._getFromExtended(GrammarConstants.enum)
    if (!enumOptions) return undefined
    const options = new TreeNode(
      enumOptions
        .split(" ")
        .map(option => `option ${option}`)
        .join("\n")
    )
    return `select
 name ${crux}
${options.toString(1)}`
  }

  _toStumpInput(crux: string): string {
    // todo: remove
    const enumInput = this._getStumpEnumInput(crux)
    if (enumInput) return enumInput
    // todo: cleanup. We shouldn't have these dual cellType classes.
    return `input
 name ${crux}
 placeholder ${this.placeholder}`
  }

  abstract _synthesizeCell(seed?: number): string

  get cellTypeDefinition() {
    return this._typeDef
  }

  protected _getErrorContext() {
    return this.getNode()
      .getLine()
      .split(" ")[0] // todo: WordBreakSymbol
  }

  protected abstract _isValid(): boolean

  isValid(): boolean {
    const runTimeOptions = this.getNode().getRunTimeEnumOptions(this)
    const word = this.getWord()
    if (runTimeOptions) return runTimeOptions.includes(word)
    return this.cellTypeDefinition.isValid(word, <GrammarBackedNode>this.getNode().root) && this._isValid()
  }

  getErrorIfAny(): treeNotationTypes.TreeError {
    const word = this.getWord()
    if (word !== undefined && this.isValid()) return undefined

    // todo: refactor invalidwordError. We want better error messages.
    return word === undefined || word === "" ? new MissingWordError(this) : new InvalidWordError(this)
  }
}

class GrammarBitCell extends AbstractGrammarBackedCell<boolean> {
  _isValid() {
    const word = this.getWord()
    return word === "0" || word === "1"
  }

  static defaultHighlightScope = "constant.numeric"

  _synthesizeCell() {
    return Utils.getRandomString(1, "01".split(""))
  }

  get regexString() {
    return "[01]"
  }

  get parsed() {
    const word = this.getWord()
    return !!parseInt(word)
  }
}

abstract class GrammarNumericCell extends AbstractGrammarBackedCell<number> {
  _toStumpInput(crux: string): string {
    return `input
 name ${crux}
 type number
 placeholder ${this.placeholder}
 min ${this.min}
 max ${this.max}`
  }
}

class GrammarIntCell extends GrammarNumericCell {
  _isValid() {
    const word = this.getWord()
    const num = parseInt(word)
    if (isNaN(num)) return false
    return num.toString() === word
  }

  static defaultHighlightScope = "constant.numeric.integer"

  _synthesizeCell(seed: number) {
    return Utils.randomUniformInt(parseInt(this.min), parseInt(this.max), seed).toString()
  }

  get regexString() {
    return "\-?[0-9]+"
  }

  get parsed() {
    const word = this.getWord()
    return parseInt(word)
  }

  static parserFunctionName = "parseInt"
}

class GrammarFloatCell extends GrammarNumericCell {
  _isValid() {
    const word = this.getWord()
    const num = parseFloat(word)
    return !isNaN(num) && /^-?\d*(\.\d+)?$/.test(word)
  }

  static defaultHighlightScope = "constant.numeric.float"

  _synthesizeCell(seed: number) {
    return Utils.randomUniformFloat(parseFloat(this.min), parseFloat(this.max), seed).toString()
  }

  get regexString() {
    return "-?\d*(\.\d+)?"
  }

  get parsed() {
    const word = this.getWord()
    return parseFloat(word)
  }

  static parserFunctionName = "parseFloat"
}

// ErrorCellType => grammar asks for a '' cell type here but the grammar does not specify a '' cell type. (todo: bring in didyoumean?)

class GrammarBoolCell extends AbstractGrammarBackedCell<boolean> {
  private _trues = new Set(["1", "true", "t", "yes"])
  private _falses = new Set(["0", "false", "f", "no"])

  _isValid() {
    const word = this.getWord()
    const str = word.toLowerCase()
    return this._trues.has(str) || this._falses.has(str)
  }

  static defaultHighlightScope = "constant.numeric"

  _synthesizeCell() {
    return Utils.getRandomString(1, ["1", "true", "t", "yes", "0", "false", "f", "no"])
  }

  private _getOptions() {
    return Array.from(this._trues).concat(Array.from(this._falses))
  }

  get regexString() {
    return "(?:" + this._getOptions().join("|") + ")"
  }

  get parsed() {
    const word = this.getWord()
    return this._trues.has(word.toLowerCase())
  }
}

class GrammarAnyCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return true
  }

  _synthesizeCell() {
    const examples = this.cellTypeDefinition._getFromExtended(GrammarConstants.examples)
    if (examples) return Utils.getRandomString(1, examples.split(" "))
    return this._parserDefinitionParser.parserIdFromDefinition + "-" + this.constructor.name
  }

  get regexString() {
    return "[^ ]+"
  }

  get parsed() {
    return this.getWord()
  }
}

class GrammarKeywordCell extends GrammarAnyCell {
  static defaultHighlightScope = "keyword"

  _synthesizeCell() {
    return this._parserDefinitionParser.cruxIfAny
  }
}

class GrammarExtraWordCellTypeCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return false
  }

  synthesizeCell() {
    throw new Error(`Trying to synthesize a GrammarExtraWordCellTypeCell`)
    return this._synthesizeCell()
  }

  _synthesizeCell() {
    return "extraWord" // should never occur?
  }

  get parsed() {
    return this.getWord()
  }

  getErrorIfAny(): treeNotationTypes.TreeError {
    return new ExtraWordError(this)
  }
}

class GrammarUnknownCellTypeCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return false
  }

  synthesizeCell() {
    throw new Error(`Trying to synthesize an GrammarUnknownCellTypeCell`)
    return this._synthesizeCell()
  }

  _synthesizeCell() {
    return "extraWord" // should never occur?
  }

  get parsed() {
    return this.getWord()
  }

  getErrorIfAny(): treeNotationTypes.TreeError {
    return new UnknownCellTypeError(this)
  }
}

abstract class AbstractTreeError implements treeNotationTypes.TreeError {
  constructor(node: GrammarBackedNode) {
    this._node = node
  }
  private _node: GrammarBackedNode // todo: would it ever be a TreeNode?

  getLineIndex(): treeNotationTypes.positiveInt {
    return this.lineNumber - 1
  }

  get lineNumber(): treeNotationTypes.positiveInt {
    return this.getNode()._getLineNumber() // todo: handle sourcemaps
  }

  isCursorOnWord(lineIndex: treeNotationTypes.positiveInt, characterIndex: treeNotationTypes.positiveInt) {
    return lineIndex === this.getLineIndex() && this._doesCharacterIndexFallOnWord(characterIndex)
  }

  private _doesCharacterIndexFallOnWord(characterIndex: treeNotationTypes.positiveInt) {
    return this.cellIndex === this.getNode().getWordIndexAtCharacterIndex(characterIndex)
  }

  // convenience method. may be removed.
  isBlankLineError() {
    return false
  }

  // convenience method. may be removed.
  isMissingWordError() {
    return false
  }

  getIndent() {
    return this.getNode().indentation
  }

  getCodeMirrorLineWidgetElement(onApplySuggestionCallBack = () => {}) {
    const suggestion = this.suggestionMessage
    if (this.isMissingWordError()) return this._getCodeMirrorLineWidgetElementCellTypeHints()
    if (suggestion) return this._getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion)
    return this._getCodeMirrorLineWidgetElementWithoutSuggestion()
  }

  get parserId(): string {
    return (<GrammarBackedNode>this.getNode()).definition.parserIdFromDefinition
  }

  private _getCodeMirrorLineWidgetElementCellTypeHints() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + (<GrammarBackedNode>this.getNode()).definition.lineHints))
    el.className = "LintCellTypeHints"
    return el
  }

  private _getCodeMirrorLineWidgetElementWithoutSuggestion() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + this.message))
    el.className = "LintError"
    return el
  }

  private _getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack: Function, suggestion: string) {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + `${this.errorTypeName}. Suggestion: ${suggestion}`))
    el.className = "LintErrorWithSuggestion"
    el.onclick = () => {
      this.applySuggestion()
      onApplySuggestionCallBack()
    }
    return el
  }

  getLine() {
    return this.getNode().getLine()
  }

  getExtension() {
    return this.getNode().handGrammarProgram.extensionName
  }

  getNode() {
    return this._node
  }

  get errorTypeName() {
    return this.constructor.name.replace("Error", "")
  }

  get cellIndex() {
    return 0
  }

  toObject() {
    return {
      type: this.errorTypeName,
      line: this.lineNumber,
      cell: this.cellIndex,
      suggestion: this.suggestionMessage,
      path: this.getNode().getFirstWordPath(),
      message: this.message
    }
  }

  hasSuggestion() {
    return this.suggestionMessage !== ""
  }

  get suggestionMessage() {
    return ""
  }

  toString() {
    return this.message
  }

  applySuggestion() {}

  get message(): string {
    return `${this.errorTypeName} at line ${this.lineNumber} cell ${this.cellIndex}.`
  }
}

abstract class AbstractCellError extends AbstractTreeError {
  constructor(cell: AbstractGrammarBackedCell<any>) {
    super(cell.getNode())
    this._cell = cell
  }

  get cell() {
    return this._cell
  }

  get cellIndex() {
    return this._cell.cellIndex
  }

  protected get wordSuggestion() {
    return Utils.didYouMean(
      this.cell.getWord(),
      this.cell.getAutoCompleteWords().map(option => option.text)
    )
  }

  private _cell: AbstractGrammarBackedCell<any>
}

class UnknownParserError extends AbstractTreeError {
  get message(): string {
    const node = this.getNode()
    const parentNode = node.parent
    const options = parentNode._getParser().getFirstWordOptions()
    return super.message + ` Invalid parser "${node.firstWord}". Valid parsers are: ${Utils._listToEnglishText(options, 7)}.`
  }

  protected get wordSuggestion() {
    const node = this.getNode()
    const parentNode = node.parent
    return Utils.didYouMean(
      node.firstWord,
      (<GrammarBackedNode>parentNode).getAutocompleteResults("", 0).map(option => option.text)
    )
  }

  get suggestionMessage() {
    const suggestion = this.wordSuggestion
    const node = this.getNode()

    if (suggestion) return `Change "${node.firstWord}" to "${suggestion}"`

    return ""
  }

  applySuggestion() {
    const suggestion = this.wordSuggestion
    if (suggestion) this.getNode().setWord(this.cellIndex, suggestion)
    return this
  }
}

class BlankLineError extends UnknownParserError {
  get message(): string {
    return super.message + ` Line: "${this.getNode().getLine()}". Blank lines are errors.`
  }

  // convenience method
  isBlankLineError() {
    return true
  }

  get suggestionMessage() {
    return `Delete line ${this.lineNumber}`
  }

  applySuggestion() {
    this.getNode().destroy()
    return this
  }
}

class MissingRequiredParserError extends AbstractTreeError {
  constructor(node: GrammarBackedNode, missingParserId: treeNotationTypes.firstWord) {
    super(node)
    this._missingParserId = missingParserId
  }

  private _missingParserId: treeNotationTypes.parserId

  get message(): string {
    return super.message + ` A "${this._missingParserId}" is required.`
  }
}

class ParserUsedMultipleTimesError extends AbstractTreeError {
  get message(): string {
    return super.message + ` Multiple "${this.getNode().firstWord}" found.`
  }

  get suggestionMessage() {
    return `Delete line ${this.lineNumber}`
  }

  applySuggestion() {
    return this.getNode().destroy()
  }
}

class LineAppearsMultipleTimesError extends AbstractTreeError {
  get message(): string {
    return super.message + ` "${this.getNode().getLine()}" appears multiple times.`
  }

  get suggestionMessage() {
    return `Delete line ${this.lineNumber}`
  }

  applySuggestion() {
    return this.getNode().destroy()
  }
}

class UnknownCellTypeError extends AbstractCellError {
  get message(): string {
    return super.message + ` No cellType "${this.cell.cellTypeId}" found. Language grammar for "${this.getExtension()}" may need to be fixed.`
  }
}

class InvalidWordError extends AbstractCellError {
  get message(): string {
    return super.message + ` "${this.cell.getWord()}" does not fit in cellType "${this.cell.cellTypeId}".`
  }

  get suggestionMessage() {
    const suggestion = this.wordSuggestion

    if (suggestion) return `Change "${this.cell.getWord()}" to "${suggestion}"`

    return ""
  }

  applySuggestion() {
    const suggestion = this.wordSuggestion
    if (suggestion) this.getNode().setWord(this.cellIndex, suggestion)
    return this
  }
}

class ExtraWordError extends AbstractCellError {
  get message(): string {
    return super.message + ` Extra word "${this.cell.getWord()}" in ${this.parserId}.`
  }

  get suggestionMessage() {
    return `Delete word "${this.cell.getWord()}" at cell ${this.cellIndex}`
  }

  applySuggestion() {
    return this.getNode().deleteWordAt(this.cellIndex)
  }
}

class MissingWordError extends AbstractCellError {
  // todo: autocomplete suggestion

  get message(): string {
    return super.message + ` Missing word for cell "${this.cell.cellTypeId}".`
  }

  isMissingWordError() {
    return true
  }
}

// todo: add standard types, enum types, from disk types

abstract class AbstractGrammarWordTestParser extends TreeNode {
  abstract isValid(str: string, programRootNode?: GrammarBackedNode): boolean
}

class GrammarRegexTestParser extends AbstractGrammarWordTestParser {
  private _regex: RegExp

  isValid(str: string) {
    if (!this._regex) this._regex = new RegExp("^" + this.content + "$")
    return !!str.match(this._regex)
  }
}

class GrammarReservedWordsTestParser extends AbstractGrammarWordTestParser {
  private _set: Set<string>

  isValid(str: string) {
    if (!this._set) this._set = new Set(this.content.split(" "))
    return !this._set.has(str)
  }
}

// todo: remove in favor of custom word type constructors
class EnumFromCellTypesTestParser extends AbstractGrammarWordTestParser {
  _getEnumFromCellTypes(programRootNode: GrammarBackedNode): treeNotationTypes.stringMap {
    const cellTypeIds = this.getWordsFrom(1)
    const enumGroup = cellTypeIds.join(" ")
    // note: hack where we store it on the program. otherwise has global effects.
    if (!(<any>programRootNode)._enumMaps) (<any>programRootNode)._enumMaps = {}
    if ((<any>programRootNode)._enumMaps[enumGroup]) return (<any>programRootNode)._enumMaps[enumGroup]

    const wordIndex = 1
    const map: treeNotationTypes.stringMap = {}
    const cellTypeMap: treeNotationTypes.stringMap = {}
    cellTypeIds.forEach(typeId => (cellTypeMap[typeId] = true))
    programRootNode.allTypedWords
      .filter((typedWord: TypedWord) => cellTypeMap[typedWord.type])
      .forEach(typedWord => {
        map[typedWord.word] = true
      })
    ;(<any>programRootNode)._enumMaps[enumGroup] = map
    return map
  }

  // todo: remove
  isValid(str: string, programRootNode: GrammarBackedNode) {
    return this._getEnumFromCellTypes(programRootNode)[str] === true
  }
}

class GrammarEnumTestNode extends AbstractGrammarWordTestParser {
  private _map: treeNotationTypes.stringMap

  isValid(str: string) {
    // enum c c++ java
    return !!this.getOptions()[str]
  }

  getOptions() {
    if (!this._map) this._map = Utils.arrayToMap(this.getWordsFrom(1))
    return this._map
  }
}

class cellTypeDefinitionParser extends AbstractExtendibleTreeNode {
  createParserCombinator() {
    const types: treeNotationTypes.stringMap = {}
    types[GrammarConstants.regex] = GrammarRegexTestParser
    types[GrammarConstants.reservedWords] = GrammarReservedWordsTestParser
    types[GrammarConstants.enumFromCellTypes] = EnumFromCellTypesTestParser
    types[GrammarConstants.enum] = GrammarEnumTestNode
    types[GrammarConstants.highlightScope] = TreeNode
    types[GrammarConstants.comment] = TreeNode
    types[GrammarConstants.examples] = TreeNode
    types[GrammarConstants.min] = TreeNode
    types[GrammarConstants.max] = TreeNode
    types[GrammarConstants.description] = TreeNode
    types[GrammarConstants.extends] = TreeNode
    return new TreeNode.ParserCombinator(undefined, types)
  }

  get id() {
    return this.getWord(0)
  }

  get idToNodeMap() {
    return (<HandGrammarProgram>this.parent).cellTypeDefinitions
  }

  getGetter(wordIndex: number) {
    const wordToNativeJavascriptTypeParser = this.getCellConstructor().parserFunctionName
    return `get ${this.cellTypeId}() {
      return ${wordToNativeJavascriptTypeParser ? wordToNativeJavascriptTypeParser + `(this.getWord(${wordIndex}))` : `this.getWord(${wordIndex})`}
    }`
  }

  getCatchAllGetter(wordIndex: number) {
    const wordToNativeJavascriptTypeParser = this.getCellConstructor().parserFunctionName
    return `get ${this.cellTypeId}() {
      return ${wordToNativeJavascriptTypeParser ? `this.getWordsFrom(${wordIndex}).map(val => ${wordToNativeJavascriptTypeParser}(val))` : `this.getWordsFrom(${wordIndex})`}
    }`
  }

  // `this.getWordsFrom(${requireds.length + 1})`

  // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
  getCellConstructor(): typeof AbstractGrammarBackedCell {
    return this.preludeKind || GrammarAnyCell
  }

  get preludeKind() {
    return PreludeKinds[this.getWord(0)] || PreludeKinds[this._getExtendedCellTypeId()]
  }

  get preludeKindId() {
    if (PreludeKinds[this.getWord(0)]) return this.getWord(0)
    else if (PreludeKinds[this._getExtendedCellTypeId()]) return this._getExtendedCellTypeId()
    return PreludeCellTypeIds.anyCell
  }

  private _getExtendedCellTypeId() {
    const arr = this._getAncestorsArray()
    return arr[arr.length - 1].id
  }

  get highlightScope(): string | undefined {
    const hs = this._getFromExtended(GrammarConstants.highlightScope)
    if (hs) return hs
    const preludeKind = this.preludeKind
    if (preludeKind) return preludeKind.defaultHighlightScope
  }

  _getEnumOptions() {
    const enumNode = this._getNodeFromExtended(GrammarConstants.enum)
    if (!enumNode) return undefined

    // we sort by longest first to capture longest match first. todo: add test
    const options = Object.keys((<GrammarEnumTestNode>enumNode.getNode(GrammarConstants.enum)).getOptions())
    options.sort((a, b) => b.length - a.length)

    return options
  }

  private _getEnumFromCellTypeOptions(program: GrammarBackedNode) {
    const node = this._getNodeFromExtended(GrammarConstants.enumFromCellTypes)
    return node ? Object.keys((<EnumFromCellTypesTestParser>node.getNode(GrammarConstants.enumFromCellTypes))._getEnumFromCellTypes(program)) : undefined
  }

  _getAutocompleteWordOptions(program: GrammarBackedNode): string[] {
    return this._getEnumOptions() || this._getEnumFromCellTypeOptions(program) || []
  }

  get regexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return this._getFromExtended(GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*")
  }

  private _getAllTests() {
    return this._getChildrenByParserInExtended(AbstractGrammarWordTestParser)
  }

  isValid(str: string, programRootNode: GrammarBackedNode) {
    return this._getAllTests().every(node => (<AbstractGrammarWordTestParser>node).isValid(str, programRootNode))
  }

  get cellTypeId(): treeNotationTypes.cellTypeId {
    return this.getWord(0)
  }

  public static types: any
}

abstract class AbstractCellParser {
  constructor(definition: AbstractParserDefinitionParser) {
    this._definition = definition
  }

  get catchAllCellTypeId(): treeNotationTypes.cellTypeId | undefined {
    return this._definition._getFromExtended(GrammarConstants.catchAllCellType)
  }

  // todo: improve layout (use bold?)
  get lineHints(): string {
    const catchAllCellTypeId = this.catchAllCellTypeId
    const parserId = this._definition.cruxIfAny || this._definition.id // todo: cleanup
    return `${parserId}: ${this.getRequiredCellTypeIds().join(" ")}${catchAllCellTypeId ? ` ${catchAllCellTypeId}...` : ""}`
  }

  protected _definition: AbstractParserDefinitionParser

  private _requiredCellTypeIds: string[]
  getRequiredCellTypeIds(): treeNotationTypes.cellTypeId[] {
    if (!this._requiredCellTypeIds) {
      const parameters = this._definition._getFromExtended(GrammarConstants.cells)
      this._requiredCellTypeIds = parameters ? parameters.split(" ") : []
    }
    return this._requiredCellTypeIds
  }

  protected _getCellTypeId(cellIndex: treeNotationTypes.int, requiredCellTypeIds: string[], totalWordCount: treeNotationTypes.int) {
    return requiredCellTypeIds[cellIndex]
  }

  protected _isCatchAllCell(cellIndex: treeNotationTypes.int, numberOfRequiredCells: treeNotationTypes.int, totalWordCount: treeNotationTypes.int) {
    return cellIndex >= numberOfRequiredCells
  }

  getCellArray(node: GrammarBackedNode = undefined): AbstractGrammarBackedCell<any>[] {
    const wordCount = node ? node.words.length : 0
    const def = this._definition
    const grammarProgram = def.languageDefinitionProgram
    const requiredCellTypeIds = this.getRequiredCellTypeIds()
    const numberOfRequiredCells = requiredCellTypeIds.length

    const actualWordCountOrRequiredCellCount = Math.max(wordCount, numberOfRequiredCells)
    const cells: AbstractGrammarBackedCell<any>[] = []

    // A for loop instead of map because "numberOfCellsToFill" can be longer than words.length
    for (let cellIndex = 0; cellIndex < actualWordCountOrRequiredCellCount; cellIndex++) {
      const isCatchAll = this._isCatchAllCell(cellIndex, numberOfRequiredCells, wordCount)

      let cellTypeId = isCatchAll ? this.catchAllCellTypeId : this._getCellTypeId(cellIndex, requiredCellTypeIds, wordCount)

      let cellTypeDefinition = grammarProgram.getCellTypeDefinitionById(cellTypeId)

      let cellConstructor
      if (cellTypeDefinition) cellConstructor = cellTypeDefinition.getCellConstructor()
      else if (cellTypeId) cellConstructor = GrammarUnknownCellTypeCell
      else {
        cellConstructor = GrammarExtraWordCellTypeCell
        cellTypeId = PreludeCellTypeIds.extraWordCell
        cellTypeDefinition = grammarProgram.getCellTypeDefinitionById(cellTypeId)
      }

      const anyCellConstructor = <any>cellConstructor
      cells[cellIndex] = new anyCellConstructor(node, cellIndex, cellTypeDefinition, cellTypeId, isCatchAll, def)
    }
    return cells
  }
}

class PrefixCellParser extends AbstractCellParser {}

class PostfixCellParser extends AbstractCellParser {
  protected _isCatchAllCell(cellIndex: treeNotationTypes.int, numberOfRequiredCells: treeNotationTypes.int, totalWordCount: treeNotationTypes.int) {
    return cellIndex < totalWordCount - numberOfRequiredCells
  }

  protected _getCellTypeId(cellIndex: treeNotationTypes.int, requiredCellTypeIds: string[], totalWordCount: treeNotationTypes.int) {
    const catchAllWordCount = Math.max(totalWordCount - requiredCellTypeIds.length, 0)
    return requiredCellTypeIds[cellIndex - catchAllWordCount]
  }
}

class OmnifixCellParser extends AbstractCellParser {
  getCellArray(node: GrammarBackedNode = undefined): AbstractGrammarBackedCell<any>[] {
    const cells: AbstractGrammarBackedCell<any>[] = []
    const def = this._definition
    const program = <GrammarBackedNode>(node ? node.root : undefined)
    const grammarProgram = def.languageDefinitionProgram
    const words = node ? node.words : []
    const requiredCellTypeDefs = this.getRequiredCellTypeIds().map(cellTypeId => grammarProgram.getCellTypeDefinitionById(cellTypeId))
    const catchAllCellTypeId = this.catchAllCellTypeId
    const catchAllCellTypeDef = catchAllCellTypeId && grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId)

    words.forEach((word, wordIndex) => {
      let cellConstructor: any
      for (let index = 0; index < requiredCellTypeDefs.length; index++) {
        const cellTypeDefinition = requiredCellTypeDefs[index]
        if (cellTypeDefinition.isValid(word, program)) {
          // todo: cleanup cellIndex/wordIndex stuff
          cellConstructor = cellTypeDefinition.getCellConstructor()
          cells.push(new cellConstructor(node, wordIndex, cellTypeDefinition, cellTypeDefinition.id, false, def))
          requiredCellTypeDefs.splice(index, 1)
          return true
        }
      }
      if (catchAllCellTypeDef && catchAllCellTypeDef.isValid(word, program)) {
        cellConstructor = catchAllCellTypeDef.getCellConstructor()
        cells.push(new cellConstructor(node, wordIndex, catchAllCellTypeDef, catchAllCellTypeId, true, def))
        return true
      }
      cells.push(new GrammarUnknownCellTypeCell(node, wordIndex, undefined, undefined, false, def))
    })
    const wordCount = words.length
    requiredCellTypeDefs.forEach((cellTypeDef, index) => {
      let cellConstructor: any = cellTypeDef.getCellConstructor()
      cells.push(new cellConstructor(node, wordCount + index, cellTypeDef, cellTypeDef.id, false, def))
    })

    return cells
  }
}

class GrammarExampleParser extends TreeNode {}

class GrammarCompilerParser extends TreeNode {
  createParserCombinator() {
    const types = [
      GrammarConstantsCompiler.stringTemplate,
      GrammarConstantsCompiler.indentCharacter,
      GrammarConstantsCompiler.catchAllCellDelimiter,
      GrammarConstantsCompiler.joinChildrenWith,
      GrammarConstantsCompiler.openChildren,
      GrammarConstantsCompiler.closeChildren
    ]
    const map: treeNotationTypes.firstWordToParserMap = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    return new TreeNode.ParserCombinator(undefined, map)
  }
}

abstract class AbstractParserConstantParser extends TreeNode {
  constructor(children?: treeNotationTypes.children, line?: string, parent?: TreeNode) {
    super(children, line, parent)
    parent[this.identifier] = this.constantValue
  }

  getGetter() {
    return `get ${this.identifier}() { return ${this.constantValueAsJsText} }`
  }

  get identifier() {
    return this.getWord(1)
  }

  get constantValueAsJsText() {
    const words = this.getWordsFrom(2)
    return words.length > 1 ? `[${words.join(",")}]` : words[0]
  }

  get constantValue() {
    return JSON.parse(this.constantValueAsJsText)
  }
}

class GrammarParserConstantInt extends AbstractParserConstantParser {}
class GrammarParserConstantString extends AbstractParserConstantParser {
  get constantValueAsJsText() {
    return "`" + Utils.escapeBackTicks(this.constantValue) + "`"
  }

  get constantValue() {
    return this.length ? this.childrenToString() : this.getWordsFrom(2).join(" ")
  }
}
class GrammarParserConstantFloat extends AbstractParserConstantParser {}
class GrammarParserConstantBoolean extends AbstractParserConstantParser {}

abstract class AbstractParserDefinitionParser extends AbstractExtendibleTreeNode {
  createParserCombinator() {
    // todo: some of these should just be on nonRootNodes
    const types = [
      GrammarConstants.frequency,
      GrammarConstants.inScope,
      GrammarConstants.cells,
      GrammarConstants.extends,
      GrammarConstants.description,
      GrammarConstants.catchAllParser,
      GrammarConstants.catchAllCellType,
      GrammarConstants.cellParser,
      GrammarConstants.extensions,
      GrammarConstants.version,
      GrammarConstants.sortTemplate,
      GrammarConstants.tags,
      GrammarConstants.crux,
      GrammarConstants.cruxFromId,
      GrammarConstants.listDelimiter,
      GrammarConstants.contentKey,
      GrammarConstants.childrenKey,
      GrammarConstants.uniqueFirstWord,
      GrammarConstants.uniqueLine,
      GrammarConstants.pattern,
      GrammarConstants.baseParser,
      GrammarConstants.required,
      GrammarConstants.root,
      GrammarConstants._extendsJsClass,
      GrammarConstants._rootNodeJsHeader,
      GrammarConstants.javascript,
      GrammarConstants.compilesTo,
      GrammarConstants.javascript,
      GrammarConstants.single,
      GrammarConstants.comment
    ]

    const map: treeNotationTypes.firstWordToParserMap = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    map[GrammarConstantsConstantTypes.boolean] = GrammarParserConstantBoolean
    map[GrammarConstantsConstantTypes.int] = GrammarParserConstantInt
    map[GrammarConstantsConstantTypes.string] = GrammarParserConstantString
    map[GrammarConstantsConstantTypes.float] = GrammarParserConstantFloat
    map[GrammarConstants.compilerParser] = GrammarCompilerParser
    map[GrammarConstants.example] = GrammarExampleParser
    return new TreeNode.ParserCombinator(undefined, map, [{ regex: HandGrammarProgram.parserFullRegex, parser: parserDefinitionParser }])
  }

  get sortSpec() {
    const sortSections = new Map()
    const sortIndices = new Map()
    const sortTemplate = this.get(GrammarConstants.sortTemplate)
    if (!sortTemplate) return { sortSections, sortIndices }

    sortTemplate.split("  ").forEach((section, sectionIndex) => section.split(" ").forEach(word => sortSections.set(word, sectionIndex)))

    sortTemplate.split(" ").forEach((word, index) => sortIndices.set(word, index))
    return { sortSections, sortIndices }
  }

  toTypeScriptInterface(used = new Set<string>()) {
    let childrenInterfaces: string[] = []
    let properties: string[] = []
    const inScope = this.firstWordMapWithDefinitions
    const thisId = this.id

    used.add(thisId)
    Object.keys(inScope).forEach(key => {
      const def = inScope[key]
      const map = def.firstWordMapWithDefinitions
      const id = def.id
      const optionalTag = def.isRequired() ? "" : "?"
      const escapedKey = key.match(/\?/) ? `"${key}"` : key
      const description = def.description
      if (Object.keys(map).length && !used.has(id)) {
        childrenInterfaces.push(def.toTypeScriptInterface(used))
        properties.push(` ${escapedKey}${optionalTag}: ${id}`)
      } else properties.push(` ${escapedKey}${optionalTag}: any${description ? " // " + description : ""}`)
    })

    properties.sort()
    const description = this.description

    const myInterface = ""
    return `${childrenInterfaces.join("\n")}
${description ? "// " + description : ""}
interface ${thisId} {
${properties.join("\n")}
}`.trim()
  }

  get id() {
    return this.getWord(0)
  }

  get idWithoutSuffix() {
    return this.id.replace(HandGrammarProgram.parserSuffixRegex, "")
  }

  get constantsObject() {
    const obj = this._getUniqueConstantNodes()
    Object.keys(obj).forEach(key => (obj[key] = obj[key].constantValue))
    return obj
  }

  _getUniqueConstantNodes(extended = true) {
    const obj: { [key: string]: AbstractParserConstantParser } = {}
    const items = extended ? this._getChildrenByParserInExtended(AbstractParserConstantParser) : this.getChildrenByParser(AbstractParserConstantParser)
    items.reverse() // Last definition wins.
    items.forEach((node: AbstractParserConstantParser) => (obj[node.identifier] = node))
    return obj
  }

  get examples(): GrammarExampleParser[] {
    return this._getChildrenByParserInExtended(GrammarExampleParser)
  }

  get parserIdFromDefinition(): treeNotationTypes.parserId {
    return this.getWord(0)
  }

  // todo: remove? just reused parserId
  get generatedClassName() {
    return this.parserIdFromDefinition
  }

  _hasValidParserId() {
    return !!this.generatedClassName
  }

  _isAbstract() {
    return this.id.startsWith(GrammarConstants.abstractParserPrefix)
  }

  get cruxIfAny(): string {
    return this.get(GrammarConstants.crux) || (this._hasFromExtended(GrammarConstants.cruxFromId) ? this.idWithoutSuffix : undefined)
  }

  get regexMatch() {
    return this.get(GrammarConstants.pattern)
  }

  get firstCellEnumOptions() {
    const firstCellDef = this._getMyCellTypeDefs()[0]
    return firstCellDef ? firstCellDef._getEnumOptions() : undefined
  }

  get languageDefinitionProgram(): HandGrammarProgram {
    return <HandGrammarProgram>this.root
  }

  protected get customJavascriptMethods(): treeNotationTypes.javascriptCode {
    const hasJsCode = this.has(GrammarConstants.javascript)
    return hasJsCode ? this.getNode(GrammarConstants.javascript).childrenToString() : ""
  }

  private _cache_firstWordToNodeDefMap: { [firstWord: string]: parserDefinitionParser }

  get firstWordMapWithDefinitions() {
    if (!this._cache_firstWordToNodeDefMap) this._cache_firstWordToNodeDefMap = this._createParserInfo(this._getInScopeParserIds()).firstWordMap
    return this._cache_firstWordToNodeDefMap
  }

  // todo: remove
  get runTimeFirstWordsInScope(): treeNotationTypes.parserId[] {
    return this._getParser().getFirstWordOptions()
  }

  private _getMyCellTypeDefs() {
    const requiredCells = this.get(GrammarConstants.cells)
    if (!requiredCells) return []
    const grammarProgram = this.languageDefinitionProgram
    return requiredCells.split(" ").map(cellTypeId => {
      const cellTypeDef = grammarProgram.getCellTypeDefinitionById(cellTypeId)
      if (!cellTypeDef) throw new Error(`No cellType "${cellTypeId}" found`)
      return cellTypeDef
    })
  }

  // todo: what happens when you have a cell getter and constant with same name?
  private get cellGettersAndParserConstants() {
    // todo: add cellType parsings
    const grammarProgram = this.languageDefinitionProgram
    const getters = this._getMyCellTypeDefs().map((cellTypeDef, index) => cellTypeDef.getGetter(index))

    const catchAllCellTypeId = this.get(GrammarConstants.catchAllCellType)
    if (catchAllCellTypeId) getters.push(grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId).getCatchAllGetter(getters.length))

    // Constants
    Object.values(this._getUniqueConstantNodes(false)).forEach(node => getters.push(node.getGetter()))

    return getters.join("\n")
  }

  protected _createParserInfo(parserIdsInScope: treeNotationTypes.parserId[]): parserInfo {
    const result: parserInfo = {
      firstWordMap: {},
      regexTests: []
    }

    if (!parserIdsInScope.length) return result

    const allProgramParserDefinitionsMap = this.programParserDefinitionCache
    Object.keys(allProgramParserDefinitionsMap)
      .filter(parserId => {
        const def = allProgramParserDefinitionsMap[parserId]
        return def.isOrExtendsAParserInScope(parserIdsInScope) && !def._isAbstract()
      })
      .forEach(parserId => {
        const def = allProgramParserDefinitionsMap[parserId]
        const regex = def.regexMatch
        const crux = def.cruxIfAny
        const enumOptions = def.firstCellEnumOptions
        if (regex) result.regexTests.push({ regex: regex, parser: def.parserIdFromDefinition })
        else if (crux) result.firstWordMap[crux] = def
        else if (enumOptions) {
          enumOptions.forEach(option => (result.firstWordMap[option] = def))
        }
      })
    return result
  }

  get topParserDefinitions(): parserDefinitionParser[] {
    const arr = Object.values(this.firstWordMapWithDefinitions)
    arr.sort(Utils.makeSortByFn((definition: parserDefinitionParser) => definition.frequency))
    arr.reverse()
    return arr
  }

  _getMyInScopeParserIds(target: AbstractParserDefinitionParser = this): treeNotationTypes.parserId[] {
    const parsersNode = target.getNode(GrammarConstants.inScope)
    const scopedDefinitionIds = target.myScopedParserDefinitions.map(def => def.id)
    return parsersNode ? parsersNode.getWordsFrom(1).concat(scopedDefinitionIds) : scopedDefinitionIds
  }

  protected _getInScopeParserIds(): treeNotationTypes.parserId[] {
    // todo: allow multiple of these if we allow mixins?
    const ids = this._getMyInScopeParserIds()
    const parentDef = this._getExtendedParent()
    return parentDef ? ids.concat((<AbstractParserDefinitionParser>parentDef)._getInScopeParserIds()) : ids
  }

  get isSingle() {
    const hit = this._getNodeFromExtended(GrammarConstants.single)
    return hit && hit.get(GrammarConstants.single) !== "false"
  }

  get isUniqueLine() {
    const hit = this._getNodeFromExtended(GrammarConstants.uniqueLine)
    return hit && hit.get(GrammarConstants.uniqueLine) !== "false"
  }

  isRequired(): boolean {
    return this._hasFromExtended(GrammarConstants.required)
  }

  getParserDefinitionByParserId(parserId: treeNotationTypes.parserId): AbstractParserDefinitionParser {
    // todo: return catch all?
    const def = this.programParserDefinitionCache[parserId]
    if (def) return def
    this.languageDefinitionProgram._addDefaultCatchAllBlobParser() // todo: cleanup. Why did I do this? Needs to be removed or documented.
    const nodeDef = this.languageDefinitionProgram.programParserDefinitionCache[parserId]
    if (!nodeDef) throw new Error(`No definition found for parser id "${parserId}". Node: \n---\n${this.asString}\n---`)
    return nodeDef
  }

  isDefined(parserId: string) {
    return !!this.programParserDefinitionCache[parserId]
  }

  get idToNodeMap() {
    return this.programParserDefinitionCache
  }

  private _cache_isRoot: boolean

  private _amIRoot(): boolean {
    if (this._cache_isRoot === undefined) this._cache_isRoot = this._languageRootNode === this
    return this._cache_isRoot
  }

  private get _languageRootNode() {
    return (<HandGrammarProgram>this.root).rootParserDefinition
  }

  private _isErrorParser() {
    return this.get(GrammarConstants.baseParser) === GrammarConstants.errorParser
  }

  _isBlobParser() {
    // Do not check extended classes. Only do once.
    return this._getFromExtended(GrammarConstants.baseParser) === GrammarConstants.blobParser
  }

  private get errorMethodToJavascript(): treeNotationTypes.javascriptCode {
    if (this._isBlobParser()) return "getErrors() { return [] }" // Skips parsing child nodes for perf gains.
    if (this._isErrorParser()) return "getErrors() { return this._getErrorParserErrors() }"
    return ""
  }

  private get parserAsJavascript(): treeNotationTypes.javascriptCode {
    if (this._isBlobParser())
      // todo: do we need this?
      return "createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}"
    const parserInfo = this._createParserInfo(this._getMyInScopeParserIds())
    const myFirstWordMap = parserInfo.firstWordMap
    const regexRules = parserInfo.regexTests

    // todo: use constants in first word maps?
    // todo: cache the super extending?
    const firstWords = Object.keys(myFirstWordMap)
    const hasFirstWords = firstWords.length
    const catchAllParser = this.catchAllParserToJavascript
    if (!hasFirstWords && !catchAllParser && !regexRules.length) return ""

    const firstWordsStr = hasFirstWords
      ? `Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {` + firstWords.map(firstWord => `"${firstWord}" : ${myFirstWordMap[firstWord].parserIdFromDefinition}`).join(",\n") + "})"
      : "undefined"

    const regexStr = regexRules.length
      ? `[${regexRules
          .map(rule => {
            return `{regex: /${rule.regex}/, parser: ${rule.parser}}`
          })
          .join(",")}]`
      : "undefined"

    const catchAllStr = catchAllParser ? catchAllParser : this._amIRoot() ? `this._getBlobParserCatchAllParser()` : "undefined"

    const scopedParserJavascript = this.myScopedParserDefinitions.map(def => def.asJavascriptClass).join("\n\n")

    return `createParserCombinator() {${scopedParserJavascript}
  return new TreeNode.ParserCombinator(${catchAllStr}, ${firstWordsStr}, ${regexStr})
  }`
  }

  private get myScopedParserDefinitions() {
    return <parserDefinitionParser[]>this.getChildrenByParser(parserDefinitionParser)
  }

  private get catchAllParserToJavascript(): treeNotationTypes.javascriptCode {
    if (this._isBlobParser()) return "this._getBlobParserCatchAllParser()"
    const parserId = this.get(GrammarConstants.catchAllParser)
    if (!parserId) return ""
    const nodeDef = this.getParserDefinitionByParserId(parserId)
    return nodeDef.generatedClassName
  }

  get asJavascriptClass(): treeNotationTypes.javascriptCode {
    const components = [this.parserAsJavascript, this.errorMethodToJavascript, this.cellGettersAndParserConstants, this.customJavascriptMethods].filter(identity => identity)
    const thisClassName = this.generatedClassName

    if (this._amIRoot()) {
      components.push(`static cachedHandGrammarProgramRoot = new HandGrammarProgram(\`${Utils.escapeBackTicks(this.parent.toString().replace(/\\/g, "\\\\"))}\`)
        get handGrammarProgram() {
          return this.constructor.cachedHandGrammarProgramRoot
      }`)

      components.push(`static rootParser = ${thisClassName}`)
    }

    return `class ${thisClassName} extends ${this._getExtendsClassName()} {
      ${components.join("\n")}
    }`
  }

  private _getExtendsClassName() {
    // todo: this is hopefully a temporary line in place for now for the case where you want your base class to extend something other than another treeclass
    const hardCodedExtend = this.get(GrammarConstants._extendsJsClass)
    if (hardCodedExtend) return hardCodedExtend

    const extendedDef = <AbstractParserDefinitionParser>this._getExtendedParent()
    return extendedDef ? extendedDef.generatedClassName : "GrammarBackedNode"
  }

  _getCompilerObject(): treeNotationTypes.stringMap {
    let obj: { [key: string]: string } = {}
    const items = this._getChildrenByParserInExtended(GrammarCompilerParser)
    items.reverse() // Last definition wins.
    items.forEach((node: GrammarCompilerParser) => {
      obj = Object.assign(obj, node.toObject()) // todo: what about multiline strings?
    })
    return obj
  }

  // todo: improve layout (use bold?)
  get lineHints() {
    return this.cellParser.lineHints
  }

  isOrExtendsAParserInScope(firstWordsInScope: string[]): boolean {
    const chain = this._getParserInheritanceSet()
    return firstWordsInScope.some(firstWord => chain.has(firstWord))
  }

  isTerminalParser() {
    return !this._getFromExtended(GrammarConstants.inScope) && !this._getFromExtended(GrammarConstants.catchAllParser)
  }

  private get sublimeMatchLine() {
    const regexMatch = this.regexMatch
    if (regexMatch) return `'${regexMatch}'`
    const cruxMatch = this.cruxIfAny
    if (cruxMatch) return `'^ *${Utils.escapeRegExp(cruxMatch)}(?: |$)'`
    const enumOptions = this.firstCellEnumOptions
    if (enumOptions) return `'^ *(${Utils.escapeRegExp(enumOptions.join("|"))})(?: |$)'`
  }

  // todo: refactor. move some parts to cellParser?
  _toSublimeMatchBlock() {
    const defaultHighlightScope = "source"
    const program = this.languageDefinitionProgram
    const cellParser = this.cellParser
    const requiredCellTypeIds = cellParser.getRequiredCellTypeIds()
    const catchAllCellTypeId = cellParser.catchAllCellTypeId
    const firstCellTypeDef = program.getCellTypeDefinitionById(requiredCellTypeIds[0])
    const firstWordHighlightScope = (firstCellTypeDef ? firstCellTypeDef.highlightScope : defaultHighlightScope) + "." + this.parserIdFromDefinition
    const topHalf = ` '${this.parserIdFromDefinition}':
  - match: ${this.sublimeMatchLine}
    scope: ${firstWordHighlightScope}`
    if (catchAllCellTypeId) requiredCellTypeIds.push(catchAllCellTypeId)
    if (!requiredCellTypeIds.length) return topHalf
    const captures = requiredCellTypeIds
      .map((cellTypeId, index) => {
        const cellTypeDefinition = program.getCellTypeDefinitionById(cellTypeId) // todo: cleanup
        if (!cellTypeDefinition) throw new Error(`No ${GrammarConstants.cellType} ${cellTypeId} found`) // todo: standardize error/capture error at grammar time
        return `        ${index + 1}: ${(cellTypeDefinition.highlightScope || defaultHighlightScope) + "." + cellTypeDefinition.cellTypeId}`
      })
      .join("\n")

    const cellTypesToRegex = (cellTypeIds: string[]) => cellTypeIds.map((cellTypeId: string) => `({{${cellTypeId}}})?`).join(" ?")

    return `${topHalf}
    push:
     - match: ${cellTypesToRegex(requiredCellTypeIds)}
       captures:
${captures}
     - match: $
       pop: true`
  }

  private _cache_parserInheritanceSet: Set<treeNotationTypes.parserId>
  private _cache_ancestorParserIdsArray: treeNotationTypes.parserId[]

  _getParserInheritanceSet() {
    if (!this._cache_parserInheritanceSet) this._cache_parserInheritanceSet = new Set(this.ancestorParserIdsArray)
    return this._cache_parserInheritanceSet
  }

  get ancestorParserIdsArray(): treeNotationTypes.parserId[] {
    if (!this._cache_ancestorParserIdsArray) {
      this._cache_ancestorParserIdsArray = this._getAncestorsArray().map(def => (<AbstractParserDefinitionParser>def).parserIdFromDefinition)
      this._cache_ancestorParserIdsArray.reverse()
    }
    return this._cache_ancestorParserIdsArray
  }

  protected _cache_parserDefinitionParsers: { [parserId: string]: parserDefinitionParser }
  get programParserDefinitionCache() {
    if (!this._cache_parserDefinitionParsers) this._cache_parserDefinitionParsers = this.isRoot || this.hasParserDefinitions ? this.makeProgramParserDefinitionCache() : this.parent.programParserDefinitionCache
    return this._cache_parserDefinitionParsers
  }

  get hasParserDefinitions() {
    return !!this.getChildrenByParser(parserDefinitionParser).length
  }

  makeProgramParserDefinitionCache() {
    const scopedParsers = this.getChildrenByParser(parserDefinitionParser)
    const cache = Object.assign({}, this.parent.programParserDefinitionCache) // todo. We don't really need this. we should just lookup the parent if no local hits.
    scopedParsers.forEach(parserDefinitionParser => (cache[(<parserDefinitionParser>parserDefinitionParser).parserIdFromDefinition] = parserDefinitionParser))
    return cache
  }

  get description(): string {
    return this._getFromExtended(GrammarConstants.description) || ""
  }

  get frequency() {
    const val = this._getFromExtended(GrammarConstants.frequency)
    return val ? parseFloat(val) : 0
  }

  private _getExtendedParserId(): treeNotationTypes.parserId {
    const ancestorIds = this.ancestorParserIdsArray
    if (ancestorIds.length > 1) return ancestorIds[ancestorIds.length - 2]
  }

  protected _toStumpString() {
    const crux = this.cruxIfAny
    const cellArray = this.cellParser.getCellArray().filter((item, index) => index) // for now this only works for keyword langs
    if (!cellArray.length)
      // todo: remove this! just doing it for now until we refactor getCellArray to handle catchAlls better.
      return ""
    const cells = new TreeNode(cellArray.map((cell, index) => cell._toStumpInput(crux)).join("\n"))
    return `div
 label ${crux}
${cells.toString(1)}`
  }

  toStumpString() {
    const nodeBreakSymbol = "\n"
    return this._getConcreteNonErrorInScopeNodeDefinitions(this._getInScopeParserIds())
      .map(def => def._toStumpString())
      .filter(identity => identity)
      .join(nodeBreakSymbol)
  }

  private _generateSimulatedLine(seed: number): string {
    // todo: generate simulated data from catch all
    const crux = this.cruxIfAny
    return this.cellParser
      .getCellArray()
      .map((cell, index) => (!index && crux ? crux : cell.synthesizeCell(seed)))
      .join(" ")
  }

  private _shouldSynthesize(def: AbstractParserDefinitionParser, parserChain: string[]) {
    if (def._isErrorParser() || def._isAbstract()) return false
    if (parserChain.includes(def.id)) return false
    const tags = def.get(GrammarConstants.tags)
    if (tags && tags.includes(GrammarConstantsMisc.doNotSynthesize)) return false
    return true
  }

  // Get all definitions in this current scope down, even ones that are scoped inside other definitions.
  get inScopeAndDescendantDefinitions() {
    return this.languageDefinitionProgram._collectAllDefinitions(Object.values(this.programParserDefinitionCache), [])
  }

  private _collectAllDefinitions(defs: parserDefinitionParser[], collection: parserDefinitionParser[] = []) {
    defs.forEach((def: parserDefinitionParser) => {
      collection.push(def)
      def._collectAllDefinitions(def.getChildrenByParser(parserDefinitionParser), collection)
    })
    return collection
  }

  get cruxPath() {
    const parentPath = this.parent.cruxPath
    return (parentPath ? parentPath + " " : "") + this.cruxIfAny
  }

  get cruxPathAsColumnName() {
    return this.cruxPath.replace(/ /g, "_")
  }

  // Get every definition that extends from this one, even ones that are scoped inside other definitions.
  get concreteDescendantDefinitions() {
    const { inScopeAndDescendantDefinitions, id } = this
    return Object.values(inScopeAndDescendantDefinitions).filter(def => def._doesExtend(id) && !def._isAbstract())
  }

  get concreteInScopeDescendantDefinitions() {
    // Note: non-recursive.
    const defs = this.programParserDefinitionCache
    const id = this.id
    return Object.values(defs).filter(def => def._doesExtend(id) && !def._isAbstract())
  }

  private _getConcreteNonErrorInScopeNodeDefinitions(parserIds: string[]) {
    const defs: AbstractParserDefinitionParser[] = []
    parserIds.forEach(parserId => {
      const def = this.getParserDefinitionByParserId(parserId)
      if (def._isErrorParser()) return
      else if (def._isAbstract()) def.concreteInScopeDescendantDefinitions.forEach(def => defs.push(def))
      else defs.push(def)
    })
    return defs
  }

  // todo: refactor
  synthesizeNode(nodeCount = 1, indentCount = -1, parsersAlreadySynthesized: string[] = [], seed = Date.now()) {
    let inScopeParserIds = this._getInScopeParserIds()
    const catchAllParserId = this._getFromExtended(GrammarConstants.catchAllParser)
    if (catchAllParserId) inScopeParserIds.push(catchAllParserId)
    const thisId = this.id
    if (!parsersAlreadySynthesized.includes(thisId)) parsersAlreadySynthesized.push(thisId)
    const lines = []
    while (nodeCount) {
      const line = this._generateSimulatedLine(seed)
      if (line) lines.push(" ".repeat(indentCount >= 0 ? indentCount : 0) + line)

      this._getConcreteNonErrorInScopeNodeDefinitions(inScopeParserIds.filter(parserId => !parsersAlreadySynthesized.includes(parserId)))
        .filter(def => this._shouldSynthesize(def, parsersAlreadySynthesized))
        .forEach(def => {
          const chain = parsersAlreadySynthesized // .slice(0)
          chain.push(def.id)
          def.synthesizeNode(1, indentCount + 1, chain, seed).forEach(line => lines.push(line))
        })
      nodeCount--
    }
    return lines
  }

  private _cellParser: AbstractCellParser

  get cellParser() {
    if (!this._cellParser) {
      const cellParsingStrategy = this._getFromExtended(GrammarConstants.cellParser)
      if (cellParsingStrategy === GrammarCellParser.postfix) this._cellParser = new PostfixCellParser(this)
      else if (cellParsingStrategy === GrammarCellParser.omnifix) this._cellParser = new OmnifixCellParser(this)
      else this._cellParser = new PrefixCellParser(this)
    }
    return this._cellParser
  }
}

// todo: remove?
class parserDefinitionParser extends AbstractParserDefinitionParser {}

// HandGrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class HandGrammarProgram extends AbstractParserDefinitionParser {
  createParserCombinator() {
    const map: treeNotationTypes.stringMap = {}
    map[GrammarConstants.comment] = TreeNode
    return new TreeNode.ParserCombinator(UnknownParserNode, map, [
      { regex: HandGrammarProgram.blankLineRegex, parser: TreeNode },
      { regex: HandGrammarProgram.parserFullRegex, parser: parserDefinitionParser },
      { regex: HandGrammarProgram.cellTypeFullRegex, parser: cellTypeDefinitionParser }
    ])
  }

  static makeParserId = (str: string) => Utils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandGrammarProgram.parserSuffixRegex, "") + GrammarConstants.parserSuffix
  static makeCellTypeId = (str: string) => Utils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandGrammarProgram.cellTypeSuffixRegex, "") + GrammarConstants.cellTypeSuffix

  static parserSuffixRegex = new RegExp(GrammarConstants.parserSuffix + "$")
  static parserFullRegex = new RegExp("^[a-zA-Z0-9_]+" + GrammarConstants.parserSuffix + "$")
  static blankLineRegex = new RegExp("^$")

  static cellTypeSuffixRegex = new RegExp(GrammarConstants.cellTypeSuffix + "$")
  static cellTypeFullRegex = new RegExp("^[a-zA-Z0-9_]+" + GrammarConstants.cellTypeSuffix + "$")

  private _cache_rootParser: any
  // rootParser
  // Note: this is some so far unavoidable tricky code. We need to eval the transpiled JS, in a NodeJS or browser environment.
  _compileAndReturnRootParser(): Function {
    if (this._cache_rootParser) return this._cache_rootParser

    if (!this.isNodeJs()) {
      this._cache_rootParser = Utils.appendCodeAndReturnValueOnWindow(this.toBrowserJavascript(), this.rootParserId).rootParser
      return this._cache_rootParser
    }

    const path = require("path")
    const code = this.toNodeJsJavascript(__dirname)
    try {
      const rootNode = this._requireInVmNodeJsRootParser(code)
      this._cache_rootParser = rootNode.rootParser
      if (!this._cache_rootParser) throw new Error(`Failed to rootParser`)
    } catch (err) {
      // todo: figure out best error pattern here for debugging
      console.log(err)
      // console.log(`Error in code: `)
      // console.log(new TreeNode(code).toStringWithLineNumbers())
    }
    return this._cache_rootParser
  }

  get cruxPath() {
    return ""
  }

  trainModel(programs: string[], rootParser = this.compileAndReturnRootParser()): SimplePredictionModel {
    const nodeDefs = this.validConcreteAndAbstractParserDefinitions
    const nodeDefCountIncludingRoot = nodeDefs.length + 1
    const matrix = Utils.makeMatrix(nodeDefCountIncludingRoot, nodeDefCountIncludingRoot, 0)
    const idToIndex: { [id: string]: number } = {}
    const indexToId: { [index: number]: string } = {}
    nodeDefs.forEach((def, index) => {
      const id = def.id
      idToIndex[id] = index + 1
      indexToId[index + 1] = id
    })
    programs.forEach(code => {
      const exampleProgram = new rootParser(code)
      exampleProgram.topDownArray.forEach((node: GrammarBackedNode) => {
        const nodeIndex = idToIndex[node.definition.id]
        const parentNode = <GrammarBackedNode>node.parent
        if (!nodeIndex) return undefined
        if (parentNode.isRoot()) matrix[0][nodeIndex]++
        else {
          const parentIndex = idToIndex[parentNode.definition.id]
          if (!parentIndex) return undefined
          matrix[parentIndex][nodeIndex]++
        }
      })
    })
    return {
      idToIndex,
      indexToId,
      matrix
    }
  }

  private _mapPredictions(predictionsVector: number[], model: SimplePredictionModel) {
    const total = Utils.sum(predictionsVector)
    const predictions = predictionsVector.slice(1).map((count, index) => {
      const id = model.indexToId[index + 1]
      return {
        id,
        def: this.getParserDefinitionByParserId(id),
        count,
        prob: count / total
      }
    })
    predictions.sort(Utils.makeSortByFn((prediction: any) => prediction.count)).reverse()
    return predictions
  }

  predictChildren(model: SimplePredictionModel, node: GrammarBackedNode) {
    return this._mapPredictions(this._predictChildren(model, node), model)
  }

  predictParents(model: SimplePredictionModel, node: GrammarBackedNode) {
    return this._mapPredictions(this._predictParents(model, node), model)
  }

  private _predictChildren(model: SimplePredictionModel, node: GrammarBackedNode) {
    return model.matrix[node.isRoot() ? 0 : model.idToIndex[node.definition.id]]
  }

  private _predictParents(model: SimplePredictionModel, node: GrammarBackedNode) {
    if (node.isRoot()) return []
    const nodeIndex = model.idToIndex[node.definition.id]
    return model.matrix.map(row => row[nodeIndex])
  }

  // todo: hacky, remove
  private _dirName: string
  _setDirName(name: string) {
    this._dirName = name
    return this
  }

  private _requireInVmNodeJsRootParser(code: treeNotationTypes.javascriptCode): any {
    const vm = require("vm")
    const path = require("path")
    // todo: cleanup up
    try {
      Object.keys(GlobalNamespaceAdditions).forEach(key => {
        ;(<any>global)[key] = require("./" + GlobalNamespaceAdditions[key])
      })
      ;(<any>global).require = require
      ;(<any>global).__dirname = this._dirName
      ;(<any>global).module = {}
      return vm.runInThisContext(code)
    } catch (err) {
      // todo: figure out best error pattern here for debugging
      console.log(`Error in compiled grammar code for language "${this.grammarName}"`)
      // console.log(new TreeNode(code).toStringWithLineNumbers())
      console.log(err)
      throw err
    }
  }

  examplesToTestBlocks(rootParser = this.compileAndReturnRootParser(), expectedErrorMessage = "") {
    const testBlocks: { [id: string]: Function } = {}
    this.validConcreteAndAbstractParserDefinitions.forEach(def =>
      def.examples.forEach(example => {
        const id = def.id + example.content
        testBlocks[id] = (equal: Function) => {
          const exampleProgram = new rootParser(example.childrenToString())
          const errors = exampleProgram.getAllErrors(example._getLineNumber() + 1)
          equal(errors.join("\n"), expectedErrorMessage, `Expected no errors in ${id}`)
        }
      })
    )
    return testBlocks
  }

  toReadMe() {
    const languageName = this.extensionName
    const rootNodeDef = this.rootParserDefinition
    const cellTypes = this.cellTypeDefinitions
    const parserFamilyTree = this.parserFamilyTree
    const exampleNode = rootNodeDef.examples[0]
    return `title ${languageName} Readme

paragraph ${rootNodeDef.description}

subtitle Quick Example

code
${exampleNode ? exampleNode.childrenToString(1) : ""}

subtitle Quick facts about ${languageName}

list
 - ${languageName} has ${parserFamilyTree.topDownArray.length} node types.
 - ${languageName} has ${Object.keys(cellTypes).length} cell types
 - The source code for ${languageName} is ${this.topDownArray.length} lines long.

subtitle Installing

code
 npm install .

subtitle Testing

code
 node test.js

subtitle Node Types

code
${parserFamilyTree.toString(1)}

subtitle Cell Types

code
${new TreeNode(Object.keys(cellTypes).join("\n")).toString(1)}

subtitle Road Map

paragraph Here are the "todos" present in the source code for ${languageName}:

list
${this.topDownArray
  .filter(node => node.getWord(0) === "todo")
  .map(node => ` - ${node.getLine()}`)
  .join("\n")}

paragraph This readme was auto-generated using the
 link https://github.com/treenotation/jtree JTree library.`
  }

  toBundle() {
    const files: treeNotationTypes.stringMap = {}
    const rootNodeDef = this.rootParserDefinition
    const languageName = this.extensionName
    const example = rootNodeDef.examples[0]
    const sampleCode = example ? example.childrenToString() : ""

    files[GrammarBundleFiles.package] = JSON.stringify(
      {
        name: languageName,
        private: true,
        dependencies: {
          jtree: TreeNode.getVersion()
        }
      },
      null,
      2
    )
    files[GrammarBundleFiles.readme] = this.toReadMe()

    const testCode = `const program = new ${languageName}(sampleCode)
const errors = program.getAllErrors()
console.log("Sample program compiled with " + errors.length + " errors.")
if (errors.length)
 console.log(errors.map(error => error.message))`

    const nodePath = `${languageName}.node.js`
    files[nodePath] = this.toNodeJsJavascript()
    files[GrammarBundleFiles.indexJs] = `module.exports = require("./${nodePath}")`

    const browserPath = `${languageName}.browser.js`
    files[browserPath] = this.toBrowserJavascript()
    files[GrammarBundleFiles.indexHtml] = `<script src="node_modules/jtree/products/Utils.browser.js"></script>
<script src="node_modules/jtree/products/TreeNode.browser.js"></script>
<script src="node_modules/jtree/products/GrammarLanguage.browser.js"></script>
<script src="${browserPath}"></script>
<script>
const sampleCode = \`${sampleCode.toString()}\`
${testCode}
</script>`

    const samplePath = "sample." + this.extensionName
    files[samplePath] = sampleCode.toString()
    files[GrammarBundleFiles.testJs] = `const ${languageName} = require("./index.js")
/*keep-line*/ const sampleCode = require("fs").readFileSync("${samplePath}", "utf8")
${testCode}`
    return files
  }

  get targetExtension() {
    return this.rootParserDefinition.get(GrammarConstants.compilesTo)
  }

  private _cache_cellTypes: {
    [name: string]: cellTypeDefinitionParser
  }

  get cellTypeDefinitions() {
    if (this._cache_cellTypes) return this._cache_cellTypes
    const types: { [typeName: string]: cellTypeDefinitionParser } = {}
    // todo: add built in word types?
    this.getChildrenByParser(cellTypeDefinitionParser).forEach(type => (types[(<cellTypeDefinitionParser>type).cellTypeId] = type))
    this._cache_cellTypes = types
    return types
  }

  getCellTypeDefinitionById(cellTypeId: treeNotationTypes.cellTypeId) {
    // todo: return unknownCellTypeDefinition? or is that handled somewhere else?
    return this.cellTypeDefinitions[cellTypeId]
  }

  get parserFamilyTree() {
    const tree = new TreeNode()
    Object.values(this.validConcreteAndAbstractParserDefinitions).forEach(node => tree.touchNode(node.ancestorParserIdsArray.join(" ")))
    return tree
  }

  get languageDefinitionProgram() {
    return this
  }

  get validConcreteAndAbstractParserDefinitions() {
    return <parserDefinitionParser[]>this.getChildrenByParser(parserDefinitionParser).filter((node: parserDefinitionParser) => node._hasValidParserId())
  }

  private _cache_rootParserNode: parserDefinitionParser

  private get lastRootParserDefinitionNode() {
    return this.findLast(def => def instanceof AbstractParserDefinitionParser && def.has(GrammarConstants.root) && def._hasValidParserId())
  }

  private _initRootParserDefinitionNode() {
    if (this._cache_rootParserNode) return
    if (!this._cache_rootParserNode) this._cache_rootParserNode = this.lastRootParserDefinitionNode
    // By default, have a very permissive basic root node.
    // todo: whats the best design pattern to use for this sort of thing?
    if (!this._cache_rootParserNode) {
      this._cache_rootParserNode = <parserDefinitionParser>this.concat(`${GrammarConstants.DefaultRootParser}
 ${GrammarConstants.root}
 ${GrammarConstants.catchAllParser} ${GrammarConstants.BlobParser}`)[0]
      this._addDefaultCatchAllBlobParser()
    }
  }

  get rootParserDefinition() {
    this._initRootParserDefinitionNode()
    return this._cache_rootParserNode
  }

  // todo: whats the best design pattern to use for this sort of thing?
  // todo: remove this, or at least document wtf is going on
  _addedCatchAll: any
  _addDefaultCatchAllBlobParser() {
    if (this._addedCatchAll) return
    this._addedCatchAll = true
    delete this._cache_parserDefinitionParsers
    this.concat(`${GrammarConstants.BlobParser}
 ${GrammarConstants.baseParser} ${GrammarConstants.blobParser}`)
  }

  get extensionName() {
    return this.grammarName
  }

  get id() {
    return this.rootParserId
  }

  get rootParserId() {
    return this.rootParserDefinition.parserIdFromDefinition
  }

  get grammarName(): string | undefined {
    return this.rootParserId.replace(HandGrammarProgram.parserSuffixRegex, "")
  }

  _getMyInScopeParserIds() {
    return super._getMyInScopeParserIds(this.rootParserDefinition)
  }

  protected _getInScopeParserIds(): treeNotationTypes.parserId[] {
    const parsersNode = this.rootParserDefinition.getNode(GrammarConstants.inScope)
    return parsersNode ? parsersNode.getWordsFrom(1) : []
  }

  makeProgramParserDefinitionCache() {
    const cache = {}
    this.getChildrenByParser(parserDefinitionParser).forEach(parserDefinitionParser => (cache[(<parserDefinitionParser>parserDefinitionParser).parserIdFromDefinition] = parserDefinitionParser))
    return cache
  }

  static _languages: any = {}
  static _parsers: any = {}

  // todo: add explanation
  private _cached_rootParser: AbstractRuntimeProgramConstructorInterface
  compileAndReturnRootParser() {
    if (!this._cached_rootParser) {
      const rootDef = this.rootParserDefinition
      this._cached_rootParser = <AbstractRuntimeProgramConstructorInterface>rootDef.languageDefinitionProgram._compileAndReturnRootParser()
    }
    return this._cached_rootParser
  }

  private get fileExtensions(): string {
    return this.rootParserDefinition.get(GrammarConstants.extensions)
      ? this.rootParserDefinition
          .get(GrammarConstants.extensions)
          .split(" ")
          .join(",")
      : this.extensionName
  }

  toNodeJsJavascript(jtreeProductsPath: treeNotationTypes.requirePath = "jtree/products"): treeNotationTypes.javascriptCode {
    return this._rootNodeDefToJavascriptClass(jtreeProductsPath, true).trim()
  }

  toBrowserJavascript(): treeNotationTypes.javascriptCode {
    return this._rootNodeDefToJavascriptClass("", false).trim()
  }

  private _rootNodeDefToJavascriptClass(jtreeProductsPath: treeNotationTypes.requirePath, forNodeJs = true): treeNotationTypes.javascriptCode {
    const defs = this.validConcreteAndAbstractParserDefinitions
    // todo: throw if there is no root node defined
    const parserClasses = defs.map(def => def.asJavascriptClass).join("\n\n")
    const rootDef = this.rootParserDefinition
    const rootNodeJsHeader = forNodeJs && rootDef._getConcatBlockStringFromExtended(GrammarConstants._rootNodeJsHeader)
    const rootName = rootDef.generatedClassName

    if (!rootName) throw new Error(`Root Node Type Has No Name`)

    let exportScript = ""
    if (forNodeJs)
      exportScript = `module.exports = ${rootName};
${rootName}`
    else exportScript = `window.${rootName} = ${rootName}`

    let nodeJsImports = ``
    if (forNodeJs)
      nodeJsImports = Object.keys(GlobalNamespaceAdditions)
        .map(key => `const { ${key} } = require("${jtreeProductsPath}/${GlobalNamespaceAdditions[key]}")`)
        .join("\n")

    // todo: we can expose the previous "constants" export, if needed, via the grammar, which we preserve.
    return `{
${nodeJsImports}
${rootNodeJsHeader ? rootNodeJsHeader : ""}
${parserClasses}

${exportScript}
}
`
  }

  toSublimeSyntaxFile() {
    const cellTypeDefs = this.cellTypeDefinitions
    const variables = Object.keys(cellTypeDefs)
      .map(name => ` ${name}: '${cellTypeDefs[name].regexString}'`)
      .join("\n")

    const defs = this.validConcreteAndAbstractParserDefinitions.filter(kw => !kw._isAbstract())
    const parserContexts = defs.map(def => def._toSublimeMatchBlock()).join("\n\n")
    const includes = defs.map(parserDef => `  - include: '${parserDef.parserIdFromDefinition}'`).join("\n")

    return `%YAML 1.2
---
name: ${this.extensionName}
file_extensions: [${this.fileExtensions}]
scope: source.${this.extensionName}

variables:
${variables}

contexts:
 main:
${includes}

${parserContexts}`
  }
}

const PreludeKinds: treeNotationTypes.stringMap = {}
PreludeKinds[PreludeCellTypeIds.anyCell] = GrammarAnyCell
PreludeKinds[PreludeCellTypeIds.keywordCell] = GrammarKeywordCell
PreludeKinds[PreludeCellTypeIds.floatCell] = GrammarFloatCell
PreludeKinds[PreludeCellTypeIds.numberCell] = GrammarFloatCell
PreludeKinds[PreludeCellTypeIds.bitCell] = GrammarBitCell
PreludeKinds[PreludeCellTypeIds.boolCell] = GrammarBoolCell
PreludeKinds[PreludeCellTypeIds.intCell] = GrammarIntCell

class UnknownGrammarProgram extends TreeNode {
  private _inferRootNodeForAPrefixLanguage(grammarName: string): TreeNode {
    grammarName = HandGrammarProgram.makeParserId(grammarName)
    const rootNode = new TreeNode(`${grammarName}
 ${GrammarConstants.root}`)

    // note: right now we assume 1 global cellTypeMap and parserMap per grammar. But we may have scopes in the future?
    const rootNodeNames = this.getFirstWords()
      .filter(identity => identity)
      .map(word => HandGrammarProgram.makeParserId(word))
    rootNode
      .nodeAt(0)
      .touchNode(GrammarConstants.inScope)
      .setWordsFrom(1, Array.from(new Set(rootNodeNames)))

    return rootNode
  }

  private static _childSuffix = "Child"

  private _renameIntegerKeywords(clone: UnknownGrammarProgram) {
    // todo: why are we doing this?
    for (let node of clone.getTopDownArrayIterator()) {
      const firstWordIsAnInteger = !!node.firstWord.match(/^\d+$/)
      const parentFirstWord = node.parent.firstWord
      if (firstWordIsAnInteger && parentFirstWord) node.setFirstWord(HandGrammarProgram.makeParserId(parentFirstWord + UnknownGrammarProgram._childSuffix))
    }
  }

  private _getKeywordMaps(clone: UnknownGrammarProgram) {
    const keywordsToChildKeywords: { [firstWord: string]: treeNotationTypes.stringMap } = {}
    const keywordsToNodeInstances: { [firstWord: string]: TreeNode[] } = {}
    for (let node of clone.getTopDownArrayIterator()) {
      const firstWord = node.firstWord
      if (!keywordsToChildKeywords[firstWord]) keywordsToChildKeywords[firstWord] = {}
      if (!keywordsToNodeInstances[firstWord]) keywordsToNodeInstances[firstWord] = []
      keywordsToNodeInstances[firstWord].push(node)
      node.forEach((child: TreeNode) => (keywordsToChildKeywords[firstWord][child.firstWord] = true))
    }
    return { keywordsToChildKeywords: keywordsToChildKeywords, keywordsToNodeInstances: keywordsToNodeInstances }
  }

  private _inferParserDef(firstWord: string, globalCellTypeMap: Map<string, string>, childFirstWords: string[], instances: TreeNode[]) {
    const edgeSymbol = this.edgeSymbol
    const parserId = HandGrammarProgram.makeParserId(firstWord)
    const nodeDefNode = <TreeNode>new TreeNode(parserId).nodeAt(0)
    const childParserIds = childFirstWords.map(word => HandGrammarProgram.makeParserId(word))
    if (childParserIds.length) nodeDefNode.touchNode(GrammarConstants.inScope).setWordsFrom(1, childParserIds)

    const cellsForAllInstances = instances
      .map(line => line.content)
      .filter(identity => identity)
      .map(line => line.split(edgeSymbol))
    const instanceCellCounts = new Set(cellsForAllInstances.map(cells => cells.length))
    const maxCellsOnLine = Math.max(...Array.from(instanceCellCounts))
    const minCellsOnLine = Math.min(...Array.from(instanceCellCounts))
    let catchAllCellType: string
    let cellTypeIds = []
    for (let cellIndex = 0; cellIndex < maxCellsOnLine; cellIndex++) {
      const cellType = this._getBestCellType(
        firstWord,
        instances.length,
        maxCellsOnLine,
        cellsForAllInstances.map(cells => cells[cellIndex])
      )
      if (!globalCellTypeMap.has(cellType.cellTypeId)) globalCellTypeMap.set(cellType.cellTypeId, cellType.cellTypeDefinition)

      cellTypeIds.push(cellType.cellTypeId)
    }
    if (maxCellsOnLine > minCellsOnLine) {
      //columns = columns.slice(0, min)
      catchAllCellType = cellTypeIds.pop()
      while (cellTypeIds[cellTypeIds.length - 1] === catchAllCellType) {
        cellTypeIds.pop()
      }
    }

    const needsCruxProperty = !firstWord.endsWith(UnknownGrammarProgram._childSuffix + GrammarConstants.parserSuffix) // todo: cleanup
    if (needsCruxProperty) nodeDefNode.set(GrammarConstants.crux, firstWord)

    if (catchAllCellType) nodeDefNode.set(GrammarConstants.catchAllCellType, catchAllCellType)

    const cellLine = cellTypeIds.slice()
    cellLine.unshift(PreludeCellTypeIds.keywordCell)
    if (cellLine.length > 0) nodeDefNode.set(GrammarConstants.cells, cellLine.join(edgeSymbol))

    //if (!catchAllCellType && cellTypeIds.length === 1) nodeDefNode.set(GrammarConstants.cells, cellTypeIds[0])

    // Todo: add conditional frequencies
    return nodeDefNode.parent.toString()
  }

  //  inferGrammarFileForAnSSVLanguage(grammarName: string): string {
  //     grammarName = HandGrammarProgram.makeParserId(grammarName)
  //    const rootNode = new TreeNode(`${grammarName}
  // ${GrammarConstants.root}`)

  //    // note: right now we assume 1 global cellTypeMap and parserMap per grammar. But we may have scopes in the future?
  //    const rootNodeNames = this.getFirstWords().map(word => HandGrammarProgram.makeParserId(word))
  //    rootNode
  //      .nodeAt(0)
  //      .touchNode(GrammarConstants.inScope)
  //      .setWordsFrom(1, Array.from(new Set(rootNodeNames)))

  //    return rootNode
  //  }

  inferGrammarFileForAKeywordLanguage(grammarName: string): string {
    const clone = <UnknownGrammarProgram>this.clone()
    this._renameIntegerKeywords(clone)

    const { keywordsToChildKeywords, keywordsToNodeInstances } = this._getKeywordMaps(clone)

    const globalCellTypeMap = new Map()
    globalCellTypeMap.set(PreludeCellTypeIds.keywordCell, undefined)
    const parserDefs = Object.keys(keywordsToChildKeywords)
      .filter(identity => identity)
      .map(firstWord => this._inferParserDef(firstWord, globalCellTypeMap, Object.keys(keywordsToChildKeywords[firstWord]), keywordsToNodeInstances[firstWord]))

    const cellTypeDefs: string[] = []
    globalCellTypeMap.forEach((def, id) => cellTypeDefs.push(def ? def : id))
    const nodeBreakSymbol = this.nodeBreakSymbol

    return this._formatCode([this._inferRootNodeForAPrefixLanguage(grammarName).toString(), cellTypeDefs.join(nodeBreakSymbol), parserDefs.join(nodeBreakSymbol)].filter(identity => identity).join("\n"))
  }

  private _formatCode(code: string) {
    // todo: make this run in browser too
    if (!this.isNodeJs()) return code

    const grammarProgram = new HandGrammarProgram(TreeNode.fromDisk(__dirname + "/../langs/grammar/grammar.grammar"))
    const rootParser = <any>grammarProgram.compileAndReturnRootParser()
    const program = new rootParser(code)
    return program.format().toString()
  }

  private _getBestCellType(firstWord: string, instanceCount: treeNotationTypes.int, maxCellsOnLine: treeNotationTypes.int, allValues: any[]): { cellTypeId: string; cellTypeDefinition?: string } {
    const asSet = new Set(allValues)
    const edgeSymbol = this.edgeSymbol
    const values = Array.from(asSet).filter(identity => identity)
    const every = (fn: Function) => {
      for (let index = 0; index < values.length; index++) {
        if (!fn(values[index])) return false
      }
      return true
    }
    if (every((str: string) => str === "0" || str === "1")) return { cellTypeId: PreludeCellTypeIds.bitCell }

    if (
      every((str: string) => {
        const num = parseInt(str)
        if (isNaN(num)) return false
        return num.toString() === str
      })
    ) {
      return { cellTypeId: PreludeCellTypeIds.intCell }
    }

    if (every((str: string) => str.match(/^-?\d*.?\d+$/))) return { cellTypeId: PreludeCellTypeIds.floatCell }

    const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"])
    if (every((str: string) => bools.has(str.toLowerCase()))) return { cellTypeId: PreludeCellTypeIds.boolCell }

    // todo: cleanup
    const enumLimit = 30
    if (instanceCount > 1 && maxCellsOnLine === 1 && allValues.length > asSet.size && asSet.size < enumLimit)
      return {
        cellTypeId: HandGrammarProgram.makeCellTypeId(firstWord),
        cellTypeDefinition: `${HandGrammarProgram.makeCellTypeId(firstWord)}
 enum ${values.join(edgeSymbol)}`
      }

    return { cellTypeId: PreludeCellTypeIds.anyCell }
  }
}

export { GrammarConstants, PreludeCellTypeIds, HandGrammarProgram, GrammarBackedNode, UnknownParserError, UnknownGrammarProgram }
