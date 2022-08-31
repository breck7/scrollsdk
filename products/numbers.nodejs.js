#! /usr/bin/env node
{
  const { jtree } = require("../index.js")

  class numbersNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        errorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          "%": modNode,
          "*": timesNode,
          "+": addNode,
          "-": substractNode,
          "/": divideNode,
          comment: commentNode,
          "#!": hashBangNode
        }),
        undefined
      )
    }
    execute() {
      return this.map(child => child.execute())
    }
    static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(`tooling onsave jtree build produceLang numbers
floatCell
commentCell
 highlightScope comment
keywordCell
hashBangKeywordCell
 extends keywordCell
 highlightScope comment
commentKeywordCell
 extends keywordCell
 highlightScope comment
 enum comment
errorCell
 highlightScope invalid
numberCell
 highlightScope constant.numeric
 extends floatCell
numbersCell
 extends numberCell
operatorCell
 highlightScope keyword.operator.arithmetic
numbersNode
 root
 description A useless Tree Language for testing Tree Notation features.
 inScope abstractArithmeticReducerNode commentNode hashBangNode
 catchAllNodeType errorNode
 javascript
  execute() {
   return this.map(child => child.execute())
  }
abstractArithmeticReducerNode
 description First reduces any child lists to one number and then reduces its own lists to one number using provided operator.
 javascript
  execute() {
   return this.numbersCell.slice(1).reduce((curr, tot) => eval(\`\${curr}\${this.operator}\${tot}\`), this.numbersCell[0])
  }
 inScope abstractArithmeticReducerNode commentNode
 cells operatorCell
 catchAllCellType numbersCell
modNode
 crux %
 extends abstractArithmeticReducerNode
 string operator %
timesNode
 crux *
 extends abstractArithmeticReducerNode
 string operator *
addNode
 crux +
 extends abstractArithmeticReducerNode
 string operator +
substractNode
 crux -
 extends abstractArithmeticReducerNode
 string operator -
divideNode
 crux /
 extends abstractArithmeticReducerNode
 string operator /
commentNode
 description This is a line comment.
 catchAllCellType commentCell
 catchAllNodeType commentContentNode
 cells commentKeywordCell
commentContentNode
 catchAllCellType commentCell
 catchAllNodeType commentContentNode
hashBangNode
 crux #!
 cells hashBangKeywordCell
 catchAllCellType commentCell
errorNode
 catchAllCellType errorCell
 baseNodeType errorNode
 cells errorCell`)
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        numbersNode: numbersNode,
        abstractArithmeticReducerNode: abstractArithmeticReducerNode,
        modNode: modNode,
        timesNode: timesNode,
        addNode: addNode,
        substractNode: substractNode,
        divideNode: divideNode,
        commentNode: commentNode,
        commentContentNode: commentContentNode,
        hashBangNode: hashBangNode,
        errorNode: errorNode
      }
    }
  }

  class abstractArithmeticReducerNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          "%": modNode,
          "*": timesNode,
          "+": addNode,
          "-": substractNode,
          "/": divideNode,
          comment: commentNode
        }),
        undefined
      )
    }
    get operatorCell() {
      return this.getWord(0)
    }
    get numbersCell() {
      return this.getWordsFrom(1).map(val => parseFloat(val))
    }
    execute() {
      return this.numbersCell.slice(1).reduce((curr, tot) => eval(`${curr}${this.operator}${tot}`), this.numbersCell[0])
    }
  }

  class modNode extends abstractArithmeticReducerNode {
    get operator() {
      return `%`
    }
  }

  class timesNode extends abstractArithmeticReducerNode {
    get operator() {
      return `*`
    }
  }

  class addNode extends abstractArithmeticReducerNode {
    get operator() {
      return `+`
    }
  }

  class substractNode extends abstractArithmeticReducerNode {
    get operator() {
      return `-`
    }
  }

  class divideNode extends abstractArithmeticReducerNode {
    get operator() {
      return `/`
    }
  }

  class commentNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(commentContentNode, undefined, undefined)
    }
    get commentKeywordCell() {
      return this.getWord(0)
    }
    get commentCell() {
      return this.getWordsFrom(1)
    }
  }

  class commentContentNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(commentContentNode, undefined, undefined)
    }
    get commentCell() {
      return this.getWordsFrom(0)
    }
  }

  class hashBangNode extends jtree.GrammarBackedNode {
    get hashBangKeywordCell() {
      return this.getWord(0)
    }
    get commentCell() {
      return this.getWordsFrom(1)
    }
  }

  class errorNode extends jtree.GrammarBackedNode {
    getErrors() {
      return this._getErrorNodeErrors()
    }
    get errorCell() {
      return this.getWord(0)
    }
    get errorCell() {
      return this.getWordsFrom(1)
    }
  }

  module.exports = numbersNode
  numbersNode

  if (!module.parent) new numbersNode(jtree.TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
