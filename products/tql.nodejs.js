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
          missing: columnIsMissingNode,
          notMissing: columnIsNotMissingNode,
          matchesRegex: matchesRegexNode,
          "#": commentNode,
          select: selectNode,
          rename: renameNode,
          sortBy: sortByNode,
          reverse: reverseNode,
          limit: limitNode,
          title: titleNode,
          description: descriptionNode
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
 enum < > = != includes doesNotInclude oneOf
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
 description The column to search on.
 highlightScope constant.numeric
blankCell
tqlNode
 root
 description Tree Query Language (TQL) is a new language for searching a TreeBase.
 catchAllNodeType catchAllErrorNode
 inScope abstractQueryNode blankLineNode commentNode abstractModifierNode abstractMetaNode
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
  toPredicate() {
    const columnName = this.getWord(1)
    const operator = this.getWord(2)
    return file => {
      const value = file.getTypedValue(columnName)
      const valueType = typeof value
      const textQueryValue = this.getWordsFrom(3).join(" ")
      let queryValue = textQueryValue
      if (valueType === "number")
        queryValue = parseFloat(queryValue)
      if (operator === ">")
        return value > queryValue
      if (operator === "<")
        return value < queryValue
      if (operator === "=")
        return value == queryValue
      if (operator === "!=")
        return value != queryValue
      if (operator === "includes")
        return value ? value.includes(queryValue) : false
      if (operator === "doesNotInclude")
        return value ? !value.includes(queryValue) : true
      if (operator === "oneOf")
        return value ? textQueryValue.split(" ").includes(value.toString()) : false
    }
  }
includesTextNode
 extends abstractQueryNode
 description Find files that include this text somewhere. Case insensitive.
 catchAllCellType stringCell
 crux includes
 javascript
  toPredicate() {
    const query = (this.content ?? "").toLowerCase()
    return file => file.lowercase.includes(query)
  }
doesNotIncludeTextNode
 description Find files that do not include this text anywhere. Case insensitive.
 extends includesTextNode
 crux doesNotInclude
 boolean flip true
columnIsMissingNode
 description Find files whose value in the given column is missing.
 extends abstractQueryNode
 cells keywordCell columnNameCell
 crux missing
 javascript
  toPredicate() {
    const columnName = this.getWord(1)
    return file => !file.has(columnName.replaceAll(".", " "))
  }
columnIsNotMissingNode
 description Find files whose value in the given column is not missing.
 extends columnIsMissingNode
 crux notMissing
 boolean flip true
matchesRegexNode
 description Find files that match this regex on a full text search.
 extends abstractQueryNode
 catchAllCellType regexCell
 crux matchesRegex
 javascript
  toPredicate() {
    const regex = new RegExp(this.content ?? "")
    return file => regex.test(file.toString())
  }
commentNode
 description Comments are ignored.
 crux #
 cells commentCell
 catchAllCellType commentCell
 catchAllNodeType commentNode
 boolean suggestInAutocomplete false
abstractModifierNode
 cells keywordCell
 cruxFromId
 single
abstractColumnModifierNode
 extends abstractModifierNode
 catchAllCellType columnNameCell
selectNode
 description Choose which columns to return.
 extends abstractColumnModifierNode
renameNode
 cells keywordCell columnNameCell stringCell
 example
  rename githubRepo.stars Stars
 description Rename a column.
 extends abstractColumnModifierNode
sortByNode
 description Sort by these columns.
 extends abstractColumnModifierNode
reverseNode
 extends abstractModifierNode
 description Reverse the order of results.
limitNode
 extends abstractModifierNode
 description Return a maximum of this many results.
 cells keywordCell numberCell
abstractMetaNode
 cells keywordCell
 catchAllCellType stringCell
 cruxFromId
 single
 boolean suggestInAutocomplete false
titleNode
 description Give your query a title for display on the results page.
 extends abstractMetaNode
descriptionNode
 description Give your query a description for display on the results page.
 extends abstractMetaNode`)
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
        columnIsMissingNode: columnIsMissingNode,
        columnIsNotMissingNode: columnIsNotMissingNode,
        matchesRegexNode: matchesRegexNode,
        commentNode: commentNode,
        abstractModifierNode: abstractModifierNode,
        abstractColumnModifierNode: abstractColumnModifierNode,
        selectNode: selectNode,
        renameNode: renameNode,
        sortByNode: sortByNode,
        reverseNode: reverseNode,
        limitNode: limitNode,
        abstractMetaNode: abstractMetaNode,
        titleNode: titleNode,
        descriptionNode: descriptionNode
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
          missing: columnIsMissingNode,
          notMissing: columnIsNotMissingNode,
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
    toPredicate() {
      const columnName = this.getWord(1)
      const operator = this.getWord(2)
      return file => {
        const value = file.getTypedValue(columnName)
        const valueType = typeof value
        const textQueryValue = this.getWordsFrom(3).join(" ")
        let queryValue = textQueryValue
        if (valueType === "number") queryValue = parseFloat(queryValue)
        if (operator === ">") return value > queryValue
        if (operator === "<") return value < queryValue
        if (operator === "=") return value == queryValue
        if (operator === "!=") return value != queryValue
        if (operator === "includes") return value ? value.includes(queryValue) : false
        if (operator === "doesNotInclude") return value ? !value.includes(queryValue) : true
        if (operator === "oneOf") return value ? textQueryValue.split(" ").includes(value.toString()) : false
      }
    }
  }

  class includesTextNode extends abstractQueryNode {
    get stringCell() {
      return this.getWordsFrom(0)
    }
    toPredicate() {
      const query = (this.content ?? "").toLowerCase()
      return file => file.lowercase.includes(query)
    }
  }

  class doesNotIncludeTextNode extends includesTextNode {
    get flip() {
      return true
    }
  }

  class columnIsMissingNode extends abstractQueryNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get columnNameCell() {
      return this.getWord(1)
    }
    toPredicate() {
      const columnName = this.getWord(1)
      return file => !file.has(columnName.replaceAll(".", " "))
    }
  }

  class columnIsNotMissingNode extends columnIsMissingNode {
    get flip() {
      return true
    }
  }

  class matchesRegexNode extends abstractQueryNode {
    get regexCell() {
      return this.getWordsFrom(0)
    }
    toPredicate() {
      const regex = new RegExp(this.content ?? "")
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

  class abstractModifierNode extends GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
  }

  class abstractColumnModifierNode extends abstractModifierNode {
    get columnNameCell() {
      return this.getWordsFrom(0)
    }
  }

  class selectNode extends abstractColumnModifierNode {}

  class renameNode extends abstractColumnModifierNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get columnNameCell() {
      return this.getWord(1)
    }
    get stringCell() {
      return this.getWord(2)
    }
  }

  class sortByNode extends abstractColumnModifierNode {}

  class reverseNode extends abstractModifierNode {}

  class limitNode extends abstractModifierNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get numberCell() {
      return parseFloat(this.getWord(1))
    }
  }

  class abstractMetaNode extends GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get stringCell() {
      return this.getWordsFrom(1)
    }
    get suggestInAutocomplete() {
      return false
    }
  }

  class titleNode extends abstractMetaNode {}

  class descriptionNode extends abstractMetaNode {}

  module.exports = tqlNode
  tqlNode

  if (!module.parent) new tqlNode(TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
