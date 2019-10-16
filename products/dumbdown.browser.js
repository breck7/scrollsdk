{
  class dumbdownNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        blankLineNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMap()), {
          title: titleNode,
          link: linkNode,
          paragraph: paragraphNode,
          subtitle: subtitleNode,
          code: codeNode,
          list: listNode
        }),
        undefined
      )
    }
    getGrammarProgram() {
      if (!this._cachedGrammarProgramRoot)
        this._cachedGrammarProgramRoot = new jtree.GrammarProgram(`dumbdownNode
 extensions dd dumbdown
 description A prefix Tree Language that compiles to HTML. An alternative to Markdown.
 root
 inScope abstractTopLevelNode
 catchAllNodeType blankLineNode
 compilesTo html
 example
  title Hello world
  subtitle This is dumbdown
  
  paragraph It compiles to HTML. Blank lines get turned into brs.
  link https://treenotation.org dumbdown is a Tree Language.
  list
   - It has lists
   - Too!
  code
   // You can add code as well.
   print("Hello world")
abstractTopLevelNode
 abstract
 cells keywordCell
anyCell
blankCell
dashCell
 highlightScope constant.language
codeCell
 highlightScope comment
keywordCell
 highlightScope keyword
textCell
 highlightScope string
urlCell
 highlightScope constant.language
blankLineNode
 description Blank lines compile to a br in the HTML.
 cells blankCell
 compiler
  stringTemplate <br>
titleNode
 catchAllCellType textCell
 extends abstractTopLevelNode
 compiler
  stringTemplate <h1>{textCell}</h1>
linkNode
 cells keywordCell urlCell
 catchAllCellType textCell
 extends abstractTopLevelNode
 compiler
  stringTemplate <a href="{urlCell}">{textCell}</a>
paragraphNode
 inScope linkNode
 catchAllCellType textCell
 extends abstractTopLevelNode
 compiler
  stringTemplate <p>{textCell}</p>
subtitleNode
 catchAllCellType textCell
 extends abstractTopLevelNode
 compiler
  stringTemplate <h2>{textCell}</h2>
lineOfCodeNode
 catchAllCellType codeCell
 cells codeCell
codeNode
 description A code block.
 catchAllNodeType lineOfCodeNode
 extends abstractTopLevelNode
 todo Fix spacing
 compiler
  openChildren <code>
  closeChildren </code>
  stringTemplate 
listNode
 inScope dashNode
 extends abstractTopLevelNode
 compiler
  stringTemplate 
  openChildren <ul>
  closeChildren </ul>
dashNode
 match -
 catchAllCellType textCell
 compiler
  stringTemplate <li>{textCell}</li>
 cells dashCell`)
      return this._cachedGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        dumbdownNode: dumbdownNode,
        abstractTopLevelNode: abstractTopLevelNode,
        blankLineNode: blankLineNode,
        titleNode: titleNode,
        linkNode: linkNode,
        paragraphNode: paragraphNode,
        subtitleNode: subtitleNode,
        lineOfCodeNode: lineOfCodeNode,
        codeNode: codeNode,
        listNode: listNode,
        dashNode: dashNode
      }
    }
  }

  class abstractTopLevelNode extends jtree.GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
  }

  class blankLineNode extends jtree.GrammarBackedNode {
    get blankCell() {
      return this.getWord(0)
    }
  }

  class titleNode extends abstractTopLevelNode {
    get textCell() {
      return this.getWordsFrom(0)
    }
  }

  class linkNode extends abstractTopLevelNode {
    get keywordCell() {
      return this.getWord(0)
    }
    get urlCell() {
      return this.getWord(1)
    }
    get textCell() {
      return this.getWordsFrom(2)
    }
  }

  class paragraphNode extends abstractTopLevelNode {
    createParser() {
      return new jtree.TreeNode.Parser(undefined, Object.assign(Object.assign({}, super.createParser()._getFirstWordMap()), { link: linkNode }), undefined)
    }
    get textCell() {
      return this.getWordsFrom(0)
    }
  }

  class subtitleNode extends abstractTopLevelNode {
    get textCell() {
      return this.getWordsFrom(0)
    }
  }

  class lineOfCodeNode extends jtree.GrammarBackedNode {
    get codeCell() {
      return this.getWord(0)
    }
    get codeCell() {
      return this.getWordsFrom(1)
    }
  }

  class codeNode extends abstractTopLevelNode {
    createParser() {
      return new jtree.TreeNode.Parser(lineOfCodeNode, undefined, undefined)
    }
  }

  class listNode extends abstractTopLevelNode {
    createParser() {
      return new jtree.TreeNode.Parser(undefined, Object.assign(Object.assign({}, super.createParser()._getFirstWordMap()), { "-": dashNode }), undefined)
    }
  }

  class dashNode extends jtree.GrammarBackedNode {
    get dashCell() {
      return this.getWord(0)
    }
    get textCell() {
      return this.getWordsFrom(1)
    }
  }

  window.dumbdownNode = dumbdownNode
}
