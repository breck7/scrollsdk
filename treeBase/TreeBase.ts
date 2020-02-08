//onsave jtree build produce treeBase.node.js

import { treeNotationTypes } from "../products/treeNotationTypes"

const { jtree } = require("../index.js")
const { Disk } = require("../products/Disk.node.js")

const fs = require("fs")

const HandGrammarProgram = jtree.HandGrammarProgram
const TreeUtils = jtree.Utils
const TreeNode = jtree.TreeNode
const TreeEvents = jtree.TreeEvents
const GrammarConstants = jtree.GrammarConstants

class TreeBaseFile extends TreeNode {
  private _diskVersion: string
  setDiskVersion() {
    this._diskVersion = this.childrenToString()
    return this
  }
  getDiskVersion() {
    return this._diskVersion
  }

  getPrimaryKey() {
    return TreeBaseFile.extractPrimaryKeyFromFilename(this.getWord(0))
  }

  static extractPrimaryKeyFromFilename(filename: string) {
    return TreeUtils.getFileName(TreeUtils.removeFileExtension(filename))
  }

  getOneOf(keys: string[]) {
    for (let i = 0; i < keys.length; i++) {
      const value = this.get(keys[i])
      if (value) return value
    }
    return ""
  }

  toExpandedColumns() {
    // todo: do things like wp_example_2 wp_example_3 ...
  }

  getDoc(terms: string[]) {
    return terms
      .map(term => {
        const nodes = this.findNodes(this._getFilePath() + " " + term)
        return nodes.map((node: treeNotationTypes.treeNode) => node.childrenToString()).join("\n")
      })
      .filter(identity => identity)
      .join("\n")
  }

  set(keywordPath: any, content: any) {
    return typeof keywordPath === "object" ? this.setProperties(keywordPath) : super.set(keywordPath, content)
  }

  setPropertyIfMissing(prop: string, value: string) {
    if (this.has(prop)) return true
    return this.touchNode(prop).setContent(value)
  }

  setProperties(propMap: treeNotationTypes.stringMap) {
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

  extract(fields: string[]) {
    const newTree = new TreeNode(this.toString()) // todo: why not clone?
    const map = TreeUtils.arrayToMap(fields)
    newTree.nodeAt(0).forEach((node: treeNotationTypes.treeNode) => {
      if (!map[node.getWord(0)]) node.destroy()
    })

    return newTree
  }

  save() {
    const str = this.childrenToString()
    if (this.getDiskVersion() === str) return this

    Disk.write(this._getFilePath(), str)
    this.setDiskVersion()
    return this
  }

  appendUniqueLine(line: string) {
    const file = this.toString()
    if (file.match(new RegExp("^" + Disk.escape(line), "m"))) return true
    const prefix = !file || file.endsWith("\n") ? "" : "\n"
    return this.appendLine(prefix + line + "\n")
  }

  private _getFilePath() {
    return this.getWord(0)
  }

  getFileName() {
    return Disk.getFileName(this._getFilePath())
  }

  createParser() {
    return new TreeNode.Parser(TreeNode)
  }
}

class TreeBaseServer {
  protected _folder: TreeBaseFolder
  protected _app: any
  constructor(treeBaseFolder: TreeBaseFolder) {
    this._folder = treeBaseFolder
    this._app = this._createExpressApp()
  }

  listen(port = 4444) {
    this._app.listen(port, () => console.log(`TreeBaseServer server running: \ncmd+dblclick: http://localhost:${port}/`))
    return this
  }

  indexCommand(routes: string[]) {
    const links = routes.map((path: any) => `<a href="${path}">${path}</a>`) // get all the paths
    return `<style>body {
     font-family: "San Francisco", "Myriad Set Pro", "Lucida Grande", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif;
     margin: auto;
     max-width: 1200px;
     background: #eee;
     color rgba(1, 47, 52, 1);
   }h1 {font-size: 1.2em; margin: 0;}</style>
     <h1>TreeBaseServer running:</h1>
    <div style="white-space:pre;">
-- Folder: '${this._folder._getDir()}'
-- Grammars: '${this._folder._getGrammarPaths().join(",")}'
-- Files: ${this._folder.length}
-- Bytes: ${this._folder.toString().length}
-- Routes: ${links.join("\n ")}</div>`
  }

