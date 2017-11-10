const AbstractGrammarDefinitionNode = require("./AbstractGrammarDefinitionNode.js")
const GrammarConstants = require("./GrammarConstants.js")

class GrammarWordTypeNode extends AbstractGrammarDefinitionNode {
  isValid(str, runTimeGrammarBackedProgram) {
    str = str.replace(/\*$/, "") // todo: cleanup
    if (this._regex) return str.match(this._regex)
    if (this._keywordTable) return this._keywordTable[str] === true
    // todo: add symbol table lookup.
    if (this.has(GrammarConstants.keywordTable)) {
      this._keywordTable = this._getKeywordTable(runTimeGrammarBackedProgram)
      return this._keywordTable[str] === true
    }
    if (!this._regex) this._regex = new RegExp(this._getRegex())
    return str.match(this._regex)
  }

  _getKeywordTable(runTimeGrammarBackedProgram) {
    // @keywordTable @wordType 1
    const tableInstructions = this.getNode(GrammarConstants.keywordTable)
    const nodeType = tableInstructions.getWord(1)
    const wordIndex = parseInt(tableInstructions.getWord(2))
    const table = {}
    runTimeGrammarBackedProgram.findNodes(nodeType).forEach(node => {
      table[node.getWord(wordIndex)] = true
    })
    return table
  }

  _getRegex() {
    return this.findBeam(GrammarConstants.regex)
  }

  getTypeId() {
    return this.getWord(1)
  }
}

module.exports = GrammarWordTypeNode
