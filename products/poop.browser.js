{
  class poopNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        this._getBlobNodeCatchAllNodeType(),
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { "🌄": dayNode }),
        [
          { regex: /💩/, nodeConstructor: bowelNode },
          { regex: /✨/, nodeConstructor: bladderNode },
          { regex: /🍼/, nodeConstructor: bottleNode },
          { regex: /😴/, nodeConstructor: sleep4Node },
          { regex: /😀/, nodeConstructor: awakeNode },
          { regex: /❤️/, nodeConstructor: memoryNode }
        ]
      )
    }
    compile() {
      let day = ""
      let lastTime = ""
      const rows = this.getTopDownArray()
        .map(node => {
          if (node.doesExtend("dayNode")) {
            day = node.getDay()
            return undefined
          }
          lastTime = !node.getTime || node.getTime() === undefined ? lastTime : node.getTime()
          return node.compile(day, lastTime)
        })
        .filter(identity => identity)
      return `date,time,event,notes\n` + rows.join("\n")
    }
    static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(`tooling onsave jtree build produceLang poop
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
poopNode
 description POOP is the Programming Option for Overtired Parents. It is a Tree Language for sleep deprived parents to log their child's bathroom, feeding, and sleep events and compile them to CSV. You can use POOP with computers or pen and paper. Each line records an event, a time, and optionally notes. POOP is an anyfix language. You can put the time first or the event type first. You can write the actual symbols, or, if it is 3am, you can just use some of the natural medium to record the event type.
 root
 tags nonPrefixGrammar
 compilesTo csv
 javascript
  compile() {
   let day = ""
   let lastTime = ""
   const rows = this.getTopDownArray()
    .map(node => {
     if (node.doesExtend("dayNode")) {
      day = node.getDay()
      return undefined
     }
     lastTime = !node.getTime || node.getTime() === undefined ? lastTime : node.getTime()
     return node.compile(day, lastTime)
    })
    .filter(identity => identity)
   return \`date,time,event,notes\\n\` + rows.join("\\n")
  }
 inScope abstractEventNode dayNode
 example
  🌄 8 29 2019
  😀 4
  ✨ 6
  💩 630
abstractEventNode
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
bowelNode
 crux 💩
 pattern 💩
 extends abstractEventNode
 description Bowel movement.
 string eventType bowelMovement
bladderNode
 crux ✨
 pattern ✨
 description Bladder movement.
 extends abstractEventNode
 string eventType bladderMovement
bottleNode
 crux 🍼
 pattern 🍼
 extends abstractEventNode
 description Feeding.
 string eventType feeding
sleep4Node
 crux 😴
 pattern 😴
 description Sleep.
 extends abstractEventNode
 string eventType asleep
awakeNode
 crux 😀
 pattern 😀
 description I'm awake!
 extends abstractEventNode
 string eventType awoke
memoryNode
 crux ❤️
 pattern ❤️
 cells eventTypeCell
 catchAllCellType memoryDescriptionCell
 description Special memory.
 extends abstractEventNode
 string eventType memory
 javascript
  getNotes() {
   return jtree.Utils.removeNonAscii(this.getLine()).trim()
  }
dayNode
 crux 🌄
 description We survived another day!
 cells symbolCell monthIntCell dayIntCell yearIntCell
 javascript
  getDay() {
   return jtree.Utils.removeNonAscii(this.getLine())
    .trim()
    .replace(/ /g, "/")
  }`)
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        poopNode: poopNode,
        abstractEventNode: abstractEventNode,
        bowelNode: bowelNode,
        bladderNode: bladderNode,
        bottleNode: bottleNode,
        sleep4Node: sleep4Node,
        awakeNode: awakeNode,
        memoryNode: memoryNode,
        dayNode: dayNode
      }
    }
  }

  class abstractEventNode extends jtree.GrammarBackedNode {
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

  class bowelNode extends abstractEventNode {
    get eventType() {
      return `bowelMovement`
    }
  }

  class bladderNode extends abstractEventNode {
    get eventType() {
      return `bladderMovement`
    }
  }

  class bottleNode extends abstractEventNode {
    get eventType() {
      return `feeding`
    }
  }

  class sleep4Node extends abstractEventNode {
    get eventType() {
      return `asleep`
    }
  }

  class awakeNode extends abstractEventNode {
    get eventType() {
      return `awoke`
    }
  }

  class memoryNode extends abstractEventNode {
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
      return jtree.Utils.removeNonAscii(this.getLine()).trim()
    }
  }

  class dayNode extends jtree.GrammarBackedNode {
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
      return jtree.Utils.removeNonAscii(this.getLine())
        .trim()
        .replace(/ /g, "/")
    }
  }

  window.poopNode = poopNode
}
