

class ChexTreeComponent extends AbstractTreeComponentRootNode {
  getBuiltPath() {
    return ""
  }

  getFirstWordMap() {
    const map = {}
    map.footer = footer
    return map
  }
}

class footer extends AbstractTreeComponentRootNode {
  getStumpCode() {
    return `div The Chex Footer`
  }
}

window.ChexTreeComponent
 = ChexTreeComponent
