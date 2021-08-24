const { AbstractTreeComponent } = require("../../products/TreeComponentFramework.node.js")
const { jtree } = require("../../index.js")

class FooterComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div Made with <3 for the Public Domain
 class FooterComponent`
  }
}

export { FooterComponent }
