import TreeNode from "../base/TreeNode"
import jTreeTypes from "../jTreeTypes"

// todo: currently only works in nodejs

const glob = require("glob")
const fs = require("fs")
const semver = require("semver")

interface updatedFile {
  content: string
  path: jTreeTypes.asboluteFilePath
}

abstract class Upgrader extends TreeNode {
  upgradeManyInPlace(globPatterns: jTreeTypes.globPattern[], fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion) {
    this._upgradeMany(globPatterns, fromVersion, toVersion).forEach(file => {
      fs.writeFileSync(file.path, file.content, "utf8")
    })
    return this
  }

  upgradeManyPreview(globPatterns: jTreeTypes.globPattern[], fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion) {
    return this._upgradeMany(globPatterns, fromVersion, toVersion)
  }

  private _upgradeMany(globPatterns: jTreeTypes.globPattern[], fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion): updatedFile[] {
    return (<any>globPatterns.map(pattern => glob.sync(pattern))).flat().map((path: jTreeTypes.asboluteFilePath) => {
      return {
        content: this.upgrade(fs.readFileSync(path, "utf8"), fromVersion, toVersion),
        path: path
      }
    })
  }

  abstract getUpgradeFromMap(): jTreeTypes.upgradeFromMap

  upgrade(code: string, fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion): string {
    const updateFromMap = this.getUpgradeFromMap()
    let fromMap
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

export default Upgrader
