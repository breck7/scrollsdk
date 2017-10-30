const TreeNode = require("./TreeNode.js")

const GrammarProgram = require("./grammar/GrammarProgram.js")

class AnyProgram extends TreeNode {
  getProgram() {
    return this
  }

  getGrammarString() {
    return `any
 @description Default grammar
 @catchAllKeyword any
any
 @parameters any*`
  }

  getProgramErrors() {
    const nodeErrors = this.getTopDownArray().map(node => node.getErrors())
    return [].concat.apply([], nodeErrors)
  }

  getGrammarProgram() {
    if (!AnyProgram._grammarProgram) AnyProgram._grammarProgram = new GrammarProgram(this.getGrammarString())
    return AnyProgram._grammarProgram
  }
}

module.exports = AnyProgram
