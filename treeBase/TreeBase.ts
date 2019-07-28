#! /usr/local/bin/node

// TreeBase: The software-less database for community and personal knowledge bases.

// TODO: toSQL, sql storage backend. sqlite as well?

import TreeNode from "../src/base/TreeNode"
import TreeUtils from "../src/base/TreeUtils"
import { Disk } from "./Disk"
import jtree from "../src/jtree.node"

const lodash = require("lodash")

let tickTime = Date.now() - 1000 * process.uptime()

const tick = msg => {
  const elapsed = Date.now() - tickTime
  console.log(`${elapsed}ms ${msg}`)
  tickTime = Date.now()
  return elapsed
}

class TreeBaseFile extends TreeNode {
  private _diskVersion: string
  setDiskVersion() {
    this._diskVersion = this.childrenToString()
    return this
  }
  getDiskVersion() {
    return this._diskVersion
  }

  private _getProgram(grammarPath) {
    const tree = new TreeNode()
    tree.appendLineAndChildren(this.getId(), this.childrenToString())
    return new (jtree.getProgramConstructor(grammarPath))(tree.toString())
  }

  cellCheck(grammarPath) {
    return this._getProgram(grammarPath).getAllErrors()
  }

  getOneOf(keys) {
    for (let i = 0; i < keys.length; i++) {
      const value = this.get(keys[i])
      if (value) return value
    }
    return ""
  }

  toExpandedColumns() {
    // todo: do things like wp_example_2 wp_example_3 ...
  }

  getDoc(terms) {
    return terms
      .map(term => {
        const nodes = this.findNodes(this.getId() + " " + term)
        return nodes.map(node => node.childrenToString()).join("\n")
      })
      .filter(a => a)
      .join("\n")
  }

  set(keywordPath, content) {
    return typeof keywordPath === "object" ? this.setProperties(keywordPath) : super.set(keywordPath, content)
  }

  setPropertyIfMissing(prop, value) {
    if (this.has(prop)) return true
    return this.touchNode(prop).setContent(value)
  }

  setProperties(propMap) {
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

  extract(fields) {
    const newTree = new TreeNode(this.toString()) // todo: why not clone?
    const map = TreeUtils.arrayToMap(fields)
    newTree.nodeAt(0).forEach(node => {
      if (!map[node.getWord(0)]) node.destroy()
    })

    return newTree
  }

  save() {
    const str = this.childrenToString()
    if (this.getDiskVersion() === str) return this

    //console.log(this.getDiskVersion())
    //console.log("saving " + this.getFilePath())
    Disk.write(this.getFilePath(), str)
    this.setDiskVersion()
    return this
  }

  appendUniqueLine(line) {
    const file = this.toString()
    if (file.match(new RegExp("^" + Disk.escape(line), "m"))) return true
    const prefix = !file || file.endsWith("\n") ? "" : "\n"
    return this.appendLine(prefix + line + "\n")
  }

  getId() {
    return this.getWord(0)
  }

  getCollection() {
    return <TreeBaseCollection>this.getRootNode()
  }

  getFilePath() {
    return this.getCollection().getDir() + this.getId()
  }

  createParser() {
    return new TreeNode.Parser(TreeNode)
  }
}

class TreeBaseCollection extends TreeNode {
  private _dir: string
  getDir() {
    return this._dir
  }

  getDataCellTypeIfApplicable(node) {
    const arr = node._getGrammarBackedCellArray()
    if (arr.length === 1) return arr[0].getType()
  }

  getXgbCsv() {
    let clone = this._getProgram()
    // todo: cellCheck, only contniue if no errors
    const gp = clone.getGrammarProgramRoot()
    const map = gp.getRunTimeFirstWordMapWithDefinitions()["file"].getRunTimeFirstWordMap()
    const keywords = Object.keys(map)
    const colNames = clone.getColumnNames()
    const words = lodash.intersection(colNames, keywords)
    clone.forEach(node => {
      words.forEach(col => {
        // parse types
        const def = map[col]
        const val = node.getNode(col)

        // Any type
        if (def instanceof jtree.AnyNode) {
          const has = val && !val.isEmpty()
          if (val) val.deleteChildren()
          node.set(col, has ? "1" : "0")
        }
        // Enum type
        console.log(this.getDataCellTypeIfApplicable(node))

        // Int and float types

        // Any types

        //node.set(col, parsed)
      })
    })

    //clone = clone.getOneHot("type")

    // clone.forEach(clone => clone.parseAll())
    //return clone.toCsv()
  }

  private _grammarPath: string
  getGrammarPath() {
    return this._grammarPath
  }

  setGrammarPath(grammarPath) {
    this._grammarPath = grammarPath
    return this
  }

