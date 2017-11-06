const fs = require("fs")

const GrammarBackedProgram = require("./grammar/GrammarBackedProgram.js")
const GrammarProgram = require("./grammar/GrammarProgram.js")

GrammarBackedProgram.executeFile = (programPath, grammarPath) => {
  const program = GrammarBackedProgram.makeProgram(programPath, grammarPath)
  program.execute(programPath)
}

GrammarBackedProgram.makeProgram = (programPath, grammarPath) => {
  const programClass = GrammarBackedProgram.getProgramClassFromGrammarFile(grammarPath)
  const code = fs.readFileSync(programPath, "utf8")
  return new programClass(code)
}

GrammarBackedProgram.getProgramClassFromGrammarFile = grammarPath => {
  // todo: handle different route node
  const grammarCode = fs.readFileSync(grammarPath, "utf8")
  const expandedGrammarCode = new GrammarBackedProgram(grammarCode).getExpanded()
  const grammarProgram = new GrammarProgram(expandedGrammarCode, grammarPath)
  const extendedClass = grammarProgram.getRootParserClass() || GrammarBackedProgram
  return class extends extendedClass {
    getGrammarProgram() {
      return grammarProgram
    }
  }
}

module.exports = GrammarBackedProgram
