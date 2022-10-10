const express = require("express")
const { readFile } = require("fs")
const path = require("path")
import { treeNotationTypes } from "../products/treeNotationTypes"

const { TypeScriptRewriter } = require("../products/TypeScriptRewriter.js")

class Kitchen {
  start(port: treeNotationTypes.portNumber) {
    const app = express()

    app.get("/*.js", (req: any, res: any) => {
      const filename = req.path.substr(1)
      readFile(path.join(__dirname, "..", filename), "utf8", (err: any, code: treeNotationTypes.typeScriptCode) => {
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

    app.get("/", (req: any, res: any) => res.redirect(301, "/sandbox"))

    app.use(express.static(path.join(__dirname, "..")))

    app.listen(port, () => console.log(`Running kitchen from '${__dirname}'. cmd+dblclick: http://localhost:${port}/sandbox`))
  }
}

if (!module.parent) new Kitchen().start(3333)

export { Kitchen }
