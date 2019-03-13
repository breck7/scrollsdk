const jtree = require("../../index.js")

class additionNode extends jtree.NonTerminalNode {}
class LineOfCodeNode extends jtree.NonTerminalNode {}

const nodes = {}

nodes.additionNode = additionNode

nodes.LineOfCodeNode = LineOfCodeNode

module.exports = nodes
