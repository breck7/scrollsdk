#! /usr/local/bin/node

const express = require("express")
const fs = require("fs")
const app = express()
const browserfy = require("./browserfy.js")

app.get("/*.js", (req, res) => {
  const filename = req.path.substr(1)
  fs.readFile(filename, "utf8", (err, file) => {
    if (err) throw err
    res.send(browserfy(file))
  })
})

app.use(express.static("."))

const port = 8888
app.listen(port, () => {
  console.log(`Running. cmd+dblclick: http://localhost:${port}/test.html`)
})
