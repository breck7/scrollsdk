#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { Particle } = require("./Particle.js")
  const { HandParsersProgram } = require("./Parsers.js")
  const { ParserBackedParticle } = require("./Parsers.js")

  class numbersParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        errorParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { "%": modParser, "*": timesParser, "+": addParser, "-": substractParser, "/": divideParser, comment: commentParser, "#!": hashBangParser }),
        undefined
      )
    }
    execute() {
      return this.map(subparticle => subparticle.execute())
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// Atom Parsers
floatAtom
commentAtom
 paint comment
keywordAtom
hashBangKeywordAtom
 extends keywordAtom
 paint comment
commentKeywordAtom
 extends keywordAtom
 paint comment
 enum comment
errorAtom
 paint invalid
numberAtom
 paint constant.numeric
 extends floatAtom
numbersAtom
 extends numberAtom
operatorAtom
 paint keyword.operator.arithmetic

// Line Parsers
numbersParser
 root
 description A useless Language for testing Particles features.
 inScope abstractArithmeticReducerParser commentParser hashBangParser
 catchAllParser errorParser
 javascript
  execute() {
   return this.map(subparticle => subparticle.execute())
  }

abstractArithmeticReducerParser
 description First reduces any subparticle lists to one number and then reduces its own lists to one number using provided operator.
 javascript
  execute() {
   return this.numbersAtom.slice(1).reduce((curr, tot) => eval(\`\${curr}\${this.operator}\${tot}\`), this.numbersAtom[0])
  }
 inScope abstractArithmeticReducerParser commentParser
 atoms operatorAtom
 catchAllAtomType numbersAtom

modParser
 cue %
 extends abstractArithmeticReducerParser
 string operator %
timesParser
 cue *
 extends abstractArithmeticReducerParser
 string operator *
addParser
 cue +
 extends abstractArithmeticReducerParser
 string operator +
substractParser
 cue -
 extends abstractArithmeticReducerParser
 string operator -
divideParser
 cue /
 extends abstractArithmeticReducerParser
 string operator /

commentParser
 description This is a line comment.
 catchAllAtomType commentAtom
 catchAllParser commentContentParser
 atoms commentKeywordAtom
commentContentParser
 catchAllAtomType commentAtom
 catchAllParser commentContentParser

hashBangParser
 cue #!
 atoms hashBangKeywordAtom
 catchAllAtomType commentAtom

errorParser
 catchAllAtomType errorAtom
 baseParser errorParser
 atoms errorAtom`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = numbersParser
  }

  class abstractArithmeticReducerParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { "%": modParser, "*": timesParser, "+": addParser, "-": substractParser, "/": divideParser, comment: commentParser }),
        undefined
      )
    }
    get operatorAtom() {
      return this.getAtom(0)
    }
    get numbersAtom() {
      return this.getAtomsFrom(1).map(val => parseFloat(val))
    }
    execute() {
      return this.numbersAtom.slice(1).reduce((curr, tot) => eval(`${curr}${this.operator}${tot}`), this.numbersAtom[0])
    }
  }

  class modParser extends abstractArithmeticReducerParser {
    get operator() {
      return `%`
    }
  }

  class timesParser extends abstractArithmeticReducerParser {
    get operator() {
      return `*`
    }
  }

  class addParser extends abstractArithmeticReducerParser {
    get operator() {
      return `+`
    }
  }

  class substractParser extends abstractArithmeticReducerParser {
    get operator() {
      return `-`
    }
  }

  class divideParser extends abstractArithmeticReducerParser {
    get operator() {
      return `/`
    }
  }

  class commentParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(commentContentParser, undefined, undefined)
    }
    get commentKeywordAtom() {
      return this.getAtom(0)
    }
    get commentAtom() {
      return this.getAtomsFrom(1)
    }
  }

  class commentContentParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(commentContentParser, undefined, undefined)
    }
    get commentAtom() {
      return this.getAtomsFrom(0)
    }
  }

  class hashBangParser extends ParserBackedParticle {
    get hashBangKeywordAtom() {
      return this.getAtom(0)
    }
    get commentAtom() {
      return this.getAtomsFrom(1)
    }
  }

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
    get errorAtom() {
      return this.getAtom(0)
    }
    get errorAtom() {
      return this.getAtomsFrom(1)
    }
  }

  module.exports = numbersParser
  numbersParser

  if (!module.parent) new numbersParser(Particle.fromDisk(process.argv[2]).toString()).execute()
}
