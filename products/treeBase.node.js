//onsave jtree build produce treeBase.node.js
const { jtree } = require("../index.js")
const { Disk } = require("../products/Disk.node.js")
const grammarNode = require("../products/grammar.nodejs.js")
const path = require("path")
const fs = require("fs")
const HandGrammarProgram = jtree.HandGrammarProgram
const TreeUtils = jtree.Utils
const TreeNode = jtree.TreeNode
const TreeEvents = jtree.TreeEvents
const GrammarConstants = jtree.GrammarConstants
const makeId = word => TreeUtils.getFileName(TreeUtils.removeFileExtension(word))
class TreeBaseFile extends TreeNode {
  constructor() {
    super(...arguments)
    this.id = this.getWord(0)
  }
  setDiskVersion() {
    this._diskVersion = this.childrenToString()
    return this
  }
  getDiskVersion() {
    return this._diskVersion
  }
  getDoc(terms) {
    return terms
      .map(term => {
        const nodes = this.findNodes(this._getFilePath() + " " + term)
        return nodes.map(node => node.childrenToString()).join("\n")
      })
      .filter(identity => identity)
      .join("\n")
  }
  set(keywordPath, content) {
    return typeof keywordPath === "object" ? this.setProperties(keywordPath) : super.set(keywordPath, content)
  }
  save() {
    const str = this.childrenToString()
    if (this.getDiskVersion() === str) return this
    Disk.write(this._getFilePath(), str)
    this.setDiskVersion()
    return this
  }
  appendUniqueLine(line) {
    const file = this.toString()
    if (file.match(new RegExp("^" + Disk.escape(line), "m"))) return true
    const prefix = !file || file.endsWith("\n") ? "" : "\n"
    return this.appendLine(prefix + line + "\n")
  }
  _getFilePath() {
    return this.base.makeFilePath(this.id)
  }
  getFileName() {
    return Disk.getFileName(this._getFilePath())
  }
  createParser() {
    return new TreeNode.Parser(TreeNode)
  }
  get base() {
    return this.getParent()
  }
  get parsed() {
    const programParser = this.base.grammarProgramConstructor
    return new programParser(this.childrenToString())
  }
}
class TreeBaseServer {
  constructor(treeBaseFolder) {
    this._folder = treeBaseFolder
    this._app = this._createExpressApp()
  }
  listen(port = 4444) {
    this._app.listen(port, () => console.log(`TreeBaseServer server running: \ncmd+dblclick: http://localhost:${port}/`))
    return this
  }
  indexCommand(routes) {
    const folder = this._folder
    const links = routes.map(path => `<a href="${path}">${path}</a>`) // get all the paths
    return `<style>body {
     font-family: "San Francisco", "Myriad Set Pro", "Lucida Grande", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif;
     margin: auto;
     max-width: 1200px;
     background: #eee;
     color rgba(1, 47, 52, 1);
   }h1 {font-size: 1.2em; margin: 0;}</style>
     <h1>TreeBaseServer running:</h1>
    <div style="white-space:pre;">
-- Folder: '${folder.dir}'
-- Grammars: '${folder.grammarFilePaths.join(",")}'
-- Files: ${folder.length}
-- Bytes: ${folder.toString().length}
-- Routes: ${links.join("\n ")}</div>`
  }
  errorsToHtmlCommand() {
    const folder = this._folder
    const timer = new TreeUtils.Timer()
    let end = timer.tick("Loaded collection....")
    let lines = folder.getNumberOfLines()
    let lps = lines / (end / 1000)
    const errors = folder.errors
    return `Total errors: ${errors.length}\n${errors.map(err => err.toString()).join("\n")}`
  }
  errorsToCsvCommand() {
    return new jtree.TreeNode(this._folder.errors.map(err => err.toObject())).toCsv()
  }
  listAllFilesCommand() {
    return this._folder.map(node => `<a href="${node.getFileName()}">${node.getFileName()}</a>`).join("<br>")
  }
  _getRoutes(app) {
    return app._router.stack // registered routes
      .filter(route => route.route && route.route.path.length > 1) // take out all the middleware
      .map(route => route.route.path)
  }
  _createExpressApp() {
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
    app.get("/list.html", (req, res) => res.send(this.listAllFilesCommand()))
    app.get("/", (req, res) => res.send(this.indexCommand(this._getRoutes(app))))
    app.use(
      express.static(this._folder.dir, {
        setHeaders: (res, requestPath) => {
          res.setHeader("Content-Type", "text/plain")
        }
      })
    )
    app.get("/errors.html", (req, res) => {
      res.send(this.errorsToHtmlCommand())
    })
    app.get("/errors.csv", (req, res) => {
      res.setHeader("Content-Type", "text/plain")
      res.send(this.errorsToCsvCommand())
    })
    return app
  }
}
class TreeBaseFolder extends TreeNode {
  constructor() {
    super(...arguments)
    this._isLoaded = false
    this.dir = ""
    this.grammarDir = ""
    this.grammarCode = ""
    this.grammarProgramConstructor = undefined
    this.fileExtension = ""
  }
  touch(filename) {
    // todo: throw if its a folder path, has wrong file extension, or other invalid
    return Disk.touch(path.join(this.dir, filename))
  }
  // WARNING: Very basic support! Not fully developed.
  // WARNING: Does not yet support having multiple tuples with the same key—will collapse those to one.
  toSQLite() {
    return this.toSQLiteCreateTables() + "\n\n" + this.toSQLiteInsertRows()
  }
  toSQLiteCreateTables() {
    this.loadFolder()
    const grammarProgram = new HandGrammarProgram(this.grammarCode)
    const tableDefinitionNodes = grammarProgram.filter(node => node.getTableNameIfAny && node.getTableNameIfAny())
    // todo: filter out root root
    return tableDefinitionNodes.map(node => node.toSQLiteTableSchema()).join("\n")
  }
  toSQLiteInsertRows() {
    return this.map(file => file.parsed.toSQLiteInsertStatement(file.id)).join("\n")
  }
  createParser() {
    return new TreeNode.Parser(TreeBaseFile)
  }
  get typedMap() {
    this.loadFolder()
    const map = {}
    this.forEach(file => {
      const [id, value] = file.parsed.typedTuple
      map[file.id] = value
    })
    return map
  }
  // todo: RAII?
  loadFolder() {
    if (this._isLoaded) return this
    const files = this._getAndFilterFilesFromFolder()
    this.setChildren(this._readFiles(files)) // todo: speedup?
    this._setDiskVersions()
    this._isLoaded = true
    return this
  }
  // todo: need to RAII this. Likely just not have TreeBaseFolder extend TreeNode
  setDir(dir) {
    this.dir = dir
    return this
  }
  setGrammarDir(dir) {
    this.grammarDir = dir
    const rawCode = this.grammarFilePaths.map(Disk.read).join("\n")
    this.grammarCode = new grammarNode(rawCode).format().toString()
    this.grammarProgramConstructor = new HandGrammarProgram(this.grammarCode).compileAndReturnRootConstructor()
    this.fileExtension = new this.grammarProgramConstructor().fileExtension
    return this
  }
  get grammarFilePaths() {
    return Disk.getFiles(this.grammarDir).filter(file => file.endsWith(GrammarConstants.grammarFileExtension))
  }
  _setDiskVersions() {
    // todo: speedup?
    this.forEach(file => file.setDiskVersion())
    return this
  }
  _getAndFilterFilesFromFolder() {
    return this._filterFiles(Disk.getFiles(this.dir))
  }
  // todo: cleanup the filtering here.
  _filterFiles(files) {
    return files.filter(file => !file.endsWith(GrammarConstants.grammarFileExtension))
  }
  startListeningForFileChanges() {
    this.loadFolder()
    const { dir } = this
    this._fsWatcher = fs.watch(dir, (event, filename) => {
      let fullPath = path.join(dir, filename)
      fullPath = this._filterFiles([fullPath])[0]
      if (!fullPath) return true
      const node = this.getNode(fullPath)
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
  makeFilePath(id) {
    return path.join(this.dir, id + "." + this.fileExtension)
  }
  get errors() {
    let errors = []
    this.forEach(file => {
      const { parsed } = file
      const errs = parsed.getAllErrors()
      if (errs.length) errors = errors.concat(errs)
      const { scopeErrors } = parsed
      if (scopeErrors.length) errors = errors.concat(scopeErrors)
    })
    return errors
  }
  _readFiles(files) {
    return files
      .map(fullPath => {
        const content = Disk.read(fullPath)
        if (content.match(/\r/)) throw new Error("bad \\r in " + fullPath)
        const id = makeId(fullPath)
        return content ? id + "\n " + content.replace(/\n/g, "\n ") : id
      })
      .join("\n")
  }
}

module.exports = { TreeBaseFile, TreeBaseFolder, TreeBaseServer }
