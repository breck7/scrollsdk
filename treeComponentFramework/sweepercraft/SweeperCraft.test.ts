#!/usr/bin/env ts-node

const { SweeperCraftApp, SweeperCraftGame } = require("./SweeperCraft")

const { jtree } = require("../../index.js")

const testTree: any = {}

testTree.sweeperCraftBasics = async (equal: any) => {
  const app = new SweeperCraftApp(`headerComponent
boardComponent
controlsComponent
customLinkComponent
shortcutsTableComponent
githubTriangleComponent`)
  app.willowBrowser.setHash("rows/9/columns/9/layout/GcmqabaiqaGaGa")
  await app.startWhenReady()
  const text = app.getTextContent()
  equal(text.includes("New medium board"), true)
  equal(!!app, true)
}

testTree.createGame = (equal: any) => {
  // Arrange/Act
  const game = new SweeperCraftGame([[0]])

  // Assert
  equal(game instanceof SweeperCraftGame, true, "Game has correct instance")

  // Assert
  equal(game.getNumberOfMines(), 0, "Has expected number of mines")

  // Create from string
  // Arrange
  const game2 = new SweeperCraftGame(SweeperCraftGame.boardFromString("01\n10"))

  // Assert
  equal(game2.getNumberOfMines(), 2, "Has expected number of mines")
}

testTree.invalidBoardtests = (equal: any) => {
  try {
    // Arrange/Act
    new SweeperCraftGame()
  } catch (e) {
    // Assert
    equal(true, true, "Invalid board threw error.")
  }
  try {
    // Arrange/Act
    new SweeperCraftGame("")
  } catch (e) {
    // Assert
    equal(true, true, "Invalid board threw error.")
  }
  try {
    // Arrange/Act
    new SweeperCraftGame([])
  } catch (e) {
    // Assert
    equal(true, true, "Invalid board threw error.")
  }
  try {
    // Arrange/Act
    new SweeperCraftGame([[]])
  } catch (e) {
    // Assert
    equal(true, true, "Invalid board threw error.")
  }
}

testTree.flagging = (equal: any) => {
  // Arrange
  const game = new SweeperCraftGame([[0, 1, 1]])

  // Assert
  equal(game.getNumberOfMines(), 2, "Has expected number of mines")

  // Act
  game.toggleFlag(0, 0)

  // Assert
  equal(game.getNumberOfMines(), 2, "Mine count remained unchanged when excluding flags.")
  equal(game.getNumberOfMines(true), 1, "Mine count decreased when including flags.")
  equal(game.getNumberOfFlags(), 1, "Flag count is correct")

  // Act
  game.toggleFlag(0, 1)

  // Assert
  equal(game.getNumberOfMines(true), 0, "Mine count decreased.")

  // Assert
  equal(game.toPermalink(), "rows/1/columns/3/layout/y")
  equal(game.getCraftPermalink(), "rows/1/columns/3/layout/W")

  // Act
  game.toggleFlag(0, 1)
  game.toggleFlag(0, 0)

  // Assert
  equal(game.getNumberOfMines(true), 2, "Mine count increased.")
}

testTree.undo = (equal: any) => {
  // Arrange
  const game = new SweeperCraftGame([[0, 1, 1]])

  // Act
  game.toggleFlag(0, 1)
  game.toggleFlag(0, 2)
  game.click(0, 0)

  // Assert
  equal(game.isWon(), true, "Expected game to be won.")
  equal(game.getNumberOfFlags(), 2, "Expected 2 flags")

  // Act
  game.undo()

  // Assert
  equal(!game.isOver(), true)
  equal(!game.isWon(), true)
  equal(game.getNumberOfFlags(), 2, "Expected 2 flags")
}

testTree.winGame = (equal: any) => {
  // Arrange
  const game = new SweeperCraftGame([[0, 0, 0, 0], [0, 0, 0, 0]])

  // Assert
  equal(!game.isOver(), true)
  equal(!game.isLost(), true)
  equal(!game.isWon(), true)

  // Act
  game.click(0, 1)

  // Assert
  equal(game.isOver(), true)
  equal(!game.isLost(), true)
  equal(game.isWon(), true)
  equal(game.wasClicked(0, 1), true, "Square was marked clicked")
  equal(game.wasClicked(0, 2), true, "Square was clicked by recursion")
}

