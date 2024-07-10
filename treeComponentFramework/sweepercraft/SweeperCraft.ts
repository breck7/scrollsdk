//onsave scrollsdk build produce SweeperCraft.browser.js

const { AbstractTreeComponentParser, TreeComponentFrameworkDebuggerComponent, AbstractGithubTriangleComponent } = require("../../products/TreeComponentFramework.node.js")
const { TreeNode } = require("../../products/TreeNode.js")
const { Utils } = require("../../products/Utils.js")

declare type int = number
declare type Row = int[]
declare type Board = Row[]
declare type Coordinate = int[]
declare type gameState = 0 | 1 | 2
declare type char = string

declare var Figlet: any
declare var FontsBanner: any

// A fn which renders a view. Otherwise runs headless.
declare type renderFn = (game: SweeperCraftGame) => void

// Permalink looks like: rows/{int}/columns/{int}/layout/{base64encodedBoard}
declare type gamePermalink = string

// Example board string could look like the below, where the 1's represent mines:
// 0100
// 0010
declare type boardString = string

interface GameOptions {
  board?: Board
}

class SweeperCraftGame {
  constructor(board: Board) {
    this._setBoard(board)
    this._resetBoard()
    this._clicks = []
  }

  private _clicks: int[][]
  private _startTime: int
  private _replayInterval: any
  private _flags: Board
  private _numberOfMines: int
  private _shouldReveal: boolean
  private _board: Board
  private _numberOfRows: int
  private _numberOfColumns: int
  private _numberOfNonMines: int
  private _state: gameState
  private _endTime: int
  private _flagLock: boolean
  private _clicked: Board

  retry() {
    this._startTime = null
    this._resetBoard()
    this._clicks = []
  }

  watchReplay(speedInMs: int = 250, renderFn: Function) {
    this._resetBoard()
    renderFn()
    let step = 0
    const stepCount = this._clicks.length
    this._replayInterval = setInterval(() => {
      if (step >= stepCount) {
        clearInterval(this._replayInterval)
        return
      }
      this._click(this._clicks[step][0], this._clicks[step][1])
      renderFn()
      step++
    }, speedInMs)
  }

  getGameMessage() {
    if (this.isLost()) return "You Lost :("
    else if (this.isWon()) return "You won!"
    return " "
  }

  getBoard() {
    return this._board
  }

  getNumberOfMoves() {
    return this._clicks.length
  }

  getNumberOfFlags() {
    return SweeperCraftGame.sum(this._flags)
  }

  getNumberOfMines(subtractFlags = false) {
    return this._numberOfMines - (subtractFlags ? this.getNumberOfFlags() : 0)
  }

  toggleFlag(row: int, col: int) {
    this._flags[row][col] = this._flags[row][col] ? 0 : 1
  }

  // Whether to show all bombs when the game is completed.
  shouldReveal() {
    return this._shouldReveal
  }

  click(row: int, column: int) {
    // Begin the timer once the user makes their first click.
    if (!this._startTime) this._startTime = Date.now()

    // noop
    if (this.wasClicked(row, column)) return

    this._clicks.push([row, column, Date.now()])
    this._click(row, column)
  }

  hasBomb(row: int, column: int) {
    return this._board[row][column] === 1
  }

  getNeighborBombCount(row: int, column: int) {
    return this._getNeighbors(row, column)
      .map(pos => (this.hasBomb(pos[0], pos[1]) ? 1 : 0))
      .reduce((sum, currentVal) => sum + currentVal, 0)
  }

  wasClicked(row: int, column: int): boolean {
    return this._clicked[row][column] === 1
  }

  isFlagged(row: int, column: int): boolean {
    return this._flags[row][column] === 1
  }

  isLost() {
    return this._state === 2
  }

  isWon() {
    return this._state === 1
  }

  isFlagLockOn() {
    return this._flagLock === true
  }

  toggleFlagLock() {
    this._flagLock = !this._flagLock
  }

  isOver() {
    return this._state > 0
  }

  getGameTime() {
    if (!this._startTime) return 0
    return Math.round(((this.isOver() ? this._endTime : Date.now()) - this._startTime) / 1000)
  }

