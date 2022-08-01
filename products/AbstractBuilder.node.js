//onsave jtree build produce AbstractBuilder.node.js
const fs = require("fs")
const { execSync } = require("child_process")
const express = require("express")
const { jtree } = require("../index.js")
const { TypeScriptRewriter } = require("../products/TypeScriptRewriter.js")
const { Disk } = require("../products/Disk.node.js")
const registeredExtensions = { js: "//", maia: "doc.tooling ", ts: "//", grammar: "tooling ", gram: "tooling " }
class AbstractBuilder extends jtree.TreeNode {
  _typeScriptToJavascript(sourceCode, forBrowser = false) {
    const ts = require("typescript")
    // downlevelIteration: true, // todo: what is this again?
    const tsConfig = {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: "es2017", noImplicitAny: true }
    }
    if (forBrowser) {
      tsConfig.compilerOptions.moduleResolution = "node"
      tsConfig.compilerOptions.lib = ["es2017", "dom"]
    } else {
      tsConfig.compilerOptions.tiles = ["node"]
      tsConfig.compilerOptions.lib = ["es2017"]
    }
    const result = ts.transpileModule(sourceCode, tsConfig)
    return result.outputText
  }
  _combineTypeScriptFilesForNode(typeScriptScriptsInOrder) {
    // todo: prettify
    return typeScriptScriptsInOrder
      .map(src => Disk.read(src))
      .map(content =>
        new TypeScriptRewriter(content)
          //.removeRequires()
          .removeImports()
          .removeExports()
          .removeHashBang()
          .getString()
      )
      .join("\n")
  }
  _prettifyFile(path) {
    Disk.write(path, require("prettier").format(Disk.read(path), { semi: false, parser: "babel", printWidth: 240 }))
  }
  _combineTypeScriptFilesForBrowser(typeScriptScriptsInOrder) {
    return typeScriptScriptsInOrder
      .map(src => Disk.read(src))
      .map(content =>
        new TypeScriptRewriter(content)
          .removeRequires()
          .removeImports()
          .removeHashBang()
          .removeNodeJsOnlyLines()
          .changeDefaultExportsToWindowExports()
          .removeExports()
          .getString()
      )
      .join("\n")
  }
  _buildTsc(sourceCode, outputFilePath, forBrowser = false) {
    Disk.write(outputFilePath, this._typeScriptToJavascript(sourceCode, forBrowser))
  }
  _startServer(port, folder) {
    const app = express()
    app.listen(port, () => {
      console.log(`Running builder. cmd+dblclick: http://localhost:${port}/`)
    })
    this._startListeningForFileChanges(folder)
  }
  _isProjectFile(path) {
    return !path.includes("node_modules") && !path.includes("products") && !path.includes(".git")
  }
  _onFileChanged(fullPath) {
    console.log(`SAVED ${fullPath}`)
    if (!this._isProjectFile(fullPath)) {
      console.log(` SKIP not a project file.`)
      console.log(` DONE`)
      return true
    }
    const fileExtension = jtree.Utils.getFileExtension(fullPath)
    const commentPrefix = registeredExtensions[fileExtension]
    if (!commentPrefix) {
      console.log(` SKIP not a registered extension.`)
      console.log(` DONE`)
      return true
    }
    const prefix = commentPrefix + "onsave"
    if (!Disk.exists(fullPath)) {
      console.log(` SKIP file deleted`)
      console.log(` DONE`)
      return
    } else {
      const lines = Disk.read(fullPath).split("\n")
      let line = lines.shift()
      if (!line.startsWith(prefix)) console.log(` SKIP no tasks`)
      while (line.startsWith(prefix)) {
        const command = line.substr(prefix.length + 1)
        const folder = jtree.Utils.getParentFolder(fullPath)
        console.log(` COMMAND ${command}`)
        const time = Date.now()
        execSync(command, { cwd: folder, encoding: "utf8" })
        console.log(` FINISHED ${Date.now() - time}ms`)
        line = lines.shift()
      }
      console.log(` DONE`)
    }
  }
  _startListeningForFileChanges(folder) {
    const projectFolders = [folder] // todo
    this._fsWatchers = projectFolders.map(folder =>
      fs.watch(folder, { recursive: true }, (event, filename) => {
        this._onFileChanged(folder + filename)
      })
    )
  }
  // todo: cleanup
  _getOutputFilePath(outputFileName) {
    return __dirname + "/../products/" + outputFileName
  }
  async _produceBrowserProductFromTypeScript(files = [], outputFileName, transformFn) {
    const outputFilePath = this._getOutputFilePath(outputFileName)
    await this._buildTsc(this._combineTypeScriptFilesForBrowser(files), outputFilePath, true)
    Disk.write(outputFilePath, transformFn(Disk.read(outputFilePath)))
    this._prettifyFile(outputFilePath)
  }
  produceProductFromInstructionsTree(productNode, projectRootPath) {
    const outputFileName = productNode.get("outputFileName")
    const inputFiles = productNode
      .getNode("files")
      .getWordsFrom(1)
      .map(path => projectRootPath + "/" + path)
    const firstLine = productNode.get("firstLine") ? productNode.get("firstLine") + "\n" : ""
    const lastLine = productNode.get("lastLine") ? productNode.get("lastLine") : ""
    const removeAll = productNode.getNodesByGlobPath("removeAll")
    const transformFn = code => {
      removeAll.forEach(node => {
        code = jtree.Utils.removeAll(code, node.getContent())
      })
      return firstLine + code + "\n" + lastLine
    }
    if (productNode.getLine() === "browserProduct") this._produceBrowserProductFromTypeScript(inputFiles, outputFileName, transformFn)
    else this._produceNodeProductFromTypeScript(inputFiles, outputFileName, transformFn)
    if (productNode.has("executable")) Disk.makeExecutable(projectRootPath + "/products/" + outputFileName)
  }
  _getProductFolder() {
    return __dirname
  }
  _getBundleFilePath(outputFileName) {
    return this._getProductFolder() + `${outputFileName.replace(".js", ".ts")}`
  }
  async _produceNodeProductFromTypeScript(files, outputFileName, transformFn) {
    const outputFilePath = this._getOutputFilePath(outputFileName)
    try {
      await this._buildTsc(this._combineTypeScriptFilesForNode(files), outputFilePath, false)
      Disk.write(outputFilePath, transformFn(Disk.read(outputFilePath)))
      this._prettifyFile(outputFilePath)
    } catch (error) {
      console.log(error)
    }
    return outputFilePath
  }
  _updatePackageJson(packagePath, newVersion) {
    const packageJson = Disk.readJson(packagePath)
    packageJson.version = newVersion
    Disk.writeJson(packagePath, packageJson)
    console.log(`Updated ${packagePath} to ${newVersion}`)
  }
  buildBuilder() {
    this._buildTsc(Disk.read(__filename), __dirname + "/builder.js")
  }
  makeGrammarFileTestTree(grammarPath) {
    // todo: can we ditch these dual tests at some point? ideally Grammar should be bootstrapped correct?
    const testTree = {}
    const checkGrammarFile = (equal, program) => {
      // Act
      const errs = program.getAllErrors()
      if (errs.length) console.log(errs.join("\n"))
      //Assert
      equal(errs.length, 0, "should be no errors")
    }
    const handGrammarProgram = new jtree.HandGrammarProgram(Disk.read(grammarPath))
    testTree[`grammarCheckOf${grammarPath}`] = equal => checkGrammarFile(equal, jtree.compileGrammarAndCreateProgram(grammarPath, __dirname + "/../langs/grammar/grammar.grammar"))
    testTree[`handGrammarCheckOf${grammarPath}`] = equal => checkGrammarFile(equal, handGrammarProgram)
    Object.assign(testTree, handGrammarProgram.examplesToTestBlocks())
    return testTree
  }
  _help(filePath = process.argv[1]) {
    const commands = this._getAllCommands()
    return `${commands.length} commands in ${filePath}:\n${commands.join("\n")}`
  }
  _getAllCommands() {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(word => !word.startsWith("_") && word !== "constructor")
      .sort()
  }
  _getPartialMatches(commandName) {
    return this._getAllCommands().filter(item => item.startsWith(commandName))
  }
  main(command, paramOne, paramTwo) {
    const print = console.log
    const builder = this
    const partialMatches = this._getPartialMatches(command)
    if (builder[command]) {
      builder[command](paramOne, paramTwo)
    } else if (!command) {
      print(this._help())
    } else if (partialMatches.length > 0) {
      if (partialMatches.length === 1) builder[partialMatches[0]](paramOne, paramTwo)
      else print(`Multiple matches for '${command}'. Options are:\n${partialMatches.join("\n")}`)
    } else print(`Unknown command '${command}'. Type 'jtree build' to see available commands.`)
  }
}

module.exports = { AbstractBuilder }
