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
    const requestLog = path.join(ignoreFolder, "access.log")
    Disk.touch(requestLog)
    app.use(morgan("combined", { stream: fs.createWriteStream(requestLog, { flags: "a" }) }))
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
    const searchServer = new SearchServer(this.folder)
    this.searchServer = searchServer
    const formats = ["html", "csv", "text", "scroll"]
    const searchCache = {}
    const searchRequestLog = path.join(this.ignoreFolder, "searchLog.tree")
    Disk.touch(searchRequestLog)
    this.app.get("/search", (req, res) => {
      const { q } = req.query
      const originalQuery = q === undefined ? "" : q
      const originalFormat = req.query.format
      const format = originalFormat && formats.includes(originalFormat) ? originalFormat : "html"
      searchServer.logQuery(searchRequestLog, originalQuery, req.ip, format)
      const key = originalQuery + format
      if (searchCache[key]) return res.send(searchCache[key])
      const decodedQuery = decodeURIComponent(originalQuery).replace(/\r/g, "")
      if (format === "html") searchCache[key] = this.scrollToHtml(searchServer.scroll(decodedQuery))
      if (format === "scroll") searchCache[key] = searchServer.scroll(decodedQuery)
      if (format === "csv") searchCache[key] = searchServer.csv(decodedQuery)
      if (format === "text") searchCache[key] = searchServer.text(decodedQuery)
      res.send(searchCache[key])
    })
    return this
  }
  listen(port = 4444) {
    this._addNotFoundRoute()
    this.app.listen(port, () => console.log(`TreeBase server running: \ncmd+dblclick: http://localhost:${port}/`))
    return this
  }
  // Currently you need to override in your app
  scrollToHtml(scrollContent) {
    return scrollContent
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
  constructor(treeBaseFolder) {
    this.folder = treeBaseFolder
  }
  logQuery(logFilePath, originalQuery, ip, format = "html") {
    const tree = `search
 time ${Date.now()}
 ip ${ip}
 format ${format}
 query
  ${originalQuery.replace(/\n/g, "\n  ")} 
`
    fs.appendFile(logFilePath, tree, function() {})
    return this
  }
  scroll(treeQLCode) {
    const { hits, time, columnNames, errors, title, description } = this.search(treeQLCode)
    const { folder } = this
    const results = hits._toDelimited(delimiter, columnNames, delimitedEscapeFunction)
    const encodedTitle = Utils.escapeScrollAndHtml(title)
    const encodedDescription = Utils.escapeScrollAndHtml(description)
    return `title ${title ? encodedTitle : "Search Results"}
 hidden
viewSourceUrl https://github.com/breck7/jtree/blob/main/treeBase/TreeBaseServer.ts

html <form method="get" action="search" class="tqlForm"><textarea id="tqlInput" name="q"></textarea><input type="submit" value="Search"></form>
html <div id="tqlErrors">${errors}</div>

* Searched ${numeral(folder.length).format("0,0")} files and found ${hits.length} matches in ${time}s. 
 class searchResultsHeader

${title ? `# ${encodedTitle}` : ""}
${description ? `* ${encodedDescription}` : ""}

table ${delimiter}
 ${results.replace(/\n/g, "\n ")}
`
  }
  search(treeQLCode) {
    const startTime = Date.now()
    let hits = new TreeNode()
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
      hits = new TreeNode(matchingFilesAsObjectsWithSelectedColumns)
    } catch (err) {
      errors = err.toString()
    }
    return { hits, time: numeral((Date.now() - startTime) / 1000).format("0.00"), columnNames, errors, title, description }
  }
  text(treeQLCode) {
    return this.search(treeQLCode).hits.toString()
  }
  csv(treeQLCode) {
    const { hits, columnNames } = this.search(treeQLCode)
    return hits.toDelimited(",", columnNames, delimitedEscapeFunction)
  }
}
if (!module.parent) {
  const folderPath = process.cwd()
  const folder = new TreeBaseFolder().setDir(folderPath).setGrammarDir(folderPath)
  new SearchServer(folder).csv(process.argv.slice(2).join(" "))
}

module.exports = { TreeBaseServer, SearchServer }
