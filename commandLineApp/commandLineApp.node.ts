#!/usr/bin/env ts-node
//onsave jtree build produce commandLineApp.node.js

const recursiveReadSync = require("recursive-readdir-sync")
const homedir = require("os").homedir
const { execSync } = require("child_process")

const path = require("path")
const { jtree } = require("../index.js")
const { TreeNode, HandGrammarProgram, Utils } = jtree
const { Disk } = require("../products/Disk.node.js")

import { treeNotationTypes } from "../products/treeNotationTypes"

const CLI_HELP = TreeNode.fromSsv(
  `command paramOne paramTwo description
base folderPath port=4444 Start a TreeBase server for the given folder
build commandName param? Run a jBuild command with 0 or 1 param.
check programPath  Check a file for grammar errors
compile programPath targetExtension Compile a file
compileCheck folderPath grammarName Test all compiler test cases in a given folder
format programPath  Format a tree program in place
help   Show this help
kitchen port=3333  Start the Kitchen Express server used by JTree developers
list   List installed Grammars
parse programPath  Parse and print the nodeTypes and cellTypes in a program
register grammarPath  Register a new grammar
run programPath  Execute a Tree Language Program
serve port=3030 dirPath? Serve a folder over HTTP
stamp dirPath  Dump a directory as a Stamp program.
sublime grammarName outputPath Generate sublime syntax highlighting files
version   List installed Tree Notation version and location
webForm grammarName nodeTypeId? Build a web form for the given grammar`
).toTable()

class CommandLineApp {
  constructor(grammarsPath = path.join(homedir(), "grammars.ssv"), cwd = process.cwd()) {
    this._grammarsPath = grammarsPath
    Disk.createFileIfDoesNotExist(grammarsPath, "name filepath")
    this._reload() // todo: cleanup
    this._cwd = cwd
  }

  private _grammarsPath: treeNotationTypes.filepath
  private _cwd: treeNotationTypes.filepath
  private _grammarsTree: treeNotationTypes.treeNode

  _getRegistryPath() {
    return this._grammarsPath
  }

  // todo: cleanup.
  _reload() {
    this._grammarsTree = TreeNode.fromSsv(Disk.read(this._grammarsPath)) // todo: index on name, or build a Tree Grammar lang
  }

  build(buildCommandName: string, argument: any) {
    let dir = Utils._removeLastSlash(this._cwd) + "/"
    let filePath = ""
    while (dir !== "/") {
      filePath = dir + "builder.ts"
      const jsPath = dir + "builder.js"
      if (Disk.exists(jsPath)) {
        const { Builder } = require(jsPath)
        return new Builder().main(buildCommandName, argument)
      }
      if (Disk.exists(filePath)) break
      dir = Utils.getParentFolder(dir)
    }
    if (!Disk.exists(filePath)) throw new Error(`No '${filePath}' found.`)

    return execSync([filePath, buildCommandName, argument].filter(identity => identity).join(" "), { encoding: "utf8", maxBuffer: 1024 * 1024 * 64 })
  }

  // todo: improve or remove
  cases(folder: treeNotationTypes.filepath, grammarName: treeNotationTypes.grammarName) {
    const files = recursiveReadSync(folder).filter((file: treeNotationTypes.filepath) => file.endsWith("." + grammarName))
    const grammarProgram = this._getGrammarProgram(grammarName)
    files.map((filename: treeNotationTypes.filepath) => {
      const errors = this._check(filename)
      if (errors.length) {
        throw new Error(`Type check errors ${errors}`)
      }
      const actual = this.compile(filename)
      const expectedPath = filename.replace("." + grammarName, ".compiled")
      const expected = Disk.read(expectedPath)
      if (expected !== actual) {
        const errorTree = new TreeNode()
        errorTree.appendLineAndChildren("expected", expected)
        errorTree.appendLineAndChildren("actual", actual)
        throw new Error("Compile Errors\n" + errorTree.toString())
      }
      console.log(`${filename} passed`)
    })
  }

  getGrammars() {
    return this._grammarsTree
  }

  help() {
    return CLI_HELP
  }

  base(folderPath: treeNotationTypes.absoluteFolderPath = undefined, port = 4444) {
    const { TreeBaseFolder, TreeBaseServer } = require("../products/treeBase.node.js")
    if (!folderPath) {
      folderPath = require("path").join(__dirname, "..", "treeBase", "planets")
      console.log(`No path to a TreeBase folder provided. Defaulting to '${folderPath}'`)
    }
    const folder = new TreeBaseFolder().setDir(folderPath).setGrammarDir(folderPath)
    folder.startListeningForFileChanges()
    new TreeBaseServer(folder).listen(port)
  }

