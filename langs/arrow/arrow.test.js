#! /usr/bin/env node

const arrow = require("../../products/arrow.nodejs.js")
const { TestRacer } = require("../../products/TestRacer.js")
const { TreeBaseFolder } = require("../../products/treeBase.node.js")

const testTree = {}

testTree.sortFromSortTemplate = equal => {
  // Arrange
  const program = new arrow(`charge
 amount 999.0
 token sk_test_4eC39HqLyjWDarjtT1zdp7dc
 currency usd
 cardNumber 1111222233334444
 description Example charge`)
  const charge = program.getNode("charge")

  // Act
  charge.sortFromSortTemplate()

  // Asert
  equal(
    charge.childrenToString(),
    `description Example charge

amount 999.0
currency usd

cardNumber 1111222233334444
token sk_test_4eC39HqLyjWDarjtT1zdp7dc`
  )
}

testTree.rootSort = equal => {
  // Arrange
  const program = new arrow(`charge
 amount 999.0
 token sk_test_4eC39HqLyjWDarjtT1zdp7dc
 currency usd
 cardNumber 1111222233334444
 description Example charge
Comment Here is the charge:`)
  // Act
  program.sortFromSortTemplate()

  // Assert
  equal(
    program.childrenToString(),
    `Comment Here is the charge:
charge
 description Example charge
 
 amount 999.0
 currency usd
 
 cardNumber 1111222233334444
 token sk_test_4eC39HqLyjWDarjtT1zdp7dc`
  )
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)
module.exports = { testTree }
