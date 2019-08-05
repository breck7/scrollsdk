//tooling product SandboxServer.node.js

const express = require("express")
const { readFile } = require("fs")
import jTreeTypes from "../core/jTreeTypes"

import { TypeScriptRewriter } from "../builder/TypeScriptRewriter"

class SandboxServer {
  start(port: jTreeTypes.portNumber) {
    const app = express()

    app.get("/*.js", (req: any, res: any) => {
      const filename = req.path.substr(1)
      readFile(__dirname + "/../" + filename, "utf8", (err: any, code: jTreeTypes.typeScriptCode) => {
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

export { SandboxServer }
