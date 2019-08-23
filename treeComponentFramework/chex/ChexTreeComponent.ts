const { AbstractTreeComponentRootNode } = require("../TreeComponentFramework")
const jtree = require("../../products/jtree.node.js")

class ChexTreeComponent extends AbstractTreeComponentRootNode {
  getBuiltPath() {
    return ""
  }

  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      footer: footer
    })
  }
}

class footer extends AbstractTreeComponentRootNode {
  getStumpCode() {
    return `div The Chex Footer`
  }
}

export { ChexTreeComponent }
