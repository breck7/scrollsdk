const readline = require("readline")
const jtree = require("../../index.js")

class PromptNode extends jtree.TerminalNode {
  execute() {
    return new Promise((res, rej) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      rl.question(this.cells.promptWords.join(" ") + " ", answer => {
        rl.close()
        // todo: typecheck the response
        const varName = this.cells.varName
        this.getYoungerSiblings().forEach(node =>
          node.replaceNode(str => str.replace(new RegExp(varName, "g"), answer))
        )
        res()
      })
    })
  }
}

module.exports = PromptNode
