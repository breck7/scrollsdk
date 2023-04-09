#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { TreeNode } = require("./TreeNode.js")
  const { HandGrammarProgram } = require("./GrammarLanguage.js")
  const { GrammarBackedNode } = require("./GrammarLanguage.js")

  class jibberishParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        errorParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {
          extendsAbstract: extendsAbstractParser,
          hue: hueParser,
          saturation: saturationParser,
          constrast: constrastParser,
          "html.h1": h1Parser,
          add: addParser,
          "+": plusParser,
          block: blockParser,
          scoreBlock: scoreBlockParser,
          to: toParser,
          foo: fooParser,
          xColumnName: xColumnNameParser,
          lightbulbState: lightbulbStateParser,
          nested: nestedParser,
          nodeWithConsts: nodeWithConstsParser,
          nodeExpandsConsts: nodeExpandsConstsParser,
          someCode: someCodeParser,
          type: typeParser,
          text: textParser
        }),
        undefined
      )
    }
    execute() {
      return 42
    }
    static cachedHandGrammarProgramRoot = new HandGrammarProgram(`// Cell Parsers
anyCell
columnNameEnumCell
columnNameCell
errorCell
 highlightScope invalid
intCell
 highlightScope constant.numeric
onoffCell
 enum on off
wordCell
topLevelPropertyCell
 highlightScope constant.language
opSymbolCell
 highlightScope keyword.operator.arithmetic

// Line Parsers
jibberishParser
 root
 description A useless Tree Language built for testing Tree Notation code.
 javascript
  execute() {
   return 42
  }
 compilesTo txt
 catchAllParser errorParser
 inScope abstractTopLevelParser textParser abstractBaseClassParser
abstractBaseClassParser
extendsAbstractParser
 cells topLevelPropertyCell intCell
 extends abstractBaseClassParser
 crux extendsAbstract
abstractTopLevelParser
 cells topLevelPropertyCell
abstractColorPropertiesParser
 cells topLevelPropertyCell intCell
 extends abstractTopLevelParser
hueParser
 extends abstractColorPropertiesParser
 crux hue
saturationParser
 extends abstractColorPropertiesParser
 crux saturation
constrastParser
 extends abstractColorPropertiesParser
 crux constrast
abstractHtmlParser
 inScope contentParser
 extends abstractTopLevelParser
h1Parser
 crux html.h1
 extends abstractHtmlParser
addParser
 extends abstractTopLevelParser
 crux add
plusParser
 crux +
 extends addParser
 example Adding two numbers:
  + 1 2
 catchAllCellType intCell
 cells opSymbolCell
blockParser
 inScope abstractTopLevelParser scoreBlockParser
 extends abstractTopLevelParser
 crux block
scoreBlockParser
 description Test that inscope extends and does not overwrite.
 extends blockParser
 inScope scoresParser
 crux scoreBlock
toParser
 cells topLevelPropertyCell wordCell
 compiler
  stringTemplate to {word}
  closeChildren end
 extends blockParser
 crux to
fooParser
 extends abstractTopLevelParser
 crux foo
xColumnNameParser
 description The name of the column to use for the x axis
 cells topLevelPropertyCell columnNameEnumCell
 tags doNotSynthesize
 javascript
  getRunTimeEnumOptions(cell) {
   return cell.cellTypeId === "columnNameEnumCell" ? ["gender", "height", "weight"] : undefined
  }
 extends abstractTopLevelParser
 crux xColumnName
lightbulbStateParser
 cells topLevelPropertyCell onoffCell
 extends abstractTopLevelParser
 crux lightbulbState
nestedParser
 extends abstractTopLevelParser
 crux nested
nodeWithConstsParser
 string greeting hello world
 string singleCell hello
 string thisHasQuotes "'\`
 string longText
  hello
  world
 int score1 28
 int anArray 2 3 4
 float score2 3.01
 boolean win true
 extends abstractTopLevelParser
 crux nodeWithConsts
nodeExpandsConstsParser
 string greeting hola
 extends nodeWithConstsParser
 crux nodeExpandsConsts
someCodeParser
 catchAllParser lineOfCodeParser
 extends abstractTopLevelParser
 crux someCode
typeParser
 cells topLevelPropertyCell wordCell
 single
 extends abstractTopLevelParser
 crux type
contentParser
 baseParser blobParser
 crux content
errorParser
 catchAllCellType errorCell
 baseParser errorParser
 cells errorCell
lineOfCodeParser
 catchAllCellType wordCell
textParser
 baseParser blobParser
 crux text
scoresParser
 catchAllCellType intCell
 cells topLevelPropertyCell
 crux scores`)
    get handGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static rootParser = jibberishParser
  }

  class abstractBaseClassParser extends GrammarBackedNode {}

  class extendsAbstractParser extends abstractBaseClassParser {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get intCell() {
      return parseInt(this.getWord(1))
    }
  }

  class abstractTopLevelParser extends GrammarBackedNode {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
  }

  class abstractColorPropertiesParser extends abstractTopLevelParser {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get intCell() {
      return parseInt(this.getWord(1))
    }
  }

  class hueParser extends abstractColorPropertiesParser {}

  class saturationParser extends abstractColorPropertiesParser {}

  class constrastParser extends abstractColorPropertiesParser {}

  class abstractHtmlParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { content: contentParser }), undefined)
    }
  }

  class h1Parser extends abstractHtmlParser {}

  class addParser extends abstractTopLevelParser {}

  class plusParser extends addParser {
    get opSymbolCell() {
      return this.getWord(0)
    }
    get intCell() {
      return this.getWordsFrom(1).map(val => parseInt(val))
    }
  }

  class blockParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {
          hue: hueParser,
          saturation: saturationParser,
          constrast: constrastParser,
          "html.h1": h1Parser,
          add: addParser,
          "+": plusParser,
          block: blockParser,
          scoreBlock: scoreBlockParser,
          to: toParser,
          foo: fooParser,
          xColumnName: xColumnNameParser,
          lightbulbState: lightbulbStateParser,
          nested: nestedParser,
          nodeWithConsts: nodeWithConstsParser,
          nodeExpandsConsts: nodeExpandsConstsParser,
          someCode: someCodeParser,
          type: typeParser
        }),
        undefined
      )
    }
  }

  class scoreBlockParser extends blockParser {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { scores: scoresParser }), undefined)
    }
  }

  class toParser extends blockParser {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get wordCell() {
      return this.getWord(1)
    }
  }

  class fooParser extends abstractTopLevelParser {}

  class xColumnNameParser extends abstractTopLevelParser {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get columnNameEnumCell() {
      return this.getWord(1)
    }
    getRunTimeEnumOptions(cell) {
      return cell.cellTypeId === "columnNameEnumCell" ? ["gender", "height", "weight"] : undefined
    }
  }

  class lightbulbStateParser extends abstractTopLevelParser {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get onoffCell() {
      return this.getWord(1)
    }
  }

  class nestedParser extends abstractTopLevelParser {}

  class nodeWithConstsParser extends abstractTopLevelParser {
    get win() {
      return true
    }
    get score2() {
      return 3.01
    }
    get anArray() {
      return [2, 3, 4]
    }
    get score1() {
      return 28
    }
    get longText() {
      return `hello
world`
    }
    get thisHasQuotes() {
      return `"'\``
    }
    get singleCell() {
      return `hello`
    }
    get greeting() {
      return `hello world`
    }
  }

  class nodeExpandsConstsParser extends nodeWithConstsParser {
    get greeting() {
      return `hola`
    }
  }

  class someCodeParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(lineOfCodeParser, undefined, undefined)
    }
  }

  class typeParser extends abstractTopLevelParser {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get wordCell() {
      return this.getWord(1)
    }
  }

  class contentParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())
    }
    getErrors() {
      return []
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

  class lineOfCodeParser extends GrammarBackedNode {
    get wordCell() {
      return this.getWordsFrom(0)
    }
  }

  class textParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())
    }
    getErrors() {
      return []
    }
  }

  class scoresParser extends GrammarBackedNode {
    get topLevelPropertyCell() {
      return this.getWord(0)
    }
    get intCell() {
      return this.getWordsFrom(1).map(val => parseInt(val))
    }
  }

  module.exports = jibberishParser
  jibberishParser

  if (!module.parent) new jibberishParser(TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
