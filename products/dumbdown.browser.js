{
  class errorParser extends GrammarBackedNode {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  class dumbdownParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        quickParagraphParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {
          link: linkParser,
          paragraph: paragraphParser,
          code: codeParser,
          list: listParser,
          title: titleParser,
          title2: title2Parser,
          title3: title3Parser,
          title4: title4Parser,
          title5: title5Parser,
          title6: title6Parser,
        }),
        [{ regex: /^$/, parser: blankLineParser }]
      )
    }
    static cachedHandGrammarProgramRoot = new HandGrammarProgram(`// Cell Parsers
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

// Line Parsers
errorParser
 baseParser errorParser
dumbdownParser
 extensions dd dumbdown
 description A Tree Language that compiles to HTML. An alternative to Markdown.
 root
 inScope abstractTopLevelParser blankLineParser
 catchAllParser quickParagraphParser
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
abstractTopLevelParser
 cells keywordCell
linkParser
 cells keywordCell urlCell
 catchAllCellType textCell
 extends abstractTopLevelParser
 compiler
  stringTemplate <a href="{urlCell}">{textCell}</a>
 crux link
paragraphParser
 catchAllParser paragraphContentParser
 extends abstractTopLevelParser
 crux paragraph
 compiler
  openChildren <p>
  closeChildren </p>
  stringTemplate 
paragraphContentParser
 inScope paragraphContentParser
 catchAllCellType textCell
 compiler
  stringTemplate {textCell}
codeParser
 description A code block.
 catchAllParser lineOfCodeParser
 extends abstractTopLevelParser
 javascript
  compile() {
   return \`<code>\${this.indentation + this.childrenToString()}</code>\`
  }
 crux code
listParser
 inScope dashParser
 extends abstractTopLevelParser
 compiler
  stringTemplate 
  openChildren <ul>
  closeChildren </ul>
 crux list
blankLineParser
 description Blank lines compile to nothing in the HTML.
 cells blankCell
 compiler
  stringTemplate 
 pattern ^$
 tags doNotSynthesize
lineOfCodeParser
 catchAllCellType codeCell
 catchAllParser lineOfCodeParser
dashParser
 crux -
 catchAllCellType textCell
 compiler
  stringTemplate <li>{textCell}</li>
 cells dashCell
titleParser
 catchAllCellType textCell
 extends abstractTopLevelParser
 compiler
  stringTemplate 
 crux title
 javascript
  compile(spaces) {
   const title = this.content
   const permalink = Utils.stringToPermalink(this.content)
   return \`<h1 id="\${permalink}"><a href="#\${permalink}">\${title}</a></h1>\`
  }
title2Parser
 catchAllCellType textCell
 extends abstractTopLevelParser
 compiler
  stringTemplate <h2>{textCell}</h2>
 crux title2
title3Parser
 extends title2Parser
 compiler
  stringTemplate <h3>{textCell}</h3>
 crux title3
title4Parser
 extends title2Parser
 compiler
  stringTemplate <h4>{textCell}</h4>
 crux title4
title5Parser
 extends title2Parser
 compiler
  stringTemplate <h5>{textCell}</h5>
 crux title5
title6Parser
 extends title2Parser
 compiler
  stringTemplate <h6>{textCell}</h6>
 crux title6
quickParagraphParser
 catchAllCellType textCell
 compiler
  stringTemplate <p>{textCell}</p>`)
    get handGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static rootParser = dumbdownParser
  }

  class abstractTopLevelParser extends GrammarBackedNode {
    get keywordCell() {
      return this.getWord(0)
    }
  }

  class linkParser extends abstractTopLevelParser {
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

  class paragraphParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(paragraphContentParser, undefined, undefined)
    }
  }

  class paragraphContentParser extends GrammarBackedNode {
    get textCell() {
      return this.getWordsFrom(0)
    }
  }

  class codeParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(lineOfCodeParser, undefined, undefined)
    }
    compile() {
      return `<code>${this.indentation + this.childrenToString()}</code>`
    }
  }

  class listParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { "-": dashParser }),
        undefined
      )
    }
  }

  class blankLineParser extends GrammarBackedNode {
    get blankCell() {
      return this.getWord(0)
    }
  }

  class lineOfCodeParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(lineOfCodeParser, undefined, undefined)
    }
    get codeCell() {
      return this.getWordsFrom(0)
    }
  }

  class dashParser extends GrammarBackedNode {
    get dashCell() {
      return this.getWord(0)
    }
    get textCell() {
      return this.getWordsFrom(1)
    }
  }

  class titleParser extends abstractTopLevelParser {
    get textCell() {
      return this.getWordsFrom(0)
    }
    compile(spaces) {
      const title = this.content
      const permalink = Utils.stringToPermalink(this.content)
      return `<h1 id="${permalink}"><a href="#${permalink}">${title}</a></h1>`
    }
  }

  class title2Parser extends abstractTopLevelParser {
    get textCell() {
      return this.getWordsFrom(0)
    }
  }

  class title3Parser extends title2Parser {}

  class title4Parser extends title2Parser {}

  class title5Parser extends title2Parser {}

  class title6Parser extends title2Parser {}

  class quickParagraphParser extends GrammarBackedNode {
    get textCell() {
      return this.getWordsFrom(0)
    }
  }

  window.dumbdownParser = dumbdownParser
}
