import { TreeNode } from "./TreeNode"
import { treeNotationTypes } from "../products/treeNotationTypes"
import { TreeUtils } from "./TreeUtils"

interface updatedFile {
  tree: TreeNode
  path: treeNotationTypes.absoluteFilePath
}

abstract class Upgrader extends TreeNode {
  upgradeManyInPlace(
    globPatterns: treeNotationTypes.globPattern[],
    fromVersion: treeNotationTypes.semanticVersion,
    toVersion?: treeNotationTypes.semanticVersion
  ) {
    this._upgradeMany(globPatterns, fromVersion, toVersion).forEach(file => file.tree.toDisk(file.path))
    return this
  }

  upgradeManyPreview(
    globPatterns: treeNotationTypes.globPattern[],
    fromVersion: treeNotationTypes.semanticVersion,
    toVersion?: treeNotationTypes.semanticVersion
  ) {
    return this._upgradeMany(globPatterns, fromVersion, toVersion)
  }

  private _upgradeMany(
    globPatterns: treeNotationTypes.globPattern[],
    fromVersion: treeNotationTypes.semanticVersion,
    toVersion?: treeNotationTypes.semanticVersion
  ): updatedFile[] {
    const glob = this.require("glob")
    const files = TreeUtils.flatten(<any>globPatterns.map(pattern => glob.sync(pattern)))
    console.log(`${files.length} files to upgrade`)
    return files.map((path: treeNotationTypes.absoluteFilePath) => {
      console.log("Upgrading " + path)
      return {
        tree: this.upgrade(TreeNode.fromDisk(path), fromVersion, toVersion),
        path: path
      }
    })
  }

  abstract getUpgradeFromMap(): treeNotationTypes.upgradeFromMap

  upgrade(code: TreeNode, fromVersion: treeNotationTypes.semanticVersion, toVersion?: treeNotationTypes.semanticVersion): TreeNode {
    const updateFromMap = this.getUpgradeFromMap()
    const semver = this.require("semver")
    let fromMap: treeNotationTypes.upgradeToMap
    while ((fromMap = updateFromMap[fromVersion])) {
      const toNextVersion = Object.keys(fromMap)[0] // todo: currently we just assume 1 step at a time
      if (semver.lt(toVersion, toNextVersion)) break
      const fn = Object.values(fromMap)[0]
      code = fn(code)
      fromVersion = toNextVersion
    }
    return code
  }
}

export { Upgrader }
