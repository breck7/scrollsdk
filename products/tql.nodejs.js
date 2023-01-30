#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { TreeNode } = require("./TreeNode.js")
  const { HandGrammarProgram } = require("./GrammarLanguage.js")
  const { GrammarBackedNode } = require("./GrammarLanguage.js")

  class tqlNode extends GrammarBackedNode {
    createParser() {
      return new TreeNode.Parser(
        catchAllErrorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          where: whereNode,
          includes: includesTextNode,
          doesNotInclude: doesNotIncludeTextNode,
          missing: fieldIsMissingNode,
          notMissing: fieldIsNotMissingNode,
          matchesRegex: matchesRegexNode,
          "#": commentNode,
          select: selectNode
        }),
        [{ regex: /^$/, nodeConstructor: blankLineNode }]
      )
    }
    get tests() {
      const tests = this.filter(node => node.toPredicate).map(node => {
        const predicate = node.toPredicate()
        return node.flip ? file => !predicate(file) : predicate
      })
      return tests
    }
    filterFolder(treeBaseFolder) {
      const { tests } = this
      const predicate = file => tests.every(fn => fn(file))
      return treeBaseFolder.filter(file => predicate(file))
    }
    static cachedHandGrammarProgramRoot = new HandGrammarProgram(`keywordCell
 highlightScope keyword
comparisonCell
 enum < > = != includes doesNotInclude
stringCell
 highlightScope string
permalinkCell
 highlightScope string
regexCell
 highlightScope string
numberCell
 highlightScope constant.numeric
numberOrStringCell
 highlightScope constant.numeric
commentCell
 highlightScope comment
columnNameCell
 description The field to search on.
 highlightScope constant.numeric
blankCell
tqlNode
 root
 description Tree Query Language (TQL) is a new language for searching a TreeBase.
 catchAllNodeType catchAllErrorNode
 inScope abstractQueryNode blankLineNode commentNode selectNode
 javascript
  get tests() {
    const tests = this.filter(node => node.toPredicate).map(node => {
        const predicate = node.toPredicate()
        return node.flip ? (file) => !predicate(file)  : predicate
    })
    return tests
  }
  filterFolder(treeBaseFolder) {
    const {tests} = this
    const predicate = file => tests.every(fn => fn(file))
    return treeBaseFolder.filter(file => predicate(file))
  }
abstractQueryNode
 cells keywordCell
 inScope abstractQueryNode commentNode
 javascript
  toPredicate() {
    return () => true
  }
catchAllErrorNode
 baseNodeType errorNode
blankLineNode
 description Blank lines are ignored.
 cells blankCell
 compiler
  stringTemplate 
 pattern ^$
 tags doNotSynthesize
 boolean shouldSerialize false
whereNode
 description Find files whose value in the given column meet this condition.
 extends abstractQueryNode
 cells keywordCell columnNameCell comparisonCell
 catchAllCellType numberOrStringCell
 crux where
 javascript
  get columnName() {
    return this.getWord(1)
  }
  get operator() {
    return this.getWord(2)
  }
  get numericValue() {
    return parseFloat(this.getWord(3))
  }
  toPredicate() {
    const {columnName, operator} = this
    const getValue = file => file.typed[columnName]
    const getTextValue = file => {
      const value = getValue(file)
      if (value === undefined) return ""
      if (!value.includes) return ""
      return value
    }
    if (operator === ">")
      return file => getValue(file) > this.numericValue
    if (operator === "<")
      return file => getValue(file) < this.numericValue
    const stringValue = this.getWordsFrom(3).join(" ")
    if (operator === "=")
      return file => getValue(file) == this.numericValue
    if (operator === "!=")
      return file => getValue(file) != this.numericValue
    if (operator === "includes")
      return file => getTextValue(file).includes(stringValue)
    if (operator === "doesNotInclude")
      return file => !getTextValue(file).includes(stringValue)
  }
includesTextNode
 extends abstractQueryNode
 description Find files that include this text somewhere. Case insensitive.
 catchAllCellType stringCell
 crux includes
 javascript
  toPredicate() {
    const query = (this.getContent() ?? "").toLowerCase()
    return file => file.lowercase.includes(query)
  }
doesNotIncludeTextNode
 description Find files that do not include this text anywhere. Case insensitive.
 extends includesTextNode
 crux doesNotInclude
 boolean flip true
fieldIsMissingNode
 description Find files whose value in the given column is missing.
 extends abstractQueryNode
 cells keywordCell columnNameCell
 crux missing
 javascript
  toPredicate() {
    const columnName = this.getWord(1)
    return file => !file.has(columnName)
  }
fieldIsNotMissingNode
 description Find files whose value in the given column is not missing.
 extends fieldIsMissingNode
 crux notMissing
 boolean flip true
matchesRegexNode
 description Find files that match this regex on a full text search.
 extends abstractQueryNode
 catchAllCellType regexCell
 crux matchesRegex
 javascript
  toPredicate() {
    const regex = new RegExp(this.getContent() ?? "")
    return file => regex.test(file.toString())
  }
commentNode
 description Comments are ignored.
 crux #
 cells commentCell
 catchAllCellType commentCell
 catchAllNodeType commentNode
 boolean suggestInAutocomplete false
selectNode
 description Choose which columns to return.
 cells keywordCell
 catchAllCellType columnNameCell
 crux select
 single`)
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        tqlNode: tqlNode,
        abstractQueryNode: abstractQueryNode,
        catchAllErrorNode: catchAllErrorNode,
        blankLineNode: blankLineNode,
        whereNode: whereNode,
        includesTextNode: includesTextNode,
        doesNotIncludeTextNode: doesNotIncludeTextNode,
        fieldIsMissingNode: fieldIsMissingNode,
        fieldIsNotMissingNode: fieldIsNotMissingNode,
        matchesRegexNode: matchesRegexNode,
        commentNode: commentNode,
        selectNode: selectNode
      }
    }
  }

  class abstractQueryNode extends GrammarBackedNode {
    createParser() {
      return new TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          where: whereNode,
          includes: includesTextNode,
          doesNotInclude: doesNotIncludeTextNode,
          missing: fieldIsMissingNode,
          notMissing: fieldIsNotMissingNode,
          matchesRegex: matchesRegexNode,
          "#": commentNode
        }),
        undefined
      )
    }
    get keywordCell() {
      return this.getWord(0)
    }
    toPredicate() {
      return () => true
    }
  }

  class catchAllErrorNode extends GrammarBackedNode {
    getErrors() {
      return this._getErrorNodeErrors()
    }
  }

  class blankLineNode extends GrammarBackedNode {
    get blankCell() {
      return this.getWord(0)
    }
    get shouldSerialize() {
      return false
    }
  }

  class whereNode extends abstractQueryNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get columnNameCell() {
      return this.getWord(1)
    }
    get comparisonCell() {
      return this.getWord(2)
    }
    get numberOrStringCell() {
      return this.getWordsFrom(3)
    }
    get columnName() {
      return this.getWord(1)
    }
    get operator() {
      return this.getWord(2)
    }
    get numericValue() {
      return parseFloat(this.getWord(3))
    }
    toPredicate() {
      const { columnName, operator } = this
      const getValue = file => file.typed[columnName]
      const getTextValue = file => {
        const value = getValue(file)
        if (value === undefined) return ""
        if (!value.includes) return ""
        return value
      }
      if (operator === ">") return file => getValue(file) > this.numericValue
      if (operator === "<") return file => getValue(file) < this.numericValue
      const stringValue = this.getWordsFrom(3).join(" ")
      if (operator === "=") return file => getValue(file) == this.numericValue
      if (operator === "!=") return file => getValue(file) != this.numericValue
      if (operator === "includes") return file => getTextValue(file).includes(stringValue)
      if (operator === "doesNotInclude") return file => !getTextValue(file).includes(stringValue)
    }
  }

  class includesTextNode extends abstractQueryNode {
    get stringCell() {
      return this.getWordsFrom(0)
    }
    toPredicate() {
      const query = (this.getContent() ?? "").toLowerCase()
      return file => file.lowercase.includes(query)
    }
  }

  class doesNotIncludeTextNode extends includesTextNode {
    get flip() {
      return true
    }
  }

  class fieldIsMissingNode extends abstractQueryNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get columnNameCell() {
      return this.getWord(1)
    }
    toPredicate() {
      const columnName = this.getWord(1)
      return file => !file.has(columnName)
    }
  }

  class fieldIsNotMissingNode extends fieldIsMissingNode {
    get flip() {
      return true
    }
  }

  class matchesRegexNode extends abstractQueryNode {
    get regexCell() {
      return this.getWordsFrom(0)
    }
    toPredicate() {
      const regex = new RegExp(this.getContent() ?? "")
      return file => regex.test(file.toString())
    }
  }

  class commentNode extends GrammarBackedNode {
    createParser() {
      return new TreeNode.Parser(commentNode, undefined, undefined)
    }
    get commentCell() {
      return this.getWord(0)
    }
    get commentCell() {
      return this.getWordsFrom(1)
    }
    get suggestInAutocomplete() {
      return false
    }
  }

  class selectNode extends GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get columnNameCell() {
      return this.getWordsFrom(1)
    }
  }

  module.exports = tqlNode
  tqlNode

  if (!module.parent) new tqlNode(TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
