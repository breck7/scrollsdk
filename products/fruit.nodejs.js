#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { TreeNode } = require("./TreeNode.js")
  const { HandGrammarProgram } = require("./GrammarLanguage.js")
  const { GrammarBackedNode } = require("./GrammarLanguage.js")

  class fruitNode extends GrammarBackedNode {
    createParser() {
      return new TreeNode.Parser(errorNode, Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { apple: appleNode }), undefined)
    }
    static cachedHandGrammarProgramRoot = new HandGrammarProgram(`fruitNameCell
 highlightScope keyword
fruitNode
 description A useless language to test scoped parsers.
 root
 inScope appleNode
 catchAllNodeType errorNode
 example
  apple
   banana
abstractFruitNode
 cruxFromId
 cells fruitNameCell
appleNode
 extends abstractFruitNode
 inScope appleNode
 bananaNode
  extends abstractFruitNode
errorNode
 baseNodeType errorNode`)
    get handGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static rootNodeTypeConstructor = fruitNode
  }

  class abstractFruitNode extends GrammarBackedNode {
    get fruitNameCell() {
      return this.getWord(0)
    }
  }

  class appleNode extends abstractFruitNode {
    createParser() {
      class bananaNode extends abstractFruitNode {}
      return new TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { apple: appleNode, banana: bananaNode }),
        undefined
      )
    }
  }

  class errorNode extends GrammarBackedNode {
    getErrors() {
      return this._getErrorNodeErrors()
    }
  }

  module.exports = fruitNode
  fruitNode

  if (!module.parent) new fruitNode(TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
