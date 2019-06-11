import TreeNode from "../base/TreeNode";
import jTreeTypes from "../jTreeTypes";
interface updatedFile {
    content: string;
    path: jTreeTypes.asboluteFilePath;
}
declare abstract class Upgrader extends TreeNode {
    upgradeManyInPlace(globPatterns: jTreeTypes.globPattern[], fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion): this;
    upgradeManyPreview(globPatterns: jTreeTypes.globPattern[], fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion): updatedFile[];
    private _upgradeMany;
    abstract getUpgradeFromMap(): jTreeTypes.upgradeFromMap;
    upgrade(code: string, fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion): string;
}
export default Upgrader;
