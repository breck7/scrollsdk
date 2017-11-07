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
    if (!this.isNodeJs()) return window[TreeUtils.getClassNameFromFilePath(filepath)]

    const theModule = require(fullPath)
    const subModule = this.getSubModuleName()
    return subModule ? theModule[subModule] : theModule
  }
}

module.exports = GrammarParserClassNode
