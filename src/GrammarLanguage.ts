import TreeNode from "./base/TreeNode"
import TreeUtils from "./base/TreeUtils"
import jTreeTypes from "./jTreeTypes"

interface AbstractRuntimeProgramConstructorInterface {
  new (code: string): GrammarBackedRootNode
}

enum GrammarConstantsCompiler {
  stringTemplate = "stringTemplate", // replacement instructions
  indentCharacter = "indentCharacter",
  listDelimiter = "listDelimiter",
  openChildren = "openChildren",
  closeChildren = "closeChildren"
}

enum GrammarStandardCellTypeIds {
  any = "any",
  anyFirstWord = "anyFirstWord", // todo: remove
  extraWord = "extraWord",
  float = "float",
  number = "number",
  bit = "bit",
  bool = "bool",
  int = "int"
}

enum GrammarConstantsConstantTypes {
  boolean = "boolean",
  string = "string",
  int = "int",
  float = "float"
}

enum GrammarConstants {
  // node types
  grammar = "grammar",
  extensions = "extensions",
  toolingDirective = "tooling",
  todoComment = "todo",
  version = "version",
  name = "name",
  nodeTypeOrder = "nodeTypeOrder",
  nodeType = "nodeType",
  cellType = "cellType",

  // error check time
  regex = "regex", // temporary?
  reservedWords = "reservedWords", // temporary?
  enumFromGrammar = "enumFromGrammar", // temporary?
  enum = "enum", // temporary?

  // baseNodeTypes
  baseNodeType = "baseNodeType",
  blobNode = "blobNode",
  errorNode = "errorNode",
  terminalNode = "terminalNode",
  nonTerminalNode = "nonTerminalNode",

  // parse time
  extends = "extends",
  abstract = "abstract",
  match = "match",
  inScope = "inScope",
  cells = "cells",
  catchAllCellType = "catchAllCellType",
  firstCellType = "firstCellType",
  catchAllNodeType = "catchAllNodeType",
  constants = "constants",
  required = "required", // Require this nodeType to be present in a node or program
  single = "single", // Have at most 1 of these
  tags = "tags",

  // code
  javascript = "javascript",

  // parse and interpret time
  constructors = "constructors",
  constructorNodeJs = "nodejs",
  constructorBrowser = "browser", // for browser

  // compile time
  compilerNodeType = "compiler",
  compilesTo = "compilesTo",

  // develop time
  description = "description",
  example = "example",
  frequency = "frequency",
  highlightScope = "highlightScope"
}

abstract class GrammarBackedNode extends TreeNode {
  abstract getDefinition(): AbstractGrammarDefinitionNode

  getAutocompleteResults(partialWord: string, cellIndex: jTreeTypes.positiveInt) {
    return cellIndex === 0 ? this._getAutocompleteResultsForFirstWord(partialWord) : this._getAutocompleteResultsForCell(partialWord, cellIndex)
  }

  private _getAutocompleteResultsForFirstWord(partialWord: string) {
    let defs: NonRootNodeTypeDefinition[] = Object.values(this.getDefinition().getRunTimeFirstWordMapWithDefinitions())

    if (partialWord) defs = defs.filter(def => def._getFirstWordMatch().includes(partialWord))

    return defs.map(def => {
      const id = def._getFirstWordMatch()
      const description = def.getDescription()
      return {
        text: id,
        displayText: id + (description ? " " + description : "")
      }
    })
  }

  private _getAutocompleteResultsForCell(partialWord: string, cellIndex: jTreeTypes.positiveInt) {
    // todo: root should be [] correct?
    const cell = this._getGrammarBackedCellArray()[cellIndex]
    return cell ? cell.getAutoCompleteWords(partialWord) : []
  }

  // note: this is overwritten by the root node of a runtime grammar program.
  // some of the magic that makes this all work. but maybe there's a better way.
  abstract getGrammarProgramRoot(): GrammarProgram

  getFirstWordMap() {
    return this.getDefinition().getRunTimeFirstWordMap()
  }

  getCatchAllNodeConstructor(line: string) {
    return this.getDefinition().getRunTimeCatchAllNodeConstructor()
  }

  // todo: rename to something better?
  abstract getRootProgramNode(): GrammarBackedRootNode

  protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[] {
    return []
  }

  getRunTimeEnumOptions(cell: AbstractGrammarBackedCell<any>): string[] {
    return undefined
  }

  protected _getRequiredNodeErrors(errors: jTreeTypes.TreeError[] = []) {
    Object.values(this.getDefinition().getRunTimeFirstWordMapWithDefinitions()).forEach(def => {
      if (def.isRequired()) {
        const firstWord = def._getFirstWordMatch()
        if (!this.has(firstWord)) errors.push(new MissingRequiredNodeTypeError(this, firstWord))
      }
    })
    return errors
  }
}

abstract class GrammarBackedRootNode extends GrammarBackedNode {
  getRootProgramNode() {
    return this
  }

  getDefinition(): GrammarProgram {
    return this.getGrammarProgramRoot()
  }

  getInPlaceCellTypeTree() {
    return this.getTopDownArray()
      .map(child => child.getIndentation() + child.getLineCellTypes())
      .join("\n")
  }

  getAllErrors(): jTreeTypes.TreeError[] {
    return this._getRequiredNodeErrors(super.getAllErrors())
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

  updateNodeTypeIds(nodeTypeMap: TreeNode | string | jTreeTypes.nodeIdRenameMap) {
    if (typeof nodeTypeMap === "string") nodeTypeMap = new TreeNode(nodeTypeMap)
    if (nodeTypeMap instanceof TreeNode) nodeTypeMap = <jTreeTypes.nodeIdRenameMap>nodeTypeMap.toObject()
    const renames = []
    for (let node of this.getTopDownArrayIterator()) {
      const nodeTypeId = (<GrammarBackedNonRootNode>node).getNodeTypeId()
      const newId = nodeTypeMap[nodeTypeId]
      if (newId) renames.push([node, newId])
    }
    renames.forEach(pair => pair[0].setFirstWord(pair[1]))
    return this
  }

  getAllSuggestions() {
    return new TreeNode(
      this.getAllWordBoundaryCoordinates().map(coordinate => {
        const results = this.getAutocompleteResultsAt(coordinate.y, coordinate.x)
        return {
          line: coordinate.y,
          char: coordinate.x,
          word: results.word,
          suggestions: results.matches.map(m => m.text).join(" ")
        }
      })
    ).toTable()
  }

  getAutocompleteResultsAt(lineIndex: jTreeTypes.positiveInt, charIndex: jTreeTypes.positiveInt) {
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

  getPrettified() {
    const nodeTypeOrder = this.getGrammarProgramRoot().getNodeTypeOrder()
    const clone = this.clone()
    const isCondensed = this.getGrammarProgramRoot().getGrammarName() === "grammar" // todo: generalize?
    clone._firstWordSort(
      nodeTypeOrder.split(" "),
      isCondensed ? TreeUtils._makeGraphSortFunction(node => node.getWord(1), node => node.get(GrammarConstants.extends)) : undefined
    )

    return clone.toString()
  }

  getNodeTypeUsage(filepath = "") {
    // returns a report on what nodeTypes from its language the program uses
    const usage = new TreeNode()
    const grammarProgram = this.getGrammarProgramRoot()
    grammarProgram.getConcreteAndAbstractNodeTypeDefinitions().forEach(def => {
      usage.appendLine([def.getNodeTypeIdFromDefinition(), "line-id", GrammarConstants.nodeType, def.getRequiredCellTypeIds().join(" ")].join(" "))
    })
    this.getTopDownArray().forEach((node, lineNumber) => {
      const stats = <TreeNode>usage.getNode(node.getNodeTypeId())
      stats.appendLine([filepath + "-" + lineNumber, node.getWords().join(" ")].join(" "))
    })
    return usage
  }

  getInPlaceHighlightScopeTree() {
    return this.getTopDownArray()
      .map(child => child.getIndentation() + child.getLineHighlightScopes())
      .join("\n")
  }

  getInPlaceCellTypeTreeWithNodeConstructorNames() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getZI() + child.getIndentation() + child.getLineCellTypes())
      .join("\n")
  }

