import { AbstractNode } from "./AbstractNode.node"
import { scrollNotationTypes } from "../products/scrollNotationTypes"

const { Utils } = require("../products/Utils.js")

declare type int = scrollNotationTypes.int
declare type word = scrollNotationTypes.word

declare type cellFn = (str: string, rowIndex: int, colIndex: int) => any
declare type mapFn = (value: any, index: int, array: any[]) => any

enum FileFormat {
  csv = "csv",
  tsv = "tsv",
  tree = "tree"
}

const TN_WORD_BREAK_SYMBOL = " "
const TN_EDGE_SYMBOL = " "
const TN_NODE_BREAK_SYMBOL = "\n"

declare type removeAfterRunning = boolean

declare type TreeEventHandler = (event: AbstractTreeEvent) => removeAfterRunning

abstract class AbstractTreeEvent {
  public targetNode: TreeNode
  constructor(targetNode: TreeNode) {
    this.targetNode = targetNode
  }
}

class ChildAddedTreeEvent extends AbstractTreeEvent {}
class ChildRemovedTreeEvent extends AbstractTreeEvent {}
class DescendantChangedTreeEvent extends AbstractTreeEvent {}
class LineChangedTreeEvent extends AbstractTreeEvent {}

class TreeWord {
  private _node: TreeNode
  private _cellIndex: number
  constructor(node: TreeNode, cellIndex: number) {
    this._node = node
    this._cellIndex = cellIndex
  }
  replace(newWord: string) {
    this._node.setWord(this._cellIndex, newWord)
  }
  get word() {
    return this._node.getWord(this._cellIndex)
  }
}

const TreeEvents = { ChildAddedTreeEvent, ChildRemovedTreeEvent, DescendantChangedTreeEvent, LineChangedTreeEvent }

enum WhereOperators {
  equal = "=",
  notEqual = "!=",
  lessThan = "<",
  lessThanOrEqual = "<=",
  greaterThan = ">",
  greaterThanOrEqual = ">=",
  includes = "includes",
  doesNotInclude = "doesNotInclude",
  in = "in",
  notIn = "notIn",
  empty = "empty",
  notEmpty = "notEmpty"
}

enum ScrollNotationConstants {
  extends = "extends"
}

class ParserCombinator {
  // todo: should getErrors be under here? At least for certain types of errors?
  private _catchAllParser: scrollNotationTypes.TreeParser
  private _firstWordMap: Map<string, Function>
  private _regexTests: scrollNotationTypes.regexTest[]
  constructor(catchAllParser: scrollNotationTypes.TreeParser, firstWordMap: scrollNotationTypes.firstWordToParserMap = {}, regexTests: scrollNotationTypes.regexTest[] = undefined) {
    this._catchAllParser = catchAllParser
    this._firstWordMap = new Map(Object.entries(firstWordMap))
    this._regexTests = regexTests
  }

  getFirstWordOptions() {
    return Array.from(this._getFirstWordMap().keys())
  }

  // todo: remove
  private _getFirstWordMap() {
    return this._firstWordMap
  }

  // todo: remove
  _getFirstWordMapAsObject() {
    let obj: scrollNotationTypes.firstWordToParserMap = {}
    const map = this._getFirstWordMap()
    for (let [key, val] of map.entries()) {
      obj[key] = val
    }
    return obj
  }

  _getParser(line: string, contextNode: scrollNotationTypes.treeNode, wordBreakSymbol = TN_WORD_BREAK_SYMBOL): scrollNotationTypes.TreeParser {
    return this._getFirstWordMap().get(this._getFirstWord(line, wordBreakSymbol)) || this._getParserFromRegexTests(line) || this._getCatchAllParser(contextNode)
  }

  _getCatchAllParser(contextNode: scrollNotationTypes.treeNode) {
    if (this._catchAllParser) return this._catchAllParser

    const parent = contextNode.parent

    if (parent) return parent._getParser()._getCatchAllParser(parent)

    return contextNode.constructor
  }

  private _getParserFromRegexTests(line: string): scrollNotationTypes.TreeParser {
    if (!this._regexTests) return undefined
    const hit = this._regexTests.find(test => test.regex.test(line))
    if (hit) return hit.parser
    return undefined
  }

  private _getFirstWord(line: string, wordBreakSymbol: string) {
    const firstBreak = line.indexOf(wordBreakSymbol)
    return line.substr(0, firstBreak > -1 ? firstBreak : undefined)
  }
}

class TreeNode extends AbstractNode {
  constructor(children?: scrollNotationTypes.children, line?: string, parent?: TreeNode) {
    super()
    this._parent = parent
    this._setLine(line)
    this._setChildren(children)
  }

  private _uid: int
  private _words: string[]
  private _parent: TreeNode | undefined
  private _children: TreeNode[]
  private _line: string
  private _index: {
    [firstWord: string]: int
  }

  execute() {}

  async loadRequirements(context: any) {
    // todo: remove
    await Promise.all(this.map(node => node.loadRequirements(context)))
  }

  getErrors(): scrollNotationTypes.TreeError[] {
    return []
  }

  get lineCellTypes() {
    // todo: make this any a constant
    return "undefinedCellType ".repeat(this.words.length).trim()
  }

  isNodeJs() {
    return typeof exports !== "undefined"
  }

  isBrowser() {
    return !this.isNodeJs()
  }

  getOlderSiblings() {
    if (this.isRoot()) return []
    return this.parent.slice(0, this.getIndex())
  }

  protected _getClosestOlderSibling(): TreeNode | undefined {
    const olderSiblings = this.getOlderSiblings()
    return olderSiblings[olderSiblings.length - 1]
  }

  getYoungerSiblings() {
    if (this.isRoot()) return []
    return this.parent.slice(this.getIndex() + 1)
  }

  getSiblings() {
    if (this.isRoot()) return []
    return this.parent.filter(node => node !== this)
  }

  protected _getUid() {
    if (!this._uid) this._uid = TreeNode._makeUniqueId()
    return this._uid
  }

  // todo: rename getMother? grandMother et cetera?
  get parent() {
    return this._parent
  }

  getIndentLevel(relativeTo?: TreeNode) {
    return this._getIndentLevel(relativeTo)
  }

  get indentation() {
    const indentLevel = this._getIndentLevel() - 1
    if (indentLevel < 0) return ""
    return this.edgeSymbol.repeat(indentLevel)
  }

  protected _getTopDownArray<Parser = TreeNode>(arr: Parser[]) {
    this.forEach(child => {
      arr.push(child)
      child._getTopDownArray(arr)
    })
  }

  get topDownArray(): TreeNode[] {
    const arr: TreeNode[] = []
    this._getTopDownArray(arr)
    return arr
  }

  *getTopDownArrayIterator(): IterableIterator<TreeNode> {
    for (let child of this.getChildren()) {
      yield child
      yield* child.getTopDownArrayIterator()
    }
  }

  nodeAtLine(lineNumber: scrollNotationTypes.positiveInt): TreeNode | undefined {
    let index = 0
    for (let node of this.getTopDownArrayIterator()) {
      if (lineNumber === index) return node
      index++
    }
  }

  get numberOfLines(): int {
    let lineCount = 0
    for (let node of this.getTopDownArrayIterator()) {
      lineCount++
    }
    return lineCount
  }

  private _getMaxUnitsOnALine() {
    let max = 0
    for (let node of this.getTopDownArrayIterator()) {
      const count = node.words.length + node.getIndentLevel()
      if (count > max) max = count
    }
    return max
  }

  get numberOfWords(): int {
    let wordCount = 0
    for (let node of this.getTopDownArrayIterator()) {
      wordCount += node.words.length
    }
    return wordCount
  }

  get lineNumber(): int {
    return this._getLineNumberRelativeTo()
  }

  protected _cachedLineNumber: int
  _getLineNumber(target: TreeNode = this) {
    if (this._cachedLineNumber) return this._cachedLineNumber
    let lineNumber = 1
    for (let node of this.root.getTopDownArrayIterator()) {
      if (node === target) return lineNumber
      lineNumber++
    }
    return lineNumber
  }

  isBlankLine(): boolean {
    return !this.length && !this.getLine()
  }

  hasDuplicateFirstWords(): boolean {
    return this.length ? new Set(this.getFirstWords()).size !== this.length : false
  }

  isEmpty(): boolean {
    return !this.length && !this.content
  }

  protected _getLineNumberRelativeTo(relativeTo?: TreeNode) {
    if (this.isRoot(relativeTo)) return 0
    const start = relativeTo || this.root
    return start._getLineNumber(this)
  }

  isRoot(relativeTo?: TreeNode): boolean {
    return relativeTo === this || !this.parent
  }

  get root() {
    return this._getRootNode()
  }

  protected _getRootNode(relativeTo?: TreeNode): TreeNode | this {
    if (this.isRoot(relativeTo)) return this
    return this.parent._getRootNode(relativeTo)
  }

  toString(indentCount = 0, language = this): string {
    if (this.isRoot()) return this._childrenToString(indentCount, language)
    return language.edgeSymbol.repeat(indentCount) + this.getLine(language) + (this.length ? language.nodeBreakSymbol + this._childrenToString(indentCount + 1, language) : "")
  }

  get asString() {
    return this.toString()
  }

  printLinesFrom(start: scrollNotationTypes.int, quantity: scrollNotationTypes.int) {
    return this._printLinesFrom(start, quantity, false)
  }

  printLinesWithLineNumbersFrom(start: scrollNotationTypes.int, quantity: scrollNotationTypes.int) {
    return this._printLinesFrom(start, quantity, true)
  }

  private _printLinesFrom(start: scrollNotationTypes.int, quantity: scrollNotationTypes.int, printLineNumbers: boolean) {
    // todo: use iterator for better perf?
    const end = start + quantity
    this.toString()
      .split("\n")
      .slice(start, end)
      .forEach((line, index) => {
        if (printLineNumbers) console.log(`${start + index} ${line}`)
        else console.log(line)
      })
    return this
  }

  getWord(index: int): word {
    const words = this._getWords(0)
    if (index < 0) index = words.length + index
    return words[index]
  }

  get list() {
    return this.getWordsFrom(1)
  }

  protected _toHtml(indentCount: int) {
    const path = this.getPathVector().join(" ")
    const classes = {
      nodeLine: "nodeLine",
      edgeSymbol: "edgeSymbol",
      nodeBreakSymbol: "nodeBreakSymbol",
      nodeChildren: "nodeChildren"
    }
    const edge = this.edgeSymbol.repeat(indentCount)
    // Set up the firstWord part of the node
    const edgeHtml = `<span class="${classes.nodeLine}" data-pathVector="${path}"><span class="${classes.edgeSymbol}">${edge}</span>`
    const lineHtml = this._getLineHtml()
    const childrenHtml = this.length ? `<span class="${classes.nodeBreakSymbol}">${this.nodeBreakSymbol}</span>` + `<span class="${classes.nodeChildren}">${this._childrenToHtml(indentCount + 1)}</span>` : ""

    return `${edgeHtml}${lineHtml}${childrenHtml}</span>`
  }

  protected _getWords(startFrom: int) {
    if (!this._words) this._words = this._getLine().split(this.wordBreakSymbol)
    return startFrom ? this._words.slice(startFrom) : this._words
  }

  get words(): word[] {
    return this._getWords(0)
  }

  doesExtend(parserId: scrollNotationTypes.parserId) {
    return false
  }

  require(moduleName: string, filePath?: string): any {
    if (!this.isNodeJs()) return (<any>window)[moduleName]
    return require(filePath || moduleName)
  }

  getWordsFrom(startFrom: int) {
    return this._getWords(startFrom)
  }

  getFirstAncestor(): TreeNode {
    const parent = this.parent
    return parent.isRoot() ? this : parent.getFirstAncestor()
  }

  isLoaded() {
    return true
  }

  private _runTimePhaseErrors: { [phase: string]: any }

  getRunTimePhaseErrors() {
    if (!this._runTimePhaseErrors) this._runTimePhaseErrors = {}
    return this._runTimePhaseErrors
  }

  setRunTimePhaseError(phase: string, errorObject: any) {
    if (errorObject === undefined) delete this.getRunTimePhaseErrors()[phase]
    else this.getRunTimePhaseErrors()[phase] = errorObject
    return this
  }

  _getJavascriptPrototypeChainUpTo(stopAtClassName = "TreeNode") {
    // todo: cross browser test this
    let constructor: any = this.constructor
    const chain: string[] = []
    while (constructor.name !== stopAtClassName) {
      chain.unshift(constructor.name)
      constructor = constructor.__proto__
    }
    chain.unshift(stopAtClassName)
    return chain
  }

  _getProjectRootDir(): string {
    return this.isRoot() ? "" : this.root._getProjectRootDir()
  }

