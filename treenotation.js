"use strict"

class ImmutableTreeNode {
  constructor(tree, line, parent) {
    this._words = []
    this._uid = ImmutableTreeNode._makeUniqueId()
    this._ctime = Date.now()
    this._parent = parent
    this._loadChildren(tree)
    if (line !== undefined) this._loadLine(line)
  }

  _getUid() {
    return this._uid
  }

  getParent() {
    return this._parent
  }

  isRoot() {
    return !this.getParent()
  }

  getRootNode() {
    if (this.isRoot()) return this
    return this.getParent().getRootNode()
  }

  toString(indentCount = 0, language = this) {
    if (this.isRoot()) return this._childrenToString(indentCount, language)
    const content = language.getEdgeChar().repeat(indentCount) + this.getLine(language)
    const value =
      content + (this.length ? language.getNodeDelimiter() + this._childrenToString(indentCount + 1, language) : "")
    return value
  }

  getRest() {
    return this.getWords().slice(1)
  }

  getWord(index) {
    return this.getWords()[index]
  }

  _getTailless() {
    return this.getWords().slice(0, this._getSize() - 1)
  }

  _toHtml(indentCount) {
    const path = this.getPathVector().join(" ")
    const classes = {
      node: "node",
      edge: "nodeEdge",
      delimiter: "nodeDelimiter",
      tree: "nodeTree"
    }
    const edge = this.getEdgeChar().repeat(indentCount)
    // Set up the head part of the node
    const edgeHtml = `<span class="${classes.node}" data-pathVector="${path}"><span class="${classes.edge}">${edge}</span>`
    const lineHtml = this._getLineHtml()
    const treeHtml = this.length
      ? `<span class="${classes.delimiter}">${this.getNodeDelimiter()}</span>` +
          `<span class="${classes.tree}">${this._childrenToHtml(indentCount + 1)}</span>`
      : ""

    return edgeHtml + lineHtml + treeHtml + "</span>"
  }

  _getSize() {
    return 2
  }

  getWords() {
    return this._words
  }

  getHead() {
    return this.getWords()[0]
  }

  getTail() {
    return this.getWords()[this._getSize() - 1]
  }

  getTailWithChildren() {
    const tail = this.getTail()
    return (tail ? tail : "") + (this.length ? this.getNodeDelimiter() + this._childrenToString() : "")
  }

  getAncestorNodes() {
    if (this.isRoot()) return []
    const parent = this.getParent()
    if (parent.isRoot()) return [parent]
    else return parent.getAncestorNodes().concat([parent])
  }

  getLine(language = this) {
    return this.getWords().join(language.getWordDelimiter())
  }

  // todo: return array? getPathArray?
  getPathName() {
    if (this.isRoot()) return ""
    else if (this.getParent().isRoot()) return this.getHead()

    return this.getParent().getPathName() + this.getEdgeChar() + this.getHead()
  }

  getPathVector() {
    if (this.isRoot()) return []
    const path = this.getParent().getPathVector()
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
    const lastIndex = this._getSize() - 1
    return this.getWords()
      .map((word, index) => {
        const specialClass = index === 0 ? " head" : index === lastIndex ? " tail" : ""
        return `<span class="word${specialClass}">${ImmutableTreeNode._stripHtml(word)}</span>`
      })
      .join(`<span class="wordDelimiter">${this.getWordDelimiter()}</span>`)
  }

  _getXmlContent(indentCount) {
    if (this.getTail() !== undefined) return this.getTailWithChildren()
    return this.length
      ? `${indentCount === -1 ? "" : "\n"}${this._childrenToXml(indentCount > -1 ? indentCount + 2 : -1)}${" ".repeat(indentCount)}`
      : ""
  }

  _toXml(indentCount) {
    const indent = " ".repeat(indentCount)
    const tag = this.getHead()
    return `${indent}<${tag}>${this._getXmlContent(indentCount)}</${tag}>${indentCount === -1 ? "" : "\n"}`
  }

