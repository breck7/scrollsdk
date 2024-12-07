{
  class jibberishParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        errorParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), {
          extendsAbstract: extendsAbstractParser,
          hue: hueParser,
          saturation: saturationParser,
          constrast: constrastParser,
          "html.h1": h1Parser,
          add: addParser,
          "+": plusParser,
          block: blockParser,
          scoreBlock: scoreBlockParser,
          to: toParser,
          foo: fooParser,
          xColumnName: xColumnNameParser,
          lightbulbState: lightbulbStateParser,
          nested: nestedParser,
          particleWithConsts: particleWithConstsParser,
          particleExpandsConsts: particleExpandsConstsParser,
          someCode: someCodeParser,
          type: typeParser,
          text: textParser
        }),
        undefined
      )
    }
    execute() {
      return 42
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// Atom Parsers
anyAtom
columnNameEnumAtom
columnNameAtom
errorAtom
 paint invalid
integerAtom
 paint constant.numeric
onoffAtom
 enum on off
atomAtom
cueAtom
topLevelPropertyAtom
 paint constant.language
 extends cueAtom
opSymbolAtom
 paint keyword.operator.arithmetic

// Line Parsers
jibberishParser
 root
 description A useless Language built for testing Particles code.
 javascript
  execute() {
   return 42
  }
 catchAllParser errorParser
 inScope abstractTopLevelParser textParser abstractBaseClassParser
abstractBaseClassParser
extendsAbstractParser
 atoms topLevelPropertyAtom integerAtom
 extends abstractBaseClassParser
 cue extendsAbstract
abstractTopLevelParser
 atoms topLevelPropertyAtom
abstractColorPropertiesParser
 atoms topLevelPropertyAtom integerAtom
 extends abstractTopLevelParser
hueParser
 extends abstractColorPropertiesParser
 cue hue
saturationParser
 extends abstractColorPropertiesParser
 cue saturation
constrastParser
 extends abstractColorPropertiesParser
 cue constrast
abstractHtmlParser
 inScope contentParser
 extends abstractTopLevelParser
h1Parser
 cue html.h1
 extends abstractHtmlParser
addParser
 extends abstractTopLevelParser
 cue add
plusParser
 cue +
 extends addParser
 example Adding two numbers:
  + 1 2
 catchAllAtomType integerAtom
 atoms opSymbolAtom
blockParser
 inScope abstractTopLevelParser scoreBlockParser
 extends abstractTopLevelParser
 cue block
scoreBlockParser
 description Test that inscope extends and does not overwrite.
 extends blockParser
 inScope scoresParser
 cue scoreBlock
toParser
 atoms topLevelPropertyAtom atomAtom
 compiler
  stringTemplate to {atom}
  closeSubparticles end
 extends blockParser
 cue to
fooParser
 extends abstractTopLevelParser
 cue foo
xColumnNameParser
 description The name of the column to use for the x axis
 atoms topLevelPropertyAtom columnNameEnumAtom
 tags doNotSynthesize
 javascript
  getRunTimeEnumOptions(atom) {
   return atom.atomTypeId === "columnNameEnumAtom" ? ["gender", "height", "weight"] : undefined
  }
 extends abstractTopLevelParser
 cue xColumnName
lightbulbStateParser
 atoms topLevelPropertyAtom onoffAtom
 extends abstractTopLevelParser
 cue lightbulbState
nestedParser
 extends abstractTopLevelParser
 cue nested
particleWithConstsParser
 string greeting hello world
 string singleAtom hello
 string thisHasQuotes "'\`
 string longText
  hello
  world
 int score1 28
 int anArray 2 3 4
 float score2 3.01
 boolean win true
 extends abstractTopLevelParser
 cue particleWithConsts
particleExpandsConstsParser
 string greeting hola
 extends particleWithConstsParser
 cue particleExpandsConsts
someCodeParser
 catchAllParser lineOfCodeParser
 extends abstractTopLevelParser
 cue someCode
typeParser
 atoms topLevelPropertyAtom atomAtom
 single
 extends abstractTopLevelParser
 cue type
contentParser
 baseParser blobParser
 cue content
errorParser
 catchAllAtomType errorAtom
 baseParser errorParser
 atoms errorAtom
lineOfCodeParser
 catchAllAtomType atomAtom
textParser
 baseParser blobParser
 cue text
scoresParser
 catchAllAtomType integerAtom
 atoms topLevelPropertyAtom
 cue scores`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = jibberishParser
  }

  class abstractBaseClassParser extends ParserBackedParticle {}

  class extendsAbstractParser extends abstractBaseClassParser {
    get topLevelPropertyAtom() {
      return this.getAtom(0)
    }
    get integerAtom() {
      return parseInt(this.getAtom(1))
    }
  }

  class abstractTopLevelParser extends ParserBackedParticle {
    get topLevelPropertyAtom() {
      return this.getAtom(0)
    }
  }

  class abstractColorPropertiesParser extends abstractTopLevelParser {
    get topLevelPropertyAtom() {
      return this.getAtom(0)
    }
    get integerAtom() {
      return parseInt(this.getAtom(1))
    }
  }

  class hueParser extends abstractColorPropertiesParser {}

  class saturationParser extends abstractColorPropertiesParser {}

  class constrastParser extends abstractColorPropertiesParser {}

  class abstractHtmlParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { content: contentParser }), undefined)
    }
  }

  class h1Parser extends abstractHtmlParser {}

  class addParser extends abstractTopLevelParser {}

  class plusParser extends addParser {
    get opSymbolAtom() {
      return this.getAtom(0)
    }
    get integerAtom() {
      return this.getAtomsFrom(1).map(val => parseInt(val))
    }
  }

  class blockParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), {
          hue: hueParser,
          saturation: saturationParser,
          constrast: constrastParser,
          "html.h1": h1Parser,
          add: addParser,
          "+": plusParser,
          block: blockParser,
          scoreBlock: scoreBlockParser,
          to: toParser,
          foo: fooParser,
          xColumnName: xColumnNameParser,
          lightbulbState: lightbulbStateParser,
          nested: nestedParser,
          particleWithConsts: particleWithConstsParser,
          particleExpandsConsts: particleExpandsConstsParser,
          someCode: someCodeParser,
          type: typeParser
        }),
        undefined
      )
    }
  }

  class scoreBlockParser extends blockParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { scores: scoresParser }), undefined)
    }
  }

  class toParser extends blockParser {
    get topLevelPropertyAtom() {
      return this.getAtom(0)
    }
    get atomAtom() {
      return this.getAtom(1)
    }
  }

  class fooParser extends abstractTopLevelParser {}

  class xColumnNameParser extends abstractTopLevelParser {
    get topLevelPropertyAtom() {
      return this.getAtom(0)
    }
    get columnNameEnumAtom() {
      return this.getAtom(1)
    }
    getRunTimeEnumOptions(atom) {
      return atom.atomTypeId === "columnNameEnumAtom" ? ["gender", "height", "weight"] : undefined
    }
  }

  class lightbulbStateParser extends abstractTopLevelParser {
    get topLevelPropertyAtom() {
      return this.getAtom(0)
    }
    get onoffAtom() {
      return this.getAtom(1)
    }
  }

  class nestedParser extends abstractTopLevelParser {}

  class particleWithConstsParser extends abstractTopLevelParser {
    get win() {
      return true
    }
    get score2() {
      return 3.01
    }
    get anArray() {
      return [2, 3, 4]
    }
    get score1() {
      return 28
    }
    get longText() {
      return `hello
world`
    }
    get thisHasQuotes() {
      return `"'\``
    }
    get singleAtom() {
      return `hello`
    }
    get greeting() {
      return `hello world`
    }
  }

  class particleExpandsConstsParser extends particleWithConstsParser {
    get greeting() {
      return `hola`
    }
  }

  class someCodeParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(lineOfCodeParser, undefined, undefined)
    }
  }

  class typeParser extends abstractTopLevelParser {
    get topLevelPropertyAtom() {
      return this.getAtom(0)
    }
    get atomAtom() {
      return this.getAtom(1)
    }
  }

  class contentParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(this._getBlobParserCatchAllParser())
    }
    getErrors() {
      return []
    }
  }

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
    get errorAtom() {
      return this.getAtom(0)
    }
    get errorAtom() {
      return this.getAtomsFrom(1)
    }
  }

  class lineOfCodeParser extends ParserBackedParticle {
    get atomAtom() {
      return this.getAtomsFrom(0)
    }
  }

  class textParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(this._getBlobParserCatchAllParser())
    }
    getErrors() {
      return []
    }
  }

  class scoresParser extends ParserBackedParticle {
    get topLevelPropertyAtom() {
      return this.getAtom(0)
    }
    get integerAtom() {
      return this.getAtomsFrom(1).map(val => parseInt(val))
    }
  }

  window.jibberishParser = jibberishParser
}
