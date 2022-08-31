import { TreeNode, TreeWord, ExtendibleTreeNode, AbstractExtendibleTreeNode } from "./TreeNode"
import { TreeUtils } from "./TreeUtils"
import { treeNotationTypes } from "../products/treeNotationTypes"

interface AbstractRuntimeProgramConstructorInterface {
  new (code?: string): GrammarBackedNode
}

declare type parserInfo = { firstWordMap: { [firstWord: string]: nodeTypeDefinitionNode }; regexTests: treeNotationTypes.regexTestDef[] }

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

enum SQLiteTypes {
  integer = "INTEGER",
  float = "FLOAT",
  text = "TEXT"
}

enum GrammarConstantsMisc {
  doNotSynthesize = "doNotSynthesize",
  tableName = "tableName"
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
  toolingDirective = "tooling",
  todoComment = "todo",
  version = "version",
  nodeType = "nodeType",
  cellType = "cellType",

  grammarFileExtension = "grammar",

  abstractNodeTypePrefix = "abstract",
  nodeTypeSuffix = "Node",
  cellTypeSuffix = "Cell",

  // error check time
  regex = "regex", // temporary?
  reservedWords = "reservedWords", // temporary?
  enumFromCellTypes = "enumFromCellTypes", // temporary?
  enum = "enum", // temporary?
  examples = "examples",
  min = "min",
  max = "max",

  // baseNodeTypes
  baseNodeType = "baseNodeType",
  blobNode = "blobNode",
  errorNode = "errorNode",

  // parse time
  extends = "extends",
  root = "root",
  crux = "crux",
  cruxFromId = "cruxFromId",
  pattern = "pattern",
  inScope = "inScope",
  cells = "cells",
  contentDelimiter = "contentDelimiter",
  contentKey = "contentKey",
  childrenKey = "childrenKey",
  uniqueFirstWord = "uniqueFirstWord",
  catchAllCellType = "catchAllCellType",
  cellParser = "cellParser",
  catchAllNodeType = "catchAllNodeType",
  constants = "constants",
  required = "required", // Require this nodeType to be present in a node or program
  single = "single", // Have at most 1 of these
  tags = "tags",

  _extendsJsClass = "_extendsJsClass", // todo: remove
  _rootNodeJsHeader = "_rootNodeJsHeader", // todo: remove

  // default catchAll nodeType
  BlobNode = "BlobNode",
  defaultRootNode = "defaultRootNode",

  // code
  javascript = "javascript",

  // compile time
  compilerNodeType = "compiler",
  compilesTo = "compilesTo",

  // develop time
  description = "description",
  example = "example",
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
  getDefinition(): AbstractGrammarDefinitionNode | HandGrammarProgram | nodeTypeDefinitionNode {
    const handGrammarProgram = this.getHandGrammarProgram()
    return this.isRoot() ? handGrammarProgram : handGrammarProgram.getNodeTypeDefinitionByNodeTypeId(this.constructor.name)
  }

  toSQLiteInsertStatement(id: string): string {
    const def = this.getDefinition()
    const tableName = (<any>this).tableName || def.getTableNameIfAny() || def._getId()
    const columns = def.getSQLiteTableColumns()
    const hits = columns.filter(colDef => this.has(colDef.columnName))

    const values = hits.map(colDef => {
      const node = this.getNode(colDef.columnName)
      let content = node.getContent()
      const hasChildren = node.length
      const isText = colDef.type === SQLiteTypes.text
      if (content && hasChildren) content = node.getContentWithChildren().replace(/\n/g, "\\n")
      else if (hasChildren) content = node.childrenToString().replace(/\n/g, "\\n")
      return isText || hasChildren ? `"${content}"` : content
    })

    hits.unshift({ columnName: "id", type: SQLiteTypes.text })
    values.unshift(`"${id}"`)
    return `INSERT INTO ${tableName} (${hits.map(col => col.columnName).join(",")}) VALUES (${values.join(",")});`
  }

  getAutocompleteResults(partialWord: string, cellIndex: treeNotationTypes.positiveInt) {
    return cellIndex === 0 ? this._getAutocompleteResultsForFirstWord(partialWord) : this._getAutocompleteResultsForCell(partialWord, cellIndex)
  }

  getChildInstancesOfNodeTypeId(nodeTypeId: treeNotationTypes.nodeTypeId): GrammarBackedNode[] {
    return this.filter(node => node.doesExtend(nodeTypeId))
  }

  doesExtend(nodeTypeId: treeNotationTypes.nodeTypeId) {
    return this.getDefinition()._doesExtend(nodeTypeId)
  }

