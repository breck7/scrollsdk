{
  class wwtParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(errorParser, undefined, [
        { regex: /EnumType$/, parser: enumTypeDeclarationParser },
        { regex: /UnionType$/, parser: unionTypeDeclarationParser },
        { regex: /MapType$/, parser: mapTypeDeclarationParser },
        { regex: /Type$/, parser: typeDeclarationParser },
        { regex: /Interface$/, parser: interfaceDeclarationParser }
      ])
    }
    compile() {
      return `namespace {\n ` + super.compile().replace(/\n\s*\n+/g, "\n") + "\n}"
    }
    static cachedHandGrammarProgramRoot = new HandGrammarProgram(`// Cell parsers
keywordCell
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

// Line parsers
wwtParser
 description WorldWideTypes. A work in progress. A simple Tree Language for only declaring types and interfaces that compiles to TypeScript, and in the future other langs.
 root
 inScope abstractTypeDeclarationParser interfaceDeclarationParser
 catchAllParser errorParser
 compilesTo ts
 javascript
  compile() {
   return \`namespace {\\n \` + super.compile().replace(/\\n\\s*\\n+/g, "\\n") + "\\n}"
  }
commentParser
 baseParser blobParser
 cells commentKeywordCell
 catchAllCellType commentCell
 compiler
  stringTemplate /* {commentCell} */
 crux comment
errorParser
 baseParser errorParser
abstractTypeDeclarationParser
 inScope commentParser
enumTypeDeclarationParser
 extends abstractTypeDeclarationParser
 cells enumTypeIdCell
 inScope enumOptionsParser
 pattern EnumType$
unionTypeDeclarationParser
 cells unionTypeIdCell
 extends abstractTypeDeclarationParser
 pattern UnionType$
 inScope unionTypesParser
mapTypeDeclarationParser
 cells mapTypeIdCell
 extends abstractTypeDeclarationParser
 pattern MapType$
 inScope keyParser valueParser
typeDeclarationParser
 cells typeDecIdCell
 extends abstractTypeDeclarationParser
 pattern Type$
 inScope extendsParser
 compiler
  stringTemplate export declare type {typeDecIdCell} = {extends}
extendsParser
 cells keywordCell typeIdCell
 required
 compiler
  stringTemplate 
 crux extends
enumOptionsParser
 cells keywordCell
 catchAllCellType enumOptionCell
 crux enumOptions
unionTypesParser
 cells keywordCell
 catchAllCellType typeIdCell
 crux unionTypes
keyParser
 cells keywordCell stringKeyCell typeIdCell
 crux key
valueParser
 cells keywordCell typeIdCell
 crux value
interfaceDeclarationParser
 pattern Interface$
 cells interfaceIdCell
 inScope commentParser fieldDeclarationParser
 compiler
  stringTemplate export interface {interfaceIdCell} {
  closeChildren }
fieldDeclarationParser
 pattern Field
 cells fieldIdCell typeIdCell
 inScope optionalParser arrayParser
 compiler
  stringTemplate {fieldIdCell}: {typeIdCell}
optionalParser
 description Is this field optional?
 cells keywordCell
 crux optional
arrayParser
 description Does this take an array
 cells keywordCell
 crux array`)
    get handGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static rootParser = wwtParser
  }

  class commentParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())
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

  class errorParser extends GrammarBackedNode {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  class abstractTypeDeclarationParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { comment: commentParser }),
        undefined
      )
    }
  }

  class enumTypeDeclarationParser extends abstractTypeDeclarationParser {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { enumOptions: enumOptionsParser }),
        undefined
      )
    }
    get enumTypeIdCell() {
      return this.getWord(0)
    }
  }

  class unionTypeDeclarationParser extends abstractTypeDeclarationParser {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { unionTypes: unionTypesParser }),
        undefined
      )
    }
    get unionTypeIdCell() {
      return this.getWord(0)
    }
  }

  class mapTypeDeclarationParser extends abstractTypeDeclarationParser {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { key: keyParser, value: valueParser }),
        undefined
      )
    }
    get mapTypeIdCell() {
      return this.getWord(0)
    }
  }

  class typeDeclarationParser extends abstractTypeDeclarationParser {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { extends: extendsParser }),
        undefined
      )
    }
    get typeDecIdCell() {
      return this.getWord(0)
    }
  }

  class extendsParser extends GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get typeIdCell() {
      return this.getWord(1)
    }
  }

  class enumOptionsParser extends GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get enumOptionCell() {
      return this.getWordsFrom(1)
    }
  }

  class unionTypesParser extends GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get typeIdCell() {
      return this.getWordsFrom(1)
    }
  }

  class keyParser extends GrammarBackedNode {
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

  class valueParser extends GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get typeIdCell() {
      return this.getWord(1)
    }
  }

  class interfaceDeclarationParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { comment: commentParser }),
        [{ regex: /Field/, parser: fieldDeclarationParser }]
      )
    }
    get interfaceIdCell() {
      return this.getWord(0)
    }
  }

  class fieldDeclarationParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { optional: optionalParser, array: arrayParser }),
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

  class optionalParser extends GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
  }

  class arrayParser extends GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
  }

  window.wwtParser = wwtParser
}