  list() {
    const grammars = this.getGrammars().clone()
    grammars.sortBy("name")
    return `${grammars.length} Tree Grammars registered in ${this._getRegistryPath()}
${grammars.toTable()}`
  }

  isRegistered(grammarName: treeNotationTypes.grammarName) {
    return this.getGrammars().where("name", "=", grammarName).length === 1
  }

  _getGrammarPathByGrammarNameOrThrow(grammarName: treeNotationTypes.grammarName) {
    const node = this.getGrammars().getNodeByColumns("name", grammarName)

    if (!node) throw new Error(`No registered grammar named '${grammarName}'. Registered grammars are ${this._getRegisteredGrammarNames().join(",")}`)

    return node.getParent().get("filepath")
  }

  check(programPath: treeNotationTypes.treeProgramFilePath) {
    return this._checkAndLog(programPath)
  }

  _checkAndLog(programPath: treeNotationTypes.treeProgramFilePath) {
    const grammarPath = this._getGrammarPathOrThrow(programPath)
    const errors = this._check(programPath)

    return `Checking "${programPath}" with grammar "${grammarPath}"
${errors.length} errors found ${errors.length ? "\n" + errors.join("\n") : ""}`
  }

  _check(programPath: treeNotationTypes.treeProgramFilePath) {
    const programConstructor = this._getProgramConstructorFromProgramPath(programPath)
    const program = new programConstructor(Disk.read(programPath))
    return program.getAllErrors().map((err: any) => err.getMessage())
  }

  _getRegisteredGrammarNames() {
    return this.getGrammars().getColumn("name")
  }

  _getGrammarPathOrThrow(programPath: treeNotationTypes.treeProgramFilePath) {
    const extension = Utils.getFileExtension(programPath)
    return this._getGrammarPathByGrammarNameOrThrow(extension)
  }

  private _getGrammarCompiledExecutablePath(programPath: treeNotationTypes.treeProgramFilePath) {
    const grammarPath = this._getGrammarPathOrThrow(programPath)
    const extension = Utils.getFileExtension(programPath)
    const dir = Utils.getParentFolder(grammarPath)
    const compiledPath = dir + extension + ".nodejs.js"
    if (Disk.exists(compiledPath)) return compiledPath
  }

  kitchen(port = 3333) {
    const { Kitchen } = require("../products/Kitchen.node.js")
    const server = new Kitchen()
    server.start(port)
    return `Starting kitchen on port ${port}`
  }

  format(programPath: treeNotationTypes.treeProgramFilePath) {
    return jtree.formatFileInPlace(programPath, this._getGrammarPathOrThrow(programPath)) ? "No change" : "File updated"
  }

  parse(programPath: treeNotationTypes.treeProgramFilePath) {
    const programConstructor = this._getProgramConstructorFromProgramPath(programPath)
    const program = new programConstructor(Disk.read(programPath))
    return program.getParseTable(35)
  }

  sublime(grammarName: treeNotationTypes.grammarName, outputDirectory: treeNotationTypes.absoluteFolderPath = ".") {
    const grammarPath = this._getGrammarPathByGrammarNameOrThrow(grammarName)
    const grammarProgram = new HandGrammarProgram(Disk.read(grammarPath))
    const outputPath = outputDirectory + `/${grammarProgram.getExtensionName()}.sublime-syntax`

    Disk.write(outputPath, grammarProgram.toSublimeSyntaxFile())
    return `Saved: ${outputPath}`
  }

  _getGrammarProgram(grammarName: treeNotationTypes.grammarName) {
    const grammarPath = this._getGrammarPathByGrammarNameOrThrow(grammarName)
    return new HandGrammarProgram(Disk.read(grammarPath))
  }

  compile(programPath: treeNotationTypes.treeProgramFilePath) {
    // todo: allow user to provide destination
    const programConstructor = this._getProgramConstructorFromProgramPath(programPath)
    const program = new programConstructor(Disk.read(programPath))
    return program.compile()
  }

  _getLogFilePath() {
    return homedir() + "/history.ssv"
  }