  setDir(dir) {
    this._dir = dir
    return this
  }

  getDimensions() {
    return this._getUnionNames()
  }

  private _getProgram() {
    let str = this.clone()
    str.forEach(child => child.setLine(child.getLine()))
    return new (jtree.getProgramConstructor(this.getGrammarPath()))(str.toString())
  }

  cellCheckToTree() {
    return new TreeNode(this._getProgram().getAllErrors())
  }

  cellCheck(printLimit = 100) {
    tick("start toString...")
    // this.printLinesWithLineNumbersFrom(0, 100)
    // return
    const clone = this.clone()
    clone.forEach(child => child.setLine(child.getLine()))
    const str = clone.toString()
    tick("end toString...")
    const grammarPath = this.getGrammarPath()
    jtree.compileGrammarForNodeJs(grammarPath, "/codelani/ignore/", true)
    const programConstructor = jtree.getProgramConstructor(grammarPath)
    const program = new programConstructor(str)
    let lines = this.getNumberOfLines()
    let lps = lines / (tick("End parser") / 1000)
    console.log(`Parsed ${lines} line program at ${lps} lines per second`)

    const ProgressBar = require("progress")
    const bar = new ProgressBar(":bar", { total: lines, width: 50 })
    let current = Date.now()
    let inc = 100000
    let totalErrors = 0
    for (let err of program.getAllErrorsIterator()) {
      bar.tick()
      if (bar.curr % inc === 0) {
        bar.interrupt(`Lines ${bar.curr - inc}-${bar.curr} at ${10000 / ((Date.now() - current) / 1000)} per second`)
        current = Date.now()
      }
      if (err.length) totalErrors += err.length
      if (printLimit && err) {
        err.forEach(err =>
          console.log(
            err
              .getNode()
              .getParent()
              .getLine() +
              ": " +
              err.getLine() +
              ": " +
              err.getMessage()
          )
        )
        printLimit--
      }

      //if (!limit) return 0
    }
    return totalErrors
  }

  setDiskVersions() {
    this.forEach(node => {
      if (!node.setDiskVersion) console.log(node)
      node.setDiskVersion()
    })
    return this
  }

  getAllWithout(prop) {
    return this.filter(node => !node.has(prop))
  }

  fetchAllWith(props) {
    if (typeof props === "string") props = [props]
    return this.getAll().filter(node => props.every(prop => node.has(prop)))
  }

  fetchAllWithout(prop) {
    return this.getAll().filter(node => !node.has(prop))
  }

  createParser() {
    return new TreeNode.Parser(TreeBaseFile)
  }

  getFromContent(path, content) {
    return this.findNodes(path).find(node => node.getContent() === content)
  }

  getAllWhereNot(path, content) {
    content = content.substr ? [content] : content
    const map = TreeUtils.arrayToMap(content)

    return this.filter(n => !map[n.get(path)])
  }
}

class TreeBase {
  // Because we can assume filesystem is a map, that makes things different.
  // this is NOT an extension of tree
  constructor(storagePath, grammarPath) {
    this._dir = storagePath.replace(/\/$/, "") + "/"
    this._grammarPath = grammarPath
  }

  private _dir: string
  private _grammarPath: string
  private _collection: TreeBaseCollection

  getCollectionClass() {
    return TreeBaseCollection
  }

  getSample(number) {
    const collectionClass = this.getCollectionClass()
    return number === undefined
      ? this.getAll()
      : new collectionClass(this.toString(number))
          .setDir(this.getDir())
          .setGrammarPath(this.getGrammarPath())
          .setDiskVersions()
          .getChildren()
  }

  deleteFromAll(prop) {
    this.getAllWith(prop).forEach(node => {
      node.delete(prop)
      this.saveNode(node)
    })
  }

  getCollection(files = undefined) {
    if (!this._collection) {
      const collectionClass = this.getCollectionClass()
      this._collection = new collectionClass(this.toString(undefined, files))
        .setGrammarPath(this.getGrammarPath())
        .setDir(this.getDir())
        .setDiskVersions()
    }
    return this._collection
  }

  getFilePath(id) {
    return this.getDir() + id
  }

  touch(id) {
    return Disk.touch(this.getFilePath(id))
  }

  appendUniqueLine(id, line) {
    throw new Error("move to node")
    return Disk.appendUniqueLine(this.getFilePath(id), line)
  }

  saveNode(node) {
    throw new Error("move to node")
    return Disk.write(this.getFilePath(node.getWord(0)), node.childrenToString())
  }

  getProperty(id, prop) {
    throw new Error("move to node")
    return this.getNode(id).get(prop)
  }

  setProperties(id, propMap) {
    return this.getNode(id)
      .setProperties(propMap)
      .save()
  }

