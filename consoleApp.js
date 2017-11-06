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
    const help = `command param description
check programPathOrGrammarName Check a file(s) for grammar errors
compile programPath Compile a file
create  Create a new Grammar
garden  Start the Tree Garden web app
help  Show help
list  List installed Grammars
history grammarName List all programs ever parsed with this cli tool
register grammarPath Register a new grammar
run programPath Execute a Tree Language Program
usage grammarName Analyze Global Keyword Usage for a given grammar
version  List installed Tree Notation version`
    console.log(TreeNode.fromSsv(help).toTable())
  }

  list() {
    const grammars = this.getGrammars().clone()
    console.log(`${grammars.length} Tree Grammars registered in ${this._getRegistryPath()}`)
    grammars.sortBy("name")
    console.log(grammars.toTable())
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
    files.forEach(file => this._checkAndLog(file))
  }

  _checkAndLog(programPath) {
    const errors = this._check(programPath)
    console.log(`${errors.length} errors for ${programPath}`)
    if (errors.length) console.log(errors)
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
    console.log(compiledCode) // they can pipe it to a file
  }

  _getLogFilePath() {
    return os.homedir() + "/history.ssv"
  }

  history(grammarName) {
    if (grammarName) console.log(this._history(grammarName).join(" "))
    else console.log(this._getHistoryFile())
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

  check(programPathOrGrammarName) {
    if (programPathOrGrammarName.includes(".")) return this._checkAndLog(programPathOrGrammarName)
    const files = this._history(programPathOrGrammarName)
    files.forEach(file => this._checkAndLog(file))
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
    const programClass = otree.getProgramClassFromGrammarFile(grammarPath)
    const report = new TreeNode()
    files.forEach(path => {
      const code = fs.readFileSync(path, "utf8")
      const program = new programClass(code)
      const usage = program.getGrammarUsage(path)
      report.extend(usage.toString())
    })
    const folderName = grammarName
    const stampFile = new TreeNode(`folder ${folderName}`)
    report.getChildren().forEach(node => {
      const fileNode = stampFile.append(`file ${folderName}/${node.getKeyword()}.ssv`)
      fileNode.append("data", `${node.getBeam()}\n` + node.childrenToString())
    })
    console.log(stampFile.toString())
  }

  version() {
    console.log(`otree version ${otree.getVersion()}`)
  }
}

module.exports = ConsoleApp
