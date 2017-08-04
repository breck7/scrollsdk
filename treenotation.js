"use strict"

class AbstractNodeJsNode {
  _getNow() {
    return parseFloat(process.hrtime().join(""))
  }
}

class AbstractBrowserNode {
  _getNow() {
    return performance.now()
  }
}

const EnvironmentNodeType = typeof exports !== "undefined" ? AbstractNodeJsNode : AbstractBrowserNode

class ImmutableNode extends EnvironmentNodeType {
  constructor(children, line, parent) {
    super()
    this._parent = parent
    this._setChildren(children)
    this._setLine(line)
  }

  execute(context) {
    return this.getChildren().map(child => child.execute(context)).join("\n")
  }

  _getUid() {
    if (!this._uid) this._uid = ImmutableNode._makeUniqueId()
    return this._uid
  }

  getParent() {
    return this._parent
  }

  getInheritanceTree() {
    const paths = {}
    const result = new TreeNotation()
    this.getChildren().forEach(node => {
      const key = node.getWord(0)
      const parentKey = node.getWord(1)
      const parentPath = paths[parentKey]
      paths[key] = parentPath ? [parentPath, key].join(" ") : key
      result.touchNode(paths[key])
    })
    return result
  }

  getPoint(relativeTo) {
    return {
      x: this._getXCoordinate(relativeTo),
      y: this._getYCoordinate(relativeTo)
    }
  }

