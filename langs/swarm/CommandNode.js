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

  _executeSwarmCommand(testSubject) {
    const command = this.getFirstWord()
    const commandParent = this.getRootNode().getCommandParent(testSubject) // todo: hacky.
    const commandFn = commandParent[command]
    if (!commandFn) throw new Error(`No function "${command}" on "${commandParent.constructor.name}`)
    return commandFn.apply(commandParent, this._getArgs())
  }

  async execute(testSubject) {
    await this._executeSwarmCommand(testSubject)
    return super.execute(testSubject) // note: this might not work with closure compiler b/c of bug #2652
  }

  executeSync(testSubject) {
    const newTestSubject = this._executeSwarmCommand(testSubject)
    this.map(child => child.executeSync(newTestSubject))
  }
}

module.exports = CommandNode
