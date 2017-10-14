"use strict"

const AbstractNode = require("./AbstractNodeJsNode.js")

class ImmutableNode extends AbstractNode {
  constructor(children, line, parent) {
    super()
    this._parent = parent
    this._setLine(line)
    this._setChildren(children)
  }

  execute(context) {
    return Promise.all(this.getChildren().map(child => child.execute(context)))
  }

  getErrors() {
    return []
  }

  getWordTypeLine() {
    return "any ".repeat(this.getWords().length).trim()
  }

  executeSync(context) {
    return this.getChildren().map(child => child.executeSync(context))
  }

  compile() {
    return this.getChildren()
      .map(child => child.compile())
      .join("\n")
  }

  _getUid() {
    if (!this._uid) this._uid = ImmutableNode._makeUniqueId()
    return this._uid
  }

  getParent() {
    return this._parent
  }

  getPoint(relativeTo) {
    return {
      x: this._getXCoordinate(relativeTo),
      y: this._getYCoordinate(relativeTo)
    }
  }

  getIndentation(relativeTo) {
    return this.getXI().repeat(this._getXCoordinate(relativeTo) - 1)
  }

  _getYCoordinate(relativeTo) {
    return this.isRoot(relativeTo)
      ? 0
      : this.getRootNode(relativeTo)
          .getTopDownArray()
          .indexOf(this) + 1 // todo: may be slow for big trees.
  }

  isRoot(relativeTo) {
    return relativeTo === this || !this.getParent()
  }

  getRootNode(relativeTo) {
    if (this.isRoot(relativeTo)) return this
    return this.getParent().getRootNode(relativeTo)
  }

  toString(indentCount = 0, language = this) {
    if (this.isRoot()) return this._childrenToString(indentCount, language)
    const content = language.getXI().repeat(indentCount) + this.getLine(language)
    const value = content + (this.length ? language.getYI() + this._childrenToString(indentCount + 1, language) : "")
    return value
  }

  getRest() {
    return this.getWords().slice(1)
  }

  getWord(index) {
    const words = this._getLine().split(this.getZI())
    if (index < 0) index = words.length + index
    return words[index]
  }

  _toHtml(indentCount) {
    const path = this.getPathVector().join(" ")
    const classes = {
      nodeLine: "nodeLine",
      xi: "xIncrement",
      yi: "yIncrement",
      nodeChildren: "nodeChildren"
    }
    const edge = this.getXI().repeat(indentCount)
    // Set up the keyword part of the node
    const edgeHtml = `<span class="${classes.nodeLine}" data-pathVector="${path}"><span class="${classes.xi}">${edge}</span>`
    const lineHtml = this._getLineHtml()
    const childrenHtml = this.length
      ? `<span class="${classes.yi}">${this.getYI()}</span>` +
        `<span class="${classes.nodeChildren}">${this._childrenToHtml(indentCount + 1)}</span>`
      : ""

    return `${edgeHtml}${lineHtml}${childrenHtml}</span>`
  }

  getWords(startFrom = 0) {
    if (!this._words) this._words = this._getLine().split(this.getZI())
    return startFrom ? this._words.slice(startFrom) : this._words
  }

  getKeyword() {
    return this.getWords()[0]
  }

  getBeam() {
    const words = this.getWords(1)
    return words.length ? words.join(this.getZI()) : undefined
  }

  getBeamWithChildren() {
    // todo: deprecate
    const beam = this.getBeam()
    return (beam ? beam : "") + (this.length ? this.getYI() + this._childrenToString() : "")
  }

  getStack(relativeTo) {
    if (this.isRoot(relativeTo)) return []
    const parent = this.getParent()
    if (parent.isRoot(relativeTo)) return [this]
    else return parent.getStack(relativeTo).concat([this])
  }

  getStackString(relativeTo) {
    return this.getStack(relativeTo)
      .map((node, index) => this.getXI().repeat(index) + node.getLine())
      .join(this.getYI())
  }

  getLine(language = this) {
    return this.getWords().join(language.getZI())
  }