  setProperty(id, prop, value) {
    throw new Error("move to node")
    if (value === "undefined" || value === "null" || value === "") return console.log(`not setting undefined or null or blank: ${value}`)
    const tree = this.getNode(id)
    if (tree.get(prop) === value.toString()) return true
    tree.touchNode(prop).setContent(value)
    return Disk.write(this.getFilePath(id), tree.toString())
  }

  appendLines(id, lines) {
    throw new Error("move to node")
    const path = this.getFilePath(id)
    const file = Disk.read(path)
    const prefix = !file || file.endsWith("\n") ? "" : "\n"
    return Disk.append(path, prefix + lines + "\n")
  }

  deleteProperties(id, props) {
    throw new Error("move to node")
    props = typeof props === "string" ? [props] : props
    const tree = Disk.readTree(this.getFilePath(id))
    props.forEach(p => tree.delete(p))
    return Disk.write(this.getFilePath(id), tree.toString())
  }

  appendUniqueTree(id, line, text) {
    throw new Error("move to node")
    return Disk.hasLine(this.getFilePath(id), line) ? true : this.appendTreeToLang(id, line, text)
  }

  appendKeyToProperty(id, prop, value) {
    throw new Error("move to node")
    const current = this.getProperty(id, prop)
    if (current) value = lodash.uniq((current + " " + value).split(" ").filter(a => a)).join(" ")
    this.setProperty(id, prop, value)
  }

  // todo: check to ensure identical objects
  addDelimited(id, property, arrayOfObjects, delimiter = undefined) {
    throw new Error("move to node")
    delimiter = delimiter || Disk.chooseDelimiter(new TreeNode(arrayOfObjects).toString())
    const header = Object.keys(arrayOfObjects[0])
      .join(delimiter)
      .replace(/[\n\r]/g, "")
    const rows = arrayOfObjects.map(item =>
      Object.values(item)
        .join(delimiter)
        .replace(/[\n\r]/g, "")
    )
    return this.addUniqueRowsToNestedDelimited(id, property, header, rows)
  }

  deleteAfter(id, property) {
    throw new Error("move to node")
    const node = this.getNode(id)
    if (!node.has(property)) return 1
    const newnode = node.getSlice(0, node.indexOf(property))
    return Disk.write(this.getFilePath(id), newnode.toString())
  }

  addUniqueRowsToNestedDelimited(id, property, header, rowsAsStrings) {
    throw new Error("move to node")
    const tree = this.getNode(id)
    if (!tree.has(property)) tree.touchNode(property)

    const node = tree.getNode(property)
    if (!node.length) node.appendLine(header)

    // todo: this looks brittle
    rowsAsStrings.forEach(row => {
      if (!node.toString().includes(row)) node.appendLine(row)
    })

    return Disk.write(this.getFilePath(id), tree.toString())
  }

  // todo: remove
  getOne(path) {
    const base = this.getCollection([path])
    return base.nodeAt(0)
  }

  getFile(id) {
    return Disk.read(this.getFilePath(id))
  }

  appendTreeToLang(id, line, text) {
    throw new Error("move to node")
    const path = this.getFilePath(id)
    const file = Disk.read(path)
    const prefix = !file || file.endsWith("\n") ? "" : "\n"
    return Disk.append(path, prefix + line + TreeNode.nest(text, 1) + "\n")
  }

  appendLine(id, line) {
    throw new Error("move to node")
    const path = this.getFilePath(id)
    const file = Disk.read(path)
    const prefix = !file || file.endsWith("\n") ? "" : "\n"
    return Disk.append(path, prefix + line + "\n")
  }

  getNode(key): TreeBaseFile {
    return <TreeBaseFile>this.getCollection().getNode(key)
  }

  exists(id) {
    return Disk.exists(this.getFilePath(id))
  }

  find(prop) {
    return this.getAllWith(prop).map(n => n.getNode(prop))
  }

  getNames() {
    return this.getCollection().map(item => item.getWord(0))
  }

  getAll(): TreeBaseFile[] {
    return this.getCollection().getChildren()
  }

  makeIndexBy(tree, prop) {
    const map = {}
    tree.forEach((child, index) => {
      const key = child.get(prop)
      if (map[key])
        throw new Error(`Attempting to set index with ${prop}, but node ${map[key].getIndex()} has key ${key} but node ${map[key]} already has that key.`)
      map[key] = child
    })
    return map
  }

  getDir() {
    return this._dir
  }

  getGrammarPath() {
    return this._grammarPath
  }

  getSparsity() {
    const nodes = this.getAll()
    const fields = this.getCollection().getDimensions()
    let count = 0
    nodes.forEach(node => {
      fields.forEach(field => {
        if (node.has(field)) count++
      })
    })

    return Number(1 - count / (nodes.length * fields.length)).toFixed(2)
  }

