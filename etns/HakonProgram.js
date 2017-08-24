const TreeProgram = require("../treeprogram.js")

// tood: create a real ETN.

class HakonPropertyNode extends TreeProgram {
  toCss(spaces) {
    return `${spaces}${this.getBase()}: ${this.getBeam()};`
  }
}

class HakonSelectorNode extends TreeProgram {
  parseNodeType(line) {
    if (line.includes(" ")) return HakonPropertyNode
    return HakonSelectorNode
  }

  getSelector() {
    const parentSelector = this.getParent().getSelector()

    const head = this.getBase()
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
    const propertyNodes = this.getChildrenByNodeType(HakonPropertyNode)
    if (!propertyNodes.length) return ""
    const spaces = "  "
    return `${this.getSelector()} {
${propertyNodes.map(child => child.toCss(spaces)).join("\n")}
}\n`
  }
}

class HakonProgram extends TreeProgram {
  parseNodeType(line) {
    if (!line) return TreeProgram
    return HakonSelectorNode
  }

  getSelector() {
    return ""
  }

  toCss() {
    return this.getTopDownArray().filter(node => node instanceof HakonSelectorNode).map(child => child.toCss()).join("")
  }
}

module.exports = HakonProgram
