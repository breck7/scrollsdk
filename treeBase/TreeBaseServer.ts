#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const lodash = require("lodash")
const numeral = require("numeral")
const https = require("https")
const express = require("express")
const bodyParser = require("body-parser")

const { Disk } = require("../products/Disk.node.js")
const { Utils } = require("../products/Utils.js")
const { TreeNode } = require("../products/TreeNode.js")

const tqlNode = require("../products/tql.nodejs.js")

const delimitedEscapeFunction = (value: any) => (value.includes("\n") ? value.split("\n")[0] : value)
const delimiter = " DeLiM "

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
    const formats = ["html", "csv", "text", "scroll"]
    if (searchLogFolder) Disk.touch(searchLogPath)
    const searchCache: any = {}
    this.app.get("/search", (req: any, res: any) => {
      const { q } = req.query
      const originalQuery = q === undefined ? "" : q
      const originalFormat = req.query.format
      const format = originalFormat && formats.includes(originalFormat) ? originalFormat : "html"

      if (searchLogFolder) searchServer.logQuery(searchLogPath, originalQuery, req.ip, format)

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

  logQuery(logFilePath: string, originalQuery: string, ip: string, format = "html") {
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

  scroll(treeQLCode: string) {
    const { hits, time, columnNames, errors } = this.search(treeQLCode)
    const { folder } = this
    const results = hits._toDelimited(delimiter, columnNames, delimitedEscapeFunction)

    return `title Search Results
 hidden

viewSourceUrl https://github.com/breck7/jtree/blob/main/treeBase/TreeBaseServer.ts

html <form method="get" action="search" class="tqlForm"><textarea id="tqlInput" name="q"></textarea><input type="submit" value="Search"></form>

html <div id="tqlErrors">${errors}</div>

* Searched ${numeral(folder.length).format("0,0")} files and found ${hits.length} matches in ${time}s. 
 class searchResultsHeader

table ${delimiter}
 ${results.replace(/\n/g, "\n ")}
`
  }

  search(treeQLCode: string) {
    const startTime = Date.now()
    let hits = new TreeNode()
    let errors = ""
    let columnNames: string[] = []
    try {
      const treeQLProgram = new tqlNode(treeQLCode)
      const programErrors = treeQLProgram.scopeErrors.concat(treeQLProgram.getAllErrors())
      if (programErrors.length) throw new Error(programErrors.map((err: any) => err.getMessage()).join(" "))
      const sortBy = treeQLProgram.get("sortBy")
      let rawHits = treeQLProgram.filterFolder(this.folder)
      if (sortBy) {
        const sortByFns = sortBy.split(" ").map((columnName: string) => (file: any) => file.getTypedValue(columnName))
        rawHits = lodash.sortBy(rawHits, sortByFns)
      }
      if (treeQLProgram.has("reverse")) rawHits.reverse()

      const customColumns = (treeQLProgram.get("select") || "").split(" ")
      columnNames = "title titleLink".split(" ").concat(customColumns)
      const selected = rawHits.map((file: any) => {
        const obj = file.selectAsObject(columnNames)
        obj.titleLink = file.webPermalink
        return obj
      })
      hits = new TreeNode(selected)
    } catch (err) {
      errors = err.toString()
    }
    return { hits, time: numeral((Date.now() - startTime) / 1000).format("0.00"), columnNames, errors }
  }

  text(treeQLCode: any) {
    return this.search(treeQLCode).hits.toString()
  }

  csv(treeQLCode: any) {
    const { hits, columnNames } = this.search(treeQLCode)
    return hits.toDelimited(",", columnNames, delimitedEscapeFunction)
  }
}

export { SearchServer, TreeBaseServer }

if (!module.parent) {
  const folderPath = process.cwd()
  const folder = new TreeBaseFolder().setDir(folderPath).setGrammarDir(folderPath)
  new SearchServer(folder).csv(process.argv.slice(2).join(" "))
}