  getTreeWithNodeTypes() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getZI() + child.getIndentation() + child.getLine())
      .join("\n")
  }

  getCellHighlightScopeAtPosition(lineIndex: number, wordIndex: number): jTreeTypes.highlightScope | undefined {
    this._initCellTypeCache()
    const typeNode = this._cache_highlightScopeTree.getTopDownArray()[lineIndex - 1]
    return typeNode ? typeNode.getWord(wordIndex - 1) : undefined
  }

  private _cache_programCellTypeStringMTime: number
  private _cache_highlightScopeTree: TreeNode
  private _cache_typeTree: TreeNode

  protected _initCellTypeCache(): void {
    const treeMTime = this.getTreeMTime()
    if (this._cache_programCellTypeStringMTime === treeMTime) return undefined

    this._cache_typeTree = new TreeNode(this.getInPlaceCellTypeTree())
    this._cache_highlightScopeTree = new TreeNode(this.getInPlaceHighlightScopeTree())
    this._cache_programCellTypeStringMTime = treeMTime
  }
}

abstract class GrammarBackedNonRootNode extends GrammarBackedNode {
  getRootProgramNode() {
    return (<GrammarBackedNode>this.getParent()).getRootProgramNode()
  }

  getNodeTypeId(): jTreeTypes.nodeTypeId {
    return this.getDefinition().getNodeTypeIdFromDefinition()
  }

  getDefinition(): NonRootNodeTypeDefinition {
    const grammarProgramRoot = this.getRootProgramNode().getGrammarProgramRoot()
    // todo: do we need a relative to with this firstWord path?
    return <NonRootNodeTypeDefinition>grammarProgramRoot.getNodeTypeDefinitionByFirstWordPath(this.getFirstWordPath())
  }

  getGrammarProgramRoot() {
    return this.getRootProgramNode().getGrammarProgramRoot()
  }

  protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[] {
    const definition = this.getDefinition()
    const grammarProgram = definition.getLanguageDefinitionProgram()
    const requiredCellTypeIds = definition.getRequiredCellTypeIds()
    const firstCellTypeId = definition.getFirstCellTypeId()
    const numberOfRequiredCells = requiredCellTypeIds.length + 1 // todo: assuming here first cell is required.

    const catchAllCellTypeId = definition.getCatchAllCellTypeId()

    const actualWordCountOrRequiredCellCount = Math.max(this.getWords().length, numberOfRequiredCells)
    const cells: AbstractGrammarBackedCell<any>[] = []

    // A for loop instead of map because "numberOfCellsToFill" can be longer than words.length
    for (let cellIndex = 0; cellIndex < actualWordCountOrRequiredCellCount; cellIndex++) {
      const isCatchAll = cellIndex >= numberOfRequiredCells

      let cellTypeId
      if (cellIndex === 0) cellTypeId = firstCellTypeId
      else if (isCatchAll) cellTypeId = catchAllCellTypeId
      else cellTypeId = requiredCellTypeIds[cellIndex - 1]

      let cellTypeDefinition = grammarProgram.getCellTypeDefinitionById(cellTypeId)

      let cellConstructor
      if (cellTypeDefinition) cellConstructor = cellTypeDefinition.getCellConstructor()
      else if (cellTypeId) cellConstructor = GrammarUnknownCellTypeCell
      else {
        cellConstructor = GrammarExtraWordCellTypeCell
        cellTypeId = GrammarStandardCellTypeIds.extraWord
        cellTypeDefinition = grammarProgram.getCellTypeDefinitionById(cellTypeId)
      }

      cells[cellIndex] = new cellConstructor(this, cellIndex, cellTypeDefinition, cellTypeId, isCatchAll)
    }
    return cells
  }

  // todo: just make a fn that computes proper spacing and then is given a node to print
  getLineCellTypes() {
    return this._getGrammarBackedCellArray()
      .map(slot => slot.getCellTypeId())
      .join(" ")
  }

  getLineHighlightScopes(defaultScope = "source") {
    return this._getGrammarBackedCellArray()
      .map(slot => slot.getHighlightScope() || defaultScope)
      .join(" ")
  }

  getErrors() {
    const errors = this._getGrammarBackedCellArray()
      .map(check => check.getErrorIfAny())
      .filter(i => i)

    const firstWord = this.getFirstWord()
    if (this.getDefinition().has(GrammarConstants.single))
      this.getParent()
        .findNodes(firstWord)
        .forEach((node, index) => {
          if (index) errors.push(new NodeTypeUsedMultipleTimesError(node))
        })

    return this._getRequiredNodeErrors(errors)
  }

  protected _getCompiledIndentation() {
    const indentCharacter = this.getDefinition()._getCompilerObject()[GrammarConstantsCompiler.indentCharacter]
    const indent = this.getIndentation()
    return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent
  }

  protected _getCompiledLine() {
    const compiler = this.getDefinition()._getCompilerObject()
    const listDelimiter = compiler[GrammarConstantsCompiler.listDelimiter]
    const str = compiler[GrammarConstantsCompiler.stringTemplate]
    return str ? TreeUtils.formatStr(str, listDelimiter, this.cells) : this.getLine()
  }

  compile() {
    return this._getCompiledIndentation() + this._getCompiledLine()
  }

  // todo: remove
  get cells() {
    const cells: jTreeTypes.stringMap = {}
    this._getGrammarBackedCellArray()
      .slice(1)
      .forEach(cell => {
        if (!cell.isCatchAll()) cells[cell.getCellTypeId()] = cell.getParsed()
        else {
          if (!cells[cell.getCellTypeId()]) cells[cell.getCellTypeId()] = []
          cells[cell.getCellTypeId()].push(cell.getParsed())
        }
      })
    return cells
  }
}

class GrammarBackedTerminalNode extends GrammarBackedNonRootNode {}

class GrammarBackedErrorNode extends GrammarBackedNonRootNode {
  // todo: is this correct?
  getLineCellTypes() {
    return "errorNodeAnyCellType ".repeat(this.getWords().length).trim()
  }

  getErrors(): UnknownNodeTypeError[] {
    return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)]
  }
}

class GrammarBackedNonTerminalNode extends GrammarBackedNonRootNode {
  // todo: implement
  protected _getNodeJoinCharacter() {
    return "\n"
  }

  compile() {
    const compiler = this.getDefinition()._getCompilerObject()
    const openChildrenString = compiler[GrammarConstantsCompiler.openChildren] || ""
    const closeChildrenString = compiler[GrammarConstantsCompiler.closeChildren] || ""

    const compiledLine = this._getCompiledLine()
    const indent = this._getCompiledIndentation()

    const compiledChildren = this.map(child => child.compile()).join(this._getNodeJoinCharacter())

    return `${indent}${compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`
  }
}

class GrammarBackedBlobNode extends GrammarBackedNonRootNode {
  getFirstWordMap() {
    return {}
  }

  getErrors(): jTreeTypes.TreeError[] {
    return []
  }

  getCatchAllNodeConstructor(line: string) {
    return GrammarBackedBlobNode
  }
}

/*
A cell contains a word but also the type information for that word.
*/
abstract class AbstractGrammarBackedCell<T> {
  constructor(node: GrammarBackedNonRootNode, index: jTreeTypes.int, typeDef: GrammarCellTypeDefinitionNode, cellTypeId: string, isCatchAll: boolean) {
    this._typeDef = typeDef
    this._node = node
    this._isCatchAll = isCatchAll
    this._index = index
    this._cellTypeId = cellTypeId

    this._word = node.getWord(index)
  }

  private _node: GrammarBackedNonRootNode
  protected _index: jTreeTypes.int
  protected _word: string
  private _typeDef: GrammarCellTypeDefinitionNode
  private _isCatchAll: boolean
  private _cellTypeId: string

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

  abstract getParsed(): T

  getHighlightScope(): string | undefined {
    const definition = this._getCellTypeDefinition()
    if (definition) return definition.getHighlightScope()
  }

  getAutoCompleteWords(partialWord: string = "") {
    const cellDef = this._getCellTypeDefinition()
    let words = cellDef ? cellDef._getAutocompleteWordOptions(this.getNode().getRootProgramNode()) : []

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

  getWord() {
    return this._word
  }

  protected _getCellTypeDefinition() {
    return this._typeDef
  }

  protected _getLineNumber() {
    return this.getNode().getPoint().y
  }

  protected _getFullLine() {
    return this.getNode().getLine()
  }

  protected _getErrorContext() {
    return this._getFullLine().split(" ")[0] // todo: XI
  }

  protected abstract _isValid(): boolean

  isValid(): boolean {
    const runTimeOptions = this.getNode().getRunTimeEnumOptions(this)
    if (runTimeOptions) return runTimeOptions.includes(this._word)
    return this._getCellTypeDefinition().isValid(this._word, this.getNode().getRootProgramNode()) && this._isValid()
  }

  getErrorIfAny(): jTreeTypes.TreeError {
    if (this._word !== undefined && this.isValid()) return undefined

    return this._word === undefined ? new MissingWordError(this) : new InvalidWordError(this)
  }
}

class GrammarIntCell extends AbstractGrammarBackedCell<number> {
  _isValid() {
    const num = parseInt(this._word)
    if (isNaN(num)) return false
    return num.toString() === this._word
  }

