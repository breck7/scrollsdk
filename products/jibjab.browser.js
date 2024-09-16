{
  class jibberishParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        errorParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstAtomMapAsObject()), {
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
          comment: commentParser,
          text: textParser
        }),
        undefined
      )
    }
    execute() {
      return 42
    }
  }

  class jibjabParser extends jibberishParser {
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// Atom Parsers
anyAtom
columnNameEnumAtom
columnNameAtom
errorAtom
 paint invalid
intAtom
 paint constant.numeric
onoffAtom
 enum on off
wordAtom
topLevelPropertyAtom
 paint constant.language
opSymbolAtom
 paint keyword.operator.arithmetic
commentAtom
 paint comment

// Line Parsers
jibberishParser
 root
 description A useless Language built for testing Particles code.
 javascript
  execute() {
   return 42
  }
 compilesTo txt
 catchAllParser errorParser
 inScope abstractTopLevelParser textParser abstractBaseClassParser
jibjabParser
 root
 description Adds a comment particle to Jibberish
 extends jibberishParser
abstractBaseClassParser
extendsAbstractParser
 atoms topLevelPropertyAtom intAtom
 extends abstractBaseClassParser
 crux extendsAbstract
abstractTopLevelParser
 atoms topLevelPropertyAtom
abstractColorPropertiesParser
 atoms topLevelPropertyAtom intAtom
 extends abstractTopLevelParser
hueParser
 extends abstractColorPropertiesParser
 crux hue
saturationParser
 extends abstractColorPropertiesParser
 crux saturation
constrastParser
 extends abstractColorPropertiesParser
 crux constrast
abstractHtmlParser
 inScope contentParser
 extends abstractTopLevelParser
h1Parser
 crux html.h1
 extends abstractHtmlParser
addParser
 extends abstractTopLevelParser
 crux add
plusParser
 crux +
 extends addParser
 example Adding two numbers:
  + 1 2
 catchAllAtomType intAtom
 atoms opSymbolAtom
blockParser
 inScope abstractTopLevelParser scoreBlockParser
 extends abstractTopLevelParser
 crux block
scoreBlockParser
 description Test that inscope extends and does not overwrite.
 extends blockParser
 inScope scoresParser
 crux scoreBlock
toParser
 atoms topLevelPropertyAtom wordAtom
 compiler
  stringTemplate to {word}
  closeSubparticles end
 extends blockParser
 crux to
fooParser
 extends abstractTopLevelParser
 crux foo
xColumnNameParser
 description The name of the column to use for the x axis
 atoms topLevelPropertyAtom columnNameEnumAtom
 tags doNotSynthesize
 javascript
  getRunTimeEnumOptions(atom) {
   return atom.atomTypeId === "columnNameEnumAtom" ? ["gender", "height", "weight"] : undefined
  }
 extends abstractTopLevelParser
 crux xColumnName
lightbulbStateParser
 atoms topLevelPropertyAtom onoffAtom
 extends abstractTopLevelParser
 crux lightbulbState
nestedParser
 extends abstractTopLevelParser
 crux nested
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
 crux particleWithConsts
particleExpandsConstsParser
 string greeting hola
 extends particleWithConstsParser
 crux particleExpandsConsts
someCodeParser
 catchAllParser lineOfCodeParser
 extends abstractTopLevelParser
 crux someCode
typeParser
 atoms topLevelPropertyAtom wordAtom
 single
 extends abstractTopLevelParser
 crux type
commentParser
 extends abstractTopLevelParser
 catchAllAtomType commentAtom
 catchAllParser commentParser
 crux comment
contentParser
 baseParser blobParser
 crux content
errorParser
 catchAllAtomType errorAtom
 baseParser errorParser
 atoms errorAtom
lineOfCodeParser
 catchAllAtomType wordAtom
textParser
 baseParser blobParser
 crux text
scoresParser
 catchAllAtomType intAtom
 atoms topLevelPropertyAtom
 crux scores`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = jibjabParser
  }

  class abstractBaseClassParser extends ParserBackedParticle {}

  class extendsAbstractParser extends abstractBaseClassParser {
    get topLevelPropertyAtom() {
      return this.getAtom(0)
    }
    get intAtom() {
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
    get intAtom() {
      return parseInt(this.getAtom(1))
    }
  }

  class hueParser extends abstractColorPropertiesParser {}

  class saturationParser extends abstractColorPropertiesParser {}

  class constrastParser extends abstractColorPropertiesParser {}

  class abstractHtmlParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstAtomMapAsObject()), { content: contentParser }), undefined)
    }
  }

  class h1Parser extends abstractHtmlParser {}

  class addParser extends abstractTopLevelParser {}

  class plusParser extends addParser {
    get opSymbolAtom() {
      return this.getAtom(0)
    }
    get intAtom() {
      return this.getAtomsFrom(1).map(val => parseInt(val))
    }
  }

  class blockParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstAtomMapAsObject()), {
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
          comment: commentParser
        }),
        undefined
      )
    }
  }

  class scoreBlockParser extends blockParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstAtomMapAsObject()), { scores: scoresParser }), undefined)
    }
  }

  class toParser extends blockParser {
    get topLevelPropertyAtom() {
      return this.getAtom(0)
    }
    get wordAtom() {
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
    get wordAtom() {
      return this.getAtom(1)
    }
  }

  class commentParser extends abstractTopLevelParser {
    createParserCombinator() {
      return new Particle.ParserCombinator(commentParser, undefined, undefined)
    }
    get commentAtom() {
      return this.getAtomsFrom(0)
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
    get wordAtom() {
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
    get intAtom() {
      return this.getAtomsFrom(1).map(val => parseInt(val))
    }
  }

  window.jibjabParser = jibjabParser
}
