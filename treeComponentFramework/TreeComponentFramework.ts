//onsave jtree build produce TreeComponentFramework.browser.js

import { treeNotationTypes } from "../products/treeNotationTypes"

const { jtree } = require("../index.js")
const stumpNode = require("../products/stump.nodejs.js")
const hakonNode = require("../products/hakon.nodejs.js")
const superagent = require("superagent")

const BrowserEvents: treeNotationTypes.stringMap = {}
BrowserEvents.click = "click"
BrowserEvents.change = "change"
BrowserEvents.mouseover = "mouseover"
BrowserEvents.mouseout = "mouseout"
BrowserEvents.mousedown = "mousedown"
BrowserEvents.contextmenu = "contextmenu"
BrowserEvents.keypress = "keypress"
BrowserEvents.keyup = "keyup"
BrowserEvents.focus = "focus"
BrowserEvents.mousemove = "mousemove"
BrowserEvents.dblclick = "dblclick"
BrowserEvents.submit = "submit"
BrowserEvents.blur = "blur"
BrowserEvents.paste = "paste"
BrowserEvents.copy = "copy"
BrowserEvents.resize = "resize"
BrowserEvents.cut = "cut"
BrowserEvents.drop = "drop"
BrowserEvents.dragover = "dragover"
BrowserEvents.dragenter = "dragenter"
BrowserEvents.dragleave = "dragleave"
BrowserEvents.ready = "ready"

