#! /usr/local/bin/node

const fs = require("fs")
const exec = require("child_process").exec
const recursiveReadSync = require("recursive-readdir-sync")
const jtree = require("../index.js")
const TreeNode = jtree.TreeNode

exec("tsc")

const ProjectProgram = require("../langs/project/Project.js").Program

const BrowserScript = jtree.Utils.BrowserScript

const outputFile = __dirname + `/../ignore/jtree.browser.ts`

const files = recursiveReadSync(__dirname + "/../src").filter(file => file.includes(".ts"))
const projectCode = new TreeNode(ProjectProgram.getProjectProgram(files))
projectCode
  .getTopDownArray()
  .filter(n => n.getFirstWord() === "relative")
  .forEach(node => node.setLine(node.getLine() + ".ts"))
fs.writeFileSync(__dirname + "/../ignore/jtree.project", projectCode.toString(), "utf8")
const projectProgram = new ProjectProgram(projectCode.toString())
const typeScriptScripts = projectProgram.getOrderedDependenciesArray().filter(file => !file.includes(".node."))

const combinedTypeScriptScript = typeScriptScripts
  .map(src => fs.readFileSync(src, "utf8"))
  .map(content =>
    new BrowserScript(content)
      .removeRequires()
      .removeImports()
      .removeExports()
      .getString()
  )
  .join("\n")

fs.writeFileSync(outputFile, `"use strict"\n` + combinedTypeScriptScript, "utf8")

exec("tsc -p tsconfig.browser.json", (err, stdout, stderr) => {
  if (stderr || err) console.error(err, stdout, stderr)
})