  errorsToHtmlCommand() {
    const timer = new TreeUtils.Timer()
    let end = timer.tick("Loaded collection....")
    let lines = this._folder.getNumberOfLines()
    let lps = lines / (end / 1000)
    const errors = this._folder.toProgram().getAllErrors()
    return `Total errors: ${errors.length}\n${errors.join("\n")}`
  }

  errorsToCsvCommand() {
    return new jtree.TreeNode(
      this._folder
        .toProgram()
        .getAllErrors()
        .map((err: any) => err.toObject())
    ).toCsv()
  }

  listAllFilesCommand() {
    return this._folder.map((node: treeNotationTypes.treeNode) => `<a href="${node.getFileName()}">${node.getFileName()}</a>`).join("<br>")
  }

  private _getRoutes(app: any) {
    return app._router.stack // registered routes
      .filter((route: any) => route.route && route.route.path.length > 1) // take out all the middleware
      .map((route: any) => route.route.path)
  }

  private _createExpressApp() {
    const path = require("path")
    const express = require("express")
    const bodyParser = require("body-parser")
    const app = express()

    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    app.use((req: any, res: any, next: any) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type")
      res.setHeader("Access-Control-Allow-Credentials", true)
      next()
    })

    app.get("/list.html", (req: any, res: any) => res.send(this.listAllFilesCommand()))
    app.get("/", (req: any, res: any) => res.send(this.indexCommand(this._getRoutes(app))))

    app.use(
      express.static(this._folder._getDir(), {
        setHeaders: (res: any, requestPath: string) => {
          res.setHeader("Content-Type", "text/plain")
        }
      })
    )

    app.get("/errors.html", (req: any, res: any) => {
      res.send(this.errorsToHtmlCommand())
    })

    app.get("/errors.csv", (req: any, res: any) => {
      res.setHeader("Content-Type", "text/plain")
      res.send(this.errorsToCsvCommand())
    })

    return app
  }
}

class TreeBaseFolder extends TreeNode {
  touch(filename: treeNotationTypes.fileName) {
    // todo: throw if its a folder path, has wrong file extension, or other invalid
    return Disk.touch(this._getDir() + filename)
  }

  toSqlLite(): string {
    return this.toSqlLiteCreateTables() + "\n\n" + this.toSqlLiteInsertRows()
  }

  toSqlLiteCreateTables(): string {
    this.loadFolder()

    const grammarProgram = new HandGrammarProgram(this._getTreeBaseGrammarCode())
    const tableDefinitionNodes = grammarProgram.filter((node: any) => node.getTableNameIfAny && node.getTableNameIfAny())
    // todo: filter out root root

    return tableDefinitionNodes.map((node: any) => node.toSqlLiteTableSchema()).join("\n")
  }

  toSqlLiteInsertRows(): string {
    return this.toProgram()
      .map((node: any) => node.toSqlLiteInsertStatement((node: any) => TreeBaseFile.extractPrimaryKeyFromFilename(node.getWord(0))))
      .join("\n")
  }

  createParser() {
    return new TreeNode.Parser(TreeBaseFile)
  }

  private _isLoaded = false

  // todo: RAII?
  loadFolder(files: treeNotationTypes.filepath[] = undefined, sampleSize: treeNotationTypes.int = undefined, seed: number = Date.now()) {
    if (this._isLoaded) return this
    files = files || this._getAndFilterFilesFromFolder()

    if (sampleSize !== undefined) files = TreeUtils.sampleWithoutReplacement(files, sampleSize, seed)

    this.setChildren(this._readFiles(files))
    this._setDiskVersions()

    this._isLoaded = true
    return this
  }

