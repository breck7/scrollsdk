{
  class fruitParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(errorParser, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { apple: appleParser }), undefined)
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

  class abstractFruitParser extends ParserBackedParticle {
    get fruitNameCell() {
      return this.getWord(0)
    }
  }

  class appleParser extends abstractFruitParser {
    createParserCombinator() {
      class bananaParser extends abstractFruitParser {}
      return new Particle.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { apple: appleParser, banana: bananaParser }), undefined)
    }
  }

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  window.fruitParser = fruitParser
}
