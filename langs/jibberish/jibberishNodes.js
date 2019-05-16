const jtree = require("../../index.js")

class additionNode extends jtree.NonTerminalNode {}
class LineOfCodeNode extends jtree.NonTerminalNode {}
class SomeNestedNode extends jtree.NonTerminalNode {}

const nested = {}
nested.someNestedNode = SomeNestedNode

module.exports = {
  additionNode,
  LineOfCodeNode,
  nested
}
