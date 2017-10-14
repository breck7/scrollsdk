const TreeProgram = require("./treeprogram.js")
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

  compile(programPath) {
    // todo: bring blaze and grammar into tp library
  }

  run(programPath) {
    const extension = ConsoleApp._getFileExtension(programPath)
    const languagePath = this.getLanguages()[extension]
    if (!languagePath) throw new Error(`No installed language for '${extension}'`)
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