  _getErrorNodeErrors() {
    return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)]
  }

  _getBlobNodeCatchAllNodeType() {
    return BlobNode
  }

  private _getAutocompleteResultsForFirstWord(partialWord: string) {
    const keywordMap = this.getDefinition().getFirstWordMapWithDefinitions()
    let keywords: string[] = Object.keys(keywordMap)

    if (partialWord) keywords = keywords.filter(keyword => keyword.includes(partialWord))

    return keywords.map(keyword => {
      const def = keywordMap[keyword]
      const description = def.getDescription()
      return {
        text: keyword,
        displayText: keyword + (description ? " " + description : "")
      }
    })
  }

  private _getAutocompleteResultsForCell(partialWord: string, cellIndex: treeNotationTypes.positiveInt) {
    // todo: root should be [] correct?
    const cell = this._getParsedCells()[cellIndex]
    return cell ? cell.getAutoCompleteWords(partialWord) : []
  }

  // note: this is overwritten by the root node of a runtime grammar program.
  // some of the magic that makes this all work. but maybe there's a better way.
  getHandGrammarProgram(): HandGrammarProgram {
    if (this.isRoot()) throw new Error(`Root node without getHandGrammarProgram defined.`)
    return (<any>this.getRootNode()).getHandGrammarProgram()
  }

  getRunTimeEnumOptions(cell: AbstractGrammarBackedCell<any>): string[] {
    return undefined
  }

  private _sortNodesByInScopeOrder() {
    const nodeTypeOrder = this.getDefinition()._getMyInScopeNodeTypeIds()
    if (!nodeTypeOrder.length) return this
    const orderMap: treeNotationTypes.stringMap = {}
    nodeTypeOrder.forEach((word, index) => {
      orderMap[word] = index
    })
    this.sort(
      TreeUtils.makeSortByFn((runtimeNode: GrammarBackedNode) => {
        return orderMap[runtimeNode.getDefinition().getNodeTypeIdFromDefinition()]
      })
    )
    return this
  }

  protected get requiredNodeErrors() {
    const errors: treeNotationTypes.TreeError[] = []
    Object.values(this.getDefinition().getFirstWordMapWithDefinitions()).forEach(def => {
      if (def.isRequired()) if (!this.getChildren().some(node => node.getDefinition() === def)) errors.push(new MissingRequiredNodeTypeError(this, def.getNodeTypeIdFromDefinition()))
    })
    return errors
  }

  getProgramAsCells() {
    // todo: what is this?
    return this.getTopDownArray().map((node: GrammarBackedNode) => {
      const cells = node._getParsedCells()
      let indents = node.getIndentLevel() - 1
      while (indents) {
        cells.unshift(undefined)
        indents--
      }
      return cells
    })
  }

  getProgramWidth() {
    return Math.max(...this.getProgramAsCells().map(line => line.length))
  }

  getAllTypedWords() {
    const words: TypedWord[] = []
    this.getTopDownArray().forEach((node: GrammarBackedNode) => {
      node.getWordTypes().forEach((cell, index) => {
        words.push(new TypedWord(node, index, cell.getCellTypeId()))
      })
    })
    return words
  }

  findAllWordsWithCellType(cellTypeId: treeNotationTypes.cellTypeId) {
    return this.getAllTypedWords().filter(typedWord => typedWord.type === cellTypeId)
  }

  findAllNodesWithNodeType(nodeTypeId: treeNotationTypes.nodeTypeId) {
    return this.getTopDownArray().filter((node: GrammarBackedNode) => node.getDefinition().getNodeTypeIdFromDefinition() === nodeTypeId)
  }

  toCellTypeTree() {
    return this.getTopDownArray()
      .map(child => child.getIndentation() + child.getLineCellTypes())
      .join("\n")
  }

  getParseTable(maxColumnWidth = 40) {
    const tree = new TreeNode(this.toCellTypeTree())
    return new TreeNode(
      tree.getTopDownArray().map((node, lineNumber) => {
        const sourceNode = this.nodeAtLine(lineNumber)
        const errs = sourceNode.getErrors()
        const errorCount = errs.length
        const obj: any = {
          lineNumber: lineNumber,
          source: sourceNode.getIndentation() + sourceNode.getLine(),
          nodeType: sourceNode.constructor.name,
          cellTypes: node.getContent(),
          errorCount: errorCount
        }
        if (errorCount) obj.errorMessages = errs.map(err => err.getMessage()).join(";")
        return obj
      })
    ).toFormattedTable(maxColumnWidth)
  }

  // Helper method for selecting potential nodeTypes needed to update grammar file.
  getInvalidNodeTypes() {
    return Array.from(
      new Set(
        this.getAllErrors()
          .filter(err => err instanceof UnknownNodeTypeError)
          .map(err => err.getNode().getFirstWord())
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
    return new TreeNode(<any>this._getAllAutoCompleteWords().map(result => {
      result.suggestions = <any>result.suggestions.map((node: any) => node.text).join(" ")
      return result
    })).toTable()
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

  private _sortWithParentNodeTypesUpTop() {
    const familyTree = new HandGrammarProgram(this.toString()).getNodeTypeFamilyTree()
    const rank: treeNotationTypes.stringMap = {}
    familyTree.getTopDownArray().forEach((node, index) => {
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
        this._sortWithParentNodeTypesUpTop()
      } catch (err) {
        console.log(`Warning: ${err}`)
      }
    }
    this.getTopDownArray().forEach(child => {
      child.format()
    })
    return this
  }

  getNodeTypeUsage(filepath = "") {
    // returns a report on what nodeTypes from its language the program uses
    const usage = new TreeNode()
    const handGrammarProgram = this.getHandGrammarProgram()
    handGrammarProgram.getValidConcreteAndAbstractNodeTypeDefinitions().forEach((def: AbstractGrammarDefinitionNode) => {
      const requiredCellTypeIds = def.getCellParser().getRequiredCellTypeIds()
      usage.appendLine([def.getNodeTypeIdFromDefinition(), "line-id", "nodeType", requiredCellTypeIds.join(" ")].join(" "))
    })
    this.getTopDownArray<GrammarBackedNode>().forEach((node, lineNumber) => {
      const stats = usage.getNode(node.getNodeTypeId())
      stats.appendLine([filepath + "-" + lineNumber, node.getWords().join(" ")].join(" "))
    })
    return usage
  }

  toHighlightScopeTree() {
    return this.getTopDownArray<GrammarBackedNode>()
      .map(child => child.getIndentation() + child.getLineHighlightScopes())
      .join("\n")
  }

  toDefinitionLineNumberTree() {
    return this.getTopDownArray<GrammarBackedNode>()
      .map(child => child.getDefinition().getLineNumber() + " " + child.getIndentation() + child.getCellDefinitionLineNumbers().join(" "))
      .join("\n")
  }

  toCellTypeTreeWithNodeConstructorNames() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getWordBreakSymbol() + child.getIndentation() + child.getLineCellTypes())
      .join("\n")
  }

  toPreludeCellTypeTreeWithNodeConstructorNames() {
    return this.getTopDownArray<GrammarBackedNode>()
      .map(child => child.constructor.name + this.getWordBreakSymbol() + child.getIndentation() + child.getLineCellPreludeTypes())
      .join("\n")
  }

  getTreeWithNodeTypes() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getWordBreakSymbol() + child.getIndentation() + child.getLine())
      .join("\n")
  }

  getCellHighlightScopeAtPosition(lineIndex: number, wordIndex: number): treeNotationTypes.highlightScope | undefined {
    this._initCellTypeCache()
    const typeNode = this._cache_highlightScopeTree.getTopDownArray()[lineIndex - 1]
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

  createParser() {
    return this.isRoot()
      ? new TreeNode.Parser(BlobNode)
      : new TreeNode.Parser(
          this.getParent()
            ._getParser()
            ._getCatchAllNodeConstructor(this.getParent()),
          {}
        )
  }

  getNodeTypeId(): treeNotationTypes.nodeTypeId {
    return this.getDefinition().getNodeTypeIdFromDefinition()
  }

  getWordTypes() {
    return this._getParsedCells().filter(cell => cell.getWord() !== undefined)
  }

  private get cellErrors() {
    return this._getParsedCells()
      .map(check => check.getErrorIfAny())
      .filter(identity => identity)
  }

  private get singleNodeUsedTwiceErrors() {
    const errors: treeNotationTypes.TreeError[] = []
    const parent = this.getParent() as GrammarBackedNode
    const hits = parent.getChildInstancesOfNodeTypeId(this.getDefinition().id)

    if (hits.length > 1)
      hits.forEach((node, index) => {
        if (node === this) errors.push(new NodeTypeUsedMultipleTimesError(<GrammarBackedNode>node))
      })
    return errors
  }

  get scopeErrors() {
    let errors: treeNotationTypes.TreeError[] = []
    if (this.getDefinition().isSingle) errors = errors.concat(this.singleNodeUsedTwiceErrors)

    const { requiredNodeErrors } = this
    if (requiredNodeErrors.length) errors = errors.concat(requiredNodeErrors)
    return errors
  }

  getErrors() {
    return this.cellErrors.concat(this.scopeErrors)
  }

  _getParsedCells(): AbstractGrammarBackedCell<any>[] {
    return this.getDefinition()
      .getCellParser()
      .getCellArray(this)
  }

  // todo: just make a fn that computes proper spacing and then is given a node to print
  getLineCellTypes() {
    return this._getParsedCells()
      .map(slot => slot.getCellTypeId())
      .join(" ")
  }

  getLineCellPreludeTypes() {
    return this._getParsedCells()
      .map(slot => {
        const def = slot._getCellTypeDefinition()
        //todo: cleanup
        return def ? def._getPreludeKindId() : PreludeCellTypeIds.anyCell
      })
      .join(" ")
  }

  getLineHighlightScopes(defaultScope = "source") {
    return this._getParsedCells()
      .map(slot => slot.getHighlightScope() || defaultScope)
      .join(" ")
  }

  getCellDefinitionLineNumbers() {
    return this._getParsedCells().map(cell => cell.getDefinitionLineNumber())
  }

  protected _getCompiledIndentation() {
    const indentCharacter = this.getDefinition()._getCompilerObject()[GrammarConstantsCompiler.indentCharacter]
    const indent = this.getIndentation()
    return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent
  }

  private _getFields() {
    // fields are like cells
    const fields: any = {}
    this.forEach(node => {
      const def = node.getDefinition()
      if (def.isRequired() || def.isSingle) fields[node.getWord(0)] = node.getContent()
    })
    return fields
  }

  protected _getCompiledLine() {
    const compiler = this.getDefinition()._getCompilerObject()
    const catchAllCellDelimiter = compiler[GrammarConstantsCompiler.catchAllCellDelimiter]
    const str = compiler[GrammarConstantsCompiler.stringTemplate]
    return str !== undefined ? TreeUtils.formatStr(str, catchAllCellDelimiter, Object.assign(this._getFields(), this.cells)) : this.getLine()
  }

  protected get contentDelimiter() {
    return this.getDefinition()._getFromExtended(GrammarConstants.contentDelimiter)
  }

  protected get contentKey() {
    return this.getDefinition()._getFromExtended(GrammarConstants.contentKey)
  }

  protected get childrenKey() {
    return this.getDefinition()._getFromExtended(GrammarConstants.childrenKey)
  }

  protected get childrenAreTextBlob() {
    return this.getDefinition()._isBlobNodeType()
  }

  protected get isArrayElement() {
    return this.getDefinition()._hasFromExtended(GrammarConstants.uniqueFirstWord) ? false : !this.getDefinition().isSingle
  }

  get typedContent() {
    const cells = this._getParsedCells()

    // todo: probably a better way to do this, perhaps by defining a cellDelimiter at the node level
    // todo: this currently parse anything other than string types
    if (this.contentDelimiter) return this.getContent().split(this.contentDelimiter)

    if (cells.length === 2) return cells[1].getParsed()
    return this.getContent()
  }

  get typedTuple() {
    const key = this.getFirstWord()
    const { typedContent, contentKey, childrenKey } = this
    const hasChildren = this.length > 0
    const hasChildrenNoContent = typedContent === undefined && hasChildren
    const hasChildrenAndContent = typedContent !== undefined && hasChildren
    const shouldReturnValueAsObject = hasChildrenNoContent

    if (contentKey || childrenKey) {
      let obj: any = {}
      if (childrenKey) obj[childrenKey] = this.childrenToString()
      else obj = this.typedMap

      if (contentKey) {
        obj[contentKey] = typedContent
      }
      return [key, obj]
    }

    if (this.childrenAreTextBlob) return [key, this.childrenToString()]

    if (shouldReturnValueAsObject) return [key, this.typedMap]

    const shouldReturnValueAsContentPlusChildren = hasChildrenAndContent

    // If the node has a content and a subtree return it as a string, as
    // Javascript object values can't be both a leaf and a tree.
    if (shouldReturnValueAsContentPlusChildren) return [key, this.getContentWithChildren()]

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
    const def = this.getDefinition()
    const indent = this._getCompiledIndentation()
    const compiledLine = this._getCompiledLine()

    if (def.isTerminalNodeType()) return indent + compiledLine

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
    this._getParsedCells().forEach(cell => {
      const cellTypeId = cell.getCellTypeId()
      if (!cell.isCatchAll()) cells[cellTypeId] = cell.getParsed()
      else {
        if (!cells[cellTypeId]) cells[cellTypeId] = []
        cells[cellTypeId].push(cell.getParsed())
      }
    })
    return cells
  }
}

class BlobNode extends GrammarBackedNode {
  createParser() {
    return new TreeNode.Parser(BlobNode, {})
  }

  getErrors(): treeNotationTypes.TreeError[] {
    return []
  }
}

// todo: can we remove this? hard to extend.
class UnknownNodeTypeNode extends GrammarBackedNode {
  createParser() {
    return new TreeNode.Parser(UnknownNodeTypeNode, {})
  }

  getErrors(): treeNotationTypes.TreeError[] {
    return [new UnknownNodeTypeError(this)]
  }
}

/*
A cell contains a word but also the type information for that word.
*/
abstract class AbstractGrammarBackedCell<T> {
  constructor(node: GrammarBackedNode, index: treeNotationTypes.int, typeDef: cellTypeDefinitionNode, cellTypeId: string, isCatchAll: boolean, nodeTypeDef: AbstractGrammarDefinitionNode) {
    this._typeDef = typeDef
    this._node = node
    this._isCatchAll = isCatchAll
    this._index = index
    this._cellTypeId = cellTypeId
    this._nodeTypeDefinition = nodeTypeDef
  }

  getWord() {
    return this._node.getWord(this._index)
  }

  getDefinitionLineNumber() {
    return this._typeDef.getLineNumber()
  }

  getSQLiteType(): SQLiteTypes {
    return SQLiteTypes.text
  }

  private _node: GrammarBackedNode
  protected _index: treeNotationTypes.int
  private _typeDef: cellTypeDefinitionNode
  private _isCatchAll: boolean
  private _cellTypeId: string
  protected _nodeTypeDefinition: AbstractGrammarDefinitionNode

  getCellTypeId() {
    return this._cellTypeId
  }

  static parserFunctionName = ""

  getNode() {
    return this._node
  }

  getCellIndex() {
    return this._index
  }

  isCatchAll() {
    return this._isCatchAll
  }

  get min() {
    return this._getCellTypeDefinition().get(GrammarConstants.min) || "0"
  }

  get max() {
    return this._getCellTypeDefinition().get(GrammarConstants.max) || "100"
  }

  get placeholder() {
    return this._getCellTypeDefinition().get(GrammarConstants.examples) || ""
  }

  abstract getParsed(): T

  getHighlightScope(): string | undefined {
    const definition = this._getCellTypeDefinition()
    if (definition) return definition.getHighlightScope() // todo: why the undefined?
  }

  getAutoCompleteWords(partialWord: string = "") {
    const cellDef = this._getCellTypeDefinition()
    let words = cellDef ? cellDef._getAutocompleteWordOptions(<GrammarBackedNode>this.getNode().getRootNode()) : []

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
    const cellDef = this._getCellTypeDefinition()
    const enumOptions = cellDef._getFromExtended(GrammarConstants.enum)
    if (enumOptions) return TreeUtils.getRandomString(1, enumOptions.split(" "))

    return this._synthesizeCell(seed)
  }

