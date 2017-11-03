const fs = require("fs")

const TreeProgram = require("./TreeProgram.js")

class TreeTools {
  static executeFile(programPath, languagePath) {
    const program = this.makeProgram(programPath, languagePath)
    return program.execute(programPath)
  }

  static makeProgram(programPath, languagePath) {
    const languageClass = require(languagePath)
    const code = fs.readFileSync(programPath, "utf8")
    return new languageClass(code)
  }

  static getGrammarErrors(programPath, grammarFilePath) {
    class TemporaryLanguageFromGrammarFileProgram extends TreeProgram {
      getGrammarString() {
        return removeFirstLine(fs.readFileSync(grammarFilePath, "utf8"))
      }
    }
    let source = fs.readFileSync(programPath, "utf8")
    const program = new TemporaryLanguageFromGrammarFileProgram(source)
    return program.getProgramErrors()
  }
}

module.exports = TreeTools
