const fs = require("fs")

const jtree = require("./jtree.js")
const GrammarProgram = require("./grammar/GrammarProgram.js")

jtree.executeFile = (programPath, grammarPath) => jtree.makeProgram(programPath, grammarPath).execute(programPath)

jtree.makeProgram = (programPath, grammarPath) => {
  const programClass = jtree.getParser(grammarPath)
  const code = fs.readFileSync(programPath, "utf8")
  return new programClass(code)
}

jtree.getParser = grammarPath => {
  const grammarCode = fs.readFileSync(grammarPath, "utf8")
  const grammarProgram = GrammarProgram.newFromCondensed(grammarCode, grammarPath)
  return grammarProgram.getRootParserClass()
}

jtree.GrammarProgram = GrammarProgram

module.exports = jtree
