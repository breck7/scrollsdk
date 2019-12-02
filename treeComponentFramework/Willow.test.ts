#!/usr/bin/env ts-node

import { WillowBrowser } from "./TreeComponentFramework"

const { jtree } = require("../index.js")

const testTree: any = {}

testTree.all = (equal: any) => {
  // Arrange
  const willow2 = new WillowBrowser("http://localhost:8000/index.html")

  // Act
  willow2.setWindowTitle("willow2")
  // Assert
  equal(willow2.getWindowTitle(), "willow2", "set title works")

  // Act
  const bodyStumpNode = willow2.getBodyStumpNode()
  bodyStumpNode.addClassToStumpNode("someClass")
  // Assert
  equal(bodyStumpNode.get("class"), "someClass")
  equal(bodyStumpNode.stumpNodeHasClass("someClass"), true)

  // Act
  bodyStumpNode.removeClassFromStumpNode("someClass")
  // Assert
  equal(bodyStumpNode.stumpNodeHasClass("someClass"), false)

  // Act
  bodyStumpNode.insertChildNode(`h6 Hello world
 class header`)
  const html = willow2.getPageHtml()

  // Assert
  equal(html.includes(`Hello world</h6>`), true, "hello world included")
  equal(bodyStumpNode.findStumpNodesByChild("class header").length, 1, "found stumpNodes")
  equal(bodyStumpNode.findStumpNodeByFirstWord("h6").getLine(), "h6 Hello world")
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)
export { testTree }
