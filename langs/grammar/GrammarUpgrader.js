#! /usr/local/bin/node --use_strict

const jtree = require("../../index.js")

class GrammarUpgrader extends jtree.Upgrader {
  getUpgradeFromMap() {
    return {
      "2.0.0": {
        "3.0.0": tree => {
          tree.findNodes("abstract").forEach(node => {
            node.appendLine("abstract")
            node.setWord(0, "nodeType")
          })
          return tree
        }
      },
      "1.2.0": {
        "2.0.0": tree => {
          const moveExtend = node => {
            const extendsId = node.getWord(2)
            if (extendsId) {
              node.appendLine(`extends ` + extendsId)
              node.deleteWordAt(2)
            }
          }
          tree.findNodes("nodeType").forEach(moveExtend)
          tree.findNodes("cellType").forEach(moveExtend)
          tree.findNodes("abstract").forEach(moveExtend)
          return tree
        }
      },
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

          // todo: blob to baseNodeType blob, constructors js errorNode

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
  new GrammarUpgrader().upgradeManyInPlace([__dirname + "/../*/*.grammar"], "2.0.0", "3.0.0").forEach(item => console.log(item.path, item.tree.toString()))
module.exports = GrammarUpgrader