  _getStumpEnumInput(crux: string): string {
    const cellDef = this._getCellTypeDefinition()
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

  _getCellTypeDefinition() {
    return this._typeDef
  }

  protected _getFullLine() {
    return this.getNode().getLine()
  }

  protected _getErrorContext() {
    return this._getFullLine().split(" ")[0] // todo: WordBreakSymbol
  }

  protected abstract _isValid(): boolean

  isValid(): boolean {
    const runTimeOptions = this.getNode().getRunTimeEnumOptions(this)
    const word = this.getWord()
    if (runTimeOptions) return runTimeOptions.includes(word)
    return this._getCellTypeDefinition().isValid(word, <GrammarBackedNode>this.getNode().getRootNode()) && this._isValid()
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
    return TreeUtils.getRandomString(1, "01".split(""))
  }

  getRegexString() {
    return "[01]"
  }

  getParsed() {
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
    return TreeUtils.randomUniformInt(parseInt(this.min), parseInt(this.max), seed).toString()
  }

  getRegexString() {
    return "\-?[0-9]+"
  }

  getSQLiteType() {
    return SQLiteTypes.integer
  }

  getParsed() {
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

  getSQLiteType() {
    return SQLiteTypes.float
  }

  static defaultHighlightScope = "constant.numeric.float"

  _synthesizeCell(seed: number) {
    return TreeUtils.randomUniformFloat(parseFloat(this.min), parseFloat(this.max), seed).toString()
  }

  getRegexString() {
    return "-?\d*(\.\d+)?"
  }

  getParsed() {
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

  getSQLiteType() {
    return SQLiteTypes.integer
  }

  static defaultHighlightScope = "constant.numeric"

  _synthesizeCell() {
    return TreeUtils.getRandomString(1, ["1", "true", "t", "yes", "0", "false", "f", "no"])
  }

  private _getOptions() {
    return Array.from(this._trues).concat(Array.from(this._falses))
  }

  getRegexString() {
    return "(?:" + this._getOptions().join("|") + ")"
  }

  getParsed() {
    const word = this.getWord()
    return this._trues.has(word.toLowerCase())
  }
}

class GrammarAnyCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return true
  }

  _synthesizeCell() {
    const examples = this._getCellTypeDefinition()._getFromExtended(GrammarConstants.examples)
    if (examples) return TreeUtils.getRandomString(1, examples.split(" "))
    return this._nodeTypeDefinition.getNodeTypeIdFromDefinition() + "-" + this.constructor.name
  }

  getRegexString() {
    return "[^ ]+"
  }

  getParsed() {
    return this.getWord()
  }
}

class GrammarKeywordCell extends GrammarAnyCell {
  static defaultHighlightScope = "keyword"

  _synthesizeCell() {
    return this._nodeTypeDefinition._getCruxIfAny()
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

  getParsed() {
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

  getParsed() {
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
    return this.getLineNumber() - 1
  }

  getLineNumber(): treeNotationTypes.positiveInt {
    return this.getNode()._getLineNumber() // todo: handle sourcemaps
  }

  isCursorOnWord(lineIndex: treeNotationTypes.positiveInt, characterIndex: treeNotationTypes.positiveInt) {
    return lineIndex === this.getLineIndex() && this._doesCharacterIndexFallOnWord(characterIndex)
  }

  private _doesCharacterIndexFallOnWord(characterIndex: treeNotationTypes.positiveInt) {
    return this.getCellIndex() === this.getNode().getWordIndexAtCharacterIndex(characterIndex)
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
    return this.getNode().getIndentation()
  }

  getCodeMirrorLineWidgetElement(onApplySuggestionCallBack = () => {}) {
    const suggestion = this.getSuggestionMessage()
    if (this.isMissingWordError()) return this._getCodeMirrorLineWidgetElementCellTypeHints()
    if (suggestion) return this._getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion)
    return this._getCodeMirrorLineWidgetElementWithoutSuggestion()
  }

  getNodeTypeId(): string {
    return (<GrammarBackedNode>this.getNode()).getDefinition().getNodeTypeIdFromDefinition()
  }

  private _getCodeMirrorLineWidgetElementCellTypeHints() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + (<GrammarBackedNode>this.getNode()).getDefinition().getLineHints()))
    el.className = "LintCellTypeHints"
    return el
  }

  private _getCodeMirrorLineWidgetElementWithoutSuggestion() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + this.getMessage()))
    el.className = "LintError"
    return el
  }

  private _getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack: Function, suggestion: string) {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + `${this.getErrorTypeName()}. Suggestion: ${suggestion}`))
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
    return this.getNode()
      .getHandGrammarProgram()
      .getExtensionName()
  }

  getNode() {
    return this._node
  }

  getErrorTypeName() {
    return this.constructor.name.replace("Error", "")
  }

  getCellIndex() {
    return 0
  }

  toObject() {
    return {
      type: this.getErrorTypeName(),
      line: this.getLineNumber(),
      cell: this.getCellIndex(),
      suggestion: this.getSuggestionMessage(),
      path: this.getNode().getFirstWordPath(),
      message: this.getMessage()
    }
  }

  hasSuggestion() {
    return this.getSuggestionMessage() !== ""
  }

  getSuggestionMessage() {
    return ""
  }

  toString() {
    return this.getMessage()
  }

  applySuggestion() {}

  getMessage(): string {
    return `${this.getErrorTypeName()} at line ${this.getLineNumber()} cell ${this.getCellIndex()}.`
  }
}

abstract class AbstractCellError extends AbstractTreeError {
  constructor(cell: AbstractGrammarBackedCell<any>) {
    super(cell.getNode())
    this._cell = cell
  }

  getCell() {
    return this._cell
  }

  getCellIndex() {
    return this._cell.getCellIndex()
  }

  protected _getWordSuggestion() {
    return TreeUtils.didYouMean(
      this.getCell().getWord(),
      this.getCell()
        .getAutoCompleteWords()
        .map(option => option.text)
    )
  }

  private _cell: AbstractGrammarBackedCell<any>
}

class UnknownNodeTypeError extends AbstractTreeError {
  getMessage(): string {
    const node = this.getNode()
    const parentNode = node.getParent()
    const options = parentNode._getParser().getFirstWordOptions()
    return super.getMessage() + ` Invalid nodeType "${node.getFirstWord()}". Valid nodeTypes are: ${TreeUtils._listToEnglishText(options, 7)}.`
  }

  protected _getWordSuggestion() {
    const node = this.getNode()
    const parentNode = node.getParent()
    return TreeUtils.didYouMean(node.getFirstWord(), (<GrammarBackedNode>parentNode).getAutocompleteResults("", 0).map(option => option.text))
  }

  getSuggestionMessage() {
    const suggestion = this._getWordSuggestion()
    const node = this.getNode()

    if (suggestion) return `Change "${node.getFirstWord()}" to "${suggestion}"`

    return ""
  }

  applySuggestion() {
    const suggestion = this._getWordSuggestion()
    if (suggestion) this.getNode().setWord(this.getCellIndex(), suggestion)
    return this
  }
}

class BlankLineError extends UnknownNodeTypeError {
  getMessage(): string {
    return super.getMessage() + ` Line: "${this.getNode().getLine()}". Blank lines are errors.`
  }

  // convenience method
  isBlankLineError() {
    return true
  }

  getSuggestionMessage() {
    return `Delete line ${this.getLineNumber()}`
  }

  applySuggestion() {
    this.getNode().destroy()
    return this
  }
}

class MissingRequiredNodeTypeError extends AbstractTreeError {
  constructor(node: GrammarBackedNode, missingNodeTypeId: treeNotationTypes.firstWord) {
    super(node)
    this._missingNodeTypeId = missingNodeTypeId
  }

  private _missingNodeTypeId: treeNotationTypes.nodeTypeId

  getMessage(): string {
    return super.getMessage() + ` A "${this._missingNodeTypeId}" is required.`
  }
}

class NodeTypeUsedMultipleTimesError extends AbstractTreeError {
  getMessage(): string {
    return super.getMessage() + ` Multiple "${this.getNode().getFirstWord()}" found.`
  }

  getSuggestionMessage() {
    return `Delete line ${this.getLineNumber()}`
  }

  applySuggestion() {
    return this.getNode().destroy()
  }
}

class UnknownCellTypeError extends AbstractCellError {
  getMessage(): string {
    return super.getMessage() + ` No cellType "${this.getCell().getCellTypeId()}" found. Language grammar for "${this.getExtension()}" may need to be fixed.`
  }
}

class InvalidWordError extends AbstractCellError {
  getMessage(): string {
    return super.getMessage() + ` "${this.getCell().getWord()}" does not fit in cellType "${this.getCell().getCellTypeId()}".`
  }

  getSuggestionMessage() {
    const suggestion = this._getWordSuggestion()

    if (suggestion) return `Change "${this.getCell().getWord()}" to "${suggestion}"`

    return ""
  }

  applySuggestion() {
    const suggestion = this._getWordSuggestion()
    if (suggestion) this.getNode().setWord(this.getCellIndex(), suggestion)
    return this
  }
}

class ExtraWordError extends AbstractCellError {
  getMessage(): string {
    return super.getMessage() + ` Extra word "${this.getCell().getWord()}" in ${this.getNodeTypeId()}.`
  }

  getSuggestionMessage() {
    return `Delete word "${this.getCell().getWord()}" at cell ${this.getCellIndex()}`
  }

  applySuggestion() {
    return this.getNode().deleteWordAt(this.getCellIndex())
  }
}

class MissingWordError extends AbstractCellError {
  // todo: autocomplete suggestion

  getMessage(): string {
    return super.getMessage() + ` Missing word for cell "${this.getCell().getCellTypeId()}".`
  }

  isMissingWordError() {
    return true
  }
}

// todo: add standard types, enum types, from disk types

abstract class AbstractGrammarWordTestNode extends TreeNode {
  abstract isValid(str: string, programRootNode?: GrammarBackedNode): boolean
}

class GrammarRegexTestNode extends AbstractGrammarWordTestNode {
  private _regex: RegExp

