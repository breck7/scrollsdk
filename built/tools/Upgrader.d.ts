import TreeNode from "../base/TreeNode";
import jTreeTypes from "../jTreeTypes";
interface updatedFile {
    tree: TreeNode;
    path: jTreeTypes.absoluteFilePath;
}
declare abstract class Upgrader extends TreeNode {
    upgradeManyInPlace(globPatterns: jTreeTypes.globPattern[], fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion): this;
    upgradeManyPreview(globPatterns: jTreeTypes.globPattern[], fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion): updatedFile[];
    private _upgradeMany;
    abstract getUpgradeFromMap(): jTreeTypes.upgradeFromMap;
    upgrade(code: TreeNode, fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion): TreeNode;
}
export default Upgrader;
