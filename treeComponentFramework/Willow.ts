const superagent = require("superagent")
declare var jQuery: any

import jTreeTypes from "../core/jTreeTypes"

const jtree = require("../products/jtree.node.js")
const stump = require("../langs/stump/stump.node.js")

const WillowConstants: jTreeTypes.stringMap = {}
WillowConstants.ShadowEvents = {}
WillowConstants.ShadowEvents.click = "click"
WillowConstants.ShadowEvents.change = "change"
WillowConstants.ShadowEvents.mouseover = "mouseover"
WillowConstants.ShadowEvents.mouseout = "mouseout"
WillowConstants.ShadowEvents.mousedown = "mousedown"
WillowConstants.ShadowEvents.contextmenu = "contextmenu"
WillowConstants.ShadowEvents.keypress = "keypress"
WillowConstants.ShadowEvents.keyup = "keyup"
WillowConstants.ShadowEvents.focus = "focus"
WillowConstants.ShadowEvents.mousemove = "mousemove"
WillowConstants.ShadowEvents.dblclick = "dblclick"
WillowConstants.ShadowEvents.submit = "submit"
WillowConstants.ShadowEvents.blur = "blur"
WillowConstants.ShadowEvents.paste = "paste"
WillowConstants.ShadowEvents.copy = "copy"
WillowConstants.ShadowEvents.resize = "resize"
WillowConstants.ShadowEvents.cut = "cut"
WillowConstants.ShadowEvents.drop = "drop"
WillowConstants.ShadowEvents.dragover = "dragover"
WillowConstants.ShadowEvents.dragenter = "dragenter"
WillowConstants.ShadowEvents.dragleave = "dragleave"
WillowConstants.ShadowEvents.ready = "ready"

// todo: cleanup
WillowConstants.titleTag = "titleTag"
WillowConstants.styleTag = "styleTag"
WillowConstants.tagMap = {}
WillowConstants.tagMap[WillowConstants.styleTag] = "style"
WillowConstants.tagMap[WillowConstants.titleTag] = "title"
WillowConstants.tags = {}
WillowConstants.tags.html = "html"
WillowConstants.tags.head = "head"
WillowConstants.tags.body = "body"
WillowConstants.stumpCollapseNode = "stumpCollapseNode"
WillowConstants.uidAttribute = "stumpUid"
WillowConstants.class = "class"
WillowConstants.type = "type"
WillowConstants.value = "value"
WillowConstants.name = "name"
WillowConstants.checkbox = "checkbox"
WillowConstants.checkedSelector = ":checked"
WillowConstants.contenteditable = "contenteditable"
WillowConstants.inputTypes = ["input", "textarea"]

enum CacheType {
  inBrowserMemory = "inBrowserMemory"
}

class WillowHTTPResponse {
  constructor(superAgentResponse?: any) {
    this._superAgentResponse = superAgentResponse
    this._mimeType = superAgentResponse && superAgentResponse.type
  }

  private _superAgentResponse: any
  private _mimeType: any
  protected _cacheType = CacheType.inBrowserMemory
  private _fromCache = false
  protected _text: string
  protected _cacheTime = Date.now()
  protected _proxyServerResponse: any

  // todo: ServerMemoryCacheTime and ServerMemoryDiskCacheTime
  get cacheTime() {
    return this._cacheTime
  }

  get cacheType() {
    return this._cacheType
  }

  get body() {
    return this._superAgentResponse && this._superAgentResponse.body
  }

  get text() {
    if (this._text === undefined)
      this._text =
        this._superAgentResponse && this._superAgentResponse.text ? this._superAgentResponse.text : this.body ? JSON.stringify(this.body, null, 2) : ""
    return this._text
  }

  get asJson() {
    return this.body ? this.body : JSON.parse(this.text)
  }

  get fromCache() {
    return this._fromCache
  }

  setFromCache(val: any) {
    this._fromCache = val
    return this
  }

  getParsedDataOrText() {
    if (this._mimeType === "text/csv") return this.text
    return this.body || this.text
  }
}

class WillowHTTPProxyCacheResponse extends WillowHTTPResponse {
  constructor(proxyServerResponse: any) {
    super()
    this._proxyServerResponse = proxyServerResponse
    this._cacheType = proxyServerResponse.body.cacheType
    this._cacheTime = proxyServerResponse.body.cacheTime
    this._text = proxyServerResponse.body.text
  }
}

