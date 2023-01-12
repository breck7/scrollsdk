#!/usr/bin/env ts-node

const recursiveReadSync = require("recursive-readdir-sync")

const { TreeNode } = require("./products/TreeNode.js")
const { TypeScriptRewriter } = require("./products/TypeScriptRewriter.js")
const { Disk } = require("./products/Disk.node.js")
const { Utils } = require("./products/Utils.js")
const { HandGrammarProgram } = require("./products/GrammarLanguage.js")
const { TestRacer } = require("./products/TestRacer.node.js")
const { GrammarCompiler } = require("./products/GrammarCompiler.js")
const path = require("path")
const fs = require("fs")
const { execSync } = require("child_process")
const express = require("express")

import { treeNotationTypes } from "./products/treeNotationTypes"

const registeredExtensions: treeNotationTypes.stringMap = { js: "//", maia: "doc.tooling ", ts: "//", grammar: "tooling ", gram: "tooling " }

class Builder extends TreeNode {
  private _typeScriptToJavascript(sourceCode: string, forBrowser = false) {
    const ts = require("typescript")
    // downlevelIteration: true, // todo: what is this again?
    const tsConfig: any = {
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

  private _combineTypeScriptFilesForNode(typeScriptScriptsInOrder: treeNotationTypes.typeScriptFilePath[]) {
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

  private _prettifyFile(path: treeNotationTypes.filepath) {
    Disk.write(path, require("prettier").format(Disk.read(path), { semi: false, parser: "babel", printWidth: 240 }))
  }

  private _combineTypeScriptFilesForBrowser(typeScriptScriptsInOrder: treeNotationTypes.typeScriptFilePath[]) {
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

  private _buildTsc(sourceCode: string, outputFilePath: string, forBrowser = false) {
    Disk.write(outputFilePath, this._typeScriptToJavascript(sourceCode, forBrowser))
  }

  protected _startServer(port: treeNotationTypes.portNumber, folder: string) {
    const app = express()
    app.listen(port, () => {
      console.log(`Running builder. cmd+dblclick: http://localhost:${port}/`)
    })
    this._startListeningForFileChanges(folder)
  }

  private _isProjectFile(path: string) {
    return !path.includes("node_modules") && !path.includes("products") && !path.includes(".git")
  }

  private _onFileChanged(fullPath: string) {
    console.log(`SAVED ${fullPath}`)
    if (!this._isProjectFile(fullPath)) {
      console.log(` SKIP not a project file.`)
      console.log(` DONE`)
      return true
    }

    const fileExtension = Utils.getFileExtension(fullPath)
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
        const folder = Utils.getParentFolder(fullPath)
        console.log(` COMMAND ${command}`)
        const time = Date.now()
        execSync(command, { cwd: folder, encoding: "utf8" })
        console.log(` FINISHED ${Date.now() - time}ms`)
        line = lines.shift()
      }
      console.log(` DONE`)
    }
  }

  protected _fsWatchers: any
  private _startListeningForFileChanges(folder: string) {
    const projectFolders = [folder] // todo

    this._fsWatchers = projectFolders.map(folder =>
      fs.watch(folder, { recursive: true }, (event: any, filename: treeNotationTypes.fileName) => {
        this._onFileChanged(folder + filename)
      })
    )
  }

  // todo: cleanup
  _getOutputFilePath(outputFileName: string) {
    return path.join(__dirname, "products", outputFileName)
  }

  async _produceBrowserProductFromTypeScript(files: treeNotationTypes.absoluteFilePath[] = [], outputFileName: treeNotationTypes.fileName, transformFn: (code: treeNotationTypes.javascriptCode) => string) {
    const outputFilePath = this._getOutputFilePath(outputFileName)
    await this._buildTsc(this._combineTypeScriptFilesForBrowser(files), outputFilePath, true)
    Disk.write(outputFilePath, transformFn(Disk.read(outputFilePath)))
    this._prettifyFile(outputFilePath)
  }

  produceProductFromInstructionsTree(productNode: any, projectRootPath: string) {
    const outputFileName = productNode.get("outputFileName")
    const inputFiles = productNode
      .getNode("combineTypeScriptFiles")
      .getWordsFrom(1)
      .map((filePath: string) => path.join(projectRootPath, filePath))
    const firstLine = productNode.get("insertFirstLine") ? productNode.get("insertFirstLine") + "\n" : ""
    const lastLine = productNode.get("insertLastLine") ? productNode.get("insertLastLine") : ""
    const removeAll = productNode.getNodesByGlobPath("removeAll")
    const transformFn = (code: string) => {
      removeAll.forEach((node: any) => (code = Utils.removeAll(code, node.getContent())))
      return firstLine + code + "\n" + lastLine
    }
    if (productNode.getLine() === "browserProduct") this._produceBrowserProductFromTypeScript(inputFiles, outputFileName, transformFn)
    else this._produceNodeProductFromTypeScript(inputFiles, outputFileName, transformFn)
    if (productNode.has("executable")) Disk.makeExecutable(path.join(projectRootPath, "products", outputFileName))
  }

  _getBundleFilePath(outputFileName: treeNotationTypes.fileName) {
    return this._getProductFolder() + `${outputFileName.replace(".js", ".ts")}`
  }

  async _produceNodeProductFromTypeScript(files: treeNotationTypes.absoluteFilePath[], outputFileName: treeNotationTypes.fileName, transformFn: (code: treeNotationTypes.javascriptCode) => string) {
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

  protected _updatePackageJson(packagePath: treeNotationTypes.filepath, newVersion: treeNotationTypes.semanticVersion) {
    const packageJson = Disk.readJson(packagePath)
    packageJson.version = newVersion
    Disk.writeJson(packagePath, packageJson)
    console.log(`Updated ${packagePath} to ${newVersion}`)
  }

  buildBuilder() {
    this._buildTsc(Disk.read(__filename), path.join(__dirname, "builder.js"))
  }

  makeGrammarFileTestTree(grammarPath: treeNotationTypes.grammarFilePath) {
    // todo: can we ditch these dual tests at some point? ideally Grammar should be bootstrapped correct?
    const testTree: any = {}
    const checkGrammarFile = (equal: Function, program: any) => {
      // Act
      const errs = program.getAllErrors()
      if (errs.length) console.log(errs.join("\n"))
      //Assert
      equal(errs.length, 0, "should be no errors")
    }

    const handGrammarProgram = new HandGrammarProgram(Disk.read(grammarPath))

    testTree[`grammarCheckOf${grammarPath}`] = (equal: Function) => checkGrammarFile(equal, GrammarCompiler.compileGrammarAndCreateProgram(grammarPath, path.join(__dirname, "langs", "grammar", "grammar.grammar")))
    testTree[`handGrammarCheckOf${grammarPath}`] = (equal: Function) => checkGrammarFile(equal, handGrammarProgram)

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

  private _getPartialMatches(commandName: string) {
    return this._getAllCommands().filter(item => item.startsWith(commandName))
  }

  main(command?: string, paramOne?: string, paramTwo?: string) {
    const print = console.log
    const builder = <any>this
    const partialMatches = this._getPartialMatches(command)

    if (builder[command]) {
      builder[command](paramOne, paramTwo)
    } else if (!command) {
      print(this._help())
    } else if (partialMatches.length > 0) {
      if (partialMatches.length === 1) builder[partialMatches[0]](paramOne, paramTwo)
      else print(`Multiple matches for '${command}'. Options are:\n${partialMatches.join("\n")}`)
    } else print(`Unknown command '${command}'.`)
  }

  produce(outputFileName: string) {
    if (outputFileName)
      return this.produceProductFromInstructionsTree(
        this._getProductsTree()
          .where("outputFileName", "=", outputFileName)
          .nodeAt(0),
        __dirname
      )

    console.log(
      "Available options:\n" +
        this._getProductsTree()
          .getColumn("outputFileName")
          .join("\n")
    )
  }

  produceAll() {
    this._getProductsTree().forEach((node: any) => {
      this.produceProductFromInstructionsTree(node, __dirname)
    })
  }

  produceLang(langName: string) {
    const newFilePath = path.join(__dirname, "langs", langName, `${langName}.grammar`)
    GrammarCompiler.compileGrammarForBrowser(newFilePath, this._getProductFolder(), true)
    GrammarCompiler.compileGrammarForNodeJs(newFilePath, this._getProductFolder(), true, "../index.js")
  }

  private _getProductsTree() {
    return TreeNode.fromDisk(__dirname + "/products.tree")
  }

  buildJibJab() {
    const combined = GrammarCompiler.combineFiles([__dirname + "/langs/jibberish/jibberish.grammar", __dirname + "/langs/jibjab/jibjab.gram"])
    combined.delete("tooling")
    const path = __dirname + "/langs/jibjab/jibjab.grammar"
    combined.toDisk(path)
    GrammarCompiler.formatFileInPlace(path, __dirname + "/langs/grammar/grammar.grammar")
  }

  _getProductFolder() {
    return path.join(__dirname, "products")
  }

  updateVersion(newVersion: treeNotationTypes.semanticVersion) {
    this._updatePackageJson(__dirname + "/package.json", newVersion)
    this._updatePackageJson(__dirname + "/package-lock.json", newVersion)

    const codePath = __dirname + "/core/TreeNode.ts"
    const code = Disk.read(codePath).replace(/\"\d+\.\d+\.\d+\"/, `"${newVersion}"`)
    Disk.write(codePath, code)
    console.log(`Updated ${codePath} to version ${newVersion}`)
    this.produceAll()
    console.log("Don't forget to update releaseNotes.scroll!")
  }

  startServer() {
    this._startServer(9999, __dirname + "/")
  }

  _makeTestTreeForFolder(dir: treeNotationTypes.absoluteFolderPath) {
    const allTestFiles = <string[]>recursiveReadSync(dir)
    const swarm = require("./products/swarm.nodejs.js")

    const fileTestTree: any = {}

    allTestFiles
      .filter(file => file.endsWith(".grammar"))
      .forEach(file => {
        fileTestTree[file] = this.makeGrammarFileTestTree(file)
      })

    allTestFiles
      .filter(file => file.endsWith(".test.js") || file.endsWith(".test.ts"))
      .forEach(file => {
        fileTestTree[file] = require(file).testTree
      })

    allTestFiles
      .filter(file => file.endsWith(".swarm"))
      .forEach(file => {
        Object.assign(fileTestTree, new swarm(Disk.read(file)).compileToRacer(file))
      })
    return fileTestTree
  }

  async test() {
    let folders = `jtable
langs
designer
sandbox
kitchen
core
coreTests
treeBase
treeComponentFramework`.split("\n")
    const fileTree = {}
    folders.forEach(folder => Object.assign(fileTree, this._makeTestTreeForFolder(__dirname + `/${folder}/`)))
    const runner = new TestRacer(fileTree)
    await runner.execute()
    runner.finish()
  }
}

export { Builder }

if (!module.parent) new Builder().main(process.argv[2], process.argv[3], process.argv[4])
