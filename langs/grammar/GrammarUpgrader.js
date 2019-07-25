#! /usr/bin/env node

const jtree = require("../../index.js")

class GrammarUpgrader extends jtree.Upgrader {
  getUpgradeFromMap() {
    return {
      "3.0.0": {
        "4.0.0": tree => {
          const makeNewId = (currentId, suffix) => currentId.replace(new RegExp(suffix + "$"), "") + suffix
          // todo: require jtree 34 to do this upgrade.
          if (!GrammarUpgrader._jtree34grammarProgram)
            GrammarUpgrader._jtree34grammarProgram = new jtree.GrammarProgram(jtree.TreeNode.fromDisk(__dirname + "/grammar.grammar")).getRootConstructor()
          // For all grammar files
          //  find all cells having type nodeTypeId
          //   apply makeNewId
          //  find all cells having type cellTypeId
          //   apply makeNewId
          // saveFile
          //const grammarProgram = new jtree.GrammarProgram(grammarCode)
          //const rootProgramConstructor = grammarProgram.getRootConstructor()
          const program = new GrammarUpgrader._jtree34grammarProgram(tree.toString())
          program.getAllTypedWords().forEach(typedWord => {
            if (typedWord.type === "nodeTypeId") typedWord.replace(makeNewId(typedWord.word, "Node"))
            if (typedWord.type === "cellTypeId") typedWord.replace(makeNewId(typedWord.word, "Cell"))
          })
          const removeTypeWord = node => node.setLine(node.getWord(1))

          program.findNodes("nodeType").forEach(removeTypeWord)
          program.findNodes("cellType").forEach(removeTypeWord)

          //console.log(program.getAllTypedWords().join("\n"))
          //return tree
          return program
        }
      },
      "2.0.0": {
        "3.0.0": tree => {
          // Nest abstract nodes
          tree.findNodes("abstract").forEach(node => {
            node.appendLine("abstract")
            node.setWord(0, "nodeType")
          })

          // Expand out and remove group nodes
          tree.findNodes("nodeType").forEach(node => {
            const groupNode = node.getNode("group")
            if (groupNode) {
              const parentNodeId = node.getWord(1)
              groupNode.getWordsFrom(1).forEach(groupWord => {
                tree.appendLineAndChildren(`nodeType ${groupWord}`, `extends ${parentNodeId}`)
              })
              groupNode.destroy()
            }
          })

          const getCleanId = id => {
            let javascriptSyntaxSafeId = id
            javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/(\..)/g, letter => letter[1].toUpperCase())
            javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/(\_.)/g, letter => letter[1].toUpperCase())
            javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/(\-.)/g, letter => letter[1].toUpperCase())
            javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\?/g, "")
            return javascriptSyntaxSafeId
          }

          // Attempt to rename nodeTypeIds that are no longer valid, moving the original to a match subnode
          tree.findNodes("nodeType").forEach(node => {
            const id = node.getWord(1)
            if (id.match(/[\_\.\-\?]/)) {
              if (!node.has("abstract")) node.appendLine(`match ${id}`)
              node.setWord(1, getCleanId(id))
            }
          })

          // Rename any other nodeTypes
          tree.findNodes("nodeType extends").forEach(node => {
            const id = node.getWord(1)
            if (id.match(/[\_\.\-\?]/)) {
              node.setWord(1, getCleanId(id))
            }
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
  new GrammarUpgrader().upgradeManyInPlace([__dirname + "/../*/*.grammar"], "3.0.0", "4.0.0").forEach(item => console.log(item.path, item.tree.toString()))
module.exports = GrammarUpgrader
