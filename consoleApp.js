const otree = require("./index.js")
const TreeNode = otree.TreeNode
const GrammarProgram = require("./src/grammar/GrammarProgram.js")
const TreeUtils = require("./src/base/TreeUtils.js")
const fs = require("fs")
const os = require("os")

class ConsoleApp {
  constructor(grammarsPath = os.homedir() + "/grammars.ssv") {
    this._grammarsPath = grammarsPath
    this._initFile(grammarsPath)
    const grammarsSsv = fs.readFileSync(grammarsPath, "utf8")
    this._grammarsTree = TreeNode.fromSsv(grammarsSsv) // todo: index on name, or build a Tree Grammar lang
  }

  _initFile(path, initialString = "") {
    if (!fs.existsSync(path)) fs.writeFileSync(path, initialString, "utf8")
  }

  _getRegistryPath() {
    return this._grammarsPath
  }

  getGrammars() {
    return this._grammarsTree
  }

  help() {
    const help = fs.readFileSync(__dirname + "/help.ssv", "utf8")
    return TreeNode.fromSsv(help).toTable()
  }

  list() {
    const grammars = this.getGrammars().clone()
    grammars.sortBy("name")
    return `${grammars.length} Tree Grammars registered in ${this._getRegistryPath()}
${grammars.toTable()}`
  }

  _getGrammarPathByGrammarName(grammarName) {
    const node = this.getGrammars()
      .getNodeByColumns("name", grammarName)
      .getParent()
      .findBeam("filepath")

    return node
  }

  create() {
    otree.executeFile(__dirname + "/create.stamp", this._getGrammarPathByGrammarName("stamp"))
  }

  check(programPathOrGrammarName) {
    if (programPathOrGrammarName.includes(".")) return this._checkAndLog(programPathOrGrammarName)
    const files = this._history(programPathOrGrammarName)
    return files.map(file => this._checkAndLog(file)).join("\n")
  }

  _checkAndLog(programPath) {
    const errors = this._check(programPath)
    return `${errors.length} errors for ${programPath}${errors.length ? "\n" + errors.join("\n") : ""}`
  }

  _check(programPath) {
    const grammarPath = this._getGrammarPathOrThrow(programPath)
    const program = otree.makeProgram(programPath, grammarPath)
    return program.getProgramErrors()
  }

  _getGrammarPathOrThrow(programPath) {
    const extension = TreeUtils.getFileExtension(programPath)
    const grammarPath = this._getGrammarPathByGrammarName(extension)
    if (!grammarPath) throw new Error(`No installed grammar for '${extension}'`)
    return grammarPath
  }

  garden() {
    require("./garden.express.js")
  }

  compile(programPath) {
    // todo: allow user to provide destination
    const grammarPath = this._getGrammarPathOrThrow(programPath)
    const program = otree.makeProgram(programPath, grammarPath)
    const path = program.getCompiledProgramName(programPath)
    const grammarProgram = new GrammarProgram(fs.readFileSync(grammarPath, "utf8"))
    const targetExtension = grammarProgram.getTargetExtension()
    const compiledCode = program.compile(targetExtension)
    return compiledCode
  }

  _getLogFilePath() {
    return os.homedir() + "/history.ssv"
  }

  history(grammarName) {
    return grammarName ? this._history(grammarName).join(" ") : this._getHistoryFile()
  }

  _getHistoryFile() {
    return fs.readFileSync(this._getLogFilePath(), "utf8")
  }

  _history(grammarName) {
    // todo: store history of all commands
    // todo: build language for cli history
    // todo: refactor this
    // todo: the findBeam method is bad (confuse with getBeam). clean up.
    // todo: some easier one step way to get a set from a column
    // todo: add support for initing a TreeNode from a JS set and map
    const data = TreeNode.fromSsv(this._getHistoryFile())
    const files = data
      .getChildren()
      .filter(node => {
        const command = node.findBeam("command")
        const filepath = node.findBeam("param")
        // make sure theres a filder and it has an extension.
        if (!filepath || !filepath.includes(".")) return false
        if (["check", "run", "", "compile"].includes(command)) return true
      })
      .map(node => node.findBeam("param"))
    const items = Object.keys(new TreeNode(files.join("\n")).toObject())
    return items.filter(file => file.endsWith(grammarName)).filter(file => fs.existsSync(file))
  }

  register(grammarPath) {
    // todo: create RegistryTreeLanguage. Check types, dupes, sort, etc.
    const grammarProgram = new GrammarProgram(fs.readFileSync(grammarPath, "utf8"))
    const extension = grammarProgram.getExtensionName()
    fs.appendFileSync(this._getRegistryPath(), `\n${extension} ${grammarPath}`, "utf8")
    return `Registered ${extension}`
  }

  addToHistory(one, two) {
    // everytime you run/check/compile a tree program, log it by default.
    // that way, if a language changes or you need to do refactors, you have the
    // data of file paths handy..
    // also the usage data can be used to improve the cli app
    const line = `${one || ""} ${two || ""} ${Date.now()}\n`
    const logFilePath = this._getLogFilePath()
    this._initFile(logFilePath, "command param timestamp\n")
    fs.appendFile(logFilePath, line, "utf8", () => {})
  }

  _run(programPath) {
    const grammarPath = this._getGrammarPathOrThrow(programPath)
    return otree.executeFile(programPath, grammarPath)
  }

  run(programPathOrGrammarName) {
    if (programPathOrGrammarName.includes(".")) return this._run(programPathOrGrammarName)
    const files = this._history(programPathOrGrammarName)
    return files.map(file => this._run(file))
  }

  usage(grammarName) {
    const files = this._history(grammarName)
    const grammarPath = this._getGrammarPathOrThrow(files[0])
    const programClass = otree.getParser(grammarPath)
    const report = new TreeNode()
    files.forEach(path => {
      const code = fs.readFileSync(path, "utf8")
      const program = new programClass(code)
      const usage = program.getKeywordUsage(path)
      report.extend(usage.toString())
    })
    const folderName = grammarName
    const stampFile = new TreeNode(`folder ${folderName}`)
    report.getChildren().forEach(node => {
      const fileNode = stampFile.appendLine(`file ${folderName}/${node.getKeyword()}.ssv`)
      fileNode.appendLineAndChildren("data", `${node.getBeam()}\n` + node.childrenToString())
    })
    return stampFile.toString()
  }

  version() {
    return `otree version ${otree.getVersion()}`
  }
}

module.exports = ConsoleApp
