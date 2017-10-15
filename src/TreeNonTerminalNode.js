const DynamicNode = require("./DynamicNode.js")

class TreeNonTerminalNode extends DynamicNode {
  getKeywordMap() {
    return this.getDefinition().getRunTimeKeywordMap()
  }

  getCatchAllNodeClass(line) {
    return this.getDefinition().getRunTimeCatchAllNodeClass()
  }

  compile() {
    const definition = this.getDefinition()
    const openChildrenString = definition.getOpenChildrenString()
    const closeChildrenString = definition.getCloseChildrenString()

    const compiledLine = this.getCompiledLine()
    const indent = this.getCompiledIndentation()

    const compiledChildren = this.getChildren()
      .map(child => child.compile())
      .join("\n")

    return `${indent}${compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`
  }
}

module.exports = TreeNonTerminalNode