  // Concat 2 trees amd return a new true, but replace any nodes
  // in this tree that start with the same node from the first tree with
  // that patched version. Does not recurse.
  patch(two: TreeNode) {
    const copy = this.clone()
    two.forEach(node => {
      const hit = copy.getNode(node.getWord(0))
      if (hit) hit.destroy()
    })
    copy.concat(two)
    return copy
  }

  getSparsity() {
    const nodes = this.getChildren()
    const fields = this._getUnionNames()
    let count = 0
    this.getChildren().forEach(node => {
      fields.forEach(field => {
        if (node.has(field)) count++
      })
    })

    return 1 - count / (nodes.length * fields.length)
  }

  // todo: rename. what is the proper term from set/cat theory?
  getBiDirectionalMaps(propertyNameOrFn: mapFn | string, propertyNameOrFn2: mapFn | string = node => node.getWord(0)) {
    const oneToTwo: { [key: string]: string[] } = {}
    const twoToOne: { [key: string]: string[] } = {}
    const is1Str = typeof propertyNameOrFn === "string"
    const is2Str = typeof propertyNameOrFn2 === "string"
    const children = this.getChildren()
    this.forEach((node, index) => {
      const value1 = is1Str ? node.get(propertyNameOrFn) : (<mapFn>propertyNameOrFn)(node, index, children)
      const value2 = is2Str ? node.get(propertyNameOrFn2) : (<mapFn>propertyNameOrFn2)(node, index, children)
      if (value1 !== undefined) {
        if (!oneToTwo[value1]) oneToTwo[value1] = []
        oneToTwo[value1].push(value2)
      }
      if (value2 !== undefined) {
        if (!twoToOne[value2]) twoToOne[value2] = []
        twoToOne[value2].push(value1)
      }
    })
    return [oneToTwo, twoToOne]
  }

  private _getWordIndexCharacterStartPosition(wordIndex: int): scrollNotationTypes.positiveInt {
    const xiLength = this.edgeSymbol.length
    const numIndents = this._getIndentLevel() - 1
    const indentPosition = xiLength * numIndents
    if (wordIndex < 1) return xiLength * (numIndents + wordIndex)
    return indentPosition + this.words.slice(0, wordIndex).join(this.wordBreakSymbol).length + this.wordBreakSymbol.length
  }

  getNodeInScopeAtCharIndex(charIndex: scrollNotationTypes.positiveInt) {
    if (this.isRoot()) return this
    let wordIndex = this.getWordIndexAtCharacterIndex(charIndex)
    if (wordIndex > 0) return this
    let node: TreeNode = this
    while (wordIndex < 1) {
      node = node.parent
      wordIndex++
    }
    return node
  }

  getWordProperties(wordIndex: int) {
    const start = this._getWordIndexCharacterStartPosition(wordIndex)
    const word = wordIndex < 0 ? "" : this.getWord(wordIndex)
    return {
      startCharIndex: start,
      endCharIndex: start + word.length,
      word: word
    }
  }

  fill(fill = "") {
    this.topDownArray.forEach(line => {
      line.words.forEach((word, index) => line.setWord(index, fill))
    })
    return this
  }

  getAllWordBoundaryCoordinates() {
    const coordinates: scrollNotationTypes.wordBoundary[] = []
    let lineIndex = 0
    for (let node of this.getTopDownArrayIterator()) {
      ;(<TreeNode>node).getWordBoundaryCharIndices().forEach((charIndex, wordIndex) => {
        coordinates.push({
          lineIndex: lineIndex,
          charIndex: charIndex,
          wordIndex: wordIndex
        })
      })

      lineIndex++
    }
    return coordinates
  }

  getWordBoundaryCharIndices(): scrollNotationTypes.positiveInt[] {
    let indentLevel = this._getIndentLevel()
    const wordBreakSymbolLength = this.wordBreakSymbol.length
    let elapsed = indentLevel
    return this.words.map((word, wordIndex) => {
      const boundary = elapsed
      elapsed += word.length + wordBreakSymbolLength
      return boundary
    })
  }

  getWordIndexAtCharacterIndex(charIndex: scrollNotationTypes.positiveInt): int {
    // todo: is this correct thinking for handling root?
    if (this.isRoot()) return 0
    const numberOfIndents = this._getIndentLevel(undefined) - 1
    // todo: probably want to rewrite this in a performant way.
    const spots = []
    while (spots.length < numberOfIndents) {
      spots.push(-(numberOfIndents - spots.length))
    }
    this.words.forEach((word, wordIndex) => {
      word.split("").forEach(letter => {
        spots.push(wordIndex)
      })
      spots.push(wordIndex)
    })

    return spots[charIndex]
  }

  // Note: This currently does not return any errors resulting from "required" or "single"
  getAllErrors(lineStartsAt = 1): scrollNotationTypes.TreeError[] {
    const errors: scrollNotationTypes.TreeError[] = []
    for (let node of this.topDownArray) {
      node._cachedLineNumber = lineStartsAt // todo: cleanup
      const errs: scrollNotationTypes.TreeError[] = node.getErrors()
      errs.forEach(err => errors.push(err))
      // delete node._cachedLineNumber
      lineStartsAt++
    }
    return errors
  }

  *getAllErrorsIterator() {
    let line = 1
    for (let node of this.getTopDownArrayIterator()) {
      node._cachedLineNumber = line
      const errs = node.getErrors()
      // delete node._cachedLineNumber
      if (errs.length) yield errs
      line++
    }
  }

  get firstWord(): word {
    return this.words[0]
  }

  get content(): string {
    const words = this.getWordsFrom(1)
    return words.length ? words.join(this.wordBreakSymbol) : undefined
  }

  get contentWithChildren(): string {
    // todo: deprecate
    const content = this.content
    return (content ? content : "") + (this.length ? this.nodeBreakSymbol + this._childrenToString() : "")
  }

  getFirstNode(): TreeNode {
    return this.nodeAt(0)
  }

  getStack() {
    return this._getStack()
  }

  protected _getStack(relativeTo?: TreeNode): TreeNode[] {
    if (this.isRoot(relativeTo)) return []
    const parent = this.parent
    if (parent.isRoot(relativeTo)) return [this]
    else return parent._getStack(relativeTo).concat([this])
  }

  getStackString(): string {
    return this._getStack()
      .map((node, index) => this.edgeSymbol.repeat(index) + node.getLine())
      .join(this.nodeBreakSymbol)
  }

  getLine(language?: TreeNode) {
    if (!this._words && !language) return this._getLine() // todo: how does this interact with "language" param?
    return this.words.join((language || this).wordBreakSymbol)
  }

  getColumnNames(): word[] {
    return this._getUnionNames()
  }

  getOneHot(column: string) {
    const clone = this.clone()
    const cols = Array.from(new Set(clone.getColumn(column)))
    clone.forEach(node => {
      const val = node.get(column)
      node.delete(column)
      cols.forEach(col => {
        node.set(column + "_" + col, val === col ? "1" : "0")
      })
    })
    return clone
  }

  // todo: return array? getPathArray?
  protected _getFirstWordPath(relativeTo?: TreeNode): scrollNotationTypes.firstWordPath {
    if (this.isRoot(relativeTo)) return ""
    else if (this.parent.isRoot(relativeTo)) return this.firstWord

    return this.parent._getFirstWordPath(relativeTo) + this.edgeSymbol + this.firstWord
  }

  getFirstWordPathRelativeTo(relativeTo?: TreeNode): scrollNotationTypes.firstWordPath {
    return this._getFirstWordPath(relativeTo)
  }

  getFirstWordPath(): scrollNotationTypes.firstWordPath {
    return this._getFirstWordPath()
  }

  getPathVector(): scrollNotationTypes.pathVector {
    return this._getPathVector()
  }

  getPathVectorRelativeTo(relativeTo?: TreeNode): scrollNotationTypes.pathVector {
    return this._getPathVector(relativeTo)
  }

  protected _getPathVector(relativeTo?: TreeNode): scrollNotationTypes.pathVector {
    if (this.isRoot(relativeTo)) return []
    const path = this.parent._getPathVector(relativeTo)
    path.push(this.getIndex())
    return path
  }

  getIndex(): int {
    return this.parent._indexOfNode(this)
  }

  isTerminal() {
    return !this.length
  }

  protected _getLineHtml() {
    return this.words.map((word, index) => `<span class="word${index}">${Utils.stripHtml(word)}</span>`).join(`<span class="zIncrement">${this.wordBreakSymbol}</span>`)
  }

  protected _getXmlContent(indentCount: scrollNotationTypes.positiveInt) {
    if (this.content !== undefined) return this.contentWithChildren
    return this.length ? `${indentCount === -1 ? "" : "\n"}${this._childrenToXml(indentCount > -1 ? indentCount + 2 : -1)}${" ".repeat(indentCount)}` : ""
  }

  protected _toXml(indentCount: scrollNotationTypes.positiveInt) {
    const indent = " ".repeat(indentCount)
    const tag = this.firstWord
    return `${indent}<${tag}>${this._getXmlContent(indentCount)}</${tag}>${indentCount === -1 ? "" : "\n"}`
  }

  protected _toObjectTuple() {
    const content = this.content
    const length = this.length
    const hasChildrenNoContent = content === undefined && length
    const hasContentAndHasChildren = content !== undefined && length
    // If the node has a content and a subtree return it as a string, as
    // Javascript object values can't be both a leaf and a tree.
    const tupleValue = hasChildrenNoContent ? this.toObject() : hasContentAndHasChildren ? this.contentWithChildren : content
    return [this.firstWord, tupleValue]
  }

  protected _indexOfNode(needleNode: TreeNode) {
    let result = -1
    this.find((node, index) => {
      if (node === needleNode) {
        result = index
        return true
      }
    })
    return result
  }

  getMaxLineWidth() {
    let maxWidth = 0
    for (let node of this.getTopDownArrayIterator()) {
      const lineWidth = node.getLine().length
      if (lineWidth > maxWidth) maxWidth = lineWidth
    }
    return maxWidth
  }

  toTreeNode() {
    return new TreeNode(this.toString())
  }

  protected _rightPad(newWidth: number, padCharacter: string) {
    const line = this.getLine()
    this.setLine(line + padCharacter.repeat(newWidth - line.length))
    return this
  }

  rightPad(padCharacter = " ") {
    const newWidth = this.getMaxLineWidth()
    this.topDownArray.forEach(node => node._rightPad(newWidth, padCharacter))
    return this
  }

  lengthen(numberOfLines: int) {
    let linesToAdd = numberOfLines - this.numberOfLines
    while (linesToAdd > 0) {
      this.appendLine("")
      linesToAdd--
    }
    return this
  }

  toSideBySide(treesOrStrings: (TreeNode | string)[], delimiter = " ") {
    treesOrStrings = <TreeNode[]>treesOrStrings.map(tree => (tree instanceof TreeNode ? tree : new TreeNode(tree)))
    const clone = this.toTreeNode()
    const nodeBreakSymbol = "\n"
    let next: any
    while ((next = treesOrStrings.shift())) {
      clone.lengthen(next.numberOfLines)
      clone.rightPad()
      next
        .toString()
        .split(nodeBreakSymbol)
        .forEach((line: string, index: number) => {
          const node = clone.nodeAtLine(index)
          node.setLine(node.getLine() + delimiter + line)
        })
    }
    return clone
  }

  toComparison(treeNode: TreeNode | string) {
    const nodeBreakSymbol = "\n"
    const lines = treeNode.toString().split(nodeBreakSymbol)
    return new TreeNode(
      this.toString()
        .split(nodeBreakSymbol)
        .map((line, index) => (lines[index] === line ? "" : "x"))
        .join(nodeBreakSymbol)
    )
  }

  toBraid(treesOrStrings: (TreeNode | string)[]) {
    treesOrStrings.unshift(this)
    const nodeDelimiter = this.nodeBreakSymbol
    return new TreeNode(
      Utils.interweave(treesOrStrings.map(tree => tree.toString().split(nodeDelimiter)))
        .map(line => (line === undefined ? "" : line))
        .join(nodeDelimiter)
    )
  }

  getSlice(startIndexInclusive: int, stopIndexExclusive: int) {
    return new TreeNode(
      this.slice(startIndexInclusive, stopIndexExclusive)
        .map(child => child.toString())
        .join("\n")
    )
  }

  protected _hasColumns(columns: string[]) {
    const words = this.words
    return columns.every((searchTerm, index) => searchTerm === words[index])
  }

  hasWord(index: int, word: string): boolean {
    return this.getWord(index) === word
  }

  getNodeByColumns(...columns: string[]): TreeNode {
    return this.topDownArray.find(node => node._hasColumns(columns))
  }

  getNodeByColumn(index: int, name: string): TreeNode {
    return this.find(node => node.getWord(index) === name)
  }

  protected _getNodesByColumn(index: int, name: word): TreeNode[] {
    return this.filter(node => node.getWord(index) === name)
  }

