{
  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  class dumbdownParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        quickParagraphParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), {
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
cueAtom
 paint keyword
textAtom
 paint string
urlAtom
 paint constant.language

// Line Parsers
errorParser
 baseParser errorParser
dumbdownParser
 description A Language that compiles to HTML. An alternative to Markdown.
 root
 inScope abstractTopLevelParser blankLineParser
 catchAllParser quickParagraphParser
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
 atoms cueAtom
linkParser abstractTopLevelParser
 atoms cueAtom urlAtom
 catchAllAtomType textAtom
 compiler
  stringTemplate <a href="{urlAtom}">{textAtom}</a>
 cue link
paragraphParser abstractTopLevelParser
 catchAllParser paragraphContentParser
 cue paragraph
 compiler
  openSubparticles <p>
  closeSubparticles </p>
  stringTemplate 
paragraphContentParser
 inScope paragraphContentParser
 catchAllAtomType textAtom
 compiler
  stringTemplate {textAtom}
codeParser abstractTopLevelParser
 description A code block.
 catchAllParser lineOfCodeParser
 javascript
  compile() {
   return \`<code>\${this.indentation + this.subparticlesToString()}</code>\`
  }
 cue code
listParser abstractTopLevelParser
 inScope dashParser
 compiler
  stringTemplate 
  openSubparticles <ul>
  closeSubparticles </ul>
 cue list
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
 cue -
 catchAllAtomType textAtom
 compiler
  stringTemplate <li>{textAtom}</li>
 atoms dashAtom
titleParser abstractTopLevelParser
 catchAllAtomType textAtom
 compiler
  stringTemplate 
 cue title
 javascript
  compile(spaces) {
   const title = this.content
   const permalink = Utils.stringToPermalink(this.content)
   return \`<h1 id="\${permalink}"><a href="#\${permalink}">\${title}</a></h1>\`
  }
title2Parser abstractTopLevelParser
 catchAllAtomType textAtom
 compiler
  stringTemplate <h2>{textAtom}</h2>
 cue title2
title3Parser title2Parser
 compiler
  stringTemplate <h3>{textAtom}</h3>
 cue title3
title4Parser title2Parser
 compiler
  stringTemplate <h4>{textAtom}</h4>
 cue title4
title5Parser title2Parser
 compiler
  stringTemplate <h5>{textAtom}</h5>
 cue title5
title6Parser title2Parser
 compiler
  stringTemplate <h6>{textAtom}</h6>
 cue title6
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
    get cueAtom() {
      return this.getAtom(0)
    }
  }

  class linkParser extends abstractTopLevelParser {
    get cueAtom() {
      return this.getAtom(0)
    }
    get urlAtom() {
      return this.getAtom(1)
    }
    get textAtom() {
      return this.getAtomsFrom(2)
    }
  }

  class paragraphParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(paragraphContentParser, undefined, undefined)
    }
  }

  class paragraphContentParser extends ParserBackedParticle {
    get textAtom() {
      return this.getAtomsFrom(0)
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
      return new Particle.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { "-": dashParser }), undefined)
    }
  }

  class blankLineParser extends ParserBackedParticle {
    get blankAtom() {
      return this.getAtom(0)
    }
  }

  class lineOfCodeParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(lineOfCodeParser, undefined, undefined)
    }
    get codeAtom() {
      return this.getAtomsFrom(0)
    }
  }

  class dashParser extends ParserBackedParticle {
    get dashAtom() {
      return this.getAtom(0)
    }
    get textAtom() {
      return this.getAtomsFrom(1)
    }
  }

  class titleParser extends abstractTopLevelParser {
    get textAtom() {
      return this.getAtomsFrom(0)
    }
    compile(spaces) {
      const title = this.content
      const permalink = Utils.stringToPermalink(this.content)
      return `<h1 id="${permalink}"><a href="#${permalink}">${title}</a></h1>`
    }
  }

  class title2Parser extends abstractTopLevelParser {
    get textAtom() {
      return this.getAtomsFrom(0)
    }
  }

  class title3Parser extends title2Parser {}

  class title4Parser extends title2Parser {}

  class title5Parser extends title2Parser {}

  class title6Parser extends title2Parser {}

  class quickParagraphParser extends ParserBackedParticle {
    get textAtom() {
      return this.getAtomsFrom(0)
    }
  }

  window.dumbdownParser = dumbdownParser
}
