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
  constructor(treeBaseFolder: TreeBaseFolder) {
    this.folder = treeBaseFolder
  }

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

  scroll(treeQLCode: string) {
    const { hits, time } = this.search(treeQLCode)
    const { folder } = this
    const escapedQuery = Utils.htmlEscaped(treeQLCode)
    const results = hits.map((file: TreeBaseFile) => ` <div class="searchResultFullText"><a href="${file.webPermalink}">${file.title}</a> - ${file.get("type")} #${file.rank}</div>`).join("\n")

    return `title Search Results
 hidden

viewSourceUrl https://github.com/breck7/jtree/blob/main/treeBase/TreeBaseServer.ts

html <form method="get" action="search" class="tqlForm"><textarea id="tqlInput" name="q"></textarea><input type="submit" value="Search"></form>

html <script>document.addEventListener("DOMContentLoaded", evt => document.getElementById("tqlInput").value = decodeURIComponent("${encodeURIComponent(treeQLCode)}"))</script>

* ${hits.length} of ${numeral(folder.length).format("0,0")} files matched. Search took ${time}s. 
 class searchResultsHeader

html <hr>

html
 ${results}

html <hr>`
  }

  search(treeQLCode: string) {
    const treeQLProgram = new tqlNode(treeQLCode)
    const startTime = Date.now()
    const hits = treeQLProgram.filterFolder(this.folder)
    const time = numeral((Date.now() - startTime) / 1000).format("0.00")
    return { hits, time }
  }

  json(treeQLCode: any) {
    return new TreeNode(this.search(treeQLCode).hits).toJSON()
  }

  csv(treeQLCode: any) {
    return new TreeNode(this.search(treeQLCode).hits).toDelimited(",")
  }
}

export { SearchServer, TreeBaseServer }

if (!module.parent) {
  const folderPath = process.cwd()
  const folder = new TreeBaseFolder().setDir(folderPath).setGrammarDir(folderPath)
  new SearchServer(folder).csv(process.argv.slice(2).join(" "))
}
