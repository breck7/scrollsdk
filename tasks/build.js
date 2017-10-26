#! /usr/local/bin/node

const fs = require("fs")
const recursiveReadSync = require("recursive-readdir-sync")
const ProjectProgram = require("project-lang")

const BrowserScript = require("./BrowserScript.js")

const outputFile = __dirname + `/../treeprogram.browser.js`

const files = recursiveReadSync(__dirname + "/../src").filter(file => file.includes(".js"))
const projectProgram = ProjectProgram.getProjectProgram(files)
const scripts = projectProgram
  .getOrderedDependenciesArray()
  .filter(file => !file.includes("AbstractNodeJsNode.js"))
  .filter(file => !file.includes("TreeGrammarProgram.js"))

const combined = scripts
  .map(src => fs.readFileSync(src, "utf8"))
  .map(content =>
    new BrowserScript(content)
      .removeRequires()
      .changeNodeExportsToWindowExports()
      .getString()
  )
  .join("\n")

fs.writeFileSync(outputFile, `"use strict"\n` + combined, "utf8")
