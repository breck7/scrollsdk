{
  class tqlNode extends GrammarBackedNode {
    createParser() {
      return new TreeNode.Parser(
        catchAllErrorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          "#": commentNode,
          "*": includesTextNode,
          "!*": doesNotIncludeTextNode,
          "/": matchesNode,
          "!/": doesNotMatchNode,
          ">": greaterThanNode,
          "<": lessThanNode,
          "=": equalsNode,
          "!=": doesNotEqualNode,
          "?": fieldIsMissingNode,
          "!?": fieldIsNotMissingNode,
          "+": listIncludesNode,
          "-": listDoesNotIncludeNode,
          id: idIsOneOfNode,
          "!id": idIsNotOneOfNode
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
stringCell
 highlightScope string
permalinkCell
 highlightScope string
regexCell
 highlightScope string
numberCell
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
 inScope abstractQueryNode blankLineNode commentNode
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
commentNode
 description Comments are ignored.
 crux #
 cells commentCell
 catchAllCellType commentCell
 catchAllNodeType commentNode
blankLineNode
 description Blank lines are ignored.
 cells blankCell
 compiler
  stringTemplate 
 pattern ^$
 tags doNotSynthesize
 boolean shouldSerialize false
includesTextNode
 extends abstractQueryNode
 description A plain text case insensitive search.
 catchAllCellType stringCell
 crux *
 javascript
  toPredicate() {
    const query = this.getContent().toLowerCase()
    return file => file.lowercase.includes(query)
  }
doesNotIncludeTextNode
 description Find files that do NOT match this plain text case insensitive search.
 extends includesTextNode
 crux !*
 boolean flip true
matchesNode
 description Search by regex.
 extends abstractQueryNode
 catchAllCellType regexCell
 crux /
 javascript
  toPredicate() {
    const regex = new RegExp(this.getContent())
    return file => regex.test(file.toString())
  }
doesNotMatchNode
 description Find files that do NOT match this regex.
 extends matchesNode
 crux !/
 boolean flip true
abstractComparisonNode
 extends abstractQueryNode
 cells keywordCell columnNameCell numberCell
 javascript
  get columnName() {
    return this.getWord(1)
  }
  get comparisonValue() {
    return parseFloat(this.getWord(2))
  }
greaterThanNode
 description Find files whose value in the given column are greater than this number.
 extends abstractComparisonNode
 crux >
 javascript
  toPredicate() {
    return file => file[this.columnName] > this.comparisonValue
  }
lessThanNode
 description Find files whose value in the given column are less than this number.
 extends abstractComparisonNode
 crux <
 javascript
  toPredicate() {
    return file => file[this.columnName] < this.comparisonValue
  }
equalsNode
 description Find files whose value in the given column are equal to this number.
 extends abstractComparisonNode
 crux =
 javascript
  toPredicate() {
    return file => file[this.columnName] === this.comparisonValue
  }
doesNotEqualNode
 description Find files whose value in the given column does not equal this.
 extends abstractComparisonNode
 crux !=
 javascript
  toPredicate() {
    return file => file[this.columnName] !== this.comparisonValue
  }
fieldIsMissingNode
 description Find files whose value in the given column is missing.
 extends abstractComparisonNode
 cells keywordCell columnNameCell
 crux ?
 javascript
  toPredicate() {
    return file => file.has(this.columnName)
  }
fieldIsNotMissingNode
 description Find files whose value in the given column is not missing.
 extends fieldIsMissingNode
 crux !?
 boolean flip true
listIncludesNode
 description Find files whose value in the given list column includes this.
 extends abstractComparisonNode
 cells keywordCell columnNameCell
 catchAllCellType stringCell
 crux +
 javascript
  toPredicate() {
    return file => file[this.columnName].includes(this.getWordsFrom(2).join(" "))
  }
listDoesNotIncludeNode
 description Find files whose value in the given list column does NOT include this.
 extends listIncludesNode
 crux -
 boolean flip true
idIsOneOfNode
 description Find files whose permalink is included in this list.
 extends abstractQueryNode
 crux id
 catchAllCellType permalinkCell
 javascript
  toPredicate() {
    const okayList = this.getWordsFrom(1)
    return file => okayList.includes(file.id)
  }
idIsNotOneOfNode
 description Find files whose permalink is NOT in this list.
 extends idIsOneOfNode
 boolean flip true
 crux !id`)
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        tqlNode: tqlNode,
        abstractQueryNode: abstractQueryNode,
        catchAllErrorNode: catchAllErrorNode,
        commentNode: commentNode,
        blankLineNode: blankLineNode,
        includesTextNode: includesTextNode,
        doesNotIncludeTextNode: doesNotIncludeTextNode,
        matchesNode: matchesNode,
        doesNotMatchNode: doesNotMatchNode,
        abstractComparisonNode: abstractComparisonNode,
        greaterThanNode: greaterThanNode,
        lessThanNode: lessThanNode,
        equalsNode: equalsNode,
        doesNotEqualNode: doesNotEqualNode,
        fieldIsMissingNode: fieldIsMissingNode,
        fieldIsNotMissingNode: fieldIsNotMissingNode,
        listIncludesNode: listIncludesNode,
        listDoesNotIncludeNode: listDoesNotIncludeNode,
        idIsOneOfNode: idIsOneOfNode,
        idIsNotOneOfNode: idIsNotOneOfNode
      }
    }
  }

  class abstractQueryNode extends GrammarBackedNode {
    createParser() {
      return new TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          "#": commentNode,
          "*": includesTextNode,
          "!*": doesNotIncludeTextNode,
          "/": matchesNode,
          "!/": doesNotMatchNode,
          ">": greaterThanNode,
          "<": lessThanNode,
          "=": equalsNode,
          "!=": doesNotEqualNode,
          "?": fieldIsMissingNode,
          "!?": fieldIsNotMissingNode,
          "+": listIncludesNode,
          "-": listDoesNotIncludeNode,
          id: idIsOneOfNode,
          "!id": idIsNotOneOfNode
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
  }

  class blankLineNode extends GrammarBackedNode {
    get blankCell() {
      return this.getWord(0)
    }
    get shouldSerialize() {
      return false
    }
  }

  class includesTextNode extends abstractQueryNode {
    get stringCell() {
      return this.getWordsFrom(0)
    }
    toPredicate() {
      const query = this.getContent().toLowerCase()
      return file => file.lowercase.includes(query)
    }
  }

  class doesNotIncludeTextNode extends includesTextNode {
    get flip() {
      return true
    }
  }

  class matchesNode extends abstractQueryNode {
    get regexCell() {
      return this.getWordsFrom(0)
    }
    toPredicate() {
      const regex = new RegExp(this.getContent())
      return file => regex.test(file.toString())
    }
  }

  class doesNotMatchNode extends matchesNode {
    get flip() {
      return true
    }
  }

  class abstractComparisonNode extends abstractQueryNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get columnNameCell() {
      return this.getWord(1)
    }
    get numberCell() {
      return parseFloat(this.getWord(2))
    }
    get columnName() {
      return this.getWord(1)
    }
    get comparisonValue() {
      return parseFloat(this.getWord(2))
    }
  }

  class greaterThanNode extends abstractComparisonNode {
    toPredicate() {
      return file => file[this.columnName] > this.comparisonValue
    }
  }

  class lessThanNode extends abstractComparisonNode {
    toPredicate() {
      return file => file[this.columnName] < this.comparisonValue
    }
  }

  class equalsNode extends abstractComparisonNode {
    toPredicate() {
      return file => file[this.columnName] === this.comparisonValue
    }
  }

  class doesNotEqualNode extends abstractComparisonNode {
    toPredicate() {
      return file => file[this.columnName] !== this.comparisonValue
    }
  }

  class fieldIsMissingNode extends abstractComparisonNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get columnNameCell() {
      return this.getWord(1)
    }
    toPredicate() {
      return file => file.has(this.columnName)
    }
  }

  class fieldIsNotMissingNode extends fieldIsMissingNode {
    get flip() {
      return true
    }
  }

  class listIncludesNode extends abstractComparisonNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get columnNameCell() {
      return this.getWord(1)
    }
    get stringCell() {
      return this.getWordsFrom(2)
    }
    toPredicate() {
      return file => file[this.columnName].includes(this.getWordsFrom(2).join(" "))
    }
  }

  class listDoesNotIncludeNode extends listIncludesNode {
    get flip() {
      return true
    }
  }

  class idIsOneOfNode extends abstractQueryNode {
    get permalinkCell() {
      return this.getWordsFrom(0)
    }
    toPredicate() {
      const okayList = this.getWordsFrom(1)
      return file => okayList.includes(file.id)
    }
  }

  class idIsNotOneOfNode extends idIsOneOfNode {
    get flip() {
      return true
    }
  }

  window.tqlNode = tqlNode
}
