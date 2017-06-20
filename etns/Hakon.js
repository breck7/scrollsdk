"use strict"

if (typeof exports !== "undefined") var TreeNotation = require("../treenotation.js")

// tood: create a real ETN.

class HakonPropertyNode extends TreeNotation {
  toCss(spaces) {
    return `${spaces}${this.getHead()}: ${this.getTail()};`
  }
}

class HakonSelectorNode extends TreeNotation {
  parseNodeType(line) {
    if (line.includes(" ")) return HakonPropertyNode
    return HakonSelectorNode
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
    const propertyNodes = this.getChildrenByNodeType(HakonPropertyNode)
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
    return HakonSelectorNode
  }

  getSelector() {
    return ""
  }

  toCss() {
    return this.getTopDownArray().filter(node => node instanceof HakonSelectorNode).map(child => child.toCss()).join("")
  }
}

if (typeof exports !== "undefined") module.exports = Hakon
