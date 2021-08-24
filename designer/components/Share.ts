const { AbstractTreeComponent } = require("../../products/TreeComponentFramework.node.js")
const { jtree } = require("../../index.js")

import { CodeAndGrammarApp } from "./Types"

class ShareComponent extends AbstractTreeComponent {
  updateShareLink() {
    const url = new URL(location.href)
    url.hash = ""
    const base = url.toString()
    this.willowBrowser.setValueOfElementWithIdHack("shareLink", base + this.toShareLink())
  }

  get app() {
    return <CodeAndGrammarApp>this.getParent()
  }

  toShareLink() {
    const tree = new jtree.TreeNode()
    tree.appendLineAndChildren("grammar", this.app.grammarCode)
    tree.appendLineAndChildren("sample", this.app.codeCode)
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
  font-size 14px
  color #222
  padding 5px
  background-color #ddd
  border-radius 5px
  border 0
  width calc(100% - 70px)`
  }
}

export { ShareComponent }
