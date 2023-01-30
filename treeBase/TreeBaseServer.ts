#!/usr/bin/env node

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

import { TreeBaseFolder, TreeBaseFile } from "./TreeBase"

class TreeBaseServer {
  folder: TreeBaseFolder
  app: any
  searchServer: SearchServer

  constructor(folder: TreeBaseFolder) {
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
    app.use((req: any, res: any, next: any) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type")
      res.setHeader("Access-Control-Allow-Credentials", true)
      next()
    })
  }

  serveFolder(folder: string) {
    this.app.use(express.static(folder))
    return this
  }

  initSearch(searchLogFolder = "") {
    const searchServer = new SearchServer(this.folder)
    this.searchServer = searchServer
    const searchLogPath = path.join(searchLogFolder, "searchLog.tree")
    if (searchLogFolder) Disk.touch(searchLogPath)
    const searchHTMLCache: any = {}
    this.app.get("/search", (req: any, res: any) => {
      const originalQuery = req.query.q === undefined ? "" : req.query.q

      if (searchLogFolder) searchServer.logQuery(searchLogPath, originalQuery, req.ip)

      if (searchHTMLCache[originalQuery]) return res.send(searchHTMLCache[originalQuery])

      const decodedQuery = decodeURIComponent(originalQuery).replace(/\r/g, "")
      const treeQLProgram = new tqlNode(decodedQuery)
      const hasErrors = treeQLProgram.getAllErrors().length > 0

      const results = !hasErrors ? searchServer.treeQueryLanguageSearch(treeQLProgram) : searchServer.search(decodedQuery, "html", ["id", "title", "type", "appeared"], "id")
      searchHTMLCache[originalQuery] = this.scrollToHtml(results)
      res.send(searchHTMLCache[originalQuery])
    })
    return this
  }

  listen(port = 4444) {
    this.app.listen(port, () => console.log(`TreeBase server running: \ncmd+dblclick: http://localhost:${port}/`))
    return this
  }

  // Currently you need to override in your app
  scrollToHtml(scrollContent: string) {
    return scrollContent
  }

  listenProd(pemPath: string) {
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
    redirectApp.use((req: any, res: any) => res.redirect(301, `https://${req.headers.host}${req.url}`))
    redirectApp.listen(80, () => console.log(`Running redirect app`))
    return this
  }
}

class SearchServer {
  constructor(treeBaseFolder: TreeBaseFolder, searchUrl = "search") {
    this.folder = treeBaseFolder
    this.searchUrl = searchUrl
  }

  searchUrl: string
  folder: TreeBaseFolder

  logQuery(logFilePath: string, originalQuery: string, ip: string) {
    const tree = `search
 time ${Date.now()}
 ip ${ip}
 query
  ${originalQuery.replace(/\n/g, "\n  ")} 
`
    fs.appendFile(logFilePath, tree, function() {})
    return this
  }

  treeQueryLanguageSearch(treeQLProgram: any): string {
    const startTime = Date.now()
    const escapedQuery = Utils.htmlEscaped(treeQLProgram.toString())
    const hits = treeQLProgram.filterFolder(this.folder)
    const results = hits.map((file: TreeBaseFile) => ` <div class="searchResultFullText"><a href="${file.webPermalink}">${file.title}</a> - ${file.get("type")} #${file.rank}</div>`).join("\n")
    const time = numeral((Date.now() - startTime) / 1000).format("0.00")
    return this.searchResultsPage(
      escapedQuery,
      time,
      `html <hr>
* ${hits.length} matching files.
 class searchResultsHeader
html
 ${results}`
    )
  }

  searchResultsPage(escapedQuery: string, time: string, results: string) {
    const { folder } = this
    return `
title ${escapedQuery} - Search
 hidden

viewSourceUrl https://github.com/breck7/jtree/blob/main/treeBase/TreeBaseServer.ts

html
 <div class="treeBaseSearchForm"><form style="display:inline;" method="get" action="${
   this.searchUrl
 }"><textarea name="q" placeholder="Search" autocomplete="off" type="search" rows="3" cols="50"></textarea><input class="searchButton" type="submit" value="Search"></form></div>

* Searched ${numeral(folder.length).format("0,0")} files for "${escapedQuery}" in ${time}s.
 class searchResultsHeader

${results}`
  }

  search(query: string, format = "html", columns = ["id"], idColumnName = "id"): string {
    const startTime = Date.now()
    const { folder } = this
    const lowerCaseQuery = query.toLowerCase()
    // Todo: allow advanced search. case sensitive/insensitive, regex, et cetera.
    const testFn = (str: string) => str.includes(lowerCaseQuery)

    const escapedQuery = Utils.htmlEscaped(lowerCaseQuery)
    const fullTextHits = folder.filter((file: TreeBaseFile) => testFn(file.lowercase))
    const nameHits = folder.filter((file: TreeBaseFile) => file.lowercaseNames.some(testFn))

    if (format === "namesOnly") return fullTextHits.map((file: TreeBaseFile) => file.id)

    if (format === "csv") {
      nameHits.map((file: TreeBaseFile) => file.set(idColumnName, file.id))
      fullTextHits.map((file: TreeBaseFile) => file.set(idColumnName, file.id))

      console.log(`## ${nameHits.length} name hits`)
      console.log(new TreeNode(nameHits).toDelimited(",", columns))

      console.log(``)

      console.log(`## ${fullTextHits.length} full text hits`)
      console.log(new TreeNode(fullTextHits).toDelimited(",", columns))
      return
    }

    const highlightHit = (file: TreeBaseFile) => {
      const line = file.lowercase.split("\n").find((line: string) => testFn(line))
      return line.replace(lowerCaseQuery, `<span class="highlightHit">${lowerCaseQuery}</span>`)
    }
    const fullTextSearchResults = fullTextHits.map((file: TreeBaseFile) => ` <div class="searchResultFullText"><a href="${file.webPermalink}">${file.title}</a> - ${file.get("type")} #${file.rank} - ${highlightHit(file)}</div>`).join("\n")

    const nameResults = nameHits.map((file: TreeBaseFile) => ` <div class="searchResultName"><a href="${file.webPermalink}">${file.title}</a> - ${file.get("type")} #${file.rank}</div>`).join("\n")

    const time = numeral((Date.now() - startTime) / 1000).format("0.00")
    return this.searchResultsPage(
      escapedQuery,
      time,
      `
html <hr>
* Showing ${nameHits.length} files whose name or aliases matched.
 class searchResultsHeader
html
${nameResults}

html <hr>
* Showing ${fullTextHits.length} files who matched on a full text search.
 class searchResultsHeader
html
 ${fullTextSearchResults}`
    )
  }
}

export { SearchServer, TreeBaseServer }

if (!module.parent) {
  const folderPath = process.cwd()
  const folder = new TreeBaseFolder().setDir(folderPath).setGrammarDir(folderPath)
  new SearchServer(folder).search(process.argv.slice(2).join(" "), "csv")
}
