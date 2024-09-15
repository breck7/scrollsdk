#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { Particle } = require("./Particle.js")
  const { HandParsersProgram } = require("./Parsers.js")
  const { ParserBackedParticle } = require("./Parsers.js")

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  class dumbdownParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
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
          title6: title6Parser
        }),
        [{ regex: /^$/, parser: blankLineParser }]
      )
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// Atom Parsers
anyAtom
blankAtom
dashAtom
 paint constant.language
codeAtom
 paint comment
keywordAtom
 paint keyword
textAtom
 paint string
urlAtom
 paint constant.language

// Line Parsers
errorParser
 baseParser errorParser
dumbdownParser
 extensions dd dumbdown
 description A Language that compiles to HTML. An alternative to Markdown.
 root
 inScope abstractTopLevelParser blankLineParser
 catchAllParser quickParagraphParser
 compilesTo html
 example
  title Hello world
  title2 This is Dumbdown
  
  paragraph
   It compiles to HTML. Blank lines get turned into brs.
  link https://particles.scroll.pub Dumbdown is a Language.
  list
   - It has lists
   - Too!
  code
   // You can add code as well.
   print("Hello world")
abstractTopLevelParser
 atoms keywordAtom
linkParser
 atoms keywordAtom urlAtom
 catchAllAtomType textAtom
 extends abstractTopLevelParser
 compiler
  stringTemplate <a href="{urlAtom}">{textAtom}</a>
 crux link
paragraphParser
 catchAllParser paragraphContentParser
 extends abstractTopLevelParser
 crux paragraph
 compiler
  openSubparticles <p>
  closeSubparticles </p>
  stringTemplate 
paragraphContentParser
 inScope paragraphContentParser
 catchAllAtomType textAtom
 compiler
  stringTemplate {textAtom}
codeParser
 description A code block.
 catchAllParser lineOfCodeParser
 extends abstractTopLevelParser
 javascript
  compile() {
   return \`<code>\${this.indentation + this.subparticlesToString()}</code>\`
  }
 crux code
listParser
 inScope dashParser
 extends abstractTopLevelParser
 compiler
  stringTemplate 
  openSubparticles <ul>
  closeSubparticles </ul>
 crux list
blankLineParser
 description Blank lines compile to nothing in the HTML.
 atoms blankAtom
 compiler
  stringTemplate 
 pattern ^$
 tags doNotSynthesize
lineOfCodeParser
 catchAllAtomType codeAtom
 catchAllParser lineOfCodeParser
dashParser
 crux -
 catchAllAtomType textAtom
 compiler
  stringTemplate <li>{textAtom}</li>
 atoms dashAtom
titleParser
 catchAllAtomType textAtom
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
 catchAllAtomType textAtom
 extends abstractTopLevelParser
 compiler
  stringTemplate <h2>{textAtom}</h2>
 crux title2
title3Parser
 extends title2Parser
 compiler
  stringTemplate <h3>{textAtom}</h3>
 crux title3
title4Parser
 extends title2Parser
 compiler
  stringTemplate <h4>{textAtom}</h4>
 crux title4
title5Parser
 extends title2Parser
 compiler
  stringTemplate <h5>{textAtom}</h5>
 crux title5
title6Parser
 extends title2Parser
 compiler
  stringTemplate <h6>{textAtom}</h6>
 crux title6
quickParagraphParser
 catchAllAtomType textAtom
 compiler
  stringTemplate <p>{textAtom}</p>`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = dumbdownParser
  }

  class abstractTopLevelParser extends ParserBackedParticle {
    get keywordAtom() {
      return this.getWord(0)
    }
  }

  class linkParser extends abstractTopLevelParser {
    get keywordAtom() {
      return this.getWord(0)
    }
    get urlAtom() {
      return this.getWord(1)
    }
    get textAtom() {
      return this.getWordsFrom(2)
    }
  }

  class paragraphParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(paragraphContentParser, undefined, undefined)
    }
  }

  class paragraphContentParser extends ParserBackedParticle {
    get textAtom() {
      return this.getWordsFrom(0)
    }
  }

  class codeParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(lineOfCodeParser, undefined, undefined)
    }
    compile() {
      return `<code>${this.indentation + this.subparticlesToString()}</code>`
    }
  }

  class listParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { "-": dashParser }), undefined)
    }
  }

  class blankLineParser extends ParserBackedParticle {
    get blankAtom() {
      return this.getWord(0)
    }
  }

  class lineOfCodeParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(lineOfCodeParser, undefined, undefined)
    }
    get codeAtom() {
      return this.getWordsFrom(0)
    }
  }

  class dashParser extends ParserBackedParticle {
    get dashAtom() {
      return this.getWord(0)
    }
    get textAtom() {
      return this.getWordsFrom(1)
    }
  }

  class titleParser extends abstractTopLevelParser {
    get textAtom() {
      return this.getWordsFrom(0)
    }
    compile(spaces) {
      const title = this.content
      const permalink = Utils.stringToPermalink(this.content)
      return `<h1 id="${permalink}"><a href="#${permalink}">${title}</a></h1>`
    }
  }

  class title2Parser extends abstractTopLevelParser {
    get textAtom() {
      return this.getWordsFrom(0)
    }
  }

  class title3Parser extends title2Parser {}

  class title4Parser extends title2Parser {}

  class title5Parser extends title2Parser {}

  class title6Parser extends title2Parser {}

  class quickParagraphParser extends ParserBackedParticle {
    get textAtom() {
      return this.getWordsFrom(0)
    }
  }

  module.exports = dumbdownParser
  dumbdownParser

  if (!module.parent) new dumbdownParser(Particle.fromDisk(process.argv[2]).toString()).execute()
}
