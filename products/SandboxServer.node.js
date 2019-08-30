const express = require("express")
const { readFile } = require("fs")
const { TypeScriptRewriter } = require("../products/TypeScriptRewriter.js")
class SandboxServer {
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
    app.use(express.static(__dirname + "/../"))
    app.listen(port, () => {
      console.log(`Running sandbox. cmd+dblclick: http://localhost:${port}/sandbox`)
    })
  }
}

module.exports = { SandboxServer }