class AbstractWillowShadow {
  constructor(stumpNode: any) {
    this._stumpNode = stumpNode
  }

  private _stumpNode: any // todo: add stump type
  private _val: string

  getShadowStumpNode() {
    return this._stumpNode
  }

  getShadowValue() {
    return this._val
  }

  removeShadow() {
    return this
  }

  setInputOrTextAreaValue(value: string) {
    this._val = value
    return this
  }

  getShadowParent() {
    return this.getShadowStumpNode()
      .getParent()
      .getShadow()
  }

  getPositionAndDimensions(gridSize = 1) {
    const offset = this.getShadowOffset()
    const parentOffset = this.getShadowParent().getShadowOffset()
    return {
      left: Math.floor((offset.left - parentOffset.left) / gridSize),
      top: Math.floor((offset.top - parentOffset.top) / gridSize),
      width: Math.floor(this.getShadowWidth() / gridSize),
      height: Math.floor(this.getShadowHeight() / gridSize)
    }
  }

  shadowHasClass(name: string) {
    return false
  }

  getShadowAttr(name: string) {
    return ""
  }

  makeResizable(options: any) {
    return this
  }
  makeDraggable(options: any) {
    return this
  }
  makeSelectable(options: any) {
    return this
  }

  isShadowChecked() {
    return false
  }

  getShadowHtml() {
    return ""
  }

  getShadowOffset() {
    return { left: 111, top: 111 }
  }

  getShadowWidth() {
    return 111
  }

  getShadowHeight() {
    return 111
  }

  isShadowResizable() {
    return false
  }

  setShadowAttr(name: string, value: any) {
    return this
  }

  isShadowDraggable() {
    return this.shadowHasClass("draggable")
  }

  toggleShadow() {}

  addClassToShadow(className: string) {}

  removeClassFromShadow(className: string) {
    return this
  }

  onShadowEvent(event: any, selector?: any, fn?: any) {
    // todo:
    return this
  }

  offShadowEvent(event: any, fn: any) {
    // todo:
    return this
  }

  triggerShadowEvent(name: string) {
    return this
  }

  getShadowPosition() {
    return {
      left: 111,
      top: 111
    }
  }

  getShadowOuterHeight() {
    return 11
  }

  getShadowOuterWidth() {
    return 11
  }

  getShadowCss(property: string) {
    return ""
  }

  setShadowCss(css: any) {
    return this
  }

  insertHtmlNode(childNode: any, index?: number) {}

  getShadowElement() {}
}

class WillowShadow extends AbstractWillowShadow {}

class WillowStore {
  constructor() {
    this._values = {}
  }
  private _values: jTreeTypes.stringMap

  get(key: string) {
    return this._values[key]
  }
  set(key: string, value: any) {
    this._values[key] = value
    return this
  }
  remove(key: string) {
    delete this._values[key]
  }
  each(fn: any) {
    Object.keys(this._values).forEach(key => {
      fn(this._values[key], key)
    })
  }
  clearAll() {
    this._values = {}
  }
}

class WillowMousetrap {
  constructor() {
    this.prototype = {}
  }
  private prototype: jTreeTypes.stringMap
  bind() {}
}

// this one should have no document, window, $, et cetera.
class AbstractWillowProgram extends stump {
  constructor(baseUrl: string) {
    super(`${WillowConstants.tags.html}
 ${WillowConstants.tags.head}
 ${WillowConstants.tags.body}`)
    this._htmlStumpNode = this.nodeAt(0)
    this._headStumpNode = this.nodeAt(0).nodeAt(0)
    this._bodyStumpNode = this.nodeAt(0).nodeAt(1)
    this.addSuidsToHtmlHeadAndBodyShadows()
    const baseUrlWithoutTrailingPath = baseUrl.replace(/\/[^\/]*$/, "/")
    this._baseUrl = baseUrlWithoutTrailingPath
    const url = new URL(baseUrl)
    this.location.port = url.port
    this.location.protocol = url.protocol
    this.location.hostname = url.hostname
    this.location.host = url.host
  }

