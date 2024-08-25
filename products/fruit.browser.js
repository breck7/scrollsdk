{
  class fruitParser extends ParserBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(errorParser, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { apple: appleParser }), undefined)
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`fruitNameCell
 paint keyword
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
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = fruitParser
  }

  class abstractFruitParser extends ParserBackedNode {
    get fruitNameCell() {
      return this.getWord(0)
    }
  }

  class appleParser extends abstractFruitParser {
    createParserCombinator() {
      class bananaParser extends abstractFruitParser {}
      return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { apple: appleParser, banana: bananaParser }), undefined)
    }
  }

  class errorParser extends ParserBackedNode {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  window.fruitParser = fruitParser
}
