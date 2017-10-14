const TreeProgram = require("./index.js")
const fs = require("fs")

class ConsoleApp {
  constructor(languagesObj = {}) {
    this._languages = languagesObj
  }

  getLanguages() {
    return this._languages
  }

  help() {
    const commands = [
      "help - Show help",
      "compile [programPath] - Compile a file",
      "check [programPath] - Check a file for grammar errors",
      "run [programPath] - Execute a Tree Language Program",
      "create [languageName] - Create a new Tree Language",
      "list - List installed Tree Languages",
      "version - List installed Tree Notation version"
    ]
    commands.sort()
    console.log("The following commands are available:")
    console.log(commands.join("\n"))
  }

  list() {
    const languages = Object.keys(this.getLanguages())
    languages.sort()
    console.log("The following Tree Languages are installed on your system:")
    console.log(languages.join("\n"))
  }

  create(languageName) {
    fs.mkdirSync(languageName)
    // todo: create template
  }

  check() {
    // todo: bring blaze and grammar into tp library
  }

  _getLanguagePathOrThrow(programPath) {
    const extension = ConsoleApp._getFileExtension(programPath)
    const languagePath = this.getLanguages()[extension]
    if (!languagePath) throw new Error(`No installed language for '${extension}'`)
    return languagePath
  }

  compile(programPath) {
    const languagePath = this._getLanguagePathOrThrow(programPath)
    const program = TreeProgram.makeProgram(programPath, languagePath)
    program.delete("#!")
    const path = program.getCompiledProgramName(programPath)
    fs.writeFileSync(path, program.compile(), "utf8")
  }

  run(programPath) {
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
