const jtree = require("../../index.js")

class additionNode extends jtree.NonTerminalNode {}
class LineOfCodeNode extends jtree.NonTerminalNode {}
class SomeNestedNode extends jtree.NonTerminalNode {}

const jibberishNodes = {}
jibberishNodes.additionNode = additionNode
jibberishNodes.LineOfCodeNode = LineOfCodeNode

jibberishNodes.nested = {}
jibberishNodes.nested.someNestedNode = SomeNestedNode

module.exports = jibberishNodes
