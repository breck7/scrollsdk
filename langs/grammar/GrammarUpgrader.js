#! /usr/local/bin/node --use_strict

const jtree = require("../../index.js")

class GrammarUpgrader extends jtree.Upgrader {
  getUpgradeFromMap() {
    return {
      "1.1.0": {
        "1.2.0": tree => {
          // update nodeTypes
          // todo: need to preserve history of grammars to have celltype safe upgrades.
          tree.forEach(node => {
            const types = node.getNode("nodeTypes")
            if (types) {
              types.setFirstWord("inScope")
              types.setContent(types.getFirstWords().join(" "))
              types.deleteChildren()
            }
          })
          return tree
        }
      }
    }
  }
}

/*NODE_JS_ONLY*/ if (!module.parent)
  new GrammarUpgrader().upgradeManyPreview([__dirname + "/../*/*.grammar"], "1.1.0", "1.2.0").forEach(item => console.log(item.path, item.tree.toString()))
module.exports = GrammarUpgrader
