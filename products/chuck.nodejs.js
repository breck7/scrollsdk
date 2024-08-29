#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { Particle } = require("./Particle.js")
  const { HandParsersProgram } = require("./Parsers.js")
  const { ParserBackedParticle } = require("./Parsers.js")

  class chuckParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(this._getBlobParserCatchAllParser(), undefined, [
        { regex: /\+/, parser: addParser },
        { regex: /\*/, parser: multiplyParser },
        { regex: /print/, parser: printParser },
        { regex: /^[\d\. ]+$/, parser: onlyNumbersParser }
      ])
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// todo Make this compile and execute

// Cell Parsers
operatorCell
 paint keyword
 enum + * print
floatCell

// Line Parsers
chuckParser
 description A useless demo Language inspired by Forth that tests postfix notation.
 root
 inScope abstractOperatorParser onlyNumbersParser
abstractOperatorParser
 catchAllCellType floatCell
 cells operatorCell
 cellParser postfix
addParser
 extends abstractOperatorParser
 pattern \\+
multiplyParser
 extends abstractOperatorParser
 pattern \\*
printParser
 extends abstractOperatorParser
 pattern print
onlyNumbersParser
 catchAllCellType floatCell
 pattern ^[\\d\\. ]+$`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = chuckParser
  }

  class abstractOperatorParser extends ParserBackedParticle {
    get operatorCell() {
      return this.getWord(0)
    }
    get floatCell() {
      return this.getWordsFrom(1).map(val => parseFloat(val))
    }
  }

  class addParser extends abstractOperatorParser {}

  class multiplyParser extends abstractOperatorParser {}

  class printParser extends abstractOperatorParser {}

  class onlyNumbersParser extends ParserBackedParticle {
    get floatCell() {
      return this.getWordsFrom(0).map(val => parseFloat(val))
    }
  }

  module.exports = chuckParser
  chuckParser

  if (!module.parent) new chuckParser(Particle.fromDisk(process.argv[2]).toString()).execute()
}