  // todo: preserve subclasses!
  select(columnNames: string[] | string) {
    columnNames = Array.isArray(columnNames) ? columnNames : [columnNames]
    const result = new TreeNode()
    this.forEach(node => {
      const tree = result.appendLine(node.getLine())
      ;(<string[]>columnNames).forEach((name: string) => {
        const valueNode = node.getNode(name)
        if (valueNode) tree.appendNode(valueNode)
      })
    })
    return result
  }

  selectionToString() {
    return this.getSelectedNodes()
      .map(node => node.toString())
      .join("\n")
  }

  getSelectedNodes() {
    return this.topDownArray.filter(node => node.isSelected())
  }

  clearSelection() {
    this.getSelectedNodes().forEach(node => node.unselectNode())
  }

  // Note: this is for debugging select chains
  print(message = "") {
    if (message) console.log(message)
    console.log(this.toString())
    return this
  }

  // todo: preserve subclasses!
  // todo: preserve links back to parent so you could edit as normal?
  where(columnName: string, operator: WhereOperators, fixedValue?: string | number | string[] | number[]) {
    const isArray = Array.isArray(fixedValue)
    const valueType = isArray ? typeof (<Array<string | number>>fixedValue)[0] : typeof fixedValue
    let parser: Function
    if (valueType === "number") parser = parseFloat
    const fn = (node: TreeNode) => {
      const cell = node.get(columnName)
      const typedCell = parser ? parser(cell) : cell
      if (operator === WhereOperators.equal) return fixedValue === typedCell
      else if (operator === WhereOperators.notEqual) return fixedValue !== typedCell
      else if (operator === WhereOperators.includes) return typedCell !== undefined && typedCell.includes(fixedValue)
      else if (operator === WhereOperators.doesNotInclude) return typedCell === undefined || !typedCell.includes(fixedValue)
      else if (operator === WhereOperators.greaterThan) return typedCell > fixedValue
      else if (operator === WhereOperators.lessThan) return typedCell < fixedValue
      else if (operator === WhereOperators.greaterThanOrEqual) return typedCell >= fixedValue
      else if (operator === WhereOperators.lessThanOrEqual) return typedCell <= fixedValue
      else if (operator === WhereOperators.empty) return !node.has(columnName)
      else if (operator === WhereOperators.notEmpty) return node.has(columnName) || (cell !== "" && cell !== undefined)
      else if (operator === WhereOperators.in && isArray) return (<Array<string | number>>fixedValue).includes(typedCell)
      else if (operator === WhereOperators.notIn && isArray) return !(<Array<string | number>>fixedValue).includes(typedCell)
    }
    const result = new TreeNode()
    this.filter(fn).forEach(node => {
      result.appendNode(node)
    })
    return result
  }

  with(firstWord: string) {
    return this.filter(node => node.has(firstWord))
  }

  without(firstWord: string) {
    return this.filter(node => !node.has(firstWord))
  }

  first(quantity = 1) {
    return this.limit(quantity, 0)
  }

  last(quantity = 1) {
    return this.limit(quantity, this.length - quantity)
  }

  // todo: preserve subclasses!
  limit(quantity: int, offset = 0): TreeNode {
    const result = new TreeNode()
    this.getChildren()
      .slice(offset, quantity + offset)
      .forEach(node => {
        result.appendNode(node)
      })
    return result
  }

  getChildrenFirstArray() {
    const arr: TreeNode[] = []
    this._getChildrenFirstArray(arr)
    return arr
  }

  protected _getChildrenFirstArray(arr: TreeNode[]) {
    this.forEach(child => {
      child._getChildrenFirstArray(arr)
      arr.push(child)
    })
  }

  protected _getIndentLevel(relativeTo?: TreeNode) {
    return this._getStack(relativeTo).length
  }

  getParentFirstArray() {
    const levels = this._getLevels()
    const arr: TreeNode[] = []
    Object.values(levels).forEach(level => {
      level.forEach(item => arr.push(item))
    })
    return arr
  }

  protected _getLevels(): { [level: number]: TreeNode[] } {
    const levels: { [level: number]: TreeNode[] } = {}
    this.topDownArray.forEach(node => {
      const level = node._getIndentLevel()
      if (!levels[level]) levels[level] = []
      levels[level].push(node)
    })
    return levels
  }

  protected _getChildrenArray() {
    if (!this._children) this._children = []
    return this._children
  }

  getLines(): string[] {
    return this.map(node => node.getLine())
  }

  getChildren(): any[] {
    return this._getChildrenArray().slice(0)
  }

  get length(): scrollNotationTypes.positiveInt {
    return this._getChildrenArray().length
  }

  protected _nodeAt(index: int) {
    if (index < 0) index = this.length + index
    return this._getChildrenArray()[index]
  }

  nodeAt(indexOrIndexArray: int | int[]): TreeNode | undefined {
    if (typeof indexOrIndexArray === "number") return this._nodeAt(indexOrIndexArray)

    if (indexOrIndexArray.length === 1) return this._nodeAt(indexOrIndexArray[0])

    const first = indexOrIndexArray[0]
    const node = this._nodeAt(first)
    if (!node) return undefined
    return node.nodeAt(indexOrIndexArray.slice(1))
  }

  // Flatten a tree node into an object like {twitter:"pldb", "twitter.followers":123}.
  // Assumes you have a nested key/value list with no multiline strings.
  toFlatObject(delimiter = ".") {
    let newObject: scrollNotationTypes.stringMap = {}
    const { edgeSymbolRegex } = this
    this.forEach((child: TreeNode, index: number) => {
      newObject[child.getWord(0)] = child.content
      child.topDownArray.forEach((node: TreeNode) => {
        const newColumnName = node.getFirstWordPathRelativeTo(this).replace(edgeSymbolRegex, delimiter)
        const value = node.content
        newObject[newColumnName] = value
      })
    })
    return newObject
  }

  protected _toObject() {
    const obj: scrollNotationTypes.stringMap = {}
    this.forEach(node => {
      const tuple = node._toObjectTuple()
      obj[tuple[0]] = tuple[1]
    })
    return obj
  }

  get asHtml(): scrollNotationTypes.htmlString {
    return this._childrenToHtml(0)
  }

  protected _toHtmlCubeLine(indents = 0, lineIndex = 0, planeIndex = 0): scrollNotationTypes.htmlString {
    const getLine = (cellIndex: number, word = "") =>
      `<span class="htmlCubeSpan" style="top: calc(var(--topIncrement) * ${planeIndex} + var(--rowHeight) * ${lineIndex}); left:calc(var(--leftIncrement) * ${planeIndex} + var(--cellWidth) * ${cellIndex});">${word}</span>`
    let cells: string[] = []
    this.words.forEach((word, index) => (word ? cells.push(getLine(index + indents, word)) : ""))
    return cells.join("")
  }

  get asHtmlCube(): scrollNotationTypes.htmlString {
    return this.map((plane, planeIndex) => plane.topDownArray.map((line: any, lineIndex: number) => line._toHtmlCubeLine(line.getIndentLevel() - 2, lineIndex, planeIndex)).join("")).join("")
  }

  protected _getHtmlJoinByCharacter() {
    return `<span class="nodeBreakSymbol">${this.nodeBreakSymbol}</span>`
  }

  protected _childrenToHtml(indentCount: int) {
    const joinBy = this._getHtmlJoinByCharacter()
    return this.map(node => node._toHtml(indentCount)).join(joinBy)
  }

  protected _childrenToString(indentCount?: int, language = this) {
    return this.map(node => node.toString(indentCount, language)).join(language.nodeBreakSymbol)
  }

  childrenToString(indentCount = 0): string {
    return this._childrenToString(indentCount)
  }

  // todo: implement
  protected _getChildJoinCharacter() {
    return "\n"
  }

  format() {
    this.forEach(child => child.format())
    return this
  }

  compile(): string {
    return this.map(child => child.compile()).join(this._getChildJoinCharacter())
  }

  get asXml(): scrollNotationTypes.xmlString {
    return this._childrenToXml(0)
  }

  toDisk(path: string) {
    if (!this.isNodeJs()) throw new Error("This method only works in Node.js")
    const format = TreeNode._getFileFormat(path)
    const formats = {
      tree: (tree: TreeNode) => tree.toString(),
      csv: (tree: TreeNode) => tree.asCsv,
      tsv: (tree: TreeNode) => tree.asTsv
    }
    this.require("fs").writeFileSync(path, <string>(<any>formats)[format](this), "utf8")
    return this
  }

  _lineToYaml(indentLevel: number, listTag = "") {
    let prefix = " ".repeat(indentLevel)
    if (listTag && indentLevel > 1) prefix = " ".repeat(indentLevel - 2) + listTag + " "
    return prefix + `${this.firstWord}:` + (this.content ? " " + this.content : "")
  }

  _isYamlList() {
    return this.hasDuplicateFirstWords()
  }

  get asYaml() {
    return `%YAML 1.2
---\n${this._childrenToYaml(0).join("\n")}`
  }

  _childrenToYaml(indentLevel: number): string[] {
    if (this._isYamlList()) return this._childrenToYamlList(indentLevel)
    else return this._childrenToYamlAssociativeArray(indentLevel)
  }

  // if your code-to-be-yaml has a list of associative arrays of type N and you don't
  // want the type N to print
  _collapseYamlLine() {
    return false
  }

  _toYamlListElement(indentLevel: number) {
    const children = this._childrenToYaml(indentLevel + 1)
    if (this._collapseYamlLine()) {
      if (indentLevel > 1) return children.join("\n").replace(" ".repeat(indentLevel), " ".repeat(indentLevel - 2) + "- ")
      return children.join("\n")
    } else {
      children.unshift(this._lineToYaml(indentLevel, "-"))
      return children.join("\n")
    }
  }

  _childrenToYamlList(indentLevel: number): string[] {
    return this.map(node => node._toYamlListElement(indentLevel + 2))
  }

  _toYamlAssociativeArrayElement(indentLevel: number) {
    const children = this._childrenToYaml(indentLevel + 1)
    children.unshift(this._lineToYaml(indentLevel))
    return children.join("\n")
  }

  _childrenToYamlAssociativeArray(indentLevel: number): string[] {
    return this.map(node => node._toYamlAssociativeArrayElement(indentLevel))
  }

  get asJsonSubset(): scrollNotationTypes.jsonSubset {
    return JSON.stringify(this.toObject(), null, " ")
  }

  private _toObjectForSerialization(): scrollNotationTypes.SerializedTreeNode {
    return this.length
      ? {
          cells: this.words,
          children: this.map(child => child._toObjectForSerialization())
        }
      : {
          cells: this.words
        }
  }

  get asJson(): string {
    return JSON.stringify({ children: this.map(child => child._toObjectForSerialization()) }, null, " ")
  }

  get asGrid() {
    const WordBreakSymbol = this.wordBreakSymbol
    return this.toString()
      .split(this.nodeBreakSymbol)
      .map(line => line.split(WordBreakSymbol))
  }

  get asGridJson() {
    return JSON.stringify(this.asGrid, null, 2)
  }

  findNodes(firstWordPath: scrollNotationTypes.firstWordPath | scrollNotationTypes.firstWordPath[]): TreeNode[] {
    // todo: can easily speed this up
    const map: any = {}
    if (!Array.isArray(firstWordPath)) firstWordPath = [firstWordPath]
    firstWordPath.forEach(path => (map[path] = true))
    return this.topDownArray.filter(node => {
      if (map[node._getFirstWordPath(this)]) return true
      return false
    })
  }

