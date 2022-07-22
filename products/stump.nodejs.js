#! /usr/bin/env node
{
  const { jtree } = require("../index.js")

  class stumpNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        errorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          blockquote: htmlTagNode,
          colgroup: htmlTagNode,
          datalist: htmlTagNode,
          fieldset: htmlTagNode,
          menuitem: htmlTagNode,
          noscript: htmlTagNode,
          optgroup: htmlTagNode,
          progress: htmlTagNode,
          styleTag: htmlTagNode,
          template: htmlTagNode,
          textarea: htmlTagNode,
          titleTag: htmlTagNode,
          address: htmlTagNode,
          article: htmlTagNode,
          caption: htmlTagNode,
          details: htmlTagNode,
          section: htmlTagNode,
          summary: htmlTagNode,
          button: htmlTagNode,
          canvas: htmlTagNode,
          dialog: htmlTagNode,
          figure: htmlTagNode,
          footer: htmlTagNode,
          header: htmlTagNode,
          hgroup: htmlTagNode,
          iframe: htmlTagNode,
          keygen: htmlTagNode,
          legend: htmlTagNode,
          object: htmlTagNode,
          option: htmlTagNode,
          output: htmlTagNode,
          script: htmlTagNode,
          select: htmlTagNode,
          source: htmlTagNode,
          strong: htmlTagNode,
          aside: htmlTagNode,
          embed: htmlTagNode,
          input: htmlTagNode,
          label: htmlTagNode,
          meter: htmlTagNode,
          param: htmlTagNode,
          small: htmlTagNode,
          table: htmlTagNode,
          tbody: htmlTagNode,
          tfoot: htmlTagNode,
          thead: htmlTagNode,
          track: htmlTagNode,
          video: htmlTagNode,
          abbr: htmlTagNode,
          area: htmlTagNode,
          base: htmlTagNode,
          body: htmlTagNode,
          code: htmlTagNode,
          form: htmlTagNode,
          head: htmlTagNode,
          html: htmlTagNode,
          link: htmlTagNode,
          main: htmlTagNode,
          mark: htmlTagNode,
          menu: htmlTagNode,
          meta: htmlTagNode,
          ruby: htmlTagNode,
          samp: htmlTagNode,
          span: htmlTagNode,
          time: htmlTagNode,
          bdi: htmlTagNode,
          bdo: htmlTagNode,
          col: htmlTagNode,
          del: htmlTagNode,
          dfn: htmlTagNode,
          div: htmlTagNode,
          img: htmlTagNode,
          ins: htmlTagNode,
          kbd: htmlTagNode,
          map: htmlTagNode,
          nav: htmlTagNode,
          pre: htmlTagNode,
          rtc: htmlTagNode,
          sub: htmlTagNode,
          sup: htmlTagNode,
          var: htmlTagNode,
          wbr: htmlTagNode,
          br: htmlTagNode,
          dd: htmlTagNode,
          dl: htmlTagNode,
          dt: htmlTagNode,
          em: htmlTagNode,
          h1: htmlTagNode,
          h2: htmlTagNode,
          h3: htmlTagNode,
          h4: htmlTagNode,
          h5: htmlTagNode,
          h6: htmlTagNode,
          hr: htmlTagNode,
          li: htmlTagNode,
          ol: htmlTagNode,
          rb: htmlTagNode,
          rp: htmlTagNode,
          rt: htmlTagNode,
          td: htmlTagNode,
          th: htmlTagNode,
          tr: htmlTagNode,
          ul: htmlTagNode,
          a: htmlTagNode,
          b: htmlTagNode,
          i: htmlTagNode,
          p: htmlTagNode,
          q: htmlTagNode,
          s: htmlTagNode,
          u: htmlTagNode
        }),
        [{ regex: /^$/, nodeConstructor: blankLineNode }, { regex: /^[a-zA-Z0-9_]+Component/, nodeConstructor: componentDefinitionNode }]
      )
    }
    compile() {
      return this.toHtml()
    }
    _getHtmlJoinByCharacter() {
      return ""
    }
    static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(`tooling onsave jtree build produceLang stump
anyCell
keywordCell
emptyCell
extraCell
 highlightScope invalid
anyHtmlContentCell
 highlightScope string
attributeValueCell
 highlightScope constant.language
componentTagNameCell
 highlightScope variable.function
 extends keywordCell
htmlTagNameCell
 highlightScope variable.function
 extends keywordCell
 enum a abbr address area article aside b base bdi bdo blockquote body br button canvas caption code col colgroup datalist dd del details dfn dialog div dl dt em embed fieldset figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rb rp rt rtc ruby s samp script section select small source span strong styleTag sub summary sup table tbody td template textarea tfoot th thead time titleTag tr track u ul var video wbr
htmlAttributeNameCell
 highlightScope entity.name.type
 extends keywordCell
 enum accept accept-charset accesskey action align alt async autocomplete autofocus autoplay bgcolor border charset checked class color cols colspan content contenteditable controls coords datetime default defer dir dirname disabled download draggable dropzone enctype for formaction headers height hidden high href hreflang http-equiv id ismap kind lang list loop low max maxlength media method min multiple muted name novalidate onabort onafterprint onbeforeprint onbeforeunload onblur oncanplay oncanplaythrough onchange onclick oncontextmenu oncopy oncuechange oncut ondblclick ondrag ondragend ondragenter ondragleave ondragover ondragstart ondrop ondurationchange onemptied onended onerror onfocus onhashchange oninput oninvalid onkeydown onkeypress onkeyup onload onloadeddata onloadedmetadata onloadstart onmousedown onmousemove onmouseout onmouseover onmouseup onmousewheel onoffline ononline onpagehide onpageshow onpaste onpause onplay onplaying onpopstate onprogress onratechange onreset onresize onscroll onsearch onseeked onseeking onselect onstalled onstorage onsubmit onsuspend ontimeupdate ontoggle onunload onvolumechange onwaiting onwheel open optimum pattern placeholder poster preload property readonly rel required reversed rows rowspan sandbox scope selected shape size sizes spellcheck src srcdoc srclang srcset start step style tabindex target title translate type usemap value width wrap
bernKeywordCell
 enum bern
 extends keywordCell
stumpNode
 root
 description A prefix Tree Language that compiles to HTML.
 catchAllNodeType errorNode
 inScope htmlTagNode blankLineNode
 example
  div
   h1 hello world
 compilesTo html
 javascript
  compile() {
   return this.toHtml()
  }
  _getHtmlJoinByCharacter() {
    return ""
  }
blankLineNode
 pattern ^$
 tags doNotSynthesize
 cells emptyCell
 javascript
  _toHtml() {
   return ""
  }
  getTextContent() {return ""}
htmlTagNode
 inScope bernNode htmlTagNode htmlAttributeNode blankLineNode
 catchAllCellType anyHtmlContentCell
 cells htmlTagNameCell
 javascript
  isHtmlTagNode = true
  getTag() {
   // we need to remove the "Tag" bit to handle the style and title attribute/tag conflict.
   const firstWord = this.getFirstWord()
   const map = {
    titleTag: "title",
    styleTag: "style"
   }
   return map[firstWord] || firstWord
  }
  _getHtmlJoinByCharacter() {
   return ""
  }
  toHtmlWithSuids() {
   return this._toHtml(undefined, true)
  }
  _getOneLiner() {
   const oneLinerWords = this.getWordsFrom(1)
   return oneLinerWords.length ? oneLinerWords.join(" ") : ""
  }
  getTextContent() {
    return this._getOneLiner()
  }
  shouldCollapse() {
   return this.has("collapse")
  }
  get domElement() {
    var elem = document.createElement(this.getTag())
    elem.setAttribute("stumpUid", this._getUid())
    this.filter(node => node.isAttributeNode)
      .forEach(child => elem.setAttribute(child.getFirstWord(), child.getContent()))
    elem.innerHTML = this.has("bern") ? this.getNode("bern").childrenToString() : this._getOneLiner()
    this.filter(node => node.isHtmlTagNode)
      .forEach(child => elem.appendChild(child.domElement))
    return elem
  }
  _toHtml(indentCount, withSuid) {
   const tag = this.getTag()
   const children = this.map(child => child._toHtml(indentCount + 1, withSuid)).join("")
   const attributesStr = this.filter(node => node.isAttributeNode)
    .map(child => child.getAttribute())
    .join("")
   const indent = " ".repeat(indentCount)
   const collapse = this.shouldCollapse()
   const indentForChildNodes = !collapse && this.getChildInstancesOfNodeTypeId("htmlTagNode").length > 0
   const suid = withSuid ? \` stumpUid="\${this._getUid()}"\` : ""
   const oneLiner = this._getOneLiner()
   return \`\${!collapse ? indent : ""}<\${tag}\${attributesStr}\${suid}>\${oneLiner}\${indentForChildNodes ? "\\n" : ""}\${children}</\${tag}>\${collapse ? "" : "\\n"}\`
  }
  removeCssStumpNode() {
   return this.removeStumpNode()
  }
  removeStumpNode() {
   this.getShadow().removeShadow()
   return this.destroy()
  }
  getNodeByGuid(guid) {
   return this.getTopDownArray().find(node => node._getUid() === guid)
  }
  addClassToStumpNode(className) {
   const classNode = this.touchNode("class")
   const words = classNode.getWordsFrom(1)
   // note: we call add on shadow regardless, because at the moment stump may have gotten out of
   // sync with shadow, if things modified the dom. todo: cleanup.
   this.getShadow().addClassToShadow(className)
   if (words.includes(className)) return this
   words.push(className)
   classNode.setContent(words.join(this.getWordBreakSymbol()))
   return this
  }
  removeClassFromStumpNode(className) {
   const classNode = this.getNode("class")
   if (!classNode) return this
   const newClasses = classNode.getWords().filter(word => word !== className)
   if (!newClasses.length) classNode.destroy()
   else classNode.setContent(newClasses.join(" "))
   this.getShadow().removeClassFromShadow(className)
   return this
  }
  stumpNodeHasClass(className) {
   const classNode = this.getNode("class")
   return classNode && classNode.getWords().includes(className) ? true : false
  }
  isStumpNodeCheckbox() {
   return this.get("type") === "checkbox"
  }
  getShadow() {
   if (!this._shadow) {
    const shadowClass = this.getShadowClass()
    this._shadow = new shadowClass(this)
   }
   return this._shadow
  }
  insertCssChildNode(text, index) {
   return this.insertChildNode(text, index)
  }
  insertChildNode(text, index) {
   const singleNode = new jtree.TreeNode(text).getChildren()[0]
   const newNode = this.insertLineAndChildren(singleNode.getLine(), singleNode.childrenToString(), index)
   const stumpNodeIndex = this.filter(node => node.isHtmlTagNode).indexOf(newNode)
   this.getShadow().insertHtmlNode(newNode, stumpNodeIndex)
   return newNode
  }
  isInputType() {
   return ["input", "textarea"].includes(this.getTag()) || this.get("contenteditable") === "true"
  }
  findStumpNodeByChild(line) {
   return this.findStumpNodesByChild(line)[0]
  }
  findStumpNodeByChildString(line) {
   return this.getTopDownArray().find(node =>
    node
     .map(child => child.getLine())
     .join("\\n")
     .includes(line)
   )
  }
  findStumpNodeByFirstWord(firstWord) {
   return this._findStumpNodesByBase(firstWord)[0]
  }
  _findStumpNodesByBase(firstWord) {
   return this.getTopDownArray().filter(node => node.doesExtend("htmlTagNode") && node.getFirstWord() === firstWord)
  }
  hasLine(line) {
   return this.getChildren().some(node => node.getLine() === line)
  }
  findStumpNodesByChild(line) {
   return this.getTopDownArray().filter(node => node.doesExtend("htmlTagNode") && node.hasLine(line))
  }
  findStumpNodesWithClass(className) {
   return this.getTopDownArray().filter(
    node =>
     node.doesExtend("htmlTagNode") &&
     node.has("class") &&
     node
      .getNode("class")
      .getWords()
      .includes(className)
   )
  }
  getShadowClass() {
   return this.getParent().getShadowClass()
  }
  // todo: should not be here
  getStumpNodeTreeComponent() {
   return this._treeComponent || this.getParent().getStumpNodeTreeComponent()
  }
  // todo: should not be here
  setStumpNodeTreeComponent(treeComponent) {
   this._treeComponent = treeComponent
   return this
  }
  getStumpNodeCss(prop) {
   return this.getShadow().getShadowCss(prop)
  }
  getStumpNodeAttr(key) {
   return this.get(key)
  }
  setStumpNodeAttr(key, value) {
   // todo
   return this
  }
  toHtml() {
   return this._toHtml()
  }
errorNode
 baseNodeType errorNode
componentDefinitionNode
 extends htmlTagNode
 pattern ^[a-zA-Z0-9_]+Component
 cells componentTagNameCell
 javascript
  getTag() {
   return "div"
  }
htmlAttributeNode
 javascript
  _toHtml() {
   return ""
  }
  getTextContent() {return ""}
  getAttribute() {
   return \` \${this.getFirstWord()}="\${this.getContent()}"\`
  }
 boolean isAttributeNode true
 boolean isTileAttribute true
 catchAllNodeType errorNode
 catchAllCellType attributeValueCell
 cells htmlAttributeNameCell
stumpExtendedAttributeNameCell
 extends htmlAttributeNameCell
 enum collapse blurCommand changeCommand clickCommand contextMenuCommand doubleClickCommand keyUpCommand lineClickCommand lineShiftClickCommand shiftClickCommand
stumpExtendedAttributeNode
 description Node types not present in HTML but included in stump.
 extends htmlAttributeNode
 cells stumpExtendedAttributeNameCell
lineOfHtmlContentNode
 boolean isTileAttribute true
 catchAllNodeType lineOfHtmlContentNode
 catchAllCellType anyHtmlContentCell
 javascript
  getTextContent() {return this.getLine()}
bernNode
 boolean isTileAttribute true
 todo Rename this node type
 description This is a node where you can put any HTML content. It is called "bern" until someone comes up with a better name.
 catchAllNodeType lineOfHtmlContentNode
 javascript
  _toHtml() {
   return this.childrenToString()
  }
  getTextContent() {return ""}
 cells bernKeywordCell`)
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        stumpNode: stumpNode,
        blankLineNode: blankLineNode,
        htmlTagNode: htmlTagNode,
        errorNode: errorNode,
        componentDefinitionNode: componentDefinitionNode,
        htmlAttributeNode: htmlAttributeNode,
        stumpExtendedAttributeNode: stumpExtendedAttributeNode,
        lineOfHtmlContentNode: lineOfHtmlContentNode,
        bernNode: bernNode
      }
    }
  }

  class blankLineNode extends jtree.GrammarBackedNode {
    get emptyCell() {
      return this.getWord(0)
    }
    _toHtml() {
      return ""
    }
    getTextContent() {
      return ""
    }
  }

  class htmlTagNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          blockquote: htmlTagNode,
          colgroup: htmlTagNode,
          datalist: htmlTagNode,
          fieldset: htmlTagNode,
          menuitem: htmlTagNode,
          noscript: htmlTagNode,
          optgroup: htmlTagNode,
          progress: htmlTagNode,
          styleTag: htmlTagNode,
          template: htmlTagNode,
          textarea: htmlTagNode,
          titleTag: htmlTagNode,
          address: htmlTagNode,
          article: htmlTagNode,
          caption: htmlTagNode,
          details: htmlTagNode,
          section: htmlTagNode,
          summary: htmlTagNode,
          button: htmlTagNode,
          canvas: htmlTagNode,
          dialog: htmlTagNode,
          figure: htmlTagNode,
          footer: htmlTagNode,
          header: htmlTagNode,
          hgroup: htmlTagNode,
          iframe: htmlTagNode,
          keygen: htmlTagNode,
          legend: htmlTagNode,
          object: htmlTagNode,
          option: htmlTagNode,
          output: htmlTagNode,
          script: htmlTagNode,
          select: htmlTagNode,
          source: htmlTagNode,
          strong: htmlTagNode,
          aside: htmlTagNode,
          embed: htmlTagNode,
          input: htmlTagNode,
          label: htmlTagNode,
          meter: htmlTagNode,
          param: htmlTagNode,
          small: htmlTagNode,
          table: htmlTagNode,
          tbody: htmlTagNode,
          tfoot: htmlTagNode,
          thead: htmlTagNode,
          track: htmlTagNode,
          video: htmlTagNode,
          abbr: htmlTagNode,
          area: htmlTagNode,
          base: htmlTagNode,
          body: htmlTagNode,
          code: htmlTagNode,
          form: htmlTagNode,
          head: htmlTagNode,
          html: htmlTagNode,
          link: htmlTagNode,
          main: htmlTagNode,
          mark: htmlTagNode,
          menu: htmlTagNode,
          meta: htmlTagNode,
          ruby: htmlTagNode,
          samp: htmlTagNode,
          span: htmlTagNode,
          time: htmlTagNode,
          bdi: htmlTagNode,
          bdo: htmlTagNode,
          col: htmlTagNode,
          del: htmlTagNode,
          dfn: htmlTagNode,
          div: htmlTagNode,
          img: htmlTagNode,
          ins: htmlTagNode,
          kbd: htmlTagNode,
          map: htmlTagNode,
          nav: htmlTagNode,
          pre: htmlTagNode,
          rtc: htmlTagNode,
          sub: htmlTagNode,
          sup: htmlTagNode,
          var: htmlTagNode,
          wbr: htmlTagNode,
          br: htmlTagNode,
          dd: htmlTagNode,
          dl: htmlTagNode,
          dt: htmlTagNode,
          em: htmlTagNode,
          h1: htmlTagNode,
          h2: htmlTagNode,
          h3: htmlTagNode,
          h4: htmlTagNode,
          h5: htmlTagNode,
          h6: htmlTagNode,
          hr: htmlTagNode,
          li: htmlTagNode,
          ol: htmlTagNode,
          rb: htmlTagNode,
          rp: htmlTagNode,
          rt: htmlTagNode,
          td: htmlTagNode,
          th: htmlTagNode,
          tr: htmlTagNode,
          ul: htmlTagNode,
          a: htmlTagNode,
          b: htmlTagNode,
          i: htmlTagNode,
          p: htmlTagNode,
          q: htmlTagNode,
          s: htmlTagNode,
          u: htmlTagNode,
          oncanplaythrough: htmlAttributeNode,
          ondurationchange: htmlAttributeNode,
          onloadedmetadata: htmlAttributeNode,
          contenteditable: htmlAttributeNode,
          "accept-charset": htmlAttributeNode,
          onbeforeunload: htmlAttributeNode,
          onvolumechange: htmlAttributeNode,
          onbeforeprint: htmlAttributeNode,
          oncontextmenu: htmlAttributeNode,
          autocomplete: htmlAttributeNode,
          onafterprint: htmlAttributeNode,
          onhashchange: htmlAttributeNode,
          onloadeddata: htmlAttributeNode,
          onmousewheel: htmlAttributeNode,
          onratechange: htmlAttributeNode,
          ontimeupdate: htmlAttributeNode,
          oncuechange: htmlAttributeNode,
          ondragenter: htmlAttributeNode,
          ondragleave: htmlAttributeNode,
          ondragstart: htmlAttributeNode,
          onloadstart: htmlAttributeNode,
          onmousedown: htmlAttributeNode,
          onmousemove: htmlAttributeNode,
          onmouseover: htmlAttributeNode,
          placeholder: htmlAttributeNode,
          formaction: htmlAttributeNode,
          "http-equiv": htmlAttributeNode,
          novalidate: htmlAttributeNode,
          ondblclick: htmlAttributeNode,
          ondragover: htmlAttributeNode,
          onkeypress: htmlAttributeNode,
          onmouseout: htmlAttributeNode,
          onpagehide: htmlAttributeNode,
          onpageshow: htmlAttributeNode,
          onpopstate: htmlAttributeNode,
          onprogress: htmlAttributeNode,
          spellcheck: htmlAttributeNode,
          accesskey: htmlAttributeNode,
          autofocus: htmlAttributeNode,
          draggable: htmlAttributeNode,
          maxlength: htmlAttributeNode,
          oncanplay: htmlAttributeNode,
          ondragend: htmlAttributeNode,
          onemptied: htmlAttributeNode,
          oninvalid: htmlAttributeNode,
          onkeydown: htmlAttributeNode,
          onmouseup: htmlAttributeNode,
          onoffline: htmlAttributeNode,
          onplaying: htmlAttributeNode,
          onseeking: htmlAttributeNode,
          onstalled: htmlAttributeNode,
          onstorage: htmlAttributeNode,
          onsuspend: htmlAttributeNode,
          onwaiting: htmlAttributeNode,
          translate: htmlAttributeNode,
          autoplay: htmlAttributeNode,
          controls: htmlAttributeNode,
          datetime: htmlAttributeNode,
          disabled: htmlAttributeNode,
          download: htmlAttributeNode,
          dropzone: htmlAttributeNode,
          hreflang: htmlAttributeNode,
          multiple: htmlAttributeNode,
          onchange: htmlAttributeNode,
          ononline: htmlAttributeNode,
          onresize: htmlAttributeNode,
          onscroll: htmlAttributeNode,
          onsearch: htmlAttributeNode,
          onseeked: htmlAttributeNode,
          onselect: htmlAttributeNode,
          onsubmit: htmlAttributeNode,
          ontoggle: htmlAttributeNode,
          onunload: htmlAttributeNode,
          property: htmlAttributeNode,
          readonly: htmlAttributeNode,
          required: htmlAttributeNode,
          reversed: htmlAttributeNode,
          selected: htmlAttributeNode,
          tabindex: htmlAttributeNode,
          bgcolor: htmlAttributeNode,
          charset: htmlAttributeNode,
          checked: htmlAttributeNode,
          colspan: htmlAttributeNode,
          content: htmlAttributeNode,
          default: htmlAttributeNode,
          dirname: htmlAttributeNode,
          enctype: htmlAttributeNode,
          headers: htmlAttributeNode,
          onabort: htmlAttributeNode,
          onclick: htmlAttributeNode,
          onended: htmlAttributeNode,
          onerror: htmlAttributeNode,
          onfocus: htmlAttributeNode,
          oninput: htmlAttributeNode,
          onkeyup: htmlAttributeNode,
          onpaste: htmlAttributeNode,
          onpause: htmlAttributeNode,
          onreset: htmlAttributeNode,
          onwheel: htmlAttributeNode,
          optimum: htmlAttributeNode,
          pattern: htmlAttributeNode,
          preload: htmlAttributeNode,
          rowspan: htmlAttributeNode,
          sandbox: htmlAttributeNode,
          srclang: htmlAttributeNode,
          accept: htmlAttributeNode,
          action: htmlAttributeNode,
          border: htmlAttributeNode,
          coords: htmlAttributeNode,
          height: htmlAttributeNode,
          hidden: htmlAttributeNode,
          method: htmlAttributeNode,
          onblur: htmlAttributeNode,
          oncopy: htmlAttributeNode,
          ondrag: htmlAttributeNode,
          ondrop: htmlAttributeNode,
          onload: htmlAttributeNode,
          onplay: htmlAttributeNode,
          poster: htmlAttributeNode,
          srcdoc: htmlAttributeNode,
          srcset: htmlAttributeNode,
          target: htmlAttributeNode,
          usemap: htmlAttributeNode,
          align: htmlAttributeNode,
          async: htmlAttributeNode,
          class: htmlAttributeNode,
          color: htmlAttributeNode,
          defer: htmlAttributeNode,
          ismap: htmlAttributeNode,
          media: htmlAttributeNode,
          muted: htmlAttributeNode,
          oncut: htmlAttributeNode,
          scope: htmlAttributeNode,
          shape: htmlAttributeNode,
          sizes: htmlAttributeNode,
          start: htmlAttributeNode,
          style: htmlAttributeNode,
          title: htmlAttributeNode,
          value: htmlAttributeNode,
          width: htmlAttributeNode,
          cols: htmlAttributeNode,
          high: htmlAttributeNode,
          href: htmlAttributeNode,
          kind: htmlAttributeNode,
          lang: htmlAttributeNode,
          list: htmlAttributeNode,
          loop: htmlAttributeNode,
          name: htmlAttributeNode,
          open: htmlAttributeNode,
          rows: htmlAttributeNode,
          size: htmlAttributeNode,
          step: htmlAttributeNode,
          type: htmlAttributeNode,
          wrap: htmlAttributeNode,
          alt: htmlAttributeNode,
          dir: htmlAttributeNode,
          for: htmlAttributeNode,
          low: htmlAttributeNode,
          max: htmlAttributeNode,
          min: htmlAttributeNode,
          rel: htmlAttributeNode,
          src: htmlAttributeNode,
          id: htmlAttributeNode,
          lineShiftClickCommand: stumpExtendedAttributeNode,
          contextMenuCommand: stumpExtendedAttributeNode,
          doubleClickCommand: stumpExtendedAttributeNode,
          shiftClickCommand: stumpExtendedAttributeNode,
          lineClickCommand: stumpExtendedAttributeNode,
          changeCommand: stumpExtendedAttributeNode,
          clickCommand: stumpExtendedAttributeNode,
          keyUpCommand: stumpExtendedAttributeNode,
          blurCommand: stumpExtendedAttributeNode,
          collapse: stumpExtendedAttributeNode,
          bern: bernNode
        }),
        [{ regex: /^$/, nodeConstructor: blankLineNode }, { regex: /^[a-zA-Z0-9_]+Component/, nodeConstructor: componentDefinitionNode }]
      )
    }
    get htmlTagNameCell() {
      return this.getWord(0)
    }
    get anyHtmlContentCell() {
      return this.getWordsFrom(1)
    }
    isHtmlTagNode = true
    getTag() {
      // we need to remove the "Tag" bit to handle the style and title attribute/tag conflict.
      const firstWord = this.getFirstWord()
      const map = {
        titleTag: "title",
        styleTag: "style"
      }
      return map[firstWord] || firstWord
    }
    _getHtmlJoinByCharacter() {
      return ""
    }
    toHtmlWithSuids() {
      return this._toHtml(undefined, true)
    }
    _getOneLiner() {
      const oneLinerWords = this.getWordsFrom(1)
      return oneLinerWords.length ? oneLinerWords.join(" ") : ""
    }
    getTextContent() {
      return this._getOneLiner()
    }
    shouldCollapse() {
      return this.has("collapse")
    }
    get domElement() {
      var elem = document.createElement(this.getTag())
      elem.setAttribute("stumpUid", this._getUid())
      this.filter(node => node.isAttributeNode).forEach(child => elem.setAttribute(child.getFirstWord(), child.getContent()))
      elem.innerHTML = this.has("bern") ? this.getNode("bern").childrenToString() : this._getOneLiner()
      this.filter(node => node.isHtmlTagNode).forEach(child => elem.appendChild(child.domElement))
      return elem
    }
    _toHtml(indentCount, withSuid) {
      const tag = this.getTag()
      const children = this.map(child => child._toHtml(indentCount + 1, withSuid)).join("")
      const attributesStr = this.filter(node => node.isAttributeNode)
        .map(child => child.getAttribute())
        .join("")
      const indent = " ".repeat(indentCount)
      const collapse = this.shouldCollapse()
      const indentForChildNodes = !collapse && this.getChildInstancesOfNodeTypeId("htmlTagNode").length > 0
      const suid = withSuid ? ` stumpUid="${this._getUid()}"` : ""
      const oneLiner = this._getOneLiner()
      return `${!collapse ? indent : ""}<${tag}${attributesStr}${suid}>${oneLiner}${indentForChildNodes ? "\n" : ""}${children}</${tag}>${collapse ? "" : "\n"}`
    }
    removeCssStumpNode() {
      return this.removeStumpNode()
    }
    removeStumpNode() {
      this.getShadow().removeShadow()
      return this.destroy()
    }
    getNodeByGuid(guid) {
      return this.getTopDownArray().find(node => node._getUid() === guid)
    }
    addClassToStumpNode(className) {
      const classNode = this.touchNode("class")
      const words = classNode.getWordsFrom(1)
      // note: we call add on shadow regardless, because at the moment stump may have gotten out of
      // sync with shadow, if things modified the dom. todo: cleanup.
      this.getShadow().addClassToShadow(className)
      if (words.includes(className)) return this
      words.push(className)
      classNode.setContent(words.join(this.getWordBreakSymbol()))
      return this
    }
    removeClassFromStumpNode(className) {
      const classNode = this.getNode("class")
      if (!classNode) return this
      const newClasses = classNode.getWords().filter(word => word !== className)
      if (!newClasses.length) classNode.destroy()
      else classNode.setContent(newClasses.join(" "))
      this.getShadow().removeClassFromShadow(className)
      return this
    }
    stumpNodeHasClass(className) {
      const classNode = this.getNode("class")
      return classNode && classNode.getWords().includes(className) ? true : false
    }
    isStumpNodeCheckbox() {
      return this.get("type") === "checkbox"
    }
    getShadow() {
      if (!this._shadow) {
        const shadowClass = this.getShadowClass()
        this._shadow = new shadowClass(this)
      }
      return this._shadow
    }
    insertCssChildNode(text, index) {
      return this.insertChildNode(text, index)
    }
    insertChildNode(text, index) {
      const singleNode = new jtree.TreeNode(text).getChildren()[0]
      const newNode = this.insertLineAndChildren(singleNode.getLine(), singleNode.childrenToString(), index)
      const stumpNodeIndex = this.filter(node => node.isHtmlTagNode).indexOf(newNode)
      this.getShadow().insertHtmlNode(newNode, stumpNodeIndex)
      return newNode
    }
    isInputType() {
      return ["input", "textarea"].includes(this.getTag()) || this.get("contenteditable") === "true"
    }
    findStumpNodeByChild(line) {
      return this.findStumpNodesByChild(line)[0]
    }
    findStumpNodeByChildString(line) {
      return this.getTopDownArray().find(node =>
        node
          .map(child => child.getLine())
          .join("\n")
          .includes(line)
      )
    }
    findStumpNodeByFirstWord(firstWord) {
      return this._findStumpNodesByBase(firstWord)[0]
    }
    _findStumpNodesByBase(firstWord) {
      return this.getTopDownArray().filter(node => node.doesExtend("htmlTagNode") && node.getFirstWord() === firstWord)
    }
    hasLine(line) {
      return this.getChildren().some(node => node.getLine() === line)
    }
    findStumpNodesByChild(line) {
      return this.getTopDownArray().filter(node => node.doesExtend("htmlTagNode") && node.hasLine(line))
    }
    findStumpNodesWithClass(className) {
      return this.getTopDownArray().filter(
        node =>
          node.doesExtend("htmlTagNode") &&
          node.has("class") &&
          node
            .getNode("class")
            .getWords()
            .includes(className)
      )
    }
    getShadowClass() {
      return this.getParent().getShadowClass()
    }
    // todo: should not be here
    getStumpNodeTreeComponent() {
      return this._treeComponent || this.getParent().getStumpNodeTreeComponent()
    }
    // todo: should not be here
    setStumpNodeTreeComponent(treeComponent) {
      this._treeComponent = treeComponent
      return this
    }
    getStumpNodeCss(prop) {
      return this.getShadow().getShadowCss(prop)
    }
    getStumpNodeAttr(key) {
      return this.get(key)
    }
    setStumpNodeAttr(key, value) {
      // todo
      return this
    }
    toHtml() {
      return this._toHtml()
    }
  }

  class errorNode extends jtree.GrammarBackedNode {
    getErrors() {
      return this._getErrorNodeErrors()
    }
  }

  class componentDefinitionNode extends htmlTagNode {
    get componentTagNameCell() {
      return this.getWord(0)
    }
    getTag() {
      return "div"
    }
  }

  class htmlAttributeNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(errorNode, undefined, undefined)
    }
    get htmlAttributeNameCell() {
      return this.getWord(0)
    }
    get attributeValueCell() {
      return this.getWordsFrom(1)
    }
    get isTileAttribute() {
      return true
    }
    get isAttributeNode() {
      return true
    }
    _toHtml() {
      return ""
    }
    getTextContent() {
      return ""
    }
    getAttribute() {
      return ` ${this.getFirstWord()}="${this.getContent()}"`
    }
  }

  class stumpExtendedAttributeNode extends htmlAttributeNode {
    get stumpExtendedAttributeNameCell() {
      return this.getWord(0)
    }
  }

  class lineOfHtmlContentNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(lineOfHtmlContentNode, undefined, undefined)
    }
    get anyHtmlContentCell() {
      return this.getWordsFrom(0)
    }
    get isTileAttribute() {
      return true
    }
    getTextContent() {
      return this.getLine()
    }
  }

  class bernNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(lineOfHtmlContentNode, undefined, undefined)
    }
    get bernKeywordCell() {
      return this.getWord(0)
    }
    get isTileAttribute() {
      return true
    }
    _toHtml() {
      return this.childrenToString()
    }
    getTextContent() {
      return ""
    }
  }

  module.exports = stumpNode
  stumpNode

  if (!module.parent) new stumpNode(jtree.TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