  private _htmlStumpNode: any
  private _headStumpNode: any
  private _bodyStumpNode: any
  protected _offlineMode = false
  private _baseUrl: string
  private _httpGetResponseCache: any = {}
  public location: any = {}
  private _mousetrap: any
  private _store: any

  _getPort() {
    return this.location.port ? ":" + this.location.port : ""
  }

  queryObjectToQueryString(obj: Object) {
    return ""
  }

  toPrettyDeepLink(treeCode: string, queryObject: any) {
    // todo: move things to a constant.
    const yi = "~"
    const xi = "_"
    const obj = Object.assign({}, queryObject)

    if (!treeCode.includes(yi) && !treeCode.includes(xi)) {
      obj.yi = yi
      obj.xi = xi
      obj.data = encodeURIComponent(treeCode.replace(/ /g, xi).replace(/\n/g, yi))
    } else obj.data = encodeURIComponent(treeCode)

    return this.getBaseUrl() + "?" + this.queryObjectToQueryString(obj)
  }

  getHost() {
    return this.location.host
  }

  reload() {}

  toggleOfflineMode() {
    this._offlineMode = !this._offlineMode
  }

  addSuidsToHtmlHeadAndBodyShadows() {}

  getShadowClass() {
    return WillowShadow
  }

  getMockMouseEvent() {
    return {
      clientX: 0,
      clientY: 0,
      offsetX: 0,
      offsetY: 0
    }
  }

  toggleFullScreen() {}

  getMousetrap() {
    if (!this._mousetrap) this._mousetrap = new WillowMousetrap()
    return this._mousetrap
  }

  _getFocusedShadow() {
    return this._focusedShadow || this.getBodyStumpNode().getShadow()
  }

  getHeadStumpNode() {
    return this._headStumpNode
  }

  getBodyStumpNode() {
    return this._bodyStumpNode
  }

  getHtmlStumpNode() {
    return this._htmlStumpNode
  }

  getStore() {
    if (!this._store) this._store = new WillowStore()
    return this._store
  }

  someInputHasFocus() {
    const focusedShadow = this._getFocusedShadow()
    if (!focusedShadow) return false
    const stumpNode = focusedShadow.getShadowStumpNode()
    return stumpNode && stumpNode.isInputType()
  }

  copyTextToClipboard(text: string) {}

  setCopyData(evt: any, str: string) {}

  getBaseUrl() {
    return this._baseUrl
  }

