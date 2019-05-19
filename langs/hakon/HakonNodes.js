const jtree = require("../../index.js")

class HakonPropertyNode extends jtree.TerminalNode {
  compile(spaces) {
    return `${spaces}${this.getFirstWord()}: ${this.getContent()};`
  }
}

class HakonSelectorNode extends jtree.NonTerminalNode {
  getSelector() {
    const parentSelector = this.getParent().getSelector()

    return this.getFirstWord()
      .split(",")
      .map(part => {
        if (part.startsWith("&")) return parentSelector + part.substr(1)
        return parentSelector ? parentSelector + " " + part : part
      })
      .join(",")
  }
  compile() {
    const propertyNodes = this.getChildrenByNodeConstructor(HakonPropertyNode)
    if (!propertyNodes.length) return ""
    const spaces = "  "
    return `${this.getSelector()} {
${propertyNodes.map(child => child.compile(spaces)).join("\n")}
}\n`
  }
}

class HakonProgramRoot extends jtree.programRoot {
  getSelector() {
    return ""
  }
  compile() {
    return this.getTopDownArray()
      .filter(node => node instanceof HakonSelectorNode)
      .map(child => child.compile())
      .join("")
  }
}

module.exports = {
  HakonProgramRoot,
  HakonSelectorNode,
  HakonPropertyNode
}