  toPermalink(): gamePermalink {
    return SweeperCraftGame.toPermalink(this._board)
  }

  // Deletes the last click from history and replays the remaining clicks.
  undo() {
    this._resetClicked()
    this._resetState()
    this._clicks.pop()
    this._clicks.forEach(c => {
      this._click(c[0], c[1])
    })
  }

  // Generates a gameboard link where a bomb represents a flag.
  getCraftPermalink() {
    return SweeperCraftGame.toPermalink(this._flags)
  }

  win() {
    this._shouldReveal = true
    let row = 0
    let col
    while (row < this._numberOfRows) {
      col = 0
      while (col < this._numberOfColumns) {
        if (!this.hasBomb(row, col)) this._click(row, col)
        col++
      }
      row++
    }
  }

  private _setBoard(board: Board) {
    if (!(board instanceof Array)) throw new Error("Invalid Board. Board must be an Array.")
    if (!board.length) throw new Error("Invalid Board. No rows in Board. Expected: Row[]")
    if (!board[0].length) throw new Error("Invalid Board. No columns in row. Expected Row to be: int[]")
    this._board = board
  }

  private _resetBoard() {
    clearInterval(this._replayInterval)
    this._numberOfMines = SweeperCraftGame.sum(this._board)
    this._numberOfRows = this._board.length
    this._numberOfColumns = this._board[0].length
    this._numberOfNonMines = this._numberOfRows * this._numberOfColumns - this._numberOfMines
    this._resetClicked()
    this._shouldReveal = false
    this._flags = this._zeroedBoard()
    this._resetState()
  }

  private _resetState() {
    this._state = 0
  }

  private _zeroedBoard() {
    return SweeperCraftGame.getZeroedBoard(this._numberOfRows, this._numberOfColumns)
  }

  private _resetClicked() {
    this._clicked = this._zeroedBoard()
  }

  private _click(row: int, column: int) {
    this._clicked[row][column] = 1
    if (this.hasBomb(row, column)) {
      this._lose()
    } else if (this.getNeighborBombCount(row, column) === 0) {
      this._clickNeighbors(row, column)
    }

    if (!this.isOver() && SweeperCraftGame.sum(this._clicked) === this._numberOfNonMines) {
      this._win()
    }
  }

  private _clickNeighbors(row: int, column: int) {
    this._getNeighbors(row, column).map(coordinate => {
      const row = coordinate[0]
      const col = coordinate[1]
      if (this._clicked[row][col]) return
      this._clicked[row][col] = 1
      const bombCount = this.getNeighborBombCount(row, col)
      if (!bombCount) this._clickNeighbors(row, col)
    })
  }

  getGameAsTree() {
    return ("rowComponent\n" + " squareComponent\n".repeat(this._numberOfColumns)).repeat(this._numberOfRows).trim()
  }

  private _getNeighbors(row: int, column: int) {
    return SweeperCraftGame.getNeighbors(row, column, this._numberOfRows, this._numberOfColumns)
  }

  private _win() {
    this._endTime = Date.now()
    this._state = 1
  }

  private _lose() {
    this._endTime = Date.now()
    this._state = 2
  }

  // encode 6 bits
  static _bitsToChar(sixBits: string): char {
    // Pad
    if (sixBits.length < 6) sixBits += "0".repeat(6 - sixBits.length)
    const code = parseInt(sixBits, 2)

    return this._permalinkArr[code]
  }

  // decode 6 bits
  static _charToSixBits(singleChar: char): string {
    let num = this._getPermalinkMap()[singleChar]
    let str = num.toString(2)

    if (str.length < 6) str = "0".repeat(6 - str.length) + str
    return str
  }

  static toPermalink(board: Board): gamePermalink {
    const numRows = board.length
    const numCols = board[0].length
    const c = board.map(row => row.join("")).join("")
    const strLength = c.length
    let layout = ""
    for (let i = 0; i < strLength; i = i + 6) {
      layout += SweeperCraftGame._bitsToChar(c.substr(i, 6))
    }

    return "rows/" + numRows + "/columns/" + numCols + "/layout/" + layout
  }