  _makeRelativeUrlAbsolute(url: string) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    return this.getBaseUrl() + url
  }

  async httpGetUrl(url: string, queryStringObject: Object, responseClass = WillowHTTPResponse) {
    if (this._offlineMode) return new WillowHTTPResponse()

    const superAgentResponse = await superagent
      .get(this._makeRelativeUrlAbsolute(url))
      .query(queryStringObject)
      .set(this._headers || {})

    return new responseClass(superAgentResponse)
  }

  _getFromResponseCache(cacheKey: any) {
    const hit = this._httpGetResponseCache[cacheKey]
    if (hit) hit.setFromCache(true)
    return hit
  }

  _setInResponseCache(url: string, res: any) {
    this._httpGetResponseCache[url] = res
    return this
  }

  async httpGetUrlFromCache(url: string, queryStringMap: jTreeTypes.queryStringMap = {}, responseClass = WillowHTTPResponse) {
    const cacheKey = url + JSON.stringify(queryStringMap)
    const cacheHit = this._getFromResponseCache(cacheKey)
    if (!cacheHit) {
      const res = await this.httpGetUrl(url, queryStringMap, responseClass)
      this._setInResponseCache(cacheKey, res)
      return res
    }
    return cacheHit
  }

  async httpGetUrlFromProxyCache(url: string) {
    if (!this.isDesktopVersion()) return this.httpGetUrlFromCache(url)
    const queryStringMap: jTreeTypes.queryStringMap = {}
    queryStringMap.url = url
    queryStringMap.cacheOnServer = "true"
    return await this.httpGetUrlFromCache("/proxy", queryStringMap, WillowHTTPProxyCacheResponse)
  }

  async httpPostUrl(url: string, data: any) {
    if (this._offlineMode) return new WillowHTTPResponse()
    const superAgentResponse = await superagent
      .post(this._makeRelativeUrlAbsolute(url))
      .set(this._headers || {})
      .send(data)

    return new WillowHTTPResponse(superAgentResponse)
  }

  encodeURIComponent(str: string) {
    return encodeURIComponent(str)
  }

  downloadFile(data: any, filename: string, filetype: string) {
    // noop
  }

  async appendScript(url: string) {}

  getWindowTitle() {
    // todo: deep getNodeByBase/withBase/type/word or something?
    const nodes = this.getTopDownArray()
    const titleNode = nodes.find((node: jTreeTypes.treeNode) => node.getFirstWord() === WillowConstants.titleTag)
    return titleNode ? titleNode.getContent() : ""
  }

  setWindowTitle(value: string) {
    const nodes = this.getTopDownArray()
    const headNode = nodes.find((node: jTreeTypes.treeNode) => node.getFirstWord() === WillowConstants.tags.head)
    headNode.touchNode(WillowConstants.titleTag).setContent(value)
    return this
  }

  _getHostname() {
    return this.location.hostname || ""
  }

  openUrl(link: string) {
    // noop in willow
  }

  getPageHtml() {
    return this.getHtmlStumpNode().toHtmlWithSuids()
  }

  getStumpNodeFromElement(el: any) {}

  setPasteHandler(fn: Function) {
    return this
  }

  setErrorHandler(fn: Function) {
    return this
  }

  setCopyHandler(fn: Function) {
    return this
  }

  setCutHandler(fn: Function) {
    return this
  }

  setResizeEndHandler(fn: Function) {
    return this
  }

  async confirmThen(message: string) {
    return true
  }

  async promptThen(message: string, value: any) {
    return value
  }

  // todo: refactor. should be able to override this.
  isDesktopVersion() {
    return this._getHostname() === "localhost"
  }

  setLoadedDroppedFileHandler(callback: Function, helpText = "") {}

  getWindowSize() {
    return {
      width: 1111,
      height: 1111
    }
  }

  getDocumentSize() {
    return this.getWindowSize()
  }

  isExternalLink(link: string) {
    if (link && link.substr(0, 1) === "/") return false
    if (!link.includes("//")) return false

    const hostname = this._getHostname()

    const url = new URL(link)
    return url.hostname && hostname !== url.hostname
  }

  forceRepaint() {}

  blurFocusedInput() {}
}

class WillowProgram extends AbstractWillowProgram {
  constructor(baseUrl: string) {
    super(baseUrl)
    this._offlineMode = true
  }
}

class WillowBrowserShadow extends AbstractWillowShadow {
  static _shadowUpdateNumber = 0 // todo: what is this for, debugging perf?
  _getJQElement() {
    // todo: speedup?
    if (!this._cachedEl) this._cachedEl = jQuery(`[${WillowConstants.uidAttribute}="${this.getShadowStumpNode()._getUid()}"]`)
    return this._cachedEl
  }

  private _cachedEl: any // todo: add typings.

  getShadowElement() {
    return this._getJQElement()[0]
  }

  getShadowPosition() {
    return this._getJQElement().position()
  }

  shadowHasClass(name: string) {
    return this._getJQElement().hasClass(name)
  }

  getShadowHtml() {
    return this._getJQElement().html()
  }

  getShadowValue() {
    // todo: cleanup, add tests
    if (this.getShadowStumpNode().isInputType()) return this._getJQElement().val()
    return this._getJQElement().val() || this.getShadowValueFromAttr()
  }

  getShadowValueFromAttr() {
    return this._getJQElement().attr(WillowConstants.value)
  }

  getShadowOuterHeight() {
    return this._getJQElement().outerHeight()
  }

  getShadowOuterWidth() {
    return this._getJQElement().outerWidth()
  }

  isShadowChecked() {
    return this._getJQElement().is(WillowConstants.checkedSelector)
  }

  getShadowWidth() {
    return this._getJQElement().width()
  }

  getShadowHeight() {
    return this._getJQElement().height()
  }

  getShadowOffset() {
    return this._getJQElement().offset()
  }

  getShadowAttr(name: string) {
    return this._getJQElement().attr(name)
  }

  _logMessage(type: string) {
    if (true) return true
    WillowBrowserShadow._shadowUpdateNumber++
    console.log(`DOM Update ${WillowBrowserShadow._shadowUpdateNumber}: ${type}`)
  }

  getShadowCss(prop: string) {
    return this._getJQElement().css(prop)
  }

