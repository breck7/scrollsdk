if (typeof jtree === "undefined") jtree = require("../../index.js")

class add extends jtree.NonTerminalNode {}
class lineOfCode extends jtree.NonTerminalNode {}
class nested extends jtree.NonTerminalNode {}

class JibberishProgramRoot extends jtree.GrammarBackedRootNode {
  executeSync() {
    return 42
  }
}

if (typeof module !== "undefined")
  module.exports = {
    JibberishProgramRoot,
    add,
    lineOfCode,
    nested
  }
else {
  window.JibberishProgramRoot = JibberishProgramRoot
  window.add = add
  window.lineOfCode = lineOfCode
  window.nested = nested
}
