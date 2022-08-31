{
  class wwtNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(errorNode, undefined, [
        { regex: /EnumType$/, nodeConstructor: enumTypeDeclarationNode },
        { regex: /UnionType$/, nodeConstructor: unionTypeDeclarationNode },
        { regex: /MapType$/, nodeConstructor: mapTypeDeclarationNode },
        { regex: /Type$/, nodeConstructor: typeDeclarationNode },
        { regex: /Interface$/, nodeConstructor: interfaceDeclarationNode }
      ])
    }
    compile() {
      return `namespace {\n ` + super.compile().replace(/\n\s*\n+/g, "\n") + "\n}"
    }
    static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(`keywordCell
anyCell
fieldIdCell
 examples titleField
 highlightScope keyword
enumOptionCell
 extends anyCell
 highlightScope string
typeIdCell
 highlightScope variable
 examples intType
enumTypeIdCell
 extends typeIdCell
 examples reductionEnumType
unionTypeIdCell
 examples timeUnitUnionType
 extends typeIdCell
mapTypeIdCell
 examples countMapType
 extends typeIdCell
typeDecIdCell
 examples intType
 extends typeIdCell
stringKeyCell
 highlightScope string
interfaceIdCell
 highlightScope variable
 examples storeInterface
commentKeywordCell
 extends keywordCell
 highlightScope comment
commentCell
 extends anyCell
 highlightScope comment
wwtNode
 description WorldWideTypes. A work in progress. A simple Tree Language for only declaring types and interfaces that compiles to TypeScript, and in the future other langs.
 root
 inScope abstractTypeDeclarationNode interfaceDeclarationNode
 catchAllNodeType errorNode
 compilesTo ts
 javascript
  compile() {
   return \`namespace {\\n \` + super.compile().replace(/\\n\\s*\\n+/g, "\\n") + "\\n}"
  }
commentNode
 baseNodeType blobNode
 cells commentKeywordCell
 catchAllCellType commentCell
 compiler
  stringTemplate /* {commentCell} */
 crux comment
errorNode
 baseNodeType errorNode
abstractTypeDeclarationNode
 inScope commentNode
enumTypeDeclarationNode
 extends abstractTypeDeclarationNode
 cells enumTypeIdCell
 inScope enumOptionsNode
 pattern EnumType$
unionTypeDeclarationNode
 cells unionTypeIdCell
 extends abstractTypeDeclarationNode
 pattern UnionType$
 inScope unionTypesNode
mapTypeDeclarationNode
 cells mapTypeIdCell
 extends abstractTypeDeclarationNode
 pattern MapType$
 inScope keyNode valueNode
typeDeclarationNode
 cells typeDecIdCell
 extends abstractTypeDeclarationNode
 pattern Type$
 inScope extendsNode
 compiler
  stringTemplate export declare type {typeDecIdCell} = {extends}
extendsNode
 cells keywordCell typeIdCell
 required
 compiler
  stringTemplate 
 crux extends
enumOptionsNode
 cells keywordCell
 catchAllCellType enumOptionCell
 crux enumOptions
unionTypesNode
 cells keywordCell
 catchAllCellType typeIdCell
 crux unionTypes
keyNode
 cells keywordCell stringKeyCell typeIdCell
 crux key
valueNode
 cells keywordCell typeIdCell
 crux value
interfaceDeclarationNode
 pattern Interface$
 cells interfaceIdCell
 inScope commentNode fieldDeclarationNode
 compiler
  stringTemplate export interface {interfaceIdCell} {
  closeChildren }
fieldDeclarationNode
 pattern Field
 cells fieldIdCell typeIdCell
 inScope optionalNode arrayNode
 compiler
  stringTemplate {fieldIdCell}: {typeIdCell}
optionalNode
 description Is this field optional?
 cells keywordCell
 crux optional
arrayNode
 description Does this take an array
 cells keywordCell
 crux array`)
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        wwtNode: wwtNode,
        commentNode: commentNode,
        errorNode: errorNode,
        abstractTypeDeclarationNode: abstractTypeDeclarationNode,
        enumTypeDeclarationNode: enumTypeDeclarationNode,
        unionTypeDeclarationNode: unionTypeDeclarationNode,
        mapTypeDeclarationNode: mapTypeDeclarationNode,
        typeDeclarationNode: typeDeclarationNode,
        extendsNode: extendsNode,
        enumOptionsNode: enumOptionsNode,
        unionTypesNode: unionTypesNode,
        keyNode: keyNode,
        valueNode: valueNode,
        interfaceDeclarationNode: interfaceDeclarationNode,
        fieldDeclarationNode: fieldDeclarationNode,
        optionalNode: optionalNode,
        arrayNode: arrayNode
      }
    }
  }

  class commentNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(this._getBlobNodeCatchAllNodeType())
    }
    getErrors() {
      return []
    }
    get commentKeywordCell() {
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
  }

  class abstractTypeDeclarationNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { comment: commentNode }),
        undefined
      )
    }
  }

  class enumTypeDeclarationNode extends abstractTypeDeclarationNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { enumOptions: enumOptionsNode }),
        undefined
      )
    }
    get enumTypeIdCell() {
      return this.getWord(0)
    }
  }

  class unionTypeDeclarationNode extends abstractTypeDeclarationNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { unionTypes: unionTypesNode }),
        undefined
      )
    }
    get unionTypeIdCell() {
      return this.getWord(0)
    }
  }

  class mapTypeDeclarationNode extends abstractTypeDeclarationNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { key: keyNode, value: valueNode }),
        undefined
      )
    }
    get mapTypeIdCell() {
      return this.getWord(0)
    }
  }

  class typeDeclarationNode extends abstractTypeDeclarationNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { extends: extendsNode }),
        undefined
      )
    }
    get typeDecIdCell() {
      return this.getWord(0)
    }
  }

  class extendsNode extends jtree.GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get typeIdCell() {
      return this.getWord(1)
    }
  }

  class enumOptionsNode extends jtree.GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get enumOptionCell() {
      return this.getWordsFrom(1)
    }
  }

  class unionTypesNode extends jtree.GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get typeIdCell() {
      return this.getWordsFrom(1)
    }
  }

  class keyNode extends jtree.GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get stringKeyCell() {
      return this.getWord(1)
    }
    get typeIdCell() {
      return this.getWord(2)
    }
  }

  class valueNode extends jtree.GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get typeIdCell() {
      return this.getWord(1)
    }
  }

  class interfaceDeclarationNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(undefined, Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { comment: commentNode }), [
        { regex: /Field/, nodeConstructor: fieldDeclarationNode }
      ])
    }
    get interfaceIdCell() {
      return this.getWord(0)
    }
  }

  class fieldDeclarationNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { optional: optionalNode, array: arrayNode }),
        undefined
      )
    }
    get fieldIdCell() {
      return this.getWord(0)
    }
    get typeIdCell() {
      return this.getWord(1)
    }
  }

  class optionalNode extends jtree.GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
  }

  class arrayNode extends jtree.GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
  }

  window.wwtNode = wwtNode
}