  getRegexString() {
    return "\-?[0-9]+"
  }

  getParsed() {
    return parseInt(this._word)
  }

  static parserFunctionName = "parseInt"
}

class GrammarBitCell extends AbstractGrammarBackedCell<boolean> {
  _isValid() {
    const str = this._word
    return str === "0" || str === "1"
  }

  getRegexString() {
    return "[01]"
  }

  getParsed() {
    return !!parseInt(this._word)
  }
}

class GrammarFloatCell extends AbstractGrammarBackedCell<number> {
  _isValid() {
    const num = parseFloat(this._word)
    return !isNaN(num) && /^-?\d*(\.\d+)?$/.test(this._word)
  }

  getRegexString() {
    return "-?\d*(\.\d+)?"
  }

  getParsed() {
    return parseFloat(this._word)
  }

  static parserFunctionName = "parseFloat"
}

// ErrorCellType => grammar asks for a '' cell type here but the grammar does not specify a '' cell type. (todo: bring in didyoumean?)

class GrammarBoolCell extends AbstractGrammarBackedCell<boolean> {
  private _trues = new Set(["1", "true", "t", "yes"])
  private _falses = new Set(["0", "false", "f", "no"])

  _isValid() {
    const str = this._word.toLowerCase()
    return this._trues.has(str) || this._falses.has(str)
  }

  private _getOptions() {
    return Array.from(this._trues).concat(Array.from(this._falses))
  }

  getRegexString() {
    return "(?:" + this._getOptions().join("|") + ")"
  }

  getParsed() {
    return this._trues.has(this._word.toLowerCase())
  }
}

class GrammarAnyCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return true
  }

  getRegexString() {
    return "[^ ]+"
  }

  getParsed() {
    return this._word
  }
}

class GrammarExtraWordCellTypeCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return false
  }

  getParsed() {
    return this._word
  }

  getErrorIfAny(): jTreeTypes.TreeError {
    return new ExtraWordError(this)
  }
}

class GrammarUnknownCellTypeCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return false
  }

  getParsed() {
    return this._word
  }

  getErrorIfAny(): jTreeTypes.TreeError {
    return new UnknownCellTypeError(this)
  }
}

abstract class AbstractTreeError implements jTreeTypes.TreeError {
  constructor(node: GrammarBackedNode | TreeNode) {
    this._node = node
  }
  private _node: GrammarBackedNode | TreeNode

  getLineIndex(): jTreeTypes.positiveInt {
    return this.getLineNumber() - 1
  }

  getLineNumber(): jTreeTypes.positiveInt {
    return this.getNode().getPoint().y
  }

  isCursorOnWord(lineIndex: jTreeTypes.positiveInt, characterIndex: jTreeTypes.positiveInt) {
    return lineIndex === this.getLineIndex() && this._doesCharacterIndexFallOnWord(characterIndex)
  }

  private _doesCharacterIndexFallOnWord(characterIndex: jTreeTypes.positiveInt) {
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

  private _getCodeMirrorLineWidgetElementCellTypeHints() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + (<GrammarBackedNonRootNode>this.getNode()).getDefinition().getLineHints()))
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
    return (<GrammarBackedNode>this.getNode()).getGrammarProgramRoot().getExtensionName()
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
    return super.getMessage() + ` Invalid nodeType "${this.getNode().getFirstWord()}".`
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

class InvalidConstructorPathError extends AbstractTreeError {
  getMessage(): string {
    return super.getMessage() + ` No constructor "${this.getLine()}" found. Language grammar "${this.getExtension()}" may need to be fixed.`
  }
}

class MissingRequiredNodeTypeError extends AbstractTreeError {
  constructor(node: GrammarBackedNode | TreeNode, missingWord: jTreeTypes.firstWord) {
    super(node)
    this._missingWord = missingWord
  }

  getMessage(): string {
    return super.getMessage() + ` Missing required node "${this._missingWord}".`
  }

  getSuggestionMessage() {
    return `Insert "${this._missingWord}" on line ${this.getLineNumber() + 1}`
  }

  applySuggestion() {
    return this.getNode().prependLine(this._missingWord)
  }

  private _missingWord: string
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
    return super.getMessage() + ` Extra word "${this.getCell().getWord()}".`
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
  abstract isValid(str: string, programRootNode?: GrammarBackedRootNode): boolean
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
class EnumFromGrammarTestNode extends AbstractGrammarWordTestNode {
  _getEnumFromGrammar(programRootNode: GrammarBackedRootNode): jTreeTypes.stringMap {
    const nodeTypes = this.getWordsFrom(1)
    const enumGroup = nodeTypes.join(" ")
    // note: hack where we store it on the program. otherwise has global effects.
    if (!(<any>programRootNode)._enumMaps) (<any>programRootNode)._enumMaps = {}
    if ((<any>programRootNode)._enumMaps[enumGroup]) return (<any>programRootNode)._enumMaps[enumGroup]

    const wordIndex = 1
    const map: jTreeTypes.stringMap = {}
    programRootNode.findNodes(nodeTypes).forEach(node => {
      map[node.getWord(wordIndex)] = true
    })
    ;(<any>programRootNode)._enumMaps[enumGroup] = map
    return map
  }

  // todo: remove
  isValid(str: string, programRootNode: GrammarBackedRootNode) {
    return this._getEnumFromGrammar(programRootNode)[str] === true
  }
}

class GrammarEnumTestNode extends AbstractGrammarWordTestNode {
  private _map: jTreeTypes.stringMap

  isValid(str: string) {
    // enum c c++ java
    return !!this.getOptions()[str]
  }

  getOptions() {
    if (!this._map) this._map = TreeUtils.arrayToMap(this.getWordsFrom(1))
    return this._map
  }
}

abstract class AbstractExtendibleTreeNode extends TreeNode {
  _getFromExtended(firstWordPath: jTreeTypes.firstWordPath) {
    const hit = this._getNodeFromExtended(firstWordPath)
    return hit ? hit.get(firstWordPath) : undefined
  }

  // todo: be more specific with the param
  _getChildrenByNodeConstructorInExtended(constructor: Function): TreeNode[] {
    return (<any>this._getAncestorsArray().map(node => node.getChildrenByNodeConstructor(constructor))).flat()
  }

  _getExtendedParent() {
    return this._getAncestorsArray()[1]
  }

  _hasFromExtended(firstWordPath: jTreeTypes.firstWordPath) {
    return !!this._getNodeFromExtended(firstWordPath)
  }

  _getNodeFromExtended(firstWordPath: jTreeTypes.firstWordPath) {
    return this._getAncestorsArray().find(node => node.has(firstWordPath))
  }

  doesExtend(className: string) {
    if (!this._cache_ancestorSet) this._cache_ancestorSet = new Set(this._getAncestorsArray().map(def => def._getId()))
    return this._cache_ancestorSet.has(className)
  }

  abstract _getId(): string

  private _cache_ancestorSet: Set<jTreeTypes.nodeTypeId>
  private _cache_ancestorsArray: AbstractExtendibleTreeNode[]

  // Note: the order is: [this, parent, grandParent, ...]
  _getAncestorsArray(cannotContainNodes?: AbstractExtendibleTreeNode[]) {
    this._initAncestorsArrayCache(cannotContainNodes)
    return this._cache_ancestorsArray
  }

  private _getIdThatThisExtends() {
    return this.get(GrammarConstants.extends)
  }

  abstract _getIdToNodeMap(): { [id: string]: AbstractExtendibleTreeNode }

