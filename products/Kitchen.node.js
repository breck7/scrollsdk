const express = require("express")
const { readFile } = require("fs")
const { TypeScriptRewriter } = require("../products/TypeScriptRewriter.js")
class Kitchen {
  start(port) {
    const app = express()
    app.get("/*.js", (req, res) => {
      const filename = req.path.substr(1)
      readFile(__dirname + "/../" + filename, "utf8", (err, code) => {
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
    app.use(express.static(__dirname + "/../"))
    app.listen(port, () => {
      console.log(`Running kitchen from '${__dirname}'. cmd+dblclick: http://localhost:${port}/sandbox`)
    })
  }
}

module.exports = { Kitchen }
