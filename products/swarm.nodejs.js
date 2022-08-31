#! /usr/bin/env node
{
  const { jtree } = require("../index.js")

  class swarmNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        errorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          test: testNode,
          testOnly: testOnlyNode,
          skipTest: skipTestNode,
          "#!": hashbangNode,
          arrange: arrangeNode
        }),
        undefined
      )
    }
    getArrangeNode() {
      return this.getChildInstancesOfNodeTypeId("arrangeNode")[0]
    }
    async execute(filepath) {
      const tree = new jtree.TestRacer(this.compileToRacer(filepath))
      await tree.execute()
      return tree.finish()
    }
    compileToRacer(filepath) {
      const testBlocks = {}
      this.getChildInstancesOfNodeTypeId("abstractTestBlockNode").forEach(testNode => {
        const prefix = testNode.racerPrefix || ""
        testBlocks[prefix + testNode.getContent()] = testNode.toTestRacerFunction(filepath)
      })
      const files = {}
      files[filepath] = testBlocks
      return files
    }
    static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(`tooling onsave jtree build produceLang swarm
todo Add comments?
todo Make run in browser
todo Add print or tracer type of intermediate element. debugger?
anyCell
 highlightScope string
 examples lorem ipsum
assertionKeywordCell
 highlightScope keyword.operator
 extends keywordCell
commandCell
 extends keywordCell
 highlightScope variable.function
 examples someCommand
extraCell
 highlightScope invalid
filepathCell
 examples foobar.foo someFile.foo
 highlightScope string
keywordCell
hashBangKeywordCell
 extends keywordCell
 highlightScope comment
 enum #!
hashBangCell
 highlightScope comment
intCell
 regex \\-?[0-9]+
 highlightScope constant.numeric.integer
parameterKeywordCell
 extends keywordCell
 highlightScope variable.parameter
todoCell
 highlightScope comment
todoKeywordCell
 extends keywordCell
 highlightScope comment
typeOfOptionCell
 description The 6 possible results for Javascript's typeof.
 highlightScope constant.language
 enum object boolean function number string undefined
swarmNode
 root
 description A prefix Tree Language for unit testing of classes.
 inScope hashbangNode arrangeNode abstractTestBlockNode
 catchAllNodeType errorNode
 javascript
  getArrangeNode() {
   return this.getChildInstancesOfNodeTypeId("arrangeNode")[0]
  }
  async execute(filepath) {
   const tree = new jtree.TestRacer(this.compileToRacer(filepath))
   await tree.execute()
   return tree.finish()
  }
  compileToRacer(filepath) {
   const testBlocks = {}
   this.getChildInstancesOfNodeTypeId("abstractTestBlockNode").forEach(testNode => {
    const prefix = testNode.racerPrefix || ""
    testBlocks[prefix + testNode.getContent()] = testNode.toTestRacerFunction(filepath)
   })
   const files = {}
   files[filepath] = testBlocks
   return files
  }
abstractAssertionNode
 javascript
  async execute(arrangedInstance) {
   //todo: refactor. there is clearly a difference between sync and async that we are not
   // documenting. seems like async and sync have different cellTypes. the former requires
   // a method to get the result.
   const finalParts = jtree.Utils.getMethodFromDotPath(arrangedInstance, this.getWord(1))
   const subject = finalParts[0]
   const command = finalParts[1]
   const actual = subject[command]()
   const actualAsString = this.parseActual(actual).toString()
   const expected = this.getExpected()
   this.getAssertionResult(actualAsString, expected, this.getLine())
  }
  equal(actual, expected, message) {
   this.getParent().getEqualFn()(actual, expected, message)
  }
  getAssertionResult(actualAsString, expected, message) {
   this.equal(actualAsString, expected, message)
   return actualAsString === expected
  }
  parseActual(actual) {
   return actual
  }
  executeSync(result) {
   const expected = this.getSyncExpected()
   const actual = this.parseActual(result)
   const actualIsUndefined = actual === undefined
   const actualAsString = actualIsUndefined ? "undefined" : actual.toString()
   this.getAssertionResult(actualAsString, expected, this.getLine())
  }
  getExpected() {
   return this.getWordsFrom(2).join(" ")
  }
  getSyncExpected() {
   return this.getContent()
  }
 cells assertionKeywordCell
assertParagraphIsNode
 crux assertParagraphIs
 description When your expected value is a multiline string.
 catchAllNodeType paragraphLineNode
 javascript
  getExpected() {
   return this.childrenToString()
  }
  getSyncExpected() {
   return this.childrenToString()
  }
 extends abstractAssertionNode
assertLengthIsNode
 crux assertLengthIs
 description Intake is an array, and checks if the length of array matches expected.
 cells assertionKeywordCell intCell
 javascript
  parseActual(actual) {
   return actual.length
  }
 extends abstractAssertionNode
assertStringExcludesNode
 crux assertStringExcludes
 description Converts the input to string and ensure the string does NOT contain the provided string
 catchAllCellType anyCell
 javascript
  getAssertionResult(actualAsString, expected, message) {
   const result = !actualAsString.includes(expected)
   if (!result) {
    const index = actualAsString.indexOf(expected)
    const start = Math.max(0, index - 50)
    message += \` Found \${expected} in: \` + actualAsString.substr(start, index + 50 + expected.length)
   }
   this.equal(result, true, message)
   return result
  }
 extends abstractAssertionNode
assertStringIncludesNode
 crux assertStringIncludes
 catchAllCellType anyCell
 description Converts the input to string and see if the string contains the provided string
 javascript
  getAssertionResult(actualAsString, expected, message) {
   const result = actualAsString.includes(expected)
   this.equal(result, true, message)
   return result
  }
 extends abstractAssertionNode
assertStringIsNode
 crux assertStringIs
 description Intake is anything with a toString method, and compares that to provided expected value.
 catchAllCellType anyCell
 extends abstractAssertionNode
assertTypeIsNode
 crux assertTypeIs
 description Assert result is one of Javascript's 6 typeof types.
 cells assertionKeywordCell typeOfOptionCell
 javascript
  parseActual(actual) {
   return typeof actual
  }
 extends abstractAssertionNode
abstractArrangeFlagNode
 cells keywordCell
arrangeAsyncNode
 description Add this flag in the arrange node to test async methods.
 extends abstractArrangeFlagNode
 crux async
arrangeRequireNode
 description Pass in the filename to require for nodejs tests.
 crux require
 cells keywordCell filepathCell
 catchAllCellType anyCell
arrangeStaticNode
 crux static
 description Add this to the arrange node to import class directly without initiating it for static method testing.
 extends abstractArrangeFlagNode
abstractTestBlockNode
 catchAllCellType anyCell
 javascript
  getArrangeNode() {
   return this.getNode("arrange") || this.getParent().getArrangeNode()
  }
  setEqualMethod(equal) {
   this._equal = equal
   return this
  }
  getTestBlock() {
   return this
  }
  getEqualFn() {
   return this._equal
  }
  toTestRacerFunction(programFilepath) {
   const arrangeNode = this.getArrangeNode()
   const arrangedInstance = arrangeNode.arrange(programFilepath)
   const executeMethod = arrangeNode.isAsync() ? "execute" : "executeSync"
   return async equal => {
    this.setEqualMethod(equal)
    const promises = this.map(async childAction => {
     const result = await childAction[executeMethod](arrangedInstance)
     return result
    })
    await Promise.all(promises)
   }
  }
 inScope arrangeNode
 catchAllNodeType actNode
 cells keywordCell
testNode
 description Basic test block.
 extends abstractTestBlockNode
 crux test
testOnlyNode
 description If set, only this test block will be run.
 extends abstractTestBlockNode
 string racerPrefix _
 crux testOnly
skipTestNode
 description If you want to skip running a test.
 extends abstractTestBlockNode
 string racerPrefix $
 crux skipTest
hashbangNode
 crux #!
 description Standard bash hashbang line.
 cells hashBangKeywordCell hashBangCell
 catchAllCellType hashBangCell
arrangeNode
 crux arrange
 javascript
  isAsync() {
    return this.has("async")
  }
  arrange(programFilepath) {
   const requiredClass = this._getRequiredClass(programFilepath)
   const constructorArgNode = this.getChildInstancesOfNodeTypeId("constructWithParagraphNode")[0]
   const param = constructorArgNode ? constructorArgNode.childrenToString() : undefined
   return this.has("static") ? requiredClass : new requiredClass(param)
  }
  _getRequiredClass(programFilepath) {
    // todo: cleanup
   let requiredClass =
    this.get("require") ||
    this.getRootNode()
     .getNode("arrange")
     .get("require")
   const requiredClassParts = requiredClass.split(" ") // Allows for ./ExportsClasses.js ChildClass
   const requiredFileNameOrClass = requiredClassParts[0]
   let theClass
   if (this.isNodeJs()) {
    if (requiredFileNameOrClass.includes("."))
      theClass = require(jtree.Utils.resolvePath(requiredFileNameOrClass, programFilepath))
    else
      theClass = global[requiredFileNameOrClass]
   }
   else theClass = window[jtree.Utils.getClassNameFromFilePath(requiredFileNameOrClass)]
   if (requiredClassParts[1]) theClass = jtree.Utils.resolveProperty(theClass, requiredClassParts[1])
   if (!theClass) throw new Error(\`Required class '\${requiredClassParts.join(" ")}' not found for \${this.toString()}\`)
   return theClass
  }
  executeSync() {}
 inScope arrangeAsyncNode arrangeRequireNode arrangeStaticNode constructWithParagraphNode todoNode
 cells keywordCell
withParagraphNode
 description Pass in a multiline string as a command arg.
 javascript
  executeSync() {}
 catchAllNodeType paragraphLineNode
 cells parameterKeywordCell
 crux withParagraph
actNode
 javascript
  getTestBlock() {
   return this.getParent()
  }
  getEqualFn() {
   return this.getTestBlock().getEqualFn()
  }
  _getActArgs() {
   const paragraphActNodes = this.getChildInstancesOfNodeTypeId("withParagraphNode")
   if (paragraphActNodes.length) return paragraphActNodes.map(arg => arg.childrenToString())
   return this.getWordsFrom(1)
  }
  _act(arrangedInstance) {
   const actionMethodName = this.getFirstWord()
   const actionMethod = arrangedInstance[actionMethodName]
   if (!actionMethod) throw new Error(\`No method "\${actionMethodName}" on "\${arrangedInstance.constructor.name}"\`)
   if (typeof actionMethod !== "function") throw new Error(\`"\${actionMethodName}" on "\${arrangedInstance.constructor.name}" is a property not a method\`)
   return actionMethod.apply(arrangedInstance, this._getActArgs())
  }
  async execute(arrangedInstance) {
   await this._act(arrangedInstance)
   return Promise.all(this.map(child => child.execute(arrangedInstance)))
  }
  executeSync(arrangedInstance) {
   const newTestSubject = this._act(arrangedInstance)
   return this.map(child => child.executeSync(newTestSubject))
  }
 description Input is an object, and calls some method with an optional array of string args.
 catchAllCellType anyCell
 catchAllNodeType actNode
 inScope withParagraphNode abstractAssertionNode
 cells commandCell
constructWithParagraphNode
 javascript
  executeSync() {}
 description Pass in a multiline string to setup constructor. #todo: rename
 catchAllNodeType paragraphLineNode
 cells keywordCell
 crux constructWithParagraph
errorNode
 baseNodeType errorNode
paragraphLineNode
 catchAllCellType anyCell
 catchAllNodeType paragraphLineNode
 cells anyCell
todoNode
 description Todos let you add notes about what is coming in the future in the source code. They are like comments in other languages except should only be used for todos.
 catchAllCellType todoCell
 catchAllNodeType todoNode
 crux todo
 cells todoKeywordCell`)
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        swarmNode: swarmNode,
        abstractAssertionNode: abstractAssertionNode,
        assertParagraphIsNode: assertParagraphIsNode,
        assertLengthIsNode: assertLengthIsNode,
        assertStringExcludesNode: assertStringExcludesNode,
        assertStringIncludesNode: assertStringIncludesNode,
        assertStringIsNode: assertStringIsNode,
        assertTypeIsNode: assertTypeIsNode,
        abstractArrangeFlagNode: abstractArrangeFlagNode,
        arrangeAsyncNode: arrangeAsyncNode,
        arrangeRequireNode: arrangeRequireNode,
        arrangeStaticNode: arrangeStaticNode,
        abstractTestBlockNode: abstractTestBlockNode,
        testNode: testNode,
        testOnlyNode: testOnlyNode,
        skipTestNode: skipTestNode,
        hashbangNode: hashbangNode,
        arrangeNode: arrangeNode,
        withParagraphNode: withParagraphNode,
        actNode: actNode,
        constructWithParagraphNode: constructWithParagraphNode,
        errorNode: errorNode,
        paragraphLineNode: paragraphLineNode,
        todoNode: todoNode
      }
    }
  }

  class abstractAssertionNode extends jtree.GrammarBackedNode {
    get assertionKeywordCell() {
      return this.getWord(0)
    }
    async execute(arrangedInstance) {
      //todo: refactor. there is clearly a difference between sync and async that we are not
      // documenting. seems like async and sync have different cellTypes. the former requires
      // a method to get the result.
      const finalParts = jtree.Utils.getMethodFromDotPath(arrangedInstance, this.getWord(1))
      const subject = finalParts[0]
      const command = finalParts[1]
      const actual = subject[command]()
      const actualAsString = this.parseActual(actual).toString()
      const expected = this.getExpected()
      this.getAssertionResult(actualAsString, expected, this.getLine())
    }
    equal(actual, expected, message) {
      this.getParent().getEqualFn()(actual, expected, message)
    }
    getAssertionResult(actualAsString, expected, message) {
      this.equal(actualAsString, expected, message)
      return actualAsString === expected
    }
    parseActual(actual) {
      return actual
    }
    executeSync(result) {
      const expected = this.getSyncExpected()
      const actual = this.parseActual(result)
      const actualIsUndefined = actual === undefined
      const actualAsString = actualIsUndefined ? "undefined" : actual.toString()
      this.getAssertionResult(actualAsString, expected, this.getLine())
    }
    getExpected() {
      return this.getWordsFrom(2).join(" ")
    }
    getSyncExpected() {
      return this.getContent()
    }
  }

  class assertParagraphIsNode extends abstractAssertionNode {
    createParser() {
      return new jtree.TreeNode.Parser(paragraphLineNode, undefined, undefined)
    }
    getExpected() {
      return this.childrenToString()
    }
    getSyncExpected() {
      return this.childrenToString()
    }
  }

  class assertLengthIsNode extends abstractAssertionNode {
    get assertionKeywordCell() {
      return this.getWord(0)
    }
    get intCell() {
      return parseInt(this.getWord(1))
    }
    parseActual(actual) {
      return actual.length
    }
  }

  class assertStringExcludesNode extends abstractAssertionNode {
    get anyCell() {
      return this.getWordsFrom(0)
    }
    getAssertionResult(actualAsString, expected, message) {
      const result = !actualAsString.includes(expected)
      if (!result) {
        const index = actualAsString.indexOf(expected)
        const start = Math.max(0, index - 50)
        message += ` Found ${expected} in: ` + actualAsString.substr(start, index + 50 + expected.length)
      }
      this.equal(result, true, message)
      return result
    }
  }

  class assertStringIncludesNode extends abstractAssertionNode {
    get anyCell() {
      return this.getWordsFrom(0)
    }
    getAssertionResult(actualAsString, expected, message) {
      const result = actualAsString.includes(expected)
      this.equal(result, true, message)
      return result
    }
  }

  class assertStringIsNode extends abstractAssertionNode {
    get anyCell() {
      return this.getWordsFrom(0)
    }
  }

  class assertTypeIsNode extends abstractAssertionNode {
    get assertionKeywordCell() {
      return this.getWord(0)
    }
    get typeOfOptionCell() {
      return this.getWord(1)
    }
    parseActual(actual) {
      return typeof actual
    }
  }

  class abstractArrangeFlagNode extends jtree.GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
  }

  class arrangeAsyncNode extends abstractArrangeFlagNode {}

  class arrangeRequireNode extends jtree.GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get filepathCell() {
      return this.getWord(1)
    }
    get anyCell() {
      return this.getWordsFrom(2)
    }
  }

  class arrangeStaticNode extends abstractArrangeFlagNode {}

  class abstractTestBlockNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        actNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { arrange: arrangeNode }),
        undefined
      )
    }
    get keywordCell() {
      return this.getWord(0)
    }
    get anyCell() {
      return this.getWordsFrom(1)
    }
    getArrangeNode() {
      return this.getNode("arrange") || this.getParent().getArrangeNode()
    }
    setEqualMethod(equal) {
      this._equal = equal
      return this
    }
    getTestBlock() {
      return this
    }
    getEqualFn() {
      return this._equal
    }
    toTestRacerFunction(programFilepath) {
      const arrangeNode = this.getArrangeNode()
      const arrangedInstance = arrangeNode.arrange(programFilepath)
      const executeMethod = arrangeNode.isAsync() ? "execute" : "executeSync"
      return async equal => {
        this.setEqualMethod(equal)
        const promises = this.map(async childAction => {
          const result = await childAction[executeMethod](arrangedInstance)
          return result
        })
        await Promise.all(promises)
      }
    }
  }

  class testNode extends abstractTestBlockNode {}

  class testOnlyNode extends abstractTestBlockNode {
    get racerPrefix() {
      return `_`
    }
  }

  class skipTestNode extends abstractTestBlockNode {
    get racerPrefix() {
      return `$`
    }
  }

  class hashbangNode extends jtree.GrammarBackedNode {
    get hashBangKeywordCell() {
      return this.getWord(0)
    }
    get hashBangCell() {
      return this.getWord(1)
    }
    get hashBangCell() {
      return this.getWordsFrom(2)
    }
  }

  class arrangeNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          async: arrangeAsyncNode,
          require: arrangeRequireNode,
          static: arrangeStaticNode,
          constructWithParagraph: constructWithParagraphNode,
          todo: todoNode
        }),
        undefined
      )
    }
    get keywordCell() {
      return this.getWord(0)
    }
    isAsync() {
      return this.has("async")
    }
    arrange(programFilepath) {
      const requiredClass = this._getRequiredClass(programFilepath)
      const constructorArgNode = this.getChildInstancesOfNodeTypeId("constructWithParagraphNode")[0]
      const param = constructorArgNode ? constructorArgNode.childrenToString() : undefined
      return this.has("static") ? requiredClass : new requiredClass(param)
    }
    _getRequiredClass(programFilepath) {
      // todo: cleanup
      let requiredClass =
        this.get("require") ||
        this.getRootNode()
          .getNode("arrange")
          .get("require")
      const requiredClassParts = requiredClass.split(" ") // Allows for ./ExportsClasses.js ChildClass
      const requiredFileNameOrClass = requiredClassParts[0]
      let theClass
      if (this.isNodeJs()) {
        if (requiredFileNameOrClass.includes(".")) theClass = require(jtree.Utils.resolvePath(requiredFileNameOrClass, programFilepath))
        else theClass = global[requiredFileNameOrClass]
      } else theClass = window[jtree.Utils.getClassNameFromFilePath(requiredFileNameOrClass)]
      if (requiredClassParts[1]) theClass = jtree.Utils.resolveProperty(theClass, requiredClassParts[1])
      if (!theClass) throw new Error(`Required class '${requiredClassParts.join(" ")}' not found for ${this.toString()}`)
      return theClass
    }
    executeSync() {}
  }

  class withParagraphNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(paragraphLineNode, undefined, undefined)
    }
    get parameterKeywordCell() {
      return this.getWord(0)
    }
    executeSync() {}
  }

  class actNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        actNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          assertParagraphIs: assertParagraphIsNode,
          assertLengthIs: assertLengthIsNode,
          assertStringExcludes: assertStringExcludesNode,
          assertStringIncludes: assertStringIncludesNode,
          assertStringIs: assertStringIsNode,
          assertTypeIs: assertTypeIsNode,
          withParagraph: withParagraphNode
        }),
        undefined
      )
    }
    get commandCell() {
      return this.getWord(0)
    }
    get anyCell() {
      return this.getWordsFrom(1)
    }
    getTestBlock() {
      return this.getParent()
    }
    getEqualFn() {
      return this.getTestBlock().getEqualFn()
    }
    _getActArgs() {
      const paragraphActNodes = this.getChildInstancesOfNodeTypeId("withParagraphNode")
      if (paragraphActNodes.length) return paragraphActNodes.map(arg => arg.childrenToString())
      return this.getWordsFrom(1)
    }
    _act(arrangedInstance) {
      const actionMethodName = this.getFirstWord()
      const actionMethod = arrangedInstance[actionMethodName]
      if (!actionMethod) throw new Error(`No method "${actionMethodName}" on "${arrangedInstance.constructor.name}"`)
      if (typeof actionMethod !== "function") throw new Error(`"${actionMethodName}" on "${arrangedInstance.constructor.name}" is a property not a method`)
      return actionMethod.apply(arrangedInstance, this._getActArgs())
    }
    async execute(arrangedInstance) {
      await this._act(arrangedInstance)
      return Promise.all(this.map(child => child.execute(arrangedInstance)))
    }
    executeSync(arrangedInstance) {
      const newTestSubject = this._act(arrangedInstance)
      return this.map(child => child.executeSync(newTestSubject))
    }
  }

  class constructWithParagraphNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(paragraphLineNode, undefined, undefined)
    }
    get keywordCell() {
      return this.getWord(0)
    }
    executeSync() {}
  }

  class errorNode extends jtree.GrammarBackedNode {
    getErrors() {
      return this._getErrorNodeErrors()
    }
  }

  class paragraphLineNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(paragraphLineNode, undefined, undefined)
    }
    get anyCell() {
      return this.getWord(0)
    }
    get anyCell() {
      return this.getWordsFrom(1)
    }
  }

  class todoNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(todoNode, undefined, undefined)
    }
    get todoKeywordCell() {
      return this.getWord(0)
    }
    get todoCell() {
      return this.getWordsFrom(1)
    }
  }

  module.exports = swarmNode
  swarmNode

  if (!module.parent) new swarmNode(jtree.TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
