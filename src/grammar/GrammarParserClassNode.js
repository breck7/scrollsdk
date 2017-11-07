const TreeNode = require("../base/TreeNode.js")
const TreeUtils = require("../base/TreeUtils.js")

const GrammarBackedNonTerminalNode = require("./GrammarBackedNonTerminalNode.js")
const GrammarBackedTerminalNode = require("./GrammarBackedTerminalNode.js")
const GrammarBackedErrorNode = require("./GrammarBackedErrorNode.js")

class GrammarParserClassNode extends TreeNode {
  getParserClassFilePath() {
    return this.getWord(2)
  }

  getSubModuleName() {
    return this.getWord(3)
  }

  _getNodeClasses() {
    const builtIns = {
      ErrorNode: GrammarBackedErrorNode,
      TerminalNode: GrammarBackedTerminalNode,
      NonTerminalNode: GrammarBackedNonTerminalNode
    }

    return builtIns
  }

  getParserClass() {
    const filepath = this.getParserClassFilePath()
    const builtIns = this._getNodeClasses()
    const builtIn = builtIns[filepath]

    if (builtIn) return builtIn

    const rootPath = this.getRootNode().getTheGrammarFilePath()

    const basePath = TreeUtils.getPathWithoutFileName(rootPath) + "/"
    const fullPath = filepath.startsWith("/") ? filepath : basePath + filepath

    // todo: remove "window" below?
    return this.isNodeJs() ? require(fullPath) : window[TreeUtils.getClassNameFromFilePath(filepath)]
  }
}

module.exports = GrammarParserClassNode
