{
  class poopParser extends ParserBackedParticle {
    createParserCombinator() {
      return new Particle.ParserCombinator(this._getBlobParserCatchAllParser(), Object.assign(Object.assign({}, super.createParserCombinator()._getCueMapAsObject()), { "🌄": dayParser }), [
        { regex: /💩/, parser: bowelParser },
        { regex: /✨/, parser: bladderParser },
        { regex: /🍼/, parser: bottleParser },
        { regex: /😴/, parser: sleep4Parser },
        { regex: /😀/, parser: awakeParser },
        { regex: /❤️/, parser: memoryParser }
      ])
    }
    compile() {
      let day = ""
      let lastTime = ""
      const rows = this.topDownArray
        .map(particle => {
          if (particle.doesExtend("dayParser")) {
            day = particle.getDay()
            return undefined
          }
          lastTime = !particle.getTime || particle.getTime() === undefined ? lastTime : particle.getTime()
          return particle.compile(day, lastTime)
        })
        .filter(identity => identity)
      return `date,time,event,notes\n` + rows.join("\n")
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// Atom parsers
dateIntAtom
 paint constant.numeric.integer
monthIntAtom
 extends dateIntAtom
intAtom
 regex \\d+
yearIntAtom
 extends dateIntAtom
dayIntAtom
 extends dateIntAtom
timeIntAtom
 paint constant.numeric.integer
 extends intAtom
anyAtom
symbolAtom
memoryDescriptionAtom
 paint string
eventTypeAtom
 enum 💩 ✨ 🍼 😴 😀 ❤️

// Line parsers
poopParser
 description POOP is the Programming Option for Overtired Parents. It is a Language for sleep deprived parents to log their child's bathroom, feeding, and sleep events and compile them to CSV. You can use POOP with computers or pen and paper. Each line records an event, a time, and optionally notes. POOP is an anyfix language. You can put the time first or the event type first. You can write the actual symbols, or, if it is 3am, you can just use some of the natural medium to record the event type.
 root
 tags nonPrefixParsers
 compilesTo csv
 javascript
  compile() {
   let day = ""
   let lastTime = ""
   const rows = this.topDownArray
    .map(particle => {
     if (particle.doesExtend("dayParser")) {
      day = particle.getDay()
      return undefined
     }
     lastTime = !particle.getTime || particle.getTime() === undefined ? lastTime : particle.getTime()
     return particle.compile(day, lastTime)
    })
    .filter(identity => identity)
   return \`date,time,event,notes\\n\` + rows.join("\\n")
  }
 inScope abstractEventParser dayParser
 example
  🌄 8 29 2019
  😀 4
  ✨ 6
  💩 630
abstractEventParser
 atomParser omnifix
 atoms eventTypeAtom
 catchAllAtomType timeIntAtom
 javascript
  getTime() {
   const time = this.getLine().match(/(\\d+)/)
   return time ? time[1] : undefined
  }
  getNotes() {
   return ""
  }
  compile(day, lastTime) {
   return \`\${day},\${lastTime},\${this.eventType},\${this.getNotes()}\`
  }
bowelParser
 cue 💩
 pattern 💩
 extends abstractEventParser
 description Bowel movement.
 string eventType bowelMovement
bladderParser
 cue ✨
 pattern ✨
 description Bladder movement.
 extends abstractEventParser
 string eventType bladderMovement
bottleParser
 cue 🍼
 pattern 🍼
 extends abstractEventParser
 description Feeding.
 string eventType feeding
sleep4Parser
 cue 😴
 pattern 😴
 description Sleep.
 extends abstractEventParser
 string eventType asleep
awakeParser
 cue 😀
 pattern 😀
 description I'm awake!
 extends abstractEventParser
 string eventType awoke
memoryParser
 cue ❤️
 pattern ❤️
 atoms eventTypeAtom
 catchAllAtomType memoryDescriptionAtom
 description Special memory.
 extends abstractEventParser
 string eventType memory
 javascript
  getNotes() {
   return Utils.removeNonAscii(this.getLine()).trim()
  }
dayParser
 cue 🌄
 description We survived another day!
 atoms symbolAtom monthIntAtom dayIntAtom yearIntAtom
 javascript
  getDay() {
   return Utils.removeNonAscii(this.getLine())
    .trim()
    .replace(/ /g, "/")
  }`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = poopParser
  }

  class abstractEventParser extends ParserBackedParticle {
    get eventTypeAtom() {
      return this.getAtom(0)
    }
    get timeIntAtom() {
      return this.getAtomsFrom(1).map(val => parseInt(val))
    }
    getTime() {
      const time = this.getLine().match(/(\d+)/)
      return time ? time[1] : undefined
    }
    getNotes() {
      return ""
    }
    compile(day, lastTime) {
      return `${day},${lastTime},${this.eventType},${this.getNotes()}`
    }
  }

  class bowelParser extends abstractEventParser {
    get eventType() {
      return `bowelMovement`
    }
  }

  class bladderParser extends abstractEventParser {
    get eventType() {
      return `bladderMovement`
    }
  }

  class bottleParser extends abstractEventParser {
    get eventType() {
      return `feeding`
    }
  }

  class sleep4Parser extends abstractEventParser {
    get eventType() {
      return `asleep`
    }
  }

  class awakeParser extends abstractEventParser {
    get eventType() {
      return `awoke`
    }
  }

  class memoryParser extends abstractEventParser {
    get eventTypeAtom() {
      return this.getAtom(0)
    }
    get memoryDescriptionAtom() {
      return this.getAtomsFrom(1)
    }
    get eventType() {
      return `memory`
    }
    getNotes() {
      return Utils.removeNonAscii(this.getLine()).trim()
    }
  }

  class dayParser extends ParserBackedParticle {
    get symbolAtom() {
      return this.getAtom(0)
    }
    get monthIntAtom() {
      return this.getAtom(1)
    }
    get dayIntAtom() {
      return this.getAtom(2)
    }
    get yearIntAtom() {
      return this.getAtom(3)
    }
    getDay() {
      return Utils.removeNonAscii(this.getLine()).trim().replace(/ /g, "/")
    }
  }

  window.poopParser = poopParser
}