  cellCheckWithProgressBar(printLimit = 100) {
    const timer = new TreeUtils.Timer()
    timer.tick("start...")
    const program = this.toProgram()
    let lines = this.getNumberOfLines()
    let lps = lines / (timer.tick("End parser") / 1000)
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
        err.forEach((err: treeNotationTypes.treeNode) =>
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

  _getDir() {
    // todo: cache?
    return this.getWord(0).replace(/\/$/, "") + "/"
  }

  _getGrammarPaths() {
    return Disk.getFiles(this._getDir()).filter((file: string) => file.endsWith(GrammarConstants.grammarFileExtension))
  }

  private _setDiskVersions() {
    this.forEach((node: treeNotationTypes.treeNode) => {
      node.setDiskVersion()
    })
    return this
  }

  private _getAndFilterFilesFromFolder() {
    return this._filterFiles(Disk.getFiles(this._getDir()))
  }

  // todo: cleanup the filtering here.
  private _filterFiles(files: string[]) {
    return files.filter((file: string) => !file.endsWith(GrammarConstants.grammarFileExtension))
  }

  private _fsWatcher: any

  startListeningForFileChanges() {
    this.loadFolder()
    this._fsWatcher = fs.watch(this._getDir(), (event: any, filename: treeNotationTypes.fileName) => {
      let fullPath = this._getDir() + filename
      fullPath = this._filterFiles([fullPath])[0]
      if (!fullPath) return true

      const node = <any>this.getNode(fullPath)
      if (!Disk.exists(fullPath)) {
        this.delete(fullPath)
        this.trigger(new TreeEvents.ChildRemovedTreeEvent(node))
        this.trigger(new TreeEvents.DescendantChangedTreeEvent(node))
        return
      }

      const data = Disk.read(fullPath)
      if (!node) {
        const newNode = this.appendLineAndChildren(fullPath, data)
        this.trigger(new TreeEvents.ChildAddedTreeEvent(newNode))
        this.trigger(new TreeEvents.DescendantChangedTreeEvent(newNode))
      } else {
        node.setChildren(data)
        this.trigger(new TreeEvents.DescendantChangedTreeEvent(node))
      }
    })
  }

  stopListeningForFileChanges() {
    this._fsWatcher.close()
    delete this._fsWatcher
  }

  private _getGrammarFilesAsTree() {
    return new TreeNode(
      this._getGrammarPaths()
        .map(Disk.read)
        .join("\n")
    )
  }

  private _getTreeBaseGrammarCode() {
    const code = this._getGrammarFilesAsTree()
    const rootNodes = code.with("root")
    return `${code}
treeBaseFolderNode
 ${GrammarConstants.root}
 ${GrammarConstants.inScope} ${rootNodes.map((node: treeNotationTypes.treeNode) => node.getWord(0)).join(" ")}
 ${GrammarConstants.catchAllNodeType} treeBaseErrorNode
treeBaseErrorNode
 ${GrammarConstants.baseNodeType} ${GrammarConstants.errorNode}`
  }

  toProgram() {
    this.loadFolder()
    const grammarProgram = new HandGrammarProgram(this._getTreeBaseGrammarCode())
    const programConstructor = <any>grammarProgram.compileAndReturnRootConstructor()
    return new programConstructor(this.toString())
  }

  private _readFiles(files: treeNotationTypes.filepath[]) {
    return files
      .map(fullPath => {
        const filename = Disk.getFileName(fullPath)
        const content = Disk.read(fullPath)
        if (content.match(/\r/)) throw new Error("bad \\r in " + fullPath)
        return content ? fullPath + "\n " + content.trim().replace(/\n/g, "\n ") : fullPath
      })
      .join("\n")
  }
}

export { TreeBaseFile, TreeBaseFolder, TreeBaseServer }
