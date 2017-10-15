#! /usr/local/bin/node

const recursiveReadSync = require("recursive-readdir-sync")
const fs = require("fs")
const BrowserScript = require("./BrowserScript.js")

const outputFile = __dirname + `/../treeprogram.browser.js`

const ProjectProgram = require("/aientist/project/ProjectProgram.js")
const files = recursiveReadSync(__dirname + "/../src")
  .filter(file => file.includes(".js"))
  .filter(file => !file.includes(".test.js"))
const projectProgram = ProjectProgram.getProjectProgram(files)
const scripts = projectProgram
  .getOrderedDependenciesArray()
  .filter(file => !file.includes("AbstractNodeJsNode.js"))
  .filter(file => !file.includes("StressTest.js"))

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