  protected _initAncestorsArrayCache(cannotContainNodes?: AbstractExtendibleTreeNode[]): void {
    if (this._cache_ancestorsArray) return undefined
    if (cannotContainNodes && cannotContainNodes.includes(this)) throw new Error(`Loop detected: '${this.getLine()}' is the ancestor of one of its ancestors.`)
    cannotContainNodes = cannotContainNodes || [this]
    let ancestors: AbstractExtendibleTreeNode[] = [this]
    const extendedId = this._getIdThatThisExtends()
    if (extendedId) {
      const parentNode = this._getIdToNodeMap()[extendedId]
      if (!parentNode) throw new Error(`${extendedId} not found`)

      ancestors = ancestors.concat(parentNode._getAncestorsArray(cannotContainNodes))
    }
    this._cache_ancestorsArray = ancestors
  }
}

class GrammarCellTypeDefinitionNode extends AbstractExtendibleTreeNode {
  getFirstWordMap() {
    const types: jTreeTypes.stringMap = {}
    types[GrammarConstants.regex] = GrammarRegexTestNode
    types[GrammarConstants.reservedWords] = GrammarReservedWordsTestNode
    types[GrammarConstants.enumFromGrammar] = EnumFromGrammarTestNode
    types[GrammarConstants.enum] = GrammarEnumTestNode
    types[GrammarConstants.highlightScope] = TreeNode
    types[GrammarConstants.todoComment] = TreeNode
    types[GrammarConstants.extends] = TreeNode
    return types
  }

