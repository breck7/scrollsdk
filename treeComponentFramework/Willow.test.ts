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
  const bodyComponentsNode = willow2.getBodyComponentsNode()
  bodyComponentsNode.addClassToComponentsNode("someClass")
  // Assert
  equal(bodyComponentsNode.get("class"), "someClass")
  equal(bodyComponentsNode.componentsNodeHasClass("someClass"), true)

  // Act
  bodyComponentsNode.removeClassFromComponentsNode("someClass")
  // Assert
  equal(bodyComponentsNode.componentsNodeHasClass("someClass"), false)

  // Act
  bodyComponentsNode.insertChildNode(`h6 Hello world
 class header`)
  const html = willow2.getPageHtml()

  // Assert
  equal(html.includes(`Hello world</h6>`), true, "hello world included")
  equal(bodyComponentsNode.findComponentsNodesByChild("class header").length, 1, "found componentsNodes")
  equal(bodyComponentsNode.findComponentsNodeByFirstWord("h6").getLine(), "h6 Hello world")
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)
export { testTree }
