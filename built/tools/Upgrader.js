"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const TreeUtils_1 = require("../base/TreeUtils");
class Upgrader extends TreeNode_1.default {
    upgradeManyInPlace(globPatterns, fromVersion, toVersion) {
        this._upgradeMany(globPatterns, fromVersion, toVersion).forEach(file => file.tree.toDisk(file.path));
        return this;
    }
    upgradeManyPreview(globPatterns, fromVersion, toVersion) {
        return this._upgradeMany(globPatterns, fromVersion, toVersion);
    }
    _upgradeMany(globPatterns, fromVersion, toVersion) {
        const glob = this.require("glob");
        const files = TreeUtils_1.default.flatten(globPatterns.map(pattern => glob.sync(pattern)));
        console.log(`${files.length} files to upgrade`);
        return files.map((path) => {
            console.log("Upgrading " + path);
            return {
                tree: this.upgrade(TreeNode_1.default.fromDisk(path), fromVersion, toVersion),
                path: path
            };
        });
    }
    upgrade(code, fromVersion, toVersion) {
        const updateFromMap = this.getUpgradeFromMap();
        const semver = this.require("semver");
        let fromMap;
        while ((fromMap = updateFromMap[fromVersion])) {
            const toNextVersion = Object.keys(fromMap)[0]; // todo: currently we just assume 1 step at a time
            if (semver.lt(toVersion, toNextVersion))
                break;
            const fn = Object.values(fromMap)[0];
            code = fn(code);
            fromVersion = toNextVersion;
        }
        return code;
    }
}
exports.default = Upgrader;