  _getIdToNodeMap() {
    return this._getRootProgramNode().getCellTypeDefinitions()
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
      return ${
        wordToNativeJavascriptTypeParser
          ? `this.getWordsFrom(${wordIndex}).map(val => ${wordToNativeJavascriptTypeParser}(val))`
          : `this.getWordsFrom(${wordIndex})`
      }
    }`
  }

  // `this.getWordsFrom(${requireds.length + 1})`

  // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
  getCellConstructor(): typeof AbstractGrammarBackedCell {
    const kinds: jTreeTypes.stringMap = {}
    kinds[GrammarStandardCellTypeIds.any] = GrammarAnyCell
    kinds[GrammarStandardCellTypeIds.anyFirstWord] = GrammarAnyCell
    kinds[GrammarStandardCellTypeIds.float] = GrammarFloatCell
    kinds[GrammarStandardCellTypeIds.number] = GrammarFloatCell
    kinds[GrammarStandardCellTypeIds.bit] = GrammarBitCell
    kinds[GrammarStandardCellTypeIds.bool] = GrammarBoolCell
    kinds[GrammarStandardCellTypeIds.int] = GrammarIntCell
    return kinds[this.getWord(1)] || kinds[this._getExtendedCellTypeId()] || GrammarAnyCell
  }

  private _getExtendedCellTypeId() {
    return this.get(GrammarConstants.extends)
  }

  getHighlightScope(): string | undefined {
    return this._getFromExtended(GrammarConstants.highlightScope)
  }

  private _getEnumOptions() {
    const enumNode = this._getNodeFromExtended(GrammarConstants.enum)
    if (!enumNode) return undefined

    // we sort by longest first to capture longest match first. todo: add test
    const options = Object.keys((<GrammarEnumTestNode>enumNode.getNode(GrammarConstants.enum)).getOptions())
    options.sort((a, b) => b.length - a.length)

    return options
  }

  private _getEnumFromGrammarOptions(program: GrammarBackedRootNode) {
    const node = this._getNodeFromExtended(GrammarConstants.enumFromGrammar)
    return node ? Object.keys((<EnumFromGrammarTestNode>node.getNode(GrammarConstants.enumFromGrammar))._getEnumFromGrammar(program)) : undefined
  }

  _getRootProgramNode(): GrammarProgram {
    return <GrammarProgram>this.getParent()
  }

  _getAutocompleteWordOptions(program: GrammarBackedRootNode): string[] {
    return this._getEnumOptions() || this._getEnumFromGrammarOptions(program) || []
  }

  getRegexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return this._getFromExtended(GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*")
  }

  isValid(str: string, programRootNode: GrammarBackedRootNode) {
    return this._getChildrenByNodeConstructorInExtended(AbstractGrammarWordTestNode).every(node =>
      (<AbstractGrammarWordTestNode>node).isValid(str, programRootNode)
    )
  }

  getCellTypeId(): jTreeTypes.cellTypeId {
    return this.getWord(1)
  }

  _getId() {
    return this.getCellTypeId()
  }

  public static types: any
}

class GrammarDefinitionErrorNode extends TreeNode {
  getErrors(): jTreeTypes.TreeError[] {
    return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)]
  }

  getLineCellTypes() {
    return [<string>GrammarConstants.nodeType].concat(this.getWordsFrom(1).map(word => GrammarStandardCellTypeIds.any)).join(" ")
  }
}

class GrammarExampleNode extends TreeNode {}

class GrammarCompilerNode extends TreeNode {
  getFirstWordMap() {
    const types = [
      GrammarConstantsCompiler.stringTemplate,
      GrammarConstantsCompiler.indentCharacter,
      GrammarConstantsCompiler.listDelimiter,
      GrammarConstantsCompiler.openChildren,
      GrammarConstantsCompiler.closeChildren
    ]
    const map: jTreeTypes.firstWordToNodeConstructorMap = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    return map
  }
}

abstract class AbstractCustomConstructorNode extends TreeNode {
  protected isAppropriateEnvironment() {
    return true
  }

  abstract _getCustomConstructor(): jTreeTypes.RunTimeNodeConstructor

  getErrors(): InvalidConstructorPathError[] {
    if (!this.isAppropriateEnvironment()) return []

    try {
      // Attempt to load the custom constructor
      this._getCustomConstructor()
      return []
    } catch (err) {
      console.log(err)
      return [new InvalidConstructorPathError(this)]
    }
  }

  getGrammarProgramRoot() {
    return this._getDef().getLanguageDefinitionProgram()
  }

  _getDef() {
    const def = <AbstractGrammarDefinitionNode>this.getParent().getParent()

    if (def instanceof NonRootNodeTypeDefinition) return def
    return def.getLanguageDefinitionProgram()
  }
}

class CustomNodeJsConstructorNode extends AbstractCustomConstructorNode {
  // todo: if we keep this, we need to surface better error messaging with the submodule convention bit.
  _getCustomConstructor(): jTreeTypes.RunTimeNodeConstructor {
    const filepath = this.getContent()
    const rootPath = (<GrammarProgram>this.getRootNode()).getTheGrammarFilePath()
    const basePath = TreeUtils.getPathWithoutFileName(rootPath) + "/"
    const fullPath = filepath.startsWith("/") ? filepath : basePath + filepath

    const theModule = require(fullPath)
    const constructorName = this._getDef()._getGeneratedClassName()
    const constructor = TreeUtils.resolveProperty(theModule, constructorName)
    if (!constructor) throw new Error(`constructor "${constructorName}" not found in "${fullPath}".`)
    return constructor
  }

  protected isAppropriateEnvironment() {
    return this.isNodeJs()
  }
}

class CustomBrowserConstructorNode extends AbstractCustomConstructorNode {
  _getCustomConstructor(): jTreeTypes.RunTimeNodeConstructor {
    // todo: bad idea to have browser and node have reverse ordering for submodulename
    const constructorName = this._getDef()._getGeneratedClassName()
    const constructor = TreeUtils.resolveProperty(window, constructorName)
    if (!constructor) throw new Error(`constructor window.${constructorName} not found.`)

    return constructor
  }

  protected isAppropriateEnvironment() {
    return !this.isNodeJs()
  }
}

class GrammarCustomConstructorsNode extends TreeNode {
  getFirstWordMap() {
    const map: jTreeTypes.firstWordToNodeConstructorMap = {}
    map[GrammarConstants.constructorNodeJs] = CustomNodeJsConstructorNode
    map[GrammarConstants.constructorBrowser] = CustomBrowserConstructorNode
    return map
  }

  getConstructorForEnvironment(): AbstractCustomConstructorNode {
    return <AbstractCustomConstructorNode>this.getNode(this.isNodeJs() ? GrammarConstants.constructorNodeJs : GrammarConstants.constructorBrowser)
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
  getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap {
    // todo: some of these should just be on nonRootNodes
    const types = [
      GrammarConstants.frequency,
      GrammarConstants.inScope,
      GrammarConstants.cells,
      GrammarConstants.extends,
      GrammarConstants.description,
      GrammarConstants.catchAllNodeType,
      GrammarConstants.catchAllCellType,
      GrammarConstants.firstCellType,
      GrammarConstants.tags,
      GrammarConstants.match,
      GrammarConstants.baseNodeType,
      GrammarConstants.required,
      GrammarConstants.abstract,
      GrammarConstants.javascript,
      GrammarConstants.single,
      GrammarConstants.todoComment
    ]

    const map: jTreeTypes.firstWordToNodeConstructorMap = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    map[GrammarConstantsConstantTypes.boolean] = GrammarNodeTypeConstantBoolean
    map[GrammarConstantsConstantTypes.int] = GrammarNodeTypeConstantInt
    map[GrammarConstantsConstantTypes.string] = GrammarNodeTypeConstantString
    map[GrammarConstantsConstantTypes.float] = GrammarNodeTypeConstantFloat
    map[GrammarConstants.compilerNodeType] = GrammarCompilerNode
    map[GrammarConstants.constructors] = GrammarCustomConstructorsNode
    map[GrammarConstants.example] = GrammarExampleNode
    return map
  }

  getConstantsObject() {
    const obj = this._getUniqueConstantNodes()
    Object.keys(obj).forEach(key => {
      obj[key] = obj[key].getConstantValue()
    })
    return obj
  }

  _getUniqueConstantNodes() {
    const obj: { [key: string]: GrammarNodeTypeConstant } = {}
    const items = this._getChildrenByNodeConstructorInExtended(GrammarNodeTypeConstant)
    items.reverse() // Last definition wins.
    items.forEach((node: GrammarNodeTypeConstant) => {
      obj[node.getIdentifier()] = node
    })
    return obj
  }

  getExamples(): GrammarExampleNode[] {
    return this._getChildrenByNodeConstructorInExtended(GrammarExampleNode)
  }

  getNodeTypeIdFromDefinition(): jTreeTypes.nodeTypeId {
    return this.getWord(1)
  }

  abstract _nodeDefToJavascriptClass(isCompiled: boolean, jTreePath?: string, forNodeJs?: boolean): jTreeTypes.javascriptCode

  // todo: remove. just reused nodeTypeId
  _getGeneratedClassName() {
    return this.getNodeTypeIdFromDefinition()
  }

  getNodeConstructorToJavascript(): string {
    const nodeMap = this.getRunTimeFirstWordMapWithDefinitions()

    // if THIS node defines a catch all constructor, use that
    // IF IT DOES NOT, ADD NOTHING
    // if THIS node defines a keyword map, use that first
    // IF IT DOES NOT, ADD NOTHING
    // CHECK PARENTS TOO
    const firstWordMap = this._createRunTimeFirstWordToNodeConstructorMap(this._getMyInScopeNodeTypeIds())

    // todo: use constants in first word maps
    if (Object.keys(firstWordMap).length)
      return `getFirstWordMap() {
  return {${Object.keys(firstWordMap)
    .map(firstWord => `"${firstWord}" : ${nodeMap[firstWord]._getGeneratedClassName()}`)
    .join(",\n")}}
  }`
    return ""
  }

  _isAbstract() {
    return this.has(GrammarConstants.abstract)
  }

  private _cache_definedNodeConstructor: jTreeTypes.RunTimeNodeConstructor

  private _getConstructorFromOldConstructorsNode() {
    // Get custom def node
    // todo: can we ditch?
    const customConstructorsDefinition = this._getNodeFromExtended(GrammarConstants.constructors)
    if (!customConstructorsDefinition) return undefined
    const envConstructor = (<GrammarCustomConstructorsNode>customConstructorsDefinition.getNode(GrammarConstants.constructors)).getConstructorForEnvironment()
    if (envConstructor) return envConstructor._getCustomConstructor()
  }

  _getConstructorDefinedInGrammar() {
    if (!this._cache_definedNodeConstructor) this._cache_definedNodeConstructor = this._initConstructorDefinedInGrammar()
    return this._cache_definedNodeConstructor
  }

  _getFirstWordMatch() {
    return this.get(GrammarConstants.match) || this.getNodeTypeIdFromDefinition()
  }

  private _importNodeJsConstructor(className: string, code: string): jTreeTypes.RunTimeNodeConstructor {
    const vm = require("vm")
    try {
      ;(<any>global).jtree = require(__dirname + "/jtree.node.js").default
      // Todo: do we want to add new classes to global namespace?
      return vm.runInThisContext(`{
 ${code}
 ${className}
}`)
    } catch (err) {
      console.log("Error in code:")
      console.log(code)
      throw err
    }
  }

  private _importBrowserConstructor(code: string): jTreeTypes.RunTimeNodeConstructor {
    const tempClassName = "tempConstructor" + TreeUtils.getRandomString(30)
    const script = document.createElement("script")
    script.innerHTML = `window.${tempClassName} = ${code}`
    document.head.appendChild(script)
    return (<any>window)[tempClassName]
  }

  abstract _getExtendsClassName(isCompiled: boolean): string

  // constructor
  //  extends constructor (baseType)
  //  getters/setters(?) (int/string/float/boolean)
  //  custom code (javascript)

  static _cachedNodeConstructorsFromCode: { [code: string]: jTreeTypes.RunTimeNodeConstructor } = {}

  // todo: always should return a custom constructor for each node type
  /* right now we have nodeType with "constructors nodejs/browser", nodetype with "javascript", nodetype with "baseType", "rootNodeType", node type with "catchAll OR inScope" */
  _initConstructorDefinedInGrammar() {
    let constructor = this._getConstructorFromOldConstructorsNode()

    if (!constructor) {
      // todo: this is not catching if we dont have that but we do have constants.
      const def = <AbstractGrammarDefinitionNode>(this instanceof GrammarDefinitionGrammarNode ? this.getLanguageDefinitionProgram() : this)

      // todo: reuse other code...load things into 1 file?
      const className = def._getGeneratedClassName()
      const extendsClassName = def._getExtendsClassName(false)
      const gettersAndConstants = def._getCellGettersAndNodeTypeConstants()

      const code = `class ${className} extends ${extendsClassName} {
      ${gettersAndConstants}
      ${def._getCustomJavascriptMethods()}
}`
      if (AbstractGrammarDefinitionNode._cachedNodeConstructorsFromCode[code]) return AbstractGrammarDefinitionNode._cachedNodeConstructorsFromCode[code]
      if (this.isNodeJs()) constructor = this._importNodeJsConstructor(this._getGeneratedClassName(), code)
      else constructor = this._importBrowserConstructor(code)
      AbstractGrammarDefinitionNode._cachedNodeConstructorsFromCode[code] = constructor
    }

    return constructor
  }

  getCatchAllNodeConstructor(line: string) {
    return GrammarDefinitionErrorNode
  }

  getLanguageDefinitionProgram(): GrammarProgram {
    return <GrammarProgram>this.getParent()
  }

  protected _getCustomJavascriptMethods(): jTreeTypes.javascriptCode {
    return ""
  }

  private _cache_runTimeFirstWordToNodeConstructorMap: jTreeTypes.firstWordToNodeConstructorMap
  private _cache_runTimeFirstWordToNodeDefMap: { [firstWord: string]: NonRootNodeTypeDefinition }

  getRunTimeFirstWordMap() {
    if (!this._cache_runTimeFirstWordToNodeConstructorMap)
      this._cache_runTimeFirstWordToNodeConstructorMap = this._createRunTimeFirstWordToNodeConstructorMap(this._getInScopeNodeTypeIds())
    return this._cache_runTimeFirstWordToNodeConstructorMap
  }

  getRunTimeFirstWordMapWithDefinitions() {
    if (!this._cache_runTimeFirstWordToNodeDefMap)
      this._cache_runTimeFirstWordToNodeDefMap = this._createRunTimeFirstWordToNodeDefMap(this._getInScopeNodeTypeIds())
    return this._cache_runTimeFirstWordToNodeDefMap
  }

  getRunTimeFirstWordsInScope(): jTreeTypes.nodeTypeId[] {
    return Object.keys(this.getRunTimeFirstWordMap())
  }

  getRequiredCellTypeIds(): jTreeTypes.cellTypeId[] {
    const parameters = this._getFromExtended(GrammarConstants.cells)
    return parameters ? parameters.split(" ") : []
  }

  // todo: what happens when you have a cell getter and constant with same name?
  _getCellGettersAndNodeTypeConstants() {
    // todo: add cellType parsings
    const grammarProgram = this.getLanguageDefinitionProgram()
    const getters = this.getRequiredCellTypeIds().map((cellTypeId, index) => grammarProgram.getCellTypeDefinitionById(cellTypeId).getGetter(index + 1))

    const catchAllCellTypeId = this.getCatchAllCellTypeId()
    if (catchAllCellTypeId) getters.push(grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId).getCatchAllGetter(getters.length + 1))

    // Constants
    Object.values(this._getUniqueConstantNodes()).forEach(node => {
      getters.push(node.getGetter())
    })

    return getters.join("\n")
  }

  getCatchAllCellTypeId(): jTreeTypes.cellTypeId | undefined {
    return this._getFromExtended(GrammarConstants.catchAllCellType)
  }

  protected _createRunTimeFirstWordToNodeConstructorMap(nodeTypeIdsInScope: jTreeTypes.nodeTypeId[]): jTreeTypes.firstWordToNodeConstructorMap {
    const map = this._createRunTimeFirstWordToNodeDefMap(nodeTypeIdsInScope)
    const result: jTreeTypes.firstWordToNodeConstructorMap = {}
    Object.keys(map).forEach(firstWord => {
      result[firstWord] = map[firstWord]._getConstructorDefinedInGrammar()
    })
    return result
  }

  protected _createRunTimeFirstWordToNodeDefMap(nodeTypeIdsInScope: jTreeTypes.nodeTypeId[]): { [firstWord: string]: NonRootNodeTypeDefinition } {
    if (!nodeTypeIdsInScope.length) return {}

    const result: { [firstWord: string]: NonRootNodeTypeDefinition } = {}

    const allProgramNodeTypeDefinitionsMap = this._getProgramNodeTypeDefinitionCache()
    Object.keys(allProgramNodeTypeDefinitionsMap)
      .filter(nodeTypeId => allProgramNodeTypeDefinitionsMap[nodeTypeId].isOrExtendsANodeTypeInScope(nodeTypeIdsInScope))
      .filter(nodeTypeId => !allProgramNodeTypeDefinitionsMap[nodeTypeId]._isAbstract())
      .forEach(nodeTypeId => {
        const def = allProgramNodeTypeDefinitionsMap[nodeTypeId]
        result[def._getFirstWordMatch()] = def
      })
    return result
  }

  // todo: update to better reflect _getFirstWordMatch?
  getTopNodeTypeIds(): jTreeTypes.nodeTypeId[] {
    const definitions = this._getProgramNodeTypeDefinitionCache()
    const firstWords = this.getRunTimeFirstWordMap()
    const arr = Object.keys(firstWords).map(firstWord => definitions[firstWord])
    arr.sort(TreeUtils.sortByAccessor((definition: NonRootNodeTypeDefinition) => definition.getFrequency()))
    arr.reverse()
    return arr.map(definition => definition.getNodeTypeIdFromDefinition())
  }

  protected _getMyInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[] {
    const nodeTypesNode = this.getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }

  protected _getInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[] {
    // todo: allow multiple of these if we allow mixins?
    const ids = this._getMyInScopeNodeTypeIds()
    const parentDef = this._getExtendedParent()
    return parentDef ? ids.concat((<AbstractGrammarDefinitionNode>parentDef)._getInScopeNodeTypeIds()) : ids
  }

  isRequired(): boolean {
    return this._hasFromExtended(GrammarConstants.required)
  }

  // todo: protected?
  _getRunTimeCatchAllNodeTypeId(): jTreeTypes.nodeTypeId {
    return ""
  }

  getNodeTypeDefinitionByNodeTypeId(nodeTypeId: jTreeTypes.nodeTypeId): AbstractGrammarDefinitionNode {
    const definitions = this._getProgramNodeTypeDefinitionCache()
    return definitions[nodeTypeId] || this._getCatchAllNodeTypeDefinition() // todo: this is where we might do some type of firstWord lookup for user defined fns.
  }

  _getCatchAllNodeTypeDefinition(): AbstractGrammarDefinitionNode {
    const catchAllNodeTypeId = this._getRunTimeCatchAllNodeTypeId()
    const definitions = this._getProgramNodeTypeDefinitionCache()
    const def = definitions[catchAllNodeTypeId]
    if (def) return def

    // todo: implement contraints like a grammar file MUST have a catch all.
    if (this.isRoot()) throw new Error(`This grammar language "${this.getLanguageDefinitionProgram().getGrammarName()}" lacks a root catch all definition`)
    else return (<AbstractGrammarDefinitionNode>this.getParent())._getCatchAllNodeTypeDefinition()
  }

  private _cache_catchAllConstructor: jTreeTypes.RunTimeNodeConstructor

  protected _initCatchAllNodeConstructorCache(): void {
    if (this._cache_catchAllConstructor) return undefined

    this._cache_catchAllConstructor = this._getCatchAllNodeTypeDefinition()._getConstructorDefinedInGrammar()
  }

  getFirstCellTypeId(): jTreeTypes.cellTypeId {
    return this._getFromExtended(GrammarConstants.firstCellType) || GrammarStandardCellTypeIds.anyFirstWord
  }

  isDefined(nodeTypeId: string) {
    return !!this._getProgramNodeTypeDefinitionCache()[nodeTypeId.toLowerCase()]
  }

  _getIdToNodeMap() {
    return this._getProgramNodeTypeDefinitionCache()
  }

  protected _getProgramNodeTypeDefinitionCache(): { [nodeTypeId: string]: NonRootNodeTypeDefinition } {
    return this.getLanguageDefinitionProgram()._getProgramNodeTypeDefinitionCache()
  }

  getRunTimeCatchAllNodeConstructor() {
    this._initCatchAllNodeConstructorCache()
    return this._cache_catchAllConstructor
  }
}

class NonRootNodeTypeDefinition extends AbstractGrammarDefinitionNode {
  // todo: protected?
  _getRunTimeCatchAllNodeTypeId(): string {
    return this._getFromExtended(GrammarConstants.catchAllNodeType) || (<AbstractGrammarDefinitionNode>this.getParent())._getRunTimeCatchAllNodeTypeId()
  }

  _getId() {
    return this.getWord(1)
  }

  _getCompilerObject(): jTreeTypes.stringMap {
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
    const catchAllCellTypeId = this.getCatchAllCellTypeId()
    return `${this._getFirstWordMatch()}: ${this.getRequiredCellTypeIds().join(" ")}${catchAllCellTypeId ? ` ${catchAllCellTypeId}...` : ""}`
  }

  isOrExtendsANodeTypeInScope(firstWordsInScope: string[]): boolean {
    const chain = this._getNodeTypeInheritanceSet()
    return firstWordsInScope.some(firstWord => chain.has(firstWord))
  }

  _getExtendsClassName(isCompiled = false): jTreeTypes.javascriptClassPath {
    const baseTypeNames: any = {}
    baseTypeNames[GrammarConstants.blobNode] = "BlobNode"
    baseTypeNames[GrammarConstants.errorNode] = "ErrorNode"
    baseTypeNames[GrammarConstants.terminalNode] = "TerminalNode"
    baseTypeNames[GrammarConstants.nonTerminalNode] = "NonTerminalNode"
    const isNonTerminal = this._getFromExtended(GrammarConstants.inScope) || this._getFromExtended(GrammarConstants.catchAllNodeType)
    const baseNodeTypeName = baseTypeNames[this._getFromExtended(GrammarConstants.baseNodeType)] || (isNonTerminal ? "NonTerminalNode" : "TerminalNode")

    if (!isCompiled) return "jtree." + baseNodeTypeName // todo: this is incorrect but works for legacy stuff.

    const extendedDef = <AbstractGrammarDefinitionNode>this._getExtendedParent()
    return extendedDef ? extendedDef._getGeneratedClassName() : isCompiled ? "jtree.TerminalNode" : "jtree.NonTerminalNode"
  }

  private _getFirstCellHighlightScope() {
    const program = this.getLanguageDefinitionProgram()
    const cellTypeDefinition = program.getCellTypeDefinitionById(this.getFirstCellTypeId())
    // todo: standardize error/capture error at grammar time
    if (!cellTypeDefinition) throw new Error(`No ${GrammarConstants.cellType} ${this.getFirstCellTypeId()} found`)
    return cellTypeDefinition.getHighlightScope()
  }

  getMatchBlock() {
    const defaultHighlightScope = "source"
    const program = this.getLanguageDefinitionProgram()
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const firstWordHighlightScope = (this._getFirstCellHighlightScope() || defaultHighlightScope) + "." + this.getNodeTypeIdFromDefinition()
    const match = `'^ *${escapeRegExp(this._getFirstWordMatch())}(?: |$)'`
    const topHalf = ` '${this.getNodeTypeIdFromDefinition()}':
  - match: ${match}
    scope: ${firstWordHighlightScope}`
    const requiredCellTypeIds = this.getRequiredCellTypeIds()
    const catchAllCellTypeId = this.getCatchAllCellTypeId()
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

  private _cache_nodeTypeInheritanceSet: Set<jTreeTypes.nodeTypeId>
  private _cache_ancestorNodeTypeIdsArray: jTreeTypes.nodeTypeId[]

  _getNodeTypeInheritanceSet() {
    if (!this._cache_nodeTypeInheritanceSet) this._cache_nodeTypeInheritanceSet = new Set(this.getAncestorNodeTypeIdsArray())
    return this._cache_nodeTypeInheritanceSet
  }

  getAncestorNodeTypeIdsArray(): jTreeTypes.nodeTypeId[] {
    if (!this._cache_ancestorNodeTypeIdsArray) {
      this._cache_ancestorNodeTypeIdsArray = this._getAncestorsArray().map(def => (<AbstractGrammarDefinitionNode>def).getNodeTypeIdFromDefinition())
      this._cache_ancestorNodeTypeIdsArray.reverse()
    }
    return this._cache_ancestorNodeTypeIdsArray
  }

  // todo: protected?
  _getProgramNodeTypeDefinitionCache() {
    return this.getLanguageDefinitionProgram()._getProgramNodeTypeDefinitionCache()
  }

  // todo: remove
  getDoc() {
    return this.getNodeTypeIdFromDefinition()
  }

  getDescription(): string {
    return this._getFromExtended(GrammarConstants.description) || ""
  }

  getFrequency() {
    const val = this._getFromExtended(GrammarConstants.frequency)
    return val ? parseFloat(val) : 0
  }

  private _getExtendedNodeTypeId(): jTreeTypes.nodeTypeId {
    const ancestorIds = this.getAncestorNodeTypeIdsArray()
    if (ancestorIds.length > 1) return ancestorIds[ancestorIds.length - 2]
  }

  protected _getCustomJavascriptMethods(): jTreeTypes.javascriptCode {
    const jsCode = this._getNodeFromExtended(GrammarConstants.javascript)
    return jsCode ? jsCode.getNode(GrammarConstants.javascript).childrenToString() : ""
  }

  _nodeDefToJavascriptClass(isCompiled = true): jTreeTypes.javascriptCode {
    const components = [this.getNodeConstructorToJavascript(), this._getCellGettersAndNodeTypeConstants(), this._getCustomJavascriptMethods()].filter(
      code => code
    )

    return `class ${this._getGeneratedClassName()} extends ${this._getExtendsClassName(isCompiled)} {
      ${components.join("\n")}
    }`
  }
}

// todo: is this extending the correct class? Should it just be extending TreeNode?
class GrammarDefinitionGrammarNode extends AbstractGrammarDefinitionNode {
  _nodeDefToJavascriptClass() {
    return ""
  }

  // todo: this shouldnt be here?
  _getId() {
    return ""
  }

  _getGeneratedClassName() {
    return this.getLanguageDefinitionProgram()._getGeneratedClassName()
  }

  getTargetExtension() {
    return this.get(GrammarConstants.compilesTo)
  }

  // todo: I think this may be a sign we dont want this class.
  _getExtendsClassName() {
    return "jtree.GrammarBackedRootNode"
  }

  getLanguageDefinitionProgram() {
    return <GrammarProgram>this.getParent()
  }

  getFirstWordMap() {
    // todo: this isn't quite correct. we are allowing too many firstWords.
    const map = super.getFirstWordMap()
    map[GrammarConstants.extensions] = TreeNode
    map[GrammarConstants.version] = TreeNode
    map[GrammarConstants.compilesTo] = TreeNode
    map[GrammarConstants.name] = TreeNode
    map[GrammarConstants.nodeTypeOrder] = TreeNode
    map[GrammarConstants.javascript] = TreeNode
    map[GrammarConstants.todoComment] = TreeNode
    map[GrammarConstantsConstantTypes.boolean] = GrammarNodeTypeConstantBoolean
    map[GrammarConstantsConstantTypes.int] = GrammarNodeTypeConstantInt
    map[GrammarConstantsConstantTypes.string] = GrammarNodeTypeConstantString
    map[GrammarConstantsConstantTypes.float] = GrammarNodeTypeConstantFloat
    return map
  }
}

// GrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class GrammarProgram extends AbstractGrammarDefinitionNode {
  getFirstWordMap() {
    const map: jTreeTypes.stringMap = {}
    map[GrammarConstants.grammar] = GrammarDefinitionGrammarNode
    map[GrammarConstants.cellType] = GrammarCellTypeDefinitionNode
    map[GrammarConstants.nodeType] = NonRootNodeTypeDefinition
    map[GrammarConstants.toolingDirective] = TreeNode
    map[GrammarConstants.todoComment] = TreeNode
    return map
  }

  // todo: this shouldnt be here?
  _getId() {
    return ""
  }

  _getExtendsClassName(isCompiled = false) {
    return "jtree.GrammarBackedRootNode"
  }

  protected _getCustomJavascriptMethods(): jTreeTypes.javascriptCode {
    const jsCode = this._getGrammarGrammarNode().getNode(GrammarConstants.javascript)
    return jsCode ? jsCode.childrenToString() : ""
  }

  getErrorsInGrammarExamples() {
    const programConstructor = this.getRootConstructor()
    const errors: jTreeTypes.TreeError[] = []
    this.getConcreteAndAbstractNodeTypeDefinitions().forEach(def =>
      def.getExamples().forEach(example => {
        const exampleProgram = new programConstructor(example.childrenToString())
        exampleProgram.getAllErrors().forEach(err => {
          errors.push(err)
        })
      })
    )
    return errors
  }

  getTargetExtension() {
    return this._getGrammarGrammarNode().getTargetExtension()
  }

  getNodeTypeOrder() {
    return this._getGrammarGrammarNode().get(GrammarConstants.nodeTypeOrder)
  }

  private _cache_cellTypes: {
    [name: string]: GrammarCellTypeDefinitionNode
  }

  getCellTypeDefinitions() {
    if (!this._cache_cellTypes) this._cache_cellTypes = this._getCellTypeDefinitions()
    return this._cache_cellTypes
  }

  getCellTypeDefinitionById(cellTypeId: jTreeTypes.cellTypeId) {
    // todo: return unknownCellTypeDefinition? or is that handled somewhere else?
    return this.getCellTypeDefinitions()[cellTypeId]
  }

  getNodeTypeFamilyTree() {
    const tree = new TreeNode()
    Object.values(this.getConcreteAndAbstractNodeTypeDefinitions()).forEach(node => {
      const path = node.getAncestorNodeTypeIdsArray().join(" ")
      tree.touchNode(path)
    })
    return tree
  }

  protected _getCellTypeDefinitions() {
    const types: { [typeName: string]: GrammarCellTypeDefinitionNode } = {}
    // todo: add built in word types?
    this.getChildrenByNodeConstructor(GrammarCellTypeDefinitionNode).forEach(type => (types[(<GrammarCellTypeDefinitionNode>type).getCellTypeId()] = type))
    return types
  }

  getLanguageDefinitionProgram() {
    return this
  }

  getConcreteAndAbstractNodeTypeDefinitions() {
    return <NonRootNodeTypeDefinition[]>this.getChildrenByNodeConstructor(NonRootNodeTypeDefinition)
  }

  // todo: remove?
  getTheGrammarFilePath() {
    return this.getLine()
  }

  protected _getGrammarGrammarNode() {
    return <GrammarDefinitionGrammarNode>this.getNodeByType(GrammarDefinitionGrammarNode)
  }

  getExtensionName() {
    return this.getGrammarName()
  }

  getGrammarName(): string | undefined {
    return this._getGrammarGrammarNode().get(GrammarConstants.name)
  }

  protected _getMyInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[] {
    const nodeTypesNode = this._getGrammarGrammarNode().getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }

  protected _getInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[] {
    const nodeTypesNode = this._getGrammarGrammarNode().getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }

  private _cachedDefinitions: {
    [firstWord: string]: AbstractGrammarDefinitionNode
  }

  getNodeTypeDefinitionByFirstWordPath(firstWordPath: string): AbstractGrammarDefinitionNode {
    if (!this._cachedDefinitions) this._cachedDefinitions = {}
    if (this._cachedDefinitions[firstWordPath]) return this._cachedDefinitions[firstWordPath]

    const parts = firstWordPath.split(" ")
    let subject: AbstractGrammarDefinitionNode = this
    let def
    for (let index = 0; index < parts.length; index++) {
      const part = parts[index]
      def = subject.getRunTimeFirstWordMapWithDefinitions()[part]
      if (!def) def = <AbstractGrammarDefinitionNode>subject._getCatchAllNodeTypeDefinition()
      subject = def
    }

    this._cachedDefinitions[firstWordPath] = def
    return def
  }

  // At present we only have global nodeType definitions (you cannot have scoped nodeType definitions right now).
  private _cache_nodeTypeDefinitions: { [nodeTypeId: string]: NonRootNodeTypeDefinition }

  protected _initProgramNodeTypeDefinitionCache(): void {
    if (this._cache_nodeTypeDefinitions) return undefined

    this._cache_nodeTypeDefinitions = {}

    this.getChildrenByNodeConstructor(NonRootNodeTypeDefinition).forEach(nodeTypeDefinitionNode => {
      this._cache_nodeTypeDefinitions[(<NonRootNodeTypeDefinition>nodeTypeDefinitionNode).getNodeTypeIdFromDefinition()] = nodeTypeDefinitionNode
    })
  }

  _getProgramNodeTypeDefinitionCache() {
    this._initProgramNodeTypeDefinitionCache()
    return this._cache_nodeTypeDefinitions
  }

  _getRunTimeCatchAllNodeTypeId(): string {
    return this._getGrammarGrammarNode().get(GrammarConstants.catchAllNodeType)
  }

  private _getRootConstructor(): AbstractRuntimeProgramConstructorInterface {
    const extendedConstructor: any = this._getGrammarGrammarNode()._getConstructorDefinedInGrammar()
    const grammarProgram = this

    // Note: this is some of the most unorthodox code in this repo. We create a class on the fly for your
    // new language.
    return <AbstractRuntimeProgramConstructorInterface>(<any>class extends extendedConstructor {
      getGrammarProgramRoot(): GrammarProgram {
        return grammarProgram
      }
    })
  }

  private _cache_rootConstructorClass: AbstractRuntimeProgramConstructorInterface

  getRootConstructor() {
    if (!this._cache_rootConstructorClass) this._cache_rootConstructorClass = this._getRootConstructor()
    return this._cache_rootConstructorClass
  }

  private _getFileExtensions(): string {
    return this._getGrammarGrammarNode().get(GrammarConstants.extensions)
      ? this._getGrammarGrammarNode()
          .get(GrammarConstants.extensions)
          .split(" ")
          .join(",")
      : this.getExtensionName()
  }

  toNodeJsJavascript(jtreePath = "jtree"): jTreeTypes.javascriptCode {
    return this._nodeDefToJavascriptClass(true, jtreePath, true).trim()
  }

  // todo: have this here or not?
  toNodeJsJavascriptPrettier(jtreePath = "jtree"): jTreeTypes.javascriptCode {
    return require("prettier").format(this.toNodeJsJavascript(jtreePath), { semi: false, parser: "babel", printWidth: 160 })
  }

  toBrowserJavascript(): jTreeTypes.javascriptCode {
    return this._nodeDefToJavascriptClass(true, "", false).trim()
  }

  toBrowserJavascriptPrettier(): jTreeTypes.javascriptCode {
    return require("prettier").format(this.toBrowserJavascript(), { semi: false, parser: "babel", printWidth: 160 })
  }

  private _getProperName() {
    return TreeUtils.ucfirst(this.getExtensionName())
  }

  _getGeneratedClassName() {
    return this._getProperName() + "ProgramRoot"
  }

  private _getCatchAllNodeConstructorToJavascript() {
    const nodeTypeId = this._getRunTimeCatchAllNodeTypeId()
    if (!nodeTypeId) return ""
    const className = this.getNodeTypeDefinitionByNodeTypeId(nodeTypeId)._getGeneratedClassName()
    return `getCatchAllNodeConstructor() { return ${className}}`
  }

  _nodeDefToJavascriptClass(isCompiled: boolean, jtreePath: string, forNodeJs = true): jTreeTypes.javascriptCode {
    const defs = this.getConcreteAndAbstractNodeTypeDefinitions()
    const nodeTypeClasses = defs.map(def => def._nodeDefToJavascriptClass()).join("\n\n")

    const constantsName = this._getProperName() + "Constants"
    const nodeTypeConstants = defs
      .map(def => {
        const id = def.getNodeTypeIdFromDefinition()
        return `"${id}": "${id}"`
      })
      .join(",\n")
    const cellTypeConstants = Object.keys(this.getCellTypeDefinitions())
      .map(id => `"${id}" : "${id}"`)
      .join(",\n")

    const rootClassMethods = [this.getNodeConstructorToJavascript(), this._getCatchAllNodeConstructorToJavascript(), this._getCustomJavascriptMethods()].filter(
      code => code
    )
    const rootClass = `class ${this._getGeneratedClassName()} extends ${this._getExtendsClassName(isCompiled)} {
  ${rootClassMethods.join("\n")}


      getGrammarProgramRoot() {
        if (!this._cachedGrammarProgramRoot)
          this._cachedGrammarProgramRoot = jtree.GrammarProgram.newFromCondensed(\`${TreeUtils.escapeBackTicks(this.toString().replace(/\\/g, "\\\\"))}\`)
        return this._cachedGrammarProgramRoot
      }

    }`

    return `"use strict";

${forNodeJs ? `const jtree = require("${jtreePath}")` : ""}

const ${constantsName} = {
  nodeTypes: {
    ${nodeTypeConstants}
  },
  cellTypes: {
    ${cellTypeConstants}
  }
}

${nodeTypeClasses}

${rootClass}

${forNodeJs ? `module.exports = {${constantsName}, ` + this._getGeneratedClassName() + "}" : ""}
`
  }

  toSublimeSyntaxFile() {
    const cellTypeDefs = this.getCellTypeDefinitions()
    const variables = Object.keys(cellTypeDefs)
      .map(name => ` ${name}: '${cellTypeDefs[name].getRegexString()}'`)
      .join("\n")

    const defs = this.getConcreteAndAbstractNodeTypeDefinitions().filter(kw => !kw._isAbstract())
    const nodeTypeContexts = defs.map(def => def.getMatchBlock()).join("\n\n")
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

  // A language where anything goes.
  // todo: can we remove? can we make the default language not require any grammar node?
  static getTheAnyLanguageRootConstructor() {
    return this.newFromCondensed(
      `${GrammarConstants.grammar}
 ${GrammarConstants.name} anyLanguage
 ${GrammarConstants.catchAllNodeType} anyNode
${GrammarConstants.nodeType} anyNode
 ${GrammarConstants.catchAllCellType} anyWord
 ${GrammarConstants.firstCellType} anyWord
${GrammarConstants.cellType} anyWord`
    ).getRootConstructor()
  }

  static newFromCondensed(grammarCode: string, grammarPath?: jTreeTypes.filepath) {
    return new GrammarProgram(grammarCode, grammarPath)
  }

  // todo: we could probably remove once we switch to compiled
  async loadAllConstructorScripts(baseUrlPath: string): Promise<string[]> {
    if (!this.isBrowser()) return undefined
    const uniqueScriptsSet = new Set(
      this.getNodesByGlobPath(`* ${GrammarConstants.constructors} ${GrammarConstants.constructorBrowser}`)
        .filter(node => node.getWord(2))
        .map(node => baseUrlPath + node.getWord(2))
    )

    return Promise.all(Array.from(uniqueScriptsSet).map(script => GrammarProgram._appendScriptOnce(script)))
  }

  private static _scriptLoadingPromises: { [url: string]: Promise<string> } = {}

  private static async _appendScriptOnce(url: string) {
    // if (this.isNodeJs()) return undefined
    if (!url) return undefined
    if (this._scriptLoadingPromises[url]) return this._scriptLoadingPromises[url]

    this._scriptLoadingPromises[url] = this._appendScript(url)
    return this._scriptLoadingPromises[url]
  }

  private static _appendScript(url: string) {
    //https://bradb.net/blog/promise-based-js-script-loader/
    return new Promise<string>(function(resolve, reject) {
      let resolved = false
      const scriptEl = document.createElement("script")

      scriptEl.type = "text/javascript"
      scriptEl.src = url
      scriptEl.async = true
      scriptEl.onload = (<any>scriptEl).onreadystatechange = function() {
        if (!resolved && (!this.readyState || this.readyState == "complete")) {
          resolved = true
          resolve(url)
        }
      }
      scriptEl.onerror = scriptEl.onabort = reject
      document.head.appendChild(scriptEl)
    })
  }
}

export {
  GrammarConstants,
  GrammarStandardCellTypeIds,
  GrammarProgram,
  GrammarBackedBlobNode,
  GrammarBackedErrorNode,
  GrammarBackedRootNode,
  GrammarBackedTerminalNode,
  GrammarBackedNonTerminalNode
}
