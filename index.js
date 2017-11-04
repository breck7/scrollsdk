const fs = require("fs")

const TreeProgram = require("./src/TreeProgram.js")
const GrammarProgram = require("./src/grammar/GrammarProgram.js")

TreeProgram.executeFile = (programPath, grammarPath) =>
  TreeProgram.makeProgram(programPath, grammarPath).execute(programPath)

TreeProgram.makeProgram = (programPath, grammarPath) => {
  const programClass = TreeProgram.getProgramClassFromGrammarFile(grammarPath)
  const code = fs.readFileSync(programPath, "utf8")
  return new programClass(code)
}

TreeProgram.getProgramClassFromGrammarFile = grammarPath => {
  // todo: handle different route node
  const grammarCode = fs.readFileSync(grammarPath, "utf8")
  const expandedGrammarCode = new TreeProgram(grammarCode).getExpanded()
  const grammarProgram = new GrammarProgram(expandedGrammarCode, grammarPath)
  const extendedClass = grammarProgram.getParserClass() || TreeProgram
  return class extends extendedClass {
    getGrammarProgram() {
      return grammarProgram
    }
  }
}

module.exports = TreeProgram
