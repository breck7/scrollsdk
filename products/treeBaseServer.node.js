const fs = require("fs")
const path = require("path")
const lodash = require("lodash")
const numeral = require("numeral")
const morgan = require("morgan")
const https = require("https")
const express = require("express")
const bodyParser = require("body-parser")
const { Disk } = require("../products/Disk.node.js")
const { Utils } = require("../products/Utils.js")
const { TreeNode } = require("../products/TreeNode.js")
const tqlNode = require("../products/tql.nodejs.js")
const delimitedEscapeFunction = value => (value.includes("\n") ? value.split("\n")[0] : value)
const delimiter = " DeLiM "
class TreeBaseServer {
  constructor(folder, ignoreFolder) {
    this.ignoreFolder = ""
    this.notFoundPage = "Not found"
    this.folder = folder
    const app = express()
    this.app = app
    this.ignoreFolder = ignoreFolder
    if (!Disk.exists(ignoreFolder)) Disk.mkdir(ignoreFolder)
    this._initLogs()
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type")
      res.setHeader("Access-Control-Allow-Credentials", true)
      next()
    })
    return this
  }
  _initLogs() {
    const { ignoreFolder, app } = this
    const requestLog = path.join(ignoreFolder, "access.log")
    Disk.touch(requestLog)
    app.use(morgan("combined", { stream: fs.createWriteStream(requestLog, { flags: "a" }) }))
    const requestTimesLog = path.join(ignoreFolder, "requestTimes.log")
    Disk.touch(requestTimesLog)
    app.use(morgan("tiny", { stream: fs.createWriteStream(requestTimesLog, { flags: "a" }) }))
  }
  _addNotFoundRoute() {
    const { notFoundPage } = this
    //The 404 Route (ALWAYS Keep this as the last route)
    this.app.get("*", (req, res) => res.status(404).send(notFoundPage))
  }
  serveFolder(folder) {
    this.app.use(express.static(folder))
    return this
  }
  initSearch() {
    const searchServer = new SearchServer(this.folder, this.ignoreFolder)
    this.searchServer = searchServer
    this.app.get("/search.json", (req, res) => res.send(searchServer.logAndRunSearch(req.query.q, "json", req.ip)))
    this.app.get("/search.csv", (req, res) => res.send(searchServer.logAndRunSearch(req.query.q, "csv", req.ip)))
    this.app.get("/search.tree", (req, res) => res.send(searchServer.logAndRunSearch(req.query.q, "tree", req.ip)))
    return this
  }
  listen(port = 4444) {
    this._addNotFoundRoute()
    this.app.listen(port, () => console.log(`TreeBase server running: \ncmd+dblclick: http://localhost:${port}/`))
    return this
  }
  listenProd() {
    this._addNotFoundRoute()
    const key = fs.readFileSync(path.join(this.ignoreFolder, "privkey.pem"))
    const cert = fs.readFileSync(path.join(this.ignoreFolder, "fullchain.pem"))
    https
      .createServer(
        {
          key,
          cert
        },
        this.app
      )
      .listen(443)
    const redirectApp = express()
    redirectApp.use((req, res) => res.redirect(301, `https://${req.headers.host}${req.url}`))
    redirectApp.listen(80, () => console.log(`Running redirect app`))
    return this
  }
}
class SearchServer {
  constructor(treeBaseFolder, ignoreFolder) {
    this.searchCache = {}
    this._touchedLog = false
    this.folder = treeBaseFolder
    this.ignoreFolder = ignoreFolder
    this.searchRequestLog = path.join(this.ignoreFolder, "searchLog.tree")
  }
  logQuery(originalQuery, ip, format = "html") {
    const tree = `search
 time ${Date.now()}
 ip ${ip}
 format ${format}
 query
  ${originalQuery.replace(/\n/g, "\n  ")} 
`
    if (!this._touchedLog) {
      Disk.touch(this.searchRequestLog)
      this._touchedLog = true
    }
    fs.appendFile(this.searchRequestLog, tree, function() {})
    return this
  }
  logAndRunSearch(originalQuery = "", format = "object", ip = "") {
    this.logQuery(originalQuery, ip, format)
    return this[format](decodeURIComponent(originalQuery).replace(/\r/g, ""))
  }
  search(treeQLCode) {
    const { searchCache } = this
    if (searchCache[treeQLCode]) return searchCache[treeQLCode]
    const startTime = Date.now()
    let hits = []
    let errors = ""
    let columnNames = []
    let title = ""
    let description = ""
    try {
      const treeQLProgram = new tqlNode(treeQLCode)
      const programErrors = treeQLProgram.scopeErrors.concat(treeQLProgram.getAllErrors())
      if (programErrors.length) throw new Error(programErrors.map(err => err.getMessage()).join(" "))
      const sortBy = treeQLProgram.get("sortBy")
      title = treeQLProgram.get("title")
      description = treeQLProgram.get("description")
      let rawHits = treeQLProgram.filterFolder(this.folder)
      if (sortBy) {
        const sortByFns = sortBy.split(" ").map(columnName => file => file.getTypedValue(columnName))
        rawHits = lodash.sortBy(rawHits, sortByFns)
      }
      if (treeQLProgram.has("reverse")) rawHits.reverse()
      // By default right now we basically add: select title titleLink
      // We will probably ditch that in the future and make it explicit.
      columnNames = ["title", "titleLink"].concat((treeQLProgram.get("select") || "").split(" "))
      let matchingFilesAsObjectsWithSelectedColumns = rawHits.map(file => {
        const obj = file.selectAsObject(columnNames)
        obj.titleLink = file.webPermalink
        return obj
      })
      const limit = treeQLProgram.get("limit")
      if (limit) matchingFilesAsObjectsWithSelectedColumns = matchingFilesAsObjectsWithSelectedColumns.slice(0, parseInt(limit))
      const renames = treeQLProgram.findNodes("rename").forEach(node => {
        const oldName = node.getWord(1)
        const newName = node.getWord(2)
        matchingFilesAsObjectsWithSelectedColumns.forEach(obj => {
          obj[newName] = obj[oldName]
          delete obj[oldName]
          columnNames = columnNames.map(columnName => (oldName === columnName ? newName : columnName))
        })
      })
      hits = matchingFilesAsObjectsWithSelectedColumns
    } catch (err) {
      errors = err.toString()
    }
    searchCache[treeQLCode] = { hits, queryTime: numeral((Date.now() - startTime) / 1000).format("0.00"), columnNames, errors, title, description }
    return searchCache[treeQLCode]
  }
  json(treeQLCode) {
    return JSON.stringify(this.search(treeQLCode), undefined, 2)
  }
  tree(treeQLCode) {
    return new TreeNode(this.search(treeQLCode).hits).toString()
  }
  csv(treeQLCode) {
    const { hits, columnNames } = this.search(treeQLCode)
    return new TreeNode(hits).toDelimited(",", columnNames, delimitedEscapeFunction)
  }
}
if (!module.parent) {
  const folderPath = process.cwd()
  const folder = new TreeBaseFolder().setDir(folderPath).setGrammarDir(folderPath)
  new SearchServer(folder, folderPath).csv(process.argv.slice(2).join(" "))
}

module.exports = { TreeBaseServer, SearchServer }
