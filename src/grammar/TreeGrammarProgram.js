const TreeProgram = require("../TreeProgram.js")
const fs = require("fs")
const TreeGrammar = fs.readFileSync(__dirname + "/TreeGrammar.grammar", "utf8")

class TreeGrammarProgram extends TreeProgram {
  getGrammarString() {
    return TreeGrammar
  }
}

module.exports = TreeGrammarProgram
