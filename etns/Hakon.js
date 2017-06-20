const TreeNotation = require("../treenotation.js")

// tood: create a real ETN.

class PropertyNode extends TreeNotation {
  toCss(spaces) {
    return `${spaces}${this.getHead()}: ${this.getTail()};`
  }
}

class SelectorNode extends TreeNotation {
  parseNodeType(line) {
    if (line.includes(" ")) return PropertyNode
    return SelectorNode
  }

  getSelector() {
    const parentSelector = this.getParent().getSelector()

    const head = this.getHead()
    const selector = head
      .split(",")
      .map(part => {
        if (part.startsWith("&")) return parentSelector + part.substr(1)
        return parentSelector ? parentSelector + " " + part : part
      })
      .join(",")
    return selector
  }

  toCss() {
    const propertyNodes = this.getChildrenByNodeType(PropertyNode)
    if (!propertyNodes.length) return ""
    const spaces = "  "
    return `${this.getSelector()} {
${propertyNodes.map(child => child.toCss(spaces)).join("\n")}
}\n`
  }
}

class Hakon extends TreeNotation {
  parseNodeType(line) {
    if (!line) return TreeNotation
    return SelectorNode
  }

  getSelector() {
    return ""
  }

  toCss() {
    return this.getTopDownArray().filter(node => node instanceof SelectorNode).map(child => child.toCss()).join("")
  }
}

module.exports = Hakon
