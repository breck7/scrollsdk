const TreeProgram = require("./index.js")
const fs = require("fs")
const os = require("os")

class ConsoleApp {
  constructor(languagePath) {
    this._languagePath = languagePath
    this._touchFile(languagePath)
    this._languages = new TreeProgram(fs.readFileSync(languagePath, "utf8"))
  }

  _touchFile(path) {
    if (!fs.existsSync(path)) fs.writeFileSync(path, "", "utf8")
  }

  _getRegistryPath() {
    return this._languagePath
  }

  getLanguages() {
    return this._languages
  }

  help() {
    const help = `command param description
check programPathOrLanguage Check a file(s) for grammar errors
compile programPath Compile a file
create languageName Create a new Tree Language
help  Show help
list  List installed Tree Languages
history languageName List all programs ever parsed with this cli tool
register languageJsPath Register a new language
run programPath Execute a Tree Language Program
usage languageName Analyze Global Keyword Usage for a given language
version  List installed Tree Notation version`
    console.log(TreeProgram.fromSsv(help).toTable())
  }

  list() {
    const languages = this.getLanguages().clone()
    console.log(`${languages.length} Tree Languages registered in ${this._getRegistryPath()}`)
    languages.sort()
    const ssv = TreeProgram.fromSsv("language module\n" + languages.toString())
    console.log(ssv.toTable())
  }

  create(languageName) {
    // const stampProgramCode = `define LANG ${languageName}\n` + fs.readFileSync(__dirname + "/create.stamp", "utf8")
    // fs.mkdirSync(languageName)
    // todo: create template
    const languagePath = this.getLanguages().toObject().stamp
    TreeProgram.executeFile(__dirname + "/create.stamp", languagePath)
  }

  check(programPathOrLanguage) {
    if (programPathOrLanguage.includes(".")) return this._checkAndLog(programPathOrLanguage)
    const files = this._history(programPathOrLanguage)
    files.forEach(file => this._checkAndLog(file))
  }

  _checkAndLog(programPath) {
    const errors = this._check(programPath)
    console.log(`${errors.length} errors for ${programPath}`)
    if (errors.length) console.log(errors)
  }

  _check(programPath) {
    this._logProgramPath(programPath)
    const languagePath = this._getLanguagePathOrThrow(programPath)
    const program = TreeProgram.makeProgram(programPath, languagePath)
    return program.getProgramErrors()
  }

  _getLanguagePathOrThrow(programPath) {
    const extension = ConsoleApp._getFileExtension(programPath)
    const languagePath = this.getLanguages().toObject()[extension]
    if (!languagePath) throw new Error(`No installed language for '${extension}'`)
    return languagePath
  }

  compile(programPath) {
    this._logProgramPath(programPath)
    // todo: allow user to provide destination
    const languagePath = this._getLanguagePathOrThrow(programPath)
    const program = TreeProgram.makeProgram(programPath, languagePath)
    const path = program.getCompiledProgramName(programPath)
    const compiledCode = program.compile()
    fs.writeFileSync(path, compiledCode, "utf8")
  }

  _getLogFilePath() {
    return os.homedir() + "/history.tree"
  }

  history(languageName) {
    console.log(this._history(languageName).join(" "))
  }

  _history(languageName) {
    const data = fs.readFileSync(this._getLogFilePath(), "utf8")
    const files = new TreeProgram(new TreeProgram(data.trim()).toObject()).getKeywords()
    const existing = files.filter(file => fs.existsSync(file))
    return languageName ? existing.filter(file => file.endsWith(languageName)) : existing
  }

  register(languageJsPath) {
    // todo: create RegistryTreeLanguage. Check types, dupes, sort, etc.
    const languageClass = require(languageJsPath)
    const program = new languageClass()
    const grammarProgram = program.getGrammarProgram()
    const extension = grammarProgram.getExtensionName()
    fs.appendFileSync(this._getRegistryPath(), `\n${extension} ${languageJsPath}`, "utf8")
  }

  _logProgramPath(programPath) {
    const logFilePath = this._getLogFilePath()
    const line = `${programPath} ${Date.now()}\n`
    this._touchFile(logFilePath)
    fs.appendFile(logFilePath, line, "utf8", () => {})
    // everytime you run/check/compile a tree program, log it by default.
    // that way, if a language changes or you need to do refactors, you have the
    // data of file paths handy..
  }

  run(programPath) {
    this._logProgramPath(programPath)
    const languagePath = this._getLanguagePathOrThrow(programPath)
    return TreeProgram.executeFile(programPath, languagePath)
  }

  usage(languageName) {
    const files = this._history(languageName)
    const languagePath = this._getLanguagePathOrThrow(files[0])
    const languageClass = require(languagePath)
    const report = new TreeProgram()
    files.forEach(path => {
      const code = fs.readFileSync(path, "utf8")
      const program = new languageClass(code)
      const usage = program.getGrammarUsage(path)
      report.extend(usage.toString())
    })
    const folderName = languageName
    const stampFile = new TreeProgram(`folder ${folderName}`)
    report.getChildren().forEach(node => {
      const fileNode = stampFile.append(`file ${folderName}/${node.getKeyword()}.ssv`)
      fileNode.append("data", `${node.getBeam()}\n` + node.childrenToString())
    })
    console.log(stampFile.toString())
  }

  version() {
    console.log(`TreeProgram version ${TreeProgram.getVersion()}`)
  }

  static _getFileExtension(url = "") {
    url = url.match(/\.([^\.]+)$/)
    return (url && url[1]) || ""
  }
}

module.exports = ConsoleApp