const WillowConstants: treeNotationTypes.stringMap = {}
// todo: cleanup
WillowConstants.clickCommand = "clickCommand"
WillowConstants.shiftClickCommand = "shiftClickCommand"
WillowConstants.blurCommand = "blurCommand"
WillowConstants.keyUpCommand = "keyUpCommand"
WillowConstants.contextMenuCommand = "contextMenuCommand"
WillowConstants.changeCommand = "changeCommand"
WillowConstants.doubleClickCommand = "doubleClickCommand"

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
WillowConstants.collapse = "collapse"
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
    if (this._text === undefined) this._text = this._superAgentResponse && this._superAgentResponse.text ? this._superAgentResponse.text : this.body ? JSON.stringify(this.body, null, 2) : ""
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

  getShadowOffset() {
    return { left: 111, top: 111 }
  }

  getShadowWidth() {
    return 111
  }

  getShadowHeight() {
    return 111
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

  onShadowEvent(event: any, fn?: any) {
    // todo:
    return this
  }

  onShadowEventWithSelector(event: any, selector?: any, fn?: any) {
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

  insertHtmlNode(childNode: any, index?: number) {}

  get element() {
    return {}
  }
}

class WillowShadow extends AbstractWillowShadow {}

class WillowStore {
  constructor() {
    this._values = {}
  }
  private _values: treeNotationTypes.stringMap

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
  private prototype: treeNotationTypes.stringMap
  bind() {}
}

// this one should have no document, window, $, et cetera.
class AbstractWillowBrowser extends stumpNode {
  constructor(fullHtmlPageUrlIncludingProtocolAndFileName: string) {
    super(`${WillowConstants.tags.html}
 ${WillowConstants.tags.head}
 ${WillowConstants.tags.body}`)
    this._htmlStumpNode = this.nodeAt(0)
    this._headStumpNode = this.nodeAt(0).nodeAt(0)
    this._bodyStumpNode = this.nodeAt(0).nodeAt(1)
    this.addSuidsToHtmlHeadAndBodyShadows()
    this._fullHtmlPageUrlIncludingProtocolAndFileName = fullHtmlPageUrlIncludingProtocolAndFileName
    const url = new URL(fullHtmlPageUrlIncludingProtocolAndFileName)
    this.location.port = url.port
    this.location.protocol = url.protocol
    this.location.hostname = url.hostname
    this.location.host = url.host
  }

  private _htmlStumpNode: any
  private _headStumpNode: any
  private _bodyStumpNode: any
  protected _offlineMode = false
  private _fullHtmlPageUrlIncludingProtocolAndFileName: string
  private _httpGetResponseCache: any = {}
  public location: any = {}
  private _mousetrap: any
  private _store: any

  _getPort() {
    return this.location.port ? ":" + this.location.port : ""
  }

  getHash() {
    return this.location.hash || ""
  }

  setHash(value: string) {
    this.location.hash = value
  }

  setHtmlOfElementWithIdHack(id: string, html: string) {}
  setHtmlOfElementsWithClassHack(id: string, html: string) {}
  setValueOfElementWithIdHack(id: string, value: string) {}
  setValueOfElementWithClassHack(id: string, value: string) {}
  getElementById(id: string) {}

  queryObjectToQueryString(obj: Object) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(obj)) {
      params.set(key, String(value))
    }
    return params.toString()
  }

  toPrettyDeepLink(treeCode: string, queryObject: any) {
    // todo: move things to a constant.
    const nodeBreakSymbol = "~"
    const edgeSymbol = "_"
    const obj = Object.assign({}, queryObject)

    if (!treeCode.includes(nodeBreakSymbol) && !treeCode.includes(edgeSymbol)) {
      obj.nodeBreakSymbol = nodeBreakSymbol
      obj.edgeSymbol = edgeSymbol
      obj.data = encodeURIComponent(treeCode.replace(/ /g, edgeSymbol).replace(/\n/g, nodeBreakSymbol))
    } else obj.data = encodeURIComponent(treeCode)

    return this.getAppWebPageUrl() + "?" + this.queryObjectToQueryString(obj)
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

  getAppWebPageUrl() {
    return this._fullHtmlPageUrlIncludingProtocolAndFileName
  }

  getAppWebPageParentFolderWithoutTrailingSlash() {
    return jtree.Utils.getPathWithoutFileName(this._fullHtmlPageUrlIncludingProtocolAndFileName)
  }

  _makeRelativeUrlAbsolute(url: string) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    return this.getAppWebPageParentFolderWithoutTrailingSlash() + "/" + url.replace(/^\//, "")
  }

  async makeUrlAbsoluteAndHttpGetUrl(url: string, queryStringObject: Object, responseClass = WillowHTTPResponse) {
    return this.httpGetUrl(this._makeRelativeUrlAbsolute(url), queryStringObject, responseClass)
  }

  async httpGetUrl(url: string, queryStringObject: Object, responseClass = WillowHTTPResponse) {
    if (this._offlineMode) return new WillowHTTPResponse()

    const superAgentResponse = await superagent
      .get(url)
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

  async httpGetUrlFromCache(url: string, queryStringMap: treeNotationTypes.queryStringMap = {}, responseClass = WillowHTTPResponse) {
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
    const queryStringMap: treeNotationTypes.queryStringMap = {}
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
    const titleNode = nodes.find((node: treeNotationTypes.treeNode) => node.getFirstWord() === WillowConstants.titleTag)
    return titleNode ? titleNode.getContent() : ""
  }

  setWindowTitle(value: string) {
    const nodes = this.getTopDownArray()
    const headNode = nodes.find((node: treeNotationTypes.treeNode) => node.getFirstWord() === WillowConstants.tags.head)
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

class WillowBrowser extends AbstractWillowBrowser {
  constructor(fullHtmlPageUrlIncludingProtocolAndFileName: string) {
    super(fullHtmlPageUrlIncludingProtocolAndFileName)
    this._offlineMode = true
  }
  static _stumpsOnPage = 0
}

class WillowBrowserShadow extends AbstractWillowShadow {
  static _shadowUpdateNumber = 0 // todo: what is this for, debugging perf?

  private _cachedEl: any // todo: add typings.

  get element() {
    if (!this._cachedEl) this._cachedEl = document.querySelector(`[${WillowConstants.uidAttribute}="${this.getShadowStumpNode()._getUid()}"]`)
    return this._cachedEl
  }

  getShadowValueFromAttr() {
    return this.element.getAttribute(WillowConstants.value)
  }

  isShadowChecked() {
    return this.element.checked
  }

  getShadowAttr(name: string) {
    return this.element.getAttribute(name)
  }

  _logMessage(type: string) {
    if (true) return true
    WillowBrowserShadow._shadowUpdateNumber++
    console.log(`DOM Update ${WillowBrowserShadow._shadowUpdateNumber}: ${type}`)
  }

  // BEGIN MUTABLE METHODS:

  // todo: add tests
  // todo: idea, don't "paint" wall (dont append it to parent, until done.)
  insertHtmlNode(childStumpNode: any, index: number) {
    const { domElement } = childStumpNode
    const { element } = this

    // todo: can we virtualize this?
    // would it be a "virtual shadow?"
    if (index === undefined) element.appendChild(domElement)
    else if (index === 0) element.prepend(domElement)
    else element.insertBefore(domElement, element.children[index])

    WillowBrowser._stumpsOnPage++
    this._logMessage("insert")
  }

  removeShadow() {
    this.element.remove()
    WillowBrowser._stumpsOnPage--
    this._logMessage("remove")
    return this
  }

  setInputOrTextAreaValue(value: string) {
    this.element.value = value
    this._logMessage("val")
    return this
  }

  setShadowAttr(name: string, value: string) {
    this.element.setAttribute(name, value)
    this._logMessage("attr")
    return this
  }

  getShadowCss(prop: string) {
    const { element } = this
    const compStyles = window.getComputedStyle(element)
    return compStyles.getPropertyValue(prop)
  }

  getShadowPosition() {
    return this.element.getBoundingClientRect()
  }

  shadowHasClass(name: string) {
    return this.element.classList.contains(name)
  }

  getShadowValue() {
    // todo: cleanup, add tests
    if (this.getShadowStumpNode().isInputType()) return this.element.value
    return (this.element as any).value || this.getShadowValueFromAttr()
  }

  addClassToShadow(className: string) {
    this.element.classList.add(className)
    this._logMessage("addClass")
    return this
  }

  removeClassFromShadow(className: string) {
    this.element.classList.remove(className)
    this._logMessage("removeClass")
    return this
  }

  toggleShadow() {
    const { element } = this
    element.style.display = element.style.display == "none" ? "block" : "none"

    this._logMessage("toggle")
    return this
  }

  getShadowOuterHeight() {
    return this.element.outerHeight
  }

  getShadowOuterWidth() {
    return this.element.outerWidth
  }

  getShadowWidth() {
    return this.element.innerWidth
  }

  getShadowHeight() {
    return this.element.innerHeight
  }

  getShadowOffset() {
    const element = this.element

    if (!element.getClientRects().length) return { top: 0, left: 0 }

    const rect = element.getBoundingClientRect()
    const win = element.ownerDocument.defaultView
    return {
      top: rect.top + win.pageYOffset,
      left: rect.left + win.pageXOffset
    }
  }

  triggerShadowEvent(event: string) {
    this.element.dispatchEvent(new Event(event))
    this._logMessage("trigger")
    return this
  }

  onShadowEvent(event: string, fn: any) {
    this.element.addEventListener(event, fn)
    this._logMessage("bind on")
    return this
  }

  onShadowEventWithSelector(event: string, selector: string, fn: any) {
    this.element.addEventListener(event, function(evt: any) {
      let target = evt.target
      while (target !== null) {
        if (target.matches(selector)) {
          fn(target, evt)
          return
        }
        target = target.parentElement
      }
    })

    this._logMessage("bind on")
    return this
  }

  offShadowEvent(event: string, fn: Function) {
    this.element.removeEventListener(event, fn)
    this._logMessage("bind off")
    return this
  }
}

// same thing, except with side effects.
class RealWillowBrowser extends AbstractWillowBrowser {
  findStumpNodesByShadowClass(className: string) {
    const stumpNodes: any[] = []

    const els: any = document.getElementsByClassName(className)
    for (let el of els) {
      stumpNodes.push(this.getStumpNodeFromElement(this))
    }

    return stumpNodes
  }

  getElementById(id: string) {
    return document.getElementById(id)
  }

  setHtmlOfElementWithIdHack(id: string, html = "") {
    document.getElementById(id).innerHTML = html
  }

  setHtmlOfElementsWithClassHack(className: string, html = "") {
    const els: any = document.getElementsByClassName(className)
    for (let el of els) {
      el.innerHTML = html
    }
  }

  setValueOfElementWithIdHack(id: string, value = "") {
    const el = document.getElementById(id) as any
    el.value = value
  }

  setValueOfElementsWithClassHack(className: string, value = "") {
    const els: any = document.getElementsByClassName(className)
    for (let el of els) {
      el.value = value
    }
  }

  private getElementByTagName(tagName: string) {
    return document.getElementsByTagName(tagName)[0]
  }

  addSuidsToHtmlHeadAndBodyShadows() {
    this.getElementByTagName(WillowConstants.tags.html).setAttribute(WillowConstants.uidAttribute, this.getHtmlStumpNode()._getUid())
    this.getElementByTagName(WillowConstants.tags.head).setAttribute(WillowConstants.uidAttribute, this.getHeadStumpNode()._getUid())
    this.getElementByTagName(WillowConstants.tags.body).setAttribute(WillowConstants.uidAttribute, this.getBodyStumpNode()._getUid())
  }

  getShadowClass() {
    return WillowBrowserShadow
  }

  setCopyHandler(fn: Function) {
    document.addEventListener(BrowserEvents.copy, event => {
      fn(event)
    })
    return this
  }

  setCutHandler(fn: Function) {
    document.addEventListener(BrowserEvents.cut, event => {
      fn(event)
    })
    return this
  }

  setPasteHandler(fn: any) {
    window.addEventListener(BrowserEvents.paste, fn, false)
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

  getHash() {
    return location.hash || ""
  }

  setHash(value: string) {
    location.hash = value
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
    window.addEventListener(BrowserEvents.resize, (evt: any) => {
      const target = evt.target
      if (target !== window) return // dont resize on div resizes
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        fn(this.getWindowSize())
      }, 100)
    })
    return this
  }

  getStumpNodeFromElement(el: any) {
    return this.getHtmlStumpNode().getNodeByGuid(parseInt(el.getAttribute(WillowConstants.uidAttribute)))
  }

  forceRepaint() {
    // todo:
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
    return {
      width: window.innerWidth,
      height: window.innerHeight
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
          bodyShadow.onShadowEvent(BrowserEvents.dragleave, dragleaveHandler)
        }, 50)
      }
    }

    const dragleaveHandler = (event: any) => {
      event.preventDefault()
      event.stopPropagation()
      bodyStumpNode.removeClassFromStumpNode("dragOver")
      bodyStumpNode.findStumpNodeByChild("id dragOverHelp").removeStumpNode()
      bodyShadow.offShadowEvent(BrowserEvents.dragleave, dragleaveHandler)
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

    bodyShadow.onShadowEvent(BrowserEvents.dragover, dragoverHandler)
    bodyShadow.onShadowEvent(BrowserEvents.drop, dropHandler)

    // todo: why do we do this?
    bodyShadow.onShadowEvent(BrowserEvents.dragenter, function(event: any) {
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

abstract class AbstractTheme {
  hakonToCss(str: string) {
    const hakonProgram = new hakonNode(str)
    // console.log(hakonProgram.getAllErrors())
    return hakonProgram.compile()
  }
}

class DefaultTheme extends AbstractTheme {}

// todo: cleanup
interface reasonForUpdatingOrNot {
  shouldUpdate: boolean
  reason: string
  staleTime?: number
  dependency?: AbstractTreeComponent
  lastRenderedTime?: number
  mTime?: number
}

interface childShouldUpdateResult {
  child: AbstractTreeComponent
  childUpdateBecause: reasonForUpdatingOrNot
}

/** Declaration file generated by dts-gen */
// Todo: clean up declaration file generation
declare class abstractHtmlTag extends jtree.GrammarBackedNode {
  constructor(...args: any[])
  addClassToStumpNode(...args: any[]): void
  findStumpNodeByChild(...args: any[]): void
  findStumpNodeByChildString(...args: any[]): void
  findStumpNodeByFirstWord(...args: any[]): void
  findStumpNodesByChild(...args: any[]): void
  findStumpNodesWithClass(...args: any[]): void
  getNodeByGuid(...args: any[]): void
  getShadow(...args: any[]): void
  getShadowClass(...args: any[]): void
  getStumpNodeAttr(...args: any[]): void
  getStumpNodeTreeComponent(...args: any[]): void
  getStumpNodeCss(...args: any[]): void
  getTag(...args: any[]): void
  insertChildNode(...args: any[]): abstractHtmlTag
  insertCssChildNode(...args: any[]): abstractHtmlTag
  isInputType(...args: any[]): void
  isStumpNodeCheckbox(...args: any[]): void
  removeClassFromStumpNode(...args: any[]): void
  removeCssStumpNode(...args: any[]): void
  removeStumpNode(...args: any[]): void
  setStumpNodeAttr(...args: any[]): void
  setStumpNodeTreeComponent(...args: any[]): void
  setStumpNodeCss(...args: any[]): void
  shouldCollapse(...args: any[]): void
  stumpNodeHasClass(...args: any[]): void
  toHtmlWithSuids(...args: any[]): void
}

abstract class AbstractTreeComponent extends jtree.GrammarBackedNode {
  private _commandsBuffer: treeNotationTypes.treeNode[]
  private _messageBuffer: treeNotationTypes.treeNode
  private _htmlStumpNode: abstractHtmlTag
  private _cssStumpNode: abstractHtmlTag
  private _lastRenderedTime: number
  private _lastTimeToRender: number
  static _mountedTreeComponents = 0

  private _willowBrowser: any
  private _theme: AbstractTheme

  async startWhenReady() {
    if (this.isNodeJs()) return this.start()
    document.addEventListener(
      "DOMContentLoaded",
      async () => {
        this.start()
      },
      false
    )
  }

  start() {
    this._bindTreeComponentFrameworkCommandListenersOnBody()
    this.renderAndGetRenderReport(this.willowBrowser.getBodyStumpNode())
  }

  get willowBrowser() {
    if (!this._willowBrowser) {
      if (this.isNodeJs()) {
        this._willowBrowser = new WillowBrowser("http://localhost:8000/index.html")
      } else {
        this._willowBrowser = new RealWillowBrowser(window.location.href)
      }
    }
    return this._willowBrowser
  }

  protected onCommandError(err: any) {
    throw err
  }

  private _mouseEvent: any

  private _setMouseEvent(evt: any) {
    this._mouseEvent = evt
    return this
  }

  getMouseEvent() {
    return this._mouseEvent || this.willowBrowser.getMockMouseEvent()
  }

  protected _onCommandWillRun() {
    // todo: remove. currently used by ohayo
  }

  private _getCommandArgumentsFromStumpNode(stumpNode: any, commandMethod: string) {
    if (commandMethod.includes(" ")) {
      // todo: cleanup and document
      // It seems the command arguments can from the method string or from form values.
      const parts = commandMethod.split(" ")
      return {
        uno: parts[1],
        dos: parts[2]
      }
    }
    const shadow = stumpNode.getShadow()
    let valueParam
    if (stumpNode.isStumpNodeCheckbox()) valueParam = shadow.isShadowChecked() ? true : false
    // todo: fix bug if nothing is entered.
    else if (shadow.getShadowValue() !== undefined) valueParam = shadow.getShadowValue()
    else valueParam = stumpNode.getStumpNodeAttr("value")
    const nameParam = stumpNode.getStumpNodeAttr("name")

    return {
      uno: valueParam,
      dos: nameParam
    }
  }

  getStumpNodeString() {
    return this.willowBrowser.getHtmlStumpNode().toString()
  }

  _getHtmlOnlyNodes() {
    const nodes: any[] = []
    this.willowBrowser.getHtmlStumpNode().deepVisit((node: any) => {
      if (node.getFirstWord() === "styleTag" || (node.getContent() || "").startsWith("<svg ")) return false
      nodes.push(node)
    })
    return nodes
  }

  getStumpNodeStringWithoutCssAndSvg() {
    // todo: cleanup. feels hacky.
    const clone = new jtree.TreeNode(this.willowBrowser.getHtmlStumpNode().toString())

    clone.getTopDownArray().forEach((node: any) => {
      if (node.getFirstWord() === "styleTag" || (node.getContent() || "").startsWith("<svg ")) node.destroy()
    })
    return clone.toString()
  }

  getTextContent() {
    return this._getHtmlOnlyNodes()
      .map(node => node.getTextContent())
      .filter(text => text)
      .join("\n")
  }

  getCommandNames() {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(word => word.endsWith("Command"))
  }

  private async _executeCommandOnStumpNode(stumpNode: any, commandMethod: string) {
    const params = this._getCommandArgumentsFromStumpNode(stumpNode, commandMethod)
    if (commandMethod.includes(" "))
      // todo: cleanup
      commandMethod = commandMethod.split(" ")[0]
    this.addToCommandLog([commandMethod, params.uno, params.dos].filter(identity => identity).join(" "))
    this._onCommandWillRun() // todo: remove. currently used by ohayo

    let treeComponent = stumpNode.getStumpNodeTreeComponent()
    while (!treeComponent[commandMethod]) {
      const parent = treeComponent.getParent()
      if (parent === treeComponent) throw new Error(`Unknown command "${commandMethod}"`)
      if (!parent) debugger
      treeComponent = parent
    }

    try {
      await treeComponent[commandMethod](params.uno, params.dos)
    } catch (err) {
      this.onCommandError(err)
    }
  }

  private _bindTreeComponentFrameworkCommandListenersOnBody() {
    const willowBrowser = this.willowBrowser
    const bodyShadow = willowBrowser.getBodyStumpNode().getShadow()
    const app = this

    const checkAndExecute = (el: any, attr: string, evt: any) => {
      const stumpNode = willowBrowser.getStumpNodeFromElement(el)
      evt.preventDefault()
      evt.stopImmediatePropagation()
      this._executeCommandOnStumpNode(stumpNode, stumpNode.getStumpNodeAttr(attr))
      return false
    }

    bodyShadow.onShadowEventWithSelector(BrowserEvents.contextmenu, `[${WillowConstants.contextMenuCommand}]`, function(target: any, evt: any) {
      if (evt.ctrlKey) return true
      app._setMouseEvent(evt) // todo: remove?
      return checkAndExecute(target, WillowConstants.contextMenuCommand, evt)
    })

    bodyShadow.onShadowEventWithSelector(BrowserEvents.click, `[${WillowConstants.clickCommand}]`, function(target: any, evt: any) {
      if (evt.shiftKey) return checkAndExecute(this, WillowConstants.shiftClickCommand, evt)
      app._setMouseEvent(evt) // todo: remove?
      return checkAndExecute(target, WillowConstants.clickCommand, evt)
    })

    bodyShadow.onShadowEventWithSelector(BrowserEvents.dblclick, `[${WillowConstants.doubleClickCommand}]`, function(target: any, evt: any) {
      if (evt.target !== evt.currentTarget) return true // direct dblclicks only
      app._setMouseEvent(evt) // todo: remove?
      return checkAndExecute(target, WillowConstants.doubleClickCommand, evt)
    })

    bodyShadow.onShadowEventWithSelector(BrowserEvents.blur, `[${WillowConstants.blurCommand}]`, function(target: any, evt: any) {
      return checkAndExecute(target, WillowConstants.blurCommand, evt)
    })

    bodyShadow.onShadowEventWithSelector(BrowserEvents.keyup, `[${WillowConstants.keyUpCommand}]`, function(target: any, evt: any) {
      return checkAndExecute(target, WillowConstants.keyUpCommand, evt)
    })

    bodyShadow.onShadowEventWithSelector(BrowserEvents.change, `[${WillowConstants.changeCommand}]`, function(target: any, evt: any) {
      return checkAndExecute(target, WillowConstants.changeCommand, evt)
    })
  }

  stopPropagationCommand() {
    // todo: remove?
    // intentional noop
  }

  // todo: remove?
  async clearMessageBufferCommand() {
    delete this._messageBuffer
  }

  // todo: remove?
  async unmountAndDestroyCommand() {
    this.unmountAndDestroy()
  }

  toggleTreeComponentFrameworkDebuggerCommand() {
    // todo: move somewhere else?
    // todo: cleanup
    const app = this.getRootNode()
    const node = app.getNode("TreeComponentFrameworkDebuggerComponent")
    if (node) {
      node.unmountAndDestroy()
    } else {
      app.appendLine("TreeComponentFrameworkDebuggerComponent")
      app.renderAndGetRenderReport()
    }
  }

  getStumpNode() {
    return this._htmlStumpNode
  }

  toHakonCode() {
    return ""
  }

  getTheme(): AbstractTheme {
    if (!this.isRoot()) return this.getRootNode().getTheme()
    if (!this._theme) this._theme = new DefaultTheme()
    return this._theme
  }

  getCommandsBuffer() {
    if (!this._commandsBuffer) this._commandsBuffer = []
    return this._commandsBuffer
  }

  addToCommandLog(command: string) {
    this.getCommandsBuffer().push({
      command: command,
      time: this._getProcessTimeInMilliseconds()
    })
  }

  getMessageBuffer() {
    if (!this._messageBuffer) this._messageBuffer = new jtree.TreeNode()
    return this._messageBuffer
  }

  // todo: move this to tree class? or other higher level class?
  addStumpCodeMessageToLog(message: string) {
    // note: we have 1 parameter, and are going to do type inference first.
    // Todo: add actions that can be taken from a message?
    // todo: add tests
    this.getMessageBuffer().appendLineAndChildren("message", message)
  }

  addStumpErrorMessageToLog(errorMessage: string) {
    // todo: cleanup!
    return this.addStumpCodeMessageToLog(`div
 class OhayoError
 bern${jtree.TreeNode.nest(errorMessage, 2)}`)
  }

  logMessageText(message = "") {
    const pre = `pre
 bern${jtree.TreeNode.nest(message, 2)}`
    return this.addStumpCodeMessageToLog(pre)
  }

  unmount(): any {
    if (
      !this.isMounted() // todo: why do we need this check?
    )
      return undefined
    this._getChildTreeComponents().forEach((child: any) => child.unmount())
    this.treeComponentWillUnmount()
    this._removeCss()
    this._removeHtml()
    delete this._lastRenderedTime
    this.treeComponentDidUnmount()
  }

  protected _removeHtml() {
    this._htmlStumpNode.removeStumpNode()
    delete this._htmlStumpNode
  }

  toStumpCode() {
    return `div
 class ${this.getCssClassNames().join(" ")}`
  }

  getCssClassNames() {
    return this._getJavascriptPrototypeChainUpTo("AbstractTreeComponent")
  }

  treeComponentWillMount() {}

  async treeComponentDidMount() {
    AbstractTreeComponent._mountedTreeComponents++
  }

  treeComponentDidUnmount() {
    AbstractTreeComponent._mountedTreeComponents--
  }

  treeComponentWillUnmount() {}

  getNewestTimeToRender() {
    return this._lastTimeToRender
  }

  protected _setLastRenderedTime(time: number) {
    this._lastRenderedTime = time
    return this
  }

  async treeComponentDidUpdate() {}

  protected _getChildTreeComponents() {
    return this.getChildrenByNodeConstructor(AbstractTreeComponent)
  }

  protected _hasChildrenTreeComponents() {
    return this._getChildTreeComponents().length > 0
  }

  // todo: this is hacky. we do it so we can just mount all tiles to wall.
  getStumpNodeForChildren() {
    return this.getStumpNode()
  }

  protected _getLastRenderedTime() {
    return this._lastRenderedTime
  }

  protected get _css() {
    return this.getTheme().hakonToCss(this.toHakonCode())
  }

  toPlainHtml(containerId: string) {
    return `<div id="${containerId}">
 <style>${this.getTheme().hakonToCss(this.toHakonCode())}</style>
${new stumpNode(this.toStumpCode()).compile()}
</div>`
  }

  protected _updateAndGetUpdateReport() {
    const reasonForUpdatingOrNot = this.getWhetherToUpdateAndReason()
    if (!reasonForUpdatingOrNot.shouldUpdate) return reasonForUpdatingOrNot

    this._setLastRenderedTime(this._getProcessTimeInMilliseconds())
    this._removeCss()
    this._mountCss()
    // todo: fucking switch to react? looks like we don't update parent because we dont want to nuke children.
    // okay. i see why we might do that for non tile treeComponents. but for Tile treeComponents, seems like we arent nesting, so why not?
    // for now
    if (this._hasChildrenTreeComponents()) return { shouldUpdate: false, reason: "did not update because is a parent" }

    this._updateHtml()

    this._lastTimeToRender = this._getProcessTimeInMilliseconds() - this._getLastRenderedTime()
    return reasonForUpdatingOrNot
  }

  protected _updateHtml() {
    const stumpNodeToMountOn = <abstractHtmlTag>this._htmlStumpNode.getParent()
    const currentIndex = this._htmlStumpNode.getIndex()
    this._removeHtml()
    this._mountHtml(stumpNodeToMountOn, this._toLoadedOrLoadingStumpCode(), currentIndex)
  }

  unmountAndDestroy() {
    this.unmount()
    return this.destroy()
  }

  // todo: move to keyword node class?
  toggle(firstWord: string, contentOptions: string[]) {
    const currentNode = <AbstractTreeComponent>this.getNode(firstWord)
    if (!contentOptions) return currentNode ? currentNode.unmountAndDestroy() : this.appendLine(firstWord)
    const currentContent = currentNode === undefined ? undefined : currentNode.getContent()

    const index = contentOptions.indexOf(currentContent)
    const newContent = index === -1 || index + 1 === contentOptions.length ? contentOptions[0] : contentOptions[index + 1]

    this.delete(firstWord)
    if (newContent) this.touchNode(firstWord).setContent(newContent)
    return newContent
  }

  isMounted() {
    return !!this._htmlStumpNode
  }

  toggleAndRender(firstWord: string, contentOptions: string[]) {
    this.toggle(firstWord, contentOptions)
    this.getRootNode().renderAndGetRenderReport()
  }

  protected _getFirstOutdatedDependency(lastRenderedTime = this._getLastRenderedTime() || 0) {
    return this.getDependencies().find(dep => dep.getLineModifiedTime() > lastRenderedTime)
  }

  getWhetherToUpdateAndReason(): reasonForUpdatingOrNot {
    const mTime = this.getLineModifiedTime()
    const lastRenderedTime = this._getLastRenderedTime() || 0
    const staleTime = mTime - lastRenderedTime
    if (lastRenderedTime === 0)
      return {
        shouldUpdate: true,
        reason: "shouldUpdate because this TreeComponent hasn't been rendered yet",
        staleTime: staleTime
      }

    if (staleTime > 0)
      return {
        shouldUpdate: true,
        reason: "shouldUpdate because this TreeComponent changed",
        staleTime: staleTime
      }

    const outdatedDependency = this._getFirstOutdatedDependency(lastRenderedTime)
    if (outdatedDependency)
      return {
        shouldUpdate: true,
        reason: "Should update because a dependency updated",
        dependency: outdatedDependency,
        staleTime: outdatedDependency.getLineModifiedTime() - lastRenderedTime
      }
    return {
      shouldUpdate: false,
      reason: "Should NOT update because no dependency changed",
      lastRenderedTime: lastRenderedTime,
      mTime: mTime
    }
  }

  getDependencies(): AbstractTreeComponent[] {
    return []
  }

  protected _getTreeComponentsThatNeedRendering(arr: childShouldUpdateResult[]) {
    this._getChildTreeComponents().forEach((child: AbstractTreeComponent) => {
      const reasonForUpdatingOrNot = child.getWhetherToUpdateAndReason()
      if (!child.isMounted() || reasonForUpdatingOrNot.shouldUpdate) arr.push({ child: child, childUpdateBecause: reasonForUpdatingOrNot })
      child._getTreeComponentsThatNeedRendering(arr)
    })
  }

  toStumpLoadingCode() {
    return `div Loading ${this.getFirstWord()}...
 class ${this.getCssClassNames().join(" ")}
 id ${this.getTreeComponentId()}`
  }

  getTreeComponentId() {
    // html ids can't begin with a number
    return "treeComponent" + this._getUid()
  }

  private _toLoadedOrLoadingStumpCode() {
    if (!this.isLoaded()) return this.toStumpLoadingCode()
    this.setRunTimePhaseError("renderPhase")
    try {
      return this.toStumpCode()
    } catch (err) {
      console.error(err)
      this.setRunTimePhaseError("renderPhase", err)
      return this.toStumpErrorStateCode(err)
    }
  }

  toStumpErrorStateCode(err: any) {
    return `div ${err}
 class ${this.getCssClassNames().join(" ")}
 id ${this.getTreeComponentId()}`
  }

  protected _mount(stumpNodeToMountOn: abstractHtmlTag, index: number) {
    this._setLastRenderedTime(this._getProcessTimeInMilliseconds())

    this.treeComponentWillMount()

    this._mountCss()
    this._mountHtml(stumpNodeToMountOn, this._toLoadedOrLoadingStumpCode(), index) // todo: add index back?

    this._lastTimeToRender = this._getProcessTimeInMilliseconds() - this._getLastRenderedTime()
    return this
  }

  // todo: we might be able to squeeze virtual dom in here on the mountCss and mountHtml methods.
  protected _mountCss() {
    const css = this._css
    if (!css) return this

    // todo: only insert css once per class? have a set?
    this._cssStumpNode = this._getPageHeadStump().insertCssChildNode(`styleTag
 for ${this.constructor.name}
 bern${jtree.TreeNode.nest(css, 2)}`)
  }

  protected _getPageHeadStump(): abstractHtmlTag {
    return this.getRootNode().willowBrowser.getHeadStumpNode()
  }

  protected _removeCss() {
    if (!this._cssStumpNode) return this
    this._cssStumpNode.removeCssStumpNode()
    delete this._cssStumpNode
  }

  protected _mountHtml(stumpNodeToMountOn: abstractHtmlTag, htmlCode: string, index: number) {
    this._htmlStumpNode = stumpNodeToMountOn.insertChildNode(htmlCode, index)
    this._htmlStumpNode.setStumpNodeTreeComponent(this)
  }

  renderAndGetRenderReport(stumpNode?: abstractHtmlTag, index?: number) {
    const isUpdateOp = this.isMounted()
    let treeComponentUpdateReport: reasonForUpdatingOrNot = {
      shouldUpdate: false,
      reason: ""
    }
    if (isUpdateOp) treeComponentUpdateReport = this._updateAndGetUpdateReport()
    else this._mount(stumpNode, index)

    const stumpNodeForChildren = this.getStumpNodeForChildren()

    // Todo: insert delayed rendering?
    const childResults = this._getChildTreeComponents().map((child: any, index: number) => child.renderAndGetRenderReport(stumpNodeForChildren, index))

    if (isUpdateOp) {
      if (treeComponentUpdateReport.shouldUpdate) {
        try {
          if (this.isLoaded()) this.treeComponentDidUpdate()
        } catch (err) {
          console.error(err)
        }
      }
    } else {
      try {
        if (this.isLoaded()) this.treeComponentDidMount()
      } catch (err) {
        console.error(err)
      }
    }

    let str = `${this.getWord(0) || this.constructor.name} ${isUpdateOp ? "update" : "mount"} ${treeComponentUpdateReport.shouldUpdate} ${treeComponentUpdateReport.reason}`
    childResults.forEach((child: any) => (str += "\n" + child.toString(1)))
    return new jtree.TreeNode(str)
  }
}

class TreeComponentFrameworkDebuggerComponent extends AbstractTreeComponent {
  toHakonCode() {
    return `.TreeComponentFrameworkDebuggerComponent
 position fixed
 top 5px
 left 5px
 z-index 1000
 background rgba(254,255,156, .95)
 box-shadow 1px 1px 1px rgba(0,0,0,.5)
 padding 12px
 overflow scroll
 max-height 500px
.TreeComponentFrameworkDebuggerComponentCloseButton
 position absolute
 cursor pointer
 opacity .9
 top 2px
 right 2px
 &:hover
  opacity 1`
  }

  toStumpCode() {
    const app: any = this.getRootNode()
    return `div
 class TreeComponentFrameworkDebuggerComponent
 div x
  class TreeComponentFrameworkDebuggerComponentCloseButton
  clickCommand toggleTreeComponentFrameworkDebuggerCommand
 div
  span This app is powered by the
  a Tree Component Framework
   href https://github.com/treenotation/jtree/tree/main/treeComponentFramework
 p ${app.getNumberOfLines()} components loaded. ${WillowBrowser._stumpsOnPage} stumps on page.
 pre
  bern
${app.toString(3)}`
  }
}

abstract class AbstractGithubTriangleComponent extends AbstractTreeComponent {
  githubLink = `https://github.com/treenotation/jtree`

  toHakonCode() {
    return `.AbstractGithubTriangleComponent
 display block
 position absolute
 top 0
 right 0`
  }
  toStumpCode() {
    return `a
 class AbstractGithubTriangleComponent
 href ${this.githubLink}
 img
  src /images/github-fork.svg`
  }
}

export { AbstractGithubTriangleComponent, AbstractTreeComponent, WillowBrowser, TreeComponentFrameworkDebuggerComponent }
