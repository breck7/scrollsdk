const TreeNode = require("../base/TreeNode.js")

class AbstractGrammarBackedProgram extends TreeNode {
  getProgram() {
    return this
  }

  getProgramErrors() {
    const nodeErrors = this.getTopDownArray().map(node => node.getErrors())
    return [].concat.apply([], nodeErrors)
  }

  getKeywordMap() {
    return this.getDefinition().getRunTimeKeywordMap()
  }

  getCatchAllNodeClass(line) {
    // todo: blank line
    // todo: restore didyoumean
    return this.getDefinition().getRunTimeCatchAllNodeClass()
  }

  getDefinition() {
    return this.getGrammarProgram()
  }

  getKeywordUsage(filepath = "") {
    const usage = new TreeNode()
    const grammarProgram = this.getGrammarProgram()
    const keywordDefinitions = grammarProgram.getKeywordDefinitions()
    keywordDefinitions.forEach(child => {
      usage.appendLine([child.getWord(0), "line-id", "keyword", child.getBeamParameters().join(" ")].join(" "))
    })
    const programNodes = this.getTopDownArray()
    programNodes.forEach((programNode, lineNumber) => {
      const def = programNode.getDefinition()
      const keyword = def.getKeyword()
      const stats = usage.getNode(keyword)
      stats.appendLine([filepath + "-" + lineNumber, programNode.getWords().join(" ")].join(" "))
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

    this._cache_typeTree = new TreeNode(this.getProgramWordTypeString())
    this._cache_programWordTypeStringMTime = treeMTime
  }

  getCompiledProgramName(programPath) {
    const grammarProgram = this.getDefinition()
    return programPath.replace(`.${grammarProgram.getExtensionName()}`, `.${grammarProgram.getTargetExtension()}`)
  }
}

module.exports = AbstractGrammarBackedProgram