  // todo: return array? getPathArray?
  getKeywordPath(relativeTo) {
    if (this.isRoot(relativeTo)) return ""
    else if (this.getParent().isRoot(relativeTo)) return this.getKeyword()

    return this.getParent().getKeywordPath(relativeTo) + this.getXI() + this.getKeyword()
  }

  getPathVector(relativeTo) {
    if (this.isRoot(relativeTo)) return []
    const path = this.getParent().getPathVector(relativeTo)
    path.push(this.getIndex())
    return path
  }

  getIndex() {
    return this.getParent()._indexOfNode(this)
  }

  isTerminal() {
    return !this.length
  }

  _getLineHtml() {
    return this.getWords()
      .map((word, index) => `<span class="word${index ? "" : " keyword"}">${ImmutableNode._stripHtml(word)}</span>`)
      .join(`<span class="zIncrement">${this.getZI()}</span>`)
  }

  _getXmlContent(indentCount) {
    if (this.getBeam() !== undefined) return this.getBeamWithChildren()
    return this.length
      ? `${indentCount === -1 ? "" : "\n"}${this._childrenToXml(indentCount > -1 ? indentCount + 2 : -1)}${" ".repeat(
          indentCount
        )}`
      : ""
  }

  _toXml(indentCount) {
    const indent = " ".repeat(indentCount)
    const tag = this.getKeyword()
    return `${indent}<${tag}>${this._getXmlContent(indentCount)}</${tag}>${indentCount === -1 ? "" : "\n"}`
  }

  _toObjectTuple() {
    const beam = this.getBeam()
    const length = this.length
    const hasChildrenNoBeam = beam === undefined && length
    const hasBeamAndHasChildren = beam !== undefined && length
    // If the node has a beam and a subtree return it as a string, as
    // Javascript object values can't be both a leaf and a tree.
    const tupleValue = hasChildrenNoBeam ? this.toObject() : hasBeamAndHasChildren ? this.getBeamWithChildren() : beam
    return [this.getKeyword(), tupleValue]
  }

  _indexOfNode(needleNode) {
    let result = -1
    this.getChildren().find((node, index) => {
      if (node === needleNode) {
        result = index
        return true
      }
    })
    return result
  }

  getTopDownArray() {
    const arr = []
    this._getTopDownArray(arr)
    return arr
  }

  _getTopDownArray(arr) {
    this.getChildren().forEach(child => {
      arr.push(child)
      child._getTopDownArray(arr)
    })
  }

  getChildrenFirstArray() {
    const arr = []
    this._getChildrenFirstArray(arr)
    return arr
  }

  _getChildrenFirstArray(arr) {
    this.getChildren().forEach(child => {
      child._getChildrenFirstArray(arr)
      arr.push(child)
    })
  }

  _getXCoordinate(relativeTo) {
    return this.getStack(relativeTo).length
  }

  getParentFirstArray() {
    const levels = this._getLevels()
    const arr = []
    levels.forEach(level => {
      level.forEach(item => arr.push(item))
    })
    return arr
  }

  _getLevels() {
    const levels = []
    this.getTopDownArray().forEach(node => {
      const level = node._getXCoordinate()
      if (!levels[level]) levels[level] = []
      levels[level].push(node)
    })
    return levels
  }

  _getChildren() {
    if (!this._children) this._children = []
    return this._children
  }

  getLines() {
    return this._getChildren().map(node => node.getLine())
  }

  getChildren() {
    return this._getChildren()
  }

  get length() {
    return this.getChildren().length
  }

  _nodeAt(index) {
    if (index < 0) index = this.length + index
    return this.getChildren()[index]
  }

  nodeAt(indexOrArray) {
    const type = typeof indexOrArray
    if (type === "number") return this._nodeAt(indexOrArray)

    if (indexOrArray.length === 1) return this._nodeAt(indexOrArray[0])

    const first = indexOrArray[0]
    const node = this._nodeAt(first)
    if (!node) return undefined
    return node.nodeAt(indexOrArray.slice(1))
  }

  _toObject() {
    const obj = {}
    this._getChildren().forEach(node => {
      const tuple = node._toObjectTuple()
      obj[tuple[0]] = tuple[1]
    })
    return obj
  }

  toHtml() {
    return this._childrenToHtml(0)
  }