  _toObjectTuple() {
    const tail = this.getTail()
    const length = this.length
    const hasChildrenNoTail = tail === undefined && length
    const hasTailAndHasChildren = tail !== undefined && length
    // If the node has a tail and a subtree return it as a string, as
    // Javascript object values can't be both a leaf and a tree.
    const tupleValue = hasChildrenNoTail ? this.toObject() : hasTailAndHasChildren ? this.getTailWithChildren() : tail
    return [this.getHead(), tupleValue]
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

  _getDepth() {
    return this.getAncestorNodes().length
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
      const level = node._getDepth()
      if (!levels[level]) levels[level] = []
      levels[level].push(node)
    })
    return levels
  }

  _getChildren() {
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
    const tree = this._nodeAt(first)
    if (!tree) return undefined
    return tree.nodeAt(indexOrArray.slice(1))
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

  toJavascript() {
    return `new ${this.constructor.name}(\`${this.toString().replace(/\`/g, "\\`")}\`)`
  }

  _childrenToHtml(indentCount) {
    return this.getChildren()
      .map(node => node._toHtml(indentCount))
      .join(`<span class="nodeDelimiter">${this.getNodeDelimiter()}</span>`)
  }

  _childrenToString(indentCount, language = this) {
    return this.getChildren().map(node => node.toString(indentCount, language)).join(language.getNodeDelimiter())
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

  findNodes(pathName) {
    return this._getChildren().filter(node => {
      if (node.getHead() === pathName) return true
      return false
    })
  }

  format(str) {
    const that = this
    return str.replace(/{([^\}]+)}/g, (match, path) => {
      const node = that.getNode(path)
      return node ? node.getTail() : ""
    })
  }

  getColumn(path) {
    return this._getChildren().map(node => {
      const cell = node.getNode(path)
      return cell === undefined ? undefined : cell.getTail()
    })
  }

  getNode(pathName) {
    return this._getNodeByPath(pathName)
  }

  findTail(pathName) {
    const node = this._getNodeByPath(pathName)
    return node === undefined ? undefined : node.getTail()
  }

  _getNodeByPath(pathName) {
    if (!this.isPathName(pathName)) {
      const index = this.indexOfLast(pathName)
      return index === -1 ? undefined : this._nodeAt(index)
    }

    const parts = pathName.split(this.getWordDelimiter())
    const current = parts.shift()
    const currentTree = this.getChildren()[this._getIndex()[current]]
    return currentTree ? currentTree._getNodeByPath(parts.join(this.getWordDelimiter())) : undefined
  }

  _getUnionNames() {
    if (!this.length) return []

    const obj = {}
    this._getChildren().forEach(node => {
      if (!node.length) return undefined
      node._getChildren().forEach(node => {
        obj[node.getHead()] = 1
      })
    })
    return Object.keys(obj)
  }

  pathVectorToPathName(pathVector) {
    const path = pathVector.slice() // copy array
    const names = []
    let tree = this
    while (path.length) {
      if (!tree) return names
      names.push(tree.nodeAt(path[0]).getHead())
      tree = tree.nodeAt(path.shift())
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
          const tail = childNode ? childNode.getTailWithChildren() : ""
          return cellFn(tail, rowNumber + 1, index)
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
        const cellValue = node.getNode(col).getTail()
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

  isPathName(str) {
    return str !== undefined && str.includes(this.getEdgeChar())
  }

  toSsv() {
    return this.toDelimited(" ")
  }

  toOutline() {
    return this._toOutline(false)
  }

  toOutlineWithValues() {
    return this._toOutline(true)
  }

  // Adapted from: https://github.com/notatestuser/treeify.js
  _toOutline(showValues, pretty) {
    let paddingSpace = pretty ? " " : ""
    let paddingDash = pretty ? "-" : ""

    const growBranch = (key, treeNode, last, lastStates, showValues, callback) => {
      let lastStatesCopy = lastStates.slice(0)
      const tree = treeNode.tree
      const tail = treeNode.tail

      if (lastStatesCopy.push([treeNode, last]) && lastStates.length > 0) {
        let line = ""
        // based on the "was last element" states of whatever we're nested within,
        // we need to append either blankness or a branch to our line
        lastStates.forEach((lastState, idx) => {
          if (idx > 0) line += (lastState[1] ? " " : "│") + paddingSpace
        })

        // the prefix varies based on whether the key contains something to show and
        // whether we're dealing with the last element in this collection
        // the extra "-" just makes things stand out more.
        line += (last ? "└" : "├") + (key ? paddingDash : "") + key

        // append values
        if (showValues && tail !== undefined) line += " " + tail

        callback(line)
      }

      if (!tree) return

      const length = tree.length
      let index = 0
      tree._getChildren().forEach(node => {
        let lastKey = ++index === length

        growBranch(node.getHead(), { tail: node.getTail(), tree: node }, lastKey, lastStatesCopy, showValues, callback)
      })
    }

    let tree = ""
    growBranch(".", { tree: this }, false, [], showValues, line => (tree += line + "\n"))
    return tree
  }

  copyTo(tree, index) {
    const newNode = tree._loadLineAndTree(
      this.getLine(),
      this.childrenToString(),
      index === undefined ? tree.length : index
    )
    return newNode
  }

  toTsv() {
    return this.toDelimited("\t")
  }

  getNodeDelimiter() {
    return "\n"
  }

  getWordDelimiter() {
    return " "
  }

  getNodeDelimiterRegex() {
    return new RegExp(this.getNodeDelimiter(), "g")
  }

  getEdgeChar() {
    return " "
  }

  _loadFromText(text) {
    const tuple = this._textToTailAndTreeTuple(text)
    this._loadLine(tuple[0])
    return this._loadChildren(tuple[1])
  }

  _textToTailAndTreeTuple(text) {
    const lines = text.split(this.getNodeDelimiterRegex())
    const firstLine = lines.shift()
    const tree = !lines.length
      ? undefined
      : lines
          .map(line => (line.substr(0, 1) === this.getEdgeChar() ? line : this.getEdgeChar() + line))
          .map(line => line.substr(1))
          .join(this.getNodeDelimiter())
    return [firstLine, tree]
  }

  _loadWords(arr) {
    this._words = arr
    return this
  }

  _loadLine(line) {
    return this._loadWords(this._splitWords(line, this._getSize()))
  }

  _splitWords(str, maxParts) {
    return ImmutableTreeNode._split(str, this.getWordDelimiter(), maxParts)
  }

  _loadChildren(content, circularCheckArray) {
    this._children = []
    if (!content) return this

    // Load from string
    if (typeof content === "string") return this._loadFromString(content)

    // Load from TreeNode object
    if (content instanceof ImmutableTreeNode) {
      const me = this
      content._getChildren().forEach(node => {
        me._loadLineAndTree(node.getLine(), node.childrenToString())
      })
      return this
    }

    // If we load from object, create an array of inserted objects to avoid circular loops
    if (!circularCheckArray) circularCheckArray = [content]

    return this._loadFromObject(content, circularCheckArray)
  }

  _loadFromObject(content, circularCheckArray) {
    for (let head in content) {
      if (!content.hasOwnProperty(head)) continue
      this._appendFromJavascriptObjectTuple(head, content[head], circularCheckArray)
    }

    return this
  }

  _loadLineAndTree(line, tree, index = this.length) {
    const parsedNode = this.parseNode(tree, line)
    const adjustedIndex = index < 0 ? this.length + index : index

    this.getChildren().splice(adjustedIndex, 0, parsedNode)

    if (this._index) this._makeIndex(adjustedIndex)
    return parsedNode
  }

  // todo: refactor the below.
  _appendFromJavascriptObjectTuple(head, tail, circularCheckArray) {
    const type = typeof tail
    let line
    let tree
    if (tail === null) line = head + " " + null
    else if (tail === undefined) line = head
    else if (type === "string") {
      const tuple = this._textToTailAndTreeTuple(tail)
      line = head + " " + tuple[0]
      tree = tuple[1]
    } else if (type !== "object") line = head + " " + tail
    else if (tail instanceof Date) line = head + " " + tail.getTime().toString()
    else if (tail instanceof ImmutableTreeNode) {
      line = head
      tree = tail.clone()
    } else if (type === "function") line = head + " " + tail.toString()
    else if (circularCheckArray.indexOf(tail) === -1) {
      circularCheckArray.push(tail)
      line = head
      const length = tail instanceof Array ? tail.length : Object.keys(tail).length
      if (length) tree = new TreeNode()._loadChildren(tail, circularCheckArray)
    } else {
      // iirc this is return early from circular
      return
    }
    this._loadLineAndTree(line, tree)
  }

  _loadFromString(string) {
    if (!string) return this
    const lines = string.split(this.getNodeDelimiterRegex())
    const line = lines.shift()
    this._loadLineAndTree(line)
    let currentLevel = 0
    let currentTree = this
    lines.forEach(line => {
      const level = this._getLevel(line)
      if (level > currentLevel) {
        const lastNode = currentTree.getChildren()[currentTree.length - 1]
        currentLevel++ // only move one level at a time
        currentTree = lastNode
        currentTree._loadLineAndTree(line.substr(currentLevel))
      } else if (level === currentLevel) currentTree._loadLineAndTree(line.substr(currentLevel))
      else {
        // pop things off stack
        while (level < currentLevel) {
          currentTree = currentTree.getParent()
          currentLevel--
        }
        currentTree._loadLineAndTree(line.substr(currentLevel))
      }
    })

    return this
  }

  _getIndex() {
    // StringMap<int> {head: index}
    // When there are multiple tails with the same head, _index stores the last tail.
    return this._index || this._makeIndex()
  }

  getTails() {
    return this.getChildren().map(node => node.getTail())
  }

  indexOfLast(head) {
    const result = this._getIndex()[head]
    return result === undefined ? -1 : result
  }

  indexOf(head) {
    if (!this.has(head)) return -1

    const length = this.length
    const nodes = this.getChildren()

    for (let index = 0; index < length; index++) {
      if (nodes[index].getHead() === head) return index
    }
    return -1
  }

  toObject() {
    return this._toObject()
  }

  getHeads() {
    return this._getChildren().map(node => node.getHead())
  }

  _makeIndex(startAt = 0) {
    if (!this._index || !startAt) this._index = {}
    const nodes = this.getChildren()
    const newIndex = this._index
    const length = nodes.length

    for (let index = startAt; index < length; index++) {
      newIndex[nodes[index].getHead()] = index
    }

    return newIndex
  }

  _childrenToXml(indentCount) {
    return this.getChildren().map(node => node._toXml(indentCount)).join("")
  }

  _getLevel(str) {
    let level = 0
    const edgeChar = this.getEdgeChar()
    while (str[level] === edgeChar) {
      level++
    }
    return level
  }

  clone() {
    return new this.constructor(this.childrenToString(), this.getLine())
  }

  has(head) {
    return this._getIndex()[head] !== undefined
  }

  _getHeadByIndex(index) {
    // Passing -1 gets the last item, et cetera
    const length = this.length

    if (index < 0) index = length + index
    if (index >= length) return undefined
    return this.getChildren()[index].getHead()
  }

  parseNode(tree, line) {
    return new this.constructor(tree, line, this)
  }

  static _makeUniqueId() {
    if (this._uniqueId === undefined) this._uniqueId = 0
    this._uniqueId++
    return this._uniqueId
  }

  static _split(str, char, maxParts) {
    const parts = str.split(char)
    if (parts.length <= maxParts) return parts
    const newArr = []
    for (let index = 0; index < maxParts - 1; index++) {
      newArr.push(parts.shift())
    }
    newArr.push(parts.join(char))
    return newArr
  }

  static _stripHtml(text) {
    return text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text
  }
}

class TreeNode extends ImmutableTreeNode {
  getMTime() {
    return this._mtime || this._ctime
  }

  _clearIndex() {
    delete this._index
  }

  setChildren(tree) {
    return this._loadChildren(tree)
  }

  setTail(tail) {
    const newArray = this._getTailless()
    if (tail !== undefined) {
      tail = tail.toString()
      if (tail.match(this.getNodeDelimiter())) return this.setTailWithChildren(tail)
      newArray.push(tail)
    }
    return this._loadWords(newArray)
  }

  setTailWithChildren(text) {
    if (!text.includes(this.getNodeDelimiter())) return this.setTail(text)

    const lines = text.split(this.getNodeDelimiterRegex())
    const firstLine = lines.shift()
    this.setTail(firstLine)

    // tood: cleanup.
    const remainingString = lines.join(this.getNodeDelimiter())
    const tree = new TreeNode(remainingString)
    if (!remainingString) tree.append("")
    this.setChildren(tree)
    return this
  }

  setHead(head) {
    this.getWords()[0] = head
    return this
  }

  setLine(line) {
    return this._loadLine(line)
  }

  duplicate() {
    return this.getParent()._loadLineAndTree(this.getLine(), this.childrenToString(), this.getIndex() + 1)
  }

  destroy() {
    this.getParent()._deleteNode(this)
  }

  setFromText(text) {
    return this._loadFromText(text)
  }

  append(line, tree) {
    return this._loadLineAndTree(line, tree)
  }

  concat(tree) {
    if (typeof tree === "string") tree = new TreeNode(tree)
    return tree._getChildren().map(node => this._loadLineAndTree(node.getLine(), node.childrenToString()))
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

  reload(content) {
    this._clearIndex()
    return this._loadChildren(content)
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

  _rename(oldHead, newHead) {
    const index = this.indexOf(oldHead)

    if (index === -1) return this
    this.getChildren()[index].setHead(newHead)
    this._makeIndex()
    return this
  }

  remap(map) {
    this.getChildren().forEach(node => {
      const head = node.getHead()
      if (map[head] !== undefined) node.setHead(map[head])
    })
    return this
  }

  rename(oldHead, newHead) {
    this._rename(oldHead, newHead)
    return this
  }

  renameAll(oldName, newName) {
    this.findNodes(oldName).forEach(node => node.setHead(newName))
    return this
  }

  _deleteByHead(head) {
    if (!this.has(head)) return this
    const allNodes = this._getChildren()
    const indexesToDelete = []
    allNodes.forEach((node, index) => {
      if (node.getHead() === head) indexesToDelete.push(index)
    })
    return this._deleteByIndexes(indexesToDelete)
  }

  delete(head) {
    if (!this.isPathName(head)) return this._deleteByHead(head)

    const parts = head.split(this.getWordDelimiter())
    const nextHead = parts.pop()
    const targetNode = this.getNode(parts.join(this.getWordDelimiter()))

    return targetNode ? targetNode._deleteByHead(nextHead) : 0
  }

  extend(treeOrStr) {
    if (!(treeOrStr instanceof TreeNode)) treeOrStr = new TreeNode(treeOrStr)
    treeOrStr.getChildren().forEach(node => {
      const path = node.getHead()
      const tail = node.getTail()
      const targetNode = this.touchNode(path).setTail(tail)
      if (node.length) targetNode.extend(node.childrenToString())
    })
    return this
  }

  insert(line, tree, index) {
    return this._loadLineAndTree(line, tree, index)
  }

  prepend(line, tree) {
    return this.insert(line, tree, 0)
  }

  pushTailAndTree(tail, tree) {
    let index = this.length

    while (this.has(index.toString())) {
      index++
    }
    const line = index.toString() + (tail === undefined ? "" : this.getWordDelimiter() + tail)
    return this.append(line, tree)
  }

  _touchNode(headPathArray) {
    let contextNode = this
    headPathArray.forEach(head => {
      contextNode = contextNode.getNode(head) || contextNode.append(head)
    })
    return contextNode
  }

  _touchNodeByString(str) {
    str = str.replace(this.getNodeDelimiterRegex(), "") // todo: do we want to do this sanitization?
    return this._touchNode(str.split(this.getWordDelimiter()))
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
        const head = nameOrNames[nameIndex]
        const av = nodeA.getNode(head).getTail()
        const bv = nodeB.getNode(head).getTail()

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
    return new TreeNode(JSON.parse(str))
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
    return this._rowsToTree(rows, delimiter, hasHeaders === false ? false : true)
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

  static multiply(treeA, treeB) {
    const treeC = treeA.clone()
    treeC._getChildren().forEach((node, index) => {
      node.setChildren(node.length ? this.multiply(node, treeB) : treeB.clone())
    })
    return treeC
  }

  // Given an array return a tree
  static _rowsToTree(rows, delimiter, hasHeaders) {
    const numberOfColumns = rows[0].length
    const tree = new TreeNode()
    const treeNames = []
    const treeValues = []
    const headerIndex = {}
    const names = this._getHeader(rows, hasHeaders)

    const rowCount = rows.length
    for (let rowIndex = hasHeaders ? 1 : 0; rowIndex < rowCount; rowIndex++) {
      const rowTree = new TreeNode()
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

      tree.pushTailAndTree(undefined, obj)
    }
    return tree
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
      return this._treeFromXml(xml).getNode("children")
    } catch (err) {
      return this._treeFromXml(this._parseXml2(str)).getNode("children")
    }
  }

  static _parseXml2(str) {
    const el = document.createElement("div")
    el.innerHTML = str
    return el
  }

  static _treeFromXml(xml) {
    const result = new TreeNode()
    const children = new TreeNode()

    // Set attributes
    if (xml.attributes) {
      for (let index = 0; index < xml.attributes.length; index++) {
        result.setTail(xml.attributes[index].name, xml.attributes[index].value)
      }
    }

    if (xml.data) children.pushTailAndTree(xml.data)

    // Set content
    if (xml.childNodes && xml.childNodes.length > 0) {
      for (let index = 0; index < xml.childNodes.length; index++) {
        const child = xml.childNodes[index]

        if (child.tagName && child.tagName.match(/parsererror/i)) throw new Error("Parse Error")

        if (child.childNodes.length > 0 && child.tagName) children.append(child.tagName, this._treeFromXml(child))
        else if (child.tagName) children.append(child.tagName)
        else if (child.data) {
          const data = child.data.trim()
          if (data) children.pushTailAndTree(data)
        }
      }
    }

    if (children.length > 0) result.touchNode("children").setChildren(children)

    return result
  }

  static _getHeader(rows, hasHeaders) {
    const numberOfColumns = rows[0].length
    const headerRow = hasHeaders ? rows[0] : []
    const wordDelimiter = " "
    const assignmentRegex = new RegExp(wordDelimiter, "g")

    if (hasHeaders) {
      // Strip any assignmentChars from column names in the header row.
      // This makes the mapping not quite 1 to 1 if there are any assignmentChars in names.
      for (let index = 0; index < numberOfColumns; index++) {
        headerRow[index] = headerRow[index].replace(assignmentRegex, "")
      }
    } else {
      // If str has no headers, create them as 0,1,2,3
      for (let index = 0; index < numberOfColumns; index++) {
        headerRow.push(index.toString())
      }
    }
    return headerRow
  }

  static getVersion() {
    return "3.1.1"
  }
}

TreeNode.ImmutableTreeNode = ImmutableTreeNode

if (typeof exports !== "undefined") module.exports = TreeNode
