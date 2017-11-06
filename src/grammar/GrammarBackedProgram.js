const GrammarProgram = require("./GrammarProgram.js")
const TreeNode = require("../base/TreeNode.js")
const TreeUtils = require("../base/TreeUtils.js")
const GrammarBackedNonTerminalNode = require("./GrammarBackedNonTerminalNode.js")
const GrammarBackedTerminalNode = require("./GrammarBackedTerminalNode.js")

class GrammarBackedProgram extends TreeNode {
  getProgram() {
    return this
  }

  getProgramErrors() {
    const nodeErrors = this.getTopDownArray().map(node => node.getErrors())
    return [].concat.apply([], nodeErrors)
  }

  getGrammarProgram() {
    if (GrammarBackedProgram._grammarProgram) return GrammarBackedProgram._grammarProgram

    const anyGrammar = `any
 @description Default grammar
 @catchAllKeyword any
any
 @columns any*`

    GrammarBackedProgram._grammarProgram = new GrammarProgram(anyGrammar)
    return GrammarBackedProgram._grammarProgram
  }

  getKeywordMap() {
    return this.getDefinition().getRunTimeKeywordMap()
  }

  getCatchAllNodeClass(line) {
    // todo: blank line
    // todo: restore didyoumean
    return this.getDefinition().getRunTimeCatchAllNodeClass()
  }

  getErrorCount() {
    const grammarProgram = this.getDefinition()
    return {
      errorCount: this.getProgramErrors().length,
      name: grammarProgram.getExtensionName()
    }
  }

  // todo: implement
  _getNodeJoinCharacter() {
    return "\n"
  }

  compile(targetExtension) {
    return this.getChildren()
      .map(child => child.compile(targetExtension))
      .join(this._getNodeJoinCharacter())
  }

  async run() {}

  getDefinition() {
    return this.getGrammarProgram()
  }

  getGrammarUsage(filepath = "") {
    const usage = new GrammarBackedProgram()
    const grammarProgram = this.getGrammarProgram()
    const keywordDefinitions = grammarProgram.getChildren()
    keywordDefinitions.forEach(child => {
      usage.append([child.getWord(0), "line-id", "keyword", child.getBeamParameters().join(" ")].join(" "))
    })
    const programNodes = this.getTopDownArray()
    programNodes.forEach((programNode, lineNumber) => {
      const def = programNode.getDefinition()
      const keyword = def.getKeyword()
      const stats = usage.getNode(keyword)
      stats.append([filepath + "-" + lineNumber, programNode.getWords().join(" ")].join(" "))
    })
    return usage
  }

  getProgramWordTypeString() {
    return this.getTopDownArray()
      .map(child => child.getIndentation() + child.getWordTypeLine())
      .join("\n")
  }

  getWordTypeAtPosition(lineIndex, wordIndex) {
    this._initWordTypeCache()
    const typeNode = this._cache_typeTree.getTopDownArray()[lineIndex - 1]
    return typeNode ? typeNode.getWord(wordIndex - 1) : ""
  }

  _initWordTypeCache() {
    const treeMTime = this.getTreeMTime()
    if (this._cache_programWordTypeStringMTime === treeMTime) return undefined

    this._cache_typeTree = new GrammarBackedProgram(this.getProgramWordTypeString())
    this._cache_programWordTypeStringMTime = treeMTime
  }

  getCompiledProgramName(programPath) {
    const grammarProgram = this.getDefinition()
    return programPath.replace(`.${grammarProgram.getExtensionName()}`, `.${grammarProgram.getTargetExtension()}`)
  }

  getNodeClasses() {
    return {}
  }
}

GrammarBackedProgram.Utils = TreeUtils
GrammarBackedProgram.TreeNode = TreeNode
GrammarBackedProgram.NonTerminalNode = GrammarBackedNonTerminalNode
GrammarBackedProgram.TerminalNode = GrammarBackedTerminalNode

module.exports = GrammarBackedProgram