  static isValidPermalink(link: string) {
    return link.match("rows/")
  }

  static boardFromPermalink(link: gamePermalink): Board {
    const options: any = linkToObject(link)
    const numRows = parseInt(options.rows)
    const numCols = parseInt(options.columns)

    // If no layout provided, just generate a random board.
    if (!options.layout) {
      const numMines = options.mines ? parseInt(options.mines) : 0
      return SweeperCraftGame.getRandomBoard(numRows, numCols, numMines)
    }

    const layout = options.layout
    let board = SweeperCraftGame.getZeroedBoard(numRows, numCols)

    const expectedSquares = numRows * numCols
    let boardStr = ""
    for (let rowIndex = 0; rowIndex < layout.length; rowIndex++) {
      boardStr += SweeperCraftGame._charToSixBits(layout[rowIndex])
    }

    boardStr = boardStr.substr(0, expectedSquares)
    board = []
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      board.push(
        boardStr
          .substr(rowIndex * numCols, numCols)
          .split("")
          .map(c => parseInt(c))
      )
    }
    return board
  }

  static boardFromString(str: boardString): Board {
    const sanitizedString = str.replace(/\r/g, "").trim()
    const nonMineChar = _detectNonMineCharacter(sanitizedString)

    return sanitizedString.split("\n").map(row => row.split("").map(c => (c === nonMineChar ? 0 : 1)))
  }

  // Return the sum of an array of arrays of numbers
  static sum(grid: Board): number {
    return grid.reduce((sum, row) => sum + row.reduce((rowSum, col) => rowSum + col, 0), 0)
  }

  static getNeighbors(row: int, column: int, numberOfRows: int, numberOfColumns: int): Coordinate[] {
    const neighbors = []
    const aboveRow = row - 1
    const belowRow = row + 1
    const leftCol = column - 1
    const rightCol = column + 1

    if (aboveRow >= 0) {
      neighbors.push([aboveRow, column])
      if (leftCol >= 0) neighbors.push([aboveRow, leftCol])
      if (rightCol < numberOfColumns) neighbors.push([aboveRow, rightCol])
    }

    if (leftCol >= 0) neighbors.push([row, leftCol])
    if (rightCol < numberOfColumns) neighbors.push([row, rightCol])

    if (belowRow < numberOfRows) {
      neighbors.push([belowRow, column])
      if (leftCol >= 0) neighbors.push([belowRow, leftCol])
      if (rightCol < numberOfColumns) neighbors.push([belowRow, rightCol])
    }

    return neighbors
  }

  static boardFromWords(sentence: string): Board {
    const words = sentence.split(/ /g)
    const lines = []
    const bombChar = "#"
    let maxWidth = 0
    let boardString = ""

    words.forEach(word => {
      const line = Figlet.write(word, "banner")
      const length = line.split(/\n/)[0].length
      if (length > maxWidth) maxWidth = length
      boardString += "\n" + line.replace(/ /g, "0")
    })

    const rows = boardString.trim().split(/\n/g)

    const board = SweeperCraftGame.getZeroedBoard(rows.length, maxWidth)
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < maxWidth; col++) {
        if (rows[row][col] === bombChar) board[row][col] = 1
      }
    }

    return board
  }

  static getRandomBoard(rows: int, cols: int, mines: int): Board {
    const numberOfSquares = rows * cols
    if (!rows || !cols) throw new Error("Rows and cols must be greater than 0.")
    if (mines > numberOfSquares) throw new Error("Number of mines can't be more than the number of squares.")

    const board = SweeperCraftGame.getZeroedBoard(rows, cols)

    while (mines) {
      let num = Utils.randomUniformInt(0, numberOfSquares)
      let row = Math.floor(num / cols)
      let col = num % cols
      if (!board[row][col]) {
        board[row][col] = 1
        mines--
      }
    }

    return board
  }

  static getZeroedBoard(rows: int, cols: int): Board {
    const board = []
    while (rows) {
      board.push(Array(cols).fill(0))
      rows--
    }
    return board
  }

  static _permalinkMap: any
  static _permalinkArr = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.".split("")

  // todo: what is this?
  static _getPermalinkMap() {
    if (!this._permalinkMap) {
      this._permalinkMap = {}
      this._permalinkArr.forEach((letter, index) => {
        this._permalinkMap[letter] = index
      })
    }
    return this._permalinkMap
  }
}