  isValid(str: string) {
    if (!this._regex) this._regex = new RegExp("^" + this.getContent() + "$")
    return !!str.match(this._regex)
  }
}

class GrammarReservedWordsTestNode extends AbstractGrammarWordTestNode {
  private _set: Set<string>

  isValid(str: string) {
    if (!this._set) this._set = new Set(this.getContent().split(" "))
    return !this._set.has(str)
  }
}

// todo: remove in favor of custom word type constructors
class EnumFromCellTypesTestNode extends AbstractGrammarWordTestNode {
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
    programRootNode
      .getAllTypedWords()
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

class GrammarEnumTestNode extends AbstractGrammarWordTestNode {
  private _map: treeNotationTypes.stringMap

  isValid(str: string) {
    // enum c c++ java
    return !!this.getOptions()[str]
  }

  getOptions() {
    if (!this._map) this._map = TreeUtils.arrayToMap(this.getWordsFrom(1))
    return this._map
  }
}

class cellTypeDefinitionNode extends AbstractExtendibleTreeNode {
  createParser() {
    const types: treeNotationTypes.stringMap = {}
    types[GrammarConstants.regex] = GrammarRegexTestNode
    types[GrammarConstants.reservedWords] = GrammarReservedWordsTestNode
    types[GrammarConstants.enumFromCellTypes] = EnumFromCellTypesTestNode
    types[GrammarConstants.enum] = GrammarEnumTestNode
    types[GrammarConstants.highlightScope] = TreeNode
    types[GrammarConstants.todoComment] = TreeNode
    types[GrammarConstants.examples] = TreeNode
    types[GrammarConstants.min] = TreeNode
    types[GrammarConstants.max] = TreeNode
    types[GrammarConstants.description] = TreeNode
    types[GrammarConstants.extends] = TreeNode
    return new TreeNode.Parser(undefined, types)
  }

  _getId() {
    return this.getWord(0)
  }

  _getIdToNodeMap() {
    return (<HandGrammarProgram>this.getParent()).getCellTypeDefinitions()
  }

  getGetter(wordIndex: number) {
    const wordToNativeJavascriptTypeParser = this.getCellConstructor().parserFunctionName
    return `get ${this.getCellTypeId()}() {
      return ${wordToNativeJavascriptTypeParser ? wordToNativeJavascriptTypeParser + `(this.getWord(${wordIndex}))` : `this.getWord(${wordIndex})`}
    }`
  }

  getCatchAllGetter(wordIndex: number) {
    const wordToNativeJavascriptTypeParser = this.getCellConstructor().parserFunctionName
    return `get ${this.getCellTypeId()}() {
      return ${wordToNativeJavascriptTypeParser ? `this.getWordsFrom(${wordIndex}).map(val => ${wordToNativeJavascriptTypeParser}(val))` : `this.getWordsFrom(${wordIndex})`}
    }`
  }

  // `this.getWordsFrom(${requireds.length + 1})`

  // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
  getCellConstructor(): typeof AbstractGrammarBackedCell {
    return this._getPreludeKind() || GrammarAnyCell
  }

  _getPreludeKind() {
    return PreludeKinds[this.getWord(0)] || PreludeKinds[this._getExtendedCellTypeId()]
  }

  _getPreludeKindId() {
    if (PreludeKinds[this.getWord(0)]) return this.getWord(0)
    else if (PreludeKinds[this._getExtendedCellTypeId()]) return this._getExtendedCellTypeId()
    return PreludeCellTypeIds.anyCell
  }

  private _getExtendedCellTypeId() {
    const arr = this._getAncestorsArray()
    return arr[arr.length - 1]._getId()
  }

  getHighlightScope(): string | undefined {
    const hs = this._getFromExtended(GrammarConstants.highlightScope)
    if (hs) return hs
    const preludeKind = this._getPreludeKind()
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
    return node ? Object.keys((<EnumFromCellTypesTestNode>node.getNode(GrammarConstants.enumFromCellTypes))._getEnumFromCellTypes(program)) : undefined
  }

  _getAutocompleteWordOptions(program: GrammarBackedNode): string[] {
    return this._getEnumOptions() || this._getEnumFromCellTypeOptions(program) || []
  }

  getRegexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return this._getFromExtended(GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*")
  }

  isValid(str: string, programRootNode: GrammarBackedNode) {
    return this._getChildrenByNodeConstructorInExtended(AbstractGrammarWordTestNode).every(node => (<AbstractGrammarWordTestNode>node).isValid(str, programRootNode))
  }

  getCellTypeId(): treeNotationTypes.cellTypeId {
    return this.getWord(0)
  }

  public static types: any
}

abstract class AbstractCellParser {
  constructor(definition: AbstractGrammarDefinitionNode) {
    this._definition = definition
  }

  getCatchAllCellTypeId(): treeNotationTypes.cellTypeId | undefined {
    return this._definition._getFromExtended(GrammarConstants.catchAllCellType)
  }

  // todo: improve layout (use bold?)
  getLineHints(): string {
    const catchAllCellTypeId = this.getCatchAllCellTypeId()
    const nodeTypeId = this._definition._getCruxIfAny() || this._definition._getId() // todo: cleanup
    return `${nodeTypeId}: ${this.getRequiredCellTypeIds().join(" ")}${catchAllCellTypeId ? ` ${catchAllCellTypeId}...` : ""}`
  }

  protected _definition: AbstractGrammarDefinitionNode

  getRequiredCellTypeIds(): treeNotationTypes.cellTypeId[] {
    const parameters = this._definition._getFromExtended(GrammarConstants.cells)
    return parameters ? parameters.split(" ") : []
  }

  protected _getCellTypeId(cellIndex: treeNotationTypes.int, requiredCellTypeIds: string[], totalWordCount: treeNotationTypes.int) {
    return requiredCellTypeIds[cellIndex]
  }

  protected _isCatchAllCell(cellIndex: treeNotationTypes.int, numberOfRequiredCells: treeNotationTypes.int, totalWordCount: treeNotationTypes.int) {
    return cellIndex >= numberOfRequiredCells
  }

