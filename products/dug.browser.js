{
  class dugParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        errorParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { null: nullParser, number: numberParser, string: stringParser, boolean: booleanParser, object: objectParser, array: arrayParser }),
        undefined
      )
    }
    compile() {
      const res = super.compile()
      return JSON.stringify(JSON.parse(res), null, 2)
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// todo Add swarm tests for top scenarios, including the scalar at root level scenario.
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
nullParser abstractValueParser
 compiler
  stringTemplate null
numberParser abstractValueParser
 atoms cueAtom numberAtom
 compiler
  stringTemplate {numberAtom}
stringParser abstractValueParser
 catchAllAtomType stringAtom
 compiler
  stringTemplate "{stringAtom}"
booleanParser abstractValueParser
 atoms cueAtom booleanAtom
 compiler
  stringTemplate {booleanAtom}
objectParser abstractValueParser
 catchAllParser memberParser
 compiler
  stringTemplate  
  joinSubparticlesWith , 
  openSubparticles {
  closeSubparticles }
arrayParser abstractValueParser
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
 baseParser errorParser`)
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
    createParserCombinator() {
      return new Particle.ParserCombinator(memberParser, undefined, undefined)
    }
  }

  class arrayParser extends abstractValueParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { null: nullParser, number: numberParser, string: stringParser, boolean: booleanParser, object: objectParser, array: arrayParser }),
        undefined
      )
    }
  }

  class memberParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { null: nullParser, number: numberParser, string: stringParser, boolean: booleanParser, object: objectParser, array: arrayParser }),
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

  window.dugParser = dugParser
}
