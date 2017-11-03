const DynamicNode = require("./DynamicNode.js")

class TreeNonTerminalNode extends DynamicNode {
  getKeywordMap() {
    return this.getDefinition().getRunTimeKeywordMap()
  }

  getCatchAllNodeClass(line) {
    return this.getDefinition().getRunTimeCatchAllNodeClass()
  }

  // todo: implement
  _getNodeJoinCharacter() {
    return "\n"
  }

  compile(targetExtension) {
    const compiler = this.getCompilerNode(targetExtension)
    const openChildrenString = compiler.getOpenChildrenString()
    const closeChildrenString = compiler.getCloseChildrenString()

    const compiledLine = this.getCompiledLine(targetExtension)
    const indent = this.getCompiledIndentation(targetExtension)

    const compiledChildren = this.getChildren()
      .map(child => child.compile(targetExtension))
      .join(this._getNodeJoinCharacter())

    return `${indent}${compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`
  }
}

module.exports = TreeNonTerminalNode
