#! /usr/local/bin/node

const browserfy = require("./browserfy.js")
const fs = require("fs")

const outputFile = __dirname + `/../treeprogram.browser.js`
const browserVersion = ["AbstractBrowserNode.js", "ImmutableNode.js", "MutableNode.js", "TreeProgram.js"]
  .map(filename => __dirname + `/../src/${filename}`)
  .map(src => fs.readFileSync(src, "utf8"))
  .map(content => browserfy(content))
  .join("\n")
  .replace(/"use strict"\n/g, "")

fs.writeFileSync(outputFile, `"use strict"\n` + browserVersion, "utf8")
