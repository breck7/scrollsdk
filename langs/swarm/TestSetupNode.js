const jtree = require("../../index.js")

const SwarmConstants = require("./SwarmConstants.js")
const SetupConstructorArgNode = require("./SetupConstructorArgNode.js")

class TestSetupNode extends jtree.NonTerminalNode {
  createTestDummy(programFilepath) {
    const requiredClass = this._getRequiredClass(programFilepath)
    const constructorArgNode = this.getChildrenByNodeConstructor(SetupConstructorArgNode)[0]
    const param = constructorArgNode ? constructorArgNode.childrenToString() : undefined
    return this.has(SwarmConstants.static) ? requiredClass : new requiredClass(param)
  }

  isNodeJs() {
    return typeof exports !== "undefined"
  }

  _getRequiredClass(programFilepath) {
    let requiredClass =
      this.get(SwarmConstants.require) ||
      this.getRootNode()
        .getNode(SwarmConstants.setup)
        .get(SwarmConstants.require)
    const requiredClassParts = requiredClass.split(" ") // Allows for ./ExportsClasses.js ChildClass
    requiredClass = requiredClassParts[0]
    let theClass

    if (this.isNodeJs()) theClass = require(jtree.Utils.resolvePath(requiredClass, programFilepath))
    else theClass = window[jtree.Utils.getClassNameFromFilePath(requiredClass)]

    if (requiredClassParts[1]) theClass = jtree.Utils.resolveProperty(theClass, requiredClassParts[1])

    if (!theClass)
      throw new Error(
        `Required class '${requiredClass}${
          requiredClassParts[1] ? " (" + requiredClassParts[1] + ")" : ""
        }' not found for ${this.toString()}`
      )

    return theClass
  }

  executeSync() {}
}

module.exports = TestSetupNode