  isShadowResizable() {
    return this._getJQElement().find(".ui-resizable-handle").length > 0
  }

  triggerShadowEvent(event: string) {
    this._getJQElement().trigger(event)
    this._logMessage("trigger")
    return this
  }

  // BEGIN MUTABLE METHODS:

  // todo: add tests
  // todo: idea, don't "paint" wall (dont append it to parent, until done.)
  insertHtmlNode(childStumpNode: any, index: number) {
    const newChildJqElement = jQuery(childStumpNode.toHtmlWithSuids())
    newChildJqElement.data("stumpNode", childStumpNode) // todo: what do we use this for?

    const jqEl = this._getJQElement()

    // todo: can we virtualize this?
    // would it be a "virtual shadow?"
    if (index === undefined) jqEl.append(newChildJqElement)
    else if (index === 0) jqEl.prepend(newChildJqElement)
    else jQuery(jqEl.children().get(index - 1)).after(newChildJqElement)

    this._logMessage("insert")
  }

  addClassToShadow(className: string) {
    this._getJQElement().addClass(className)
    this._logMessage("addClass")
    return this
  }

  removeClassFromShadow(className: string) {
    this._getJQElement().removeClass(className)
    this._logMessage("removeClass")
    return this
  }

  onShadowEvent(event: string, two: any, three: any) {
    this._getJQElement().on(event, two, three)
    this._logMessage("bind on")
    return this
  }

  offShadowEvent(event: string, fn: Function) {
    this._getJQElement().off(event, fn)
    this._logMessage("bind off")
    return this
  }

  toggleShadow() {
    this._getJQElement().toggle()
    this._logMessage("toggle")
    return this
  }

  makeResizable(options: any) {
    this._getJQElement().resizable(options)
    this._logMessage("resizable")
    return this
  }

  removeShadow() {
    this._getJQElement().remove()
    this._logMessage("remove")
    return this
  }

  setInputOrTextAreaValue(value: string) {
    this._getJQElement().val(value)
    this._logMessage("val")
    return this
  }

  setShadowAttr(name: string, value: string) {
    this._getJQElement().attr(name, value)
    this._logMessage("attr")
    return this
  }

  makeDraggable(options: any) {
    this._logMessage("draggable")
    this._getJQElement().draggable(options)
    return this
  }

  setShadowCss(css: Object) {
    this._getJQElement().css(css)
    this._logMessage("css")
    return this
  }

  makeSelectable(options: any) {
    this._getJQElement().selectable(options)
    this._logMessage("selectable")
    return this
  }
}

// same thing, except with side effects.
class WillowBrowserProgram extends AbstractWillowProgram {
  findStumpNodesByShadowClass(className: string) {
    const stumpNodes: any[] = []
    const that = this
    jQuery("." + className).each(function() {
      stumpNodes.push(that.getStumpNodeFromElement(this))
    })
    return stumpNodes
  }

  queryObjectToQueryString(obj: any) {
    return jQuery.param(obj)
  }

  addSuidsToHtmlHeadAndBodyShadows() {
    jQuery(WillowConstants.tags.html).attr(WillowConstants.uidAttribute, this.getHtmlStumpNode()._getUid())
    jQuery(WillowConstants.tags.head).attr(WillowConstants.uidAttribute, this.getHeadStumpNode()._getUid())
    jQuery(WillowConstants.tags.body).attr(WillowConstants.uidAttribute, this.getBodyStumpNode()._getUid())
  }

  getShadowClass() {
    return WillowBrowserShadow
  }

  setCopyHandler(fn: Function) {
    jQuery(document).on(WillowConstants.ShadowEvents.copy, fn)
    return this
  }

  setCutHandler(fn: Function) {
    jQuery(document).on(WillowConstants.ShadowEvents.cut, fn)
    return this
  }

  setPasteHandler(fn: any) {
    window.addEventListener(WillowConstants.ShadowEvents.paste, fn, false)
    return this
  }

  setErrorHandler(fn: any) {
    window.addEventListener("error", fn)
    window.addEventListener("unhandledrejection", fn)
    return this
  }

