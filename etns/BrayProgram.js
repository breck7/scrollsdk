const TreeProgram = require("../treeprogram.js")

class BrayContentNode extends TreeProgram {
  _toHtml() {
    return this.getBeamWithChildren()
  }
}

class BrayAttributeNode extends TreeProgram {
  _toHtml() {
    return ""
  }

  getAttribute() {
    return ` ${this.getBase()}="${this.getBeam()}"`
  }
}

class BrayProgram extends TreeProgram {
  getTag() {
    return this.getWord(1)
  }

  parseNodeType(line) {
    if (line.startsWith(">")) return BrayProgram
    if (line.startsWith("content")) return BrayContentNode
    return BrayAttributeNode
  }

  getId() {
    return this.getWord(2)
  }

  getClasses() {
    return this.getWords(3).join(" ")
  }

  getChildInstances(type) {
    return this.getChildren().filter(child => child instanceof type)
  }

  _toHtml(indentCount) {
    const tag = this.getTag()
    const children = this.getChildren().map(child => child._toHtml(indentCount + 1)).join("")
    const attributesStr = this.getChildInstances(BrayAttributeNode).map(child => child.getAttribute()).join("")
    const id = this.getId()
    const classes = this.getClasses()
    const idStr = id ? ` id="${id}"` : ""
    const classesStr = classes ? ` classes="${classes}"` : ""
    const indent = " ".repeat(indentCount)
    return `${indent}<${tag}${idStr}${classesStr}${attributesStr}>${children}</${tag}>\n`
  }
}

module.exports = BrayProgram
