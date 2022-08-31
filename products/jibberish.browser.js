{
  class jibberishNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        errorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          extendsAbstract: extendsAbstractNode,
          hue: hueNode,
          saturation: saturationNode,
          constrast: constrastNode,
          "html.h1": h1Node,
          add: addNode,
          "+": plusNode,
          block: blockNode,
          scoreBlock: scoreBlockNode,
          to: toNode,
          foo: fooNode,
          xColumnName: xColumnNameNode,
          lightbulbState: lightbulbStateNode,
          nested: nestedNode,
          nodeWithConsts: nodeWithConstsNode,
          nodeExpandsConsts: nodeExpandsConstsNode,
          someCode: someCodeNode,
          type: typeNode,
          text: textNode
        }),
        undefined
      )
    }
    execute() {
      return 42
    }
    static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(`anyCell
columnNameEnumCell
columnNameCell
errorCell
 highlightScope invalid
intCell
 highlightScope constant.numeric
onoffCell
 enum on off
wordCell
topLevelPropertyCell
 highlightScope constant.language
opSymbolCell
 highlightScope keyword.operator.arithmetic
jibberishNode
 root
 description A useless Tree Language built for testing Tree Notation code.
 javascript
  execute() {
   return 42
  }
 compilesTo txt
 catchAllNodeType errorNode
 inScope abstractTopLevelNode textNode abstractBaseClassNode
abstractBaseClassNode
extendsAbstractNode
 cells topLevelPropertyCell intCell
 extends abstractBaseClassNode
 crux extendsAbstract
abstractTopLevelNode
 cells topLevelPropertyCell
abstractColorPropertiesNode
 cells topLevelPropertyCell intCell
 extends abstractTopLevelNode
hueNode
 extends abstractColorPropertiesNode
 crux hue
saturationNode
 extends abstractColorPropertiesNode
 crux saturation
constrastNode
 extends abstractColorPropertiesNode
 crux constrast
abstractHtmlNode
 inScope contentNode
 extends abstractTopLevelNode
h1Node
 crux html.h1
 extends abstractHtmlNode
addNode
 extends abstractTopLevelNode
 crux add
plusNode
 crux +
 extends addNode
 example Adding two numbers:
  + 1 2
 catchAllCellType intCell
 cells opSymbolCell
blockNode
 inScope abstractTopLevelNode scoreBlockNode
 extends abstractTopLevelNode
 crux block
scoreBlockNode
 description Test that inscope extends and does not overwrite.
 extends blockNode
 inScope scoresNode
 crux scoreBlock
toNode
 cells topLevelPropertyCell wordCell
 compiler
  stringTemplate to {word}
  closeChildren end
 extends blockNode
 crux to
fooNode
 extends abstractTopLevelNode
 crux foo
xColumnNameNode
 description The name of the column to use for the x axis
 cells topLevelPropertyCell columnNameEnumCell
 tags doNotSynthesize
 javascript
  getRunTimeEnumOptions(cell) {
   return cell.getCellTypeId() === "columnNameEnumCell" ? ["gender", "height", "weight"] : undefined
  }
 extends abstractTopLevelNode
 crux xColumnName
lightbulbStateNode
 cells topLevelPropertyCell onoffCell
 extends abstractTopLevelNode
 crux lightbulbState
nestedNode
 extends abstractTopLevelNode
 crux nested
nodeWithConstsNode
 string greeting hello world
 string singleCell hello
 string thisHasQuotes "'\`
 string longText
  hello
  world
 int score1 28
 int anArray 2 3 4
 float score2 3.01
 boolean win true
 extends abstractTopLevelNode
 crux nodeWithConsts
nodeExpandsConstsNode
 string greeting hola
 extends nodeWithConstsNode
 crux nodeExpandsConsts
someCodeNode
 catchAllNodeType lineOfCodeNode
 extends abstractTopLevelNode
 crux someCode
typeNode
 cells topLevelPropertyCell wordCell
 single
 extends abstractTopLevelNode
 crux type
contentNode
 baseNodeType blobNode
 crux content
errorNode
 catchAllCellType errorCell
 baseNodeType errorNode
 cells errorCell
lineOfCodeNode
 catchAllCellType wordCell
textNode
 baseNodeType blobNode
 crux text
scoresNode
 catchAllCellType intCell
 cells topLevelPropertyCell
 crux scores`)
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        jibberishNode: jibberishNode,
        abstractBaseClassNode: abstractBaseClassNode,
        extendsAbstractNode: extendsAbstractNode,
        abstractTopLevelNode: abstractTopLevelNode,
        abstractColorPropertiesNode: abstractColorPropertiesNode,
        hueNode: hueNode,
        saturationNode: saturationNode,
        constrastNode: constrastNode,
        abstractHtmlNode: abstractHtmlNode,
        h1Node: h1Node,
        addNode: addNode,
        plusNode: plusNode,
        blockNode: blockNode,
        scoreBlockNode: scoreBlockNode,
        toNode: toNode,
        fooNode: fooNode,
        xColumnNameNode: xColumnNameNode,
        lightbulbStateNode: lightbulbStateNode,
        nestedNode: nestedNode,
        nodeWithConstsNode: nodeWithConstsNode,
        nodeExpandsConstsNode: nodeExpandsConstsNode,
        someCodeNode: someCodeNode,
        typeNode: typeNode,
        contentNode: contentNode,
        errorNode: errorNode,
        lineOfCodeNode: lineOfCodeNode,
        textNode: textNode,
        scoresNode: scoresNode
      }
    }
  }

  class abstractBaseClassNode extends jtree.GrammarBackedNode {}

  class extendsAbstractNode extends abstractBaseClassNode {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get intCell() {
      return parseInt(this.getWord(1))
    }
  }

  class abstractTopLevelNode extends jtree.GrammarBackedNode {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
  }

  class abstractColorPropertiesNode extends abstractTopLevelNode {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get intCell() {
      return parseInt(this.getWord(1))
    }
  }

  class hueNode extends abstractColorPropertiesNode {}

  class saturationNode extends abstractColorPropertiesNode {}

  class constrastNode extends abstractColorPropertiesNode {}

  class abstractHtmlNode extends abstractTopLevelNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { content: contentNode }),
        undefined
      )
    }
  }

  class h1Node extends abstractHtmlNode {}

  class addNode extends abstractTopLevelNode {}

  class plusNode extends addNode {
    get opSymbolCell() {
      return this.getWord(0)
    }
    get intCell() {
      return this.getWordsFrom(1).map(val => parseInt(val))
    }
  }

  class blockNode extends abstractTopLevelNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          hue: hueNode,
          saturation: saturationNode,
          constrast: constrastNode,
          "html.h1": h1Node,
          add: addNode,
          "+": plusNode,
          block: blockNode,
          scoreBlock: scoreBlockNode,
          to: toNode,
          foo: fooNode,
          xColumnName: xColumnNameNode,
          lightbulbState: lightbulbStateNode,
          nested: nestedNode,
          nodeWithConsts: nodeWithConstsNode,
          nodeExpandsConsts: nodeExpandsConstsNode,
          someCode: someCodeNode,
          type: typeNode
        }),
        undefined
      )
    }
  }

  class scoreBlockNode extends blockNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { scores: scoresNode }),
        undefined
      )
    }
  }

  class toNode extends blockNode {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get wordCell() {
      return this.getWord(1)
    }
  }

  class fooNode extends abstractTopLevelNode {}

  class xColumnNameNode extends abstractTopLevelNode {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get columnNameEnumCell() {
      return this.getWord(1)
    }
    getRunTimeEnumOptions(cell) {
      return cell.getCellTypeId() === "columnNameEnumCell" ? ["gender", "height", "weight"] : undefined
    }
  }

  class lightbulbStateNode extends abstractTopLevelNode {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get onoffCell() {
      return this.getWord(1)
    }
  }

  class nestedNode extends abstractTopLevelNode {}

  class nodeWithConstsNode extends abstractTopLevelNode {
    get win() {
      return true
    }
    get score2() {
      return 3.01
    }
    get anArray() {
      return [2, 3, 4]
    }
    get score1() {
      return 28
    }
    get longText() {
      return `hello
world`
    }
    get thisHasQuotes() {
      return `"'\``
    }
    get singleCell() {
      return `hello`
    }
    get greeting() {
      return `hello world`
    }
  }

  class nodeExpandsConstsNode extends nodeWithConstsNode {
    get greeting() {
      return `hola`
    }
  }

  class someCodeNode extends abstractTopLevelNode {
    createParser() {
      return new jtree.TreeNode.Parser(lineOfCodeNode, undefined, undefined)
    }
  }

  class typeNode extends abstractTopLevelNode {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get wordCell() {
      return this.getWord(1)
    }
  }

  class contentNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(this._getBlobNodeCatchAllNodeType())
    }
    getErrors() {
      return []
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

  class lineOfCodeNode extends jtree.GrammarBackedNode {
    get wordCell() {
      return this.getWordsFrom(0)
    }
  }

  class textNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(this._getBlobNodeCatchAllNodeType())
    }
    getErrors() {
      return []
    }
  }

  class scoresNode extends jtree.GrammarBackedNode {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get intCell() {
      return this.getWordsFrom(1).map(val => parseInt(val))
    }
  }

  window.jibberishNode = jibberishNode
}
