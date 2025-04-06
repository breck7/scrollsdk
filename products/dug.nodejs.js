#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { Particle } = require("./Particle.js")
  const { HandParsersProgram } = require("./Parsers.js")
  const { ParserBackedParticle } = require("./Parsers.js")
  class dugParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(
        errorParser,
        Object.assign(Object.assign({}, super.createParserPool()._getCueMapAsObject()), { null: nullParser, number: numberParser, string: stringParser, boolean: booleanParser, object: objectParser, array: arrayParser }),
        undefined
      )
    }
    compile() {
      const res = super.compile()
      return JSON.stringify(JSON.parse(res), null, 2)
    }
    static _parserSourceCode = `// todo Add swarm tests for top scenarios, including the scalar at root level scenario.
// todo Create a new language, similar to this, except using pattern matching instead of prefix notation.

// Atom Parsers
anyAtom
cueAtom
 paint keyword
stringAtom
 paint string
booleanAtom
 enum true false
 paint constant.numeric
numberAtom
 paint constant.numeric

// Line Parsers
dugParser
 root
 description A demonstration prefix Language that compiles to JSON.
 inScope abstractValueParser
 catchAllParser errorParser
 javascript
  compile() {
   const res = super.compile()
   return JSON.stringify(JSON.parse(res), null, 2)
  }
abstractValueParser
 atoms cueAtom
 cueFromId
nullParser
 compiler
  stringTemplate null
 extends abstractValueParser
numberParser
 extends abstractValueParser
 atoms cueAtom numberAtom
 compiler
  stringTemplate {numberAtom}
stringParser
 catchAllAtomType stringAtom
 compiler
  stringTemplate "{stringAtom}"
 extends abstractValueParser
booleanParser
 extends abstractValueParser
 atoms cueAtom booleanAtom
 compiler
  stringTemplate {booleanAtom}
objectParser
 catchAllParser memberParser
 extends abstractValueParser
 compiler
  stringTemplate  
  joinSubparticlesWith , 
  openSubparticles {
  closeSubparticles }
arrayParser
 extends abstractValueParser
 inScope abstractValueParser
 compiler
  stringTemplate  
  joinSubparticlesWith , 
  openSubparticles [
  closeSubparticles ]
memberParser
 inScope abstractValueParser
 compiler
  stringTemplate "{stringAtom}" :
 atoms stringAtom
errorParser
 baseParser errorParser`
    static cachedHandParsersProgramRoot = new HandParsersProgram(this._parserSourceCode)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = dugParser
  }

  class abstractValueParser extends ParserBackedParticle {
    get cueAtom() {
      return this.getAtom(0)
    }
  }

  class nullParser extends abstractValueParser {}

  class numberParser extends abstractValueParser {
    get cueAtom() {
      return this.getAtom(0)
    }
    get numberAtom() {
      return parseFloat(this.getAtom(1))
    }
  }

  class stringParser extends abstractValueParser {
    get stringAtom() {
      return this.getAtomsFrom(0)
    }
  }

  class booleanParser extends abstractValueParser {
    get cueAtom() {
      return this.getAtom(0)
    }
    get booleanAtom() {
      return this.getAtom(1)
    }
  }

  class objectParser extends abstractValueParser {
    createParserPool() {
      return new Particle.ParserPool(memberParser, undefined, undefined)
    }
  }

  class arrayParser extends abstractValueParser {
    createParserPool() {
      return new Particle.ParserPool(
        undefined,
        Object.assign(Object.assign({}, super.createParserPool()._getCueMapAsObject()), { null: nullParser, number: numberParser, string: stringParser, boolean: booleanParser, object: objectParser, array: arrayParser }),
        undefined
      )
    }
  }

  class memberParser extends ParserBackedParticle {
    createParserPool() {
      return new Particle.ParserPool(
        undefined,
        Object.assign(Object.assign({}, super.createParserPool()._getCueMapAsObject()), { null: nullParser, number: numberParser, string: stringParser, boolean: booleanParser, object: objectParser, array: arrayParser }),
        undefined
      )
    }
    get stringAtom() {
      return this.getAtom(0)
    }
  }

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  module.exports = dugParser
  dugParser

  if (!module.parent) new dugParser(Particle.fromDisk(process.argv[2]).toString()).execute()
}
