"use strict"

const ImmutableNode = require("./ImmutableNode.js")

class MutableNode extends ImmutableNode {
  getMTime() {
    if (!this._mtime) this._updateMTime()
    return this._mtime
  }

  _getChildrenMTime() {
    const mTimes = this.getChildren().map(child => child.getTreeMTime())
    const cmTime = this._getCMTime()
    if (cmTime) mTimes.push(cmTime)
    const newestTime = Math.max.apply(null, mTimes)
    return this._setCMTime(newestTime || this._getNow())._getCMTime()
  }

  _getCMTime() {
    return this._cmtime
  }

  _setCMTime(value) {
    this._cmtime = value
    return this
  }

  getTreeMTime() {
    const mtime = this.getMTime()
    const cmtime = this._getChildrenMTime()
    return Math.max(mtime, cmtime)
  }

  _clearIndex() {
    delete this._index
  }

  getInheritanceTree() {
    const paths = {}
    const result = new MutableNode()
    this.getChildren().forEach(node => {
      const key = node.getWord(0)
      const parentKey = node.getWord(1)
      const parentPath = paths[parentKey]
      paths[key] = parentPath ? [parentPath, key].join(" ") : key
      result.touchNode(paths[key])
    })
    return result
  }

  _expand() {
    const graph = this.getGraph()
    const result = new MutableNode()
    graph.forEach(node => result.extend(node))
    return new MutableNode().append(this.getLine(), result)
  }

  getExpanded() {
    return this.getChildren()
      .map(child => child._expand())
      .join("\n")
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
    this.setLine(words.join(wi))
    return this
  }

  setBeam(beam) {
    if (beam === this.getBeam()) return this
    const newArray = [this.getKeyword()]
    if (beam !== undefined) {
      beam = beam.toString()
      if (beam.match(this.getYI())) return this.setBeamWithChildren(beam)
      newArray.push(beam)
    }
    this._updateMTime()
    return this._setLine(newArray.join(this.getZI()))
  }

  setBeamWithChildren(text) {
    // todo: deprecate
    if (!text.includes(this.getYI())) {
      this._clearChildren()
      return this.setBeam(text)
    }

    const lines = text.split(this.getYIRegex())
    const firstLine = lines.shift()
    this.setBeam(firstLine)

    // tood: cleanup.
    const remainingString = lines.join(this.getYI())
    const children = new MutableNode(remainingString)
    if (!remainingString) children.append("")
    this.setChildren(children)
    return this
  }

  setKeyword(keyword) {
    return this.setWord(0, keyword)
  }

  setLine(line) {
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
    if (typeof node === "string") node = new MutableNode(node)
    return node._getChildren().map(node => this._setLineAndChildren(node.getLine(), node.childrenToString()))
  }

  _deleteByIndexes(indexesToDelete) {
    this._clearIndex()
    // note: assumes indexesToDelete is in ascending order
    indexesToDelete.reverse().forEach(index => this.getChildren().splice(index, 1))
    return this._setCMTime(this._getNow())
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

  _rename(oldKeyword, newKeyword) {
    const index = this.indexOf(oldKeyword)

    if (index === -1) return this
    this.getChildren()[index].setKeyword(newKeyword)
    this._clearIndex()
    return this
  }

  remap(map) {
    this.getChildren().forEach(node => {
      const keyword = node.getKeyword()
      if (map[keyword] !== undefined) node.setKeyword(map[keyword])
    })
    return this
  }

  rename(oldKeyword, newKeyword) {
    this._rename(oldKeyword, newKeyword)
    return this
  }

  renameAll(oldName, newName) {
    this.findNodes(oldName).forEach(node => node.setKeyword(newName))
    return this
  }

  _deleteByKeyword(keyword) {
    if (!this.has(keyword)) return this
    const allNodes = this._getChildren()
    const indexesToDelete = []
    allNodes.forEach((node, index) => {
      if (node.getKeyword() === keyword) indexesToDelete.push(index)
    })
    return this._deleteByIndexes(indexesToDelete)
  }

  delete(keyword = "") {
    const xi = this.getXI()
    if (!keyword.includes(xi)) return this._deleteByKeyword(keyword)

    const parts = keyword.split(xi)
    const nextKeyword = parts.pop()
    const targetNode = this.getNode(parts.join(xi))

    return targetNode ? targetNode._deleteByKeyword(nextKeyword) : 0
  }

  extend(nodeOrStr) {
    if (!(nodeOrStr instanceof MutableNode)) nodeOrStr = new MutableNode(nodeOrStr)
    nodeOrStr.getChildren().forEach(node => {
      const path = node.getKeyword()
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

  _touchNode(keywordPathArray) {
    let contextNode = this
    keywordPathArray.forEach(keyword => {
      contextNode = contextNode.getNode(keyword) || contextNode.append(keyword)
    })
    return contextNode
  }

  _touchNodeByString(str) {
    str = str.replace(this.getYIRegex(), "") // todo: do we want to do this sanitization?
    return this._touchNode(str.split(this.getZI()))
  }

  getGrammarString() {
    return `any
 @catchAllKeyword any
any
 @parameters any*`
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
        const keyword = nameOrNames[nameIndex]
        const av = nodeA.getNode(keyword).getBeam()
        const bv = nodeB.getNode(keyword).getBeam()

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
    return new MutableNode(JSON.parse(str))
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
    const treeNode = new MutableNode()
    const names = this._getHeader(rows, hasHeaders)

    const rowCount = rows.length
    for (let rowIndex = hasHeaders ? 1 : 0; rowIndex < rowCount; rowIndex++) {
      const rowTree = new MutableNode()
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
    const result = new MutableNode()
    const children = new MutableNode()

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

  static executeFile(programPath, languagePath) {
    const program = this.makeProgram(programPath, languagePath)
    return program.execute(programPath)
  }

  static makeProgram(programPath, languagePath) {
    const fs = require("fs")
    const languageClass = require(languagePath)
    const code = fs.readFileSync(programPath, "utf8")
    return new languageClass(code)
  }

  static _getHeader(rows, hasHeaders) {
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
    return "7.1.1"
  }
}

module.exports = MutableNode