  webForm(grammarName: treeNotationTypes.grammarName, nodeTypeId?: string) {
    // webForm grammarName nodeTypeId? Build a web form for the given grammar
    const grammarPath = this._getGrammarPathByGrammarNameOrThrow(grammarName)
    const grammarProgram = new jtree.HandGrammarProgram(Disk.read(grammarPath)).compileAndReturnRootConstructor()

    let def = new grammarProgram().getDefinition()

    if (nodeTypeId) def = def.getNodeTypeDefinitionByNodeTypeId(nodeTypeId)

    const stumpCode = def.toStumpString()
    const stumpNode = require("../products/stump.nodejs.js")
    return new stumpNode(stumpCode).compile()
  }

  register(grammarPath: treeNotationTypes.grammarFilePath) {
    // todo: should support compiled grammars.
    const extension = this._register(grammarPath)
    return `Registered ${extension}`
  }

  private _register(grammarPath: treeNotationTypes.grammarFilePath) {
    // todo: create RegistryTreeLanguage. Check types, dupes, sort, etc.
    const grammarProgram = new HandGrammarProgram(Disk.read(grammarPath))
    const extension = grammarProgram.getExtensionName()
    Disk.append(this._getRegistryPath(), `\n${extension} ${grammarPath}`)
    this._reload()
    return extension
  }

  addToHistory(one: string, two: string, three: string) {
    // everytime you run/check/compile a tree program, log it by default.
    // that way, if a language changes or you need to do refactors, you have the
    // data of file paths handy..
    // also the usage data can be used to improve the commandLineApp app
    const line = `${one || ""} ${two || ""} ${three || ""} ${Date.now()}\n`
    const logFilePath = this._getLogFilePath()
    Disk.createFileIfDoesNotExist(logFilePath, "command paramOne paramTwo timestamp\n")
    Disk.appendAsync(logFilePath, line, () => {})
  }

  private _getProgramConstructorFromProgramPath(programPath: string) {
    const executablePath = this._getGrammarCompiledExecutablePath(programPath)
    if (executablePath) return require(executablePath)
    const grammarPath = this._getGrammarPathOrThrow(programPath)
    return jtree.compileGrammarFileAtPathAndReturnRootConstructor(grammarPath)
  }

  private async _executeFile(programPath: treeNotationTypes.treeProgramFilePath) {
    const programConstructor = this._getProgramConstructorFromProgramPath(programPath)
    const program = new programConstructor(Disk.read(programPath))
    const result = await program.execute(programPath)
    return result
  }

  async run(programPathOrGrammarName: treeNotationTypes.treeProgramFilePath | treeNotationTypes.grammarName) {
    return this._executeFile(programPathOrGrammarName)
  }

  version() {
    return `jtree version ${jtree.getVersion()} installed at ${__filename}`
  }

  serve(port = 3030, folder = this._cwd) {
    const express = require("express")
    const app = express()
    app.use(express.static(folder))
    app.listen(port)
    console.log(`Serving '${folder}'. cmd+dblclick: http://localhost:${port}/`)
  }

  _getAllCommands() {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(word => !word.startsWith("_") && word !== "constructor")
      .sort()
  }

  stamp(providedPath: string) {
    const stamp = require("../products/stamp.nodejs.js")

    const getAbsPath = (input: string) => (input.startsWith("/") ? input : path.resolve(this._cwd + "/" + input))

    const providedPathWithoutEndingSlash = providedPath && providedPath.replace(/\/$/, "")
    const absPath = providedPath ? getAbsPath(providedPathWithoutEndingSlash) : this._cwd
    console.log(stamp.dirToStampWithContents(absPath))
  }

  _getPartialMatches(commandName: string) {
    return this._getAllCommands().filter(item => item.startsWith(commandName))
  }

  static async main(command?: string, paramOne?: string, paramTwo?: string) {
    const app = <any>new CommandLineApp()

    const print = console.log
    const partialMatches = app._getPartialMatches(command)

    if (app[command]) {
      app.addToHistory(command, paramOne, paramTwo)
      const result = await app[command](paramOne, paramTwo)
      if (result !== undefined) print(result)
    } else if (!command) {
      app.addToHistory()
      print(app.help())
    } else if (Disk.exists(command)) {
      app.addToHistory(undefined, command)
      const result = await app.run(command)
      if (result !== undefined) print(result)
    } else if (partialMatches.length > 0) {
      if (partialMatches.length === 1) print(app[partialMatches[0]](paramOne, paramTwo))
      else print(`Multiple matches for '${command}'. Options are:\n${partialMatches.join("\n")}`)
    } else print(`Unknown command '${command}'. Options are:\n${app._getAllCommands().join("\n")}. \nType 'tree help' to see help for commands.`)
  }
}

if (!module.parent) CommandLineApp.main(process.argv[2], process.argv[3], process.argv[4])

export { CommandLineApp }
