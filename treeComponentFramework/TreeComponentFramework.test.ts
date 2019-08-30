#!/usr/bin/env ts-node

import { AbstractTreeComponentRootNode, AbstractTreeComponent } from "./TreeComponentFramework"
const { jtree } = require("../index.js")

const testTree: any = {}

class TestApp extends AbstractTreeComponentRootNode {
  getDefaultStartState() {
    return "headerComponent"
  }

  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      headerComponent: headerComponent
    })
  }
}

class headerComponent extends AbstractTreeComponent {}

testTree.all = (equal: any) => {
  // Arrange
  const app = new TestApp()

  // Assert
  equal(!!app.getTheme(), true, "get theme")
  equal(!!app.getWillowProgram(), true, "get willow")
  equal(!!app.getDefaultStartState(), true, "headerComponent")
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../products/jtree.node.js").Utils.runTestTree(testTree)
export { testTree }
