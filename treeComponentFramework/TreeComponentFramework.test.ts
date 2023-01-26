#!/usr/bin/env ts-node

import { AbstractTreeComponent } from "./TreeComponentFramework"
const { TreeNode } = require("../products/TreeNode.js")
const { TestRacer } = require("../products/TestRacer.js")

const testTree: any = {}

class TestApp extends AbstractTreeComponent {
  createParser() {
    return new TreeNode.Parser(undefined, {
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
  equal(!!app.willowBrowser, true, "get willow")

  equal(app.willowBrowser.toPrettyDeepLink(`foo bar`, { filename: "bam.foo" }), "http://localhost:8000/index.html?filename=bam.foo&nodeBreakSymbol=%7E&edgeSymbol=_&data=foo_bar")
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)

export { testTree }
