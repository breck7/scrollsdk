if (typeof jtree === "undefined") jtree = require("../../index.js")

class AddNode extends jtree.NonTerminalNode {}
class LineOfCodeNode extends jtree.NonTerminalNode {}
class NestedNode extends jtree.NonTerminalNode {}

class JibberishProgramRoot extends jtree.GrammarBackedRootNode {
  executeSync() {
    return 42
  }
}

if (typeof module !== "undefined")
  module.exports = {
    JibberishProgramRoot,
    AddNode,
    LineOfCodeNode,
    NestedNode
  }
else {
  window.JibberishProgramRoot = JibberishProgramRoot
  window.AddNode = AddNode
  window.LineOfCodeNode = LineOfCodeNode
  window.NestedNode = NestedNode
}
