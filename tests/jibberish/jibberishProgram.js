const GrammarBackedProgram = require("../../src/grammar/GrammarBackedProgram.js")

class jibberishProgram extends GrammarBackedProgram {
  executeSync() {
    return 42
  }
}

module.exports = jibberishProgram
