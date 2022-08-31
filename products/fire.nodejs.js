#! /usr/bin/env node
{
  const { jtree } = require("../index.js")

  class fireNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        errorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          block: blockNode,
          function: functionNode,
          if: ifNode,
          while: whileNode,
          divide: divideNode,
          modulo: moduloNode,
          multiply: multiplyNode,
          substract: substractNode,
          add: addNode,
          greaterThan: greaterThanNode,
          greaterThanOrEqual: greaterThanOrEqualNode,
          lessThan: lessThanNode,
          lessThanOrEqual: lessThanOrEqualNode,
          sum: sumNode,
          boolean: booleanNode,
          callFunctionAndSet: callFunctionAndSetNode,
          callMethodAndSet: callMethodAndSetNode,
          join: joinNode,
          mutableNumber: mutableNumberNode,
          number: numberNode,
          numbers: numbersNode,
          string: stringNode,
          callFunction: callFunctionNode,
          decrement: decrementNode,
          dumpIdentifier: dumpIdentifierNode,
          export: exportNode,
          increment: incrementNode,
          printNumber: printNumberNode,
          printString: printStringNode,
          require: requireNode,
          return: returnNode,
          "#!": hashbangNode
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
    static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(`tooling onsave jtree build produceLang fire
todo Explore best ways to add polymorphism
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
fireNode
 root
 description A useless prefix Tree Language that compiles to Javascript for testing Tree Notation features.
 compilesTo js
 inScope hashbangNode abstractTerminalNode abstractNonTerminalNode
 catchAllNodeType errorNode
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
abstractNonTerminalNode
 inScope abstractTerminalNode abstractNonTerminalNode
 cells keywordCell
abstractJsblockNode
 compiler
  openChildren  {
  closeChildren }
 extends abstractNonTerminalNode
blockNode
 description block of code
 frequency .2
 compiler
  stringTemplate /* {identifierCell} */
 extends abstractJsblockNode
 crux block
functionNode
 crux function
 description Function Assignment
 cells keywordCell functionIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {functionIdentifierCell} = ({anyCell}) =>
  catchAllCellDelimiter , 
 frequency .1
 extends abstractJsblockNode
ifNode
 crux if
 description If tile
 cells keywordCell identifierCell
 frequency .2
 compiler
  stringTemplate if ({identifierCell})
 extends abstractJsblockNode
whileNode
 crux while
 description While tile
 cells keywordCell identifierCell
 frequency .1
 compiler
  stringTemplate while ({identifierCell})
 extends abstractJsblockNode
abstractTerminalNode
 cells keywordCell
abstractAssignmentNode
 extends abstractTerminalNode
abstractArithmeticNode
 cells keywordCell identifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {identifierCell} = {anyCell}
 frequency .2
 extends abstractAssignmentNode
divideNode
 description Divide Numbers
 compiler
  catchAllCellDelimiter  / 
 extends abstractArithmeticNode
 crux divide
moduloNode
 description Modulo Numbers
 compiler
  catchAllCellDelimiter %
 extends abstractArithmeticNode
 crux modulo
multiplyNode
 description Multiply Numbers
 compiler
  catchAllCellDelimiter  * 
 extends abstractArithmeticNode
 crux multiply
substractNode
 description Subtract Numbers
 compiler
  catchAllCellDelimiter  - 
 extends abstractArithmeticNode
 crux substract
addNode
 crux add
 example
  add ten 2 3 5
 description Add numbers and store result
 compiler
  catchAllCellDelimiter  + 
 extends abstractArithmeticNode
abstractBooleanOperatorNode
 description Runs a boolean test and saves result.
 extends abstractAssignmentNode
greaterThanNode
 description Greater than test
 cells keywordCell identifierCell leftNumberCell numberCell
 compiler
  stringTemplate const {identifierCell} = {leftNumberCell} > {numberCell}
 frequency .1
 extends abstractBooleanOperatorNode
 crux greaterThan
greaterThanOrEqualNode
 description Greater than or equal to test
 cells keywordCell identifierCell leftNumberCell numberCell
 compiler
  stringTemplate const {identifierCell} = {leftNumberCell} >= {numberCell}
 frequency .1
 extends abstractBooleanOperatorNode
 crux greaterThanOrEqual
lessThanNode
 description Less than test
 cells keywordCell identifierCell leftAnyCell anyCell
 compiler
  stringTemplate const {identifierCell} = {leftAnyCell} < {anyCell}
 frequency .1
 extends abstractBooleanOperatorNode
 crux lessThan
lessThanOrEqualNode
 crux lessThanOrEqual
 description Less than or equal to test
 cells keywordCell identifierCell leftAnyCell anyCell
 compiler
  stringTemplate const {identifierCell} = {leftAnyCell} <= {anyCell}
 frequency .1
 extends abstractBooleanOperatorNode
sumNode
 crux sum
 description Add numbers and store result
 cells keywordCell numberIdentifierCell
 catchAllCellType numberCell
 compiler
  stringTemplate const {numberIdentifierCell} = [{numberCell}].reduce((sum, num) => sum + num)
  catchAllCellDelimiter , 
 frequency .1
 extends abstractAssignmentNode
booleanNode
 crux boolean
 description Boolean Assignment
 cells keywordCell booleanIdentifierCell booleanCell
 compiler
  stringTemplate const {booleanIdentifierCell} = {booleanCell}
 extends abstractAssignmentNode
callFunctionAndSetNode
 crux callFunctionAndSet
 description Function Call
 frequency .5
 cells keywordCell resultIdentifierCell functionIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {resultIdentifierCell} = {functionIdentifierCell}({anyCell})
  catchAllCellDelimiter , 
 extends abstractAssignmentNode
callMethodAndSetNode
 crux callMethodAndSet
 description Method Call
 frequency .5
 cells keywordCell resultIdentifierCell instanceIdentifierCell methodIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {resultIdentifierCell} = {instanceIdentifierCell}.{methodIdentifierCell}({anyCell})
  catchAllCellDelimiter , 
 extends abstractAssignmentNode
joinNode
 crux join
 description Join strings to form new string
 cells keywordCell identifierCell
 catchAllCellType identifiersCell
 compiler
  stringTemplate const {identifierCell} = [{identifiersCell}].join("")
  catchAllCellDelimiter , 
 frequency .2
 extends abstractAssignmentNode
mutableNumberNode
 crux mutableNumber
 description Mutable Number Assignment
 cells keywordCell identifierCell numberCell
 compiler
  stringTemplate let {identifierCell} = {numberCell}
 extends abstractAssignmentNode
numberNode
 crux number
 description Number Assignment
 cells keywordCell identifierCell numberCell
 compiler
  stringTemplate const {identifierCell} = {numberCell}
 frequency .3
 extends abstractAssignmentNode
numbersNode
 crux numbers
 description Number Array Assignment
 cells keywordCell identifierCell
 catchAllCellType numberCell
 frequency .4
 compiler
  stringTemplate const {identifierCell} = [{numberCell}]
  catchAllCellDelimiter , 
 extends abstractAssignmentNode
stringNode
 crux string
 description String Assignment
 cells keywordCell stringIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {stringIdentifierCell} = "{anyCell}"
 frequency .2
 extends abstractAssignmentNode
callFunctionNode
 crux callFunction
 description Function call ignore result.
 frequency .1
 cells keywordCell functionIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate {functionIdentifierCell}({anyCell})
  catchAllCellDelimiter , 
 extends abstractTerminalNode
decrementNode
 crux decrement
 description Decrement
 cells keywordCell numberIdentifierCell
 compiler
  stringTemplate {numberIdentifierCell}--
 frequency .1
 extends abstractTerminalNode
dumpIdentifierNode
 crux dumpIdentifier
 description Dump variable(s) to console
 catchAllCellType identifierCell
 compiler
  stringTemplate console.log({identifierCell})
  catchAllCellDelimiter , 
 frequency .5
 extends abstractTerminalNode
exportNode
 crux export
 description Export This
 cells keywordCell identifierCell
 compiler
  stringTemplate module.exports = {identifierCell}
 frequency .1
 extends abstractTerminalNode
incrementNode
 crux increment
 description Increment
 frequency .3
 cells keywordCell numberIdentifierCell
 compiler
  stringTemplate {numberIdentifierCell}++
 extends abstractTerminalNode
printNumberNode
 crux printNumber
 extends abstractTerminalNode
 catchAllCellType numberIdentifierCell
 compiler
  stringTemplate console.log({numberIdentifierCell})
printStringNode
 crux printString
 todo Allow printing of multiline strings
 extends abstractTerminalNode
 catchAllCellType stringCellsCell
 compiler
  stringTemplate console.log("{stringCells}")
requireNode
 crux require
 description Require Something
 cells keywordCell identifierCell filepathCell
 compiler
  stringTemplate const {identifierCell} = require("{filepathCell}")
 frequency .1
 extends abstractTerminalNode
returnNode
 crux return
 cells keywordCell anyCell
 compiler
  stringTemplate return {anyCell}
 frequency .1
 extends abstractTerminalNode
hashbangNode
 crux #!
 description Standard bash hashbang line.
 catchAllCellType hashBangCell
 compiler
  stringTemplate // #! {hashBangCell}
 cells hashBangKeywordCell
errorNode
 baseNodeType errorNode
 compiler
  stringTemplate // error`)
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        fireNode: fireNode,
        abstractNonTerminalNode: abstractNonTerminalNode,
        abstractJsblockNode: abstractJsblockNode,
        blockNode: blockNode,
        functionNode: functionNode,
        ifNode: ifNode,
        whileNode: whileNode,
        abstractTerminalNode: abstractTerminalNode,
        abstractAssignmentNode: abstractAssignmentNode,
        abstractArithmeticNode: abstractArithmeticNode,
        divideNode: divideNode,
        moduloNode: moduloNode,
        multiplyNode: multiplyNode,
        substractNode: substractNode,
        addNode: addNode,
        abstractBooleanOperatorNode: abstractBooleanOperatorNode,
        greaterThanNode: greaterThanNode,
        greaterThanOrEqualNode: greaterThanOrEqualNode,
        lessThanNode: lessThanNode,
        lessThanOrEqualNode: lessThanOrEqualNode,
        sumNode: sumNode,
        booleanNode: booleanNode,
        callFunctionAndSetNode: callFunctionAndSetNode,
        callMethodAndSetNode: callMethodAndSetNode,
        joinNode: joinNode,
        mutableNumberNode: mutableNumberNode,
        numberNode: numberNode,
        numbersNode: numbersNode,
        stringNode: stringNode,
        callFunctionNode: callFunctionNode,
        decrementNode: decrementNode,
        dumpIdentifierNode: dumpIdentifierNode,
        exportNode: exportNode,
        incrementNode: incrementNode,
        printNumberNode: printNumberNode,
        printStringNode: printStringNode,
        requireNode: requireNode,
        returnNode: returnNode,
        hashbangNode: hashbangNode,
        errorNode: errorNode
      }
    }
  }

  class abstractNonTerminalNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          block: blockNode,
          function: functionNode,
          if: ifNode,
          while: whileNode,
          divide: divideNode,
          modulo: moduloNode,
          multiply: multiplyNode,
          substract: substractNode,
          add: addNode,
          greaterThan: greaterThanNode,
          greaterThanOrEqual: greaterThanOrEqualNode,
          lessThan: lessThanNode,
          lessThanOrEqual: lessThanOrEqualNode,
          sum: sumNode,
          boolean: booleanNode,
          callFunctionAndSet: callFunctionAndSetNode,
          callMethodAndSet: callMethodAndSetNode,
          join: joinNode,
          mutableNumber: mutableNumberNode,
          number: numberNode,
          numbers: numbersNode,
          string: stringNode,
          callFunction: callFunctionNode,
          decrement: decrementNode,
          dumpIdentifier: dumpIdentifierNode,
          export: exportNode,
          increment: incrementNode,
          printNumber: printNumberNode,
          printString: printStringNode,
          require: requireNode,
          return: returnNode
        }),
        undefined
      )
    }
    get keywordCell() {
      return this.getWord(0)
    }
  }

  class abstractJsblockNode extends abstractNonTerminalNode {}

  class blockNode extends abstractJsblockNode {}

  class functionNode extends abstractJsblockNode {
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

  class ifNode extends abstractJsblockNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
  }

  class whileNode extends abstractJsblockNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
  }

  class abstractTerminalNode extends jtree.GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
  }

  class abstractAssignmentNode extends abstractTerminalNode {}

  class abstractArithmeticNode extends abstractAssignmentNode {
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

  class divideNode extends abstractArithmeticNode {}

  class moduloNode extends abstractArithmeticNode {}

  class multiplyNode extends abstractArithmeticNode {}

  class substractNode extends abstractArithmeticNode {}

  class addNode extends abstractArithmeticNode {}

  class abstractBooleanOperatorNode extends abstractAssignmentNode {}

  class greaterThanNode extends abstractBooleanOperatorNode {
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

  class greaterThanOrEqualNode extends abstractBooleanOperatorNode {
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

  class lessThanNode extends abstractBooleanOperatorNode {
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

  class lessThanOrEqualNode extends abstractBooleanOperatorNode {
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

  class sumNode extends abstractAssignmentNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get numberIdentifierCell() {
      return this.getWord(1)
    }
    get numberCell() {
      return this.getWordsFrom(2).map(val => parseFloat(val))
    }
  }

  class booleanNode extends abstractAssignmentNode {
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

  class callFunctionAndSetNode extends abstractAssignmentNode {
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

  class callMethodAndSetNode extends abstractAssignmentNode {
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

  class joinNode extends abstractAssignmentNode {
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

  class mutableNumberNode extends abstractAssignmentNode {
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

  class numberNode extends abstractAssignmentNode {
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

  class numbersNode extends abstractAssignmentNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
    get numberCell() {
      return this.getWordsFrom(2).map(val => parseFloat(val))
    }
  }

  class stringNode extends abstractAssignmentNode {
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

  class callFunctionNode extends abstractTerminalNode {
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

  class decrementNode extends abstractTerminalNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get numberIdentifierCell() {
      return this.getWord(1)
    }
  }

  class dumpIdentifierNode extends abstractTerminalNode {
    get identifierCell() {
      return this.getWordsFrom(0)
    }
  }

  class exportNode extends abstractTerminalNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get identifierCell() {
      return this.getWord(1)
    }
  }

  class incrementNode extends abstractTerminalNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get numberIdentifierCell() {
      return this.getWord(1)
    }
  }

  class printNumberNode extends abstractTerminalNode {
    get numberIdentifierCell() {
      return this.getWordsFrom(0)
    }
  }

  class printStringNode extends abstractTerminalNode {
    get stringCellsCell() {
      return this.getWordsFrom(0)
    }
  }

  class requireNode extends abstractTerminalNode {
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

  class returnNode extends abstractTerminalNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get anyCell() {
      return this.getWord(1)
    }
  }

  class hashbangNode extends jtree.GrammarBackedNode {
    get hashBangKeywordCell() {
      return this.getWord(0)
    }
    get hashBangCell() {
      return this.getWordsFrom(1)
    }
  }

  class errorNode extends jtree.GrammarBackedNode {
    getErrors() {
      return this._getErrorNodeErrors()
    }
  }

  module.exports = fireNode
  fireNode

  if (!module.parent) new fireNode(jtree.TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
