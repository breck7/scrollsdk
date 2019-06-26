if (typeof jtree === "undefined") jtree = require("../../index.js")

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

if (typeof module !== "undefined")
  module.exports = {
    JibberishProgramRoot,
    AdditionNode,
    LineOfCodeNode,
    nested
  }
else {
  window.JibberishProgramRoot = JibberishProgramRoot
  window.AdditionNode = AdditionNode
  window.LineOfCodeNode = LineOfCodeNode
  window.nested = nested
}
