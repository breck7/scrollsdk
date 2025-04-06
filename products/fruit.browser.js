{
  class fruitParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(errorParser, Object.assign(Object.assign({}, super.createParserPool()._getCueMapAsObject()), { apple: appleParser }), undefined)
    }
    static _parserSourceCode = `fruitNameAtom
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
 cueFromId
 atoms fruitNameAtom
appleParser
 extends abstractFruitParser
 inScope appleParser
 bananaParser
  extends abstractFruitParser
errorParser
 baseParser errorParser`
    static cachedHandParsersProgramRoot = new HandParsersProgram(this._parserSourceCode)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = fruitParser
  }

  class abstractFruitParser extends ParserBackedParticle {
    get fruitNameAtom() {
      return this.getAtom(0)
    }
  }

  class appleParser extends abstractFruitParser {
    createParserPool() {
      class bananaParser extends abstractFruitParser {}
      return new Particle.ParserPool(undefined, Object.assign(Object.assign({}, super.createParserPool()._getCueMapAsObject()), { apple: appleParser, banana: bananaParser }), undefined)
    }
  }

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  window.fruitParser = fruitParser
}
