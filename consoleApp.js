const TreeProgram = require("./index.js")
const fs = require("fs")
const os = require("os")

class ConsoleApp {
  constructor(languagePath) {
    this._languagePath = languagePath
    this._languages = new TreeProgram(fs.readFileSync(languagePath, "utf8"))
  }

  _getRegistryPath() {
    return this._languagePath
  }

  getLanguages() {
    return this._languages
  }

  help() {
    const help = `command param description
check programPath Check a file for grammar errors
compile programPath Compile a file
create languageName Create a new Tree Language
help  Show help
list  List installed Tree Languages
history  List all Tree Programs ever parsed with this cli tool
register languageJsPath Register a new language
run programPath Execute a Tree Language Program
version  List installed Tree Notation version`
    console.log(TreeProgram.fromSsv(help).toTable())
  }

  list() {
    const languages = this.getLanguages().getKeywords()
    languages.sort()
    console.log(`# Tree Languages in ${this._getRegistryPath()}`)
    const ssv = TreeProgram.fromSsv("language path\n" + this.getLanguages().toString())
    console.log(ssv.toTable())
  }

  create(languageName) {
    // const stampProgramCode = `define LANG ${languageName}\n` + fs.readFileSync(__dirname + "/create.stamp", "utf8")
    // fs.mkdirSync(languageName)
    // todo: create template
    const languagePath = this.getLanguages().toObject().stamp
    TreeProgram.executeFile(__dirname + "/create.stamp", languagePath)
  }

  check(programPath) {
    this._logProgramPath(programPath)
    const languagePath = this._getLanguagePathOrThrow(programPath)
    const program = TreeProgram.makeProgram(programPath, languagePath)
    const errors = program.getProgramErrors()
    console.log(`${errors.length} errors for ${programPath} with grammar ${languagePath}`)
    if (errors.length) console.log(errors)
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

  history() {
    const data = fs.readFileSync(this._getLogFilePath(), "utf8")
    console.log(new TreeProgram(new TreeProgram(data.trim()).toObject()).getKeywords().join("\n"))
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

  version() {
    console.log(`TreeProgram version ${TreeProgram.getVersion()}`)
  }

  static _getFileExtension(url = "") {
    url = url.match(/\.([^\.]+)$/)
    return (url && url[1]) || ""
  }
}

module.exports = ConsoleApp
