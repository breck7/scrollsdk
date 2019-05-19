#! /usr/bin/env node --use_strict

const jtree = require("../index.js")
const { TreeNode, GrammarProgram, Utils } = jtree
const fs = require("fs")
const os = require("os")
const recursiveReadSync = require("recursive-readdir-sync")

class CLI {
  constructor(grammarsPath = os.homedir() + "/grammars.ssv") {
    this._grammarsPath = grammarsPath
    this._initFile(grammarsPath)
    const grammarsSsv = this._read(grammarsPath)
    this._grammarsTree = TreeNode.fromSsv(grammarsSsv) // todo: index on name, or build a Tree Grammar lang
  }

  combine(grammarName) {
    const content = this.programs(grammarName)
      .split(" ")
      .map(path => {
        const distributeLine = true ? `#file ${path}\n` : ""
        return distributeLine + " " + fs.readFileSync(path, "utf8").replace(/\n/g, "\n ")
      })
      .join("\n")

    return new TreeNode(content).toString()
  }

  distribute(combinedFilePath) {
    if (!combinedFilePath) throw new Error(`No combinedFilePath provided`)
    const masterFile = new TreeNode(fs.readFileSync(combinedFilePath, "utf8"))
    return masterFile.split("#file").map(file => {
      const firstLine = file.nodeAt(0)
      if (firstLine.getFirstWord() !== "#file") return undefined
      const filepath = firstLine.getWord(1)

      const needsShift = !firstLine.length
      if (needsShift) firstLine.shiftYoungerSibsRight()

      this._write(filepath, firstLine.childrenToString())
      return filepath
    })
  }

  _initFile(path, initialString = "") {
    if (!fs.existsSync(path)) this._write(path, initialString)
  }

  _getRegistryPath() {
    return this._grammarsPath
  }

  _write(path, content) {
    return fs.writeFileSync(path, content, "utf8")
  }

  _read(path) {
    return fs.readFileSync(path, "utf8")
  }

