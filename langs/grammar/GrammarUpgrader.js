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

          // update constants
          tree.forEach(node => {
            const constants = node.getNode("constants")
            if (constants) {
              constants.forEach(constant => {
                const words = constant.getWords()
                // todo: words[1] was not cell checked before, so this may surface errors.
                if (!constant.length) node.appendLine(`${words[1]} ${words[0]} ${words.slice(2).join(" ")}`)
                else {
                  node.appendLineAndChildren(`string ${words[0]}`, constant.childrenToString())
                }
              })
              constants.destroy()
            }
          })
          return tree
        }
      }
    }
  }
}

/*NODE_JS_ONLY*/ if (!module.parent)
  new GrammarUpgrader().upgradeManyInPlace([__dirname + "/../*/*.grammar"], "1.1.0", "1.2.0").forEach(item => console.log(item.path, item.tree.toString()))
module.exports = GrammarUpgrader
