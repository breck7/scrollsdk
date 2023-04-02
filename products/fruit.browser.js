{
  class fruitParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        errorParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { apple: appleParser }),
        undefined
      )
    }
    static cachedHandGrammarProgramRoot = new HandGrammarProgram(`fruitNameCell
 highlightScope keyword
fruitParser
 description A useless language to test scoped parsers.
 root
 inScope appleParser
 catchAllParser errorParser
 example
  apple
   banana
abstractFruitParser
 cruxFromId
 cells fruitNameCell
appleParser
 extends abstractFruitParser
 inScope appleParser
 bananaParser
  extends abstractFruitParser
errorParser
 baseParser errorParser`)
    get handGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static rootParser = fruitParser
  }

  class abstractFruitParser extends GrammarBackedNode {
    get fruitNameCell() {
      return this.getWord(0)
    }
  }

  class appleParser extends abstractFruitParser {
    createParserCombinator() {
      class bananaParser extends abstractFruitParser {}
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { apple: appleParser, banana: bananaParser }),
        undefined
      )
    }
  }

  class errorParser extends GrammarBackedNode {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  window.fruitParser = fruitParser
}
