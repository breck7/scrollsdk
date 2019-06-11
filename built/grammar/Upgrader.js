"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
// todo: currently only works in nodejs
const glob = require("glob");
const fs = require("fs");
const semver = require("semver");
class Upgrader extends TreeNode_1.default {
    upgradeManyInPlace(globPatterns, fromVersion, toVersion) {
        this._upgradeMany(globPatterns, fromVersion, toVersion).forEach(file => {
            fs.writeFileSync(file.path, file.content, "utf8");
        });
        return this;
    }
    upgradeManyPreview(globPatterns, fromVersion, toVersion) {
        return this._upgradeMany(globPatterns, fromVersion, toVersion);
    }
    _upgradeMany(globPatterns, fromVersion, toVersion) {
        return globPatterns.map(pattern => glob.sync(pattern)).flat().map((path) => {
            return {
                content: this.upgrade(fs.readFileSync(path, "utf8"), fromVersion, toVersion),
                path: path
            };
        });
    }
    upgrade(code, fromVersion, toVersion) {
        const updateFromMap = this.getUpgradeFromMap();
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
