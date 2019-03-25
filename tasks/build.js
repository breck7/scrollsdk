#! /usr/local/bin/node

const fs = require("fs")
const recursiveReadSync = require("recursive-readdir-sync")
const jtree = require("../index.js")
const TreeNode = jtree.TreeNode

const ProjectProgram = jtree.getLanguage("project")

const BrowserScript = jtree.Utils.BrowserScript

const outputFile = __dirname + `/../jtree.browser.ts`

const files = recursiveReadSync(__dirname + "/../src").filter(file => file.includes(".ts"))
const projectCode = new TreeNode(ProjectProgram.getProjectProgram(files))
projectCode
  .getTopDownArray()
  .filter(n => n.getKeyword() === "relative")
  .forEach(node => node.setLine(node.getLine() + ".ts"))
fs.writeFileSync(__dirname + "/../jtree.project", projectCode.toString(), "utf8")
const projectProgram = new ProjectProgram(projectCode.toString())
const scripts = projectProgram.getOrderedDependenciesArray().filter(file => !file.includes(".node."))

const combined = scripts
  .map(src => fs.readFileSync(src, "utf8"))
  .map(content =>
    new BrowserScript(content)
      .removeRequires()
      .removeImports()
      .removeExports()
      .getString()
  )
  .join("\n")

fs.writeFileSync(outputFile, `"use strict"\n` + combined, "utf8")
console.log("Now: tsc -p tsconfig.browser.json")
