#!/usr/bin/env ts-node

const { jtree } = require("../../index.js")

class GrammarUpgrader extends jtree.Upgrader {
  private static _jtree34grammarProgram: any
  getUpgradeFromMap() {
    return {
      "5.0.0": {
        "6.0.0": (tree: any) => {
          tree = new jtree.TreeNode(tree.toString().replace(/^ match /g, " crux "))
          const mayNeed = tree.filter((node: any) => node.getLine().endsWith("Node") && !node.has("root") && node.get("baseNodeType") !== "errorNode" && !node.has("abstract") && !node.has("crux") && !node.has("pattern"))
          mayNeed.forEach((node: any) => {
            node.set("crux", node.getLine().replace("Node", ""))
          })
          return tree
          // if it was using an implicit firstWord, and not abstract, add an explicit one, unless its a catchall.
        }
      },
      "4.0.0": {
        "5.0.0": (tree: any) => {
          const extTree = new jtree.ExtendibleTreeNode(tree.toString())
          const firstCellTypeKeyword = "firstCellType"

          const handle = (node: any, fct: string) => {
            if (!node.has("cells")) {
              node.appendLine(`cells ${fct}`)
            } else {
              node.set("cells", `${fct} ${node.get("cells")}`)
            }
            node.delete(firstCellTypeKeyword)
          }

          const ft = extTree._getFamilyTree()
          const familyTreeIds = ft.getTopDownArray()
          familyTreeIds.reverse()
          familyTreeIds.forEach((idNode: any) => {
            const id = idNode.getLine()
            const node = extTree.getNode(id)
            if (!node) return 1
            if (node.has(firstCellTypeKeyword)) {
              handle(node, node.get(firstCellTypeKeyword))
            } else {
              if (!node.has("cells")) return 1
              const nodeWithFct = node._getNodeFromExtended(firstCellTypeKeyword)
              if (nodeWithFct) {
                handle(node, nodeWithFct.get(firstCellTypeKeyword))
              } else {
                // done
              }
            }
          })

          // extTree.forEach((node: any) => {
          //   const fct = node.get(firstCellTypeKeyword)
          //   if (fct) handle(node, fct)
          // })

          return extTree
        }
      },
      "3.0.0": {
        "4.0.0": (tree: any) => {
          const makeNewId = (currentId: string, suffix: string) => currentId.replace(new RegExp(suffix + "$"), "") + suffix
          // todo: require jtree 34 to do this upgrade.
          if (!GrammarUpgrader._jtree34grammarProgram) GrammarUpgrader._jtree34grammarProgram = new jtree.HandGrammarProgram(jtree.TreeNode.fromDisk(__dirname + "/grammar.grammar")).compileAndReturnRootConstructor()
          // For all grammar files
          //  find all cells having type nodeTypeId
          //   apply makeNewId
          //  find all cells having type cellTypeId
          //   apply makeNewId
          // saveFile
          //const grammarProgram = new jtree.HandGrammarProgram(grammarCode)
          //const rootProgramConstructor = grammarProgram.compileAndReturnRootConstructor()
          const program = new GrammarUpgrader._jtree34grammarProgram(tree.toString())
          program.getAllTypedWords().forEach((typedWord: any) => {
            if (typedWord.type === "nodeTypeId") typedWord.replace(makeNewId(typedWord.word, "Node"))
            if (typedWord.type === "cellTypeId") typedWord.replace(makeNewId(typedWord.word, "Cell"))
          })
          const removeTypeWord = (node: any) => node.setLine(node.getWord(1))

          program.findNodes("nodeType").forEach(removeTypeWord)
          program.findNodes("cellType").forEach(removeTypeWord)

          //console.log(program.getAllTypedWords().join("\n"))
          //return tree
          return program
        }
      },
      "2.0.0": {
        "3.0.0": (tree: any) => {
          // Nest abstract nodes
          tree.findNodes("abstract").forEach((node: any) => {
            node.appendLine("abstract")
            node.setWord(0, "nodeType")
          })

          // Expand out and remove group nodes
          tree.findNodes("nodeType").forEach((node: any) => {
            const groupNode = node.getNode("group")
            if (groupNode) {
              const parentNodeId = node.getWord(1)
              groupNode.getWordsFrom(1).forEach((groupWord: string) => {
                tree.appendLineAndChildren(`nodeType ${groupWord}`, `extends ${parentNodeId}`)
              })
              groupNode.destroy()
            }
          })

          const getCleanId = (id: string) => {
            let javascriptSyntaxSafeId = id
            javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/(\..)/g, (letter: string) => letter[1].toUpperCase())
            javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/(\_.)/g, (letter: string) => letter[1].toUpperCase())
            javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/(\-.)/g, (letter: string) => letter[1].toUpperCase())
            javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\?/g, "")
            return javascriptSyntaxSafeId
          }

          // Attempt to rename nodeTypeIds that are no longer valid, moving the original to a match subnode
          tree.findNodes("nodeType").forEach((node: any) => {
            const id = node.getWord(1)
            if (id.match(/[\_\.\-\?]/)) {
              if (!node.has("abstract")) node.appendLine(`match ${id}`)
              node.setWord(1, getCleanId(id))
            }
          })

          // Rename any other nodeTypes
          tree.findNodes("nodeType extends").forEach((node: any) => {
            const id = node.getWord(1)
            if (id.match(/[\_\.\-\?]/)) {
              node.setWord(1, getCleanId(id))
            }
          })
          return tree
        }
      },
      "1.2.0": {
        "2.0.0": (tree: any) => {
          const moveExtend = (node: any) => {
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
        "1.2.0": (tree: any) => {
          // update nodeTypes
          // todo: need to preserve history of grammars to have celltype safe upgrades.
          tree.forEach((node: any) => {
            const types = node.getNode("nodeTypes")
            if (types) {
              types.setFirstWord("inScope")
              types.setContent(types.getFirstWords().join(" "))
              types.deleteChildren()
            }
          })

          // todo: blob to baseNodeType blob, constructors js errorNode
          // update constants
          tree.forEach((node: any) => {
            const constants = node.getNode("constants")
            if (constants) {
              constants.forEach((constant: any) => {
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

/*NODE_JS_ONLY*/ if (!module.parent) new GrammarUpgrader().upgradeManyInPlace([__dirname + "/../*/*.grammar", __dirname + "/../*/*.gram"], "5.0.0", "6.0.0").forEach((item: any) => console.log(item.path, item.tree.toString()))

export { GrammarUpgrader }
