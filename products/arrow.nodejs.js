#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { Particle } = require("./Particle.js")
  const { HandParsersProgram } = require("./Parsers.js")
  const { ParserBackedParticle } = require("./Parsers.js")

  class commentParser extends ParserBackedParticle {
    get commentAtom() {
      return this.getAtom(0)
    }
    get commentAtom() {
      return this.getAtomsFrom(1)
    }
    get suggestInAutocomplete() {
      return false
    }
  }

  class arrowParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(errorParser, Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { Comment: commentParser, charge: chargeParser }), undefined)
    }
    compile() {
      return this.asJsonSubset
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// Atom parsers
keywordAtom
 enum charge cardNumber amount currency description token
floatAtom
intAtom
anyAtom
cardNumberAtom
 description The credit card number
 paint constant.numeric
 examples 1111222233334444
amountAtom
 description Amount to be charged in the specified currency.
 extends floatAtom
 examples 9.99
 min 0
 max 99999
descriptionAtom
 description Any text can go in the charge description.
 paint string
 extends anyAtom
 examples IceCream
tokenAtom
 description A random token code generated by the hypothetical Arrow Company.
 paint string
 examples sk_test_4eC39H
currencyAtom
 enum usd cad jpy
 paint constant.numeric
commentAtom
 paint comment

// Line parsers
commentParser
 catchAllAtomType commentAtom
 atoms commentAtom
 cue Comment
 boolean suggestInAutocomplete false
arrowParser
 description A demonstration prefix Language showing how in the future Particles will be used for simpler and more intelligent APIs.
 root
 inScope chargeParser commentParser
 catchAllParser errorParser
 javascript
  compile() {
   return this.asJsonSubset
  }
errorParser
 baseParser errorParser
chargeParser
 inScope amountParser currencyParser descriptionParser cardNumberParser tokenParser
 description A credit card charge
 cueFromId
 atoms keywordAtom
 javascript
  async execute() {
   const card = this.get("cardNumber")
   return \`Successfully charged \${this.get("amount")} \${this.get("currency")} to card \${card.substr(card.length - 4, 4)}.\`
  }
abstractChargeAttributeParser
 cueFromId
 required
 single
cardNumberParser
 extends abstractChargeAttributeParser
 atoms keywordAtom cardNumberAtom
amountParser
 extends abstractChargeAttributeParser
 atoms keywordAtom amountAtom
currencyParser
 extends abstractChargeAttributeParser
 atoms keywordAtom currencyAtom
descriptionParser
 extends abstractChargeAttributeParser
 atoms keywordAtom
 catchAllAtomType descriptionAtom
tokenParser
 cueFromId
 atoms keywordAtom tokenAtom`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = arrowParser
  }

  class errorParser extends ParserBackedParticle {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  class chargeParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { cardNumber: cardNumberParser, amount: amountParser, currency: currencyParser, description: descriptionParser, token: tokenParser }),
        undefined
      )
    }
    get keywordAtom() {
      return this.getAtom(0)
    }
    async execute() {
      const card = this.get("cardNumber")
      return `Successfully charged ${this.get("amount")} ${this.get("currency")} to card ${card.substr(card.length - 4, 4)}.`
    }
  }

  class abstractChargeAttributeParser extends ParserBackedParticle {}

  class cardNumberParser extends abstractChargeAttributeParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get cardNumberAtom() {
      return this.getAtom(1)
    }
  }

  class amountParser extends abstractChargeAttributeParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get amountAtom() {
      return parseFloat(this.getAtom(1))
    }
  }

  class currencyParser extends abstractChargeAttributeParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get currencyAtom() {
      return this.getAtom(1)
    }
  }

  class descriptionParser extends abstractChargeAttributeParser {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get descriptionAtom() {
      return this.getAtomsFrom(1)
    }
  }

  class tokenParser extends ParserBackedParticle {
    get keywordAtom() {
      return this.getAtom(0)
    }
    get tokenAtom() {
      return this.getAtom(1)
    }
  }

  module.exports = arrowParser
  arrowParser

  if (!module.parent) new arrowParser(Particle.fromDisk(process.argv[2]).toString()).execute()
}
