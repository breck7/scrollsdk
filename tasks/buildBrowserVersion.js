#! /usr/local/bin/node

const fs = require("fs")
const exec = require("child_process").exec
const recursiveReadSync = require("recursive-readdir-sync")
const jtree = require("../index.js")
const TreeNode = jtree.TreeNode

exec("tsc")

const ProjectProgram = jtree.getLanguage("project")

const BrowserScript = jtree.Utils.BrowserScript

const outputFile = __dirname + `/../jtree.browser.ts`

const files = recursiveReadSync(__dirname + "/../src").filter(file => file.includes(".ts"))
const projectCode = new TreeNode(ProjectProgram.getProjectProgram(files))
projectCode
  .getTopDownArray()
  .filter(n => n.getKeyword() === "relative")
  .forEach(node => node.setLine(node.getLine() + ".ts"))
fs.writeFileSync(__dirname + "/../ignore/jtree.project", projectCode.toString(), "utf8")
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

// Compile test file:
fs.writeFileSync(
  __dirname + `/../sandbox/base.test.js`,
  "// WARNING: COMPILED FILE.\n" +
    new BrowserScript(fs.readFileSync(__dirname + "/../tests/base.test.js", "utf8"))
      .removeRequires()
      .removeHashBang()
      .removeNodeJsOnlyLines()
      .changeNodeExportsToWindowExports()
      .getString(),
  "utf8"
)

exec("tsc -p tsconfig.browser.json")
