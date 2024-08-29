{
  class dugParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        errorParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { null: nullParser, number: numberParser, string: stringParser, boolean: booleanParser, object: objectParser, array: arrayParser }),
        undefined
      )
    }
    compile() {
      const res = super.compile()
      return JSON.stringify(JSON.parse(res), null, 2)
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// todo Add swarm tests for top scenarios, including the scalar at root level scenario.
// todo Create a new language, similar to this, except using pattern matching instead of prefix notation.

// Cell Parsers
anyCell
keywordCell
 paint keyword
stringCell
 paint string
booleanCell
 enum true false
 paint constant.numeric
numberCell
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
 cells keywordCell
 cruxFromId
nullParser
 compiler
  stringTemplate null
 extends abstractValueParser
numberParser
 extends abstractValueParser
 cells keywordCell numberCell
 compiler
  stringTemplate {numberCell}
stringParser
 catchAllCellType stringCell
 compiler
  stringTemplate "{stringCell}"
 extends abstractValueParser
booleanParser
 extends abstractValueParser
 cells keywordCell booleanCell
 compiler
  stringTemplate {booleanCell}
objectParser
 catchAllParser memberParser
 extends abstractValueParser
 compiler
  stringTemplate  
  joinChildrenWith , 
  openChildren {
  closeChildren }
arrayParser
 extends abstractValueParser
 inScope abstractValueParser
 compiler
  stringTemplate  
  joinChildrenWith , 
  openChildren [
  closeChildren ]
memberParser
 inScope abstractValueParser
 compiler
  stringTemplate "{stringCell}" :
 cells stringCell
errorParser
 baseParser errorParser`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = dugParser
  }

  class abstractValueParser extends ParserBackedParticle {
    get keywordCell() {
      return this.getWord(0)
    }
  }

  class nullParser extends abstractValueParser {}

  class numberParser extends abstractValueParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get numberCell() {
      return parseFloat(this.getWord(1))
    }
  }

  class stringParser extends abstractValueParser {
    get stringCell() {
      return this.getWordsFrom(0)
    }
  }

  class booleanParser extends abstractValueParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get booleanCell() {
      return this.getWord(1)
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
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { null: nullParser, number: numberParser, string: stringParser, boolean: booleanParser, object: objectParser, array: arrayParser }),
        undefined
      )
    }
  }

  class memberParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { null: nullParser, number: numberParser, string: stringParser, boolean: booleanParser, object: objectParser, array: arrayParser }),
        undefined
      )
    }
    get stringCell() {
      return this.getWord(0)
    }
  }

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  window.dugParser = dugParser
}