  // todo: improve or remove
  cases(folder, grammarName) {
    const files = recursiveReadSync(folder).filter(file => file.endsWith("." + grammarName))
    const grammarProgram = this._getGrammarProgram(grammarName)
    const targetExtension = grammarProgram.getTargetExtension()
    files.map(filename => {
      const errors = this._check(filename)
      if (errors.length) {
        throw new Error(`Type check errors ${errors}`)
      }
      const actual = this.compile(filename, targetExtension)
      const expectedPath = filename.replace("." + grammarName, "." + targetExtension)
      const expected = this._read(expectedPath)
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
    const help = this._read(__dirname + "/help.ssv")
    return TreeNode.fromSsv(help).toTable()
  }

  list() {
    const grammars = this.getGrammars().clone()
    grammars.sortBy("name")
    return `${grammars.length} Tree Grammars registered in ${this._getRegistryPath()}
${grammars.toTable()}`
  }

  _getGrammarPathByGrammarName(grammarName) {
    const node = this.getGrammars().getNodeByColumns("name", grammarName)

    if (!node) return false

    return node.getParent().get("filepath")
  }

  create() {
    jtree.executeFile(__dirname + "/create.stamp", this._getGrammarPathByGrammarName("stamp"))
  }

  check(programPath) {
    return this._checkAndLog(programPath)
  }

  checkAll(grammarName) {
    const files = this._history(grammarName)
    return files.map(file => this._checkAndLog(file)).join("\n")
  }

  _checkAndLog(programPath) {
    const errors = this._check(programPath)
    return `${errors.length} errors for ${programPath}${errors.length ? "\n" + errors.join("\n") : ""}`
  }

  _check(programPath) {
    const grammarPath = this._getGrammarPathOrThrow(programPath)
    const program = jtree.makeProgram(programPath, grammarPath)
    return program.getProgramErrorMessages()
  }

  _getGrammarPathOrThrow(programPath) {
    const extension = Utils.getFileExtension(programPath)
    const grammarPath = this._getGrammarPathByGrammarName(extension)
    if (!grammarPath) throw new Error(`No installed grammar for file '${programPath}' with extension '${extension}'`)
    return grammarPath
  }

  sandbox(port = 3333) {
    require("../sandbox/sandbox.express.js")(port)
    return `Starting sandbox on port ${port}`
  }

  prettify(programPath) {
    const programConstructor = jtree.getProgramConstructor(this._getGrammarPathOrThrow(programPath))
    const program = new programConstructor(this._read(programPath))
    const original = program.toString()
    const pretty = program.getPrettified()
    this._write(programPath, pretty)
    return original === pretty ? "No change" : "File updated"
  }

  gen(grammarName, outputDirectory = ".") {
    const grammarPath = this._getGrammarPathByGrammarName(grammarName)
    const grammarProgram = GrammarProgram.newFromCondensed(fs.readFileSync(grammarPath, "utf8"), grammarPath)
    const sub = outputDirectory + `/${grammarProgram.getExtensionName()}.sublime-syntax`

    fs.writeFileSync(sub, grammarProgram.toSublimeSyntaxFile(), "utf8")
    return `Saved: ${sub}`
  }

  _getGrammarProgram(grammarName) {
    const grammarPath = this._getGrammarPathByGrammarName(grammarName)
    return new GrammarProgram(this._read(grammarPath))
  }

  compile(programPath, targetExtension) {
    // todo: allow user to provide destination
    const grammarPath = this._getGrammarPathOrThrow(programPath)
    const program = jtree.makeProgram(programPath, grammarPath)
    const path = program.getCompiledProgramName(programPath)
    const grammarProgram = new GrammarProgram(this._read(grammarPath))
    targetExtension = targetExtension || grammarProgram.getTargetExtension()
    const compiledCode = program.compile(targetExtension)
    return compiledCode
  }

  _getLogFilePath() {
    return os.homedir() + "/history.ssv"
  }

  programs(grammarName) {
    return this._history(grammarName).join(" ")
  }

  allHistory() {
    return this._getHistoryFile()
  }

  _getHistoryFile() {
    return this._read(this._getLogFilePath())
  }

  _history(grammarName) {
    // todo: store history of all commands
    // todo: build language for cli history
    // todo: refactor this
    // todo: some easier one step way to get a set from a column
    // todo: add support for initing a TreeNode from a JS set and map
    const data = TreeNode.fromSsv(this._getHistoryFile())
    const files = data
      .filter(node => {
        const command = node.get("command")
        const filepath = node.get("paramOne")
        // make sure theres a filder and it has an extension.
        if (!filepath || !filepath.includes(".")) return false
        if (["check", "run", "", "compile"].includes(command)) return true
      })
      .map(node => node.get("paramOne"))
    const items = Object.keys(new TreeNode(files.join("\n")).toObject())
    return items.filter(file => file.endsWith(grammarName)).filter(file => fs.existsSync(file))
  }

  register(grammarPath) {
    // todo: create RegistryTreeLanguage. Check types, dupes, sort, etc.
    const grammarProgram = new GrammarProgram(this._read(grammarPath))
    const extension = grammarProgram.getExtensionName()
    fs.appendFileSync(this._getRegistryPath(), `\n${extension} ${grammarPath}`, "utf8")
    return `Registered ${extension}`
  }

  addToHistory(one, two, three) {
    // everytime you run/check/compile a tree program, log it by default.
    // that way, if a language changes or you need to do refactors, you have the
    // data of file paths handy..
    // also the usage data can be used to improve the cli app
    const line = `${one || ""} ${two || ""} ${three || ""} ${Date.now()}\n`
    const logFilePath = this._getLogFilePath()
    this._initFile(logFilePath, "command paramOne paramTwo timestamp\n")
    fs.appendFile(logFilePath, line, "utf8", () => {})
  }

  async _run(programPath) {
    const result = await jtree.executeFile(programPath, this._getGrammarPathOrThrow(programPath))
    return result
  }

  _runSync(programPath) {
    return jtree.executeFileSync(programPath, this._getGrammarPathOrThrow(programPath))
  }

  async run(programPathOrGrammarName) {
    if (programPathOrGrammarName.includes(".")) return this._run(programPathOrGrammarName)
    return Promise.all(this._history(programPathOrGrammarName).map(file => this._run(file)))
  }

  runSync(programPathOrGrammarName) {
    if (programPathOrGrammarName.includes(".")) return this._runSync(programPathOrGrammarName)
    return this._history(programPathOrGrammarName).map(file => this._runSync(file))
  }

  usage(grammarName) {
    const files = this._history(grammarName)
    const grammarPath = this._getGrammarPathOrThrow(files[0])
    const programConstructor = jtree.getProgramConstructor(grammarPath)
    const report = new TreeNode()
    files.forEach(path => {
      const code = this._read(path)
      const program = new programConstructor(code)
      const usage = program.getNodeTypeUsage(path)
      report.extend(usage.toString())
    })
    const folderName = grammarName
    const stampFile = new TreeNode(`folder ${folderName}`)
    report.forEach(node => {
      const fileNode = stampFile.appendLine(`file ${folderName}/${node.getFirstWord()}.ssv`)
      fileNode.appendLineAndChildren("data", `${node.getContent()}\n` + node.childrenToString())
    })
    return stampFile.toString()
  }

  version() {
    return `jtree version ${jtree.getVersion()} installed at ${__filename}`
  }

  static async main() {
    const app = new CLI()

    const action = process.argv[2]
    const paramOne = process.argv[3]
    const paramTwo = process.argv[4]
    const print = console.log

    if (app[action]) {
      app.addToHistory(action, paramOne, paramTwo)
      print(app[action](paramOne, paramTwo))
    } else if (!action) {
      app.addToHistory()
      print(app.help())
    } else if (fs.existsSync(action)) {
      app.addToHistory(undefined, action)
      const result = await app.run(action)
      print(result)
    } else print(`Unknown command '${action}'. Type 'tree help' to see available commands.`)
  }
}

module.exports = CLI

if (!module.parent) CLI.main()
