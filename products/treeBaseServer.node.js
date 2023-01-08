const fs = require("fs")
const path = require("path")
const numeral = require("numeral")
const https = require("https")
const express = require("express")
const bodyParser = require("body-parser")
const { jtree } = require("../index.js")
const { Disk } = require("../products/Disk.node.js")
const { TreeNode, Utils } = jtree
class TreeBaseServer {
  constructor(folder, websitePath = "", searchLogFolder = "") {
    this.folder = folder
    this.websitePath = websitePath
    this.homepage = Disk.read(path.join(this.websitePath, "index.html"))
    const app = express()
    this.app = app
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type")
      res.setHeader("Access-Control-Allow-Credentials", true)
      next()
    })
    app.get("/", (req, res) => res.send(this.homepage))
    app.use(express.static(__dirname))
    if (websitePath) app.use(express.static(websitePath))
    const searchServer = new SearchServer(folder)
    this.searchServer = searchServer
    const searchLogPath = path.join(searchLogFolder, "searchLog.tree")
    if (searchLogFolder) Disk.touch(searchLogPath)
    const searchHTMLCache = {}
    app.get("/search", (req, res) => {
      var _a
      const originalQuery = (_a = req.query.q) !== null && _a !== void 0 ? _a : ""
      if (searchLogFolder) searchServer.logQuery(searchLogPath, originalQuery, req.ip)
      if (!searchHTMLCache[originalQuery]) searchHTMLCache[originalQuery] = this.scrollToHtml(searchServer.search(originalQuery, "html", ["id", "title", "type", "appeared"], "id"))
      res.send(searchHTMLCache[originalQuery])
    })
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
  constructor(treeBaseFolder, searchUrl = "search") {
    this.folder = treeBaseFolder
    this.searchUrl = searchUrl
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
  search(originalQuery, format = "html", columns = ["id"], idColumnName = "id") {
    const query = decodeURIComponent(originalQuery)
    const startTime = Date.now()
    const { folder } = this
    const lowerCaseQuery = query.toLowerCase()
    // Todo: allow advanced search. case sensitive/insensitive, regex, et cetera.
    const testFn = str => str.includes(lowerCaseQuery)
    const escapedQuery = Utils.htmlEscaped(lowerCaseQuery)
    const fullTextHits = folder.filter(file => testFn(file.lowercase))
    const nameHits = folder.filter(file => file.lowercaseNames.some(testFn))
    if (format === "namesOnly") return fullTextHits.map(file => file.id)
    if (format === "csv") {
      nameHits.map(file => file.set(idColumnName, file.id))
      fullTextHits.map(file => file.set(idColumnName, file.id))
      console.log(`## ${nameHits.length} name hits`)
      console.log(new TreeNode(nameHits).toDelimited(",", columns))
      console.log(``)
      console.log(`## ${fullTextHits.length} full text hits`)
      console.log(new TreeNode(fullTextHits).toDelimited(",", columns))
      return
    }
    const highlightHit = file => {
      const line = file.lowercase.split("\n").find(line => testFn(line))
      return line.replace(lowerCaseQuery, `<span class="highlightHit">${lowerCaseQuery}</span>`)
    }
    const fullTextSearchResults = fullTextHits.map(file => ` <div class="searchResultFullText"><a href="${file.webPermalink}">${file.title}</a> - ${file.get("type")} #${file.rank} - ${highlightHit(file)}</div>`).join("\n")
    const nameResults = nameHits.map(file => ` <div class="searchResultName"><a href="${file.webPermalink}">${file.title}</a> - ${file.get("type")} #${file.rank}</div>`).join("\n")
    const time = numeral((Date.now() - startTime) / 1000).format("0.00")
    return `
title ${escapedQuery} - Search
 hidden

viewSourceUrl https://github.com/breck7/jtree/blob/main/treeBase/TreeBaseServer.ts

html
 <div class="treeBaseSearchForm"><form style="display:inline;" method="get" action="${
   this.searchUrl
 }"><input name="q" placeholder="Search" autocomplete="off" type="search" id="searchFormInput"><input class="searchButton" type="submit" value="Search"></form></div>
 <script>document.addEventListener("DOMContentLoaded", evt => initSearchAutocomplete("searchFormInput"))</script>

* <p class="searchResultsHeader">Searched ${numeral(folder.length).format("0,0")} files for "${escapedQuery}" in ${time}s.</p>
 <hr>

* <p class="searchResultsHeader">Showing ${nameHits.length} files whose name or aliases matched.</p>

html
${nameResults}
<hr>

* <p class="searchResultsHeader">Showing ${fullTextHits.length} files who matched on a full text search.</p>

html
 ${fullTextSearchResults}`
  }
}
if (!module.parent) {
  const folderPath = process.cwd()
  const folder = new TreeBaseFolder().setDir(folderPath).setGrammarDir(folderPath)
  new SearchServer(folder).search(process.argv.slice(2).join(" "), "csv")
}

module.exports = { TreeBaseServer, SearchServer }
