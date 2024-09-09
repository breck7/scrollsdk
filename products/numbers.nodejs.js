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
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {
          "%": modParser,
          "*": timesParser,
          "+": addParser,
          "-": substractParser,
          "/": divideParser,
          comment: commentParser,
          "#!": hashBangParser
        }),
        undefined
      )
    }
    execute() {
      return this.map(child => child.execute())
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// Cell Parsers
floatCell
commentCell
 paint comment
keywordCell
hashBangKeywordCell
 extends keywordCell
 paint comment
commentKeywordCell
 extends keywordCell
 paint comment
 enum comment
errorCell
 paint invalid
numberCell
 paint constant.numeric
 extends floatCell
numbersCell
 extends numberCell
operatorCell
 paint keyword.operator.arithmetic

// Line Parsers
numbersParser
 root
 description A useless Language for testing Particles features.
 inScope abstractArithmeticReducerParser commentParser hashBangParser
 catchAllParser errorParser
 javascript
  execute() {
   return this.map(child => child.execute())
  }

abstractArithmeticReducerParser
 description First reduces any child lists to one number and then reduces its own lists to one number using provided operator.
 javascript
  execute() {
   return this.numbersCell.slice(1).reduce((curr, tot) => eval(\`\${curr}\${this.operator}\${tot}\`), this.numbersCell[0])
  }
 inScope abstractArithmeticReducerParser commentParser
 cells operatorCell
 catchAllCellType numbersCell

modParser
 crux %
 extends abstractArithmeticReducerParser
 string operator %
timesParser
 crux *
 extends abstractArithmeticReducerParser
 string operator *
addParser
 crux +
 extends abstractArithmeticReducerParser
 string operator +
substractParser
 crux -
 extends abstractArithmeticReducerParser
 string operator -
divideParser
 crux /
 extends abstractArithmeticReducerParser
 string operator /

commentParser
 description This is a line comment.
 catchAllCellType commentCell
 catchAllParser commentContentParser
 cells commentKeywordCell
commentContentParser
 catchAllCellType commentCell
 catchAllParser commentContentParser

hashBangParser
 crux #!
 cells hashBangKeywordCell
 catchAllCellType commentCell

errorParser
 catchAllCellType errorCell
 baseParser errorParser
 cells errorCell`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = numbersParser
  }

  class abstractArithmeticReducerParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { "%": modParser, "*": timesParser, "+": addParser, "-": substractParser, "/": divideParser, comment: commentParser }),
        undefined
      )
    }
    get operatorCell() {
      return this.getWord(0)
    }
    get numbersCell() {
      return this.getWordsFrom(1).map(val => parseFloat(val))
    }
    execute() {
      return this.numbersCell.slice(1).reduce((curr, tot) => eval(`${curr}${this.operator}${tot}`), this.numbersCell[0])
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
    get commentKeywordCell() {
      return this.getWord(0)
    }
    get commentCell() {
      return this.getWordsFrom(1)
    }
  }

  class commentContentParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(commentContentParser, undefined, undefined)
    }
    get commentCell() {
      return this.getWordsFrom(0)
    }
  }

  class hashBangParser extends ParserBackedParticle {
    get hashBangKeywordCell() {
      return this.getWord(0)
    }
    get commentCell() {
      return this.getWordsFrom(1)
    }
  }

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
    get errorCell() {
      return this.getWord(0)
    }
    get errorCell() {
      return this.getWordsFrom(1)
    }
  }

  module.exports = numbersParser
  numbersParser

  if (!module.parent) new numbersParser(Particle.fromDisk(process.argv[2]).toString()).execute()
}
