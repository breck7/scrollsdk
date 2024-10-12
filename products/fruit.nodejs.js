#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { Particle } = require("./Particle.js")
  const { HandParsersProgram } = require("./Parsers.js")
  const { ParserBackedParticle } = require("./Parsers.js")

  class fruitParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(errorParser, Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { apple: appleParser }), undefined)
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`fruitNameAtom
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
 baseParser errorParser`)
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
    createParserCombinator() {
      class bananaParser extends abstractFruitParser {}
      return new Particle.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { apple: appleParser, banana: bananaParser }), undefined)
    }
  }

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  module.exports = fruitParser
  fruitParser

  if (!module.parent) new fruitParser(Particle.fromDisk(process.argv[2]).toString()).execute()
}
