#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { TreeNode } = require("./TreeNode.js")
  const { HandGrammarProgram } = require("./GrammarLanguage.js")
  const { GrammarBackedNode } = require("./GrammarLanguage.js")

  class numbersParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        errorParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {
          "%": modParser,
          "*": timesParser,
          "+": addParser,
          "-": substractParser,
          "/": divideParser,
          comment: commentParser,
          "#!": hashBangParser,
        }),
        undefined
      )
    }
    execute() {
      return this.map((child) => child.execute())
    }
    static cachedHandGrammarProgramRoot = new HandGrammarProgram(`// Cell Parsers
floatCell
commentCell
 highlightScope comment
keywordCell
hashBangKeywordCell
 extends keywordCell
 highlightScope comment
commentKeywordCell
 extends keywordCell
 highlightScope comment
 enum comment
errorCell
 highlightScope invalid
numberCell
 highlightScope constant.numeric
 extends floatCell
numbersCell
 extends numberCell
operatorCell
 highlightScope keyword.operator.arithmetic

// Line Parsers
numbersParser
 root
 description A useless Tree Language for testing Tree Notation features.
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
    get handGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static rootParser = numbersParser
  }

  class abstractArithmeticReducerParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {
          "%": modParser,
          "*": timesParser,
          "+": addParser,
          "-": substractParser,
          "/": divideParser,
          comment: commentParser,
        }),
        undefined
      )
    }
    get operatorCell() {
      return this.getWord(0)
    }
    get numbersCell() {
      return this.getWordsFrom(1).map((val) => parseFloat(val))
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

  class commentParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(commentContentParser, undefined, undefined)
    }
    get commentKeywordCell() {
      return this.getWord(0)
    }
    get commentCell() {
      return this.getWordsFrom(1)
    }
  }

  class commentContentParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(commentContentParser, undefined, undefined)
    }
    get commentCell() {
      return this.getWordsFrom(0)
    }
  }

  class hashBangParser extends GrammarBackedNode {
    get hashBangKeywordCell() {
      return this.getWord(0)
    }
    get commentCell() {
      return this.getWordsFrom(1)
    }
  }

  class errorParser extends GrammarBackedNode {
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

  if (!module.parent) new numbersParser(TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