  toggleFullScreen() {
    const doc = <any>document
    if ((doc.fullScreenElement && doc.fullScreenElement !== null) || (!doc.mozFullScreen && !doc.webkitIsFullScreen)) {
      if (doc.documentElement.requestFullScreen) doc.documentElement.requestFullScreen()
      else if (doc.documentElement.mozRequestFullScreen) doc.documentElement.mozRequestFullScreen()
      else if (doc.documentElement.webkitRequestFullScreen) doc.documentElement.webkitRequestFullScreen((<any>Element).ALLOW_KEYBOARD_INPUT)
    } else {
      if (doc.cancelFullScreen) doc.cancelFullScreen()
      else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen()
      else if (doc.webkitCancelFullScreen) doc.webkitCancelFullScreen()
    }
  }

  setCopyData(evt: any, str: string) {
    const originalEvent = evt.originalEvent
    originalEvent.preventDefault()
    originalEvent.clipboardData.setData("text/plain", str)
    originalEvent.clipboardData.setData("text/html", str)
  }

  getMousetrap() {
    return (<any>window).Mousetrap
  }

  copyTextToClipboard(text: string) {
    // http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    const textArea = document.createElement("textarea")
    textArea.style.position = "fixed"
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.width = "2em"
    textArea.style.height = "2em"
    textArea.style.padding = "0"
    textArea.style.border = "none"
    textArea.style.outline = "none"
    textArea.style.boxShadow = "none"
    textArea.style.background = "transparent"
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      const successful = document.execCommand("copy")
    } catch (err) {}
    document.body.removeChild(textArea)
  }

  getStore() {
    return (<any>window).store
  }

  getHost() {
    return location.host
  }

  _getHostname() {
    return location.hostname
  }

  private _loadingPromises: any

  async appendScript(url: string) {
    if (!url) return undefined
    if (!this._loadingPromises) this._loadingPromises = {}
    if (this._loadingPromises[url]) return this._loadingPromises[url]

    if (this.isNodeJs()) return undefined

    this._loadingPromises[url] = this._appendScript(url)
    return this._loadingPromises[url]
  }

  _appendScript(url: string) {
    //https://bradb.net/blog/promise-based-js-script-loader/
    return new Promise(function(resolve, reject) {
      let resolved = false
      const scriptEl = document.createElement("script")

      scriptEl.type = "text/javascript"
      scriptEl.src = url
      scriptEl.async = true
      scriptEl.onload = (<any>scriptEl).onreadystatechange = function() {
        if (!resolved && (!this.readyState || this.readyState == "complete")) {
          resolved = true
          resolve(this)
        }
      }
      scriptEl.onerror = scriptEl.onabort = reject
      document.head.appendChild(scriptEl)
    })
  }

  downloadFile(data: any, filename: string, filetype: string) {
    const downloadLink = document.createElement("a")
    downloadLink.setAttribute("href", `data:${filetype},` + encodeURIComponent(data))
    downloadLink.setAttribute("download", filename)
    downloadLink.click()
  }

  reload() {
    window.location.reload()
  }

  openUrl(link: string) {
    window.open(link)
  }

  setResizeEndHandler(fn: Function) {
    let resizeTimer: any
    jQuery(window).on(WillowConstants.ShadowEvents.resize, (evt: any) => {
      const target = jQuery(evt.target)
      if (target.is("div")) return // dont resize on div resizes
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        fn({ width: target.width(), height: target.height() })
      }, 100)
    })
    return this
  }

  getStumpNodeFromElement(el: any) {
    const jqEl: any = jQuery(el)
    return this.getHtmlStumpNode().getNodeByGuid(parseInt(jqEl.attr(WillowConstants.uidAttribute)))
  }

  forceRepaint() {
    jQuery(window).width()
  }

  getBrowserHtml() {
    return document.documentElement.outerHTML
  }

  async confirmThen(message: string) {
    return confirm(message)
  }

  async promptThen(message: string, value: any) {
    return prompt(message, value)
  }

  getWindowSize() {
    const windowStumpNode = jQuery(window)
    return {
      width: windowStumpNode.width(),
      height: windowStumpNode.height()
    }
  }

  getDocumentSize() {
    const documentStumpNode = jQuery(document)
    return {
      width: documentStumpNode.width(),
      height: documentStumpNode.height()
    }
  }

  // todo: denote the side effect
  blurFocusedInput() {
    // todo: test against browser.
    ;(<any>document.activeElement).blur()
  }

  setLoadedDroppedFileHandler(callback: Function, helpText = "") {
    const bodyStumpNode = this.getBodyStumpNode()
    const bodyShadow = bodyStumpNode.getShadow()

    // Added the below to ensure dragging from the chrome downloads bar works
    // http://stackoverflow.com/questions/19526430/drag-and-drop-file-uploads-from-chrome-downloads-bar
    const handleChromeBug = (event: any) => {
      const originalEvent = event.originalEvent
      const effect = originalEvent.dataTransfer.effectAllowed
      originalEvent.dataTransfer.dropEffect = effect === "move" || effect === "linkMove" ? "move" : "copy"
    }

    const dragoverHandler = (event: any) => {
      handleChromeBug(event)

      event.preventDefault()
      event.stopPropagation()
      if (!bodyStumpNode.stumpNodeHasClass("dragOver")) {
        bodyStumpNode.insertChildNode(`div ${helpText}
 id dragOverHelp`)
        bodyStumpNode.addClassToStumpNode("dragOver")
        // Add the help, and then hopefull we'll get a dragover event on the dragOverHelp, then
        // 50ms later, add the dragleave handler, and from now on drag leave will only happen on the help
        // div
        setTimeout(function() {
          bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.dragleave, dragleaveHandler)
        }, 50)
      }
    }

    const dragleaveHandler = (event: any) => {
      event.preventDefault()
      event.stopPropagation()
      bodyStumpNode.removeClassFromStumpNode("dragOver")
      bodyStumpNode.findStumpNodeByChild("id dragOverHelp").removeStumpNode()
      bodyShadow.offShadowEvent(WillowConstants.ShadowEvents.dragleave, dragleaveHandler)
    }

    const dropHandler = async (event: any) => {
      event.preventDefault()
      event.stopPropagation()
      bodyStumpNode.removeClassFromStumpNode("dragOver")
      bodyStumpNode.findStumpNodeByChild("id dragOverHelp").removeStumpNode()

      const droppedItems = event.originalEvent.dataTransfer.items
      // NOTE: YOU NEED TO STAY IN THE "DROP" EVENT, OTHERWISE THE DATATRANSFERITEMS MUTATE
      // (BY DESIGN) https://bugs.chromium.org/p/chromium/issues/detail?id=137231
      // DO NOT ADD AN AWAIT IN THIS LOOP. IT WILL BREAK.
      const items = []
      for (let droppedItem of droppedItems) {
        const entry = droppedItem.webkitGetAsEntry()
        items.push(this._handleDroppedEntry(entry))
      }
      const results = await Promise.all(items)
      callback(results)
    }

    bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.dragover, dragoverHandler)
    bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.drop, dropHandler)

    // todo: why do we do this?
    bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.dragenter, function(event: any) {
      event.preventDefault()
      event.stopPropagation()
    })
  }

  _handleDroppedEntry(item: any, path = "") {
    // http://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree
    // http://stackoverflow.com/questions/6756583/prevent-browser-from-loading-a-drag-and-dropped-file
    return item.isFile ? this._handleDroppedFile(item) : this._handleDroppedDirectory(item, path)
  }

  _handleDroppedDirectory(item: any, path: any) {
    return new Promise((resolve, reject) => {
      item.createReader().readEntries(async (entries: any) => {
        const promises = []
        for (let i = 0; i < entries.length; i++) {
          promises.push(this._handleDroppedEntry(entries[i], path + item.name + "/"))
        }
        const res = await Promise.all(promises)
        resolve(res)
      })
    })
  }

  _handleDroppedFile(file: any) {
    // https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
    // http://www.sitepoint.com/html5-javascript-open-dropped-files/
    return new Promise((resolve, reject) => {
      file.file((data: any) => {
        const reader = new FileReader()
        reader.onload = evt => {
          resolve({ data: (<any>evt.target).result, filename: data.name })
        }
        reader.onerror = err => reject(err)
        reader.readAsText(data)
      })
    })
  }

  _getFocusedShadow() {
    const stumpNode = this.getStumpNodeFromElement(document.activeElement)
    return stumpNode && stumpNode.getShadow()
  }
}

export { AbstractWillowProgram, AbstractWillowShadow, WillowConstants, WillowProgram, WillowBrowserProgram }