  _childrenToHtml(indentCount) {
    return this.getChildren()
      .map(node => node._toHtml(indentCount))
      .join(`<span class="yIncrement">${this.getYI()}</span>`)
  }

  _childrenToString(indentCount, language = this) {
    return this.getChildren()
      .map(node => node.toString(indentCount, language))
      .join(language.getYI())
  }

  childrenToString() {
    return this._childrenToString()
  }

  toXml() {
    return this._childrenToXml(0)
  }

  toJson() {
    return JSON.stringify(this.toObject(), null, " ")
  }

  findNodes(keywordPath) {
    return this._getChildren().filter(node => {
      if (node.getKeyword() === keywordPath) return true
      return false
    })
  }

  format(str) {
    const that = this
    return str.replace(/{([^\}]+)}/g, (match, path) => {
      const node = that.getNode(path)
      return node ? node.getBeam() : ""
    })
  }

  getColumn(path) {
    return this._getChildren().map(node => {
      const cell = node.getNode(path)
      return cell === undefined ? undefined : cell.getBeam()
    })
  }

  getNode(keywordPath) {
    return this._getNodeByPath(keywordPath)
  }

  findBeam(keywordPath) {
    const node = this._getNodeByPath(keywordPath)
    return node === undefined ? undefined : node.getBeam()
  }

  _getNodeByPath(keywordPath) {
    const xi = this.getXI()
    if (!keywordPath.includes(xi)) {
      const index = this.indexOfLast(keywordPath)
      return index === -1 ? undefined : this._nodeAt(index)
    }

    const parts = keywordPath.split(xi)
    const current = parts.shift()
    const currentNode = this.getChildren()[this._getIndex()[current]]
    return currentNode ? currentNode._getNodeByPath(parts.join(xi)) : undefined
  }

  getNext() {
    if (this.isRoot()) return this
    const index = this.getIndex()
    const parent = this.getParent()
    const length = parent.length
    const next = index + 1
    return next === length ? parent.getChildren()[0] : parent.getChildren()[next]
  }

  getPrevious() {
    if (this.isRoot()) return this
    const index = this.getIndex()
    const parent = this.getParent()
    const length = parent.length
    const prev = index - 1
    return prev === -1 ? parent.getChildren()[length - 1] : parent.getChildren()[prev]
  }

  _getUnionNames() {
    if (!this.length) return []

    const obj = {}
    this._getChildren().forEach(node => {
      if (!node.length) return undefined
      node._getChildren().forEach(node => {
        obj[node.getKeyword()] = 1
      })
    })
    return Object.keys(obj)
  }

  getGraph(key) {
    const graph = this._getGraph(key)
    graph.push(this)
    return graph
  }

  _getGraph(key) {
    const name = key ? this.findBeam(key) : this.getWord(1)
    if (!name) return []
    const parentNode = this.getParent().getNode(name)
    const graph = parentNode._getGraph(key)
    graph.push(parentNode)
    return graph
  }

  pathVectorToKeywordPath(pathVector) {
    const path = pathVector.slice() // copy array
    const names = []
    let node = this
    while (path.length) {
      if (!node) return names
      names.push(node.nodeAt(path[0]).getKeyword())
      node = node.nodeAt(path.shift())
    }
    return names
  }

  toCsv() {
    return this.toDelimited(",")
  }

  toDelimited(delimiter, header) {
    const regex = new RegExp(`(\\n|\\"|\\${delimiter})`)
    const cellFn = (str, row, column) => (!str.toString().match(regex) ? str : `"` + str.replace(/\"/g, `""`) + `"`)
    header = header || this._getUnionNames()
    return this._toDelimited(delimiter, header, cellFn)
  }

  _toDelimited(delimiter, header, cellFn) {
    const headerRow = header.map((columnName, index) => cellFn(columnName, 0, index)).join(delimiter)
    const rows = this._getChildren().map((node, rowNumber) => {
      return header
        .map((columnName, index) => {
          const childNode = node.getNode(columnName)
          const beam = childNode ? childNode.getBeamWithChildren() : ""
          return cellFn(beam, rowNumber + 1, index)
        })
        .join(delimiter)
    })
    return headerRow + "\n" + rows.join("\n")
  }

  toFixedWidthTable(maxWidth = 100) {
    const header = this._getUnionNames()
    const widths = header.map(col => (col.length > maxWidth ? maxWidth : col.length))

    this._getChildren().forEach(node => {
      if (!node.length) return true
      header.forEach((col, index) => {
        const cellValue = node.getNode(col).getBeam()
        if (!cellValue) return true
        const length = cellValue.toString().length
        if (length > widths[index]) widths[index] = length > maxWidth ? maxWidth : length
      })
    })
    const cellFn = (cellText, row, col) => {
      const width = widths[col]
      // Strip newlines in fixedWidth output
      const cellValue = cellText.toString().replace(/\n/g, "\\n")
      const cellLength = cellValue.length
      if (cellLength > width) {
        return cellValue.substr(0, width)
      }
      return " ".repeat(width - cellLength) + cellValue
    }
    return this._toDelimited(" ", header, cellFn)
  }

  toSsv() {
    return this.toDelimited(" ")
  }

  toOutline(nodeFn) {
    return this._toOutline(nodeFn)
  }

  // Adapted from: https://github.com/notatestuser/treeify.js
  _toOutline(nodeFn = node => node.getLine()) {
    const growBranch = (outlineTreeNode, last, lastStates, nodeFn, callback) => {
      let lastStatesCopy = lastStates.slice(0)
      const node = outlineTreeNode.node

      if (lastStatesCopy.push([outlineTreeNode, last]) && lastStates.length > 0) {
        let line = ""
        // keywordd on the "was last element" states of whatever we're nested within,
        // we need to append either blankness or a branch to our line
        lastStates.forEach((lastState, idx) => {
          if (idx > 0) line += lastState[1] ? " " : "│"
        })

        // the prefix varies keywordd on whether the key contains something to show and
        // whether we're dealing with the last element in this collection
        // the extra "-" just makes things stand out more.
        line += (last ? "└" : "├") + nodeFn(node)
        callback(line)
      }

      if (!node) return

      const length = node.length
      let index = 0
      node._getChildren().forEach(node => {
        let lastKey = ++index === length

        growBranch({ node: node }, lastKey, lastStatesCopy, nodeFn, callback)
      })
    }

    let output = ""
    growBranch({ node: this }, false, [], nodeFn, line => (output += line + "\n"))
    return output
  }

  copyTo(node, index) {
    const newNode = node._setLineAndChildren(
      this.getLine(),
      this.childrenToString(),
      index === undefined ? node.length : index
    )
    return newNode
  }

  toTsv() {
    return this.toDelimited("\t")
  }

  getYI() {
    return "\n"
  }

  getZI() {
    return " "
  }

  getYIRegex() {
    return new RegExp(this.getYI(), "g")
  }

  getXI() {
    return " "
  }

  _textToBeamAndChildrenTuple(text) {
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

  _getLine() {
    return this._line
  }

  _setLine(line = "") {
    this._line = line
    if (this._words) delete this._words
    return this
  }

  _clearChildren() {
    delete this._children
  }

  _setChildren(content, circularCheckArray) {
    this._clearChildren()
    if (!content) return this

    // set from string
    if (typeof content === "string") return this._parseString(content)

    // set from TreeProgram object
    if (content instanceof ImmutableNode) {
      const me = this
      content._getChildren().forEach(node => {
        me._setLineAndChildren(node.getLine(), node.childrenToString())
      })
      return this
    }

    // If we set from object, create an array of inserted objects to avoid circular loops
    if (!circularCheckArray) circularCheckArray = [content]

    return this._setFromObject(content, circularCheckArray)
  }

  _setFromObject(content, circularCheckArray) {
    for (let keyword in content) {
      if (!content.hasOwnProperty(keyword)) continue
      this._appendFromJavascriptObjectTuple(keyword, content[keyword], circularCheckArray)
    }

    return this
  }

  // todo: refactor the below.
  _appendFromJavascriptObjectTuple(keyword, beam, circularCheckArray) {
    const type = typeof beam
    let line
    let children
    if (beam === null) line = keyword + " " + null
    else if (beam === undefined) line = keyword
    else if (type === "string") {
      const tuple = this._textToBeamAndChildrenTuple(beam)
      line = keyword + " " + tuple[0]
      children = tuple[1]
    } else if (type !== "object") line = keyword + " " + beam
    else if (beam instanceof Date) line = keyword + " " + beam.getTime().toString()
    else if (beam instanceof ImmutableNode) {
      line = keyword
      children = new ImmutableNode(beam.childrenToString(), beam.getLine())
    } else if (type === "function") line = keyword + " " + beam.toString()
    else if (circularCheckArray.indexOf(beam) === -1) {
      circularCheckArray.push(beam)
      line = keyword
      const length = beam instanceof Array ? beam.length : Object.keys(beam).length
      if (length) children = new ImmutableNode()._setChildren(beam, circularCheckArray)
    } else {
      // iirc this is return early from circular
      return
    }
    this._setLineAndChildren(line, children)
  }

  _setLineAndChildren(line, children, index = this.length) {
    const nodeClass = this.parseNodeType(line)
    const parsedNode = new nodeClass(children, line, this)
    const adjustedIndex = index < 0 ? this.length + index : index

    this.getChildren().splice(adjustedIndex, 0, parsedNode)

    if (this._index) this._makeIndex(adjustedIndex)
    return parsedNode
  }

  _parseString(str) {
    if (!str) return this
    const lines = str.split(this.getYIRegex())
    const parentStack = []
    let currentIndentCount = -1
    let lastNode = this
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
      const nodeClass = parent.parseNodeType(lineContent)
      lastNode = new nodeClass(undefined, lineContent, parent)
      parent._getChildren().push(lastNode)
    })
    return this
  }

  _getIndex() {
    // StringMap<int> {keyword: index}
    // When there are multiple tails with the same keyword, _index stores the last beam.
    return this._index || this._makeIndex()
  }

  getBeams() {
    return this.getChildren().map(node => node.getBeam())
  }

  getChildrenByNodeType(type) {
    return this.getChildren().filter(child => child instanceof type)
  }

  indexOfLast(keyword) {
    const result = this._getIndex()[keyword]
    return result === undefined ? -1 : result
  }

  indexOf(keyword) {
    if (!this.has(keyword)) return -1

    const length = this.length
    const nodes = this.getChildren()

    for (let index = 0; index < length; index++) {
      if (nodes[index].getKeyword() === keyword) return index
    }
    return -1
  }

  toObject() {
    return this._toObject()
  }

  getKeywords() {
    return this._getChildren().map(node => node.getKeyword())
  }

  _makeIndex(startAt = 0) {
    if (!this._index || !startAt) this._index = {}
    const nodes = this.getChildren()
    const newIndex = this._index
    const length = nodes.length

    for (let index = startAt; index < length; index++) {
      newIndex[nodes[index].getKeyword()] = index
    }

    return newIndex
  }

  _childrenToXml(indentCount) {
    return this.getChildren()
      .map(node => node._toXml(indentCount))
      .join("")
  }

  _getIndentCount(str) {
    let level = 0
    const edgeChar = this.getXI()
    while (str[level] === edgeChar) {
      level++
    }
    return level
  }

  clone() {
    return new this.constructor(this.childrenToString(), this.getLine())
  }

  has(keyword) {
    return this._getIndex()[keyword] !== undefined
  }

  _getKeywordByIndex(index) {
    // Passing -1 gets the last item, et cetera
    const length = this.length

    if (index < 0) index = length + index
    if (index >= length) return undefined
    return this.getChildren()[index].getKeyword()
  }

  getKeywordMap() {
    return {}
  }

  getCatchAllNodeClass(line) {
    return this.constructor
  }

  parseNodeType(line) {
    return this.getKeywordMap()[line.split(" ")[0]] || this.getCatchAllNodeClass(line)
  }

  static _makeUniqueId() {
    if (this._uniqueId === undefined) this._uniqueId = 0
    this._uniqueId++
    return this._uniqueId
  }

  static _stripHtml(text) {
    return text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text
  }
}

module.exports = ImmutableNode
