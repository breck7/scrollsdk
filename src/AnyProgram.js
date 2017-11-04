const TreeNode = require("./TreeNode.js")

const GrammarProgram = require("./grammar/GrammarProgram.js")

class AnyProgram extends TreeNode {
  getProgram() {
    return this
  }

  getProgramErrors() {
    const nodeErrors = this.getTopDownArray().map(node => node.getErrors())
    return [].concat.apply([], nodeErrors)
  }

  getGrammarProgram() {
    if (AnyProgram._grammarProgram) return AnyProgram._grammarProgram

    const anyGrammar = `any
 @description Default grammar
 @catchAllKeyword any
any
 @columns any*`

    AnyProgram._grammarProgram = new GrammarProgram(anyGrammar)
    return AnyProgram._grammarProgram
  }
}

module.exports = AnyProgram