  _getYCoordinate(relativeTo) {
    return this.isRoot(relativeTo) ? 0 : this.getRootNode(relativeTo).getTopDownArray().indexOf(this) + 1 // todo: may be slow for big trees.
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
    return this._getLine().split(this.getZI())[index]
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
    // Set up the base part of the node
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

  getBase() {
    return this.getWords()[0]
  }

  getBeam() {
    const words = this.getWords(1)
    return words.length ? words.join(this.getZI()) : undefined
  }

  getBeamWithChildren() {
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
  getBasePath(relativeTo) {
    if (this.isRoot(relativeTo)) return ""
    else if (this.getParent().isRoot(relativeTo)) return this.getBase()

    return this.getParent().getBasePath(relativeTo) + this.getXI() + this.getBase()
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
      .map((word, index) => `<span class="word${index ? "" : " base"}">${ImmutableNode._stripHtml(word)}</span>`)
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
    const tag = this.getBase()
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
    return [this.getBase(), tupleValue]
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
    return this.getChildren().map(node => node.toString(indentCount, language)).join(language.getYI())
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

  findNodes(basePath) {
    return this._getChildren().filter(node => {
      if (node.getBase() === basePath) return true
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

  getNode(basePath) {
    return this._getNodeByPath(basePath)
  }

  findBeam(basePath) {
    const node = this._getNodeByPath(basePath)
    return node === undefined ? undefined : node.getBeam()
  }

  _getNodeByPath(basePath) {
    const xi = this.getXI()
    if (!basePath.includes(xi)) {
      const index = this.indexOfLast(basePath)
      return index === -1 ? undefined : this._nodeAt(index)
    }

    const parts = basePath.split(xi)
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
        obj[node.getBase()] = 1
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

  pathVectorToBasePath(pathVector) {
    const path = pathVector.slice() // copy array
    const names = []
    let node = this
    while (path.length) {
      if (!node) return names
      names.push(node.nodeAt(path[0]).getBase())
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
        // based on the "was last element" states of whatever we're nested within,
        // we need to append either blankness or a branch to our line
        lastStates.forEach((lastState, idx) => {
          if (idx > 0) line += lastState[1] ? " " : "│"
        })

        // the prefix varies based on whether the key contains something to show and
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

    // set from TreeNotation object
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
    for (let base in content) {
      if (!content.hasOwnProperty(base)) continue
      this._appendFromJavascriptObjectTuple(base, content[base], circularCheckArray)
    }

    return this
  }

  // todo: refactor the below.
  _appendFromJavascriptObjectTuple(base, beam, circularCheckArray) {
    const type = typeof beam
    let line
    let children
    if (beam === null) line = base + " " + null
    else if (beam === undefined) line = base
    else if (type === "string") {
      const tuple = this._textToBeamAndChildrenTuple(beam)
      line = base + " " + tuple[0]
      children = tuple[1]
    } else if (type !== "object") line = base + " " + beam
    else if (beam instanceof Date) line = base + " " + beam.getTime().toString()
    else if (beam instanceof ImmutableNode) {
      line = base
      children = new ImmutableNode(beam.childrenToString(), beam.getLine())
    } else if (type === "function") line = base + " " + beam.toString()
    else if (circularCheckArray.indexOf(beam) === -1) {
      circularCheckArray.push(beam)
      line = base
      const length = beam instanceof Array ? beam.length : Object.keys(beam).length
      if (length) children = new TreeNotation()._setChildren(beam, circularCheckArray)
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
    // StringMap<int> {base: index}
    // When there are multiple tails with the same base, _index stores the last beam.
    return this._index || this._makeIndex()
  }

  getBeams() {
    return this.getChildren().map(node => node.getBeam())
  }

  getChildrenByNodeType(type) {
    return this.getChildren().filter(child => child instanceof type)
  }

  indexOfLast(base) {
    const result = this._getIndex()[base]
    return result === undefined ? -1 : result
  }

  indexOf(base) {
    if (!this.has(base)) return -1

    const length = this.length
    const nodes = this.getChildren()

    for (let index = 0; index < length; index++) {
      if (nodes[index].getBase() === base) return index
    }
    return -1
  }

  toObject() {
    return this._toObject()
  }

  getBases() {
    return this._getChildren().map(node => node.getBase())
  }

  _makeIndex(startAt = 0) {
    if (!this._index || !startAt) this._index = {}
    const nodes = this.getChildren()
    const newIndex = this._index
    const length = nodes.length

    for (let index = startAt; index < length; index++) {
      newIndex[nodes[index].getBase()] = index
    }

    return newIndex
  }

  _childrenToXml(indentCount) {
    return this.getChildren().map(node => node._toXml(indentCount)).join("")
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

  has(base) {
    return this._getIndex()[base] !== undefined
  }

  _getBaseByIndex(index) {
    // Passing -1 gets the last item, et cetera
    const length = this.length

    if (index < 0) index = length + index
    if (index >= length) return undefined
    return this.getChildren()[index].getBase()
  }

  parseNodeType(line) {
    return this.constructor
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

class TreeNotation extends ImmutableNode {
  getMTime() {
    return this._mtime
  }

  _clearIndex() {
    delete this._index
  }

  setChildren(children) {
    return this._setChildren(children)
  }

  _updateMTime() {
    this._mtime = this._getNow()
  }

  setWord(index, word) {
    const wi = this.getZI()
    const words = this._getLine().split(wi)
    words[index] = word
    this._setLine(words.join(wi))
    return this
  }

  setBeam(beam) {
    if (beam === this.getBeam()) return this
    const newArray = [this.getBase()]
    if (beam !== undefined) {
      beam = beam.toString()
      if (beam.match(this.getYI())) return this.setBeamWithChildren(beam)
      newArray.push(beam)
    }
    this._updateMTime()
    return this._setLine(newArray.join(this.getZI()))
  }

  setBeamWithChildren(text) {
    if (!text.includes(this.getYI())) {
      this._clearChildren()
      return this.setBeam(text)
    }

    const lines = text.split(this.getYIRegex())
    const firstLine = lines.shift()
    this.setBeam(firstLine)

    // tood: cleanup.
    const remainingString = lines.join(this.getYI())
    const children = new TreeNotation(remainingString)
    if (!remainingString) children.append("")
    this.setChildren(children)
    return this
  }

  setBase(base) {
    if (base === this.getBase()) return this
    this.getWords()[0] = base
    this._updateMTime()
    return this
  }

  setLine(line) {
    if (line === this.getLine()) return this
    this._updateMTime()
    return this._setLine(line)
  }

  duplicate() {
    return this.getParent()._setLineAndChildren(this.getLine(), this.childrenToString(), this.getIndex() + 1)
  }

  destroy() {
    this.getParent()._deleteNode(this)
  }

  setFromText(text) {
    if (this.toString() === text) return this
    const tuple = this._textToBeamAndChildrenTuple(text)
    this.setLine(tuple[0])
    return this._setChildren(tuple[1])
  }

  append(line, children) {
    return this._setLineAndChildren(line, children)
  }

  concat(node) {
    if (typeof node === "string") node = new TreeNotation(node)
    return node._getChildren().map(node => this._setLineAndChildren(node.getLine(), node.childrenToString()))
  }

  _deleteByIndexes(indexesToDelete) {
    this._clearIndex()
    // note: assumes indexesToDelete is in ascending order
    indexesToDelete.reverse().forEach(index => this.getChildren().splice(index, 1))
    return this
  }

  _deleteNode(node) {
    const index = this._indexOfNode(node)
    if (index > -1) return this._deleteByIndexes([index])
    return 0
  }

  reverse() {
    this._clearIndex()
    this.getChildren().reverse()
    return this
  }

  shift() {
    if (!this.length) return null
    const node = this.getChildren().shift()
    return node.copyTo(new this.constructor())
  }

  sort(fn) {
    this.getChildren().sort(fn)
    this._clearIndex()
    return this
  }

  invert() {
    this.getChildren().forEach(node => node.getWords().reverse())
    return this
  }

  _rename(oldBase, newBase) {
    const index = this.indexOf(oldBase)

    if (index === -1) return this
    this.getChildren()[index].setBase(newBase)
    this._clearIndex()
    return this
  }

  remap(map) {
    this.getChildren().forEach(node => {
      const base = node.getBase()
      if (map[base] !== undefined) node.setBase(map[base])
    })
    return this
  }

  rename(oldBase, newBase) {
    this._rename(oldBase, newBase)
    return this
  }

  renameAll(oldName, newName) {
    this.findNodes(oldName).forEach(node => node.setBase(newName))
    return this
  }

  _deleteByBase(base) {
    if (!this.has(base)) return this
    const allNodes = this._getChildren()
    const indexesToDelete = []
    allNodes.forEach((node, index) => {
      if (node.getBase() === base) indexesToDelete.push(index)
    })
    return this._deleteByIndexes(indexesToDelete)
  }

  delete(base = "") {
    const xi = this.getXI()
    if (!base.includes(xi)) return this._deleteByBase(base)

    const parts = base.split(xi)
    const nextBase = parts.pop()
    const targetNode = this.getNode(parts.join(xi))

    return targetNode ? targetNode._deleteByBase(nextBase) : 0
  }

  extend(nodeOrStr) {
    if (!(nodeOrStr instanceof TreeNotation)) nodeOrStr = new TreeNotation(nodeOrStr)
    nodeOrStr.getChildren().forEach(node => {
      const path = node.getBase()
      const beam = node.getBeam()
      const targetNode = this.touchNode(path).setBeam(beam)
      if (node.length) targetNode.extend(node.childrenToString())
    })
    return this
  }

  insert(line, children, index) {
    return this._setLineAndChildren(line, children, index)
  }

  prepend(line, children) {
    return this.insert(line, children, 0)
  }

  pushBeamAndChildren(beam, children) {
    let index = this.length

    while (this.has(index.toString())) {
      index++
    }
    const line = index.toString() + (beam === undefined ? "" : this.getZI() + beam)
    return this.append(line, children)
  }

  _touchNode(basePathArray) {
    let contextNode = this
    basePathArray.forEach(base => {
      contextNode = contextNode.getNode(base) || contextNode.append(base)
    })
    return contextNode
  }

  _touchNodeByString(str) {
    str = str.replace(this.getYIRegex(), "") // todo: do we want to do this sanitization?
    return this._touchNode(str.split(this.getZI()))
  }

  touchNode(str) {
    return this._touchNodeByString(str)
  }

  sortBy(nameOrNames) {
    nameOrNames = nameOrNames instanceof Array ? nameOrNames : [nameOrNames]

    const namesLength = nameOrNames.length
    this.sort((nodeA, nodeB) => {
      if (!nodeB.length && !nodeA.length) return 0
      else if (!nodeA.length) return -1
      else if (!nodeB.length) return 1

      for (let nameIndex = 0; nameIndex < namesLength; nameIndex++) {
        const base = nameOrNames[nameIndex]
        const av = nodeA.getNode(base).getBeam()
        const bv = nodeB.getNode(base).getBeam()

        if (av > bv) return 1
        else if (av < bv) return -1
      }
      return 0
    })
    return this
  }

  static fromCsv(str, hasHeaders) {
    return this.fromDelimited(str, ",", hasHeaders)
  }

  static fromJson(str) {
    return new TreeNotation(JSON.parse(str))
  }

  static fromSsv(str, hasHeaders) {
    return this.fromDelimited(str, " ", hasHeaders)
  }

  static fromTsv(str, hasHeaders) {
    return this.fromDelimited(str, "\t", hasHeaders)
  }

  static fromDelimited(str, delimiter, hasHeaders, quoteChar = '"') {
    const rows = str.includes(quoteChar)
      ? this._strToRows(str, delimiter, quoteChar)
      : str.split("\n").map(line => line.split(delimiter))
    return this._rowsToTreeNode(rows, delimiter, hasHeaders === false ? false : true)
  }

  static _strToRows(str, delimiter, quoteChar, newLineChar = "\n") {
    const rows = [[]]
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

  static multiply(nodeA, nodeB) {
    const productNode = nodeA.clone()
    productNode._getChildren().forEach((node, index) => {
      node.setChildren(node.length ? this.multiply(node, nodeB) : nodeB.clone())
    })
    return productNode
  }

  // Given an array return a tree
  static _rowsToTreeNode(rows, delimiter, hasHeaders) {
    const numberOfColumns = rows[0].length
    const treeNode = new TreeNotation()
    const names = this._getBaseer(rows, hasHeaders)

    const rowCount = rows.length
    for (let rowIndex = hasHeaders ? 1 : 0; rowIndex < rowCount; rowIndex++) {
      const rowTree = new TreeNotation()
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

      const obj = {}
      row.forEach((cellValue, index) => {
        obj[names[index]] = cellValue
      })

      treeNode.pushBeamAndChildren(undefined, obj)
    }
    return treeNode
  }

  static _initializeXmlParser() {
    if (this._xmlParser) return
    const windowObj = window

    if (typeof windowObj.DOMParser !== "undefined")
      this._xmlParser = xmlStr => new windowObj.DOMParser().parseFromString(xmlStr, "text/xml")
    else if (typeof windowObj.ActiveXObject !== "undefined" && new windowObj.ActiveXObject("Microsoft.XMLDOM")) {
      this._xmlParser = xmlStr => {
        const xmlDoc = new windowObj.ActiveXObject("Microsoft.XMLDOM")
        xmlDoc.async = "false"
        xmlDoc.loadXML(xmlStr)
        return xmlDoc
      }
    } else throw new Error("No XML parser found")
  }

  static fromXml(str) {
    this._initializeXmlParser()
    const xml = this._xmlParser(str)

    try {
      return this._treeNodeFromXml(xml).getNode("children")
    } catch (err) {
      return this._treeNodeFromXml(this._parseXml2(str)).getNode("children")
    }
  }

  static _parseXml2(str) {
    const el = document.createElement("div")
    el.innerHTML = str
    return el
  }

  static _treeNodeFromXml(xml) {
    const result = new TreeNotation()
    const children = new TreeNotation()

    // Set attributes
    if (xml.attributes) {
      for (let index = 0; index < xml.attributes.length; index++) {
        result.setBeam(xml.attributes[index].name, xml.attributes[index].value)
      }
    }

    if (xml.data) children.pushBeamAndChildren(xml.data)

    // Set content
    if (xml.childNodes && xml.childNodes.length > 0) {
      for (let index = 0; index < xml.childNodes.length; index++) {
        const child = xml.childNodes[index]

        if (child.tagName && child.tagName.match(/parsererror/i)) throw new Error("Parse Error")

        if (child.childNodes.length > 0 && child.tagName) children.append(child.tagName, this._treeNodeFromXml(child))
        else if (child.tagName) children.append(child.tagName)
        else if (child.data) {
          const data = child.data.trim()
          if (data) children.pushBeamAndChildren(data)
        }
      }
    }

    if (children.length > 0) result.touchNode("children").setChildren(children)

    return result
  }

  static _getBaseer(rows, hasHeaders) {
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

  static nest(str, xValue) {
    const YI = "\n"
    const XI = " "
    const indent = YI + XI.repeat(xValue)
    return str ? indent + str.replace(/\n/g, indent) : ""
  }

  static getVersion() {
    return "5.3.0"
  }
}

TreeNotation.ImmutableNode = ImmutableNode

if (typeof exports !== "undefined") module.exports = TreeNotation
