//onsave jtree build produce SweeperCraft.browser.js
class SweeperCraftGame {
  constructor(board) {
    this._setBoard(board)
    this._resetBoard()
    this._clicks = []
  }
  retry() {
    this._startTime = null
    this._resetBoard()
    this._clicks = []
  }
  watchReplay(speedInMs = 250, renderFn) {
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
  toggleFlag(row, col) {
    this._flags[row][col] = this._flags[row][col] ? 0 : 1
  }
  // Whether to show all bombs when the game is completed.
  shouldReveal() {
    return this._shouldReveal
  }
  click(row, column) {
    // Begin the timer once the user makes their first click.
    if (!this._startTime) this._startTime = Date.now()
    // noop
    if (this.wasClicked(row, column)) return
    this._clicks.push([row, column, Date.now()])
    this._click(row, column)
  }
  hasBomb(row, column) {
    return this._board[row][column] === 1
  }
  getNeighborBombCount(row, column) {
    return this._getNeighbors(row, column)
      .map(pos => (this.hasBomb(pos[0], pos[1]) ? 1 : 0))
      .reduce((sum, currentVal) => sum + currentVal, 0)
  }
  wasClicked(row, column) {
    return this._clicked[row][column] === 1
  }
  isFlagged(row, column) {
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
  toPermalink() {
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
  _setBoard(board) {
    if (!(board instanceof Array)) throw new Error("Invalid Board. Board must be an Array.")
    if (!board.length) throw new Error("Invalid Board. No rows in Board. Expected: Row[]")
    if (!board[0].length) throw new Error("Invalid Board. No columns in row. Expected Row to be: int[]")
    this._board = board
  }
  _resetBoard() {
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
  _resetState() {
    this._state = 0
  }
  _zeroedBoard() {
    return SweeperCraftGame.getZeroedBoard(this._numberOfRows, this._numberOfColumns)
  }
  _resetClicked() {
    this._clicked = this._zeroedBoard()
  }
  _click(row, column) {
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
  _clickNeighbors(row, column) {
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
  _getNeighbors(row, column) {
    return SweeperCraftGame.getNeighbors(row, column, this._numberOfRows, this._numberOfColumns)
  }
  _win() {
    this._endTime = Date.now()
    this._state = 1
  }
  _lose() {
    this._endTime = Date.now()
    this._state = 2
  }
  // encode 6 bits
  static _bitsToChar(sixBits) {
    // Pad
    if (sixBits.length < 6) sixBits += "0".repeat(6 - sixBits.length)
    const code = parseInt(sixBits, 2)
    return this._permalinkArr[code]
  }
  // decode 6 bits
  static _charToSixBits(singleChar) {
    let num = this._getPermalinkMap()[singleChar]
    let str = num.toString(2)
    if (str.length < 6) str = "0".repeat(6 - str.length) + str
    return str
  }
  static toPermalink(board) {
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
  static isValidPermalink(link) {
    return link.match("rows/")
  }
  static boardFromPermalink(link) {
    const options = linkToObject(link)
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
  static boardFromString(str) {
    const sanitizedString = str.replace(/\r/g, "").trim()
    const nonMineChar = _detectNonMineCharacter(sanitizedString)
    return sanitizedString.split("\n").map(row => row.split("").map(c => (c === nonMineChar ? 0 : 1)))
  }
  // Return the sum of an array of arrays of numbers
  static sum(grid) {
    return grid.reduce((sum, row) => sum + row.reduce((rowSum, col) => rowSum + col, 0), 0)
  }
  static getNeighbors(row, column, numberOfRows, numberOfColumns) {
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
  static boardFromWords(sentence) {
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
  static getRandomBoard(rows, cols, mines) {
    const numberOfSquares = rows * cols
    if (!rows || !cols) throw new Error("Rows and cols must be greater than 0.")
    if (mines > numberOfSquares) throw new Error("Number of mines can't be more than the number of squares.")
    const board = SweeperCraftGame.getZeroedBoard(rows, cols)
    while (mines) {
      let num = jtree.Utils.randomUniformInt(0, numberOfSquares)
      let row = Math.floor(num / cols)
      let col = num % cols
      if (!board[row][col]) {
        board[row][col] = 1
        mines--
      }
    }
    return board
  }
  static getZeroedBoard(rows, cols) {
    const board = []
    while (rows) {
      board.push(Array(cols).fill(0))
      rows--
    }
    return board
  }
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
SweeperCraftGame._permalinkArr = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.".split("")
// Simple algo to guess which character represents a mine-free square.
const _detectNonMineCharacter = str => {
  const matches = str.match(/([^01\n])/)
  // Convention is to have a 0 represent a mine free square.
  if (!matches) return "0"
  // If there is a char other than 1's, 0's, and newlines, use the first char as the mine free char.
  return str.substr(0, 1)
}
// Parses a pretty url into a matching objecte. Example: color/blue/height/2 becomes {color: blue, height: 2}
const linkToObject = link => {
  const parts = link.replace(/^\//, "").split("/")
  const obj = {}
  const length = parts.length
  for (let index = 0; index < length; index = index + 2) {
    obj[parts[index]] = parts[index + 1]
  }
  return obj
}
class SweeperCraftApp extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      headerComponent,
      boardComponent,
      controlsComponent,
      customLinkComponent,
      shortcutsTableComponent,
      githubTriangleComponent,
      TreeComponentFrameworkDebuggerComponent
    })
  }
  clickSquareCommand(row, col) {
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
  _syncAndRender() {
    this._syncBoardToGame()
    this.renderAndGetRenderReport(this.willowBrowser.getBodyStumpNode())
  }
  flagSquareCommand(row, col) {
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
  font-size 30px
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
 color #57bbdc
.b2
 color #4cb559
.b3
 color #eb7d29
.b4
 color #1a69e0
.b5
 color #d84959
.b6
 color #f6c14a
.b7
 color #608389
.b8
 color #48c4ec
.exportLink
 a
  color #57bbdc
.logo
 color #333
#shortcutsTableComponent
 table
  margin-top 15px
 td
  padding 3px 20px 3px 3px
.button
 color #fff
 background-color #4cb559
 &:hover
  background-color #44a450
 &:active
  background-color #3c9247
.rowComponent:first-child
 .squareComponent
  border-top 1px solid #757575
.squareComponent:last-child
 border-right 1px solid #757575`
  }
  getGame() {
    return this._mainGame
  }
  _setupBrowser() {
    const willowBrowser = this.willowBrowser
    const keyboardShortcuts = this._getKeyboardShortcuts()
    Object.keys(keyboardShortcuts).forEach(key => {
      willowBrowser.getMousetrap().bind(key, function(evt) {
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
  _syncBoardToGame() {
    this.getTopDownArray()
      .filter(node => node instanceof AbstractSweeperCraftComponent)
      .forEach(node => {
        node._syncBoardToGame()
      })
  }
  _restoreStateFromHash(link) {
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
class AbstractSweeperCraftComponent extends AbstractTreeComponent {}
class headerComponent extends AbstractSweeperCraftComponent {
  async treeComponentDidMount() {
    await super.treeComponentDidMount()
    if (!this.isNodeJs()) this._initTimerInterval()
  }
  treeComponentWillUnmount() {
    clearInterval(this._timerInterval)
    delete this._timerInterval
  }
  _initTimerInterval() {
    // Skip reactjs for updating timer
    if (!this._timerInterval)
      this._timerInterval = setInterval(() => {
        this.willowBrowser.setHtmlOfElementWithIdHack("timer", this.gameTime)
      }, 1000)
  }
  get gameTime() {
    return this._getGame()
      .getGameTime()
      .toString()
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
    return this.getRootNode().getGame()
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
 div
  span ${this.numberOfMines}
   id minesLeft
  span ${this.numberOfMoves}
   id moves
  span ${this.gameTime}
   id timer
  span ${this.gameMessage}
   id gameStatus`
  }
}
class boardComponent extends AbstractSweeperCraftComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      rowComponent: rowComponent
    })
  }
  _syncBoardToGame() {
    this.setContent(this._getCssGameClass())
  }
  _getCssGameClass() {
    return this.getRootNode()
      .getGame()
      .isOver()
      ? "over"
      : "playing"
  }
  getCssClasses() {
    return super.getCssClasses().concat([this._getCssGameClass()])
  }
}
class rowComponent extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
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
    return this.getParent().getIndex()
  }
  getColumn() {
    return this.getIndex()
  }
  get game() {
    return this.getRootNode().getGame()
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
    let classNames = []
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
    const game = this.getRootNode().getGame()
    if (game.isOver())
      parts.push(`div Restart
 clickCommand retryGameCommand
 class button`)
    if (game.isFlagLockOn()) parts.push(`span Flag lock on`)
    return parts.join("\n") || "div"
  }
  _syncBoardToGame() {
    const game = this.getRootNode().getGame()
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
  _getGameLink() {
    const game = this.getRootNode().getGame()
    if (game.getNumberOfFlags() && !game.getNumberOfMoves()) return game.getCraftPermalink()
    return ""
  }
  _syncBoardToGame() {
    this.setContent(this._getGameLink())
  }
}
class shortcutsTableComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 id shortcutsTableComponent
 table
  tbody
   tr
    td ?
    td Show/Hide Keyboard Shortcuts
   tr
    td u
    td Undo
   tr
    td l
    td Toggle Flag Lock
   tr
    td r
    td Watch instant replay
   tr
    td s
    td Solve game
   tr
    td e
    td New easy board
   tr
    td m
    td New medium board
   tr
    td h
    td New hard board
   tr
    td w
    td New board from word
   tr
    td d
    td Debug`
  }
}
class githubTriangleComponent extends AbstractGithubTriangleComponent {
  constructor() {
    super(...arguments)
    this.githubLink = `https://github.com/treenotation/jtree/tree/main/treeComponentFramework/sweepercraft`
  }
}
window.SweeperCraftApp = SweeperCraftApp
window.SweeperCraftGame = SweeperCraftGame
