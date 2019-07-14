#! /usr/local/bin/node

const fs = require("fs")
const exec = require("child_process").exec
const recursiveReadSync = require("recursive-readdir-sync")

const jtree = require("../index.js")
const project = require("../langs/project/project.js")
const BrowserScript = jtree.Utils.BrowserScript

class Builder {
  buildTreeComponentFramework() {
    const execOptions = { cwd: __dirname + "/../treeComponent/" }
    exec("tsc", execOptions)

    // Now
  }

  _bundleTreeComponentTypeScriptFilesIntoOne() {}

  _bundleBrowserTypeScriptFilesIntoOne() {
    const typeScriptSrcFiles = recursiveReadSync(__dirname + "/../src").filter(file => file.includes(".ts"))
    const projectCode = new jtree.TreeNode(project.getProjectProgram(typeScriptSrcFiles))
    projectCode
      .getTopDownArray()
      .filter(node => node.getFirstWord() === "relative")
      .forEach(node => node.setLine(node.getLine() + ".ts"))
    this.write(__dirname + "/../ignore/jtree.project", projectCode.toString())
    const typeScriptScriptsInOrderBrowserOnly = new project(projectCode.toString()).getOrderedDependenciesArray().filter(file => !file.includes(".node."))

    const combinedTypeScriptScript = typeScriptScriptsInOrderBrowserOnly
      .map(src => this.read(src))
      .map(content =>
        new BrowserScript(content)
          .removeRequires()
          .removeImports()
          .removeExports()
          .getString()
      )
      .join("\n")

    this.write(__dirname + `/../ignore/jtree.browser.ts`, `"use strict"\n` + combinedTypeScriptScript)
  }

  buildBrowserVersion() {
    const execOptions = { cwd: __dirname + "/../" }
    // Compile regular version to make sure no errors:
    exec("tsc", execOptions)

    this._bundleBrowserTypeScriptFilesIntoOne()

    const outputJsFile = __dirname + `/../built/jtree.browser.js`
    exec("tsc -p tsconfig.browser.json", execOptions, (err, stdout, stderr) => {
      if (stderr || err) return console.error(err, stdout, stderr)

      // This solves the wierd TS insertin
      // todo: remove
      const file = new BrowserScript(this.read(outputJsFile).replace("export var jTreeTypes", "var jTreeTypes"))
      this.write(outputJsFile, file.getString())
    })

    this._buildBrowserTestFile()
  }

  _buildBrowserTestFile() {
    const testFile = new BrowserScript(this.read(__dirname + "/../tests/base.test.js"))
      .removeRequires()
      .removeHashBang()
      .removeNodeJsOnlyLines()
      .changeNodeExportsToWindowExports()
      .getString()

    this.write(__dirname + "/../sandbox/base.tests.es6.js", testFile)
  }

  read(path) {
    return fs.readFileSync(path, "utf8")
  }

  write(path, str) {
    return fs.writeFileSync(path, str, "utf8")
  }
}

module.exports = Builder
