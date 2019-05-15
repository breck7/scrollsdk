const jtree = require("../../index.js")

const CommandArgNode = require("./CommandArgNode.js")

class CommandNode extends jtree.NonTerminalNode {
  getTestBlock() {
    return this.getParent()
  }

  getEqualFn() {
    return this.getTestBlock().getEqualFn()
  }

  _getArgs() {
    const argNodes = this.getChildrenByNodeConstructor(CommandArgNode)
    if (argNodes.length) return argNodes.map(arg => arg.childrenToString())
    return this.getWordsFrom(1)
  }

  _executeSwarmCommand(dummy) {
    const command = this.getKeyword()
    const commandParent = this.getRootNode().getCommandParent(dummy) // todo: hacky.
    const commandFn = commandParent[command]
    return commandFn.apply(commandParent, this._getArgs())
  }

  async execute(dummy) {
    await this._executeSwarmCommand(dummy)
    return super.execute(dummy) // note: this might not work with closure compiler b/c of bug #2652
  }

  executeSync(dummy) {
    const newDummy = this._executeSwarmCommand(dummy)
    this.map(child => child.executeSync(newDummy))
  }
}

module.exports = CommandNode
