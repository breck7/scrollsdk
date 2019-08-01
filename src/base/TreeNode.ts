import AbstractNode from "./AbstractNode.node"
import TreeUtils from "./TreeUtils"
import Parser from "./Parser"
import jTreeTypes from "../jTreeTypes"

declare type int = jTreeTypes.int
declare type word = jTreeTypes.word

declare type cellFn = (str: string, rowIndex: int, colIndex: int) => any
declare type mapFn = (value: any, index: int, array: any[]) => any

enum FileFormat {
  csv = "csv",
  tsv = "tsv",
  tree = "tree"
}

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

class ImmutableNode extends AbstractNode {
  constructor(children?: jTreeTypes.children, line?: string, parent?: ImmutableNode) {
    super()
    this._parent = parent
    this._setLine(line)
    this._setChildren(children)
  }

  private _uid: int
  private _words: string[]
  private _parent: ImmutableNode | undefined
  private _children: ImmutableNode[]
  private _line: string
  private _index: {
    [firstWord: string]: int
  }

  execute(context: any) {
    return Promise.all(this.map(child => child.execute(context)))
  }

  getErrors(): jTreeTypes.TreeError[] {
    return []
  }

  getLineCellTypes() {
    // todo: make this any a constant
    return "undefinedCellType ".repeat(this.getWords().length).trim()
  }

  executeSync(context: any) {
    return this.map(child => child.executeSync(context))
  }

  isNodeJs() {
    return typeof exports !== "undefined"
  }

  isBrowser() {
    return !this.isNodeJs()
  }

  getOlderSiblings() {
    if (this.isRoot()) return []
    return this.getParent().slice(0, this.getIndex())
  }

  protected _getClosestOlderSibling(): ImmutableNode | undefined {
    const olderSiblings = this.getOlderSiblings()
    return olderSiblings[olderSiblings.length - 1]
  }

  getYoungerSiblings() {
    if (this.isRoot()) return []
    return this.getParent().slice(this.getIndex() + 1)
  }

  getSiblings() {
    if (this.isRoot()) return []
    return this.getParent().filter(node => node !== this)
  }

  protected _getUid() {
    if (!this._uid) this._uid = ImmutableNode._makeUniqueId()
    return this._uid
  }

  // todo: rename getMother? grandMother et cetera?
  getParent() {
    return this._parent
  }

  getPoint(): jTreeTypes.point {
    return this._getPoint()
  }

  protected _getPoint(relativeTo?: ImmutableNode): jTreeTypes.point {
    return {
      x: this._getXCoordinate(relativeTo),
      y: this._getYCoordinate(relativeTo)
    }
  }

  getPointRelativeTo(relativeTo?: ImmutableNode) {
    return this._getPoint(relativeTo)
  }

  getIndentation(relativeTo?: ImmutableNode) {
    return this.getXI().repeat(this._getXCoordinate(relativeTo) - 1)
  }

  protected _getTopDownArray(arr: TreeNode[]) {
    this.forEach(child => {
      arr.push(child)
      child._getTopDownArray(arr)
    })
  }

  getTopDownArray(): jTreeTypes.treeNode[] {
    const arr: TreeNode[] = []
    this._getTopDownArray(arr)
    return arr
  }

  *getTopDownArrayIterator(): IterableIterator<jTreeTypes.treeNode> {
    for (let child of this.getChildren()) {
      yield child
      yield* child.getTopDownArrayIterator()
    }
  }

  nodeAtLine(lineNumber: jTreeTypes.positiveInt): TreeNode | undefined {
    let index = 0
    for (let node of this.getTopDownArrayIterator()) {
      if (lineNumber === index) return node
      index++
    }
  }

  getNumberOfLines(): int {
    let lineCount = 0
    for (let node of this.getTopDownArrayIterator()) {
      lineCount++
    }
    return lineCount
  }

