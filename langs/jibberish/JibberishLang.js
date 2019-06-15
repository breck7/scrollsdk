const jtree = require("../../index.js")

class AdditionNode extends jtree.NonTerminalNode {}
class LineOfCodeNode extends jtree.NonTerminalNode {}
class SomeNestedNode extends jtree.NonTerminalNode {}

const nested = {}
nested.someNestedNode = SomeNestedNode

class JibberishProgramRoot extends jtree.GrammarBackedRootNode {
  executeSync() {
    return 42
  }
}

module.exports = {
  JibberishProgramRoot,
  AdditionNode,
  LineOfCodeNode,
  nested
}
