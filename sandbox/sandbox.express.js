#! /usr/bin/env node

const express = require("express")
const fs = require("fs")
const BrowserScript = require("../index.js").Utils.BrowserScript

const start = port => {
  const app = express()

  app.get("/*.js", (req, res) => {
    const filename = req.path.substr(1)
    fs.readFile(__dirname + "/../" + filename, "utf8", (err, file) => {
      if (err) throw err
      res.send(
        new BrowserScript(file)
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

module.exports = start

if (!module.parent) start(3333)