// Simple algo to guess which character represents a mine-free square.
const _detectNonMineCharacter = (str: string): string => {
  const matches = str.match(/([^01\n])/)

  // Convention is to have a 0 represent a mine free square.
  if (!matches) return "0"

  // If there is a char other than 1's, 0's, and newlines, use the first char as the mine free char.
  return str.substr(0, 1)
}

// Parses a pretty url into a matching objecte. Example: color/blue/height/2 becomes {color: blue, height: 2}
const linkToObject = (link: string): Object => {
  const parts = link.replace(/^\//, "").split("/")
  const obj: any = {}
  const length = parts.length
  for (let index = 0; index < length; index = index + 2) {
    obj[parts[index]] = parts[index + 1]
  }
  return obj
}

class SweeperCraftApp extends AbstractTreeComponentParser {
  createParserCombinator() {
    return new TreeNode.ParserCombinator(undefined, {
      headerComponent,
      boardComponent,
      controlsComponent,
      customLinkComponent,
      shortcutsTableComponent,
      githubTriangleComponent,
      TreeComponentFrameworkDebuggerComponent
    })
  }

  clickSquareCommand(row: int | string, col: int | string) {
    row = typeof row === "string" ? parseInt(row) : row
    col = typeof col === "string" ? parseInt(col) : col
    const game = this.getGame()
    if (game.isOver()) return

    const wasClicked = game.wasClicked(row, col)

    if (wasClicked) return

    const isFlagged = game.isFlagged(row, col)

    if (game.isFlagLockOn()) game.toggleFlag(row, col)
    // Don't allow someone to click on a flagged square w/o removing flag first
    else if (!isFlagged) game.click(row, col)
    this._syncAndRender()
  }

  retryGameCommand() {
    this.getGame().retry()
    this._syncAndRender()
  }

  private _syncAndRender() {
    this._syncBoardToGame()
    this.renderAndGetRenderReport(this.willowBrowser.getBodyStumpNode())
  }

  flagSquareCommand(row: int | string, col: int | string) {
    row = typeof row === "string" ? parseInt(row) : row
    col = typeof col === "string" ? parseInt(col) : col
    const game = this.getGame()
    if (game.isOver()) return

    const wasClicked = game.wasClicked(row, col)

    if (wasClicked) return

    game.toggleFlag(row, col)
    this._syncAndRender()
  }

  toHakonCode() {
    const theme = this.getTheme()
    return `body
 font-family "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif
 font-weight 200
#container
 padding 5px
.logo
 margin-bottom 10px
 a
  text-decoration none
.headerComponent
 margin-bottom 10px
#minesLeft,#moves,#timer
 background-position left center
 background-size contain
 background-repeat no-repeat
 padding 5px 5px 5px 30px
 margin-right 25px
#minesLeft:before
 content "💣"
#moves:before
 content "🔘"
#timer:before
 content "⌚️"
#gameStatus
 font-weight bold
 margin-left 25px
.boardComponent
 -webkit-touch-callout none /** Disable drag select on board */
 -webkit-user-select none
 -khtml-user-select none
 -moz-user-select none
 -ms-user-select none
 user-select none
.button
 border-radius 1px
 padding 6px 25px
 margin-top 15px
 display inline-block
 cursor pointer
.rowComponent
 white-space nowrap
 height 30px
 font-size 30px
.squareComponent
 text-align center
 vertical-align middle
 display inline-block
 width 30px
 height 30px
 line-height 30px
 overflow hidden
 box-sizing border-box
 cursor pointer
 border-left 1px solid
 border-bottom 1px solid
 background-position center
 background-size contain
 background-repeat no-repeat
 border-color #757575
 background-color #c1c1c1
.squareComponent.flagged:before
 content "🚩"
.squareComponent.bomb:before
 content "💣"
.squareComponent.clicked
 background-color #f4f4f4
.squareComponent.clicked.bomb
 background-color #da3c38
.gameLost
 #gameStatus
  color #da3c38
.gameWon
 #gameStatus
  color #378966
.playing
 .squareComponent:active:not(.clicked)
  background-color #dbdbdb
.b0
 color black
.b1
 color #ff6666
.b2
 color #ff6666
.b3
 color #ff3333
.b4
 color #ff3333
.b5
 color #ff1a1a
.b6
 color #ff1a1a
.b7
 color #cc0000
.b8
 color #cc0000
.exportLink
 a
  color #57bbdc
.logo
 color #333
#shortcutsTableComponent
 table
  margin-top 15px
  border-collapse collapse
 td
  padding 5px
 tr
  &:hover
   cursor pointer
   background-color #eee
   border-radius 3px
.button
 color black
 border 1px solid black
 opacity 0.9
 &:hover
  opacity 1
 &:active
  opacity 0.95
.rowComponent:first-child
 .squareComponent
  border-top 1px solid #757575
.squareComponent:last-child
 border-right 1px solid #757575`
  }

  private _mainGame: SweeperCraftGame

  getGame() {
    return this._mainGame
  }

  private _setupBrowser() {
    const { keyboardShortcuts, willowBrowser } = this
    Object.keys(keyboardShortcuts).forEach(key => {
      willowBrowser.getMousetrap().bind(key, function (evt: any) {
        keyboardShortcuts[key]()
        // todo: handle the below when we need to
        if (evt.preventDefault) evt.preventDefault()
        return false
      })
    })

    Figlet.loadFont("banner", FontsBanner)

    window.addEventListener("hashchange", () => {
      console.log("hashchange")
      this._restoreStateFromHash(willowBrowser.getHash().replace(/^\#/, ""))
    })
  }

  async start() {
    this._bindTreeComponentFrameworkCommandListenersOnBody()
    if (!this.isNodeJs()) this._setupBrowser()

    const willowBrowser = this.willowBrowser
    const currentHash = willowBrowser.getHash().replace(/^#/, "")

    // Initialize first game
    if (SweeperCraftGame.isValidPermalink(currentHash)) this._restoreStateFromHash(currentHash)
    else willowBrowser.setHash(SweeperCraftGame.toPermalink(SweeperCraftGame.getRandomBoard(9, 9, 10)))
  }

  keyboardShortcuts: any = this._getKeyboardShortcuts()

  _getKeyboardShortcuts() {
    return {
      u: () => {
        this._mainGame.undo()
        this._syncAndRender()
      },
      s: () => {
        this._mainGame.win()
        this._syncAndRender()
      },
      l: () => {
        this._mainGame.toggleFlagLock()
        this._syncAndRender()
      },
      r: () => {
        if (this._mainGame.isOver()) this._mainGame.watchReplay(250, () => this._syncAndRender())
      },
      "?": () => {
        const table = this.getNode("shortcutsTableComponent")
        if (table) table.unmountAndDestroy()
        else {
          this.appendLine("shortcutsTableComponent")
          this.renderAndGetRenderReport(this.willowBrowser.getBodyStumpNode())
        }
      },
      e: () => {
        location.hash = SweeperCraftGame.toPermalink(SweeperCraftGame.getRandomBoard(9, 9, 10))
      },
      m: () => {
        location.hash = SweeperCraftGame.toPermalink(SweeperCraftGame.getRandomBoard(16, 16, 44))
      },
      h: () => {
        location.hash = SweeperCraftGame.toPermalink(SweeperCraftGame.getRandomBoard(16, 30, 99))
      },
      w: () => {
        const phrase = prompt("Enter a word or phrase to turn into a board:")
        if (!phrase) return

        const board = SweeperCraftGame.boardFromWords(phrase)
        const link = SweeperCraftGame.toPermalink(board)
        location.hash = link
      },
      d: () => {
        this.toggleTreeComponentFrameworkDebuggerCommand()
      }
    }
  }

  // todo: there's probably a better pattern than this.
  private _syncBoardToGame() {
    this.topDownArray
      .filter((node: any) => node instanceof AbstractSweeperCraftComponent)
      .forEach((node: AbstractSweeperCraftComponent) => {
        node._syncBoardToGame()
      })
  }

  private _restoreStateFromHash(link: string) {
    const board = link ? SweeperCraftGame.boardFromPermalink(link) : SweeperCraftGame.getRandomBoard(9, 9, 10)
    this._mainGame = new SweeperCraftGame(board)
    let boardNode = this.getNode("boardComponent")
    if (boardNode) {
      if (boardNode.isMounted()) {
        boardNode.unmountAndDestroy() // todo: cleanup
        boardNode = this.getNode("headerComponent").appendSibling("boardComponent")
      }
      boardNode.setChildren(this._mainGame.getGameAsTree())
    }

    this._syncAndRender()
  }

  getCssClasses() {
    const classes = super.getCssClasses()
    if (this._mainGame.isLost()) classes.push("gameLost")
    else if (this._mainGame.isWon()) classes.push("gameWon")
    return classes
  }
}

abstract class AbstractSweeperCraftComponent extends AbstractTreeComponentParser {
  abstract _syncBoardToGame(): void
}

class headerComponent extends AbstractSweeperCraftComponent {
  async treeComponentDidMount() {
    await super.treeComponentDidMount()
    if (!this.isNodeJs()) this._initTimerInterval()
  }

  treeComponentWillUnmount() {
    clearInterval(this._timerInterval)
    delete this._timerInterval
  }

  private _timerInterval: any

  private _initTimerInterval() {
    // Skip reactjs for updating timer
    if (!this._timerInterval)
      this._timerInterval = setInterval(() => {
        this.willowBrowser.setHtmlOfElementWithIdHack("timer", `&nbsp;` + this.gameTime)
      }, 1000)
  }

  get gameTime() {
    return this._getGame().getGameTime().toString()
  }

  get numberOfMines() {
    return this._getGame().getNumberOfMines(true)
  }

  get gameMessage() {
    return this._getGame().getGameMessage()
  }

  get numberOfMoves() {
    return this._getGame().getNumberOfMoves()
  }

  _getGame() {
    return this.root.getGame()
  }

  // mines moves gameMessage
  // 10 1 You Lost!
  _syncBoardToGame() {
    this.setContent(`${this.numberOfMines}mines ${this.numberOfMoves}clicks ${this.gameMessage}`)
  }

  toStumpCode() {
    return `div
 class headerComponent
 div
  class logo
  a SweeperCraft
   href #
  span  - Craft your own levels.
 div
  span &nbsp;${this.numberOfMines}&nbsp;
   id minesLeft
  span &nbsp;${this.numberOfMoves}&nbsp;
   id moves
  span &nbsp;${this.gameTime}&nbsp;
   id timer
  span &nbsp;${this.gameMessage}&nbsp;
   id gameStatus`
  }
}

class boardComponent extends AbstractSweeperCraftComponent {
  createParserCombinator() {
    return new TreeNode.ParserCombinator(undefined, {
      rowComponent: rowComponent
    })
  }

  _syncBoardToGame() {
    this.setContent(this._getCssGameClass())
  }

  _getCssGameClass() {
    return this.root.getGame().isOver() ? "over" : "playing"
  }

  getCssClasses() {
    return super.getCssClasses().concat([this._getCssGameClass()])
  }
}

class rowComponent extends AbstractTreeComponentParser {
  createParserCombinator() {
    return new TreeNode.ParserCombinator(undefined, {
      squareComponent: squareComponent
    })
  }
}

class squareComponent extends AbstractSweeperCraftComponent {
  toStumpCode() {
    const row = this.getRow()
    const col = this.getColumn()

    return `div${this.htmlContent}
 clickCommand clickSquareCommand ${row} ${col}
 shiftClickCommand flagSquareCommand ${row} ${col}
 contextMenuCommand flagSquareCommand ${row} ${col}
 class ${this.getCssClassNames().join(" ")}`
  }

  _syncBoardToGame() {
    this.setContent(`${this.wasClicked ? "clicked" : "notClicked"} ${this.isFlagged ? "flagged" : "notFlagged"}`)
  }

  get isFlagged() {
    return this.game.isFlagged(this.getRow(), this.getColumn())
  }

  get htmlContent() {
    if (!this.wasClicked) return ""

    return " " + (this.neighborBombCount || "")
  }

  get wasClicked() {
    return this.game.wasClicked(this.getRow(), this.getColumn())
  }

  get neighborBombCount() {
    return this.game.getNeighborBombCount(this.getRow(), this.getColumn())
  }

  getRow() {
    return this.parent.getIndex()
  }

  getColumn() {
    return this.getIndex()
  }

  get game() {
    return this.root.getGame()
  }

  get hasBomb() {
    return this.game.hasBomb(this.getRow(), this.getColumn())
  }

  getCssClassNames() {
    const game = this.game
    const wasClicked = this.wasClicked
    const isLost = game.isLost()
    const shouldReveal = game.shouldReveal()
    const neighborBombCount = this.neighborBombCount
    const isFlagged = this.isFlagged
    const hasBomb = this.hasBomb

    let classNames: string[] = []

    if (!wasClicked && isLost && shouldReveal && hasBomb) classNames.push("bomb")
    else if (wasClicked && hasBomb) classNames.push("bomb")

    if (wasClicked) {
      classNames.push("clicked")
      if (!hasBomb) classNames.push("b" + neighborBombCount)
    }

    if (isFlagged && !wasClicked) classNames.push("flagged")

    return super.getCssClassNames().concat(classNames)
  }
}

// todo: STATE
class controlsComponent extends AbstractSweeperCraftComponent {
  toStumpCode() {
    const parts = []
    const game = this.root.getGame()

    if (game.isOver())
      parts.push(`div Restart
 clickCommand retryGameCommand
 class button`)

    if (game.isFlagLockOn()) parts.push(`span Flag lock on`)

    return parts.join("\n") || "div"
  }

  _syncBoardToGame() {
    const game = this.root.getGame()
    this.setContent(`${game.isOver() ? "over" : "notOver"} ${game.isFlagLockOn() ? "flagLockOn" : "flagLockOff"}`)
  }
}

// todo: STATE
class customLinkComponent extends AbstractSweeperCraftComponent {
  toStumpCode() {
    const craftLink = this._getGameLink()
    if (craftLink) return `div Your game link: <a href="#${craftLink}">${craftLink}</a>`
    return `div`
  }

  private _getGameLink() {
    const game = this.root.getGame()
    if (game.getNumberOfFlags() && !game.getNumberOfMoves()) return game.getCraftPermalink()
    return ""
  }

  _syncBoardToGame() {
    this.setContent(this._getGameLink())
  }
}

class shortcutsTableComponent extends AbstractTreeComponentParser {
  triggerShortcut(letter: string) {
    this.root.keyboardShortcuts[letter]()
  }

  toStumpCode() {
    return `div
 id shortcutsTableComponent
 table
  tbody
   tr
    td ?
    td Show/Hide Keyboard Shortcuts
    clickCommand triggerShortcut ?
   tr
    td u
    td Undo
    clickCommand triggerShortcut u
   tr
    td l
    td Toggle Flag Lock
    clickCommand triggerShortcut l
   tr
    td r
    td Watch instant replay
    clickCommand triggerShortcut r
   tr
    td s
    td Solve game
    clickCommand triggerShortcut s
   tr
    td e
    td New easy board
    clickCommand triggerShortcut e
   tr
    td m
    td New medium board
    clickCommand triggerShortcut m
   tr
    td h
    td New hard board
    clickCommand triggerShortcut h
   tr
    td w
    td New board from word
    clickCommand triggerShortcut w
   tr
    td d
    td Debug
    clickCommand triggerShortcut d`
  }
}

class githubTriangleComponent extends AbstractGithubTriangleComponent {
  githubLink = `https://github.com/breck7/scrollsdk/tree/main/treeComponentFramework/sweepercraft`
}

export { SweeperCraftApp, SweeperCraftGame }
