// todo: manually copied in.
const jtree = require("../../index.js")

class HakonPropertyNode extends jtree.TerminalNode {
  toCss(spaces) {
    return `${spaces}${this.getKeyword()}: ${this.getContent()};`
  }
}

class HakonSelectorNode extends jtree.NonTerminalNode {
  getSelector() {
    const parentSelector = this.getParent().getSelector()

    return this.getKeyword()
      .split(",")
      .map(part => {
        if (part.startsWith("&")) return parentSelector + part.substr(1)
        return parentSelector ? parentSelector + " " + part : part
      })
      .join(",")
  }

  toCss() {
    const propertyNodes = this.getChildrenByNodeType(HakonPropertyNode)
    if (!propertyNodes.length) return ""
    const spaces = "  "
    return `${this.getSelector()} {
${propertyNodes.map(child => child.toCss(spaces)).join("\n")}
}\n`
  }
}

class HakonProgram extends jtree.program {
  getSelector() {
    return ""
  }

  toCss() {
    return this.getTopDownArray()
      .filter(node => node instanceof HakonSelectorNode)
      .map(child => child.toCss())
      .join("")
  }
}

module.exports = {
  HakonProgram,
  HakonSelectorNode,
  HakonPropertyNode
}
