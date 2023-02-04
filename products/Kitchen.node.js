const express = require("express")
const { readFile } = require("fs")
const path = require("path")
const { TypeScriptRewriter } = require("../products/TypeScriptRewriter.js")
const { Utils } = require("../products/Utils.js")
const { TreeBaseServer } = require("../products/treeBaseServer.node.js")
const { TreeBaseFolder } = require("../products/treeBase.node.js")
class PlanetsDbServer extends TreeBaseServer {
  scrollToHtml(scrollContent) {
    return scrollContent
  }
}
const ignoreFolder = path.join(__dirname, "..", "ignore")
class Kitchen {
  startPlanetsDbServer(port) {
    const databaseFolder = path.join(__dirname, "..", "treeBase", "planets")
    const folder = new TreeBaseFolder()
      .setDir(databaseFolder)
      .setGrammarDir(databaseFolder)
      .loadFolder()
    const treeBaseServer = new PlanetsDbServer(folder, ignoreFolder).initSearch().serveFolder(databaseFolder)
    treeBaseServer.listen(port)
  }
  start(port) {
    const planetsPort = 8080
    const app = express()
    this.startPlanetsDbServer(planetsPort)
    app.get("/*.js", (req, res) => {
      const filename = req.path.substr(1)
      readFile(path.join(__dirname, "..", filename), "utf8", (err, code) => {
        if (err) throw err
        res.send(
          new TypeScriptRewriter(code)
            .removeRequires()
            .removeHashBang()
            .removeNodeJsOnlyLines()
            .changeNodeExportsToWindowExports()
            .getString()
        )
      })
    })
    app.get("/", (req, res) => res.redirect(301, "/sandbox"))
    app.use(express.static(path.join(__dirname, "..")))
    app.listen(port, () =>
      console.log(`Running kitchen from '${__dirname}'.
Use cmd+dblclick to open a site:
Running PlanetsDb on: http://localhost:${planetsPort}/
Running kitchen on: http://localhost:${port}/sandbox`)
    )
  }
}
if (!module.parent) new Kitchen().start(3333)

module.exports = { Kitchen }
