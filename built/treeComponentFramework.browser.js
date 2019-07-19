"use strict";
// const { AbstractWillowProgram } = require("./willow/Willow.js")
class AbstractCommander {
    constructor(target) {
        this._target = target;
    }
    getTarget() {
        return this._target;
    }
}
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
window.AbstractTreeComponentRootNode = AbstractTreeComponentRootNode;
window.AbstractTreeComponent = AbstractTreeComponent;
window.AbstractCommander = AbstractCommander;
const WillowConstants = {};
WillowConstants.ShadowEvents = {};
WillowConstants.ShadowEvents.click = "click";
WillowConstants.ShadowEvents.change = "change";
WillowConstants.ShadowEvents.mouseover = "mouseover";
WillowConstants.ShadowEvents.mouseout = "mouseout";
WillowConstants.ShadowEvents.mousedown = "mousedown";
WillowConstants.ShadowEvents.contextmenu = "contextmenu";
WillowConstants.ShadowEvents.keypress = "keypress";
WillowConstants.ShadowEvents.keyup = "keyup";
WillowConstants.ShadowEvents.focus = "focus";
WillowConstants.ShadowEvents.mousemove = "mousemove";
WillowConstants.ShadowEvents.dblclick = "dblclick";
WillowConstants.ShadowEvents.submit = "submit";
WillowConstants.ShadowEvents.blur = "blur";
WillowConstants.ShadowEvents.paste = "paste";
WillowConstants.ShadowEvents.copy = "copy";
WillowConstants.ShadowEvents.resize = "resize";
WillowConstants.ShadowEvents.cut = "cut";
WillowConstants.ShadowEvents.drop = "drop";
WillowConstants.ShadowEvents.dragover = "dragover";
WillowConstants.ShadowEvents.dragenter = "dragenter";
WillowConstants.ShadowEvents.dragleave = "dragleave";
WillowConstants.ShadowEvents.ready = "ready";
// todo: cleanup
WillowConstants.titleTag = "titleTag";
WillowConstants.styleTag = "styleTag";
WillowConstants.tagMap = {};
WillowConstants.tagMap[WillowConstants.styleTag] = "style";
WillowConstants.tagMap[WillowConstants.titleTag] = "title";
WillowConstants.tags = {};
WillowConstants.tags.html = "html";
WillowConstants.tags.head = "head";
WillowConstants.tags.body = "body";
WillowConstants.stumpCollapseNode = "stumpCollapseNode";
WillowConstants.uidAttribute = "stumpUid";
WillowConstants.class = "class";
WillowConstants.type = "type";
WillowConstants.value = "value";
WillowConstants.name = "name";
WillowConstants.checkbox = "checkbox";
WillowConstants.checkedSelector = ":checked";
WillowConstants.contenteditable = "contenteditable";
WillowConstants.inputTypes = ["input", "textarea"];
var CacheType;
(function (CacheType) {
    CacheType["inBrowserMemory"] = "inBrowserMemory";
})(CacheType || (CacheType = {}));
class WillowHTTPResponse {
    constructor(superAgentResponse) {
        this._cacheType = CacheType.inBrowserMemory;
        this._fromCache = false;
        this._cacheTime = Date.now();
        this._superAgentResponse = superAgentResponse;
        this._mimeType = superAgentResponse && superAgentResponse.type;
    }
    // todo: ServerMemoryCacheTime and ServerMemoryDiskCacheTime
    get cacheTime() {
        return this._cacheTime;
    }
    get cacheType() {
        return this._cacheType;
    }
    get body() {
        return this._superAgentResponse && this._superAgentResponse.body;
    }
    get text() {
        if (this._text === undefined)
            this._text =
                this._superAgentResponse && this._superAgentResponse.text ? this._superAgentResponse.text : this.body ? JSON.stringify(this.body, null, 2) : "";
        return this._text;
    }
    get asJson() {
        return this.body ? this.body : JSON.parse(this.text);
    }
    get fromCache() {
        return this._fromCache;
    }
    setFromCache(val) {
        this._fromCache = val;
        return this;
    }
    getParsedDataOrText() {
        if (this._mimeType === "text/csv")
            return this.text;
        return this.body || this.text;
    }
}
class WillowHTTPProxyCacheResponse extends WillowHTTPResponse {
    constructor(proxyServerResponse) {
        super();
        this._proxyServerResponse = proxyServerResponse;
        this._cacheType = proxyServerResponse.body.cacheType;
        this._cacheTime = proxyServerResponse.body.cacheTime;
        this._text = proxyServerResponse.body.text;
    }
}
class AbstractWillowShadow {
    constructor(stumpNode) {
        this._stumpNode = stumpNode;
    }
    getShadowStumpNode() {
        return this._stumpNode;
    }
    getShadowValue() {
        return this._val;
    }
    removeShadow() {
        return this;
    }
    setInputOrTextAreaValue(value) {
        this._val = value;
        return this;
    }
    getShadowParent() {
        return this.getShadowStumpNode()
            .getParent()
            .getShadow();
    }
    getPositionAndDimensions(gridSize = 1) {
        const offset = this.getShadowOffset();
        const parentOffset = this.getShadowParent().getShadowOffset();
        return {
            left: Math.floor((offset.left - parentOffset.left) / gridSize),
            top: Math.floor((offset.top - parentOffset.top) / gridSize),
            width: Math.floor(this.getShadowWidth() / gridSize),
            height: Math.floor(this.getShadowHeight() / gridSize)
        };
    }
    shadowHasClass(name) {
        return false;
    }
    getShadowAttr(name) {
        return "";
    }
    makeResizable(options) {
        return this;
    }
    makeDraggable(options) {
        return this;
    }
    makeSelectable(options) {
        return this;
    }
    isShadowChecked() {
        return false;
    }
    getShadowHtml() {
        return "";
    }
    getShadowOffset() {
        return { left: 111, top: 111 };
    }
    getShadowWidth() {
        return 111;
    }
    getShadowHeight() {
        return 111;
    }
    isShadowResizable() {
        return false;
    }
    setShadowAttr(name, value) {
        return this;
    }
    isShadowDraggable() {
        return this.shadowHasClass("draggable");
    }
    toggleShadow() { }
    addClassToShadow(className) { }
    removeClassFromShadow(className) {
        return this;
    }
    onShadowEvent(event, selector, fn) {
        // todo:
        return this;
    }
    offShadowEvent(event, fn) {
        // todo:
        return this;
    }
    triggerShadowEvent(name) {
        return this;
    }
    getShadowPosition() {
        return {
            left: 111,
            top: 111
        };
    }
    getShadowOuterHeight() {
        return 11;
    }
    getShadowOuterWidth() {
        return 11;
    }
    getShadowCss(property) {
        return "";
    }
    setShadowCss(css) {
        return this;
    }
    insertHtmlNode(childNode, index) { }
    getShadowElement() { }
}
class WillowShadow extends AbstractWillowShadow {
}
class WillowStore {
    constructor() {
        this._values = {};
    }
    get(key) {
        return this._values[key];
    }
    set(key, value) {
        this._values[key] = value;
        return this;
    }
    remove(key) {
        delete this._values[key];
    }
    each(fn) {
        Object.keys(this._values).forEach(key => {
            fn(this._values[key], key);
        });
    }
    clearAll() {
        this._values = {};
    }
}
class WillowMousetrap {
    constructor() {
        this.prototype = {};
    }
    bind() { }
}
// this one should have no document, window, $, et cetera.
class AbstractWillowProgram extends stump {
    constructor(baseUrl) {
        super(`${WillowConstants.tags.html}
 ${WillowConstants.tags.head}
 ${WillowConstants.tags.body}`);
        this._offlineMode = false;
        this._httpGetResponseCache = {};
        this.location = {};
        this._htmlStumpNode = this.nodeAt(0);
        this._headStumpNode = this.nodeAt(0).nodeAt(0);
        this._bodyStumpNode = this.nodeAt(0).nodeAt(1);
        this.addSuidsToHtmlHeadAndBodyShadows();
        const baseUrlWithoutTrailingPath = baseUrl.replace(/\/[^\/]*$/, "/");
        this._baseUrl = baseUrlWithoutTrailingPath;
        const uri = new miuri(baseUrl);
        this.location.port = uri.port();
        this.location.protocol = uri.protocol();
        this.location.hostname = uri.hostname();
        this.location.host = uri.host();
    }
    _getPort() {
        return this.location.port ? ":" + this.location.port : "";
    }
    queryObjectToQueryString(obj) {
        return "";
    }
    toPrettyDeepLink(treeCode, queryObject) {
        // todo: move things to a constant.
        const yi = "~";
        const xi = "_";
        const obj = Object.assign({}, queryObject);
        if (!treeCode.includes(yi) && !treeCode.includes(xi)) {
            obj.yi = yi;
            obj.xi = xi;
            obj.data = encodeURIComponent(treeCode.replace(/ /g, xi).replace(/\n/g, yi));
        }
        else
            obj.data = encodeURIComponent(treeCode);
        return this.getBaseUrl() + "?" + this.queryObjectToQueryString(obj);
    }
    getHost() {
        return this.location.host;
    }
    reload() { }
    toggleOfflineMode() {
        this._offlineMode = !this._offlineMode;
    }
    addSuidsToHtmlHeadAndBodyShadows() { }
    getShadowClass() {
        return WillowShadow;
    }
    getMockMouseEvent() {
        return {
            clientX: 0,
            clientY: 0,
            offsetX: 0,
            offsetY: 0
        };
    }
    toggleFullScreen() { }
    getMousetrap() {
        if (!this._mousetrap)
            this._mousetrap = new WillowMousetrap();
        return this._mousetrap;
    }
    _getFocusedShadow() {
        return this._focusedShadow || this.getBodyStumpNode().getShadow();
    }
    getHeadStumpNode() {
        return this._headStumpNode;
    }
    getBodyStumpNode() {
        return this._bodyStumpNode;
    }
    getHtmlStumpNode() {
        return this._htmlStumpNode;
    }
    getStore() {
        if (!this._store)
            this._store = new WillowStore();
        return this._store;
    }
    someInputHasFocus() {
        const focusedShadow = this._getFocusedShadow();
        if (!focusedShadow)
            return false;
        const stumpNode = focusedShadow.getShadowStumpNode();
        return stumpNode && stumpNode.isInputType();
    }
    copyTextToClipboard(text) { }
    setCopyData(evt, str) { }
    getBaseUrl() {
        return this._baseUrl;
    }
    _makeRelativeUrlAbsolute(url) {
        if (url.startsWith("http://") || url.startsWith("https://"))
            return url;
        return this.getBaseUrl() + url;
    }
    async httpGetUrl(url, queryStringObject, responseClass = WillowHTTPResponse) {
        if (this._offlineMode)
            return new WillowHTTPResponse();
        const superAgentResponse = await superagent
            .get(this._makeRelativeUrlAbsolute(url))
            .query(queryStringObject)
            .set(this._headers || {});
        return new responseClass(superAgentResponse);
    }
    _getFromResponseCache(cacheKey) {
        const hit = this._httpGetResponseCache[cacheKey];
        if (hit)
            hit.setFromCache(true);
        return hit;
    }
    _setInResponseCache(url, res) {
        this._httpGetResponseCache[url] = res;
        return this;
    }
    async httpGetUrlFromCache(url, queryStringMap = {}, responseClass = WillowHTTPResponse) {
        const cacheKey = url + JSON.stringify(queryStringMap);
        const cacheHit = this._getFromResponseCache(cacheKey);
        if (!cacheHit) {
            const res = await this.httpGetUrl(url, queryStringMap, responseClass);
            this._setInResponseCache(cacheKey, res);
            return res;
        }
        return cacheHit;
    }
    async httpGetUrlFromProxyCache(url) {
        if (!this.isDesktopVersion())
            return this.httpGetUrlFromCache(url);
        const queryStringMap = {};
        queryStringMap.url = url;
        queryStringMap.cacheOnServer = "true";
        return await this.httpGetUrlFromCache("/proxy", queryStringMap, WillowHTTPProxyCacheResponse);
    }
    async httpPostUrl(url, data) {
        if (this._offlineMode)
            return new WillowHTTPResponse();
        const superAgentResponse = await superagent
            .post(this._makeRelativeUrlAbsolute(url))
            .set(this._headers || {})
            .send(data);
        return new WillowHTTPResponse(superAgentResponse);
    }
    encodeURIComponent(str) {
        return encodeURIComponent(str);
    }
    downloadFile(data, filename, filetype) {
        // noop
    }
    async appendScript(url) { }
    getWindowTitle() {
        // todo: deep getNodeByBase/withBase/type/word or something?
        const nodes = this.getTopDownArray();
        const titleNode = nodes.find(node => node.getFirstWord() === WillowConstants.titleTag);
        return titleNode ? titleNode.getContent() : "";
    }
    setWindowTitle(value) {
        const nodes = this.getTopDownArray();
        const headNode = nodes.find(node => node.getFirstWord() === WillowConstants.tags.head);
        headNode.touchNode(WillowConstants.titleTag).setContent(value);
        return this;
    }
    _getHostname() {
        return this.location.hostname || "";
    }
    openUrl(link) {
        // noop in willow
    }
    getPageHtml() {
        return this.getHtmlStumpNode().toHtmlWithSuids();
    }
    getStumpNodeFromElement(el) { }
    setPasteHandler(fn) {
        return this;
    }
    setErrorHandler(fn) {
        return this;
    }
    setCopyHandler(fn) {
        return this;
    }
    setCutHandler(fn) {
        return this;
    }
    setResizeEndHandler(fn) {
        return this;
    }
    async confirmThen(message) {
        return true;
    }
    async promptThen(message, value) {
        return value;
    }
    // todo: refactor. should be able to override this.
    isDesktopVersion() {
        return this._getHostname() === "localhost";
    }
    setLoadedDroppedFileHandler(callback, helpText = "") { }
    getWindowSize() {
        return {
            width: 1111,
            height: 1111
        };
    }
    getDocumentSize() {
        return this.getWindowSize();
    }
    isExternalLink(link) {
        if (link && link.substr(0, 1) === "/")
            return false;
        if (!link.includes("//"))
            return false;
        const hostname = this._getHostname();
        const uri = new miuri(link);
        return uri.hostname() && hostname !== uri.hostname();
    }
    forceRepaint() { }
    blurFocusedInput() { }
}
window.AbstractWillowProgram = AbstractWillowProgram;
window.AbstractWillowShadow = AbstractWillowShadow;
window.WillowConstants = WillowConstants;
class WillowBrowserShadow extends AbstractWillowShadow {
    _getJQElement() {
        // todo: speedup?
        if (!this._cachedEl)
            this._cachedEl = jQuery(`[${WillowConstants.uidAttribute}="${this.getShadowStumpNode()._getUid()}"]`);
        return this._cachedEl;
    }
    getShadowElement() {
        return this._getJQElement()[0];
    }
    getShadowPosition() {
        return this._getJQElement().position();
    }
    shadowHasClass(name) {
        return this._getJQElement().hasClass(name);
    }
    getShadowHtml() {
        return this._getJQElement().html();
    }
    getShadowValue() {
        // todo: cleanup, add tests
        if (this.getShadowStumpNode().isInputType())
            return this._getJQElement().val();
        return this._getJQElement().val() || this.getShadowValueFromAttr();
    }
    getShadowValueFromAttr() {
        return this._getJQElement().attr(WillowConstants.value);
    }
    getShadowOuterHeight() {
        return this._getJQElement().outerHeight();
    }
    getShadowOuterWidth() {
        return this._getJQElement().outerWidth();
    }
    isShadowChecked() {
        return this._getJQElement().is(WillowConstants.checkedSelector);
    }
    getShadowWidth() {
        return this._getJQElement().width();
    }
    getShadowHeight() {
        return this._getJQElement().height();
    }
    getShadowOffset() {
        return this._getJQElement().offset();
    }
    getShadowAttr(name) {
        return this._getJQElement().attr(name);
    }
    _logMessage(type) {
        if (true)
            return true;
        WillowBrowserShadow._shadowUpdateNumber++;
        console.log(`DOM Update ${WillowBrowserShadow._shadowUpdateNumber}: ${type}`);
    }
    getShadowCss(prop) {
        return this._getJQElement().css(prop);
    }
    isShadowResizable() {
        return this._getJQElement().find(".ui-resizable-handle").length > 0;
    }
    triggerShadowEvent(event) {
        this._getJQElement().trigger(event);
        this._logMessage("trigger");
        return this;
    }
    // BEGIN MUTABLE METHODS:
    // todo: add tests
    // todo: idea, don't "paint" wall (dont append it to parent, until done.)
    insertHtmlNode(childStumpNode, index) {
        const newChildJqElement = jQuery(childStumpNode.toHtmlWithSuids());
        newChildJqElement.data("stumpNode", childStumpNode); // todo: what do we use this for?
        const jqEl = this._getJQElement();
        // todo: can we virtualize this?
        // would it be a "virtual shadow?"
        if (index === undefined)
            jqEl.append(newChildJqElement);
        else if (index === 0)
            jqEl.prepend(newChildJqElement);
        else
            jQuery(jqEl.children().get(index - 1)).after(newChildJqElement);
        this._logMessage("insert");
    }
    addClassToShadow(className) {
        this._getJQElement().addClass(className);
        this._logMessage("addClass");
        return this;
    }
    removeClassFromShadow(className) {
        this._getJQElement().removeClass(className);
        this._logMessage("removeClass");
        return this;
    }
    onShadowEvent(event, two, three) {
        this._getJQElement().on(event, two, three);
        this._logMessage("bind on");
        return this;
    }
    offShadowEvent(event, fn) {
        this._getJQElement().off(event, fn);
        this._logMessage("bind off");
        return this;
    }
    toggleShadow() {
        this._getJQElement().toggle();
        this._logMessage("toggle");
        return this;
    }
    makeResizable(options) {
        this._getJQElement().resizable(options);
        this._logMessage("resizable");
        return this;
    }
    removeShadow() {
        this._getJQElement().remove();
        this._logMessage("remove");
        return this;
    }
    setInputOrTextAreaValue(value) {
        this._getJQElement().val(value);
        this._logMessage("val");
        return this;
    }
    setShadowAttr(name, value) {
        this._getJQElement().attr(name, value);
        this._logMessage("attr");
        return this;
    }
    makeDraggable(options) {
        this._logMessage("draggable");
        this._getJQElement().draggable(options);
        return this;
    }
    setShadowCss(css) {
        this._getJQElement().css(css);
        this._logMessage("css");
        return this;
    }
    makeSelectable(options) {
        this._getJQElement().selectable(options);
        this._logMessage("selectable");
        return this;
    }
}
WillowBrowserShadow._shadowUpdateNumber = 0; // todo: what is this for, debugging perf?
// same thing, except with side effects.
class WillowBrowserProgram extends AbstractWillowProgram {
    findStumpNodesByShadowClass(className) {
        const stumpNodes = [];
        const that = this;
        jQuery("." + className).each(function () {
            stumpNodes.push(that.getStumpNodeFromElement(this));
        });
        return stumpNodes;
    }
    queryObjectToQueryString(obj) {
        return jQuery.param(obj);
    }
    addSuidsToHtmlHeadAndBodyShadows() {
        jQuery(WillowConstants.tags.html).attr(WillowConstants.uidAttribute, this.getHtmlStumpNode()._getUid());
        jQuery(WillowConstants.tags.head).attr(WillowConstants.uidAttribute, this.getHeadStumpNode()._getUid());
        jQuery(WillowConstants.tags.body).attr(WillowConstants.uidAttribute, this.getBodyStumpNode()._getUid());
    }
    getShadowClass() {
        return WillowBrowserShadow;
    }
    setCopyHandler(fn) {
        jQuery(document).on(WillowConstants.ShadowEvents.copy, fn);
        return this;
    }
    setCutHandler(fn) {
        jQuery(document).on(WillowConstants.ShadowEvents.cut, fn);
        return this;
    }
    setPasteHandler(fn) {
        window.addEventListener(WillowConstants.ShadowEvents.paste, fn, false);
        return this;
    }
    setErrorHandler(fn) {
        window.addEventListener("error", fn);
        window.addEventListener("unhandledrejection", fn);
        return this;
    }
    toggleFullScreen() {
        const doc = document;
        if ((doc.fullScreenElement && doc.fullScreenElement !== null) || (!doc.mozFullScreen && !doc.webkitIsFullScreen)) {
            if (doc.documentElement.requestFullScreen)
                doc.documentElement.requestFullScreen();
            else if (doc.documentElement.mozRequestFullScreen)
                doc.documentElement.mozRequestFullScreen();
            else if (doc.documentElement.webkitRequestFullScreen)
                doc.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        else {
            if (doc.cancelFullScreen)
                doc.cancelFullScreen();
            else if (doc.mozCancelFullScreen)
                doc.mozCancelFullScreen();
            else if (doc.webkitCancelFullScreen)
                doc.webkitCancelFullScreen();
        }
    }
    setCopyData(evt, str) {
        const originalEvent = evt.originalEvent;
        originalEvent.preventDefault();
        originalEvent.clipboardData.setData("text/plain", str);
        originalEvent.clipboardData.setData("text/html", str);
    }
    getMousetrap() {
        return window.Mousetrap;
    }
    copyTextToClipboard(text) {
        // http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
        const textArea = document.createElement("textarea");
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            const successful = document.execCommand("copy");
        }
        catch (err) { }
        document.body.removeChild(textArea);
    }
    getStore() {
        return window.store;
    }
    getHost() {
        return location.host;
    }
    _getHostname() {
        return location.hostname;
    }
    async appendScript(url) {
        if (!url)
            return undefined;
        if (!this._loadingPromises)
            this._loadingPromises = {};
        if (this._loadingPromises[url])
            return this._loadingPromises[url];
        if (this.isNodeJs())
            return undefined;
        this._loadingPromises[url] = this._appendScript(url);
        return this._loadingPromises[url];
    }
    _appendScript(url) {
        //https://bradb.net/blog/promise-based-js-script-loader/
        return new Promise(function (resolve, reject) {
            let resolved = false;
            const scriptEl = document.createElement("script");
            scriptEl.type = "text/javascript";
            scriptEl.src = url;
            scriptEl.async = true;
            scriptEl.onload = scriptEl.onreadystatechange = function () {
                if (!resolved && (!this.readyState || this.readyState == "complete")) {
                    resolved = true;
                    resolve(this);
                }
            };
            scriptEl.onerror = scriptEl.onabort = reject;
            document.head.appendChild(scriptEl);
        });
    }
    downloadFile(data, filename, filetype) {
        const downloadLink = document.createElement("a");
        downloadLink.setAttribute("href", `data:${filetype},` + encodeURIComponent(data));
        downloadLink.setAttribute("download", filename);
        downloadLink.click();
    }
    reload() {
        window.location.reload();
    }
    openUrl(link) {
        window.open(link);
    }
    setResizeEndHandler(fn) {
        let resizeTimer;
        $(window).on(WillowConstants.ShadowEvents.resize, evt => {
            const target = $(evt.target);
            if (target.is("div"))
                return; // dont resize on div resizes
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                fn({ width: target.width(), height: target.height() });
            }, 100);
        });
        return this;
    }
    getStumpNodeFromElement(el) {
        const jqEl = jQuery(el);
        return this.getHtmlStumpNode().getNodeByGuid(parseInt(jqEl.attr(WillowConstants.uidAttribute)));
    }
    forceRepaint() {
        jQuery(window).width();
    }
    getBrowserHtml() {
        return document.documentElement.outerHTML;
    }
    async confirmThen(message) {
        return confirm(message);
    }
    async promptThen(message, value) {
        return prompt(message, value);
    }
    getWindowSize() {
        const windowStumpNode = jQuery(window);
        return {
            width: windowStumpNode.width(),
            height: windowStumpNode.height()
        };
    }
    getDocumentSize() {
        const documentStumpNode = jQuery(document);
        return {
            width: documentStumpNode.width(),
            height: documentStumpNode.height()
        };
    }
    // todo: denote the side effect
    blurFocusedInput() {
        // todo: test against browser.
        ;
        document.activeElement.blur();
    }
    setLoadedDroppedFileHandler(callback, helpText = "") {
        const bodyStumpNode = this.getBodyStumpNode();
        const bodyShadow = bodyStumpNode.getShadow();
        // Added the below to ensure dragging from the chrome downloads bar works
        // http://stackoverflow.com/questions/19526430/drag-and-drop-file-uploads-from-chrome-downloads-bar
        const handleChromeBug = event => {
            const originalEvent = event.originalEvent;
            const effect = originalEvent.dataTransfer.effectAllowed;
            originalEvent.dataTransfer.dropEffect = effect === "move" || effect === "linkMove" ? "move" : "copy";
        };
        const dragoverHandler = event => {
            handleChromeBug(event);
            event.preventDefault();
            event.stopPropagation();
            if (!bodyStumpNode.stumpNodeHasClass("dragOver")) {
                bodyStumpNode.insertChildNode(`div ${helpText}
 id dragOverHelp`);
                bodyStumpNode.addClassToStumpNode("dragOver");
                // Add the help, and then hopefull we'll get a dragover event on the dragOverHelp, then
                // 50ms later, add the dragleave handler, and from now on drag leave will only happen on the help
                // div
                setTimeout(function () {
                    bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.dragleave, dragleaveHandler);
                }, 50);
            }
        };
        const dragleaveHandler = event => {
            event.preventDefault();
            event.stopPropagation();
            bodyStumpNode.removeClassFromStumpNode("dragOver");
            bodyStumpNode.findStumpNodeByChild("id dragOverHelp").removeStumpNode();
            bodyShadow.offShadowEvent(WillowConstants.ShadowEvents.dragleave, dragleaveHandler);
        };
        const dropHandler = async (event) => {
            event.preventDefault();
            event.stopPropagation();
            bodyStumpNode.removeClassFromStumpNode("dragOver");
            bodyStumpNode.findStumpNodeByChild("id dragOverHelp").removeStumpNode();
            const droppedItems = event.originalEvent.dataTransfer.items;
            // NOTE: YOU NEED TO STAY IN THE "DROP" EVENT, OTHERWISE THE DATATRANSFERITEMS MUTATE
            // (BY DESIGN) https://bugs.chromium.org/p/chromium/issues/detail?id=137231
            // DO NOT ADD AN AWAIT IN THIS LOOP. IT WILL BREAK.
            const items = [];
            for (let droppedItem of droppedItems) {
                const entry = droppedItem.webkitGetAsEntry();
                items.push(this._handleDroppedEntry(entry));
            }
            const results = await Promise.all(items);
            callback(results);
        };
        bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.dragover, dragoverHandler);
        bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.drop, dropHandler);
        // todo: why do we do this?
        bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.dragenter, function (event) {
            event.preventDefault();
            event.stopPropagation();
        });
    }
    _handleDroppedEntry(item, path = "") {
        // http://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree
        // http://stackoverflow.com/questions/6756583/prevent-browser-from-loading-a-drag-and-dropped-file
        return item.isFile ? this._handleDroppedFile(item) : this._handleDroppedDirectory(item, path);
    }
    _handleDroppedDirectory(item, path) {
        return new Promise((resolve, reject) => {
            item.createReader().readEntries(async (entries) => {
                const promises = [];
                for (let i = 0; i < entries.length; i++) {
                    promises.push(this._handleDroppedEntry(entries[i], path + item.name + "/"));
                }
                const res = await Promise.all(promises);
                resolve(res);
            });
        });
    }
    _handleDroppedFile(file) {
        // https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
        // http://www.sitepoint.com/html5-javascript-open-dropped-files/
        return new Promise((resolve, reject) => {
            file.file(data => {
                const reader = new FileReader();
                reader.onload = evt => {
                    resolve({ data: evt.target.result, filename: data.name });
                };
                reader.onerror = err => reject(err);
                reader.readAsText(data);
            });
        });
    }
    _getFocusedShadow() {
        const stumpNode = this.getStumpNodeFromElement(document.activeElement);
        return stumpNode && stumpNode.getShadow();
    }
    static startApp(appClass, startState) {
        document.addEventListener("DOMContentLoaded", () => {
            const win = window;
            if (!win.app) {
                win.app = new appClass(startState);
                win.app.renderAndGetRenderResult(win.app.getWillowProgram().getBodyStumpNode());
            }
        }, false);
    }
}
window.WillowBrowserProgram = WillowBrowserProgram;
