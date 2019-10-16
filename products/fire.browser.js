{
  class fireNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        errorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMap()), {
          "#!": hashbangNode,
          divide: divideNode,
          modulo: moduloNode,
          multiply: multiplyNode,
          substract: substractNode,
          add: addNode,
          sum: sumNode,
          boolean: booleanNode,
          callFunctionAndSet: callFunctionAndSetNode,
          callMethodAndSet: callMethodAndSetNode,
          join: joinNode,
          mutableNumber: mutableNumberNode,
          number: numberNode,
          numbers: numbersNode,
          string: stringNode,
          greaterThan: greaterThanNode,
          greaterThanOrEqual: greaterThanOrEqualNode,
          lessThan: lessThanNode,
          lessThanOrEqual: lessThanOrEqualNode,
          block: blockNode,
          function: functionNode,
          if: ifNode,
          while: whileNode,
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
    async execute() {
      return this.executeSync()
    }
    executeSync() {
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
    getGrammarProgram() {
      if (!this._cachedGrammarProgramRoot)
        this._cachedGrammarProgramRoot = new jtree.GrammarProgram(`todo Explore best ways to add polymorphism
fireNode
 root
 description A useless prefix Tree Language that compiles to Javascript for testing Tree Notation features.
 compilesTo js
 inScope hashbangNode abstractTerminalNode abstractNonTerminalNode
 catchAllNodeType errorNode
 javascript
  async execute() { return this.executeSync() }
  executeSync() {
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
anyCell
booleanCell
 regex (false|true)
filepathCell
identifierCell
 regex [$A-Za-z_][0-9a-zA-Z_$]*
 highlightScope variable
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
abstractNonTerminalNode
 inScope abstractTerminalNode abstractNonTerminalNode
 abstract
 cells keywordCell
abstractTerminalNode
 abstract
 cells keywordCell
abstractAssignmentNode
 extends abstractTerminalNode
 abstract
abstractArithmeticNode
 cells keywordCell identifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {identifierCell} = {anyCell}
 frequency .2
 extends abstractAssignmentNode
 abstract
abstractJsblockNode
 compiler
  openChildren  {
  closeChildren }
 extends abstractNonTerminalNode
 abstract
abstractBooleanOperatorNode
 description Runs a boolean test and saves result.
 extends abstractAssignmentNode
 abstract
hashbangNode
 match #!
 description Standard bash hashbang line.
 catchAllCellType hashBangCell
 compiler
  stringTemplate // #! {hashBangCell}
 cells hashBangKeywordCell
errorNode
 baseNodeType errorNode
 compiler
  stringTemplate // error
divideNode
 description Divide Numbers
 compiler
  catchAllCellDelimiter  / 
 extends abstractArithmeticNode
moduloNode
 description Modulo Numbers
 compiler
  catchAllCellDelimiter %
 extends abstractArithmeticNode
multiplyNode
 description Multiply Numbers
 compiler
  catchAllCellDelimiter  * 
 extends abstractArithmeticNode
substractNode
 description Subtract Numbers
 compiler
  catchAllCellDelimiter  - 
 extends abstractArithmeticNode
addNode
 description Add numbers and store result
 compiler
  catchAllCellDelimiter  + 
 extends abstractArithmeticNode
sumNode
 description Add numbers and store result
 cells keywordCell numberIdentifierCell
 catchAllCellType numberCell
 compiler
  stringTemplate const {numberIdentifierCell} = [{numberCell}].reduce((sum, num) => sum + num)
  catchAllCellDelimiter , 
 frequency .1
 extends abstractAssignmentNode
booleanNode
 description Boolean Assignment
 cells keywordCell booleanIdentifierCell booleanCell
 compiler
  stringTemplate const {booleanIdentifierCell} = {booleanCell}
 extends abstractAssignmentNode
callFunctionAndSetNode
 description Function Call
 frequency .5
 cells keywordCell resultIdentifierCell functionIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {resultIdentifierCell} = {functionIdentifierCell}({anyCell})
  catchAllCellDelimiter , 
 extends abstractAssignmentNode
callMethodAndSetNode
 description Method Call
 frequency .5
 cells keywordCell resultIdentifierCell instanceIdentifierCell methodIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {resultIdentifierCell} = {instanceIdentifierCell}.{methodIdentifierCell}({anyCell})
  catchAllCellDelimiter , 
 extends abstractAssignmentNode
joinNode
 description Join strings to form new string
 cells keywordCell identifierCell
 catchAllCellType identifiersCell
 compiler
  stringTemplate const {identifierCell} = [{identifiersCell}].join("")
  catchAllCellDelimiter , 
 frequency .2
 extends abstractAssignmentNode
mutableNumberNode
 description Mutable Number Assignment
 cells keywordCell identifierCell numberCell
 compiler
  stringTemplate let {identifierCell} = {numberCell}
 extends abstractAssignmentNode
numberNode
 description Number Assignment
 cells keywordCell identifierCell numberCell
 compiler
  stringTemplate const {identifierCell} = {numberCell}
 frequency .3
 extends abstractAssignmentNode
numbersNode
 description Number Array Assignment
 cells keywordCell identifierCell
 catchAllCellType numberCell
 frequency .4
 compiler
  stringTemplate const {identifierCell} = [{numberCell}]
  catchAllCellDelimiter , 
 extends abstractAssignmentNode
stringNode
 description String Assignment
 cells keywordCell stringIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {stringIdentifierCell} = "{anyCell}"
 frequency .2
 extends abstractAssignmentNode
leftNumberCell
 extends numberCell
leftAnyCell
 extends anyCell
greaterThanNode
 description Greater than test
 cells keywordCell identifierCell leftNumberCell numberCell
 compiler
  stringTemplate const {identifierCell} = {leftNumberCell} > {numberCell}
 frequency .1
 extends abstractBooleanOperatorNode
greaterThanOrEqualNode
 description Greater than or equal to test
 cells keywordCell identifierCell leftNumberCell numberCell
 compiler
  stringTemplate const {identifierCell} = {leftNumberCell} >= {numberCell}
 frequency .1
 extends abstractBooleanOperatorNode
lessThanNode
 description Less than test
 cells keywordCell identifierCell leftAnyCell anyCell
 compiler
  stringTemplate const {identifierCell} = {leftAnyCell} < {anyCell}
 frequency .1
 extends abstractBooleanOperatorNode
lessThanOrEqualNode
 description Less than or equal to test
 cells keywordCell identifierCell leftAnyCell anyCell
 compiler
  stringTemplate const {identifierCell} = {leftAnyCell} <= {anyCell}
 frequency .1
 extends abstractBooleanOperatorNode
blockNode
 description block of code
 frequency .2
 compiler
  stringTemplate /* {identifierCell} */
 extends abstractJsblockNode
functionNode
 match function
 description Function Assignment
 cells keywordCell functionIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate const {functionIdentifierCell} = ({anyCell}) =>
  catchAllCellDelimiter , 
 frequency .1
 extends abstractJsblockNode
ifNode
 match if
 description If tile
 cells keywordCell identifierCell
 frequency .2
 compiler
  stringTemplate if ({identifierCell})
 extends abstractJsblockNode
whileNode
 match while
 description While tile
 cells keywordCell identifierCell
 frequency .1
 compiler
  stringTemplate while ({identifierCell})
 extends abstractJsblockNode
callFunctionNode
 description Function call ignore result.
 frequency .1
 cells keywordCell functionIdentifierCell
 catchAllCellType anyCell
 compiler
  stringTemplate {functionIdentifierCell}({anyCell})
  catchAllCellDelimiter , 
 extends abstractTerminalNode
decrementNode
 description Decrement
 cells keywordCell numberIdentifierCell
 compiler
  stringTemplate {numberIdentifierCell}--
 frequency .1
 extends abstractTerminalNode
dumpIdentifierNode
 description Dump variable(s) to console
 catchAllCellType identifierCell
 compiler
  stringTemplate console.log({identifierCell})
  catchAllCellDelimiter , 
 frequency .5
 extends abstractTerminalNode
exportNode
 match export
 description Export This
 cells keywordCell identifierCell
 compiler
  stringTemplate module.exports = {identifierCell}
 frequency .1
 extends abstractTerminalNode
incrementNode
 description Increment
 frequency .3
 cells keywordCell numberIdentifierCell
 compiler
  stringTemplate {numberIdentifierCell}++
 extends abstractTerminalNode
printNumberNode
 extends abstractTerminalNode
 catchAllCellType numberIdentifierCell
 compiler
  stringTemplate console.log({numberIdentifierCell})
printStringNode
 todo Allow printing of multiline strings
 extends abstractTerminalNode
 catchAllCellType stringCellsCell
 compiler
  stringTemplate console.log("{stringCells}")
requireNode
 match require
 description Require Something
 cells keywordCell identifierCell filepathCell
 compiler
  stringTemplate const {identifierCell} = require("{filepathCell}")
 frequency .1
 extends abstractTerminalNode
returnNode
 match return
 cells keywordCell anyCell
 compiler
  stringTemplate return {anyCell}
 frequency .1
 extends abstractTerminalNode`)
      return this._cachedGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        fireNode: fireNode,
        abstractNonTerminalNode: abstractNonTerminalNode,
        abstractTerminalNode: abstractTerminalNode,
        abstractAssignmentNode: abstractAssignmentNode,
        abstractArithmeticNode: abstractArithmeticNode,
        abstractJsblockNode: abstractJsblockNode,
        abstractBooleanOperatorNode: abstractBooleanOperatorNode,
        hashbangNode: hashbangNode,
        errorNode: errorNode,
        divideNode: divideNode,
        moduloNode: moduloNode,
        multiplyNode: multiplyNode,
        substractNode: substractNode,
        addNode: addNode,
        sumNode: sumNode,
        booleanNode: booleanNode,
        callFunctionAndSetNode: callFunctionAndSetNode,
        callMethodAndSetNode: callMethodAndSetNode,
        joinNode: joinNode,
        mutableNumberNode: mutableNumberNode,
        numberNode: numberNode,
        numbersNode: numbersNode,
        stringNode: stringNode,
        greaterThanNode: greaterThanNode,
        greaterThanOrEqualNode: greaterThanOrEqualNode,
        lessThanNode: lessThanNode,
        lessThanOrEqualNode: lessThanOrEqualNode,
        blockNode: blockNode,
        functionNode: functionNode,
        ifNode: ifNode,
        whileNode: whileNode,
        callFunctionNode: callFunctionNode,
        decrementNode: decrementNode,
        dumpIdentifierNode: dumpIdentifierNode,
        exportNode: exportNode,
        incrementNode: incrementNode,
        printNumberNode: printNumberNode,
        printStringNode: printStringNode,
        requireNode: requireNode,
        returnNode: returnNode
      }
    }
  }

  class abstractNonTerminalNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMap()), {
          divide: divideNode,
          modulo: moduloNode,
          multiply: multiplyNode,
          substract: substractNode,
          add: addNode,
          sum: sumNode,
          boolean: booleanNode,
          callFunctionAndSet: callFunctionAndSetNode,
          callMethodAndSet: callMethodAndSetNode,
          join: joinNode,
          mutableNumber: mutableNumberNode,
          number: numberNode,
          numbers: numbersNode,
          string: stringNode,
          greaterThan: greaterThanNode,
          greaterThanOrEqual: greaterThanOrEqualNode,
          lessThan: lessThanNode,
          lessThanOrEqual: lessThanOrEqualNode,
          block: blockNode,
          function: functionNode,
          if: ifNode,
          while: whileNode,
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

  class abstractJsblockNode extends abstractNonTerminalNode {}

  class abstractBooleanOperatorNode extends abstractAssignmentNode {}

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

  class divideNode extends abstractArithmeticNode {}

  class moduloNode extends abstractArithmeticNode {}

  class multiplyNode extends abstractArithmeticNode {}

  class substractNode extends abstractArithmeticNode {}

  class addNode extends abstractArithmeticNode {}

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

  window.fireNode = fireNode
}
