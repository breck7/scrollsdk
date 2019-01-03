#! /usr/local/bin/node

const express = require("express")
const fs = require("fs")
const BrowserScript = require("./BrowserScript.js")

const app = express()

app.get("/*.js", (req, res) => {
  const filename = req.path.substr(1)
  fs.readFile(__dirname + "/" + filename, "utf8", (err, file) => {
    if (err) throw err
    res.send(
      new BrowserScript(file)
        .removeRequires()
        .changeNodeExportsToWindowExports()
        .getString()
    )
  })
})

app.use(express.static(__dirname))

const port = 8765
app.listen(port, () => {
  console.log(`Running sandbox. cmd+dblclick: http://localhost:${port}/sandbox`)
})
