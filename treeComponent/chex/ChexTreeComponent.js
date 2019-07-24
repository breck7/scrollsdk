const { AbstractTreeComponentRootNode } = require("../TreeComponentFramework.js")

class ChexTreeComponent extends AbstractTreeComponentRootNode {
  getBuiltPath() {
    return ""
  }

  createParser() {
    return new TreeNode.Parser(this.constructor, {
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