  protected _cachedLineNumber: int
  _getLineNumber(target: ImmutableNode = this) {
    if (this._cachedLineNumber) return this._cachedLineNumber
    let lineNumber = 1
    for (let node of this.getRootNode().getTopDownArrayIterator()) {
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
    return !this.length && !this.getContent()
  }

  protected _getYCoordinate(relativeTo?: ImmutableNode) {
    if (this.isRoot(relativeTo)) return 0
    const start = relativeTo || this.getRootNode()
    return start._getLineNumber(this)
  }

  isRoot(relativeTo?: ImmutableNode): boolean {
    return relativeTo === this || !this.getParent()
  }

  getRootNode() {
    return this._getRootNode()
  }

  protected _getRootNode(relativeTo?: ImmutableNode): ImmutableNode | this {
    if (this.isRoot(relativeTo)) return this
    return this.getParent()._getRootNode(relativeTo)
  }

  toString(indentCount = 0, language = this): string {
    if (this.isRoot()) return this._childrenToString(indentCount, language)
    return (
      language.getXI().repeat(indentCount) + this.getLine(language) + (this.length ? language.getYI() + this._childrenToString(indentCount + 1, language) : "")
    )
  }

  printLinesFrom(start: jTreeTypes.int, quantity: jTreeTypes.int) {
    return this._printLinesFrom(start, quantity, false)
  }

  printLinesWithLineNumbersFrom(start: jTreeTypes.int, quantity: jTreeTypes.int) {
    return this._printLinesFrom(start, quantity, true)
  }

  private _printLinesFrom(start: jTreeTypes.int, quantity: jTreeTypes.int, printLineNumbers: boolean) {
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
    const words = this._getLine().split(this.getZI())
    if (index < 0) index = words.length + index
    return words[index]
  }

  protected _toHtml(indentCount: int) {
    const path = this.getPathVector().join(" ")
    const classes = {
      nodeLine: "nodeLine",
      xi: "xIncrement",
      yi: "yIncrement",
      nodeChildren: "nodeChildren"
    }
    const edge = this.getXI().repeat(indentCount)
    // Set up the firstWord part of the node
    const edgeHtml = `<span class="${classes.nodeLine}" data-pathVector="${path}"><span class="${classes.xi}">${edge}</span>`
    const lineHtml = this._getLineHtml()
    const childrenHtml = this.length
      ? `<span class="${classes.yi}">${this.getYI()}</span>` + `<span class="${classes.nodeChildren}">${this._childrenToHtml(indentCount + 1)}</span>`
      : ""

    return `${edgeHtml}${lineHtml}${childrenHtml}</span>`
  }

  protected _getWords(startFrom: int) {
    if (!this._words) this._words = this._getLine().split(this.getZI())
    return startFrom ? this._words.slice(startFrom) : this._words
  }

  getWords(): word[] {
    return this._getWords(0)
  }

  doesExtend(nodeTypeId: jTreeTypes.nodeTypeId) {
    return false
  }

  require(moduleName: string, filePath?: string): any {
    if (this.isNodeJs()) return require(filePath || moduleName)
    return (<any>window)[moduleName]
  }

  getWordsFrom(startFrom: int) {
    return this._getWords(startFrom)
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

  private _getWordIndexCharacterStartPosition(wordIndex: int): jTreeTypes.positiveInt {
    const xiLength = this.getXI().length
    const numIndents = this._getXCoordinate(undefined) - 1
    const indentPosition = xiLength * numIndents
    if (wordIndex < 1) return xiLength * (numIndents + wordIndex)
    return (
      indentPosition +
      this.getWords()
        .slice(0, wordIndex)
        .join(this.getZI()).length +
      this.getZI().length
    )
  }

  getNodeInScopeAtCharIndex(charIndex: jTreeTypes.positiveInt) {
    if (this.isRoot()) return this
    let wordIndex = this.getWordIndexAtCharacterIndex(charIndex)
    if (wordIndex > 0) return this
    let node: ImmutableNode = this
    while (wordIndex < 1) {
      node = node.getParent()
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

  getAllWordBoundaryCoordinates() {
    const coordinates: jTreeTypes.point[] = []
    let line = 0
    for (let node of this.getTopDownArrayIterator()) {
      ;(<TreeNode>node).getWordBoundaryIndices().forEach(index => {
        coordinates.push({
          y: line,
          x: index
        })
      })

      line++
    }
    return coordinates
  }

  getWordBoundaryIndices(): jTreeTypes.positiveInt[] {
    const boundaries = [0]
    let numberOfIndents = this._getXCoordinate(undefined) - 1
    let start = numberOfIndents
    // Add indents
    while (numberOfIndents) {
      boundaries.push(boundaries.length)
      numberOfIndents--
    }
    // Add columns
    const ziIncrement = this.getZI().length
    this.getWords().forEach(word => {
      if (boundaries[boundaries.length - 1] !== start) boundaries.push(start)
      start += word.length
      if (boundaries[boundaries.length - 1] !== start) boundaries.push(start)
      start += ziIncrement
    })
    return boundaries
  }

  getWordIndexAtCharacterIndex(charIndex: jTreeTypes.positiveInt): int {
    // todo: is this correct thinking for handling root?
    if (this.isRoot()) return 0
    const numberOfIndents = this._getXCoordinate(undefined) - 1
    // todo: probably want to rewrite this in a performant way.
    const spots = []
    while (spots.length < numberOfIndents) {
      spots.push(-(numberOfIndents - spots.length))
    }
    this.getWords().forEach((word, wordIndex) => {
      word.split("").forEach(letter => {
        spots.push(wordIndex)
      })
      spots.push(wordIndex)
    })

    return spots[charIndex]
  }

  getAllErrors(lineStartsAt = 1): jTreeTypes.TreeError[] {
    const errors: jTreeTypes.TreeError[] = []
    for (let node of this.getTopDownArray()) {
      node._cachedLineNumber = lineStartsAt // todo: cleanup
      const errs: jTreeTypes.TreeError[] = node.getErrors()
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

  getFirstWord(): word {
    return this.getWords()[0]
  }

  getContent(): string {
    const words = this.getWordsFrom(1)
    return words.length ? words.join(this.getZI()) : undefined
  }

  getContentWithChildren(): string {
    // todo: deprecate
    const content = this.getContent()
    return (content ? content : "") + (this.length ? this.getYI() + this._childrenToString() : "")
  }

  getFirstNode(): ImmutableNode {
    return this.nodeAt(0)
  }

  getStack() {
    return this._getStack()
  }

  protected _getStack(relativeTo?: ImmutableNode): ImmutableNode[] {
    if (this.isRoot(relativeTo)) return []
    const parent = this.getParent()
    if (parent.isRoot(relativeTo)) return [this]
    else return parent._getStack(relativeTo).concat([this])
  }

  getStackString(): string {
    return this._getStack()
      .map((node, index) => this.getXI().repeat(index) + node.getLine())
      .join(this.getYI())
  }

  getLine(language?: ImmutableNode) {
    if (!this._words && !language) return this._getLine() // todo: how does this interact with "language" param?
    return this.getWords().join((language || this).getZI())
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
  protected _getFirstWordPath(relativeTo?: ImmutableNode): jTreeTypes.firstWordPath {
    if (this.isRoot(relativeTo)) return ""
    else if (this.getParent().isRoot(relativeTo)) return this.getFirstWord()

    return this.getParent()._getFirstWordPath(relativeTo) + this.getXI() + this.getFirstWord()
  }

  getFirstWordPathRelativeTo(relativeTo?: ImmutableNode): jTreeTypes.firstWordPath {
    return this._getFirstWordPath(relativeTo)
  }

  getFirstWordPath(): jTreeTypes.firstWordPath {
    return this._getFirstWordPath()
  }

  getPathVector(): jTreeTypes.pathVector {
    return this._getPathVector()
  }

  getPathVectorRelativeTo(relativeTo?: ImmutableNode): jTreeTypes.pathVector {
    return this._getPathVector(relativeTo)
  }

  protected _getPathVector(relativeTo?: ImmutableNode): jTreeTypes.pathVector {
    if (this.isRoot(relativeTo)) return []
    const path = this.getParent()._getPathVector(relativeTo)
    path.push(this.getIndex())
    return path
  }

  getIndex(): int {
    return this.getParent()._indexOfNode(this)
  }

  isTerminal() {
    return !this.length
  }

  protected _getLineHtml() {
    return this.getWords()
      .map((word, index) => `<span class="word${index}">${TreeUtils.stripHtml(word)}</span>`)
      .join(`<span class="zIncrement">${this.getZI()}</span>`)
  }

  protected _getXmlContent(indentCount: jTreeTypes.positiveInt) {
    if (this.getContent() !== undefined) return this.getContentWithChildren()
    return this.length ? `${indentCount === -1 ? "" : "\n"}${this._childrenToXml(indentCount > -1 ? indentCount + 2 : -1)}${" ".repeat(indentCount)}` : ""
  }

  protected _toXml(indentCount: jTreeTypes.positiveInt) {
    const indent = " ".repeat(indentCount)
    const tag = this.getFirstWord()
    return `${indent}<${tag}>${this._getXmlContent(indentCount)}</${tag}>${indentCount === -1 ? "" : "\n"}`
  }

  protected _toObjectTuple() {
    const content = this.getContent()
    const length = this.length
    const hasChildrenNoContent = content === undefined && length
    const hasContentAndHasChildren = content !== undefined && length
    // If the node has a content and a subtree return it as a string, as
    // Javascript object values can't be both a leaf and a tree.
    const tupleValue = hasChildrenNoContent ? this.toObject() : hasContentAndHasChildren ? this.getContentWithChildren() : content
    return [this.getFirstWord(), tupleValue]
  }

  protected _indexOfNode(needleNode: ImmutableNode) {
    let result = -1
    this.find((node, index) => {
      if (node === needleNode) {
        result = index
        return true
      }
    })
    return result
  }

  getSlice(startIndexInclusive: int, stopIndexExclusive: int) {
    return new TreeNode(
      this.slice(startIndexInclusive, stopIndexExclusive)
        .map(child => child.toString())
        .join("\n")
    )
  }

  protected _hasColumns(columns: string[]) {
    const words = this.getWords()
    return columns.every((searchTerm, index) => searchTerm === words[index])
  }

  hasWord(index: int, word: string): boolean {
    return this.getWord(index) === word
  }

  getNodeByColumns(...columns: string[]): ImmutableNode {
    return this.getTopDownArray().find(node => node._hasColumns(columns))
  }

  getNodeByColumn(index: int, name: string): ImmutableNode {
    return this.find(node => node.getWord(index) === name)
  }

  protected _getNodesByColumn(index: int, name: word): ImmutableNode[] {
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

  // Note: this is for debugging select chains
  print(message = "") {
    if (message) console.log(message)
    console.log(this.toString())
    return this
  }

  // todo: preserve subclasses!
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
      else if (operator === WhereOperators.notEmpty) return node.has(columnName)
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
    const arr: ImmutableNode[] = []
    this._getChildrenFirstArray(arr)
    return arr
  }

  protected _getChildrenFirstArray(arr: ImmutableNode[]) {
    this.forEach(child => {
      child._getChildrenFirstArray(arr)
      arr.push(child)
    })
  }

  protected _getXCoordinate(relativeTo: ImmutableNode) {
    return this._getStack(relativeTo).length
  }

  getParentFirstArray() {
    const levels = this._getLevels()
    const arr: ImmutableNode[] = []
    Object.values(levels).forEach(level => {
      level.forEach(item => arr.push(item))
    })
    return arr
  }

  protected _getLevels(): { [level: number]: ImmutableNode[] } {
    const levels: { [level: number]: ImmutableNode[] } = {}
    this.getTopDownArray().forEach(node => {
      const level = node._getXCoordinate()
      if (!levels[level]) levels[level] = []
      levels[level].push(node)
    })
    return levels
  }

  protected _getChildrenArray() {
    if (!this._children) this._children = []
    return this._children
  }

  protected _getChildren() {
    return this._getChildrenArray()
  }

  getLines(): string[] {
    return this.map(node => node.getLine())
  }

  getChildren(): any[] {
    return this._getChildren().slice(0)
  }

  get length(): jTreeTypes.positiveInt {
    return this._getChildren().length
  }

  protected _nodeAt(index: int) {
    if (index < 0) index = this.length + index
    return this._getChildren()[index]
  }

  nodeAt(indexOrIndexArray: int | int[]): ImmutableNode | undefined {
    if (typeof indexOrIndexArray === "number") return this._nodeAt(indexOrIndexArray)

    if (indexOrIndexArray.length === 1) return this._nodeAt(indexOrIndexArray[0])

    const first = indexOrIndexArray[0]
    const node = this._nodeAt(first)
    if (!node) return undefined
    return node.nodeAt(indexOrIndexArray.slice(1))
  }

  protected _toObject() {
    const obj: jTreeTypes.stringMap = {}
    this.forEach(node => {
      const tuple = node._toObjectTuple()
      obj[tuple[0]] = tuple[1]
    })
    return obj
  }

  toHtml(): jTreeTypes.htmlString {
    return this._childrenToHtml(0)
  }

  protected _getHtmlJoinByCharacter() {
    return `<span class="yIncrement">${this.getYI()}</span>`
  }

  protected _childrenToHtml(indentCount: int) {
    const joinBy = this._getHtmlJoinByCharacter()
    return this.map(node => node._toHtml(indentCount)).join(joinBy)
  }

  protected _childrenToString(indentCount?: int, language = this) {
    return this.map(node => node.toString(indentCount, language)).join(language.getYI())
  }

  childrenToString(): string {
    return this._childrenToString()
  }

  // todo: implement
  protected _getChildJoinCharacter() {
    return "\n"
  }

  compile(): string {
    return this.map(child => child.compile()).join(this._getChildJoinCharacter())
  }

  toXml(): jTreeTypes.xmlString {
    return this._childrenToXml(0)
  }

  toDisk(path: string) {
    if (!this.isNodeJs()) throw new Error("This method only works in Node.js")
    const format = ImmutableNode._getFileFormat(path)
    const formats = {
      tree: (tree: TreeNode) => tree.toString(),
      csv: (tree: TreeNode) => tree.toCsv(),
      tsv: (tree: TreeNode) => tree.toTsv()
    }
    this.require("fs").writeFileSync(path, <string>(<any>formats)[format](this), "utf8")
    return this
  }

  _lineToYaml(indentLevel: number, listTag = "") {
    let prefix = " ".repeat(indentLevel)
    if (listTag && indentLevel > 1) prefix = " ".repeat(indentLevel - 2) + listTag + " "
    return prefix + `${this.getFirstWord()}:` + (this.getContent() ? " " + this.getContent() : "")
  }

  _isYamlList() {
    return this.hasDuplicateFirstWords()
  }

  toYaml() {
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

  toJsonSubset(): jTreeTypes.jsonSubset {
    return JSON.stringify(this.toObject(), null, " ")
  }

  findNodes(firstWordPath: jTreeTypes.firstWordPath | jTreeTypes.firstWordPath[]): TreeNode[] {
    // todo: can easily speed this up
    const map: any = {}
    if (!Array.isArray(firstWordPath)) firstWordPath = [firstWordPath]
    firstWordPath.forEach(path => (map[path] = true))
    return this.getTopDownArray().filter(node => {
      if (map[node._getFirstWordPath(this)]) return true
      return false
    })
  }

  format(str: jTreeTypes.formatString): string {
    const that = this
    return str.replace(/{([^\}]+)}/g, (match, path) => that.get(path) || "")
  }

  getColumn(path: word): string[] {
    return this.map(node => node.get(path))
  }

  getFiltered(fn: jTreeTypes.filterFn) {
    const clone = this.clone()
    clone
      .filter((node, index) => !fn(node, index))
      .forEach(node => {
        node.destroy()
      })
    return clone
  }

  getNode(firstWordPath: jTreeTypes.firstWordPath) {
    return this._getNodeByPath(firstWordPath)
  }

  get(firstWordPath: jTreeTypes.firstWordPath) {
    const node = this._getNodeByPath(firstWordPath)
    return node === undefined ? undefined : node.getContent()
  }

  getNodesByGlobPath(query: jTreeTypes.globPath): TreeNode[] {
    return this._getNodesByGlobPath(query)
  }

  private _getNodesByGlobPath(globPath: jTreeTypes.globPath): TreeNode[] {
    const xi = this.getXI()
    if (!globPath.includes(xi)) {
      if (globPath === "*") return this.getChildren()
      return this.filter(node => node.getFirstWord() === globPath)
    }

    const parts = globPath.split(xi)
    const current = parts.shift()
    const rest = parts.join(xi)
    const matchingNodes = current === "*" ? this.getChildren() : this.filter(child => child.getFirstWord() === current)

    return [].concat.apply([], matchingNodes.map(node => node._getNodesByGlobPath(rest)))
  }

  protected _getNodeByPath(firstWordPath: jTreeTypes.firstWordPath): ImmutableNode {
    const xi = this.getXI()
    if (!firstWordPath.includes(xi)) {
      const index = this.indexOfLast(firstWordPath)
      return index === -1 ? undefined : this._nodeAt(index)
    }

    const parts = firstWordPath.split(xi)
    const current = parts.shift()
    const currentNode = this._getChildren()[this._getIndex()[current]]
    return currentNode ? currentNode._getNodeByPath(parts.join(xi)) : undefined
  }

  getNext() {
    if (this.isRoot()) return this
    const index = this.getIndex()
    const parent = this.getParent()
    const length = parent.length
    const next = index + 1
    return next === length ? parent._getChildren()[0] : parent._getChildren()[next]
  }

  getPrevious() {
    if (this.isRoot()) return this
    const index = this.getIndex()
    const parent = this.getParent()
    const length = parent.length
    const prev = index - 1
    return prev === -1 ? parent._getChildren()[length - 1] : parent._getChildren()[prev]
  }

  protected _getUnionNames() {
    if (!this.length) return []

    const obj: jTreeTypes.stringMap = {}
    this.forEach((node: TreeNode) => {
      if (!node.length) return undefined
      node.forEach(node => {
        obj[node.getFirstWord()] = 1
      })
    })
    return Object.keys(obj)
  }

  getAncestorNodesByInheritanceViaExtendsKeyword(key: word): ImmutableNode[] {
    const ancestorNodes = this._getAncestorNodes((node, id) => node._getNodesByColumn(0, id), node => node.get(key), this)
    ancestorNodes.push(this)
    return ancestorNodes
  }

  // Note: as you can probably tell by the name of this method, I don't recommend using this as it will likely be replaced by something better.
  getAncestorNodesByInheritanceViaColumnIndices(thisColumnNumber: int, extendsColumnNumber: int): ImmutableNode[] {
    const ancestorNodes = this._getAncestorNodes((node, id) => node._getNodesByColumn(thisColumnNumber, id), node => node.getWord(extendsColumnNumber), this)
    ancestorNodes.push(this)
    return ancestorNodes
  }

  protected _getAncestorNodes(
    getPotentialParentNodesByIdFn: (thisParentNode: ImmutableNode, id: word) => ImmutableNode[],
    getParentIdFn: (thisNode: ImmutableNode) => word,
    cannotContainNode: ImmutableNode
  ): ImmutableNode[] {
    const parentId = getParentIdFn(this)
    if (!parentId) return []

    const potentialParentNodes = getPotentialParentNodesByIdFn(this.getParent(), parentId)
    if (!potentialParentNodes.length) throw new Error(`"${this.getLine()} tried to extend "${parentId}" but "${parentId}" not found.`)

    if (potentialParentNodes.length > 1) throw new Error(`Invalid inheritance family tree. Multiple unique ids found for "${parentId}"`)

    const parentNode = potentialParentNodes[0]

    // todo: detect loops
    if (parentNode === cannotContainNode) throw new Error(`Loop detected between '${this.getLine()}' and '${parentNode.getLine()}'`)

    const ancestorNodes = parentNode._getAncestorNodes(getPotentialParentNodesByIdFn, getParentIdFn, cannotContainNode)
    ancestorNodes.push(parentNode)
    return ancestorNodes
  }

  pathVectorToFirstWordPath(pathVector: jTreeTypes.pathVector): word[] {
    const path = pathVector.slice() // copy array
    const names = []
    let node: ImmutableNode = this
    while (path.length) {
      if (!node) return names
      names.push(node.nodeAt(path[0]).getFirstWord())
      node = node.nodeAt(path.shift())
    }
    return names
  }

  toCsv(): string {
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

  toDataTable(header = this._getUnionNames()): jTreeTypes.dataTable {
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

  toDelimited(delimiter: jTreeTypes.delimiter, header = this._getUnionNames()) {
    const regex = new RegExp(`(\\n|\\"|\\${delimiter})`)
    const cellFn: cellFn = (str, row, column) => (!str.toString().match(regex) ? str : `"` + str.replace(/\"/g, `""`) + `"`)
    return this._toDelimited(delimiter, header, cellFn)
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

  protected _toArrays(header: string[], cellFn: cellFn) {
    const skipHeaderRow = 1
    const headerArray = header.map((columnName, index) => cellFn(columnName, 0, index))
    const rows = this.map((node, rowNumber) =>
      header.map((columnName, columnIndex) => {
        const childNode = node.getNode(columnName)
        const content = childNode ? childNode.getContentWithChildren() : ""
        return cellFn(content, rowNumber + skipHeaderRow, columnIndex)
      })
    )
    return {
      rows: rows,
      header: headerArray
    }
  }

  protected _toDelimited(delimiter: jTreeTypes.delimiter, header: string[], cellFn: cellFn) {
    const data = this._toArrays(header, cellFn)
    return data.header.join(delimiter) + "\n" + data.rows.map(row => row.join(delimiter)).join("\n")
  }

  toTable(): string {
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

    const cellFn = (cellText: string, row: jTreeTypes.positiveInt, col: jTreeTypes.positiveInt) => {
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

  toSsv(): string {
    return this.toDelimited(" ")
  }

  toOutline(): string {
    return this._toOutline(node => node.getLine())
  }

  toMappedOutline(nodeFn: jTreeTypes.nodeToStringFn): string {
    return this._toOutline(nodeFn)
  }

  // Adapted from: https://github.com/notatestuser/treeify.js
  protected _toOutline(nodeFn: jTreeTypes.nodeToStringFn) {
    const growBranch = (outlineTreeNode: any, last: boolean, lastStates: any[], nodeFn: jTreeTypes.nodeToStringFn, callback: any) => {
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
    return node._setLineAndChildren(this.getLine(), this.childrenToString(), index)
  }

  // Note: Splits using a positive lookahead
  // this.split("foo").join("\n") === this.toString()
  split(firstWord: jTreeTypes.word): ImmutableNode[] {
    const constructor = <any>this.constructor
    const YI = this.getYI()
    const ZI = this.getZI()

    // todo: cleanup. the escaping is wierd.
    return this.toString()
      .split(new RegExp(`\\${YI}(?=${firstWord}(?:${ZI}|\\${YI}))`, "g"))
      .map(str => new constructor(str))
  }

  toMarkdownTable(): string {
    return this.toMarkdownTableAdvanced(this._getUnionNames(), (val: string) => val)
  }

  toMarkdownTableAdvanced(columns: word[], formatFn: jTreeTypes.formatFunction): string {
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

  toTsv(): string {
    return this.toDelimited("\t")
  }

  getYI(): string {
    return "\n"
  }

  getZI(): string {
    return " "
  }

  getYIRegex() {
    return new RegExp(this.getYI(), "g")
  }

  getXI(): string {
    return " "
  }

  protected _textToContentAndChildrenTuple(text: string) {
    const lines = text.split(this.getYIRegex())
    const firstLine = lines.shift()
    const children = !lines.length
      ? undefined
      : lines
          .map(line => (line.substr(0, 1) === this.getXI() ? line : this.getXI() + line))
          .map(line => line.substr(1))
          .join(this.getYI())
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
    delete this._children
    this._clearIndex()
    return this
  }

  protected _setChildren(content: any, circularCheckArray?: any[]) {
    this._clearChildren()
    if (!content) return this

    // set from string
    if (typeof content === "string") return this._parseString(content)

    // set from tree object
    if (content instanceof ImmutableNode) {
      const me = this
      content.forEach(node => {
        me._setLineAndChildren(node.getLine(), node.childrenToString())
      })
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
  protected _appendFromJavascriptObjectTuple(firstWord: jTreeTypes.word, content: any, circularCheckArray: Object[]) {
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
    else if (content instanceof ImmutableNode) {
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
    this._setLineAndChildren(line, children)
  }

  // todo: protected?
  _setLineAndChildren(line: string, children?: jTreeTypes.children, index = this.length) {
    const nodeConstructor: any = this._getParser()._getNodeConstructor(line, this)
    const newNode = new nodeConstructor(children, line, this)
    const adjustedIndex = index < 0 ? this.length + index : index

    this._getChildrenArray().splice(adjustedIndex, 0, newNode)

    if (this._index) this._makeIndex(adjustedIndex)
    return newNode
  }

  protected _parseString(str: string) {
    const lines = str.split(this.getYIRegex())
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
      const nodeConstructor: any = parent._getParser()._getNodeConstructor(lineContent, parent)
      lastNode = new nodeConstructor(undefined, lineContent, parent)
      parent._getChildrenArray().push(lastNode)
    })
    return this
  }

  protected _getIndex() {
    // StringMap<int> {firstWord: index}
    // When there are multiple tails with the same firstWord, _index stores the last content.
    // todo: change the above behavior: when a collision occurs, create an array.
    return this._index || this._makeIndex()
  }

  getContentsArray() {
    return this.map(node => node.getContent())
  }

  // todo: rename to getChildrenByConstructor(?)
  getChildrenByNodeConstructor(constructor: Function) {
    return this.filter(child => child instanceof constructor)
  }

  // todo: rename to getNodeByConstructor(?)
  getNodeByType(constructor: Function) {
    return this.find(child => child instanceof constructor)
  }

  indexOfLast(firstWord: word): int {
    const result = this._getIndex()[firstWord]
    return result === undefined ? -1 : result
  }

  // todo: renmae to indexOfFirst?
  indexOf(firstWord: word): int {
    if (!this.has(firstWord)) return -1

    const length = this.length
    const nodes = this._getChildren()

    for (let index = 0; index < length; index++) {
      if (nodes[index].getFirstWord() === firstWord) return index
    }
  }

  toObject(): Object {
    return this._toObject()
  }

  getFirstWords(): word[] {
    return this.map(node => node.getFirstWord())
  }

  protected _makeIndex(startAt = 0) {
    if (!this._index || !startAt) this._index = {}
    const nodes = this._getChildren()
    const newIndex = this._index
    const length = nodes.length

    for (let index = startAt; index < length; index++) {
      newIndex[nodes[index].getFirstWord()] = index
    }

    return newIndex
  }

  protected _childrenToXml(indentCount: jTreeTypes.positiveInt) {
    return this.map(node => node._toXml(indentCount)).join("")
  }

  protected _getIndentCount(str: string) {
    let level = 0
    const edgeChar = this.getXI()
    while (str[level] === edgeChar) {
      level++
    }
    return level
  }

  clone(): TreeNode {
    return new (<any>this.constructor)(this.childrenToString(), this.getLine())
  }

  // todo: rename to hasFirstWord
  has(firstWord: word): boolean {
    return this._hasFirstWord(firstWord)
  }

  protected _hasFirstWord(firstWord: string) {
    return this._getIndex()[firstWord] !== undefined
  }

  map(fn: mapFn) {
    return this.getChildren().map(fn)
  }

  filter(fn: jTreeTypes.filterFn) {
    return this.getChildren().filter(fn)
  }

  find(fn: jTreeTypes.filterFn) {
    return this.getChildren().find(fn)
  }

  every(fn: jTreeTypes.everyFn) {
    let index = 0
    for (let node of this.getTopDownArrayIterator()) {
      if (!fn(node, index)) return false
      index++
    }
    return true
  }

  forEach(fn: jTreeTypes.forEachFn) {
    this.getChildren().forEach(fn)
    return this
  }

  // todo: protected?
  _clearIndex() {
    delete this._index
  }

  slice(start: int, end?: int): ImmutableNode[] {
    return this.getChildren().slice(start, end)
  }

  // todo: make 0 and 1 a param
  getInheritanceTree() {
    const paths: jTreeTypes.stringMap = {}
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

  protected _getGrandParent(): ImmutableNode | undefined {
    return this.isRoot() || this.getParent().isRoot() ? undefined : this.getParent().getParent()
  }

  private _parser: Parser

  _getParser() {
    if (!this._parser) this._parser = this.createParser()
    return this._parser
  }

  createParser(): Parser {
    return new Parser(this.constructor)
  }

  private static _uniqueId: int

  static _makeUniqueId() {
    if (this._uniqueId === undefined) this._uniqueId = 0
    this._uniqueId++
    return this._uniqueId
  }

  protected static _getFileFormat(path: string) {
    const format = path.split(".").pop()
    return FileFormat[<any>format] ? format : FileFormat.tree
  }

  static Parser = Parser

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
}

class TreeNode extends ImmutableNode {
  private _mtime: int
  private _cmtime: int

  getMTime(): int {
    if (!this._mtime) this._updateMTime()
    return this._mtime
  }

  protected _getChildrenMTime() {
    const mTimes = this.map(child => child.getTreeMTime())
    const cmTime = this._getCMTime()
    if (cmTime) mTimes.push(cmTime)
    const newestTime = Math.max.apply(null, mTimes)
    return this._setCMTime(newestTime || this._getProcessTimeInMilliseconds())._getCMTime()
  }

  protected _getCMTime() {
    return this._cmtime
  }

  protected _setCMTime(value: number) {
    this._cmtime = value
    return this
  }

  getTreeMTime(): int {
    const mtime = this.getMTime()
    const cmtime = this._getChildrenMTime()
    return Math.max(mtime, cmtime)
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
    const map: { [nodeId: string]: jTreeTypes.inheritanceInfo } = {}
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
  // todo: should take a grammar? to decide whether to overwrite or append.
  // todo: this is slow.
  extend(nodeOrStr: TreeNode | string) {
    if (!(nodeOrStr instanceof TreeNode)) nodeOrStr = new TreeNode(nodeOrStr)

    const usedFirstWords = new Set()
    nodeOrStr.forEach(sourceNode => {
      const firstWord = sourceNode.getFirstWord()
      let targetNode
      const isAnArrayNotMap = usedFirstWords.has(firstWord)
      if (!this.has(firstWord)) {
        usedFirstWords.add(firstWord)
        this.appendLineAndChildren(sourceNode.getLine(), sourceNode.childrenToString())
        return true
      }
      if (isAnArrayNotMap) targetNode = this.appendLine(sourceNode.getLine())
      else {
        targetNode = this.touchNode(firstWord).setContent(sourceNode.getContent())
        usedFirstWords.add(firstWord)
      }
      if (sourceNode.length) targetNode.extend(sourceNode)
    })
    return this
  }

  macroExpand(macroDefinitionWord: string, macroUsageWord: string): TreeNode {
    const clone = this.clone()
    const defs = clone.findNodes(macroDefinitionWord)
    const allUses = clone.findNodes(macroUsageWord)
    const zi = clone.getZI()
    defs.forEach(def => {
      const macroName = def.getWord(1)
      const uses = allUses.filter(node => node.hasWord(1, macroName))
      const params = def.getWordsFrom(2)
      const replaceFn = (str: string) => {
        const paramValues = str.split(zi).slice(2)
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

  setChildren(children: jTreeTypes.children) {
    return this._setChildren(children)
  }

  protected _updateMTime() {
    this._mtime = this._getProcessTimeInMilliseconds()
  }

  insertWord(index: int, word: string) {
    const wi = this.getZI()
    const words = this._getLine().split(wi)
    words.splice(index, 0, word)
    this.setLine(words.join(wi))
    return this
  }

  deleteDuplicates() {
    const set = new Set()
    this.getTopDownArray().forEach(node => {
      const str = node.toString()
      if (set.has(str)) node.destroy()
      else set.add(str)
    })
    return this
  }

  setWord(index: int, word: string) {
    const wi = this.getZI()
    const words = this._getLine().split(wi)
    words[index] = word
    this.setLine(words.join(wi))
    return this
  }

  deleteChildren() {
    return this._clearChildren()
  }

  setContent(content: string): TreeNode {
    if (content === this.getContent()) return this
    const newArray = [this.getFirstWord()]
    if (content !== undefined) {
      content = content.toString()
      if (content.match(this.getYI())) return this.setContentWithChildren(content)
      newArray.push(content)
    }
    this._updateMTime()
    return this._setLine(newArray.join(this.getZI()))
  }

  setContentWithChildren(text: string) {
    // todo: deprecate
    if (!text.includes(this.getYI())) {
      this._clearChildren()
      return this.setContent(text)
    }

    const lines = text.split(this.getYIRegex())
    const firstLine = lines.shift()
    this.setContent(firstLine)

    // tood: cleanup.
    const remainingString = lines.join(this.getYI())
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
    this._updateMTime()
    // todo: clear parent TMTimes
    this.getParent()._clearIndex()
    return this._setLine(line)
  }

  duplicate() {
    return this.getParent()._setLineAndChildren(this.getLine(), this.childrenToString(), this.getIndex() + 1)
  }

  destroy() {
    ;(this.getParent() as TreeNode)._deleteNode(this)
  }

  set(firstWordPath: jTreeTypes.firstWordPath, text: string) {
    return this.touchNode(firstWordPath).setContentWithChildren(text)
  }

  setFromText(text: string) {
    if (this.toString() === text) return this
    const tuple = this._textToContentAndChildrenTuple(text)
    this.setLine(tuple[0])
    return this._setChildren(tuple[1])
  }

  // todo: throw error if line contains a \n
  appendLine(line: string) {
    return this._setLineAndChildren(line)
  }

  appendLineAndChildren(line: string, children: jTreeTypes.children) {
    return this._setLineAndChildren(line, children)
  }

  getNodesByRegex(regex: RegExp | RegExp[]) {
    const matches: ImmutableNode[] = []
    regex = regex instanceof RegExp ? [regex] : regex
    this._getNodesByLineRegex(matches, regex)
    return matches
  }

  getNodesByLinePrefixes(columns: string[]) {
    const matches: TreeNode[] = []
    this._getNodesByLineRegex(matches, columns.map(str => new RegExp("^" + str)))
    return matches
  }

  protected _getNodesByLineRegex(matches: ImmutableNode[], regs: RegExp[]) {
    const rgs = regs.slice(0)
    const reg = rgs.shift()
    const candidates = this.filter(child => child.getLine().match(reg))
    if (!rgs.length) return candidates.forEach(cand => matches.push(cand))
    candidates.forEach(cand => (<any>cand)._getNodesByLineRegex(matches, rgs))
  }

  concat(node: string | ImmutableNode) {
    if (typeof node === "string") node = new TreeNode(node)
    return node.map(node => this._setLineAndChildren(node.getLine(), node.childrenToString()))
  }

  protected _deleteByIndexes(indexesToDelete: int[]) {
    this._clearIndex()
    // note: assumes indexesToDelete is in ascending order
    indexesToDelete.reverse().forEach(index => this._getChildrenArray().splice(index, 1))
    return this._setCMTime(this._getProcessTimeInMilliseconds())
  }

  protected _deleteNode(node: ImmutableNode) {
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

  sort(fn: jTreeTypes.sortFn) {
    this._getChildrenArray().sort(fn)
    this._clearIndex()
    return this
  }

  invert() {
    this.forEach(node => node.getWords().reverse())
    return this
  }

  protected _rename(oldFirstWord: jTreeTypes.word, newFirstWord: jTreeTypes.word) {
    const index = this.indexOf(oldFirstWord)

    if (index === -1) return this

    const node = <TreeNode>this._getChildren()[index]

    node.setFirstWord(newFirstWord)
    this._clearIndex()
    return this
  }

  // Does not recurse.
  remap(map: jTreeTypes.stringMap) {
    this.forEach(node => {
      const firstWord = node.getFirstWord()
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
    const allNodes = this._getChildren()
    const indexesToDelete: int[] = []
    allNodes.forEach((node, index) => {
      if (node.getFirstWord() === firstWord) indexesToDelete.push(index)
    })
    return this._deleteByIndexes(indexesToDelete)
  }

  delete(path: jTreeTypes.firstWordPath = "") {
    const xi = this.getXI()
    if (!path.includes(xi)) return this._deleteAllChildNodesWithFirstWord(path)

    const parts = path.split(xi)
    const nextFirstWord = parts.pop()
    const targetNode = <TreeNode>this.getNode(parts.join(xi))

    return targetNode ? targetNode._deleteAllChildNodesWithFirstWord(nextFirstWord) : 0
  }

  deleteColumn(firstWord = "") {
    this.forEach(node => node.delete(firstWord))
    return this
  }

  protected _getNonMaps(): TreeNode[] {
    const results = this.getTopDownArray().filter(node => node.hasDuplicateFirstWords())
    if (this.hasDuplicateFirstWords()) results.unshift(this)
    return results
  }

  replaceNode(fn: (thisStr: string) => string) {
    const parent = this.getParent()
    const index = this.getIndex()
    const newNodes = new TreeNode(fn(this.toString()))
    const returnedNodes: TreeNode[] = []
    newNodes.forEach((child, childIndex) => {
      const newNode = (parent as TreeNode).insertLineAndChildren(child.getLine(), child.childrenToString(), index + childIndex)
      returnedNodes.push(newNode)
    })
    this.destroy()
    return returnedNodes
  }

  insertLineAndChildren(line: string, children: jTreeTypes.children, index: int) {
    return this._setLineAndChildren(line, children, index)
  }

  insertLine(line: string, index: int) {
    return this._setLineAndChildren(line, undefined, index)
  }

  prependLine(line: string) {
    return this.insertLine(line, 0)
  }

  pushContentAndChildren(content?: jTreeTypes.line, children?: jTreeTypes.children) {
    let index = this.length

    while (this.has(index.toString())) {
      index++
    }
    const line = index.toString() + (content === undefined ? "" : this.getZI() + content)
    return this.appendLineAndChildren(line, children)
  }

  deleteBlanks() {
    this.getChildren()
      .filter(node => node.isBlankLine())
      .forEach(node => (<TreeNode>node).destroy())
    return this
  }

  // todo: add "globalReplace" method? Which runs a global regex or string replace on the Tree doc as a string?

  firstWordSort(firstWordOrder: jTreeTypes.word[]): this {
    return this._firstWordSort(firstWordOrder)
  }

  deleteWordAt(wordIndex: jTreeTypes.positiveInt): this {
    const words = this.getWords()
    words.splice(wordIndex, 1)
    return this.setWords(words)
  }

  setWords(words: jTreeTypes.word[]): this {
    return this.setLine(words.join(this.getZI()))
  }

  setWordsFrom(index: jTreeTypes.positiveInt, words: jTreeTypes.word[]): this {
    this.setWords(
      this.getWords()
        .slice(0, index)
        .concat(words)
    )
    return this
  }

  appendWord(word: jTreeTypes.word): this {
    const words = this.getWords()
    words.push(word)
    return this.setWords(words)
  }

  _firstWordSort(firstWordOrder: jTreeTypes.word[], secondarySortFn?: jTreeTypes.sortFn): this {
    const nodeAFirst = -1
    const nodeBFirst = 1
    const map: { [firstWord: string]: int } = {}
    firstWordOrder.forEach((word, index) => {
      map[word] = index
    })
    this.sort((nodeA, nodeB) => {
      const valA = map[nodeA.getFirstWord()]
      const valB = map[nodeB.getFirstWord()]
      if (valA > valB) return nodeBFirst
      if (valA < valB) return nodeAFirst
      return secondarySortFn ? secondarySortFn(nodeA, nodeB) : 0
    })
    return this
  }

  protected _touchNode(firstWordPathArray: jTreeTypes.word[]) {
    let contextNode = this
    firstWordPathArray.forEach(firstWord => {
      contextNode = contextNode.getNode(firstWord) || contextNode.appendLine(firstWord)
    })
    return contextNode
  }

  protected _touchNodeByString(str: string) {
    str = str.replace(this.getYIRegex(), "") // todo: do we want to do this sanitization?
    return this._touchNode(str.split(this.getZI()))
  }

  touchNode(str: jTreeTypes.firstWordPath) {
    return this._touchNodeByString(str)
  }

  appendNode(node: TreeNode) {
    return this.appendLineAndChildren(node.getLine(), node.childrenToString())
  }

  hasLine(line: jTreeTypes.line) {
    return this.getChildren().some(node => node.getLine() === line)
  }

  getNodesByLine(line: jTreeTypes.line) {
    return this.filter(node => node.getLine() === line)
  }

  toggleLine(line: jTreeTypes.line): TreeNode {
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
      const wordsA = nodeA.getWords()
      const wordsB = nodeB.getWords()

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
  addObjectsAsDelimited(arrayOfObjects: Object[], delimiter = TreeUtils._chooseDelimiter(new TreeNode(arrayOfObjects).toString())) {
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

  setChildrenAsDelimited(tree: TreeNode | string, delimiter = TreeUtils._chooseDelimiter(tree.toString())) {
    tree = tree instanceof TreeNode ? tree : new TreeNode(tree)
    return this.setChildren(tree.toDelimited(delimiter))
  }

  convertChildrenToDelimited(delimiter = TreeUtils._chooseDelimiter(this.childrenToString())) {
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

    const parentIndex = this.getParent().getIndex()
    const newNode = grandParent.insertLineAndChildren(this.getLine(), this.length ? this.childrenToString() : undefined, parentIndex + 1)
    this.destroy()
    return newNode
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

  sortBy(nameOrNames: jTreeTypes.word[]) {
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

  static fromCsv(str: string) {
    return this.fromDelimited(str, ",", '"')
  }

  static fromJsonSubset(str: jTreeTypes.jsonSubset) {
    return new TreeNode(JSON.parse(str))
  }

  static fromSsv(str: string) {
    return this.fromDelimited(str, " ", '"')
  }

  static fromTsv(str: string) {
    return this.fromDelimited(str, "\t", '"')
  }

  static fromDelimited(str: string, delimiter: string, quoteChar: string = '"') {
    const rows = this._getEscapedRows(str, delimiter, quoteChar)
    return this._rowsToTreeNode(rows, delimiter, true)
  }

  static _getEscapedRows(str: string, delimiter: string, quoteChar: string) {
    return str.includes(quoteChar) ? this._strToRows(str, delimiter, quoteChar) : str.split("\n").map(line => line.split(delimiter))
  }

  static fromDelimitedNoHeaders(str: string, delimiter: string, quoteChar: string) {
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

      const obj: jTreeTypes.stringMap = {}
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
    const obj: jTreeTypes.stringMap = {}
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

  static fromDataTable(table: jTreeTypes.dataTable) {
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
    const ZI = " "
    const ziRegex = new RegExp(ZI, "g")

    if (hasHeaders) {
      // Strip any ZIs from column names in the header row.
      // This makes the mapping not quite 1 to 1 if there are any ZIs in names.
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
    const YI = "\n"
    const XI = " "
    const indent = YI + XI.repeat(xValue)
    return str ? indent + str.replace(/\n/g, indent) : ""
  }

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
}

export default TreeNode
