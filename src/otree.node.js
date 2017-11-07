const fs = require("fs")

const otree = require("./otree.js")
const GrammarProgram = require("./grammar/GrammarProgram.js")

otree.executeFile = (programPath, grammarPath) => otree.makeProgram(programPath, grammarPath).execute(programPath)

otree.makeProgram = (programPath, grammarPath) => {
  const programClass = otree.getProgramClassFromGrammarFile(grammarPath)
  const code = fs.readFileSync(programPath, "utf8")
  return new programClass(code)
}

otree.getParser = grammarPath => {
  const grammarCode = fs.readFileSync(grammarPath, "utf8")
  const expandedGrammarCode = new otree.TreeNode(grammarCode).getExpanded()
  const grammarProgram = new GrammarProgram(expandedGrammarCode, grammarPath)
  return grammarProgram.getRootParserClass()
}

module.exports = otree