  evalTemplateString(str: scrollNotationTypes.templateString): string {
    const that = this
    return str.replace(/{([^\}]+)}/g, (match, path) => that.get(path) || "")
  }

  emitLogMessage(message: string) {
    console.log(message)
  }

  getColumn(path: word): string[] {
    return this.map(node => node.get(path))
  }

  getFiltered(fn: scrollNotationTypes.filterFn) {
    const clone = this.clone()
    clone
      .filter((node, index) => !fn(node, index))
      .forEach(node => {
        node.destroy()
      })
    return clone
  }

  getNode(firstWordPath: scrollNotationTypes.firstWordPath) {
    return this._getNodeByPath(firstWordPath)
  }

  getFrom(prefix: string) {
    const hit = this.filter(node => node.getLine().startsWith(prefix))[0]
    if (hit) return hit.getLine().substr((prefix + this.wordBreakSymbol).length)
  }

  get(firstWordPath: scrollNotationTypes.firstWordPath) {
    const node = this._getNodeByPath(firstWordPath)
    return node === undefined ? undefined : node.content
  }

  getOneOf(keys: string[]) {
    for (let i = 0; i < keys.length; i++) {
      const value = this.get(keys[i])
      if (value) return value
    }
    return ""
  }

  // move to treenode
  pick(fields: string[]) {
    const newTree = new TreeNode(this.toString()) // todo: why not clone?
    const map = Utils.arrayToMap(fields)
    newTree.nodeAt(0).forEach((node: scrollNotationTypes.treeNode) => {
      if (!map[node.getWord(0)]) node.destroy()
    })

    return newTree
  }

  getNodesByGlobPath(query: scrollNotationTypes.globPath): TreeNode[] {
    return this._getNodesByGlobPath(query)
  }

  private _getNodesByGlobPath(globPath: scrollNotationTypes.globPath): TreeNode[] {
    const edgeSymbol = this.edgeSymbol
    if (!globPath.includes(edgeSymbol)) {
      if (globPath === "*") return this.getChildren()
      return this.filter(node => node.firstWord === globPath)
    }

    const parts = globPath.split(edgeSymbol)
    const current = parts.shift()
    const rest = parts.join(edgeSymbol)
    const matchingNodes = current === "*" ? this.getChildren() : this.filter(child => child.firstWord === current)

    return [].concat.apply(
      [],
      matchingNodes.map(node => node._getNodesByGlobPath(rest))
    )
  }

  protected _getNodeByPath(firstWordPath: scrollNotationTypes.firstWordPath): TreeNode {
    const edgeSymbol = this.edgeSymbol
    if (!firstWordPath.includes(edgeSymbol)) {
      const index = this.indexOfLast(firstWordPath)
      return index === -1 ? undefined : this._nodeAt(index)
    }

    const parts = firstWordPath.split(edgeSymbol)
    const current = parts.shift()
    const currentNode = this._getChildrenArray()[this._getIndex()[current]]
    return currentNode ? currentNode._getNodeByPath(parts.join(edgeSymbol)) : undefined
  }

  get next(): TreeNode {
    if (this.isRoot()) return this
    const index = this.getIndex()
    const parent = this.parent
    const length = parent.length
    const next = index + 1
    return next === length ? parent._getChildrenArray()[0] : parent._getChildrenArray()[next]
  }

  get previous(): TreeNode {
    if (this.isRoot()) return this
    const index = this.getIndex()
    const parent = this.parent
    const length = parent.length
    const prev = index - 1
    return prev === -1 ? parent._getChildrenArray()[length - 1] : parent._getChildrenArray()[prev]
  }

  protected _getUnionNames() {
    if (!this.length) return []

    const obj: scrollNotationTypes.stringMap = {}
    this.forEach((node: TreeNode) => {
      if (!node.length) return undefined
      node.forEach(node => {
        obj[node.firstWord] = 1
      })
    })
    return Object.keys(obj)
  }

  getAncestorNodesByInheritanceViaExtendsKeyword(key: word): TreeNode[] {
    const ancestorNodes = this._getAncestorNodes(
      (node, id) => node._getNodesByColumn(0, id),
      node => node.get(key),
      this
    )
    ancestorNodes.push(this)
    return ancestorNodes
  }

  // Note: as you can probably tell by the name of this method, I don't recommend using this as it will likely be replaced by something better.
  getAncestorNodesByInheritanceViaColumnIndices(thisColumnNumber: int, extendsColumnNumber: int): TreeNode[] {
    const ancestorNodes = this._getAncestorNodes(
      (node, id) => node._getNodesByColumn(thisColumnNumber, id),
      node => node.getWord(extendsColumnNumber),
      this
    )
    ancestorNodes.push(this)
    return ancestorNodes
  }

  protected _getAncestorNodes(getPotentialParentNodesByIdFn: (thisParentNode: TreeNode, id: word) => TreeNode[], getParentIdFn: (thisNode: TreeNode) => word, cannotContainNode: TreeNode): TreeNode[] {
    const parentId = getParentIdFn(this)
    if (!parentId) return []

    const potentialParentNodes = getPotentialParentNodesByIdFn(this.parent, parentId)
    if (!potentialParentNodes.length) throw new Error(`"${this.getLine()} tried to extend "${parentId}" but "${parentId}" not found.`)

    if (potentialParentNodes.length > 1) throw new Error(`Invalid inheritance family tree. Multiple unique ids found for "${parentId}"`)

    const parentNode = potentialParentNodes[0]

    // todo: detect loops
    if (parentNode === cannotContainNode) throw new Error(`Loop detected between '${this.getLine()}' and '${parentNode.getLine()}'`)

    const ancestorNodes = parentNode._getAncestorNodes(getPotentialParentNodesByIdFn, getParentIdFn, cannotContainNode)
    ancestorNodes.push(parentNode)
    return ancestorNodes
  }

  pathVectorToFirstWordPath(pathVector: scrollNotationTypes.pathVector): word[] {
    const path = pathVector.slice() // copy array
    const names = []
    let node: TreeNode = this
    while (path.length) {
      if (!node) return names
      names.push(node.nodeAt(path[0]).firstWord)
      node = node.nodeAt(path.shift())
    }
    return names
  }

  toStringWithLineNumbers() {
    return this.toString()
      .split("\n")
      .map((line, index) => `${index + 1} ${line}`)
      .join("\n")
  }

  get asCsv(): string {
    return this.toDelimited(",")
  }

  protected _getTypes(header: string[]) {
    const matrix = this._getMatrix(header)
    const types = header.map(i => "int")
    matrix.forEach(row => {
      row.forEach((value, index) => {
        const type = types[index]
        if (type === "string") return 1
        if (value === undefined || value === "") return 1
        if (type === "float") {
          if (value.match(/^\-?[0-9]*\.?[0-9]*$/)) return 1
          types[index] = "string"
        }
        if (value.match(/^\-?[0-9]+$/)) return 1
        types[index] = "string"
      })
    })
    return types
  }

  toDataTable(header = this._getUnionNames()): scrollNotationTypes.dataTable {
    const types = this._getTypes(header)
    const parsers: { [parseName: string]: (str: string) => any } = {
      string: str => str,
      float: parseFloat,
      int: parseInt
    }
    const cellFn: cellFn = (cellValue, rowIndex, columnIndex) => (rowIndex ? parsers[types[columnIndex]](cellValue) : cellValue)
    const arrays = this._toArrays(header, cellFn)
    arrays.rows.unshift(arrays.header)
    return arrays.rows
  }

  toDelimited(delimiter: scrollNotationTypes.delimiter, header = this._getUnionNames(), escapeSpecialChars = true) {
    const regex = new RegExp(`(\\n|\\"|\\${delimiter})`)
    const cellFn: cellFn = (str, row, column) => (!str.toString().match(regex) ? str : `"` + str.replace(/\"/g, `""`) + `"`)
    return this._toDelimited(delimiter, header, escapeSpecialChars ? cellFn : str => str)
  }

  protected _getMatrix(columns: string[]) {
    const matrix: string[][] = []
    this.forEach(child => {
      const row: string[] = []
      columns.forEach(col => {
        row.push(child.get(col))
      })
      matrix.push(row)
    })
    return matrix
  }

  protected _toArrays(columnNames: string[], cellFn: cellFn) {
    const skipHeaderRow = 1
    const header = columnNames.map((columnName, index) => cellFn(columnName, 0, index))
    const rows = this.map((node, rowNumber) =>
      columnNames.map((columnName, columnIndex) => {
        const childNode = node.getNode(columnName)
        const content = childNode ? childNode.contentWithChildren : ""
        return cellFn(content, rowNumber + skipHeaderRow, columnIndex)
      })
    )
    return {
      rows,
      header
    }
  }

  _toDelimited(delimiter: scrollNotationTypes.delimiter, header: string[], cellFn: cellFn) {
    const data = this._toArrays(header, cellFn)
    return data.header.join(delimiter) + "\n" + data.rows.map(row => row.join(delimiter)).join("\n")
  }

  get asTable(): string {
    // Output a table for printing
    return this._toTable(100, false)
  }

  toFormattedTable(maxCharactersPerColumn: number, alignRight = false): string {
    return this._toTable(maxCharactersPerColumn, alignRight)
  }

  protected _toTable(maxCharactersPerColumn: number, alignRight = false) {
    const header = this._getUnionNames()
    // Set initial column widths
    const widths = header.map(col => (col.length > maxCharactersPerColumn ? maxCharactersPerColumn : col.length))

    // Expand column widths if needed
    this.forEach(node => {
      if (!node.length) return true
      header.forEach((col, index) => {
        const cellValue = node.get(col)
        if (!cellValue) return true
        const length = cellValue.toString().length
        if (length > widths[index]) widths[index] = length > maxCharactersPerColumn ? maxCharactersPerColumn : length
      })
    })

    const cellFn = (cellText: string, row: scrollNotationTypes.positiveInt, col: scrollNotationTypes.positiveInt) => {
      const width = widths[col]
      // Strip newlines in fixedWidth output
      const cellValue = cellText.toString().replace(/\n/g, "\\n")
      const cellLength = cellValue.length
      if (cellLength > width) return cellValue.substr(0, width) + "..."

      const padding = " ".repeat(width - cellLength)
      return alignRight ? padding + cellValue : cellValue + padding
    }
    return this._toDelimited(" ", header, cellFn)
  }

  get asSsv(): string {
    return this.toDelimited(" ")
  }

  get asOutline(): string {
    return this._toOutline(node => node.getLine())
  }

  toMappedOutline(nodeFn: scrollNotationTypes.nodeToStringFn): string {
    return this._toOutline(nodeFn)
  }

  // Adapted from: https://github.com/notatestuser/treeify.js
  protected _toOutline(nodeFn: scrollNotationTypes.nodeToStringFn) {
    const growBranch = (outlineTreeNode: any, last: boolean, lastStates: any[], nodeFn: scrollNotationTypes.nodeToStringFn, callback: any) => {
      let lastStatesCopy = lastStates.slice(0)
      const node: TreeNode = outlineTreeNode.node

      if (lastStatesCopy.push([outlineTreeNode, last]) && lastStates.length > 0) {
        let line = ""
        // firstWordd on the "was last element" states of whatever we're nested within,
        // we need to append either blankness or a branch to our line
        lastStates.forEach((lastState, idx) => {
          if (idx > 0) line += lastState[1] ? " " : "│"
        })

        // the prefix varies firstWordd on whether the key contains something to show and
        // whether we're dealing with the last element in this collection
        // the extra "-" just makes things stand out more.
        line += (last ? "└" : "├") + nodeFn(node)
        callback(line)
      }

      if (!node) return

      const length = node.length
      let index = 0
      node.forEach(node => {
        let lastKey = ++index === length

        growBranch({ node: node }, lastKey, lastStatesCopy, nodeFn, callback)
      })
    }

    let output = ""
    growBranch({ node: this }, false, [], nodeFn, (line: string) => (output += line + "\n"))
    return output
  }

  copyTo(node: TreeNode, index: int) {
    return node._insertLineAndChildren(this.getLine(), this.childrenToString(), index)
  }

  // Note: Splits using a positive lookahead
  // this.split("foo").join("\n") === this.toString()
  split(firstWord: scrollNotationTypes.word): TreeNode[] {
    const constructor = <any>this.constructor
    const NodeBreakSymbol = this.nodeBreakSymbol
    const WordBreakSymbol = this.wordBreakSymbol

    // todo: cleanup. the escaping is wierd.
    return this.toString()
      .split(new RegExp(`\\${NodeBreakSymbol}(?=${firstWord}(?:${WordBreakSymbol}|\\${NodeBreakSymbol}))`, "g"))
      .map(str => new constructor(str))
  }

  get asMarkdownTable(): string {
    return this.toMarkdownTableAdvanced(this._getUnionNames(), (val: string) => val)
  }

  toMarkdownTableAdvanced(columns: word[], formatFn: scrollNotationTypes.formatFunction): string {
    const matrix = this._getMatrix(columns)
    const empty = columns.map(col => "-")
    matrix.unshift(empty)
    matrix.unshift(columns)
    const lines = matrix.map((row, rowIndex) => {
      const formattedValues = row.map((val, colIndex) => formatFn(val, rowIndex, colIndex))
      return `|${formattedValues.join("|")}|`
    })
    return lines.join("\n")
  }

  get asTsv(): string {
    return this.toDelimited("\t")
  }

  get nodeBreakSymbol(): string {
    return TN_NODE_BREAK_SYMBOL
  }

  get wordBreakSymbol(): string {
    return TN_WORD_BREAK_SYMBOL
  }

  get edgeSymbolRegex() {
    return new RegExp(this.edgeSymbol, "g")
  }

  get nodeBreakSymbolRegex() {
    return new RegExp(this.nodeBreakSymbol, "g")
  }

  get edgeSymbol(): string {
    return TN_EDGE_SYMBOL
  }

  protected _textToContentAndChildrenTuple(text: string) {
    const lines = text.split(this.nodeBreakSymbolRegex)
    const firstLine = lines.shift()
    const children = !lines.length
      ? undefined
      : lines
          .map(line => (line.substr(0, 1) === this.edgeSymbol ? line : this.edgeSymbol + line))
          .map(line => line.substr(1))
          .join(this.nodeBreakSymbol)
    return [firstLine, children]
  }

  protected _getLine() {
    return this._line
  }

  protected _setLine(line = "") {
    this._line = line
    if (this._words) delete this._words
    return this
  }

  protected _clearChildren() {
    this._deleteByIndexes(Utils.getRange(0, this.length))
    delete this._children
    return this
  }

  protected _setChildren(content: any, circularCheckArray?: any[]) {
    this._clearChildren()
    if (!content) return this

    // set from string
    if (typeof content === "string") {
      this._appendChildrenFromString(content)
      return this
    }

    // set from tree object
    if (content instanceof TreeNode) {
      content.forEach(node => this._insertLineAndChildren(node.getLine(), node.childrenToString()))
      return this
    }

    // If we set from object, create an array of inserted objects to avoid circular loops
    if (!circularCheckArray) circularCheckArray = [content]

    return this._setFromObject(content, circularCheckArray)
  }

  protected _setFromObject(content: any, circularCheckArray: Object[]) {
    for (let firstWord in content) {
      if (!content.hasOwnProperty(firstWord)) continue
      // Branch the circularCheckArray, as we only have same branch circular arrays
      this._appendFromJavascriptObjectTuple(firstWord, content[firstWord], circularCheckArray.slice(0))
    }

    return this
  }

  // todo: refactor the below.
  protected _appendFromJavascriptObjectTuple(firstWord: scrollNotationTypes.word, content: any, circularCheckArray: Object[]) {
    const type = typeof content
    let line
    let children
    if (content === null) line = firstWord + " " + null
    else if (content === undefined) line = firstWord
    else if (type === "string") {
      const tuple = this._textToContentAndChildrenTuple(content)
      line = firstWord + " " + tuple[0]
      children = tuple[1]
    } else if (type === "function") line = firstWord + " " + content.toString()
    else if (type !== "object") line = firstWord + " " + content
    else if (content instanceof Date) line = firstWord + " " + content.getTime().toString()
    else if (content instanceof TreeNode) {
      line = firstWord
      children = new TreeNode(content.childrenToString(), content.getLine())
    } else if (circularCheckArray.indexOf(content) === -1) {
      circularCheckArray.push(content)
      line = firstWord
      const length = content instanceof Array ? content.length : Object.keys(content).length
      if (length) children = new TreeNode()._setChildren(content, circularCheckArray)
    } else {
      // iirc this is return early from circular
      return
    }
    this._insertLineAndChildren(line, children)
  }

  protected _insertLineAndChildren(line: string, children?: scrollNotationTypes.children, index = this.length) {
    const parser: any = this._getParser()._getParser(line, this)
    const newNode = new parser(children, line, this)
    const adjustedIndex = index < 0 ? this.length + index : index

    this._getChildrenArray().splice(adjustedIndex, 0, newNode)

    if (this._index) this._makeIndex(adjustedIndex)
    this.clearQuickCache()
    return newNode
  }

  protected _appendChildrenFromString(str: string) {
    const lines = str.split(this.nodeBreakSymbolRegex)
    const parentStack: TreeNode[] = []
    let currentIndentCount = -1
    let lastNode: any = this
    lines.forEach(line => {
      const indentCount = this._getIndentCount(line)
      if (indentCount > currentIndentCount) {
        currentIndentCount++
        parentStack.push(lastNode)
      } else if (indentCount < currentIndentCount) {
        // pop things off stack
        while (indentCount < currentIndentCount) {
          parentStack.pop()
          currentIndentCount--
        }
      }
      const lineContent = line.substr(currentIndentCount)
      const parent = parentStack[parentStack.length - 1]
      const parser: any = parent._getParser()._getParser(lineContent, parent)
      lastNode = new parser(undefined, lineContent, parent)
      parent._getChildrenArray().push(lastNode)
    })
  }

  protected _getIndex() {
    // StringMap<int> {firstWord: index}
    // When there are multiple tails with the same firstWord, _index stores the last content.
    // todo: change the above behavior: when a collision occurs, create an array.
    return this._index || this._makeIndex()
  }

  getContentsArray() {
    return this.map(node => node.content)
  }

  getChildrenByParser(parser: Function) {
    return this.filter(child => child instanceof parser)
  }

  getAncestorByParser(parser: Function): TreeNode | undefined {
    if (this instanceof parser) return this
    if (this.isRoot()) return undefined
    const parent = this.parent
    return parent instanceof parser ? parent : parent.getAncestorByParser(parser)
  }

  getNodeByParser(parser: Function) {
    return this.find(child => child instanceof parser)
  }

  indexOfLast(firstWord: word): int {
    const result = this._getIndex()[firstWord]
    return result === undefined ? -1 : result
  }

  // todo: renmae to indexOfFirst?
  indexOf(firstWord: word): int {
    if (!this.has(firstWord)) return -1

    const length = this.length
    const nodes = this._getChildrenArray()

    for (let index = 0; index < length; index++) {
      if (nodes[index].firstWord === firstWord) return index
    }
  }

  // todo: rename this. it is a particular type of object.
  toObject(): scrollNotationTypes.stringMap {
    return this._toObject()
  }

  getFirstWords(): word[] {
    return this.map(node => node.firstWord)
  }

  protected _makeIndex(startAt = 0) {
    if (!this._index || !startAt) this._index = {}
    const nodes = this._getChildrenArray()
    const newIndex = this._index
    const length = nodes.length

    for (let index = startAt; index < length; index++) {
      newIndex[nodes[index].firstWord] = index
    }

    return newIndex
  }

  protected _childrenToXml(indentCount: scrollNotationTypes.positiveInt) {
    return this.map(node => node._toXml(indentCount)).join("")
  }

  protected _getIndentCount(str: string) {
    let level = 0
    const edgeChar = this.edgeSymbol
    while (str[level] === edgeChar) {
      level++
    }
    return level
  }

  clone(children = this.childrenToString(), line = this.getLine()): TreeNode {
    return new (<any>this.constructor)(children, line)
  }

  hasFirstWord(firstWord: word): boolean {
    return this._hasFirstWord(firstWord)
  }

  has(firstWordPath: scrollNotationTypes.firstWordPath): boolean {
    const edgeSymbol = this.edgeSymbol
    if (!firstWordPath.includes(edgeSymbol)) return this.hasFirstWord(firstWordPath)

    const parts = firstWordPath.split(edgeSymbol)
    const next = this.getNode(parts.shift())
    if (!next) return false
    return next.has(parts.join(edgeSymbol))
  }

  hasNode(node: TreeNode | string): boolean {
    const needle = node.toString()
    return this.getChildren().some(node => node.toString() === needle)
  }

  protected _hasFirstWord(firstWord: string) {
    return this._getIndex()[firstWord] !== undefined
  }

  map(fn: mapFn) {
    return this.getChildren().map(fn)
  }

  filter(fn: scrollNotationTypes.filterFn = item => item) {
    return this.getChildren().filter(fn)
  }

  find(fn: scrollNotationTypes.filterFn) {
    return this.getChildren().find(fn)
  }

  findLast(fn: scrollNotationTypes.filterFn) {
    return this.getChildren().reverse().find(fn)
  }

  every(fn: scrollNotationTypes.everyFn) {
    let index = 0
    for (let node of this.getTopDownArrayIterator()) {
      if (!fn(node, index)) return false
      index++
    }
    return true
  }

  forEach(fn: scrollNotationTypes.forEachFn) {
    this.getChildren().forEach(fn)
    return this
  }

  // Recurse if predicate passes
  deepVisit(predicate: (treeNode: any) => boolean) {
    this.forEach(node => {
      if (predicate(node) !== false) node.deepVisit(predicate)
    })
  }

  _quickCache: scrollNotationTypes.stringMap
  get quickCache() {
    if (!this._quickCache) this._quickCache = {}
    return this._quickCache
  }

  getCustomIndex(key: string) {
    if (!this.quickCache.customIndexes) this.quickCache.customIndexes = {}
    const customIndexes = this.quickCache.customIndexes
    if (customIndexes[key]) return customIndexes[key]
    const customIndex: { [firstWord: string]: TreeNode[] } = {}
    customIndexes[key] = customIndex
    this.filter(file => file.has(key)).forEach(file => {
      const value = file.get(key)
      if (!customIndex[value]) customIndex[value] = []
      customIndex[value].push(file)
    })
    return customIndex
  }

  clearQuickCache() {
    delete this._quickCache
  }

  // todo: protected?
  _clearIndex() {
    delete this._index
    this.clearQuickCache()
  }

  slice(start: int, end?: int): TreeNode[] {
    return this.getChildren().slice(start, end)
  }

  // todo: make 0 and 1 a param
  getInheritanceTree() {
    const paths: scrollNotationTypes.stringMap = {}
    const result = new TreeNode()
    this.forEach(node => {
      const key = node.getWord(0)
      const parentKey = node.getWord(1)
      const parentPath = paths[parentKey]
      paths[key] = parentPath ? [parentPath, key].join(" ") : key
      result.touchNode(paths[key])
    })
    return result
  }

  protected _getGrandParent(): TreeNode | undefined {
    return this.isRoot() || this.parent.isRoot() ? undefined : this.parent.parent
  }

  private static _parserCombinators = new Map<any, ParserCombinator>()

  _getParser() {
    if (!TreeNode._parserCombinators.has(this.constructor)) TreeNode._parserCombinators.set(this.constructor, this.createParserCombinator())
    return TreeNode._parserCombinators.get(this.constructor)
  }

  createParserCombinator(): ParserCombinator {
    return new ParserCombinator(this.constructor)
  }

  private static _uniqueId: int

  static _makeUniqueId() {
    if (this._uniqueId === undefined) this._uniqueId = 0
    this._uniqueId++
    return this._uniqueId
  }

  protected static _getFileFormat(path: string) {
    const format = path.split(".").pop()
    return (<any>FileFormat)[format] ? format : FileFormat.tree
  }

  static ParserCombinator = ParserCombinator

  static iris = `sepal_length,sepal_width,petal_length,petal_width,species
6.1,3,4.9,1.8,virginica
5.6,2.7,4.2,1.3,versicolor
5.6,2.8,4.9,2,virginica
6.2,2.8,4.8,1.8,virginica
7.7,3.8,6.7,2.2,virginica
5.3,3.7,1.5,0.2,setosa
6.2,3.4,5.4,2.3,virginica
4.9,2.5,4.5,1.7,virginica
5.1,3.5,1.4,0.2,setosa
5,3.4,1.5,0.2,setosa`

  // BEGIN MUTABLE METHODS BELOw

  private _nodeCreationTime: number = this._getProcessTimeInMilliseconds()
  private _lineModifiedTime: number
  private _childArrayModifiedTime: number

  getLineModifiedTime(): number {
    return this._lineModifiedTime || this._nodeCreationTime
  }

  getChildArrayModifiedTime() {
    return this._childArrayModifiedTime || this._nodeCreationTime
  }

  protected _setChildArrayMofifiedTime(value: number) {
    this._childArrayModifiedTime = value
    return this
  }

  getLineOrChildrenModifiedTime(): number {
    return Math.max(
      this.getLineModifiedTime(),
      this.getChildArrayModifiedTime(),
      Math.max.apply(
        null,
        this.map(child => child.getLineOrChildrenModifiedTime())
      )
    )
  }

  private _virtualParentTree: TreeNode
  protected _setVirtualParentTree(tree: TreeNode) {
    this._virtualParentTree = tree
    return this
  }

  protected _getVirtualParentTreeNode() {
    return this._virtualParentTree
  }

  private _setVirtualAncestorNodesByInheritanceViaColumnIndicesAndThenExpand(nodes: TreeNode[], thisIdColumnNumber: int, extendsIdColumnNumber: int) {
    const map: { [nodeId: string]: scrollNotationTypes.inheritanceInfo } = {}
    for (let node of nodes) {
      const nodeId = node.getWord(thisIdColumnNumber)
      if (map[nodeId]) throw new Error(`Tried to define a node with id "${nodeId}" but one is already defined.`)
      map[nodeId] = {
        nodeId: nodeId,
        node: node,
        parentId: node.getWord(extendsIdColumnNumber)
      }
    }
    // Add parent Nodes
    Object.values(map).forEach(nodeInfo => {
      const parentId = nodeInfo.parentId
      const parentNode = map[parentId]
      if (parentId && !parentNode) throw new Error(`Node "${nodeInfo.nodeId}" tried to extend "${parentId}" but "${parentId}" not found.`)
      if (parentId) nodeInfo.node._setVirtualParentTree(parentNode.node)
    })

    nodes.forEach(node => node._expandFromVirtualParentTree())
    return this
  }

  private _isVirtualExpanded: boolean
  private _isExpanding: boolean // for loop detection

  protected _expandFromVirtualParentTree() {
    if (this._isVirtualExpanded) return this

    this._isExpanding = true

    let parentNode = this._getVirtualParentTreeNode()
    if (parentNode) {
      if (parentNode._isExpanding) throw new Error(`Loop detected: '${this.getLine()}' is the ancestor of one of its ancestors.`)
      parentNode._expandFromVirtualParentTree()
      const clone = this.clone()
      this._setChildren(parentNode.childrenToString())
      this.extend(clone)
    }

    this._isExpanding = false
    this._isVirtualExpanded = true
  }

  // todo: solve issue related to whether extend should overwrite or append.
  _expandChildren(thisIdColumnNumber: int, extendsIdColumnNumber: int, childrenThatNeedExpanding = this.getChildren()) {
    return this._setVirtualAncestorNodesByInheritanceViaColumnIndicesAndThenExpand(childrenThatNeedExpanding, thisIdColumnNumber, extendsIdColumnNumber)
  }

  // todo: add more testing.
  // todo: solve issue with where extend should overwrite or append
  // todo: should take a parsers? to decide whether to overwrite or append.
  // todo: this is slow.
  extend(nodeOrStr: TreeNode | string | Object) {
    const node = nodeOrStr instanceof TreeNode ? nodeOrStr : new TreeNode(nodeOrStr)
    const usedFirstWords = new Set()
    node.forEach(sourceNode => {
      const firstWord = sourceNode.firstWord
      let targetNode
      const isAnArrayNotMap = usedFirstWords.has(firstWord)
      if (!this.has(firstWord)) {
        usedFirstWords.add(firstWord)
        this.appendLineAndChildren(sourceNode.getLine(), sourceNode.childrenToString())
        return true
      }
      if (isAnArrayNotMap) targetNode = this.appendLine(sourceNode.getLine())
      else {
        targetNode = this.touchNode(firstWord).setContent(sourceNode.content)
        usedFirstWords.add(firstWord)
      }
      if (sourceNode.length) targetNode.extend(sourceNode)
    })
    return this
  }

  lastNode(): TreeNode {
    return this.getChildren()[this.length - 1]
  }

  expandLastFromTopMatter(): TreeNode {
    const clone = this.clone()
    const map = new Map()
    const lastNode = clone.lastNode()
    lastNode.getOlderSiblings().forEach(node => map.set(node.getWord(0), node))
    lastNode.topDownArray.forEach(node => {
      const replacement = map.get(node.getWord(0))
      if (!replacement) return

      node.replaceNode(str => replacement.toString())
    })
    return lastNode
  }

  macroExpand(macroDefinitionWord: string, macroUsageWord: string): TreeNode {
    const clone = this.clone()
    const defs = clone.findNodes(macroDefinitionWord)
    const allUses = clone.findNodes(macroUsageWord)
    const wordBreakSymbol = clone.wordBreakSymbol
    defs.forEach(def => {
      const macroName = def.getWord(1)
      const uses = allUses.filter(node => node.hasWord(1, macroName))
      const params = def.getWordsFrom(2)
      const replaceFn = (str: string) => {
        const paramValues = str.split(wordBreakSymbol).slice(2)
        let newTree = def.childrenToString()
        params.forEach((param, index) => {
          newTree = newTree.replace(new RegExp(param, "g"), paramValues[index])
        })
        return newTree
      }
      uses.forEach(node => {
        node.replaceNode(replaceFn)
      })
      def.destroy()
    })
    return clone
  }

  setChildren(children: scrollNotationTypes.children) {
    return this._setChildren(children)
  }

  protected _updateLineModifiedTimeAndTriggerEvent() {
    this._lineModifiedTime = this._getProcessTimeInMilliseconds()
  }

  insertWord(index: int, word: string) {
    const wi = this.wordBreakSymbol
    const words = this._getLine().split(wi)
    words.splice(index, 0, word)
    this.setLine(words.join(wi))
    return this
  }

  deleteDuplicates() {
    const set = new Set()
    this.topDownArray.forEach(node => {
      const str = node.toString()
      if (set.has(str)) node.destroy()
      else set.add(str)
    })
    return this
  }

  setWord(index: int, word: string) {
    const wi = this.wordBreakSymbol
    const words = this._getLine().split(wi)
    words[index] = word
    this.setLine(words.join(wi))
    return this
  }

  deleteChildren() {
    return this._clearChildren()
  }

  setContent(content: string): TreeNode {
    if (content === this.content) return this
    const newArray = [this.firstWord]
    if (content !== undefined) {
      content = content.toString()
      if (content.match(this.nodeBreakSymbol)) return this.setContentWithChildren(content)
      newArray.push(content)
    }
    this._setLine(newArray.join(this.wordBreakSymbol))
    this._updateLineModifiedTimeAndTriggerEvent()
    return this
  }

  prependSibling(line: string, children: string) {
    return this.parent.insertLineAndChildren(line, children, this.getIndex())
  }

  appendSibling(line: string, children: string) {
    return this.parent.insertLineAndChildren(line, children, this.getIndex() + 1)
  }

  setContentWithChildren(text: string) {
    // todo: deprecate
    if (!text.includes(this.nodeBreakSymbol)) {
      this._clearChildren()
      return this.setContent(text)
    }

    const lines = text.split(this.nodeBreakSymbolRegex)
    const firstLine = lines.shift()
    this.setContent(firstLine)

    // tood: cleanup.
    const remainingString = lines.join(this.nodeBreakSymbol)
    const children = new TreeNode(remainingString)
    if (!remainingString) children.appendLine("")
    this.setChildren(children)
    return this
  }

  setFirstWord(firstWord: word) {
    return this.setWord(0, firstWord)
  }

  setLine(line: string) {
    if (line === this.getLine()) return this
    // todo: clear parent TMTimes
    this.parent._clearIndex()
    this._setLine(line)
    this._updateLineModifiedTimeAndTriggerEvent()
    return this
  }

  duplicate() {
    return this.parent._insertLineAndChildren(this.getLine(), this.childrenToString(), this.getIndex() + 1)
  }

  trim() {
    // todo: could do this so only the trimmed rows are deleted.
    this.setChildren(this.childrenToString().trim())
    return this
  }

  destroy() {
    ;(this.parent as TreeNode)._deleteNode(this)
  }

  set(firstWordPath: scrollNotationTypes.firstWordPath, text: string) {
    return this.touchNode(firstWordPath).setContentWithChildren(text)
  }

  setFromText(text: string) {
    if (this.toString() === text) return this
    const tuple = this._textToContentAndChildrenTuple(text)
    this.setLine(tuple[0])
    return this._setChildren(tuple[1])
  }

  setPropertyIfMissing(prop: string, value: string) {
    if (this.has(prop)) return true
    return this.touchNode(prop).setContent(value)
  }

  setProperties(propMap: scrollNotationTypes.stringMap) {
    const props = Object.keys(propMap)
    const values = Object.values(propMap)
    // todo: is there a built in tree method to do this?
    props.forEach((prop, index) => {
      const value = <string>values[index]
      if (!value) return true
      if (this.get(prop) === value) return true
      this.touchNode(prop).setContent(value)
    })
    return this
  }

  // todo: throw error if line contains a \n
  appendLine(line: string) {
    return this._insertLineAndChildren(line)
  }

  appendUniqueLine(line: string) {
    if (!this.hasLine(line)) return this.appendLine(line)
    return this.findLine(line)
  }

  appendLineAndChildren(line: string, children: scrollNotationTypes.children) {
    return this._insertLineAndChildren(line, children)
  }

  getNodesByRegex(regex: RegExp | RegExp[]) {
    const matches: TreeNode[] = []
    regex = regex instanceof RegExp ? [regex] : regex
    this._getNodesByLineRegex(matches, regex)
    return matches
  }

  // todo: remove?
  getNodesByLinePrefixes(columns: string[]) {
    const matches: TreeNode[] = []
    this._getNodesByLineRegex(
      matches,
      columns.map(str => new RegExp("^" + str))
    )
    return matches
  }

  nodesThatStartWith(prefix: string) {
    return this.filter(node => node.getLine().startsWith(prefix))
  }

  protected _getNodesByLineRegex(matches: TreeNode[], regs: RegExp[]) {
    const rgs = regs.slice(0)
    const reg = rgs.shift()
    const candidates = this.filter(child => child.getLine().match(reg))
    if (!rgs.length) return candidates.forEach(cand => matches.push(cand))
    candidates.forEach(cand => (<any>cand)._getNodesByLineRegex(matches, rgs))
  }

  concat(node: string | TreeNode) {
    if (typeof node === "string") node = new TreeNode(node)
    return node.map(node => this._insertLineAndChildren(node.getLine(), node.childrenToString()))
  }

  protected _deleteByIndexes(indexesToDelete: int[]) {
    if (!indexesToDelete.length) return this
    this._clearIndex()
    // note: assumes indexesToDelete is in ascending order
    const deletedNodes = indexesToDelete.reverse().map(index => this._getChildrenArray().splice(index, 1)[0])
    this._setChildArrayMofifiedTime(this._getProcessTimeInMilliseconds())
    return this
  }

  protected _deleteNode(node: TreeNode) {
    const index = this._indexOfNode(node)
    return index > -1 ? this._deleteByIndexes([index]) : 0
  }

  reverse() {
    this._clearIndex()
    this._getChildrenArray().reverse()
    return this
  }

  shift() {
    if (!this.length) return null
    const node = this._getChildrenArray().shift()
    return node.copyTo(new (<any>this.constructor)(), 0)
  }

  sort(fn: scrollNotationTypes.sortFn) {
    this._getChildrenArray().sort(fn)
    this._clearIndex()
    return this
  }

  invert() {
    this.forEach(node => node.words.reverse())
    return this
  }

  protected _rename(oldFirstWord: scrollNotationTypes.word, newFirstWord: scrollNotationTypes.word) {
    const index = this.indexOf(oldFirstWord)

    if (index === -1) return this

    const node = <TreeNode>this._getChildrenArray()[index]

    node.setFirstWord(newFirstWord)
    this._clearIndex()
    return this
  }

  // Does not recurse.
  remap(map: scrollNotationTypes.stringMap) {
    this.forEach(node => {
      const firstWord = node.firstWord
      if (map[firstWord] !== undefined) node.setFirstWord(map[firstWord])
    })
    return this
  }

  rename(oldFirstWord: word, newFirstWord: word) {
    this._rename(oldFirstWord, newFirstWord)
    return this
  }

  renameAll(oldName: word, newName: word) {
    this.findNodes(oldName).forEach(node => node.setFirstWord(newName))
    return this
  }

  protected _deleteAllChildNodesWithFirstWord(firstWord: word) {
    if (!this.has(firstWord)) return this
    const allNodes = this._getChildrenArray()
    const indexesToDelete: int[] = []
    allNodes.forEach((node, index) => {
      if (node.firstWord === firstWord) indexesToDelete.push(index)
    })
    return this._deleteByIndexes(indexesToDelete)
  }

  delete(path: scrollNotationTypes.firstWordPath = "") {
    const edgeSymbol = this.edgeSymbol
    if (!path.includes(edgeSymbol)) return this._deleteAllChildNodesWithFirstWord(path)

    const parts = path.split(edgeSymbol)
    const nextFirstWord = parts.pop()
    const targetNode = <TreeNode>this.getNode(parts.join(edgeSymbol))

    return targetNode ? targetNode._deleteAllChildNodesWithFirstWord(nextFirstWord) : 0
  }

  deleteColumn(firstWord = "") {
    this.forEach(node => node.delete(firstWord))
    return this
  }

  protected _getNonMaps(): TreeNode[] {
    const results = this.topDownArray.filter(node => node.hasDuplicateFirstWords())
    if (this.hasDuplicateFirstWords()) results.unshift(this)
    return results
  }

  replaceNode(fn: (thisStr: string) => string) {
    const parent = this.parent
    const index = this.getIndex()
    const newNodes = new TreeNode(fn(this.toString()))
    const returnedNodes: TreeNode[] = []
    newNodes.forEach((child, childIndex) => {
      const newNode = parent.insertLineAndChildren(child.getLine(), child.childrenToString(), index + childIndex)
      returnedNodes.push(newNode)
    })
    this.destroy()
    return returnedNodes
  }

  insertLineAndChildren(line: string, children: scrollNotationTypes.children, index: int) {
    return this._insertLineAndChildren(line, children, index)
  }

  insertLine(line: string, index: int) {
    return this._insertLineAndChildren(line, undefined, index)
  }

  prependLine(line: string) {
    return this.insertLine(line, 0)
  }

  pushContentAndChildren(content?: scrollNotationTypes.line, children?: scrollNotationTypes.children) {
    let index = this.length

    while (this.has(index.toString())) {
      index++
    }
    const line = index.toString() + (content === undefined ? "" : this.wordBreakSymbol + content)
    return this.appendLineAndChildren(line, children)
  }

  deleteBlanks() {
    this.getChildren()
      .filter(node => node.isBlankLine())
      .forEach(node => (<TreeNode>node).destroy())
    return this
  }

  // todo: add "globalReplace" method? Which runs a global regex or string replace on the Tree doc as a string?

  firstWordSort(firstWordOrder: scrollNotationTypes.word[]): this {
    return this._firstWordSort(firstWordOrder)
  }

  deleteWordAt(wordIndex: scrollNotationTypes.positiveInt): this {
    const words = this.words
    words.splice(wordIndex, 1)
    return this.setWords(words)
  }

  private _listeners: Map<any, TreeEventHandler[]>

  trigger(event: AbstractTreeEvent) {
    if (this._listeners && this._listeners.has(event.constructor)) {
      const listeners = this._listeners.get(event.constructor)
      const listenersToRemove: int[] = []
      for (let index = 0; index < listeners.length; index++) {
        const listener = listeners[index]
        if (listener(event) === true) listenersToRemove.push(index)
      }
      listenersToRemove.reverse().forEach(index => listenersToRemove.splice(index, 1))
    }
  }

  triggerAncestors(event: AbstractTreeEvent) {
    if (this.isRoot()) return
    const parent = this.parent
    parent.trigger(event)
    parent.triggerAncestors(event)
  }

  onLineChanged(eventHandler: TreeEventHandler) {
    return this._addEventListener(LineChangedTreeEvent, eventHandler)
  }

  onDescendantChanged(eventHandler: TreeEventHandler) {
    return this._addEventListener(DescendantChangedTreeEvent, eventHandler)
  }

  onChildAdded(eventHandler: TreeEventHandler) {
    return this._addEventListener(ChildAddedTreeEvent, eventHandler)
  }

  onChildRemoved(eventHandler: TreeEventHandler) {
    return this._addEventListener(ChildRemovedTreeEvent, eventHandler)
  }

  private _addEventListener(eventClass: any, eventHandler: TreeEventHandler) {
    if (!this._listeners) this._listeners = new Map()
    if (!this._listeners.has(eventClass)) this._listeners.set(eventClass, [])
    this._listeners.get(eventClass).push(eventHandler)
    return this
  }

  setWords(words: scrollNotationTypes.word[]): this {
    return this.setLine(words.join(this.wordBreakSymbol))
  }

  setWordsFrom(index: scrollNotationTypes.positiveInt, words: scrollNotationTypes.word[]): this {
    this.setWords(this.words.slice(0, index).concat(words))
    return this
  }

  appendWord(word: scrollNotationTypes.word): this {
    const words = this.words
    words.push(word)
    return this.setWords(words)
  }

  _firstWordSort(firstWordOrder: scrollNotationTypes.word[], secondarySortFn?: scrollNotationTypes.sortFn): this {
    const nodeAFirst = -1
    const nodeBFirst = 1
    const map: { [firstWord: string]: int } = {}
    firstWordOrder.forEach((word, index) => {
      map[word] = index
    })
    this.sort((nodeA, nodeB) => {
      const valA = map[nodeA.firstWord]
      const valB = map[nodeB.firstWord]
      if (valA > valB) return nodeBFirst
      if (valA < valB) return nodeAFirst
      return secondarySortFn ? secondarySortFn(nodeA, nodeB) : 0
    })
    return this
  }

  protected _touchNode(firstWordPathArray: scrollNotationTypes.word[]) {
    let contextNode = this
    firstWordPathArray.forEach(firstWord => {
      contextNode = contextNode.getNode(firstWord) || contextNode.appendLine(firstWord)
    })
    return contextNode
  }

  protected _touchNodeByString(str: string) {
    str = str.replace(this.nodeBreakSymbolRegex, "") // todo: do we want to do this sanitization?
    return this._touchNode(str.split(this.wordBreakSymbol))
  }

  touchNode(str: scrollNotationTypes.firstWordPath) {
    return this._touchNodeByString(str)
  }

  appendNode(node: TreeNode) {
    return this.appendLineAndChildren(node.getLine(), node.childrenToString())
  }

  hasLine(line: scrollNotationTypes.line) {
    return this.getChildren().some(node => node.getLine() === line)
  }

  findLine(line: scrollNotationTypes.line) {
    return this.getChildren().find(node => node.getLine() === line)
  }

  getNodesByLine(line: scrollNotationTypes.line) {
    return this.filter(node => node.getLine() === line)
  }

  toggleLine(line: scrollNotationTypes.line): TreeNode {
    const lines = this.getNodesByLine(line)
    if (lines.length) {
      lines.map(line => line.destroy())
      return this
    }

    return this.appendLine(line)
  }

  // todo: remove?
  sortByColumns(indexOrIndices: int | int[]) {
    const indices = indexOrIndices instanceof Array ? indexOrIndices : [indexOrIndices]

    const length = indices.length
    this.sort((nodeA, nodeB) => {
      const wordsA = nodeA.words
      const wordsB = nodeB.words

      for (let index = 0; index < length; index++) {
        const col = indices[index]
        const av = wordsA[col]
        const bv = wordsB[col]

        if (av === undefined) return -1
        if (bv === undefined) return 1

        if (av > bv) return 1
        else if (av < bv) return -1
      }
      return 0
    })
    return this
  }

  getWordsAsSet() {
    return new Set(this.getWordsFrom(1))
  }

  appendWordIfMissing(word: string) {
    if (this.getWordsAsSet().has(word)) return this
    return this.appendWord(word)
  }

  // todo: check to ensure identical objects
  addObjectsAsDelimited(arrayOfObjects: Object[], delimiter = Utils._chooseDelimiter(new TreeNode(arrayOfObjects).toString())) {
    const header = Object.keys(arrayOfObjects[0])
      .join(delimiter)
      .replace(/[\n\r]/g, "")
    const rows = arrayOfObjects.map(item =>
      Object.values(item)
        .join(delimiter)
        .replace(/[\n\r]/g, "")
    )
    return this.addUniqueRowsToNestedDelimited(header, rows)
  }

  setChildrenAsDelimited(tree: TreeNode | string, delimiter = Utils._chooseDelimiter(tree.toString())) {
    tree = tree instanceof TreeNode ? tree : new TreeNode(tree)
    return this.setChildren(tree.toDelimited(delimiter))
  }

  convertChildrenToDelimited(delimiter = Utils._chooseDelimiter(this.childrenToString())) {
    // todo: handle newlines!!!
    return this.setChildren(this.toDelimited(delimiter))
  }

  addUniqueRowsToNestedDelimited(header: string, rowsAsStrings: string[]) {
    if (!this.length) this.appendLine(header)

    // todo: this looks brittle
    rowsAsStrings.forEach(row => {
      if (!this.toString().includes(row)) this.appendLine(row)
    })

    return this
  }

  shiftLeft(): TreeNode {
    const grandParent = <TreeNode>this._getGrandParent()
    if (!grandParent) return this

    const parentIndex = this.parent.getIndex()
    const newNode = grandParent.insertLineAndChildren(this.getLine(), this.length ? this.childrenToString() : undefined, parentIndex + 1)
    this.destroy()
    return newNode
  }

  pasteText(text: string) {
    const parent = this.parent
    const index = this.getIndex()
    const newNodes = new TreeNode(text)
    const firstNode = newNodes.nodeAt(0)
    if (firstNode) {
      this.setLine(firstNode.getLine())
      if (firstNode.length) this.setChildren(firstNode.childrenToString())
    } else {
      this.setLine("")
    }
    newNodes.forEach((child, childIndex) => {
      if (!childIndex)
        // skip first
        return true
      parent.insertLineAndChildren(child.getLine(), child.childrenToString(), index + childIndex)
    })
    return this
  }

  templateToString(obj: scrollNotationTypes.stringMap): string {
    // todo: compile/cache for perf?
    const tree = this.clone()
    tree.topDownArray.forEach(node => {
      const line = node.getLine().replace(/{([^\}]+)}/g, (match, path) => {
        const replacement = obj[path]
        if (replacement === undefined) throw new Error(`In string template no match found on line "${node.getLine()}"`)
        return replacement
      })
      node.pasteText(line)
    })
    return tree.toString()
  }

  shiftRight(): TreeNode {
    const olderSibling = <TreeNode>this._getClosestOlderSibling()
    if (!olderSibling) return this

    const newNode = olderSibling.appendLineAndChildren(this.getLine(), this.length ? this.childrenToString() : undefined)
    this.destroy()
    return newNode
  }

  shiftYoungerSibsRight(): TreeNode {
    const nodes = <TreeNode[]>this.getYoungerSiblings()
    nodes.forEach(node => node.shiftRight())
    return this
  }

  sortBy(nameOrNames: scrollNotationTypes.word[]) {
    const names = nameOrNames instanceof Array ? nameOrNames : [nameOrNames]

    const length = names.length
    this.sort((nodeA, nodeB) => {
      if (!nodeB.length && !nodeA.length) return 0
      else if (!nodeA.length) return -1
      else if (!nodeB.length) return 1

      for (let index = 0; index < length; index++) {
        const firstWord = names[index]
        const av = nodeA.get(firstWord)
        const bv = nodeB.get(firstWord)

        if (av > bv) return 1
        else if (av < bv) return -1
      }
      return 0
    })
    return this
  }

  private _selected: boolean

  selectNode() {
    this._selected = true
  }

  unselectNode() {
    delete this._selected
  }

  isSelected() {
    return !!this._selected
  }

  async saveVersion() {
    const newVersion = this.toString()
    const topUndoVersion = this._getTopUndoVersion()
    if (newVersion === topUndoVersion) return undefined
    this._recordChange(newVersion)
    this._setSavedVersion(this.toString())
    return this
  }

  hasUnsavedChanges() {
    return this.toString() !== this._getSavedVersion()
  }

  async redo() {
    const undoStack = this._getUndoStack()
    const redoStack = this._getRedoStack()
    if (!redoStack.length) return undefined
    undoStack.push(redoStack.pop())
    return this._reloadFromUndoTop()
  }

  async undo() {
    const undoStack = this._getUndoStack()
    const redoStack = this._getRedoStack()
    if (undoStack.length === 1) return undefined
    redoStack.push(undoStack.pop())
    return this._reloadFromUndoTop()
  }

  private _savedVersion: string

  private _getSavedVersion() {
    return this._savedVersion
  }

  private _setSavedVersion(str: string) {
    this._savedVersion = str
    return this
  }

  private _clearRedoStack() {
    const redoStack = this._getRedoStack()
    redoStack.splice(0, redoStack.length)
  }

  private _undoStack: string[]
  private _redoStack: string[]

  getChangeHistory() {
    return this._getUndoStack().slice(0)
  }

  private _getUndoStack() {
    if (!this._undoStack) this._undoStack = []
    return this._undoStack
  }

  private _getRedoStack() {
    if (!this._redoStack) this._redoStack = []
    return this._redoStack
  }

  private _getTopUndoVersion() {
    const undoStack = this._getUndoStack()
    return undoStack[undoStack.length - 1]
  }

  private async _reloadFromUndoTop() {
    this.setChildren(this._getTopUndoVersion())
  }

  private _recordChange(newVersion: string) {
    this._clearRedoStack()
    this._getUndoStack().push(newVersion) // todo: use diffs?
  }

  static fromCsv(str: string) {
    return this.fromDelimited(str, ",", '"')
  }

  // todo: jeez i think we can come up with a better name than "JsonSubset"
  static fromJsonSubset(str: scrollNotationTypes.jsonSubset) {
    return new TreeNode(JSON.parse(str))
  }

  static serializedTreeNodeToTree(treeNode: scrollNotationTypes.SerializedTreeNode) {
    const language = new TreeNode()
    const cellDelimiter = language.wordBreakSymbol
    const nodeDelimiter = language.nodeBreakSymbol
    const line = treeNode.cells ? treeNode.cells.join(cellDelimiter) : undefined
    const tree = new TreeNode(undefined, line)
    if (treeNode.children)
      treeNode.children.forEach(child => {
        tree.appendNode(this.serializedTreeNodeToTree(child))
      })
    return tree
  }

  static fromJson(str: scrollNotationTypes.serializedTreeNode) {
    return this.serializedTreeNodeToTree(JSON.parse(str))
  }

  static fromGridJson(str: string) {
    const lines = JSON.parse(str)
    const language = new TreeNode()
    const cellDelimiter = language.wordBreakSymbol
    const nodeDelimiter = language.nodeBreakSymbol
    return new TreeNode(lines.map((line: any) => line.join(cellDelimiter)).join(nodeDelimiter))
  }

  static fromSsv(str: string) {
    return this.fromDelimited(str, " ", '"')
  }

  static fromTsv(str: string) {
    return this.fromDelimited(str, "\t", '"')
  }

  static fromDelimited(str: string, delimiter: string, quoteChar: string = '"') {
    str = str.replace(/\r/g, "") // remove windows newlines if present
    const rows = this._getEscapedRows(str, delimiter, quoteChar)
    return this._rowsToTreeNode(rows, delimiter, true)
  }

  static _getEscapedRows(str: string, delimiter: string, quoteChar: string) {
    return str.includes(quoteChar) ? this._strToRows(str, delimiter, quoteChar) : str.split("\n").map(line => line.split(delimiter))
  }

  static fromDelimitedNoHeaders(str: string, delimiter: string, quoteChar: string) {
    str = str.replace(/\r/g, "") // remove windows newlines if present
    const rows = this._getEscapedRows(str, delimiter, quoteChar)
    return this._rowsToTreeNode(rows, delimiter, false)
  }

  static _strToRows(str: string, delimiter: string, quoteChar: string, newLineChar = "\n") {
    const rows: string[][] = [[]]
    const newLine = "\n"
    const length = str.length
    let currentCell = ""
    let inQuote = str.substr(0, 1) === quoteChar
    let currentPosition = inQuote ? 1 : 0
    let nextChar
    let isLastChar
    let currentRow = 0
    let char
    let isNextCharAQuote

    while (currentPosition < length) {
      char = str[currentPosition]
      isLastChar = currentPosition + 1 === length
      nextChar = str[currentPosition + 1]
      isNextCharAQuote = nextChar === quoteChar

      if (inQuote) {
        if (char !== quoteChar) currentCell += char
        else if (isNextCharAQuote) {
          // Both the current and next char are ", so the " is escaped
          currentCell += nextChar
          currentPosition++ // Jump 2
        } else {
          // If the current char is a " and the next char is not, it's the end of the quotes
          inQuote = false
          if (isLastChar) rows[currentRow].push(currentCell)
        }
      } else {
        if (char === delimiter) {
          rows[currentRow].push(currentCell)
          currentCell = ""
          if (isNextCharAQuote) {
            inQuote = true
            currentPosition++ // Jump 2
          }
        } else if (char === newLine) {
          rows[currentRow].push(currentCell)
          currentCell = ""
          currentRow++
          if (nextChar) rows[currentRow] = []
          if (isNextCharAQuote) {
            inQuote = true
            currentPosition++ // Jump 2
          }
        } else if (isLastChar) rows[currentRow].push(currentCell + char)
        else currentCell += char
      }
      currentPosition++
    }
    return rows
  }

  static multiply(nodeA: TreeNode, nodeB: TreeNode) {
    const productNode = nodeA.clone()
    productNode.forEach((node, index) => {
      node.setChildren(node.length ? this.multiply(node, nodeB) : nodeB.clone())
    })
    return productNode
  }

  // Given an array return a tree
  static _rowsToTreeNode(rows: string[][], delimiter: string, hasHeaders: boolean) {
    const numberOfColumns = rows[0].length
    const treeNode = new TreeNode()
    const names = this._getHeader(rows, hasHeaders)

    const rowCount = rows.length
    for (let rowIndex = hasHeaders ? 1 : 0; rowIndex < rowCount; rowIndex++) {
      let row = rows[rowIndex]
      // If the row contains too many columns, shift the extra columns onto the last one.
      // This allows you to not have to escape delimiter characters in the final column.
      if (row.length > numberOfColumns) {
        row[numberOfColumns - 1] = row.slice(numberOfColumns - 1).join(delimiter)
        row = row.slice(0, numberOfColumns)
      } else if (row.length < numberOfColumns) {
        // If the row is missing columns add empty columns until it is full.
        // This allows you to make including delimiters for empty ending columns in each row optional.
        while (row.length < numberOfColumns) {
          row.push("")
        }
      }

      const obj: scrollNotationTypes.stringMap = {}
      row.forEach((cellValue, index) => {
        obj[names[index]] = cellValue
      })

      treeNode.pushContentAndChildren(undefined, obj)
    }
    return treeNode
  }

  // todo: cleanup. add types
  private static _xmlParser: any

  static _initializeXmlParser() {
    if (this._xmlParser) return
    const windowObj = <any>window

    if (typeof windowObj.DOMParser !== "undefined") this._xmlParser = (xmlStr: string) => new windowObj.DOMParser().parseFromString(xmlStr, "text/xml")
    else if (typeof windowObj.ActiveXObject !== "undefined" && new windowObj.ActiveXObject("Microsoft.XMLDOM")) {
      this._xmlParser = (xmlStr: string) => {
        const xmlDoc = new windowObj.ActiveXObject("Microsoft.XMLDOM")
        xmlDoc.async = "false"
        xmlDoc.loadXML(xmlStr)
        return xmlDoc
      }
    } else throw new Error("No XML parser found")
  }

  static fromXml(str: string) {
    this._initializeXmlParser()
    const xml = this._xmlParser(str)

    try {
      return this._treeNodeFromXml(xml).getNode("children")
    } catch (err) {
      return this._treeNodeFromXml(this._parseXml2(str)).getNode("children")
    }
  }

  static _zipObject(keys: string[], values: any) {
    const obj: scrollNotationTypes.stringMap = {}
    keys.forEach((key, index) => (obj[key] = values[index]))
    return obj
  }

  static fromShape(shapeArr: int[], rootNode = new TreeNode()) {
    const part = shapeArr.shift()
    if (part !== undefined) {
      for (let index = 0; index < part; index++) {
        rootNode.appendLine(index.toString())
      }
    }
    if (shapeArr.length) rootNode.forEach(node => TreeNode.fromShape(shapeArr.slice(0), node))

    return rootNode
  }

  static fromDataTable(table: scrollNotationTypes.dataTable) {
    const header = table.shift()
    return new TreeNode(table.map(row => this._zipObject(header, row)))
  }

  static _parseXml2(str: string) {
    const el = document.createElement("div")
    el.innerHTML = str
    return el
  }

  // todo: cleanup typings
  static _treeNodeFromXml(xml: any) {
    const result = new TreeNode()
    const children = new TreeNode()

    // Set attributes
    if (xml.attributes) {
      for (let index = 0; index < xml.attributes.length; index++) {
        result.set(xml.attributes[index].name, xml.attributes[index].value)
      }
    }

    if (xml.data) children.pushContentAndChildren(xml.data)

    // Set content
    if (xml.childNodes && xml.childNodes.length > 0) {
      for (let index = 0; index < xml.childNodes.length; index++) {
        const child = xml.childNodes[index]

        if (child.tagName && child.tagName.match(/parsererror/i)) throw new Error("Parse Error")

        if (child.childNodes.length > 0 && child.tagName) children.appendLineAndChildren(child.tagName, this._treeNodeFromXml(child))
        else if (child.tagName) children.appendLine(child.tagName)
        else if (child.data) {
          const data = child.data.trim()
          if (data) children.pushContentAndChildren(data)
        }
      }
    }

    if (children.length > 0) result.touchNode("children").setChildren(children)

    return result
  }

  static _getHeader(rows: string[][], hasHeaders: boolean) {
    const numberOfColumns = rows[0].length
    const headerRow = hasHeaders ? rows[0] : []
    const WordBreakSymbol = " "
    const ziRegex = new RegExp(WordBreakSymbol, "g")

    if (hasHeaders) {
      // Strip any WordBreakSymbols from column names in the header row.
      // This makes the mapping not quite 1 to 1 if there are any WordBreakSymbols in names.
      for (let index = 0; index < numberOfColumns; index++) {
        headerRow[index] = headerRow[index].replace(ziRegex, "")
      }
    } else {
      // If str has no headers, create them as 0,1,2,3
      for (let index = 0; index < numberOfColumns; index++) {
        headerRow.push(index.toString())
      }
    }
    return headerRow
  }

  static nest(str: string, xValue: int) {
    const NodeBreakSymbol = TN_NODE_BREAK_SYMBOL
    const WordBreakSymbol = TN_WORD_BREAK_SYMBOL
    const indent = NodeBreakSymbol + WordBreakSymbol.repeat(xValue)
    return str ? indent + str.replace(/\n/g, indent) : ""
  }

  static getVersion = () => "80.1.1"

  static fromDisk(path: string): TreeNode {
    const format = this._getFileFormat(path)
    const content = require("fs").readFileSync(path, "utf8")
    const methods: { [kind: string]: (content: string) => TreeNode } = {
      tree: (content: string) => new TreeNode(content),
      csv: (content: string) => this.fromCsv(content),
      tsv: (content: string) => this.fromTsv(content)
    }

    return methods[format](content)
  }

  static fromFolder(folderPath: string, filepathPredicate = (filepath: string) => filepath !== ".DS_Store"): TreeNode {
    const path = require("path")
    const fs = require("fs")
    const tree = new TreeNode()
    const files = fs
      .readdirSync(folderPath)
      .map((filename: string) => path.join(folderPath, filename))
      .filter((filepath: string) => !fs.statSync(filepath).isDirectory() && filepathPredicate(filepath))
      .forEach((filePath: string) => tree.appendLineAndChildren(filePath, fs.readFileSync(filePath, "utf8")))
    return tree
  }
}

abstract class AbstractExtendibleTreeNode extends TreeNode {
  _getFromExtended(firstWordPath: scrollNotationTypes.firstWordPath) {
    const hit = this._getNodeFromExtended(firstWordPath)
    return hit ? hit.get(firstWordPath) : undefined
  }

  _getFamilyTree() {
    const tree = new TreeNode()
    this.forEach(node => {
      const path = node._getAncestorsArray().map((node: AbstractExtendibleTreeNode) => node.id)
      path.reverse()
      tree.touchNode(path.join(TN_EDGE_SYMBOL))
    })
    return tree
  }

  // todo: be more specific with the param
  _getChildrenByParserInExtended(parser: Function): TreeNode[] {
    return Utils.flatten(<any>this._getAncestorsArray().map(node => node.getChildrenByParser(parser)))
  }

  _getExtendedParent() {
    return this._getAncestorsArray()[1]
  }

  _hasFromExtended(firstWordPath: scrollNotationTypes.firstWordPath) {
    return !!this._getNodeFromExtended(firstWordPath)
  }

  _getNodeFromExtended(firstWordPath: scrollNotationTypes.firstWordPath) {
    return this._getAncestorsArray().find(node => node.has(firstWordPath))
  }

  _getConcatBlockStringFromExtended(firstWordPath: scrollNotationTypes.firstWordPath) {
    return this._getAncestorsArray()
      .filter(node => node.has(firstWordPath))
      .map(node => node.getNode(firstWordPath).childrenToString())
      .reverse()
      .join("\n")
  }

  _doesExtend(parserId: scrollNotationTypes.parserId) {
    return this._getAncestorSet().has(parserId)
  }

  _getAncestorSet() {
    if (!this._cache_ancestorSet) this._cache_ancestorSet = new Set(this._getAncestorsArray().map(def => def.id))
    return this._cache_ancestorSet
  }

  abstract get id(): string

  private _cache_ancestorSet: Set<scrollNotationTypes.parserId>
  private _cache_ancestorsArray: AbstractExtendibleTreeNode[]

  // Note: the order is: [this, parent, grandParent, ...]
  _getAncestorsArray(cannotContainNodes?: AbstractExtendibleTreeNode[]) {
    this._initAncestorsArrayCache(cannotContainNodes)
    return this._cache_ancestorsArray
  }

  private get idThatThisExtends() {
    return this.get(ScrollNotationConstants.extends)
  }

  abstract get idToNodeMap(): { [id: string]: AbstractExtendibleTreeNode }

  protected _initAncestorsArrayCache(cannotContainNodes?: AbstractExtendibleTreeNode[]): void {
    if (this._cache_ancestorsArray) return undefined
    if (cannotContainNodes && cannotContainNodes.includes(this)) throw new Error(`Loop detected: '${this.getLine()}' is the ancestor of one of its ancestors.`)
    cannotContainNodes = cannotContainNodes || [this]
    let ancestors: AbstractExtendibleTreeNode[] = [this]
    const extendedId = this.idThatThisExtends
    if (extendedId) {
      const parentNode = this.idToNodeMap[extendedId]
      if (!parentNode) throw new Error(`${extendedId} not found`)

      ancestors = ancestors.concat(parentNode._getAncestorsArray(cannotContainNodes))
    }
    this._cache_ancestorsArray = ancestors
  }
}

class ExtendibleTreeNode extends AbstractExtendibleTreeNode {
  private _nodeMapCache: { [id: string]: AbstractExtendibleTreeNode }
  get idToNodeMap() {
    if (!this.isRoot()) return (<AbstractExtendibleTreeNode>this.root).idToNodeMap
    if (!this._nodeMapCache) {
      this._nodeMapCache = {}
      this.forEach(child => {
        this._nodeMapCache[child.id] = child
      })
    }
    return this._nodeMapCache
  }

  get id() {
    return this.getWord(0)
  }
}

export { TreeNode, ExtendibleTreeNode, AbstractExtendibleTreeNode, TreeEvents, TreeWord }
