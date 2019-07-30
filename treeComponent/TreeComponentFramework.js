"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jtree = require("../index.js");
const stump = require("../langs/stump/stump.js");
const hakon = require("../langs/hakon/hakon.js");
// const { AbstractWillowProgram } = require("./willow/Willow.js")
class AbstractCommander {
    constructor(target) {
        this._target = target;
    }
    getTarget() {
        return this._target;
    }
}
exports.AbstractCommander = AbstractCommander;
class AbstractTheme {
    hakonToCss(str) {
        const hakonProgram = new hakon(str);
        // console.log(hakonProgram.getAllErrors())
        return hakonProgram.compile();
    }
}
class DefaultTheme extends AbstractTheme {
}
class TreeComponentCommander extends AbstractCommander {
    stopPropagationCommand() {
        // intentional noop
    }
    async clearMessageBufferCommand() {
        const treeComponent = this.getTarget();
        delete treeComponent._messageBuffer;
    }
    async unmountAndDestroyCommand() {
        const treeComponent = this.getTarget();
        treeComponent.unmountAndDestroy();
    }
}
class AbstractTreeComponent extends jtree.GrammarBackedNonRootNode {
    getParseErrorCount() {
        if (!this.length)
            return 0;
        return this.getTopDownArray()
            .map(child => child.getParseErrorCount())
            .reduce((sum, num) => sum + num);
    }
    getRootNode() {
        return super.getRootNode();
    }
    getCommander() {
        return new TreeComponentCommander(this);
    }
    getStumpNode() {
        return this._htmlStumpNode;
    }
    getHakon() {
        return "";
    }
    getTheme() {
        return this.getRootNode().getTheme();
    }
    getCommandsBuffer() {
        if (!this._commandsBuffer)
            this._commandsBuffer = [];
        return this._commandsBuffer;
    }
    addToCommandLog(command) {
        this.getCommandsBuffer().push({
            command: command,
            time: this._getProcessTimeInMilliseconds()
        });
    }
    getMessageBuffer() {
        if (!this._messageBuffer)
            this._messageBuffer = new jtree.TreeNode();
        return this._messageBuffer;
    }
    // todo: move this to tree class? or other higher level class?
    addStumpCodeMessageToLog(message) {
        // note: we have 1 parameter, and are going to do type inference first.
        // Todo: add actions that can be taken from a message?
        // todo: add tests
        this.getMessageBuffer().appendLineAndChildren("message", message);
    }
    addStumpErrorMessageToLog(errorMessage) {
        return this.addStumpCodeMessageToLog(`div
 class OhayoError
 bern${jtree.TreeNode.nest(errorMessage, 2)}`);
    }
    logMessageText(message = "") {
        const pre = `pre
 bern${jtree.TreeNode.nest(message, 2)}`;
        return this.addStumpCodeMessageToLog(pre);
    }
    unmount() {
        if (!this.isMounted() // todo: why do we need this check?
        )
            return undefined;
        this._getChildTreeComponents().forEach(child => child.unmount());
        this.treeComponentWillUnmount();
        this._removeCss();
        this._removeHtml();
        delete this._lastRenderedTime;
        this.treeComponentDidUnmount();
    }
    _removeHtml() {
        this._htmlStumpNode.removeStumpNode();
        delete this._htmlStumpNode;
    }
    getStumpCode() {
        return `div
 class ${this.constructor.name}`;
    }
    treeComponentWillMount() { }
    treeComponentDidMount() {
        AbstractTreeComponent._mountedTreeComponents++;
    }
    treeComponentDidUnmount() {
        AbstractTreeComponent._mountedTreeComponents--;
    }
    treeComponentWillUnmount() { }
    forceUpdate() { }
    getNewestTimeToRender() {
        return this._lastTimeToRender;
    }
    _setLastRenderedTime(time) {
        this._lastRenderedTime = time;
        return this;
    }
    // todo: can this be async?
    treeComponentDidUpdate() { }
    _getChildTreeComponents() {
        return this.getChildrenByNodeConstructor(AbstractTreeComponent);
    }
    // todo: delete this
    makeAllDirty() {
        this.makeDirty();
        this._getChildTreeComponents().forEach(child => child.makeAllDirty());
    }
    _hasChildrenTreeComponents() {
        return this._getChildTreeComponents().length > 0;
    }
    // todo: this is hacky. we do it so we can just mount all tiles to wall.
    getStumpNodeForChildren() {
        return this.getStumpNode();
    }
    _getLastRenderedTime() {
        return this._lastRenderedTime;
    }
    // todo: delete this
    makeDirty() {
        this._setLastRenderedTime(0);
    }
    _getCss() {
        return this.getTheme().hakonToCss(this.getHakon());
    }
    _getCssStumpCode() {
        return `styleTag
 stumpStyleFor ${this.constructor.name}
 bern${jtree.TreeNode.nest(this._getCss(), 2)}`;
    }
    isNotATile() {
        // quick hacky way to get around children problem
        return true;
    }
    _updateAndGetUpdateResult() {
        if (!this._shouldTreeComponentUpdate())
            return { treeComponentDidUpdate: false, reason: "_shouldTreeComponentUpdate is false" };
        this._setLastRenderedTime(this._getProcessTimeInMilliseconds());
        this._removeCss();
        this._mountCss();
        // todo: fucking switch to react? looks like we don't update parent because we dont want to nuke children.
        // okay. i see why we might do that for non tile treeComponents. but for Tile treeComponents, seems like we arent nesting, so why not?
        // for now
        if (this.isNotATile() && this._hasChildrenTreeComponents())
            return { treeComponentDidUpdate: false, reason: "is a parent" };
        this.updateHtml();
        this._lastTimeToRender = this._getProcessTimeInMilliseconds() - this._getLastRenderedTime();
        return { treeComponentDidUpdate: true };
    }
    _getWrappedStumpCode(index) {
        return this.getStumpCode();
    }
    updateHtml() {
        const stumpNodeToMountOn = this._htmlStumpNode.getParent();
        const index = this._htmlStumpNode.getIndex();
        this._removeHtml();
        this._mountHtml(stumpNodeToMountOn, index);
    }
    unmountAndDestroy() {
        this.unmount();
        return this.destroy();
    }
    // todo: move to keyword node class?
    toggle(firstWord, contentOptions) {
        const currentNode = this.getNode(firstWord);
        if (!contentOptions)
            return currentNode ? currentNode.unmountAndDestroy() : this.appendLine(firstWord);
        const currentContent = currentNode === undefined ? undefined : currentNode.getContent();
        const index = contentOptions.indexOf(currentContent);
        const newContent = index === -1 || index + 1 === contentOptions.length ? contentOptions[0] : contentOptions[index + 1];
        this.delete(firstWord);
        if (newContent)
            this.touchNode(firstWord).setContent(newContent);
        return newContent;
    }
    isMounted() {
        return !!this._htmlStumpNode;
    }
    // todo: move to base TreeNode?
    getNextOrPrevious(arr) {
        const length = arr.length;
        const index = arr.indexOf(this);
        if (length === 1)
            return undefined;
        if (index === length - 1)
            return arr[index - 1];
        return arr[index + 1];
    }
    toggleAndRender(firstWord, contentOptions) {
        this.toggle(firstWord, contentOptions);
        this.getRootNode().renderAndGetRenderResult();
    }
    _getFirstOutdatedDependency(lastRenderedTime = this._getLastRenderedTime() || 0) {
        return this.getDependencies().find(dep => dep.getMTime() > lastRenderedTime);
    }
    _getReasonForUpdatingOrNot() {
        const mTime = this.getMTime();
        const lastRenderedTime = this._getLastRenderedTime() || 0;
        const staleTime = mTime - lastRenderedTime;
        if (lastRenderedTime === 0)
            return {
                shouldUpdate: true,
                reason: "TreeComponent hasn't been rendered yet",
                staleTime: staleTime
            };
        if (staleTime > 0)
            return {
                shouldUpdate: true,
                reason: "TreeComponent itself changed",
                staleTime: staleTime
            };
        const outdatedDependency = this._getFirstOutdatedDependency(lastRenderedTime);
        if (outdatedDependency)
            return {
                shouldUpdate: true,
                reason: "A dependency changed",
                dependency: outdatedDependency,
                staleTime: outdatedDependency.getMTime() - lastRenderedTime
            };
        return {
            shouldUpdate: false,
            reason: "No render needed",
            lastRenderedTime: lastRenderedTime,
            mTime: mTime
        };
    }
    getDependencies() {
        return [];
    }
    getChildrenThatNeedRendering() {
        const all = [];
        this._getTreeComponentsThatNeedRendering(all);
        return all;
    }
    _shouldTreeComponentUpdate() {
        return this._getReasonForUpdatingOrNot().shouldUpdate;
    }
    _getTreeComponentsThatNeedRendering(arr) {
        this._getChildTreeComponents().forEach((child) => {
            if (!child.isMounted() || child._shouldTreeComponentUpdate())
                arr.push({ child: child, childUpdateBecause: child._getReasonForUpdatingOrNot() });
            child._getTreeComponentsThatNeedRendering(arr);
        });
    }
    _mount(stumpNodeToMountOn, index) {
        this._setLastRenderedTime(this._getProcessTimeInMilliseconds());
        this.treeComponentWillMount();
        this._mountCss();
        this._mountHtml(stumpNodeToMountOn, index); // todo: add index back?
        this._lastTimeToRender = this._getProcessTimeInMilliseconds() - this._getLastRenderedTime();
        return this;
    }
    // todo: we might be able to squeeze virtual dom in here on the mountCss and mountHtml methods.
    _mountCss() {
        // todo: only insert css once per class? have a set?
        this._cssStumpNode = this._getPageHeadStump().insertCssChildNode(this._getCssStumpCode());
    }
    _getPageHeadStump() {
        return this.getRootNode()
            .getWillowProgram()
            .getHeadStumpNode();
    }
    _removeCss() {
        this._cssStumpNode.removeCssStumpNode();
        delete this._cssStumpNode;
    }
    _mountHtml(stumpNodeToMountOn, index) {
        this._htmlStumpNode = stumpNodeToMountOn.insertChildNode(this._getWrappedStumpCode(index), index);
        if (!this._htmlStumpNode.setStumpNodeTreeComponent)
            console.log(this._htmlStumpNode);
        this._htmlStumpNode.setStumpNodeTreeComponent(this);
    }
    _treeComponentDidUpdate() {
        this.treeComponentDidUpdate();
    }
    _treeComponentDidMount() {
        this.treeComponentDidMount();
    }
    compile() {
        const name = this.constructor.name;
        const libPath = "../../built/";
        const libs = ["jtree.browser.js", "stump.browser.js", "hakon.browser.js", "treeComponentFramework.browser.js", this.constructor.name + ".browser.js"]
            .map(path => `  script
   src ${libPath}${path}`)
            .join("\n");
        return new stump(`html
 head
  titleTag ${name}
 body
  script
   src ../../sandbox/lib/jquery.min.js
  script
   src ../../node_modules/miuri.js/lib/miuri.min.js
${libs}
  script
   bern
    WillowBrowserProgram.startApp(${name}, "footer")`).compile();
    }
    renderAndGetRenderResult(stumpNode, index) {
        const isUpdateOp = this.isMounted();
        let treeComponentUpdateResult = {
            treeComponentDidUpdate: false
        };
        if (isUpdateOp)
            treeComponentUpdateResult = this._updateAndGetUpdateResult();
        else
            this._mount(stumpNode, index);
        const stumpNodeForChildren = this.getStumpNodeForChildren();
        // Todo: insert delayed rendering?
        const childResults = this._getChildTreeComponents().map((child, index) => child.renderAndGetRenderResult(stumpNodeForChildren, index));
        if (isUpdateOp) {
            if (treeComponentUpdateResult.treeComponentDidUpdate) {
                try {
                    this._treeComponentDidUpdate();
                }
                catch (err) {
                    console.error(err);
                }
            }
        }
        else {
            try {
                this._treeComponentDidMount();
            }
            catch (err) {
                console.error(err);
            }
        }
        return {
            type: isUpdateOp ? "update" : "mount",
            treeComponentUpdateResult: treeComponentUpdateResult,
            children: childResults
        };
    }
}
AbstractTreeComponent._mountedTreeComponents = 0;
exports.AbstractTreeComponent = AbstractTreeComponent;
class AbstractTreeComponentRootNode extends AbstractTreeComponent {
    getTheme() {
        if (!this._theme)
            this._theme = new DefaultTheme();
        return this._theme;
    }
    getWillowProgram() {
        if (!this._willowProgram) {
            if (this.isNodeJs()) {
                const { WillowProgram } = require("./willow/WillowNode.js");
                this._willowProgram = new WillowProgram("http://localhost:8000/");
            }
            else {
                this._willowProgram = new window.WillowBrowserProgram(window.location.href);
            }
        }
        return this._willowProgram;
    }
}
exports.AbstractTreeComponentRootNode = AbstractTreeComponentRootNode;
