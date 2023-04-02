#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { TreeNode } = require("./TreeNode.js")
  const { HandGrammarProgram } = require("./GrammarLanguage.js")
  const { GrammarBackedNode } = require("./GrammarLanguage.js")

  class chuckParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser(), undefined, [
        { regex: /\+/, parser: addParser },
        { regex: /\*/, parser: multiplyParser },
        { regex: /print/, parser: printParser },
        { regex: /^[\d\. ]+$/, parser: onlyNumbersParser }
      ])
    }
    static cachedHandGrammarProgramRoot = new HandGrammarProgram(`// todo Make this compile and execute

// Cell Parsers
operatorCell
 highlightScope keyword
 enum + * print
floatCell

// Line Parsers
chuckParser
 description A useless demo Tree Language inspired by Forth that tests postfix notation.
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
    get handGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static rootParser = chuckParser
  }

  class abstractOperatorParser extends GrammarBackedNode {
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

  class onlyNumbersParser extends GrammarBackedNode {
    get floatCell() {
      return this.getWordsFrom(0).map(val => parseFloat(val))
    }
  }

  module.exports = chuckParser
  chuckParser

  if (!module.parent) new chuckParser(TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
