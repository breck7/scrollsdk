{
  class fireParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        errorParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {
          block: blockParser,
          function: functionParser,
          if: ifParser,
          while: whileParser,
          divide: divideParser,
          modulo: moduloParser,
          multiply: multiplyParser,
          substract: substractParser,
          add: addParser,
          greaterThan: greaterThanParser,
          greaterThanOrEqual: greaterThanOrEqualParser,
          lessThan: lessThanParser,
          lessThanOrEqual: lessThanOrEqualParser,
          sum: sumParser,
          boolean: booleanParser,
          callFunctionAndSet: callFunctionAndSetParser,
          callMethodAndSet: callMethodAndSetParser,
          join: joinParser,
          mutableNumber: mutableNumberParser,
          number: numberParser,
          numbers: numbersParser,
          string: stringParser,
          callFunction: callFunctionParser,
          decrement: decrementParser,
          dumpIdentifier: dumpIdentifierParser,
          export: exportParser,
          increment: incrementParser,
          printNumber: printNumberParser,
          printString: printStringParser,
          require: requireParser,
          return: returnParser,
          "#!": hashbangParser,
        }),
        undefined
      )
    }
    async execute() {
      let outputLines = []
      const _originalConsoleLog = console.log
      const tempConsoleLog = (...params) => outputLines.push(params)
      console.log = tempConsoleLog
      const compiled = this.compile("js")
      eval(compiled)
      console.log = _originalConsoleLog
      console.log(outputLines.join("\n"))
      return outputLines
    }
    static cachedHandGrammarProgramRoot = new HandGrammarProgram(`// todo Explore best ways to add polymorphism

// Cell Parsers
anyCell
booleanCell
 enum false true
filepathCell
identifierCell
 regex [$A-Za-z_][0-9a-zA-Z_$]*
 highlightScope variable
 examples myVarA someVarB
numberCell
 regex \\-?[0-9]*\\.?[0-9]*
 highlightScope constant.numeric
numberIdentifierCell
 extends identifierCell
hashBangCell
 highlightScope comment
hashBangKeywordCell
 highlightScope comment
stringCell
 highlightScope string
booleanIdentifierCell
 extends identifierCell
functionIdentifierCell
 extends identifierCell
identifiersCell
 extends identifierCell
instanceIdentifierCell
 extends identifierCell
methodIdentifierCell
 extends identifierCell
resultIdentifierCell
 extends identifierCell
keywordCell
 highlightScope keyword
stringIdentifierCell
 extends identifierCell
stringCellsCell
 extends stringCell
leftNumberCell
 extends numberCell
leftAnyCell
 extends anyCell

// Line Parsers
fireParser
 root
 description A useless prefix Tree Language that compiles to Javascript for testing Tree Notation features.
 compilesTo js
 inScope hashbangParser abstractTerminalParser abstractNonTerminalParser
 catchAllParser errorParser
 javascript
  async execute() {
   let outputLines = []
   const _originalConsoleLog = console.log
   const tempConsoleLog = (...params) => outputLines.push(params)
   console.log = tempConsoleLog
   const compiled = this.compile("js")
   eval(compiled)
   console.log = _originalConsoleLog
   console.log(outputLines.join("\\n"))
   return outputLines
  }
abstractNonTerminalParser
 inScope abstractTerminalParser abstractNonTerminalParser
 cells keywordCell
abstractJsblockParser
 compiler
  openChildren  {
  closeChildren }
 extends abstractNonTerminalParser
blockParser
 description block of code
 frequency .2
 compiler
  stringTemplate /* {identifierCell} */
 extends abstractJsblockParser
 crux block
functionParser
 crux function
 description Function Assignment
 cells keywordCell functionIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {functionIdentifierCell} = ({anyCell}) =>
  catchAllCellDelimiter , 
 frequency .1
 extends abstractJsblockParser
ifParser
 crux if
 description If tile
 cells keywordCell identifierCell
 frequency .2
 compiler
  stringTemplate if ({identifierCell})
 extends abstractJsblockParser
whileParser
 crux while
 description While tile
 cells keywordCell identifierCell
 frequency .1
 compiler
  stringTemplate while ({identifierCell})
 extends abstractJsblockParser
abstractTerminalParser
 cells keywordCell
abstractAssignmentParser
 extends abstractTerminalParser
abstractArithmeticParser
 cells keywordCell identifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {identifierCell} = {anyCell}
 frequency .2
 extends abstractAssignmentParser
divideParser
 description Divide Numbers
 compiler
  catchAllCellDelimiter  / 
 extends abstractArithmeticParser
 crux divide
moduloParser
 description Modulo Numbers
 compiler
  catchAllCellDelimiter %
 extends abstractArithmeticParser
 crux modulo
multiplyParser
 description Multiply Numbers
 compiler
  catchAllCellDelimiter  * 
 extends abstractArithmeticParser
 crux multiply
substractParser
 description Subtract Numbers
 compiler
  catchAllCellDelimiter  - 
 extends abstractArithmeticParser
 crux substract
addParser
 crux add
 example
  add ten 2 3 5
 description Add numbers and store result
 compiler
  catchAllCellDelimiter  + 
 extends abstractArithmeticParser
abstractBooleanOperatorParser
 description Runs a boolean test and saves result.
 extends abstractAssignmentParser
greaterThanParser
 description Greater than test
 cells keywordCell identifierCell leftNumberCell numberCell
 compiler
  stringTemplate const {identifierCell} = {leftNumberCell} > {numberCell}
 frequency .1
 extends abstractBooleanOperatorParser
 crux greaterThan
greaterThanOrEqualParser
 description Greater than or equal to test
 cells keywordCell identifierCell leftNumberCell numberCell
 compiler
  stringTemplate const {identifierCell} = {leftNumberCell} >= {numberCell}
 frequency .1
 extends abstractBooleanOperatorParser
 crux greaterThanOrEqual
lessThanParser
 description Less than test
 cells keywordCell identifierCell leftAnyCell anyCell
 compiler
  stringTemplate const {identifierCell} = {leftAnyCell} < {anyCell}
 frequency .1
 extends abstractBooleanOperatorParser
 crux lessThan
lessThanOrEqualParser
 crux lessThanOrEqual
 description Less than or equal to test
 cells keywordCell identifierCell leftAnyCell anyCell
 compiler
  stringTemplate const {identifierCell} = {leftAnyCell} <= {anyCell}
 frequency .1
 extends abstractBooleanOperatorParser
sumParser
 crux sum
 description Add numbers and store result
 cells keywordCell numberIdentifierCell
 catchAllCellType numberCell
 compiler
  stringTemplate const {numberIdentifierCell} = [{numberCell}].reduce((sum, num) => sum + num)
  catchAllCellDelimiter , 
 frequency .1
 extends abstractAssignmentParser
booleanParser
 crux boolean
 description Boolean Assignment
 cells keywordCell booleanIdentifierCell booleanCell
 compiler
  stringTemplate const {booleanIdentifierCell} = {booleanCell}
 extends abstractAssignmentParser
callFunctionAndSetParser
 crux callFunctionAndSet
 description Function Call
 frequency .5
 cells keywordCell resultIdentifierCell functionIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {resultIdentifierCell} = {functionIdentifierCell}({anyCell})
  catchAllCellDelimiter , 
 extends abstractAssignmentParser
callMethodAndSetParser
 crux callMethodAndSet
 description Method Call
 frequency .5
 cells keywordCell resultIdentifierCell instanceIdentifierCell methodIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {resultIdentifierCell} = {instanceIdentifierCell}.{methodIdentifierCell}({anyCell})
  catchAllCellDelimiter , 
 extends abstractAssignmentParser
joinParser
 crux join
 description Join strings to form new string
 cells keywordCell identifierCell
 catchAllCellType identifiersCell
 compiler
  stringTemplate const {identifierCell} = [{identifiersCell}].join("")
  catchAllCellDelimiter , 
 frequency .2
 extends abstractAssignmentParser
mutableNumberParser
 crux mutableNumber
 description Mutable Number Assignment
 cells keywordCell identifierCell numberCell
 compiler
  stringTemplate let {identifierCell} = {numberCell}
 extends abstractAssignmentParser
numberParser
 crux number
 description Number Assignment
 cells keywordCell identifierCell numberCell
 compiler
  stringTemplate const {identifierCell} = {numberCell}
 frequency .3
 extends abstractAssignmentParser
numbersParser
 crux numbers
 description Number Array Assignment
 cells keywordCell identifierCell
 catchAllCellType numberCell
 frequency .4
 compiler
  stringTemplate const {identifierCell} = [{numberCell}]
  catchAllCellDelimiter , 
 extends abstractAssignmentParser
stringParser
 crux string
 description String Assignment
 cells keywordCell stringIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {stringIdentifierCell} = "{anyCell}"
 frequency .2
 extends abstractAssignmentParser
callFunctionParser
 crux callFunction
 description Function call ignore result.
 frequency .1
 cells keywordCell functionIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate {functionIdentifierCell}({anyCell})
  catchAllCellDelimiter , 
 extends abstractTerminalParser
decrementParser
 crux decrement
 description Decrement
 cells keywordCell numberIdentifierCell
 compiler
  stringTemplate {numberIdentifierCell}--
 frequency .1
 extends abstractTerminalParser
dumpIdentifierParser
 crux dumpIdentifier
 description Dump variable(s) to console
 catchAllCellType identifierCell
 compiler
  stringTemplate console.log({identifierCell})
  catchAllCellDelimiter , 
 frequency .5
 extends abstractTerminalParser
exportParser
 crux export
 description Export This
 cells keywordCell identifierCell
 compiler
  stringTemplate module.exports = {identifierCell}
 frequency .1
 extends abstractTerminalParser
incrementParser
 crux increment
 description Increment
 frequency .3
 cells keywordCell numberIdentifierCell
 compiler
  stringTemplate {numberIdentifierCell}++
 extends abstractTerminalParser
printNumberParser
 crux printNumber
 extends abstractTerminalParser
 catchAllCellType numberIdentifierCell
 compiler
  stringTemplate console.log({numberIdentifierCell})
printStringParser
 crux printString
 // todo Allow printing of multiline strings
 extends abstractTerminalParser
 catchAllCellType stringCellsCell
 compiler
  stringTemplate console.log("{stringCells}")
requireParser
 crux require
 description Require Something
 cells keywordCell identifierCell filepathCell
 compiler
  stringTemplate const {identifierCell} = require("{filepathCell}")
 frequency .1
 extends abstractTerminalParser
returnParser
 crux return
 cells keywordCell anyCell
 compiler
  stringTemplate return {anyCell}
 frequency .1
 extends abstractTerminalParser
hashbangParser
 crux #!
 description Standard bash hashbang line.
 catchAllCellType hashBangCell
 compiler
  stringTemplate // #! {hashBangCell}
 cells hashBangKeywordCell
errorParser
 baseParser errorParser
 compiler
  stringTemplate // error`)
    get handGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static rootParser = fireParser
  }

  class abstractNonTerminalParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {
          block: blockParser,
          function: functionParser,
          if: ifParser,
          while: whileParser,
          divide: divideParser,
          modulo: moduloParser,
          multiply: multiplyParser,
          substract: substractParser,
          add: addParser,
          greaterThan: greaterThanParser,
          greaterThanOrEqual: greaterThanOrEqualParser,
          lessThan: lessThanParser,
          lessThanOrEqual: lessThanOrEqualParser,
          sum: sumParser,
          boolean: booleanParser,
          callFunctionAndSet: callFunctionAndSetParser,
          callMethodAndSet: callMethodAndSetParser,
          join: joinParser,
          mutableNumber: mutableNumberParser,
          number: numberParser,
          numbers: numbersParser,
          string: stringParser,
          callFunction: callFunctionParser,
          decrement: decrementParser,
          dumpIdentifier: dumpIdentifierParser,
          export: exportParser,
          increment: incrementParser,
          printNumber: printNumberParser,
          printString: printStringParser,
          require: requireParser,
          return: returnParser,
        }),
        undefined
      )
    }
    get keywordCell() {
      return this.getWord(0)
    }
  }

  class abstractJsblockParser extends abstractNonTerminalParser {}

  class blockParser extends abstractJsblockParser {}

  class functionParser extends abstractJsblockParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get functionIdentifierCell() {
      return this.getWord(1)
    }
    get anyCell() {
      return this.getWordsFrom(2)
    }
  }

  class ifParser extends abstractJsblockParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
  }

  class whileParser extends abstractJsblockParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
  }

  class abstractTerminalParser extends GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
  }

  class abstractAssignmentParser extends abstractTerminalParser {}

  class abstractArithmeticParser extends abstractAssignmentParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
    get anyCell() {
      return this.getWordsFrom(2)
    }
  }

  class divideParser extends abstractArithmeticParser {}

  class moduloParser extends abstractArithmeticParser {}

  class multiplyParser extends abstractArithmeticParser {}

  class substractParser extends abstractArithmeticParser {}

  class addParser extends abstractArithmeticParser {}

  class abstractBooleanOperatorParser extends abstractAssignmentParser {}

  class greaterThanParser extends abstractBooleanOperatorParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
    get leftNumberCell() {
      return parseFloat(this.getWord(2))
    }
    get numberCell() {
      return parseFloat(this.getWord(3))
    }
  }

  class greaterThanOrEqualParser extends abstractBooleanOperatorParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
    get leftNumberCell() {
      return parseFloat(this.getWord(2))
    }
    get numberCell() {
      return parseFloat(this.getWord(3))
    }
  }

  class lessThanParser extends abstractBooleanOperatorParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
    get leftAnyCell() {
      return this.getWord(2)
    }
    get anyCell() {
      return this.getWord(3)
    }
  }

  class lessThanOrEqualParser extends abstractBooleanOperatorParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
    get leftAnyCell() {
      return this.getWord(2)
    }
    get anyCell() {
      return this.getWord(3)
    }
  }

  class sumParser extends abstractAssignmentParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get numberIdentifierCell() {
      return this.getWord(1)
    }
    get numberCell() {
      return this.getWordsFrom(2).map((val) => parseFloat(val))
    }
  }

  class booleanParser extends abstractAssignmentParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get booleanIdentifierCell() {
      return this.getWord(1)
    }
    get booleanCell() {
      return this.getWord(2)
    }
  }

  class callFunctionAndSetParser extends abstractAssignmentParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get resultIdentifierCell() {
      return this.getWord(1)
    }
    get functionIdentifierCell() {
      return this.getWord(2)
    }
    get anyCell() {
      return this.getWordsFrom(3)
    }
  }

  class callMethodAndSetParser extends abstractAssignmentParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get resultIdentifierCell() {
      return this.getWord(1)
    }
    get instanceIdentifierCell() {
      return this.getWord(2)
    }
    get methodIdentifierCell() {
      return this.getWord(3)
    }
    get anyCell() {
      return this.getWordsFrom(4)
    }
  }

  class joinParser extends abstractAssignmentParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
    get identifiersCell() {
      return this.getWordsFrom(2)
    }
  }

  class mutableNumberParser extends abstractAssignmentParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
    get numberCell() {
      return parseFloat(this.getWord(2))
    }
  }

  class numberParser extends abstractAssignmentParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
    get numberCell() {
      return parseFloat(this.getWord(2))
    }
  }

  class numbersParser extends abstractAssignmentParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
    get numberCell() {
      return this.getWordsFrom(2).map((val) => parseFloat(val))
    }
  }

  class stringParser extends abstractAssignmentParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get stringIdentifierCell() {
      return this.getWord(1)
    }
    get anyCell() {
      return this.getWordsFrom(2)
    }
  }

  class callFunctionParser extends abstractTerminalParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get functionIdentifierCell() {
      return this.getWord(1)
    }
    get anyCell() {
      return this.getWordsFrom(2)
    }
  }

  class decrementParser extends abstractTerminalParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get numberIdentifierCell() {
      return this.getWord(1)
    }
  }

  class dumpIdentifierParser extends abstractTerminalParser {
    get identifierCell() {
      return this.getWordsFrom(0)
    }
  }

  class exportParser extends abstractTerminalParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
  }

  class incrementParser extends abstractTerminalParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get numberIdentifierCell() {
      return this.getWord(1)
    }
  }

  class printNumberParser extends abstractTerminalParser {
    get numberIdentifierCell() {
      return this.getWordsFrom(0)
    }
  }

  class printStringParser extends abstractTerminalParser {
    get stringCellsCell() {
      return this.getWordsFrom(0)
    }
  }

  class requireParser extends abstractTerminalParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
    get filepathCell() {
      return this.getWord(2)
    }
  }

  class returnParser extends abstractTerminalParser {
    get keywordCell() {
      return this.getWord(0)
    }
    get anyCell() {
      return this.getWord(1)
    }
  }

  class hashbangParser extends GrammarBackedNode {
    get hashBangKeywordCell() {
      return this.getWord(0)
    }
    get hashBangCell() {
      return this.getWordsFrom(1)
    }
  }

  class errorParser extends GrammarBackedNode {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  window.fireParser = fireParser
}
