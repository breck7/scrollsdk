#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { Particle } = require("./Particle.js")
  const { HandParsersProgram } = require("./Parsers.js")
  const { ParserBackedParticle } = require("./Parsers.js")

  class fireParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        errorParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstAtomMapAsObject()), {
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
          "#!": hashbangParser
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
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// todo Explore best ways to add polymorphism

// Atom Parsers
anyAtom
booleanAtom
 enum false true
filepathAtom
identifierAtom
 regex [$A-Za-z_][0-9a-zA-Z_$]*
 paint variable
 examples myVarA someVarB
numberAtom
 regex \\-?[0-9]*\\.?[0-9]*
 paint constant.numeric
numberIdentifierAtom
 extends identifierAtom
hashBangAtom
 paint comment
hashBangKeywordAtom
 paint comment
stringAtom
 paint string
booleanIdentifierAtom
 extends identifierAtom
functionIdentifierAtom
 extends identifierAtom
identifiersAtom
 extends identifierAtom
instanceIdentifierAtom
 extends identifierAtom
methodIdentifierAtom
 extends identifierAtom
resultIdentifierAtom
 extends identifierAtom
keywordAtom
 paint keyword
stringIdentifierAtom
 extends identifierAtom
stringAtomsAtom
 extends stringAtom
leftNumberAtom
 extends numberAtom
leftAnyAtom
 extends anyAtom

// Line Parsers
fireParser
 root
 description A useless prefix Language that compiles to Javascript for testing Particles features.
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
 atoms keywordAtom
abstractJsblockParser
 compiler
  openSubparticles  {
  closeSubparticles }
 extends abstractNonTerminalParser
blockParser
 description block of code
 popularity .2
 compiler
  stringTemplate /* {identifierAtom} */
 extends abstractJsblockParser
 cue block
functionParser
 cue function
 description Function Assignment
 atoms keywordAtom functionIdentifierAtom
 catchAllAtomType anyAtom
 compiler
  stringTemplate const {functionIdentifierAtom} = ({anyAtom}) =>
  catchAllAtomDelimiter , 
 popularity .1
 extends abstractJsblockParser
ifParser
 cue if
 description If tile
 atoms keywordAtom identifierAtom
 popularity .2
 compiler
  stringTemplate if ({identifierAtom})
 extends abstractJsblockParser
whileParser
 cue while
 description While tile
 atoms keywordAtom identifierAtom
 popularity .1
 compiler
  stringTemplate while ({identifierAtom})
 extends abstractJsblockParser
abstractTerminalParser
 atoms keywordAtom
abstractAssignmentParser
 extends abstractTerminalParser
abstractArithmeticParser
 atoms keywordAtom identifierAtom
 catchAllAtomType anyAtom
 compiler
  stringTemplate const {identifierAtom} = {anyAtom}
 popularity .2
 extends abstractAssignmentParser
divideParser
 description Divide Numbers
 compiler
  catchAllAtomDelimiter  / 
 extends abstractArithmeticParser
 cue divide
moduloParser
 description Modulo Numbers
 compiler
  catchAllAtomDelimiter %
 extends abstractArithmeticParser
 cue modulo
multiplyParser
 description Multiply Numbers
 compiler
  catchAllAtomDelimiter  * 
 extends abstractArithmeticParser
 cue multiply
substractParser
 description Subtract Numbers
 compiler
  catchAllAtomDelimiter  - 
 extends abstractArithmeticParser
 cue substract
addParser
 cue add
 example
  add ten 2 3 5
 description Add numbers and store result
 compiler
  catchAllAtomDelimiter  + 
 extends abstractArithmeticParser
abstractBooleanOperatorParser
 description Runs a boolean test and saves result.
 extends abstractAssignmentParser
greaterThanParser
 description Greater than test
 atoms keywordAtom identifierAtom leftNumberAtom numberAtom
 compiler
  stringTemplate const {identifierAtom} = {leftNumberAtom} > {numberAtom}
 popularity .1
 extends abstractBooleanOperatorParser
 cue greaterThan
greaterThanOrEqualParser
 description Greater than or equal to test
 atoms keywordAtom identifierAtom leftNumberAtom numberAtom
 compiler
  stringTemplate const {identifierAtom} = {leftNumberAtom} >= {numberAtom}
 popularity .1
 extends abstractBooleanOperatorParser
 cue greaterThanOrEqual
lessThanParser
 description Less than test
 atoms keywordAtom identifierAtom leftAnyAtom anyAtom
 compiler
  stringTemplate const {identifierAtom} = {leftAnyAtom} < {anyAtom}
 popularity .1
 extends abstractBooleanOperatorParser
 cue lessThan
lessThanOrEqualParser
 cue lessThanOrEqual
 description Less than or equal to test
 atoms keywordAtom identifierAtom leftAnyAtom anyAtom
 compiler
  stringTemplate const {identifierAtom} = {leftAnyAtom} <= {anyAtom}
 popularity .1
 extends abstractBooleanOperatorParser
sumParser
 cue sum
 description Add numbers and store result
 atoms keywordAtom numberIdentifierAtom
 catchAllAtomType numberAtom
 compiler
  stringTemplate const {numberIdentifierAtom} = [{numberAtom}].reduce((sum, num) => sum + num)
  catchAllAtomDelimiter , 
 popularity .1
 extends abstractAssignmentParser
booleanParser
 cue boolean
 description Boolean Assignment
 atoms keywordAtom booleanIdentifierAtom booleanAtom
 compiler
  stringTemplate const {booleanIdentifierAtom} = {booleanAtom}
 extends abstractAssignmentParser
callFunctionAndSetParser
 cue callFunctionAndSet
 description Function Call
 popularity .5
 atoms keywordAtom resultIdentifierAtom functionIdentifierAtom
 catchAllAtomType anyAtom
 compiler
  stringTemplate const {resultIdentifierAtom} = {functionIdentifierAtom}({anyAtom})
  catchAllAtomDelimiter , 
 extends abstractAssignmentParser
callMethodAndSetParser
 cue callMethodAndSet
 description Method Call
 popularity .5
 atoms keywordAtom resultIdentifierAtom instanceIdentifierAtom methodIdentifierAtom
 catchAllAtomType anyAtom
 compiler
  stringTemplate const {resultIdentifierAtom} = {instanceIdentifierAtom}.{methodIdentifierAtom}({anyAtom})
  catchAllAtomDelimiter , 
 extends abstractAssignmentParser
joinParser
 cue join
 description Join strings to form new string
 atoms keywordAtom identifierAtom
 catchAllAtomType identifiersAtom
 compiler
  stringTemplate const {identifierAtom} = [{identifiersAtom}].join("")
  catchAllAtomDelimiter , 
 popularity .2
 extends abstractAssignmentParser
mutableNumberParser
 cue mutableNumber
 description Mutable Number Assignment
 atoms keywordAtom identifierAtom numberAtom
 compiler
  stringTemplate let {identifierAtom} = {numberAtom}
 extends abstractAssignmentParser
numberParser
 cue number
 description Number Assignment
 atoms keywordAtom identifierAtom numberAtom
 compiler
  stringTemplate const {identifierAtom} = {numberAtom}
 popularity .3
 extends abstractAssignmentParser
numbersParser
 cue numbers
 description Number Array Assignment
 atoms keywordAtom identifierAtom
 catchAllAtomType numberAtom
 popularity .4
 compiler
  stringTemplate const {identifierAtom} = [{numberAtom}]
  catchAllAtomDelimiter , 
 extends abstractAssignmentParser
stringParser
 cue string
 description String Assignment
 atoms keywordAtom stringIdentifierAtom
 catchAllAtomType anyAtom
 compiler
  stringTemplate const {stringIdentifierAtom} = "{anyAtom}"
 popularity .2
 extends abstractAssignmentParser
callFunctionParser
 cue callFunction
 description Function call ignore result.
 popularity .1
 atoms keywordAtom functionIdentifierAtom
 catchAllAtomType anyAtom
 compiler
  stringTemplate {functionIdentifierAtom}({anyAtom})
  catchAllAtomDelimiter , 
 extends abstractTerminalParser
decrementParser
 cue decrement
 description Decrement
 atoms keywordAtom numberIdentifierAtom
 compiler
  stringTemplate {numberIdentifierAtom}--
 popularity .1
 extends abstractTerminalParser
dumpIdentifierParser
 cue dumpIdentifier
 description Dump variable(s) to console
 catchAllAtomType identifierAtom
 compiler
  stringTemplate console.log({identifierAtom})
  catchAllAtomDelimiter , 
 popularity .5
 extends abstractTerminalParser
exportParser
 cue export
 description Export This
 atoms keywordAtom identifierAtom
 compiler
  stringTemplate module.exports = {identifierAtom}
 popularity .1
 extends abstractTerminalParser
incrementParser
 cue increment
 description Increment
 popularity .3
 atoms keywordAtom numberIdentifierAtom
 compiler
  stringTemplate {numberIdentifierAtom}++
 extends abstractTerminalParser
printNumberParser
 cue printNumber
 extends abstractTerminalParser
 catchAllAtomType numberIdentifierAtom
 compiler
  stringTemplate console.log({numberIdentifierAtom})
printStringParser
 cue printString
 // todo Allow printing of multiline strings
 extends abstractTerminalParser
 catchAllAtomType stringAtomsAtom
 compiler
  stringTemplate console.log("{stringAtoms}")
requireParser
 cue require
 description Require Something
 atoms keywordAtom identifierAtom filepathAtom
 compiler
  stringTemplate const {identifierAtom} = require("{filepathAtom}")
 popularity .1
 extends abstractTerminalParser
returnParser
 cue return
 atoms keywordAtom anyAtom
 compiler
  stringTemplate return {anyAtom}
 popularity .1
 extends abstractTerminalParser
hashbangParser
 cue #!
 description Standard bash hashbang line.
 catchAllAtomType hashBangAtom
 compiler
  stringTemplate // #! {hashBangAtom}
 atoms hashBangKeywordAtom
errorParser
 baseParser errorParser
 compiler
  stringTemplate // error`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = fireParser
  }

  class abstractNonTerminalParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstAtomMapAsObject()), {
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
          return: returnParser
        }),
        undefined
      )
    }
    get keywordAtom() {
      return this.getAtom(0)
    }
  }

  class abstractJsblockParser extends abstractNonTerminalParser {}

  class blockParser extends abstractJsblockParser {}

  class functionParser extends abstractJsblockParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get functionIdentifierAtom() {
      return this.getAtom(1)
    }
    get anyAtom() {
      return this.getAtomsFrom(2)
    }
  }

  class ifParser extends abstractJsblockParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
  }

  class whileParser extends abstractJsblockParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
  }

  class abstractTerminalParser extends ParserBackedParticle {
    get keywordAtom() {
      return this.getAtom(0)
    }
  }

  class abstractAssignmentParser extends abstractTerminalParser {}

  class abstractArithmeticParser extends abstractAssignmentParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
    get anyAtom() {
      return this.getAtomsFrom(2)
    }
  }

  class divideParser extends abstractArithmeticParser {}

  class moduloParser extends abstractArithmeticParser {}

  class multiplyParser extends abstractArithmeticParser {}

  class substractParser extends abstractArithmeticParser {}

  class addParser extends abstractArithmeticParser {}

  class abstractBooleanOperatorParser extends abstractAssignmentParser {}

  class greaterThanParser extends abstractBooleanOperatorParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
    get leftNumberAtom() {
      return parseFloat(this.getAtom(2))
    }
    get numberAtom() {
      return parseFloat(this.getAtom(3))
    }
  }

  class greaterThanOrEqualParser extends abstractBooleanOperatorParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
    get leftNumberAtom() {
      return parseFloat(this.getAtom(2))
    }
    get numberAtom() {
      return parseFloat(this.getAtom(3))
    }
  }

  class lessThanParser extends abstractBooleanOperatorParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
    get leftAnyAtom() {
      return this.getAtom(2)
    }
    get anyAtom() {
      return this.getAtom(3)
    }
  }

  class lessThanOrEqualParser extends abstractBooleanOperatorParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
    get leftAnyAtom() {
      return this.getAtom(2)
    }
    get anyAtom() {
      return this.getAtom(3)
    }
  }

  class sumParser extends abstractAssignmentParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get numberIdentifierAtom() {
      return this.getAtom(1)
    }
    get numberAtom() {
      return this.getAtomsFrom(2).map(val => parseFloat(val))
    }
  }

  class booleanParser extends abstractAssignmentParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get booleanIdentifierAtom() {
      return this.getAtom(1)
    }
    get booleanAtom() {
      return this.getAtom(2)
    }
  }

  class callFunctionAndSetParser extends abstractAssignmentParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get resultIdentifierAtom() {
      return this.getAtom(1)
    }
    get functionIdentifierAtom() {
      return this.getAtom(2)
    }
    get anyAtom() {
      return this.getAtomsFrom(3)
    }
  }

  class callMethodAndSetParser extends abstractAssignmentParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get resultIdentifierAtom() {
      return this.getAtom(1)
    }
    get instanceIdentifierAtom() {
      return this.getAtom(2)
    }
    get methodIdentifierAtom() {
      return this.getAtom(3)
    }
    get anyAtom() {
      return this.getAtomsFrom(4)
    }
  }

  class joinParser extends abstractAssignmentParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
    get identifiersAtom() {
      return this.getAtomsFrom(2)
    }
  }

  class mutableNumberParser extends abstractAssignmentParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
    get numberAtom() {
      return parseFloat(this.getAtom(2))
    }
  }

  class numberParser extends abstractAssignmentParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
    get numberAtom() {
      return parseFloat(this.getAtom(2))
    }
  }

  class numbersParser extends abstractAssignmentParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
    get numberAtom() {
      return this.getAtomsFrom(2).map(val => parseFloat(val))
    }
  }

  class stringParser extends abstractAssignmentParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get stringIdentifierAtom() {
      return this.getAtom(1)
    }
    get anyAtom() {
      return this.getAtomsFrom(2)
    }
  }

  class callFunctionParser extends abstractTerminalParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get functionIdentifierAtom() {
      return this.getAtom(1)
    }
    get anyAtom() {
      return this.getAtomsFrom(2)
    }
  }

  class decrementParser extends abstractTerminalParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get numberIdentifierAtom() {
      return this.getAtom(1)
    }
  }

  class dumpIdentifierParser extends abstractTerminalParser {
    get identifierAtom() {
      return this.getAtomsFrom(0)
    }
  }

  class exportParser extends abstractTerminalParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
  }

  class incrementParser extends abstractTerminalParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get numberIdentifierAtom() {
      return this.getAtom(1)
    }
  }

  class printNumberParser extends abstractTerminalParser {
    get numberIdentifierAtom() {
      return this.getAtomsFrom(0)
    }
  }

  class printStringParser extends abstractTerminalParser {
    get stringAtomsAtom() {
      return this.getAtomsFrom(0)
    }
  }

  class requireParser extends abstractTerminalParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get identifierAtom() {
      return this.getAtom(1)
    }
    get filepathAtom() {
      return this.getAtom(2)
    }
  }

  class returnParser extends abstractTerminalParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get anyAtom() {
      return this.getAtom(1)
    }
  }

  class hashbangParser extends ParserBackedParticle {
    get hashBangKeywordAtom() {
      return this.getAtom(0)
    }
    get hashBangAtom() {
      return this.getAtomsFrom(1)
    }
  }

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  module.exports = fireParser
  fireParser

  if (!module.parent) new fireParser(Particle.fromDisk(process.argv[2]).toString()).execute()
}