  getMapTuple(propertyName) {
    // todo: should be instance method on tree?
    return this._getMapTuple(this.toTree(), propertyName, node => node.getWord(0))
  }

  getNamesWithout(prop) {
    return this.getAll()
      .filter(node => !node.has(prop))
      .map(node => node.getWord(0))
      .join("\n")
  }

  getAllWith(props) {
    if (typeof props === "string") props = [props]
    return this.getAll().filter(node => props.every(prop => node.has(prop)))
  }

  extractObject(tree, fieldsArr) {
    // todo: should be instance method on tree
    const obj = {}
    fieldsArr.forEach(field => (obj[field] = tree.get(field)))
    return obj
  }

  private _getMapTuple(tree, propertyNameOrFn, propertyNameOrFn2) {
    const oneToTwo = {}
    const twoToOne = {}
    const is1Str = typeof propertyNameOrFn === "string"
    const is2Str = typeof propertyNameOrFn2 === "string"
    tree.forEach(node => {
      const value1 = is1Str ? node.get(propertyNameOrFn) : propertyNameOrFn(node)
      if (!value1) return undefined
      const value2 = is2Str ? node.get(propertyNameOrFn2) : propertyNameOrFn2(node)
      oneToTwo[value1] = value2
      twoToOne[value2] = value1
    })
    return [oneToTwo, twoToOne]
  }

  getTable(columns) {
    const rows = this.toTree().map(node => {
      const obj = {}
      columns.forEach(col => {
        if (!col.substr) obj[col[0]] = col[1](node)
        else obj[col] = node.get(col)
      })
      obj.id = node.getWord(0)
      return obj
    })
    return new TreeNode(rows)
  }

  toTree() {
    return new TreeNode(this.toString())
  }

  getApp() {
    if (!this._app) this._app = this._makeApp()
    return this._app
  }

  private _app: any

  startApp(port = 8887) {
    const fs = require("fs")
    fs.watch(this.getDir(), (event, filename) => {
      const collection = this.getCollection()
      const id = Disk.getFileName(filename)
      const node = collection.getNode(id)
      const data = Disk.read(this.getDir() + filename)
      if (!node) collection.appendLineAndChildren(id, data)
      else node.setChildren(data)
    })
    const app = this.getApp()

    // this.getCollection().cellCheck(10)
    app.post("/eval", (req, res) => {
      if (!req.body.q) return res.send("req.body.q was empty")

      res.send(JSON.stringify(eval(req.body.q)))
    })

    app.listen(port, () => console.log(`TreeBase server running: \ncmd+dblclick: http://localhost:${port}/`))
    return this
  }

  getSize() {
    return this.toString().length
  }

  private _getStatusMessage() {
    const paths = this.getApp()
      ._router.stack // registered routes
      .filter(r => r.route) // take out all the middleware
      .map(r => r.route.path) // get all the paths

    return `TreeBase server running:
-- Folder: '${this.getDir()}'
-- Grammar: '${this.getGrammarPath()}'
-- Files: ${this.getCollection().length}
-- Size: ${this.getSize()}
-- Routes: ${paths.join("\n ")}`
  }

  private _makeApp() {
    const path = require("path")
    const express = require("express")
    const bodyParser = require("body-parser")
    const app = express()
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type")
      res.setHeader("Access-Control-Allow-Credentials", true)
      next()
    })

    app.get("/", (req, res) => {
      const dir = this.getDir()
      const files = Disk.dir(dir)
      const links = "" // files.map(f => `<a href="${f}">${f}</a>`).join("<br>")
      res.send(`<pre>${this._getStatusMessage()}</pre>
<div>${links}</div>`)
    })

    app.use(
      express.static(this.getDir(), {
        setHeaders: (res, requestPath) => {
          if (path.extname(requestPath) === "tree") res.setHeader("Content-Type", "text/plain")
        }
      })
    )

    return app
  }

  private _getProgram() {
    return new (jtree.getProgramConstructor(this._grammarPath))().getGrammarProgramRoot()
  }

  private _readFiles(files) {
    return files
      .map(file => {
        const filename = Disk.getFileName(file)
        const content = Disk.read(file)
        if (content.match(/\r/)) throw new Error("bad \\r in " + file)
        return content ? filename + "\n " + content.trim().replace(/\n/g, "\n ") : filename
      })
      .join("\n")
  }

  toString(sampleSize = undefined, files = undefined) {
    files = files || Disk.getFiles(this.getDir())

    if (sampleSize !== undefined) files = lodash.sampleSize(files, sampleSize)

    return this._readFiles(files)
  }
}

export { TreeBase, TreeBaseFile, TreeBaseCollection }
