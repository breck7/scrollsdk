const express = require("express")
const { readFile } = require("fs")
const path = require("path")
const { TypeScriptRewriter } = require("../products/TypeScriptRewriter.js")
const { Utils } = require("../products/Utils.js")
const ignoreFolder = path.join(__dirname, "..", "ignore")
class Kitchen {
  start(port) {
    const app = express()
    app.get("/*.js", (req, res) => {
      const filename = req.path.substr(1)
      readFile(path.join(__dirname, "..", filename), "utf8", (err, code) => {
        if (err) throw err
        res.send(new TypeScriptRewriter(code).removeRequires().removeHashBang().removeNodeJsOnlyLines().changeNodeExportsToWindowExports().getString())
      })
    })
    app.get("/", (req, res) => res.redirect(301, "/sandbox"))
    app.use(express.static(path.join(__dirname, "..")))
    app.listen(port, () =>
      console.log(`Running kitchen from '${__dirname}'.
Use cmd+dblclick to open a site:
Running kitchen on: http://localhost:${port}/sandbox`)
    )
  }
}
if (!module.parent) new Kitchen().start(3333)

module.exports = { Kitchen }
