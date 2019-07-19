"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const superagent = require("superagent");
const miuri = require("miuri.js");
const stump = require("../../langs/stump/stump.js");
const WillowConstants = {};
exports.WillowConstants = WillowConstants;
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
exports.AbstractWillowShadow = AbstractWillowShadow;
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
exports.AbstractWillowProgram = AbstractWillowProgram;