  getCellArray(node: GrammarBackedNode = undefined): AbstractGrammarBackedCell<any>[] {
    const wordCount = node ? node.getWords().length : 0
    const def = this._definition
    const grammarProgram = def.getLanguageDefinitionProgram()
    const requiredCellTypeIds = this.getRequiredCellTypeIds()
    const numberOfRequiredCells = requiredCellTypeIds.length

    const actualWordCountOrRequiredCellCount = Math.max(wordCount, numberOfRequiredCells)
    const cells: AbstractGrammarBackedCell<any>[] = []

    // A for loop instead of map because "numberOfCellsToFill" can be longer than words.length
    for (let cellIndex = 0; cellIndex < actualWordCountOrRequiredCellCount; cellIndex++) {
      const isCatchAll = this._isCatchAllCell(cellIndex, numberOfRequiredCells, wordCount)

      let cellTypeId = isCatchAll ? this.getCatchAllCellTypeId() : this._getCellTypeId(cellIndex, requiredCellTypeIds, wordCount)

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
    const program = <GrammarBackedNode>(node ? node.getRootNode() : undefined)
    const grammarProgram = def.getLanguageDefinitionProgram()
    const words = node ? node.getWords() : []
    const requiredCellTypeDefs = this.getRequiredCellTypeIds().map(cellTypeId => grammarProgram.getCellTypeDefinitionById(cellTypeId))
    const catchAllCellTypeId = this.getCatchAllCellTypeId()
    const catchAllCellTypeDef = catchAllCellTypeId && grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId)

    words.forEach((word, wordIndex) => {
      let cellConstructor: any
      for (let index = 0; index < requiredCellTypeDefs.length; index++) {
        const cellTypeDefinition = requiredCellTypeDefs[index]
        if (cellTypeDefinition.isValid(word, program)) {
          // todo: cleanup cellIndex/wordIndex stuff
          cellConstructor = cellTypeDefinition.getCellConstructor()
          cells.push(new cellConstructor(node, wordIndex, cellTypeDefinition, cellTypeDefinition._getId(), false, def))
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
      cells.push(new cellConstructor(node, wordCount + index, cellTypeDef, cellTypeDef._getId(), false, def))
    })

    return cells
  }
}

class GrammarExampleNode extends TreeNode {}

class GrammarCompilerNode extends TreeNode {
  createParser() {
    const types = [
      GrammarConstantsCompiler.stringTemplate,
      GrammarConstantsCompiler.indentCharacter,
      GrammarConstantsCompiler.catchAllCellDelimiter,
      GrammarConstantsCompiler.joinChildrenWith,
      GrammarConstantsCompiler.openChildren,
      GrammarConstantsCompiler.closeChildren
    ]
    const map: treeNotationTypes.firstWordToNodeConstructorMap = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    return new TreeNode.Parser(undefined, map)
  }
}

abstract class GrammarNodeTypeConstant extends TreeNode {
  getGetter() {
    return `get ${this.getIdentifier()}() { return ${this.getConstantValueAsJsText()} }`
  }

  getIdentifier() {
    return this.getWord(1)
  }

  getConstantValueAsJsText() {
    const words = this.getWordsFrom(2)
    return words.length > 1 ? `[${words.join(",")}]` : words[0]
  }

  getConstantValue() {
    return JSON.parse(this.getConstantValueAsJsText())
  }
}

class GrammarNodeTypeConstantInt extends GrammarNodeTypeConstant {}
class GrammarNodeTypeConstantString extends GrammarNodeTypeConstant {
  getConstantValueAsJsText() {
    return "`" + TreeUtils.escapeBackTicks(this.getConstantValue()) + "`"
  }

  getConstantValue() {
    return this.length ? this.childrenToString() : this.getWordsFrom(2).join(" ")
  }
}
class GrammarNodeTypeConstantFloat extends GrammarNodeTypeConstant {}
class GrammarNodeTypeConstantBoolean extends GrammarNodeTypeConstant {}

abstract class AbstractGrammarDefinitionNode extends AbstractExtendibleTreeNode {
  createParser() {
    // todo: some of these should just be on nonRootNodes
    const types = [
      GrammarConstants.frequency,
      GrammarConstants.inScope,
      GrammarConstants.cells,
      GrammarConstants.extends,
      GrammarConstants.description,
      GrammarConstants.catchAllNodeType,
      GrammarConstants.catchAllCellType,
      GrammarConstants.cellParser,
      GrammarConstants.extensions,
      GrammarConstants.version,
      GrammarConstants.tags,
      GrammarConstants.crux,
      GrammarConstants.cruxFromId,
      GrammarConstants.contentDelimiter,
      GrammarConstants.contentKey,
      GrammarConstants.childrenKey,
      GrammarConstants.uniqueFirstWord,
      GrammarConstants.pattern,
      GrammarConstants.baseNodeType,
      GrammarConstants.required,
      GrammarConstants.root,
      GrammarConstants._extendsJsClass,
      GrammarConstants._rootNodeJsHeader,
      GrammarConstants.javascript,
      GrammarConstants.compilesTo,
      GrammarConstants.javascript,
      GrammarConstants.single,
      GrammarConstants.todoComment
    ]

    const map: treeNotationTypes.firstWordToNodeConstructorMap = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    map[GrammarConstantsConstantTypes.boolean] = GrammarNodeTypeConstantBoolean
    map[GrammarConstantsConstantTypes.int] = GrammarNodeTypeConstantInt
    map[GrammarConstantsConstantTypes.string] = GrammarNodeTypeConstantString
    map[GrammarConstantsConstantTypes.float] = GrammarNodeTypeConstantFloat
    map[GrammarConstants.compilerNodeType] = GrammarCompilerNode
    map[GrammarConstants.example] = GrammarExampleNode
    return new TreeNode.Parser(undefined, map)
  }

  toTypeScriptInterface(used = new Set<string>()) {
    let childrenInterfaces: string[] = []
    let properties: string[] = []
    const inScope = this.getFirstWordMapWithDefinitions()
    const thisId = this._getId()

    used.add(thisId)
    Object.keys(inScope).forEach(key => {
      const def = inScope[key]
      const map = def.getFirstWordMapWithDefinitions()
      const id = def._getId()
      const optionalTag = def.isRequired() ? "" : "?"
      const escapedKey = key.match(/\?/) ? `"${key}"` : key
      const description = def.getDescription()
      if (Object.keys(map).length && !used.has(id)) {
        childrenInterfaces.push(def.toTypeScriptInterface(used))
        properties.push(` ${escapedKey}${optionalTag}: ${id}`)
      } else properties.push(` ${escapedKey}${optionalTag}: any${description ? " // " + description : ""}`)
    })

    properties.sort()
    const description = this.getDescription()

    const myInterface = ""
    return `${childrenInterfaces.join("\n")}
${description ? "// " + description : ""}
interface ${thisId} {
${properties.join("\n")}
}`.trim()
  }

  getTableNameIfAny() {
    return this.getFrom(`${GrammarConstantsConstantTypes.string} ${GrammarConstantsMisc.tableName}`)
  }

  getSQLiteTableColumns() {
    return this._getConcreteNonErrorInScopeNodeDefinitions(this._getInScopeNodeTypeIds()).map(def => {
      const firstNonKeywordCellType = def.getCellParser().getCellArray()[1]

      let type = firstNonKeywordCellType ? firstNonKeywordCellType.getSQLiteType() : SQLiteTypes.text

      // For now if it can have children serialize it as text in SQLite
      if (!def.isTerminalNodeType()) type = SQLiteTypes.text

      return {
        columnName: def._getIdWithoutSuffix(), // todo: we want the crux instead I think.
        type
      }
    })
  }

  toSQLiteTableSchema() {
    const columns = this.getSQLiteTableColumns().map(columnDef => `${columnDef.columnName} ${columnDef.type}`)
    return `create table ${this.getTableNameIfAny() || this._getId()} (
 id TEXT NOT NULL PRIMARY KEY,
 ${columns.join(",\n ")}
);`
  }

  _getId() {
    return this.getWord(0)
  }

  get id() {
    return this._getId()
  }

  _getIdWithoutSuffix(): string {
    return this._getId().replace(HandGrammarProgram.nodeTypeSuffixRegex, "")
  }

  getConstantsObject() {
    const obj = this._getUniqueConstantNodes()
    Object.keys(obj).forEach(key => {
      obj[key] = obj[key].getConstantValue()
    })
    return obj
  }

  _getUniqueConstantNodes(extended = true) {
    const obj: { [key: string]: GrammarNodeTypeConstant } = {}
    const items = extended ? this._getChildrenByNodeConstructorInExtended(GrammarNodeTypeConstant) : this.getChildrenByNodeConstructor(GrammarNodeTypeConstant)
    items.reverse() // Last definition wins.
    items.forEach((node: GrammarNodeTypeConstant) => {
      obj[node.getIdentifier()] = node
    })
    return obj
  }

  getExamples(): GrammarExampleNode[] {
    return this._getChildrenByNodeConstructorInExtended(GrammarExampleNode)
  }

  getNodeTypeIdFromDefinition(): treeNotationTypes.nodeTypeId {
    return this.getWord(0)
  }

  // todo: remove? just reused nodeTypeId
  _getGeneratedClassName() {
    return this.getNodeTypeIdFromDefinition()
  }

  _hasValidNodeTypeId() {
    return !!this._getGeneratedClassName()
  }

  _isAbstract() {
    return this.id.startsWith(GrammarConstants.abstractNodeTypePrefix)
  }

  _getConcreteDescendantDefinitions() {
    const defs = this._getProgramNodeTypeDefinitionCache()
    const id = this._getId()
    return Object.values(defs).filter(def => {
      return def._doesExtend(id) && !def._isAbstract()
    })
  }

  _getCruxIfAny(): string {
    return this.get(GrammarConstants.crux) || (this._hasFromExtended(GrammarConstants.cruxFromId) ? this._getIdWithoutSuffix() : undefined)
  }

  _getRegexMatch() {
    return this.get(GrammarConstants.pattern)
  }

  _getFirstCellEnumOptions() {
    const firstCellDef = this._getMyCellTypeDefs()[0]
    return firstCellDef ? firstCellDef._getEnumOptions() : undefined
  }

  getLanguageDefinitionProgram(): HandGrammarProgram {
    return <HandGrammarProgram>this.getParent()
  }

  protected _getCustomJavascriptMethods(): treeNotationTypes.javascriptCode {
    const hasJsCode = this.has(GrammarConstants.javascript)
    return hasJsCode ? this.getNode(GrammarConstants.javascript).childrenToString() : ""
  }

  private _cache_firstWordToNodeDefMap: { [firstWord: string]: nodeTypeDefinitionNode }

  getFirstWordMapWithDefinitions() {
    if (!this._cache_firstWordToNodeDefMap) this._cache_firstWordToNodeDefMap = this._createParserInfo(this._getInScopeNodeTypeIds()).firstWordMap
    return this._cache_firstWordToNodeDefMap
  }

  // todo: remove
  getRunTimeFirstWordsInScope(): treeNotationTypes.nodeTypeId[] {
    return this._getParser().getFirstWordOptions()
  }

  private _getMyCellTypeDefs() {
    const requiredCells = this.get(GrammarConstants.cells)
    if (!requiredCells) return []
    const grammarProgram = this.getLanguageDefinitionProgram()
    return requiredCells.split(" ").map(cellTypeId => {
      const cellTypeDef = grammarProgram.getCellTypeDefinitionById(cellTypeId)
      if (!cellTypeDef) throw new Error(`No cellType "${cellTypeId}" found`)
      return cellTypeDef
    })
  }

  // todo: what happens when you have a cell getter and constant with same name?
  private _getCellGettersAndNodeTypeConstants() {
    // todo: add cellType parsings
    const grammarProgram = this.getLanguageDefinitionProgram()
    const getters = this._getMyCellTypeDefs().map((cellTypeDef, index) => cellTypeDef.getGetter(index))

    const catchAllCellTypeId = this.get(GrammarConstants.catchAllCellType)
    if (catchAllCellTypeId) getters.push(grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId).getCatchAllGetter(getters.length))

    // Constants
    Object.values(this._getUniqueConstantNodes(false)).forEach(node => {
      getters.push(node.getGetter())
    })

    return getters.join("\n")
  }

  protected _createParserInfo(nodeTypeIdsInScope: treeNotationTypes.nodeTypeId[]): parserInfo {
    const result: parserInfo = {
      firstWordMap: {},
      regexTests: []
    }

    if (!nodeTypeIdsInScope.length) return result

    const allProgramNodeTypeDefinitionsMap = this._getProgramNodeTypeDefinitionCache()
    Object.keys(allProgramNodeTypeDefinitionsMap)
      .filter(nodeTypeId => allProgramNodeTypeDefinitionsMap[nodeTypeId].isOrExtendsANodeTypeInScope(nodeTypeIdsInScope))
      .filter(nodeTypeId => !allProgramNodeTypeDefinitionsMap[nodeTypeId]._isAbstract())
      .forEach(nodeTypeId => {
        const def = allProgramNodeTypeDefinitionsMap[nodeTypeId]
        const regex = def._getRegexMatch()
        const crux = def._getCruxIfAny()
        const enumOptions = def._getFirstCellEnumOptions()
        if (regex) result.regexTests.push({ regex: regex, nodeConstructor: def.getNodeTypeIdFromDefinition() })
        else if (crux) result.firstWordMap[crux] = def
        else if (enumOptions) {
          enumOptions.forEach(option => {
            result.firstWordMap[option] = def
          })
        }
      })
    return result
  }

  getTopNodeTypeDefinitions(): nodeTypeDefinitionNode[] {
    const arr = Object.values(this.getFirstWordMapWithDefinitions())
    arr.sort(TreeUtils.makeSortByFn((definition: nodeTypeDefinitionNode) => definition.getFrequency()))
    arr.reverse()
    return arr
  }

  _getMyInScopeNodeTypeIds(): treeNotationTypes.nodeTypeId[] {
    const nodeTypesNode = this.getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }

  protected _getInScopeNodeTypeIds(): treeNotationTypes.nodeTypeId[] {
    // todo: allow multiple of these if we allow mixins?
    const ids = this._getMyInScopeNodeTypeIds()
    const parentDef = this._getExtendedParent()
    return parentDef ? ids.concat((<AbstractGrammarDefinitionNode>parentDef)._getInScopeNodeTypeIds()) : ids
  }

  // Should only one of these node types be present in the parent node?
  get isSingle() {
    return this._hasFromExtended(GrammarConstants.single) && this._getFromExtended(GrammarConstants.single) !== "false"
  }

  isRequired(): boolean {
    return this._hasFromExtended(GrammarConstants.required)
  }

  getNodeTypeDefinitionByNodeTypeId(nodeTypeId: treeNotationTypes.nodeTypeId): AbstractGrammarDefinitionNode {
    // todo: return catch all?
    const def = this._getProgramNodeTypeDefinitionCache()[nodeTypeId]
    if (def) return def
    // todo: cleanup
    this.getLanguageDefinitionProgram()._addDefaultCatchAllBlobNode()
    return this._getProgramNodeTypeDefinitionCache()[nodeTypeId]
  }

  isDefined(nodeTypeId: string) {
    return !!this._getProgramNodeTypeDefinitionCache()[nodeTypeId]
  }

  _getIdToNodeMap() {
    return this._getProgramNodeTypeDefinitionCache()
  }

  private _cache_isRoot: boolean

  private _amIRoot(): boolean {
    if (this._cache_isRoot === undefined) this._cache_isRoot = this._getLanguageRootNode() === this
    return this._cache_isRoot
  }

  private _getLanguageRootNode() {
    return (<HandGrammarProgram>this.getParent()).getRootNodeTypeDefinitionNode()
  }

  private _isErrorNodeType() {
    return this.get(GrammarConstants.baseNodeType) === GrammarConstants.errorNode
  }

  _isBlobNodeType() {
    // Do not check extended classes. Only do once.
    return this._getFromExtended(GrammarConstants.baseNodeType) === GrammarConstants.blobNode
  }

  private _getErrorMethodToJavascript(): treeNotationTypes.javascriptCode {
    if (this._isBlobNodeType()) return "getErrors() { return [] }" // Skips parsing child nodes for perf gains.
    if (this._isErrorNodeType()) return "getErrors() { return this._getErrorNodeErrors() }"
    return ""
  }

  private _getParserToJavascript(): treeNotationTypes.javascriptCode {
    if (this._isBlobNodeType())
      // todo: do we need this?
      return "createParser() { return new jtree.TreeNode.Parser(this._getBlobNodeCatchAllNodeType())}"
    const parserInfo = this._createParserInfo(this._getMyInScopeNodeTypeIds())
    const myFirstWordMap = parserInfo.firstWordMap
    const regexRules = parserInfo.regexTests

    // todo: use constants in first word maps?
    // todo: cache the super extending?
    const firstWords = Object.keys(myFirstWordMap)
    const hasFirstWords = firstWords.length
    const catchAllConstructor = this._getCatchAllNodeConstructorToJavascript()
    if (!hasFirstWords && !catchAllConstructor && !regexRules.length) return ""

    const firstWordsStr = hasFirstWords
      ? `Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {` + firstWords.map(firstWord => `"${firstWord}" : ${myFirstWordMap[firstWord].getNodeTypeIdFromDefinition()}`).join(",\n") + "})"
      : "undefined"

    const regexStr = regexRules.length
      ? `[${regexRules
          .map(rule => {
            return `{regex: /${rule.regex}/, nodeConstructor: ${rule.nodeConstructor}}`
          })
          .join(",")}]`
      : "undefined"

    const catchAllStr = catchAllConstructor ? catchAllConstructor : this._amIRoot() ? `this._getBlobNodeCatchAllNodeType()` : "undefined"

    return `createParser() {
  return new jtree.TreeNode.Parser(${catchAllStr}, ${firstWordsStr}, ${regexStr})
  }`
  }

  private _getCatchAllNodeConstructorToJavascript(): treeNotationTypes.javascriptCode {
    if (this._isBlobNodeType()) return "this._getBlobNodeCatchAllNodeType()"
    const nodeTypeId = this.get(GrammarConstants.catchAllNodeType)
    if (!nodeTypeId) return ""
    const nodeDef = this.getNodeTypeDefinitionByNodeTypeId(nodeTypeId)
    if (!nodeDef) throw new Error(`No definition found for nodeType id "${nodeTypeId}"`)
    return nodeDef._getGeneratedClassName()
  }

  _nodeDefToJavascriptClass(): treeNotationTypes.javascriptCode {
    const components = [this._getParserToJavascript(), this._getErrorMethodToJavascript(), this._getCellGettersAndNodeTypeConstants(), this._getCustomJavascriptMethods()].filter(identity => identity)

    if (this._amIRoot()) {
      components.push(`static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(\`${TreeUtils.escapeBackTicks(
        this.getParent()
          .toString()
          .replace(/\\/g, "\\\\")
      )}\`)
        getHandGrammarProgram() {
          return this.constructor.cachedHandGrammarProgramRoot
      }`)

      const nodeTypeMap = this.getLanguageDefinitionProgram()
        .getValidConcreteAndAbstractNodeTypeDefinitions()
        .map(def => {
          const id = def.getNodeTypeIdFromDefinition()
          return `"${id}": ${id}`
        })
        .join(",\n")

      components.push(`static getNodeTypeMap() { return {${nodeTypeMap} }}`)
    }

    return `class ${this._getGeneratedClassName()} extends ${this._getExtendsClassName()} {
      ${components.join("\n")}
    }`
  }

  private _getExtendsClassName() {
    // todo: this is hopefully a temporary line in place for now for the case where you want your base class to extend something other than another treeclass
    const hardCodedExtend = this.get(GrammarConstants._extendsJsClass)
    if (hardCodedExtend) return hardCodedExtend

    const extendedDef = <AbstractGrammarDefinitionNode>this._getExtendedParent()
    return extendedDef ? extendedDef._getGeneratedClassName() : "jtree.GrammarBackedNode"
  }

  _getCompilerObject(): treeNotationTypes.stringMap {
    let obj: { [key: string]: string } = {}
    const items = this._getChildrenByNodeConstructorInExtended(GrammarCompilerNode)
    items.reverse() // Last definition wins.
    items.forEach((node: GrammarCompilerNode) => {
      obj = Object.assign(obj, node.toObject()) // todo: what about multiline strings?
    })
    return obj
  }

  // todo: improve layout (use bold?)
  getLineHints(): string {
    return this.getCellParser().getLineHints()
  }

  isOrExtendsANodeTypeInScope(firstWordsInScope: string[]): boolean {
    const chain = this._getNodeTypeInheritanceSet()
    return firstWordsInScope.some(firstWord => chain.has(firstWord))
  }

  isTerminalNodeType() {
    return !this._getFromExtended(GrammarConstants.inScope) && !this._getFromExtended(GrammarConstants.catchAllNodeType)
  }

  private _getSublimeMatchLine() {
    const regexMatch = this._getRegexMatch()
    if (regexMatch) return `'${regexMatch}'`
    const cruxMatch = this._getCruxIfAny()
    if (cruxMatch) return `'^ *${TreeUtils.escapeRegExp(cruxMatch)}(?: |$)'`
    const enumOptions = this._getFirstCellEnumOptions()
    if (enumOptions) return `'^ *(${TreeUtils.escapeRegExp(enumOptions.join("|"))})(?: |$)'`
  }

  // todo: refactor. move some parts to cellParser?
  _toSublimeMatchBlock() {
    const defaultHighlightScope = "source"
    const program = this.getLanguageDefinitionProgram()
    const cellParser = this.getCellParser()
    const requiredCellTypeIds = cellParser.getRequiredCellTypeIds()
    const catchAllCellTypeId = cellParser.getCatchAllCellTypeId()
    const firstCellTypeDef = program.getCellTypeDefinitionById(requiredCellTypeIds[0])
    const firstWordHighlightScope = (firstCellTypeDef ? firstCellTypeDef.getHighlightScope() : defaultHighlightScope) + "." + this.getNodeTypeIdFromDefinition()
    const topHalf = ` '${this.getNodeTypeIdFromDefinition()}':
  - match: ${this._getSublimeMatchLine()}
    scope: ${firstWordHighlightScope}`
    if (catchAllCellTypeId) requiredCellTypeIds.push(catchAllCellTypeId)
    if (!requiredCellTypeIds.length) return topHalf
    const captures = requiredCellTypeIds
      .map((cellTypeId, index) => {
        const cellTypeDefinition = program.getCellTypeDefinitionById(cellTypeId) // todo: cleanup
        if (!cellTypeDefinition) throw new Error(`No ${GrammarConstants.cellType} ${cellTypeId} found`) // todo: standardize error/capture error at grammar time
        return `        ${index + 1}: ${(cellTypeDefinition.getHighlightScope() || defaultHighlightScope) + "." + cellTypeDefinition.getCellTypeId()}`
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

  private _cache_nodeTypeInheritanceSet: Set<treeNotationTypes.nodeTypeId>
  private _cache_ancestorNodeTypeIdsArray: treeNotationTypes.nodeTypeId[]

  _getNodeTypeInheritanceSet() {
    if (!this._cache_nodeTypeInheritanceSet) this._cache_nodeTypeInheritanceSet = new Set(this.getAncestorNodeTypeIdsArray())
    return this._cache_nodeTypeInheritanceSet
  }

  getAncestorNodeTypeIdsArray(): treeNotationTypes.nodeTypeId[] {
    if (!this._cache_ancestorNodeTypeIdsArray) {
      this._cache_ancestorNodeTypeIdsArray = this._getAncestorsArray().map(def => (<AbstractGrammarDefinitionNode>def).getNodeTypeIdFromDefinition())
      this._cache_ancestorNodeTypeIdsArray.reverse()
    }
    return this._cache_ancestorNodeTypeIdsArray
  }

  protected _getProgramNodeTypeDefinitionCache(): { [nodeTypeId: string]: nodeTypeDefinitionNode } {
    return this.getLanguageDefinitionProgram()._getProgramNodeTypeDefinitionCache()
  }

  getDescription(): string {
    return this._getFromExtended(GrammarConstants.description) || ""
  }

  getFrequency() {
    const val = this._getFromExtended(GrammarConstants.frequency)
    return val ? parseFloat(val) : 0
  }

  private _getExtendedNodeTypeId(): treeNotationTypes.nodeTypeId {
    const ancestorIds = this.getAncestorNodeTypeIdsArray()
    if (ancestorIds.length > 1) return ancestorIds[ancestorIds.length - 2]
  }

  protected _toStumpString() {
    const crux = this._getCruxIfAny()
    const cellArray = this.getCellParser()
      .getCellArray()
      .filter((item, index) => index) // for now this only works for keyword langs
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
    return this._getConcreteNonErrorInScopeNodeDefinitions(this._getInScopeNodeTypeIds())
      .map(def => def._toStumpString())
      .filter(identity => identity)
      .join(nodeBreakSymbol)
  }

  private _generateSimulatedLine(seed: number): string {
    // todo: generate simulated data from catch all
    const crux = this._getCruxIfAny()
    return this.getCellParser()
      .getCellArray()
      .map((cell, index) => (!index && crux ? crux : cell.synthesizeCell(seed)))
      .join(" ")
  }

  private _shouldSynthesize(def: AbstractGrammarDefinitionNode, nodeTypeChain: string[]) {
    if (def._isErrorNodeType() || def._isAbstract()) return false
    if (nodeTypeChain.includes(def._getId())) return false
    const tags = def.get(GrammarConstants.tags)
    if (tags && tags.includes(GrammarConstantsMisc.doNotSynthesize)) return false
    return true
  }

  private _getConcreteNonErrorInScopeNodeDefinitions(nodeTypeIds: string[]) {
    const results: AbstractGrammarDefinitionNode[] = []
    nodeTypeIds.forEach(nodeTypeId => {
      const def = this.getNodeTypeDefinitionByNodeTypeId(nodeTypeId)
      if (def._isErrorNodeType()) return true
      else if (def._isAbstract()) {
        def._getConcreteDescendantDefinitions().forEach(def => results.push(def))
      } else {
        results.push(def)
      }
    })
    return results
  }

  // todo: refactor
  synthesizeNode(nodeCount = 1, indentCount = -1, nodeTypesAlreadySynthesized: string[] = [], seed = Date.now()) {
    let inScopeNodeTypeIds = this._getInScopeNodeTypeIds()
    const catchAllNodeTypeId = this._getFromExtended(GrammarConstants.catchAllNodeType)
    if (catchAllNodeTypeId) inScopeNodeTypeIds.push(catchAllNodeTypeId)
    const thisId = this._getId()
    if (!nodeTypesAlreadySynthesized.includes(thisId)) nodeTypesAlreadySynthesized.push(thisId)
    const lines = []
    while (nodeCount) {
      const line = this._generateSimulatedLine(seed)
      if (line) lines.push(" ".repeat(indentCount >= 0 ? indentCount : 0) + line)

      this._getConcreteNonErrorInScopeNodeDefinitions(inScopeNodeTypeIds.filter(nodeTypeId => !nodeTypesAlreadySynthesized.includes(nodeTypeId)))
        .filter(def => this._shouldSynthesize(def, nodeTypesAlreadySynthesized))
        .forEach(def => {
          const chain = nodeTypesAlreadySynthesized // .slice(0)
          chain.push(def._getId())
          def.synthesizeNode(1, indentCount + 1, chain, seed).forEach(line => {
            lines.push(line)
          })
        })
      nodeCount--
    }
    return lines
  }

  private _cellParser: AbstractCellParser

  getCellParser() {
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
class nodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {}

// HandGrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class HandGrammarProgram extends AbstractGrammarDefinitionNode {
  createParser() {
    const map: treeNotationTypes.stringMap = {}
    map[GrammarConstants.toolingDirective] = TreeNode
    map[GrammarConstants.todoComment] = TreeNode
    return new TreeNode.Parser(UnknownNodeTypeNode, map, [{ regex: HandGrammarProgram.nodeTypeFullRegex, nodeConstructor: nodeTypeDefinitionNode }, { regex: HandGrammarProgram.cellTypeFullRegex, nodeConstructor: cellTypeDefinitionNode }])
  }

  static makeNodeTypeId = (str: string) => TreeUtils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandGrammarProgram.nodeTypeSuffixRegex, "") + GrammarConstants.nodeTypeSuffix
  static makeCellTypeId = (str: string) => TreeUtils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandGrammarProgram.cellTypeSuffixRegex, "") + GrammarConstants.cellTypeSuffix

  static nodeTypeSuffixRegex = new RegExp(GrammarConstants.nodeTypeSuffix + "$")
  static nodeTypeFullRegex = new RegExp("^[a-zA-Z0-9_]+" + GrammarConstants.nodeTypeSuffix + "$")

  static cellTypeSuffixRegex = new RegExp(GrammarConstants.cellTypeSuffix + "$")
  static cellTypeFullRegex = new RegExp("^[a-zA-Z0-9_]+" + GrammarConstants.cellTypeSuffix + "$")

  private _cache_compiledLoadedNodeTypes: { [nodeTypeId: string]: Function }

  // Note: this is some so far unavoidable tricky code. We need to eval the transpiled JS, in a NodeJS or browser environment.
  private _compileAndEvalGrammar() {
    if (!this.isNodeJs()) this._cache_compiledLoadedNodeTypes = TreeUtils.appendCodeAndReturnValueOnWindow(this.toBrowserJavascript(), this.getRootNodeTypeId()).getNodeTypeMap()
    else {
      const path = require("path")
      const code = this.toNodeJsJavascript(path.join(__dirname, "..", "index.js"))
      try {
        const rootNode = this._requireInVmNodeJsRootNodeTypeConstructor(code)
        this._cache_compiledLoadedNodeTypes = rootNode.getNodeTypeMap()
        if (!this._cache_compiledLoadedNodeTypes) throw new Error(`Failed to getNodeTypeMap`)
      } catch (err) {
        // todo: figure out best error pattern here for debugging
        console.log(err)
        // console.log(`Error in code: `)
        // console.log(new TreeNode(code).toStringWithLineNumbers())
      }
    }
  }

  trainModel(programs: string[], programConstructor = this.compileAndReturnRootConstructor()): SimplePredictionModel {
    const nodeDefs = this.getValidConcreteAndAbstractNodeTypeDefinitions()
    const nodeDefCountIncludingRoot = nodeDefs.length + 1
    const matrix = TreeUtils.makeMatrix(nodeDefCountIncludingRoot, nodeDefCountIncludingRoot, 0)
    const idToIndex: { [id: string]: number } = {}
    const indexToId: { [index: number]: string } = {}
    nodeDefs.forEach((def, index) => {
      const id = def._getId()
      idToIndex[id] = index + 1
      indexToId[index + 1] = id
    })
    programs.forEach(code => {
      const exampleProgram = new programConstructor(code)
      exampleProgram.getTopDownArray().forEach((node: GrammarBackedNode) => {
        const nodeIndex = idToIndex[node.getDefinition()._getId()]
        const parentNode = <GrammarBackedNode>node.getParent()
        if (!nodeIndex) return undefined
        if (parentNode.isRoot()) matrix[0][nodeIndex]++
        else {
          const parentIndex = idToIndex[parentNode.getDefinition()._getId()]
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
    const total = TreeUtils.sum(predictionsVector)
    const predictions = predictionsVector.slice(1).map((count, index) => {
      const id = model.indexToId[index + 1]
      return {
        id: id,
        def: this.getNodeTypeDefinitionByNodeTypeId(id),
        count,
        prob: count / total
      }
    })
    predictions.sort(TreeUtils.makeSortByFn((prediction: any) => prediction.count)).reverse()
    return predictions
  }

  predictChildren(model: SimplePredictionModel, node: GrammarBackedNode) {
    return this._mapPredictions(this._predictChildren(model, node), model)
  }

  predictParents(model: SimplePredictionModel, node: GrammarBackedNode) {
    return this._mapPredictions(this._predictParents(model, node), model)
  }

  private _predictChildren(model: SimplePredictionModel, node: GrammarBackedNode) {
    return model.matrix[node.isRoot() ? 0 : model.idToIndex[node.getDefinition()._getId()]]
  }

  private _predictParents(model: SimplePredictionModel, node: GrammarBackedNode) {
    if (node.isRoot()) return []
    const nodeIndex = model.idToIndex[node.getDefinition()._getId()]
    return model.matrix.map(row => row[nodeIndex])
  }

  _compileAndReturnNodeTypeMap() {
    if (!this._cache_compiledLoadedNodeTypes) this._compileAndEvalGrammar()
    return this._cache_compiledLoadedNodeTypes
  }

  // todo: hacky, remove
  private _dirName: string
  _setDirName(name: string) {
    this._dirName = name
    return this
  }

  private _requireInVmNodeJsRootNodeTypeConstructor(code: treeNotationTypes.javascriptCode): any {
    const vm = require("vm")
    const path = require("path")
    const jtreePath = path.join(__dirname, "..", "index.js")
    // todo: cleanup up
    try {
      ;(<any>global).jtree = require(jtreePath)
      ;(<any>global).require = require
      ;(<any>global).__dirname = this._dirName
      ;(<any>global).module = {}
      return vm.runInThisContext(code)
    } catch (err) {
      // todo: figure out best error pattern here for debugging
      console.log(`Error in compiled grammar code for language "${this.getGrammarName()}"`)
      // console.log(new TreeNode(code).toStringWithLineNumbers())
      console.log(`jtreePath: "${jtreePath}"`)
      console.log(err)
      throw err
    }
  }

  examplesToTestBlocks(programConstructor = this.compileAndReturnRootConstructor(), expectedErrorMessage = "") {
    const testBlocks: { [id: string]: Function } = {}
    this.getValidConcreteAndAbstractNodeTypeDefinitions().forEach(def =>
      def.getExamples().forEach(example => {
        const id = def._getId() + example.getContent()
        testBlocks[id] = (equal: Function) => {
          const exampleProgram = new programConstructor(example.childrenToString())
          const errors = exampleProgram.getAllErrors(example._getLineNumber() + 1)
          equal(errors.join("\n"), expectedErrorMessage, `Expected no errors in ${id}`)
        }
      })
    )
    return testBlocks
  }

  toReadMe() {
    const languageName = this.getExtensionName()
    const rootNodeDef = this.getRootNodeTypeDefinitionNode()
    const cellTypes = this.getCellTypeDefinitions()
    const nodeTypeFamilyTree = this.getNodeTypeFamilyTree()
    const exampleNode = rootNodeDef.getExamples()[0]
    return `title ${languageName} Readme

paragraph ${rootNodeDef.getDescription()}

subtitle Quick Example

code
${exampleNode ? exampleNode.childrenToString(1) : ""}

subtitle Quick facts about ${languageName}

list
 - ${languageName} has ${nodeTypeFamilyTree.getTopDownArray().length} node types.
 - ${languageName} has ${Object.keys(cellTypes).length} cell types
 - The source code for ${languageName} is ${this.getTopDownArray().length} lines long.

subtitle Installing

code
 npm install .

subtitle Testing

code
 node test.js

subtitle Node Types

code
${nodeTypeFamilyTree.toString(1)}

subtitle Cell Types

code
${new TreeNode(Object.keys(cellTypes).join("\n")).toString(1)}

subtitle Road Map

paragraph Here are the "todos" present in the source code for ${languageName}:

list
${this.getTopDownArray()
  .filter(node => node.getWord(0) === "todo")
  .map(node => ` - ${node.getLine()}`)
  .join("\n")}

paragraph This readme was auto-generated using the
 link https://github.com/treenotation/jtree JTree library.`
  }

  toBundle() {
    const files: treeNotationTypes.stringMap = {}
    const rootNodeDef = this.getRootNodeTypeDefinitionNode()
    const languageName = this.getExtensionName()
    const example = rootNodeDef.getExamples()[0]
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
 console.log(errors.map(error => error.getMessage()))`

    const nodePath = `${languageName}.node.js`
    files[nodePath] = this.toNodeJsJavascript()
    files[GrammarBundleFiles.indexJs] = `module.exports = require("./${nodePath}")`

    const browserPath = `${languageName}.browser.js`
    files[browserPath] = this.toBrowserJavascript()
    files[GrammarBundleFiles.indexHtml] = `<script src="node_modules/jtree/products/jtree.browser.js"></script>
<script src="${browserPath}"></script>
<script>
const sampleCode = \`${sampleCode.toString()}\`
${testCode}
</script>`

    const samplePath = "sample." + this.getExtensionName()
    files[samplePath] = sampleCode.toString()
    files[GrammarBundleFiles.testJs] = `const ${languageName} = require("./index.js")
/*keep-line*/ const sampleCode = require("fs").readFileSync("${samplePath}", "utf8")
${testCode}`
    return files
  }

  getTargetExtension() {
    return this.getRootNodeTypeDefinitionNode().get(GrammarConstants.compilesTo)
  }

  private _cache_cellTypes: {
    [name: string]: cellTypeDefinitionNode
  }

  getCellTypeDefinitions() {
    if (!this._cache_cellTypes) this._cache_cellTypes = this._getCellTypeDefinitions()
    return this._cache_cellTypes
  }

  getCellTypeDefinitionById(cellTypeId: treeNotationTypes.cellTypeId) {
    // todo: return unknownCellTypeDefinition? or is that handled somewhere else?
    return this.getCellTypeDefinitions()[cellTypeId]
  }

  getNodeTypeFamilyTree() {
    const tree = new TreeNode()
    Object.values(this.getValidConcreteAndAbstractNodeTypeDefinitions()).forEach(node => {
      const path = node.getAncestorNodeTypeIdsArray().join(" ")
      tree.touchNode(path)
    })
    return tree
  }

  protected _getCellTypeDefinitions() {
    const types: { [typeName: string]: cellTypeDefinitionNode } = {}
    // todo: add built in word types?
    this.getChildrenByNodeConstructor(cellTypeDefinitionNode).forEach(type => (types[(<cellTypeDefinitionNode>type).getCellTypeId()] = type))
    return types
  }

  getLanguageDefinitionProgram() {
    return this
  }

  getValidConcreteAndAbstractNodeTypeDefinitions() {
    return <nodeTypeDefinitionNode[]>this.getChildrenByNodeConstructor(nodeTypeDefinitionNode).filter((node: nodeTypeDefinitionNode) => node._hasValidNodeTypeId())
  }

  private _cache_rootNodeTypeNode: nodeTypeDefinitionNode

  private _getLastRootNodeTypeDefinitionNode() {
    return this.findLast(def => def instanceof AbstractGrammarDefinitionNode && def.has(GrammarConstants.root) && def._hasValidNodeTypeId())
  }

  private _initRootNodeTypeDefinitionNode() {
    if (this._cache_rootNodeTypeNode) return
    if (!this._cache_rootNodeTypeNode) this._cache_rootNodeTypeNode = this._getLastRootNodeTypeDefinitionNode()
    // By default, have a very permissive basic root node.
    // todo: whats the best design pattern to use for this sort of thing?
    if (!this._cache_rootNodeTypeNode) {
      this._cache_rootNodeTypeNode = <nodeTypeDefinitionNode>this.concat(`${GrammarConstants.defaultRootNode}
 ${GrammarConstants.root}
 ${GrammarConstants.catchAllNodeType} ${GrammarConstants.BlobNode}`)[0]
      this._addDefaultCatchAllBlobNode()
    }
  }

  getRootNodeTypeDefinitionNode() {
    this._initRootNodeTypeDefinitionNode()
    return this._cache_rootNodeTypeNode
  }

  // todo: whats the best design pattern to use for this sort of thing?
  _addDefaultCatchAllBlobNode() {
    delete this._cache_nodeTypeDefinitions
    this.concat(`${GrammarConstants.BlobNode}
 ${GrammarConstants.baseNodeType} ${GrammarConstants.blobNode}`)
  }

  getExtensionName() {
    return this.getGrammarName()
  }

  _getId() {
    return this.getRootNodeTypeId()
  }

  getRootNodeTypeId() {
    return this.getRootNodeTypeDefinitionNode().getNodeTypeIdFromDefinition()
  }

  getGrammarName(): string | undefined {
    return this.getRootNodeTypeId().replace(HandGrammarProgram.nodeTypeSuffixRegex, "")
  }

  _getMyInScopeNodeTypeIds(): treeNotationTypes.nodeTypeId[] {
    const nodeTypesNode = this.getRootNodeTypeDefinitionNode().getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }

  protected _getInScopeNodeTypeIds(): treeNotationTypes.nodeTypeId[] {
    const nodeTypesNode = this.getRootNodeTypeDefinitionNode().getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }

  // At present we only have global nodeType definitions (you cannot have scoped nodeType definitions right now).
  private _cache_nodeTypeDefinitions: { [nodeTypeId: string]: nodeTypeDefinitionNode }

  protected _initProgramNodeTypeDefinitionCache(): void {
    if (this._cache_nodeTypeDefinitions) return undefined

    this._cache_nodeTypeDefinitions = {}

    this.getChildrenByNodeConstructor(nodeTypeDefinitionNode).forEach(nodeTypeDefinitionNode => {
      this._cache_nodeTypeDefinitions[(<nodeTypeDefinitionNode>nodeTypeDefinitionNode).getNodeTypeIdFromDefinition()] = nodeTypeDefinitionNode
    })
  }

  _getProgramNodeTypeDefinitionCache() {
    this._initProgramNodeTypeDefinitionCache()
    return this._cache_nodeTypeDefinitions
  }

  static _languages: any = {}
  static _nodeTypes: any = {}

  private _cache_rootConstructorClass: AbstractRuntimeProgramConstructorInterface

  compileAndReturnRootConstructor() {
    if (!this._cache_rootConstructorClass) {
      const def = this.getRootNodeTypeDefinitionNode()
      const rootNodeTypeId = def.getNodeTypeIdFromDefinition()
      this._cache_rootConstructorClass = <AbstractRuntimeProgramConstructorInterface>def.getLanguageDefinitionProgram()._compileAndReturnNodeTypeMap()[rootNodeTypeId]
    }
    return this._cache_rootConstructorClass
  }

  private _getFileExtensions(): string {
    return this.getRootNodeTypeDefinitionNode().get(GrammarConstants.extensions)
      ? this.getRootNodeTypeDefinitionNode()
          .get(GrammarConstants.extensions)
          .split(" ")
          .join(",")
      : this.getExtensionName()
  }

  toNodeJsJavascript(normalizedJtreePath: treeNotationTypes.requirePath = "jtree"): treeNotationTypes.javascriptCode {
    return this._rootNodeDefToJavascriptClass(normalizedJtreePath, true).trim()
  }

  toBrowserJavascript(): treeNotationTypes.javascriptCode {
    return this._rootNodeDefToJavascriptClass("", false).trim()
  }

  private _getProperName() {
    return TreeUtils.ucfirst(this.getExtensionName())
  }

  private _rootNodeDefToJavascriptClass(normalizedJtreePath: treeNotationTypes.requirePath, forNodeJs = true): treeNotationTypes.javascriptCode {
    const defs = this.getValidConcreteAndAbstractNodeTypeDefinitions()
    // todo: throw if there is no root node defined
    const nodeTypeClasses = defs.map(def => def._nodeDefToJavascriptClass()).join("\n\n")
    const rootDef = this.getRootNodeTypeDefinitionNode()
    const rootNodeJsHeader = forNodeJs && rootDef._getConcatBlockStringFromExtended(GrammarConstants._rootNodeJsHeader)
    const rootName = rootDef._getGeneratedClassName()

    if (!rootName) throw new Error(`Root Node Type Has No Name`)

    let exportScript = ""
    if (forNodeJs) {
      exportScript = `module.exports = ${rootName};
${rootName}`
    } else {
      exportScript = `window.${rootName} = ${rootName}`
    }

    // todo: we can expose the previous "constants" export, if needed, via the grammar, which we preserve.
    return `{
${forNodeJs ? `const {jtree} = require("${normalizedJtreePath.replace(/\\/g, "\\\\")}")` : ""}
${rootNodeJsHeader ? rootNodeJsHeader : ""}
${nodeTypeClasses}

${exportScript}
}
`
  }

  toSublimeSyntaxFile() {
    const cellTypeDefs = this.getCellTypeDefinitions()
    const variables = Object.keys(cellTypeDefs)
      .map(name => ` ${name}: '${cellTypeDefs[name].getRegexString()}'`)
      .join("\n")

    const defs = this.getValidConcreteAndAbstractNodeTypeDefinitions().filter(kw => !kw._isAbstract())
    const nodeTypeContexts = defs.map(def => def._toSublimeMatchBlock()).join("\n\n")
    const includes = defs.map(nodeTypeDef => `  - include: '${nodeTypeDef.getNodeTypeIdFromDefinition()}'`).join("\n")

    return `%YAML 1.2
---
name: ${this.getExtensionName()}
file_extensions: [${this._getFileExtensions()}]
scope: source.${this.getExtensionName()}

variables:
${variables}

contexts:
 main:
${includes}

${nodeTypeContexts}`
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

export { GrammarConstants, PreludeCellTypeIds, HandGrammarProgram, GrammarBackedNode, UnknownNodeTypeError }
