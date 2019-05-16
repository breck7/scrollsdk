const jtree = require("../../index.js")
const StumpConstants = require("./StumpConstants.js")

// Note: do NOT support things like solo tags <br>. one way to do things.

class StumpBernNode extends jtree.NonTerminalNode {
  _toHtml() {
    return this.childrenToString()
  }
}

class StumpAttributeNode extends jtree.TerminalNode {
  _toHtml() {
    return ""
  }

  getAttribute() {
    return ` ${this.getKeyword()}="${this.getContent()}"`
  }
}

// todo: make a stumpNode tile and separate stumpNode program
class StumpNode extends jtree.NonTerminalNode {
  getTag() {
    // we need to remove the "Tag" bit to handle the style and title attribute/tag conflict.
    const keyword = this.getKeyword()
    return StumpConstants.tagMap[keyword] || keyword
  }

  _childrenToHtml(indentCount) {
    return this.map(node => node._toHtml(indentCount)).join("")
  }

  toHtmlWithSuids() {
    if (this.isRoot()) return super.toHtml()
    return this._toHtml(undefined, true)
  }

  _getOneLiner() {
    const oneLinerWords = this.getWordsFrom(1)
    return oneLinerWords.length ? oneLinerWords.join(" ") : ""
  }

  shouldCollapse() {
    return this.has(StumpConstants.collapseNode)
  }

  _toHtml(indentCount, withSuid) {
    const tag = this.getTag()
    const children = this.map(child => child._toHtml(indentCount + 1, withSuid)).join("")
    const attributesStr = this.getChildrenByNodeConstructor(StumpAttributeNode)
      .map(child => child.getAttribute())
      .join("")
    const indent = " ".repeat(indentCount)
    const collapse = this.shouldCollapse()
    const indentForChildNodes = !collapse && this.getChildrenByNodeConstructor(StumpNode).length > 0
    const suid = withSuid ? ` ${StumpConstants.uidAttribute}="${this._getUid()}"` : ""
    const oneLiner = this._getOneLiner()
    return `${!collapse ? indent : ""}<${tag}${attributesStr}${suid}>${oneLiner}${
      indentForChildNodes ? "\n" : ""
    }${children}</${tag}>${collapse ? "" : "\n"}`
  }

  removeCssStumpNode() {
    return this.removeStumpNode()
  }

  removeStumpNode() {
    this.getShadow().removeShadow()
    return this.destroy()
  }

  getNodeByGuid(guid) {
    return this.getTopDownArray().find(node => node._getUid() === guid)
  }

  addClassToStumpNode(className) {
    const classNode = this.touchNode(StumpConstants.class)
    const words = classNode.getWords()
    if (words.includes(className)) return this
    classNode.setWord(words.length, className)
    this.getShadow().addClassToShadow(className)
    return this
  }

  removeClassFromStumpNode(className) {
    const classNode = this.getNode(StumpConstants.class)
    if (!classNode) return this
    const newClasses = classNode.getLine().replace(" " + className, "")
    if (newClasses === StumpConstants.class) classNode.destroy()
    else classNode.setLine(newClasses)
    this.getShadow().removeClassFromShadow(className)
    return this
  }

  stumpNodeHasClass(className) {
    const classNode = this.getNode(StumpConstants.class)
    return classNode && classNode.getWords().includes(className) ? true : false
  }

  isStumpNodeCheckbox() {
    return this.get(StumpConstants.type) === StumpConstants.checkbox
  }

  getShadow() {
    if (!this._shadow) {
      const shadowClass = this.getShadowClass()
      this._shadow = new shadowClass(this)
    }
    return this._shadow
  }

  insertCssChildNode(text, index) {
    return this.insertChildNode(text, index)
  }

  insertChildNode(text, index) {
    const singleNode = new jtree.TreeNode(text).getChildren()[0]
    const newNode = this.insertLineAndChildren(singleNode.getLine(), singleNode.childrenToString(), index)
    const stumpNodeIndex = this.getChildrenByNodeConstructor(StumpNode).indexOf(newNode)
    this.getShadow().insertHtmlNode(newNode, stumpNodeIndex)
    return newNode
  }

  isInputType() {
    return StumpConstants.inputTypes.includes(this.getTag()) || this.get(StumpConstants.contenteditable) === "true"
  }

  findStumpNodeByChild(line) {
    return this.findStumpNodesByChild(line)[0]
  }

  findStumpNodeByChildString(line) {
    return this.getTopDownArray().find(node =>
      node
        .map(child => child.getLine())
        .join("\n")
        .includes(line)
    )
  }

  findStumpNodeByKeyword(keyword) {
    return this._findStumpNodesByBase(keyword)[0]
  }

  _findStumpNodesByBase(keyword) {
    return this.getTopDownArray().filter(node => node instanceof StumpNode && node.getKeyword() === keyword)
  }

  hasLine(line) {
    return this.getChildren().some(node => node.getLine() === line)
  }

  findStumpNodesByChild(line) {
    return this.getTopDownArray().filter(node => node instanceof StumpNode && node.hasLine(line))
  }

  findStumpNodesWithClass(className) {
    return this.getTopDownArray().filter(
      node =>
        node instanceof StumpNode &&
        node.has(StumpConstants.class) &&
        node
          .getNode(StumpConstants.class)
          .getWords()
          .includes(className)
    )
  }

  getShadowClass() {
    return this.getParent().getShadowClass()
  }

  getLines(start = 0, end) {
    return this.toString()
      .split("\n")
      .slice(start, end)
      .join("\n")
  }

  // todo: should not be here
  getStumpNodeChisel() {
    return this._chisel || this.getParent().getStumpNodeChisel()
  }

  // todo: should not be here
  setStumpNodeChisel(chisel) {
    this._chisel = chisel
    return this
  }

  setStumpNodeCss(css) {
    this.getShadow().setShadowCss(css)
    return this
  }

  getStumpNodeCss(prop) {
    return this.getShadow().getShadowCss(prop)
  }

  getStumpNodeAttr(key) {
    return this.get(key)
  }

  setStumpNodeAttr(key, value) {
    // todo
    return this
  }

  toHtml() {
    return this._toHtml()
  }
}

class StumpProgramRoot extends jtree.programRoot {
  compile() {
    return this.toHtml()
  }
}

module.exports = {
  StumpBernNode,
  StumpProgramRoot,
  StumpAttributeNode,
  StumpConstants,
  StumpNode
}
