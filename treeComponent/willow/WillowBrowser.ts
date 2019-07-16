import { AbstractWillowProgram, AbstractWillowShadow, WillowConstants } from "./Willow"

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

  shadowHasClass(name) {
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

  getShadowAttr(name) {
    return this._getJQElement().attr(name)
  }

  _logMessage(type) {
    if (true) return true
    WillowBrowserShadow._shadowUpdateNumber++
    console.log(`DOM Update ${WillowBrowserShadow._shadowUpdateNumber}: ${type}`)
  }

  getShadowCss(prop) {
    return this._getJQElement().css(prop)
  }

  isShadowResizable() {
    return this._getJQElement().find(".ui-resizable-handle").length > 0
  }

  triggerShadowEvent(event) {
    this._getJQElement().trigger(event)
    this._logMessage("trigger")
    return this
  }

  // BEGIN MUTABLE METHODS:

  // todo: add tests
  // todo: idea, don't "paint" wall (dont append it to parent, until done.)
  insertHtmlNode(childStumpNode, index) {
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

  addClassToShadow(className) {
    this._getJQElement().addClass(className)
    this._logMessage("addClass")
    return this
  }

  removeClassFromShadow(className) {
    this._getJQElement().removeClass(className)
    this._logMessage("removeClass")
    return this
  }

  onShadowEvent(event, two, three) {
    this._getJQElement().on(event, two, three)
    this._logMessage("bind on")
    return this
  }

  offShadowEvent(event, fn) {
    this._getJQElement().off(event, fn)
    this._logMessage("bind off")
    return this
  }

  toggleShadow() {
    this._getJQElement().toggle()
    this._logMessage("toggle")
    return this
  }

  makeResizable(options) {
    this._getJQElement().resizable(options)
    this._logMessage("resizable")
    return this
  }

  removeShadow() {
    this._getJQElement().remove()
    this._logMessage("remove")
    return this
  }

  setInputOrTextAreaValue(value) {
    this._getJQElement().val(value)
    this._logMessage("val")
    return this
  }

  setShadowAttr(name, value) {
    this._getJQElement().attr(name, value)
    this._logMessage("attr")
    return this
  }

  makeDraggable(options) {
    this._logMessage("draggable")
    this._getJQElement().draggable(options)
    return this
  }

  setShadowCss(css) {
    this._getJQElement().css(css)
    this._logMessage("css")
    return this
  }

  makeSelectable(options) {
    this._getJQElement().selectable(options)
    this._logMessage("selectable")
    return this
  }
}

// same thing, except with side effects.
class WillowBrowserProgram extends AbstractWillowProgram {
  findStumpNodesByShadowClass(className) {
    const stumpNodes = []
    const that = this
    jQuery("." + className).each(function() {
      stumpNodes.push(that.getStumpNodeFromElement(this))
    })
    return stumpNodes
  }

  queryObjectToQueryString(obj) {
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

  setCopyHandler(fn) {
    jQuery(document).on(WillowConstants.ShadowEvents.copy, fn)
    return this
  }

  setCutHandler(fn) {
    jQuery(document).on(WillowConstants.ShadowEvents.cut, fn)
    return this
  }

  setPasteHandler(fn) {
    window.addEventListener(WillowConstants.ShadowEvents.paste, fn, false)
    return this
  }

  setErrorHandler(fn) {
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

  setCopyData(evt, str) {
    const originalEvent = evt.originalEvent
    originalEvent.preventDefault()
    originalEvent.clipboardData.setData("text/plain", str)
    originalEvent.clipboardData.setData("text/html", str)
  }

  getMousetrap() {
    return (<any>window).Mousetrap
  }

  copyTextToClipboard(text) {
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

  async appendScript(url) {
    if (!url) return undefined
    if (!this._loadingPromises) this._loadingPromises = {}
    if (this._loadingPromises[url]) return this._loadingPromises[url]

    if (this.isNodeJs()) return undefined

    this._loadingPromises[url] = this._appendScript(url)
    return this._loadingPromises[url]
  }

  _appendScript(url) {
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

  downloadFile(data, filename, filetype) {
    const downloadLink = document.createElement("a")
    downloadLink.setAttribute("href", `data:${filetype},` + encodeURIComponent(data))
    downloadLink.setAttribute("download", filename)
    downloadLink.click()
  }

  reload() {
    window.location.reload()
  }

  openUrl(link) {
    window.open(link)
  }

  setResizeEndHandler(fn) {
    let resizeTimer
    $(window).on(WillowConstants.ShadowEvents.resize, evt => {
      const target = $(evt.target)
      if (target.is("div")) return // dont resize on div resizes
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        fn({ width: target.width(), height: target.height() })
      }, 100)
    })
    return this
  }

  getStumpNodeFromElement(el) {
    const jqEl: any = jQuery(el)
    return this.getHtmlStumpNode().getNodeByGuid(parseInt(jqEl.attr(WillowConstants.uidAttribute)))
  }

  forceRepaint() {
    jQuery(window).width()
  }

  getBrowserHtml() {
    return document.documentElement.outerHTML
  }

  async confirmThen(message) {
    return confirm(message)
  }

  async promptThen(message, value) {
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

  setLoadedDroppedFileHandler(callback, helpText = "") {
    const bodyStumpNode = this.getBodyStumpNode()
    const bodyShadow = bodyStumpNode.getShadow()

    // Added the below to ensure dragging from the chrome downloads bar works
    // http://stackoverflow.com/questions/19526430/drag-and-drop-file-uploads-from-chrome-downloads-bar
    const handleChromeBug = event => {
      const originalEvent = event.originalEvent
      const effect = originalEvent.dataTransfer.effectAllowed
      originalEvent.dataTransfer.dropEffect = effect === "move" || effect === "linkMove" ? "move" : "copy"
    }

    const dragoverHandler = event => {
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

    const dragleaveHandler = event => {
      event.preventDefault()
      event.stopPropagation()
      bodyStumpNode.removeClassFromStumpNode("dragOver")
      bodyStumpNode.findStumpNodeByChild("id dragOverHelp").removeStumpNode()
      bodyShadow.offShadowEvent(WillowConstants.ShadowEvents.dragleave, dragleaveHandler)
    }

    const dropHandler = async event => {
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
    bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.dragenter, function(event) {
      event.preventDefault()
      event.stopPropagation()
    })
  }

  _handleDroppedEntry(item, path = "") {
    // http://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree
    // http://stackoverflow.com/questions/6756583/prevent-browser-from-loading-a-drag-and-dropped-file
    return item.isFile ? this._handleDroppedFile(item) : this._handleDroppedDirectory(item, path)
  }

  _handleDroppedDirectory(item, path) {
    return new Promise((resolve, reject) => {
      item.createReader().readEntries(async entries => {
        const promises = []
        for (let i = 0; i < entries.length; i++) {
          promises.push(this._handleDroppedEntry(entries[i], path + item.name + "/"))
        }
        const res = await Promise.all(promises)
        resolve(res)
      })
    })
  }

  _handleDroppedFile(file) {
    // https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
    // http://www.sitepoint.com/html5-javascript-open-dropped-files/
    return new Promise((resolve, reject) => {
      file.file(data => {
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

  static startApp(appClass, startState?: string) {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        const win = <any>window
        if (!win.app) {
          win.app = new appClass(startState)
          win.app.renderAndGetRenderResult(win.app.getWillowProgram().getBodyStumpNode())
        }
      },
      false
    )
  }
}

export { WillowBrowserProgram }