testTree.loseGame = (equal: any) => {
  // Arrange
  const game = new SweeperCraftGame([[0, 1, 0]])

  // Assert
  equal(!game.isOver(), true)
  equal(!game.isLost(), true)
  equal(!game.isWon(), true)

  // Act
  game.click(0, 1)

  // Assert
  equal(game.isOver(), true)
  equal(game.isLost(), true)
  equal(!game.isWon(), true)
}

testTree.retryGame = (equal: any) => {
  // Arrange
  const game = new SweeperCraftGame([[0, 1, 0]])

  // Assert
  equal(!game.isOver(), true)
  equal(!game.isLost(), true)
  equal(!game.isWon(), true)

  // Act
  game.click(0, 1)

  // Assert
  equal(game.isOver(), true)
  equal(game.isLost(), true)
  equal(!game.isWon(), true)

  // Act
  game.retry()

  // Assert
  equal(!game.isOver(), true)
  equal(!game.isLost(), true)
  equal(!game.isWon(), true)

  // Act
  game.click(0, 0)
  game.click(0, 2)

  // Assert
  equal(game.isOver(), true)
  equal(!game.isLost(), true)
  equal(game.isWon(), true)
}

testTree.getZeroedBoard = (equal: any) => {
  // Arrange
  const testCases = [
    {
      rows: 1,
      cols: 3,
      expected: [[0, 0, 0]]
    },
    {
      rows: 2,
      cols: 2,
      expected: [[0, 0], [0, 0]]
    }
  ]

  testCases.forEach(test => {
    equal(new jtree.TreeNode(SweeperCraftGame.getZeroedBoard(test.rows, test.cols)).toString(), new jtree.TreeNode(test.expected).toString(), "deep equal okay")
  })
}

testTree.genRandomBoard = (equal: any) => {
  // Act
  try {
    SweeperCraftGame.getRandomBoard(0, 0, 1)
  } catch (e) {
    // Assert
    equal(true, true, "Boards must have volume")
  }

  // Act
  try {
    SweeperCraftGame.getRandomBoard(1, 1, 2)
  } catch (e) {
    // Assert
    equal(true, true, "Number of mines can't exceed board spaces")
  }

  // Arrange/Act
  const board = SweeperCraftGame.getRandomBoard(20, 20, 20)
  const board2 = SweeperCraftGame.getRandomBoard(20, 20, 20)
  // Assert
  equal(SweeperCraftGame.sum(board), 20, "Random board has expected number of mines")
  // the below will fail if run a bazillion times
  const deepEqual = new jtree.TreeNode(board).toString() === new jtree.TreeNode(board2).toString()
  equal(deepEqual, false, "Random boards are different")
}

testTree.boardSum = (equal: any) => {
  // Arrange
  const testCases = [
    {
      test: [[0, 0, 0]],
      sum: 0
    },
    {
      test: [[0, 1, 0], [1, 1, 1]],
      sum: 4
    },
    {
      test: [[0, 1, 0]],
      sum: 1
    },
    {
      test: [[0], [1], [1]],
      sum: 2
    },
    {
      test: [[0, 0, 0], [0, 0, 0], [1, 0, 0]],
      sum: 1
    }
  ]

  testCases.forEach(test => {
    equal(SweeperCraftGame.sum(test.test), test.sum)
  })
}

testTree.getNeighbors = (equal: any) => {
  // Arrange
  const testCases = [
    {
      row: 0,
      column: 0,
      rows: 1,
      columns: 1,
      expectedCount: 0
    },
    {
      row: 0,
      column: 0,
      rows: 2,
      columns: 1,
      expectedCount: 1
    },
    {
      row: 1,
      column: 1,
      rows: 3,
      columns: 3,
      expectedCount: 8
    },
    {
      row: 2,
      column: 2,
      rows: 3,
      columns: 3,
      expectedCount: 3
    },
    {
      row: 0,
      column: 2,
      rows: 3,
      columns: 3,
      expectedCount: 3
    },
    {
      row: 0,
      column: 1,
      rows: 3,
      columns: 3,
      expectedCount: 5
    }
  ]

  testCases.forEach(test => {
    equal(SweeperCraftGame.getNeighbors(test.row, test.column, test.rows, test.columns).length, test.expectedCount)
  })
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)

export { testTree }
