//onsave jtree build produce treeBase.node.js

import { treeNotationTypes } from "../products/treeNotationTypes"

const { jtree } = require("../index.js")
const { Disk } = require("../products/Disk.node.js")

const path = require("path")
const fs = require("fs")

const HandGrammarProgram = jtree.HandGrammarProgram
const TreeUtils = jtree.Utils
const TreeNode = jtree.TreeNode
const TreeEvents = jtree.TreeEvents
const GrammarConstants = jtree.GrammarConstants

const makeId = (word: string) => TreeUtils.getFileName(TreeUtils.removeFileExtension(word))

class TreeBaseFile extends TreeNode {
  get id() {
    return makeId(this.getWord(0))
  }

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

  get base() {
    return this.getParent()
  }

  get parsed() {
    const programParser = this.base.grammarProgramConstructor
    return new programParser(this.toString())
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
    const folder = this._folder
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
    const errors = folder.toProgram().getAllErrors()
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
      express.static(this._folder.dir, {
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
    return Disk.touch(path.join(this.dir, filename))
  }

  // WARNING: Very basic support! Not fully developed.
  // WARNING: Does not yet support having multiple tuples with the same key—will collapse those to one.
  toSQLite(): string {
    return this.toSQLiteCreateTables() + "\n\n" + this.toSQLiteInsertRows()
  }

  toSQLiteCreateTables(): string {
    this.loadFolder()

    const grammarProgram = new HandGrammarProgram(this.grammarCode)
    const tableDefinitionNodes = grammarProgram.filter((node: any) => node.getTableNameIfAny && node.getTableNameIfAny())
    // todo: filter out root root

    return tableDefinitionNodes.map((node: any) => node.toSQLiteTableSchema()).join("\n")
  }

  toSQLiteInsertRows(): string {
    return this.toProgram()
      .map((node: any) => node.toSQLiteInsertStatement((node: any) => TreeBaseFile.extractPrimaryKeyFromFilename(node.getWord(0))))
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

  // todo: remove
  _getDir() {
    // todo: cache?
    return this.getWord(0).replace(/\/$/, "") + "/"
  }

  get dir(): string {
    return this._getDir()
  }

  get grammarDir(): string {
    return this.dir
  }

  get grammarFilePaths() {
    return Disk.getFiles(this.grammarDir).filter((file: string) => file.endsWith(GrammarConstants.grammarFileExtension))
  }

  private _setDiskVersions() {
    this.forEach((node: treeNotationTypes.treeNode) => {
      node.setDiskVersion()
    })
    return this
  }

  private _getAndFilterFilesFromFolder() {
    return this._filterFiles(Disk.getFiles(this.dir))
  }

  // todo: cleanup the filtering here.
  private _filterFiles(files: string[]) {
    return files.filter((file: string) => !file.endsWith(GrammarConstants.grammarFileExtension))
  }

  private _fsWatcher: any

  startListeningForFileChanges() {
    this.loadFolder()
    const { dir } = this
    this._fsWatcher = fs.watch(dir, (event: any, filename: treeNotationTypes.fileName) => {
      let fullPath = path.join(dir, filename)
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

  get typedMapShort() {
    const typedMap = this.toProgram().typedMap
    const obj: treeNotationTypes.stringMap = {}
    Object.keys(typedMap).forEach(key => {
      obj[makeId(key)] = typedMap[key][0]
    })
    return obj
  }

  toProgram() {
    this.loadFolder()
    const programConstructor = this.grammarProgramConstructor
    return new programConstructor(this.toString())
  }

  get errors() {
    return this.map((file: TreeBaseFile) => file.parsed.getErrors())
      .flat()
      .filter(i => i)
  }

  get parsed() {
    const parsed: treeNotationTypes.stringMap = {}
    this.forEach((file: TreeBaseFile) => {
      parsed[file.id] = file.parsed
    })
    return parsed
  }

  grammarCode = this.grammarFilePaths.map(Disk.read).join("\n")
  grammarProgramConstructor = new HandGrammarProgram(this.grammarCode).compileAndReturnRootConstructor()

  private _readFiles(files: treeNotationTypes.filepath[]) {
    return files
      .map(fullPath => {
        const content = Disk.read(fullPath)
        if (content.match(/\r/)) throw new Error("bad \\r in " + fullPath)
        return content ? fullPath + "\n " + content.replace(/\n/g, "\n ") : fullPath
      })
      .join("\n")
  }
}

export { TreeBaseFile, TreeBaseFolder, TreeBaseServer }
