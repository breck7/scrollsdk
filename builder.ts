#!/usr/bin/env ts-node

const { TreeNode } = require("./products/TreeNode.js")
const { TypeScriptRewriter } = require("./products/TypeScriptRewriter.js")
const { Disk } = require("./products/Disk.node.js")
const { Utils } = require("./products/Utils.js")
const { HandParsersProgram } = require("./products/Parsers.js")
const { TestRacer } = require("./products/TestRacer.js")
const { ParsersCompiler } = require("./products/ParsersCompiler.js")
const path = require("path")
const fs = require("fs")
const { execSync } = require("child_process")
const express = require("express")
const prettierConfig = require("./package.json").prettier

import { scrollNotationTypes } from "./products/scrollNotationTypes"

// todo: remove?
const registeredExtensions: scrollNotationTypes.stringMap = { js: "//", maia: "doc.tooling ", ts: "//", parsers: "tooling ", gram: "tooling " }

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

  private _combineTypeScriptFilesForNode(typeScriptScriptsInOrder: scrollNotationTypes.typeScriptFilePath[]) {
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

  private _prettifyFile(path: scrollNotationTypes.filepath) {
    Disk.write(path, require("prettier").format(Disk.read(path), prettierConfig))
  }

  private _combineTypeScriptFilesForBrowser(typeScriptScriptsInOrder: scrollNotationTypes.typeScriptFilePath[]) {
    return typeScriptScriptsInOrder
      .map(src => Disk.read(src))
      .map(content => new TypeScriptRewriter(content).removeRequires().removeImports().removeTsGeneratedCrap().removeHashBang().removeNodeJsOnlyLines().changeDefaultExportsToWindowExports().removeExports().getString())
      .join("\n")
  }

  private _buildTsc(sourceCode: string, outputFilePath: string, forBrowser = false) {
    Disk.write(outputFilePath, this._typeScriptToJavascript(sourceCode, forBrowser))
  }

  protected _startServer(port: scrollNotationTypes.portNumber, folder: string) {
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
      fs.watch(folder, { recursive: true }, (event: any, filename: scrollNotationTypes.fileName) => {
        this._onFileChanged(folder + filename)
      })
    )
  }

  // todo: cleanup
  _getOutputFilePath(outputFileName: string) {
    return path.join(__dirname, "products", outputFileName)
  }

  async _produceBrowserProductFromTypeScript(files: scrollNotationTypes.absoluteFilePath[] = [], outputFileName: scrollNotationTypes.fileName, transformFn: (code: scrollNotationTypes.javascriptCode) => string) {
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
      removeAll.forEach((node: any) => (code = Utils.removeAll(code, node.content)))
      return firstLine + code + "\n" + lastLine
    }
    if (productNode.getLine() === "browserProduct") this._produceBrowserProductFromTypeScript(inputFiles, outputFileName, transformFn)
    else this._produceNodeProductFromTypeScript(inputFiles, outputFileName, transformFn)
    if (productNode.has("executable")) Disk.makeExecutable(path.join(projectRootPath, "products", outputFileName))
  }

  _getBundleFilePath(outputFileName: scrollNotationTypes.fileName) {
    return this._getProductFolder() + `${outputFileName.replace(".js", ".ts")}`
  }

  async _produceNodeProductFromTypeScript(files: scrollNotationTypes.absoluteFilePath[], outputFileName: scrollNotationTypes.fileName, transformFn: (code: scrollNotationTypes.javascriptCode) => string) {
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

  protected _updatePackageJson(packagePath: scrollNotationTypes.filepath, newVersion: scrollNotationTypes.semanticVersion) {
    const packageJson = Disk.readJson(packagePath)
    packageJson.version = newVersion
    Disk.writeJson(packagePath, packageJson)
    console.log(`Updated ${packagePath} to ${newVersion}`)
  }

  buildBuilder() {
    this._buildTsc(Disk.read(__filename), path.join(__dirname, "builder.js"))
  }

  makeParsersFileTestTree(parsersPath: scrollNotationTypes.parsersFilePath) {
    // todo: can we ditch these dual tests at some point? ideally Parsers should be bootstrapped correct?
    const testTree: any = {}
    const checkParsersFile = (equal: Function, program: any) => {
      // Act
      const errs = program.getAllErrors()
      if (errs.length) console.log(errs.join("\n"))
      //Assert
      equal(errs.length, 0, "should be no errors")
    }

    const handParsersProgram = new HandParsersProgram(Disk.read(parsersPath))

    testTree[`parsersCheckOf${parsersPath}`] = (equal: Function) => checkParsersFile(equal, ParsersCompiler.compileParsersAndCreateProgram(parsersPath, path.join(__dirname, "langs", "parsers", "parsers.parsers")))
    testTree[`handParsersCheckOf${parsersPath}`] = (equal: Function) => checkParsersFile(equal, handParsersProgram)

    Object.assign(testTree, handParsersProgram.examplesToTestBlocks())

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
    if (outputFileName) return this.produceProductFromInstructionsTree(this._getProductsTree().where("outputFileName", "=", outputFileName).nodeAt(0), __dirname)

    console.log("Available options:\n" + this._getProductsTree().getColumn("outputFileName").join("\n"))
  }

  produceAll() {
    this._getProductsTree().forEach((node: any) => {
      this.produceProductFromInstructionsTree(node, __dirname)
    })
  }

  produceAllLangs() {
    const langs = `arrow chuck dug dumbdown fire fruit parsers hakon jibberish jibjab numbers poop project stamp stump swarm`.split(" ")
    langs.forEach(lang => this.produceLang(lang))
  }

  produceLang(langName: string) {
    const newFilePath = path.join(__dirname, "langs", langName, `${langName}.parsers`)
    ParsersCompiler.compileParsersForBrowser(newFilePath, this._getProductFolder(), true)
    ParsersCompiler.compileParsersForNodeJs(newFilePath, this._getProductFolder(), true, ".")
  }

  private _getProductsTree() {
    return TreeNode.fromDisk(__dirname + "/products.tree")
  }

  buildJibJab() {
    const combined = ParsersCompiler.combineFiles([__dirname + "/langs/jibberish/jibberish.parsers", __dirname + "/langs/jibjab/jibjab.gram"])
    const path = __dirname + "/langs/jibjab/jibjab.parsers"
    combined.toDisk(path)
    ParsersCompiler.formatFileInPlace(path, __dirname + "/langs/parsers/parsers.parsers")
  }

  _getProductFolder() {
    return path.join(__dirname, "products")
  }

  updateVersion(newVersion: scrollNotationTypes.semanticVersion) {
    this._updatePackageJson(__dirname + "/package.json", newVersion)

    const codePath = __dirname + "/treeNode/TreeNode.ts"
    const code = Disk.read(codePath).replace(/\"\d+\.\d+\.\d+\"/, `"${newVersion}"`)
    Disk.write(codePath, code)
    console.log(`Updated ${codePath} to version ${newVersion}`)
    this.produceAll()
    console.log("Don't forget to update releaseNotes.scroll!")
  }

  startServer() {
    this._startServer(9999, __dirname + "/")
  }

  _makeTestTreeForFolder(dir: scrollNotationTypes.absoluteFolderPath) {
    const allTestFiles: string[] = Disk.recursiveReaddirSyncSimple(dir)
    const swarm = require("./products/swarm.nodejs.js")

    const fileTestTree: any = {}

    allTestFiles.filter(file => file.endsWith(".parsers")).forEach(file => (fileTestTree[file] = this.makeParsersFileTestTree(file)))

    allTestFiles.filter(file => file.endsWith(".test.js") || file.endsWith(".test.ts")).forEach(file => (fileTestTree[file] = require(file).testTree))

    allTestFiles.filter(file => file.endsWith(".swarm")).forEach(file => Object.assign(fileTestTree, new swarm(Disk.read(file)).compileToRacer(file)))
    return fileTestTree
  }

  async test() {
    let folders = `langs
designer
sandbox
kitchen
treeNode
swim
testRacer
treeFileSystem
parsers
utils
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
