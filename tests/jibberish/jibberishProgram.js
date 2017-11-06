const AbstractGrammarBackedProgram = require("../../src/grammar/AbstractGrammarBackedProgram.js")

class jibberishProgram extends AbstractGrammarBackedProgram {
  executeSync() {
    return 42
  }
}

module.exports = jibberishProgram
