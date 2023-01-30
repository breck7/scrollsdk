const fs = require("fs")
const path = require("path")
const numeral = require("numeral")
const https = require("https")
const express = require("express")
const bodyParser = require("body-parser")
const { Disk } = require("../products/Disk.node.js")
const { Utils } = require("../products/Utils.js")
const { TreeNode } = require("../products/TreeNode.js")
const tqlNode = require("../products/tql.nodejs.js")
class TreeBaseServer {
  constructor(folder) {
    this.folder = folder
    const app = express()
    this.app = app
    this._setExpressBasics()
    return this
  }
  _setExpressBasics() {
    const { app } = this
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type")
      res.setHeader("Access-Control-Allow-Credentials", true)
      next()
    })
  }
  serveFolder(folder) {
    this.app.use(express.static(folder))
    return this
  }
  initSearch(searchLogFolder = "") {
    const searchServer = new SearchServer(this.folder)
    this.searchServer = searchServer
    const searchLogPath = path.join(searchLogFolder, "searchLog.tree")
    if (searchLogFolder) Disk.touch(searchLogPath)
    const searchHTMLCache = {}
    this.app.get("/search", (req, res) => {
      const originalQuery = req.query.q === undefined ? "" : req.query.q
      if (searchLogFolder) searchServer.logQuery(searchLogPath, originalQuery, req.ip)
      if (searchHTMLCache[originalQuery]) return res.send(searchHTMLCache[originalQuery])
      const decodedQuery = decodeURIComponent(originalQuery).replace(/\r/g, "")
      searchHTMLCache[originalQuery] = this.scrollToHtml(searchServer.scroll(decodedQuery))
      res.send(searchHTMLCache[originalQuery])
    })
    return this
  }
  listen(port = 4444) {
    this.app.listen(port, () => console.log(`TreeBase server running: \ncmd+dblclick: http://localhost:${port}/`))
    return this
  }
  // Currently you need to override in your app
  scrollToHtml(scrollContent) {
    return scrollContent
  }
  listenProd(pemPath) {
    const key = fs.readFileSync(path.join(pemPath, "privkey.pem"))
    const cert = fs.readFileSync(path.join(pemPath, "fullchain.pem"))
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
  logQuery(logFilePath, originalQuery, ip) {
    const tree = `search
 time ${Date.now()}
 ip ${ip}
 query
  ${originalQuery.replace(/\n/g, "\n  ")} 
`
    fs.appendFile(logFilePath, tree, function() {})
    return this
  }
  scroll(treeQLCode) {
    const { hits, time, columnNames } = this.search(treeQLCode)
    const { folder } = this
    const delimiter = "DeLiM"
    const results = hits.toDelimited(delimiter, columnNames)
    return `title Search Results
 hidden

viewSourceUrl https://github.com/breck7/jtree/blob/main/treeBase/TreeBaseServer.ts

html <form method="get" action="search" class="tqlForm"><textarea id="tqlInput" name="q"></textarea><input type="submit" value="Search"></form>

html <script>document.addEventListener("DOMContentLoaded", evt => document.getElementById("tqlInput").value = decodeURIComponent("${encodeURIComponent(treeQLCode)}"))</script>

* Searched ${numeral(folder.length).format("0,0")} files and found ${hits.length} matches in ${time}s. 
 class searchResultsHeader

table ${delimiter}
 ${results.replace(/\n/g, "\n ")}
`
  }
  search(treeQLCode) {
    var _a
    const treeQLProgram = new tqlNode(treeQLCode)
    const startTime = Date.now()
    const time = numeral((Date.now() - startTime) / 1000).format("0.00")
    const rawHits = treeQLProgram.filterFolder(this.folder)
    rawHits.forEach(file => file.set("titleLink", file.webPermalink))
    const hits = new TreeNode(rawHits)
    const customColumns = ((_a = treeQLProgram.get("select")) === null || _a === void 0 ? void 0 : _a.split(" ")) || []
    const columnNames = "title titleLink".split(" ").concat(customColumns)
    return { hits, time, columnNames }
  }
  json(treeQLCode) {
    return this.search(treeQLCode).hits.toJSON()
  }
  csv(treeQLCode) {
    const { hits, columnNames } = this.search(treeQLCode)
    return hits.toDelimited(",", columnNames)
  }
}
if (!module.parent) {
  const folderPath = process.cwd()
  const folder = new TreeBaseFolder().setDir(folderPath).setGrammarDir(folderPath)
  new SearchServer(folder).csv(process.argv.slice(2).join(" "))
}

module.exports = { TreeBaseServer, SearchServer }
