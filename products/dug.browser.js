{
  class dugNode extends GrammarBackedNode {
    createParser() {
      return new TreeNode.Parser(
        errorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          null: nullNode,
          number: numberNode,
          string: stringNode,
          boolean: booleanNode,
          object: objectNode,
          array: arrayNode
        }),
        undefined
      )
    }
    compile() {
      const res = super.compile()
      return JSON.stringify(JSON.parse(res), null, 2)
    }
    static cachedHandGrammarProgramRoot = new HandGrammarProgram(`// todo Add swarm tests for top scenarios, including the scalar at root level scenario.
// todo Create a new language, similar to this, except using pattern matching instead of prefix notation.

// Cell Parsers
anyCell
keywordCell
 highlightScope keyword
stringCell
 highlightScope string
booleanCell
 enum true false
 highlightScope constant.numeric
numberCell
 highlightScope constant.numeric

// Line Parsers
dugNode
 root
 description A demonstration prefix Tree Language that compiles to JSON.
 inScope abstractValueNode
 catchAllNodeType errorNode
 javascript
  compile() {
   const res = super.compile()
   return JSON.stringify(JSON.parse(res), null, 2)
  }
abstractValueNode
 cells keywordCell
 cruxFromId
nullNode
 compiler
  stringTemplate null
 extends abstractValueNode
numberNode
 extends abstractValueNode
 cells keywordCell numberCell
 compiler
  stringTemplate {numberCell}
stringNode
 catchAllCellType stringCell
 compiler
  stringTemplate "{stringCell}"
 extends abstractValueNode
booleanNode
 extends abstractValueNode
 cells keywordCell booleanCell
 compiler
  stringTemplate {booleanCell}
objectNode
 catchAllNodeType memberNode
 extends abstractValueNode
 compiler
  stringTemplate  
  joinChildrenWith , 
  openChildren {
  closeChildren }
arrayNode
 extends abstractValueNode
 inScope abstractValueNode
 compiler
  stringTemplate  
  joinChildrenWith , 
  openChildren [
  closeChildren ]
memberNode
 inScope abstractValueNode
 compiler
  stringTemplate "{stringCell}" :
 cells stringCell
errorNode
 baseNodeType errorNode`)
    get handGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static rootNodeTypeConstructor = dugNode
  }

  class abstractValueNode extends GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
  }

  class nullNode extends abstractValueNode {}

  class numberNode extends abstractValueNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get numberCell() {
      return parseFloat(this.getWord(1))
    }
  }

  class stringNode extends abstractValueNode {
    get stringCell() {
      return this.getWordsFrom(0)
    }
  }

  class booleanNode extends abstractValueNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get booleanCell() {
      return this.getWord(1)
    }
  }

  class objectNode extends abstractValueNode {
    createParser() {
      return new TreeNode.Parser(memberNode, undefined, undefined)
    }
  }

  class arrayNode extends abstractValueNode {
    createParser() {
      return new TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          null: nullNode,
          number: numberNode,
          string: stringNode,
          boolean: booleanNode,
          object: objectNode,
          array: arrayNode
        }),
        undefined
      )
    }
  }

  class memberNode extends GrammarBackedNode {
    createParser() {
      return new TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          null: nullNode,
          number: numberNode,
          string: stringNode,
          boolean: booleanNode,
          object: objectNode,
          array: arrayNode
        }),
        undefined
      )
    }
    get stringCell() {
      return this.getWord(0)
    }
  }

  class errorNode extends GrammarBackedNode {
    getErrors() {
      return this._getErrorNodeErrors()
    }
  }

  window.dugNode = dugNode
}
