const { AbstractTreeComponentRootNode } = require("../TreeComponentFramework.js")

class ChexTreeComponent extends AbstractTreeComponentRootNode {
  getBuiltPath() {
    return ""
  }

  createParser() {
    return new TreeNode.Parser(undefined, {
      footer: footer
    })
  }
}

class footer extends AbstractTreeComponentRootNode {
  getStumpCode() {
    return `div The Chex Footer`
  }
}

module.exports = ChexTreeComponent
