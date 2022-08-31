#! /usr/bin/env node
{
  const { jtree } = require("../index.js")

  class errorNode extends jtree.GrammarBackedNode {
    getErrors() {
      return this._getErrorNodeErrors()
    }
  }

  class dumbdownNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        quickParagraphNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          link: linkNode,
          paragraph: paragraphNode,
          code: codeNode,
          list: listNode,
          title: titleNode,
          title2: title2Node,
          title3: title3Node,
          title4: title4Node,
          title5: title5Node,
          title6: title6Node
        }),
        [{ regex: /^$/, nodeConstructor: blankLineNode }]
      )
    }
    static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(`tooling onsave jtree build produceLang dumbdown
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
errorNode
 baseNodeType errorNode
dumbdownNode
 extensions dd dumbdown
 description A Tree Language that compiles to HTML. An alternative to Markdown.
 root
 inScope abstractTopLevelNode blankLineNode
 catchAllNodeType quickParagraphNode
 compilesTo html
 example
  title Hello world
  title2 This is Dumbdown
  
  paragraph
   It compiles to HTML. Blank lines get turned into brs.
  link https://treenotation.org Dumbdown is a Tree Language.
  list
   - It has lists
   - Too!
  code
   // You can add code as well.
   print("Hello world")
abstractTopLevelNode
 cells keywordCell
linkNode
 cells keywordCell urlCell
 catchAllCellType textCell
 extends abstractTopLevelNode
 compiler
  stringTemplate <a href="{urlCell}">{textCell}</a>
 crux link
paragraphNode
 catchAllNodeType paragraphContentNode
 extends abstractTopLevelNode
 crux paragraph
 compiler
  openChildren <p>
  closeChildren </p>
  stringTemplate 
paragraphContentNode
 inScope paragraphContentNode
 catchAllCellType textCell
 compiler
  stringTemplate {textCell}
codeNode
 description A code block.
 catchAllNodeType lineOfCodeNode
 extends abstractTopLevelNode
 javascript
  compile() {
   return \`<code>\${this.getIndentation() + this.childrenToString()}</code>\`
  }
 crux code
listNode
 inScope dashNode
 extends abstractTopLevelNode
 compiler
  stringTemplate 
  openChildren <ul>
  closeChildren </ul>
 crux list
blankLineNode
 description Blank lines compile to nothing in the HTML.
 cells blankCell
 compiler
  stringTemplate 
 pattern ^$
 tags doNotSynthesize
lineOfCodeNode
 catchAllCellType codeCell
 catchAllNodeType lineOfCodeNode
dashNode
 crux -
 catchAllCellType textCell
 compiler
  stringTemplate <li>{textCell}</li>
 cells dashCell
titleNode
 catchAllCellType textCell
 extends abstractTopLevelNode
 compiler
  stringTemplate 
 crux title
 javascript
  compile(spaces) {
   const title = this.getContent()
   const permalink = jtree.Utils.stringToPermalink(this.getContent())
   return \`<h1 id="\${permalink}"><a href="#\${permalink}">\${title}</a></h1>\`
  }
title2Node
 catchAllCellType textCell
 extends abstractTopLevelNode
 compiler
  stringTemplate <h2>{textCell}</h2>
 crux title2
title3Node
 extends title2Node
 compiler
  stringTemplate <h3>{textCell}</h3>
 crux title3
title4Node
 extends title2Node
 compiler
  stringTemplate <h4>{textCell}</h4>
 crux title4
title5Node
 extends title2Node
 compiler
  stringTemplate <h5>{textCell}</h5>
 crux title5
title6Node
 extends title2Node
 compiler
  stringTemplate <h6>{textCell}</h6>
 crux title6
quickParagraphNode
 catchAllCellType textCell
 compiler
  stringTemplate <p>{textCell}</p>`)
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        errorNode: errorNode,
        dumbdownNode: dumbdownNode,
        abstractTopLevelNode: abstractTopLevelNode,
        linkNode: linkNode,
        paragraphNode: paragraphNode,
        paragraphContentNode: paragraphContentNode,
        codeNode: codeNode,
        listNode: listNode,
        blankLineNode: blankLineNode,
        lineOfCodeNode: lineOfCodeNode,
        dashNode: dashNode,
        titleNode: titleNode,
        title2Node: title2Node,
        title3Node: title3Node,
        title4Node: title4Node,
        title5Node: title5Node,
        title6Node: title6Node,
        quickParagraphNode: quickParagraphNode
      }
    }
  }

  class abstractTopLevelNode extends jtree.GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
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
      return new jtree.TreeNode.Parser(paragraphContentNode, undefined, undefined)
    }
  }

  class paragraphContentNode extends jtree.GrammarBackedNode {
    get textCell() {
      return this.getWordsFrom(0)
    }
  }

  class codeNode extends abstractTopLevelNode {
    createParser() {
      return new jtree.TreeNode.Parser(lineOfCodeNode, undefined, undefined)
    }
    compile() {
      return `<code>${this.getIndentation() + this.childrenToString()}</code>`
    }
  }

  class listNode extends abstractTopLevelNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { "-": dashNode }),
        undefined
      )
    }
  }

  class blankLineNode extends jtree.GrammarBackedNode {
    get blankCell() {
      return this.getWord(0)
    }
  }

  class lineOfCodeNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(lineOfCodeNode, undefined, undefined)
    }
    get codeCell() {
      return this.getWordsFrom(0)
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

  class titleNode extends abstractTopLevelNode {
    get textCell() {
      return this.getWordsFrom(0)
    }
    compile(spaces) {
      const title = this.getContent()
      const permalink = jtree.Utils.stringToPermalink(this.getContent())
      return `<h1 id="${permalink}"><a href="#${permalink}">${title}</a></h1>`
    }
  }

  class title2Node extends abstractTopLevelNode {
    get textCell() {
      return this.getWordsFrom(0)
    }
  }

  class title3Node extends title2Node {}

  class title4Node extends title2Node {}

  class title5Node extends title2Node {}

  class title6Node extends title2Node {}

  class quickParagraphNode extends jtree.GrammarBackedNode {
    get textCell() {
      return this.getWordsFrom(0)
    }
  }

  module.exports = dumbdownNode
  dumbdownNode

  if (!module.parent) new dumbdownNode(jtree.TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
