const { AbstractTreeComponent } = require("../../products/TreeComponentFramework.node.js")

class ErrorDisplayComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 id ErrorDisplayComponent`
  }
  toHakonCode() {
    return `#ErrorDisplayComponent
 color red`
  }
}

export { ErrorDisplayComponent }
