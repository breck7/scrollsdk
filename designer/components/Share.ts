const { AbstractTreeComponent } = require("../../products/TreeComponentFramework.node.js")
const { jtree } = require("../../index.js")

class ShareComponent extends AbstractTreeComponent {
  private _updateShareLink() {
    const url = new URL(location.href)
    url.hash = ""
    const base = url.toString()
    this.willowBrowser.setValueOfElementWithIdHack("shareLink", base + this.toShareLink())
  }

  toShareLink() {
    const tree = new jtree.TreeNode()
    tree.appendLineAndChildren("grammar", this.getGrammarCode())
    tree.appendLineAndChildren("sample", this.getCodeValue())
    return "#" + encodeURIComponent(tree.toString())
  }

  toStumpCode() {
    return `div
 id shareDiv
 span Share
 input
  id shareLink
  readonly`
  }
  toHakonCode() {
    return `#shareDiv
 font-size 16px
 width 100%
 span
  width 50px
  display inline-block
 input
  font-size 16px
  padding 5px
  width calc(100% - 70px)`
  }
}

export { ShareComponent }
