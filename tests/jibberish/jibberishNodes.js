const jtree = require("../../index.js")

class additionNode extends jtree.NonTerminalNode {}
class LineOfCodeNode extends jtree.NonTerminalNode {}

const jibberishNodes = {}
jibberishNodes.additionNode = additionNode
jibberishNodes.LineOfCodeNode = LineOfCodeNode

module.exports = jibberishNodes
