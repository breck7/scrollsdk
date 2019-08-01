const jtree = require("../index.js")

class AbstractBuilder extends jtree.TreeNode {
  _bundleBrowserTypeScriptFilesIntoOne(typeScriptSrcFiles, outputFilePath) {
    const project = this.require("project", __dirname + "/../langs/project/project.js")
    const projectCode = new jtree.TreeNode(project.makeProjectProgramFromArrayOfScripts(typeScriptSrcFiles))
    projectCode
      .getTopDownArray()
      .filter(node => node.getFirstWord() === "relative")
      .forEach(node => node.setLine(node.getLine() + ".ts"))
    const projectFilePath = outputFilePath + ".project"
    this._write(projectFilePath, projectCode.toString()) // Write to disk to inspect if something goes wrong.
    const typeScriptScriptsInOrderBrowserOnly = new project(projectCode.toString())
      .getScriptPathsInCorrectDependencyOrder()
      .filter(file => !file.includes(".node."))

    const combinedTypeScriptScript = this._combineTypeScriptFiles(typeScriptScriptsInOrderBrowserOnly)

    this._write(outputFilePath, `"use strict"\n` + combinedTypeScriptScript)
  }

  _combineTypeScriptFiles(typeScriptScriptsInOrderBrowserOnly) {
    return typeScriptScriptsInOrderBrowserOnly
      .map(src => this._read(src))
      .map(content =>
        new AbstractBuilder.BrowserScript(content)
          .removeRequires()
          .removeImports()
          .changeDefaultExportsToWindowExports()
          .removeExports()
          .getString()
      )
      .join("\n")
  }

  _readJson(path) {
    return JSON.parse(this._read(path))
  }

  _writeJson(path, obj) {
    this._write(path, JSON.stringify(obj, null, 2))
  }

  _updatePackageJson(packagePath, newVersion) {
    const packageJson = this._readJson(packagePath)
    packageJson.version = newVersion
    this._writeJson(packagePath, packageJson)
    console.log(`Updated ${packagePath} to ${newVersion}`)
  }

  _read(path) {
    const fs = this.require("fs")
    return fs.readFileSync(path, "utf8")
  }

  _write(path, str) {
    const fs = this.require("fs")
    return fs.writeFileSync(path, str, "utf8")
  }

  _help(filePath = process.argv[1]) {
    const commands = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(word => !word.startsWith("_") && word !== "constructor")
    return `${commands.length} commands in ${filePath}:\n${commands.join("\n")}`
  }

  _main() {
    const action = process.argv[2]
    const paramOne = process.argv[3]
    const paramTwo = process.argv[4]

    if (this[action]) {
      this[action](paramOne, paramTwo)
    } else if (!action) {
      print(this._help())
    } else print(`Unknown command '${action}'. Type 'jtree build' to see available commands.`)
  }
}

// todo: cleanup
AbstractBuilder.BrowserScript = jtree.Utils.BrowserScript

module.exports = AbstractBuilder
