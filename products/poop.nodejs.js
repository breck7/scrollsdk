#! /usr/bin/env node
{
  const { Utils } = require("./Utils.js")
  const { TreeNode } = require("./TreeNode.js")
  const { HandGrammarProgram } = require("./GrammarLanguage.js")
  const { GrammarBackedNode } = require("./GrammarLanguage.js")

  class poopParser extends GrammarBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        this._getBlobParserCatchAllParser(),
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), { "🌄": dayParser }),
        [
          { regex: /💩/, parser: bowelParser },
          { regex: /✨/, parser: bladderParser },
          { regex: /🍼/, parser: bottleParser },
          { regex: /😴/, parser: sleep4Parser },
          { regex: /😀/, parser: awakeParser },
          { regex: /❤️/, parser: memoryParser }
        ]
      )
    }
    compile() {
      let day = ""
      let lastTime = ""
      const rows = this.topDownArray
        .map(node => {
          if (node.doesExtend("dayParser")) {
            day = node.getDay()
            return undefined
          }
          lastTime = !node.getTime || node.getTime() === undefined ? lastTime : node.getTime()
          return node.compile(day, lastTime)
        })
        .filter(identity => identity)
      return `date,time,event,notes\n` + rows.join("\n")
    }
    static cachedHandGrammarProgramRoot = new HandGrammarProgram(`// Cell parsers
dateIntCell
 highlightScope constant.numeric.integer
monthIntCell
 extends dateIntCell
intCell
 regex \\d+
yearIntCell
 extends dateIntCell
dayIntCell
 extends dateIntCell
timeIntCell
 highlightScope constant.numeric.integer
 extends intCell
anyCell
symbolCell
memoryDescriptionCell
 highlightScope string
eventTypeCell
 enum 💩 ✨ 🍼 😴 😀 ❤️

// Line parsers
poopParser
 description POOP is the Programming Option for Overtired Parents. It is a Tree Language for sleep deprived parents to log their child's bathroom, feeding, and sleep events and compile them to CSV. You can use POOP with computers or pen and paper. Each line records an event, a time, and optionally notes. POOP is an anyfix language. You can put the time first or the event type first. You can write the actual symbols, or, if it is 3am, you can just use some of the natural medium to record the event type.
 root
 tags nonPrefixGrammar
 compilesTo csv
 javascript
  compile() {
   let day = ""
   let lastTime = ""
   const rows = this.topDownArray
    .map(node => {
     if (node.doesExtend("dayParser")) {
      day = node.getDay()
      return undefined
     }
     lastTime = !node.getTime || node.getTime() === undefined ? lastTime : node.getTime()
     return node.compile(day, lastTime)
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
 cellParser omnifix
 cells eventTypeCell
 catchAllCellType timeIntCell
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
 crux 💩
 pattern 💩
 extends abstractEventParser
 description Bowel movement.
 string eventType bowelMovement
bladderParser
 crux ✨
 pattern ✨
 description Bladder movement.
 extends abstractEventParser
 string eventType bladderMovement
bottleParser
 crux 🍼
 pattern 🍼
 extends abstractEventParser
 description Feeding.
 string eventType feeding
sleep4Parser
 crux 😴
 pattern 😴
 description Sleep.
 extends abstractEventParser
 string eventType asleep
awakeParser
 crux 😀
 pattern 😀
 description I'm awake!
 extends abstractEventParser
 string eventType awoke
memoryParser
 crux ❤️
 pattern ❤️
 cells eventTypeCell
 catchAllCellType memoryDescriptionCell
 description Special memory.
 extends abstractEventParser
 string eventType memory
 javascript
  getNotes() {
   return Utils.removeNonAscii(this.getLine()).trim()
  }
dayParser
 crux 🌄
 description We survived another day!
 cells symbolCell monthIntCell dayIntCell yearIntCell
 javascript
  getDay() {
   return Utils.removeNonAscii(this.getLine())
    .trim()
    .replace(/ /g, "/")
  }`)
    get handGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static rootParser = poopParser
  }

  class abstractEventParser extends GrammarBackedNode {
    get eventTypeCell() {
      return this.getWord(0)
    }
    get timeIntCell() {
      return this.getWordsFrom(1).map(val => parseInt(val))
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
    get eventTypeCell() {
      return this.getWord(0)
    }
    get memoryDescriptionCell() {
      return this.getWordsFrom(1)
    }
    get eventType() {
      return `memory`
    }
    getNotes() {
      return Utils.removeNonAscii(this.getLine()).trim()
    }
  }

  class dayParser extends GrammarBackedNode {
    get symbolCell() {
      return this.getWord(0)
    }
    get monthIntCell() {
      return this.getWord(1)
    }
    get dayIntCell() {
      return this.getWord(2)
    }
    get yearIntCell() {
      return this.getWord(3)
    }
    getDay() {
      return Utils.removeNonAscii(this.getLine())
        .trim()
        .replace(/ /g, "/")
    }
  }

  module.exports = poopParser
  poopParser

  if (!module.parent) new poopParser(TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
