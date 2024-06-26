{
  class stumpParser extends ParserBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        errorParser,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {
          blockquote: htmlTagParser,
          colgroup: htmlTagParser,
          datalist: htmlTagParser,
          fieldset: htmlTagParser,
          menuitem: htmlTagParser,
          noscript: htmlTagParser,
          optgroup: htmlTagParser,
          progress: htmlTagParser,
          styleTag: htmlTagParser,
          template: htmlTagParser,
          textarea: htmlTagParser,
          titleTag: htmlTagParser,
          address: htmlTagParser,
          article: htmlTagParser,
          caption: htmlTagParser,
          details: htmlTagParser,
          section: htmlTagParser,
          summary: htmlTagParser,
          button: htmlTagParser,
          canvas: htmlTagParser,
          dialog: htmlTagParser,
          figure: htmlTagParser,
          footer: htmlTagParser,
          header: htmlTagParser,
          hgroup: htmlTagParser,
          iframe: htmlTagParser,
          keygen: htmlTagParser,
          legend: htmlTagParser,
          object: htmlTagParser,
          option: htmlTagParser,
          output: htmlTagParser,
          script: htmlTagParser,
          select: htmlTagParser,
          source: htmlTagParser,
          strong: htmlTagParser,
          aside: htmlTagParser,
          embed: htmlTagParser,
          input: htmlTagParser,
          label: htmlTagParser,
          meter: htmlTagParser,
          param: htmlTagParser,
          small: htmlTagParser,
          table: htmlTagParser,
          tbody: htmlTagParser,
          tfoot: htmlTagParser,
          thead: htmlTagParser,
          track: htmlTagParser,
          video: htmlTagParser,
          abbr: htmlTagParser,
          area: htmlTagParser,
          base: htmlTagParser,
          body: htmlTagParser,
          code: htmlTagParser,
          form: htmlTagParser,
          head: htmlTagParser,
          html: htmlTagParser,
          link: htmlTagParser,
          main: htmlTagParser,
          mark: htmlTagParser,
          menu: htmlTagParser,
          meta: htmlTagParser,
          ruby: htmlTagParser,
          samp: htmlTagParser,
          span: htmlTagParser,
          time: htmlTagParser,
          bdi: htmlTagParser,
          bdo: htmlTagParser,
          col: htmlTagParser,
          del: htmlTagParser,
          dfn: htmlTagParser,
          div: htmlTagParser,
          img: htmlTagParser,
          ins: htmlTagParser,
          kbd: htmlTagParser,
          map: htmlTagParser,
          nav: htmlTagParser,
          pre: htmlTagParser,
          rtc: htmlTagParser,
          sub: htmlTagParser,
          sup: htmlTagParser,
          var: htmlTagParser,
          wbr: htmlTagParser,
          br: htmlTagParser,
          dd: htmlTagParser,
          dl: htmlTagParser,
          dt: htmlTagParser,
          em: htmlTagParser,
          h1: htmlTagParser,
          h2: htmlTagParser,
          h3: htmlTagParser,
          h4: htmlTagParser,
          h5: htmlTagParser,
          h6: htmlTagParser,
          hr: htmlTagParser,
          li: htmlTagParser,
          ol: htmlTagParser,
          rb: htmlTagParser,
          rp: htmlTagParser,
          rt: htmlTagParser,
          td: htmlTagParser,
          th: htmlTagParser,
          tr: htmlTagParser,
          ul: htmlTagParser,
          a: htmlTagParser,
          b: htmlTagParser,
          i: htmlTagParser,
          p: htmlTagParser,
          q: htmlTagParser,
          s: htmlTagParser,
          u: htmlTagParser
        }),
        [
          { regex: /^$/, parser: blankLineParser },
          { regex: /^[a-zA-Z0-9_]+Component/, parser: componentDefinitionParser }
        ]
      )
    }
    compile() {
      return this.asHtml
    }
    _getHtmlJoinByCharacter() {
      return ""
    }
    static cachedHandParsersProgramRoot = new HandParsersProgram(`// Cell parsers
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

// Line parsers
stumpParser
 root
 description A prefix Language that compiles to HTML.
 catchAllParser errorParser
 inScope htmlTagParser blankLineParser
 example
  div
   h1 hello world
 compilesTo html
 javascript
  compile() {
   return this.asHtml
  }
  _getHtmlJoinByCharacter() {
    return ""
  }
blankLineParser
 pattern ^$
 tags doNotSynthesize
 cells emptyCell
 javascript
  _toHtml() {
   return ""
  }
  getTextContent() {return ""}
htmlTagParser
 inScope bernParser htmlTagParser htmlAttributeParser blankLineParser
 catchAllCellType anyHtmlContentCell
 cells htmlTagNameCell
 javascript
  isHtmlTagParser = true
  getTag() {
   // we need to remove the "Tag" bit to handle the style and title attribute/tag conflict.
   const firstWord = this.firstWord
   const map = {
    titleTag: "title",
    styleTag: "style"
   }
   return map[firstWord] || firstWord
  }
  _getHtmlJoinByCharacter() {
   return ""
  }
  asHtmlWithSuids() {
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
    this.filter(node => node.isAttributeParser)
      .forEach(child => elem.setAttribute(child.firstWord, child.content))
    elem.innerHTML = this.has("bern") ? this.getNode("bern").childrenToString() : this._getOneLiner()
    this.filter(node => node.isHtmlTagParser)
      .forEach(child => elem.appendChild(child.domElement))
    return elem
  }
  _toHtml(indentCount, withSuid) {
   const tag = this.getTag()
   const children = this.map(child => child._toHtml(indentCount + 1, withSuid)).join("")
   const attributesStr = this.filter(node => node.isAttributeParser)
    .map(child => child.getAttribute())
    .join("")
   const indent = " ".repeat(indentCount)
   const collapse = this.shouldCollapse()
   const indentForChildParsers = !collapse && this.getChildInstancesOfParserId("htmlTagParser").length > 0
   const suid = withSuid ? \` stumpUid="\${this._getUid()}"\` : ""
   const oneLiner = this._getOneLiner()
   return \`\${!collapse ? indent : ""}<\${tag}\${attributesStr}\${suid}>\${oneLiner}\${indentForChildParsers ? "\\n" : ""}\${children}</\${tag}>\${collapse ? "" : "\\n"}\`
  }
  removeCssStumpNode() {
   return this.removeStumpNode()
  }
  removeStumpNode() {
   this.getShadow().removeShadow()
   return this.destroy()
  }
  getNodeByGuid(guid) {
   return this.topDownArray.find(node => node._getUid() === guid)
  }
  addClassToStumpNode(className) {
   const classParser = this.touchNode("class")
   const words = classParser.getWordsFrom(1)
   // note: we call add on shadow regardless, because at the moment stump may have gotten out of
   // sync with shadow, if things modified the dom. todo: cleanup.
   this.getShadow().addClassToShadow(className)
   if (words.includes(className)) return this
   words.push(className)
   classParser.setContent(words.join(this.wordBreakSymbol))
   return this
  }
  removeClassFromStumpNode(className) {
   const classParser = this.getNode("class")
   if (!classParser) return this
   const newClasses = classParser.words.filter(word => word !== className)
   if (!newClasses.length) classParser.destroy()
   else classParser.setContent(newClasses.join(" "))
   this.getShadow().removeClassFromShadow(className)
   return this
  }
  stumpNodeHasClass(className) {
   const classParser = this.getNode("class")
   return classParser && classParser.words.includes(className) ? true : false
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
   const singleNode = new TreeNode(text).getChildren()[0]
   const newNode = this.insertLineAndChildren(singleNode.getLine(), singleNode.childrenToString(), index)
   const stumpParserIndex = this.filter(node => node.isHtmlTagParser).indexOf(newNode)
   this.getShadow().insertHtmlNode(newNode, stumpParserIndex)
   return newNode
  }
  isInputType() {
   return ["input", "textarea"].includes(this.getTag()) || this.get("contenteditable") === "true"
  }
  findStumpNodeByChild(line) {
   return this.findStumpNodesByChild(line)[0]
  }
  findStumpNodeByChildString(line) {
   return this.topDownArray.find(node =>
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
   return this.topDownArray.filter(node => node.doesExtend("htmlTagParser") && node.firstWord === firstWord)
  }
  hasLine(line) {
   return this.getChildren().some(node => node.getLine() === line)
  }
  findStumpNodesByChild(line) {
   return this.topDownArray.filter(node => node.doesExtend("htmlTagParser") && node.hasLine(line))
  }
  findStumpNodesWithClass(className) {
   return this.topDownArray.filter(
    node =>
     node.doesExtend("htmlTagParser") &&
     node.has("class") &&
     node
      .getNode("class")
      .words
      .includes(className)
   )
  }
  getShadowClass() {
   return this.parent.getShadowClass()
  }
  // todo: should not be here
  getStumpNodeTreeComponent() {
   return this._treeComponent || this.parent.getStumpNodeTreeComponent()
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
  get asHtml() {
   return this._toHtml()
  }
errorParser
 baseParser errorParser
componentDefinitionParser
 extends htmlTagParser
 pattern ^[a-zA-Z0-9_]+Component
 cells componentTagNameCell
 javascript
  getTag() {
   return "div"
  }
htmlAttributeParser
 javascript
  _toHtml() {
   return ""
  }
  getTextContent() {return ""}
  getAttribute() {
   return \` \${this.firstWord}="\${this.content}"\`
  }
 boolean isAttributeParser true
 boolean isTileAttribute true
 catchAllParser errorParser
 catchAllCellType attributeValueCell
 cells htmlAttributeNameCell
stumpExtendedAttributeNameCell
 extends htmlAttributeNameCell
 enum collapse blurCommand changeCommand clickCommand contextMenuCommand doubleClickCommand keyUpCommand lineClickCommand lineShiftClickCommand shiftClickCommand
stumpExtendedAttributeParser
 description Parser types not present in HTML but included in stump.
 extends htmlAttributeParser
 cells stumpExtendedAttributeNameCell
lineOfHtmlContentParser
 boolean isTileAttribute true
 catchAllParser lineOfHtmlContentParser
 catchAllCellType anyHtmlContentCell
 javascript
  getTextContent() {return this.getLine()}
bernParser
 boolean isTileAttribute true
 // todo Rename this node type
 description This is a node where you can put any HTML content. It is called "bern" until someone comes up with a better name.
 catchAllParser lineOfHtmlContentParser
 javascript
  _toHtml() {
   return this.childrenToString()
  }
  getTextContent() {return ""}
 cells bernKeywordCell`)
    get handParsersProgram() {
      return this.constructor.cachedHandParsersProgramRoot
    }
    static rootParser = stumpParser
  }

  class blankLineParser extends ParserBackedNode {
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

  class htmlTagParser extends ParserBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(
        undefined,
        Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {
          blockquote: htmlTagParser,
          colgroup: htmlTagParser,
          datalist: htmlTagParser,
          fieldset: htmlTagParser,
          menuitem: htmlTagParser,
          noscript: htmlTagParser,
          optgroup: htmlTagParser,
          progress: htmlTagParser,
          styleTag: htmlTagParser,
          template: htmlTagParser,
          textarea: htmlTagParser,
          titleTag: htmlTagParser,
          address: htmlTagParser,
          article: htmlTagParser,
          caption: htmlTagParser,
          details: htmlTagParser,
          section: htmlTagParser,
          summary: htmlTagParser,
          button: htmlTagParser,
          canvas: htmlTagParser,
          dialog: htmlTagParser,
          figure: htmlTagParser,
          footer: htmlTagParser,
          header: htmlTagParser,
          hgroup: htmlTagParser,
          iframe: htmlTagParser,
          keygen: htmlTagParser,
          legend: htmlTagParser,
          object: htmlTagParser,
          option: htmlTagParser,
          output: htmlTagParser,
          script: htmlTagParser,
          select: htmlTagParser,
          source: htmlTagParser,
          strong: htmlTagParser,
          aside: htmlTagParser,
          embed: htmlTagParser,
          input: htmlTagParser,
          label: htmlTagParser,
          meter: htmlTagParser,
          param: htmlTagParser,
          small: htmlTagParser,
          table: htmlTagParser,
          tbody: htmlTagParser,
          tfoot: htmlTagParser,
          thead: htmlTagParser,
          track: htmlTagParser,
          video: htmlTagParser,
          abbr: htmlTagParser,
          area: htmlTagParser,
          base: htmlTagParser,
          body: htmlTagParser,
          code: htmlTagParser,
          form: htmlTagParser,
          head: htmlTagParser,
          html: htmlTagParser,
          link: htmlTagParser,
          main: htmlTagParser,
          mark: htmlTagParser,
          menu: htmlTagParser,
          meta: htmlTagParser,
          ruby: htmlTagParser,
          samp: htmlTagParser,
          span: htmlTagParser,
          time: htmlTagParser,
          bdi: htmlTagParser,
          bdo: htmlTagParser,
          col: htmlTagParser,
          del: htmlTagParser,
          dfn: htmlTagParser,
          div: htmlTagParser,
          img: htmlTagParser,
          ins: htmlTagParser,
          kbd: htmlTagParser,
          map: htmlTagParser,
          nav: htmlTagParser,
          pre: htmlTagParser,
          rtc: htmlTagParser,
          sub: htmlTagParser,
          sup: htmlTagParser,
          var: htmlTagParser,
          wbr: htmlTagParser,
          br: htmlTagParser,
          dd: htmlTagParser,
          dl: htmlTagParser,
          dt: htmlTagParser,
          em: htmlTagParser,
          h1: htmlTagParser,
          h2: htmlTagParser,
          h3: htmlTagParser,
          h4: htmlTagParser,
          h5: htmlTagParser,
          h6: htmlTagParser,
          hr: htmlTagParser,
          li: htmlTagParser,
          ol: htmlTagParser,
          rb: htmlTagParser,
          rp: htmlTagParser,
          rt: htmlTagParser,
          td: htmlTagParser,
          th: htmlTagParser,
          tr: htmlTagParser,
          ul: htmlTagParser,
          a: htmlTagParser,
          b: htmlTagParser,
          i: htmlTagParser,
          p: htmlTagParser,
          q: htmlTagParser,
          s: htmlTagParser,
          u: htmlTagParser,
          oncanplaythrough: htmlAttributeParser,
          ondurationchange: htmlAttributeParser,
          onloadedmetadata: htmlAttributeParser,
          contenteditable: htmlAttributeParser,
          "accept-charset": htmlAttributeParser,
          onbeforeunload: htmlAttributeParser,
          onvolumechange: htmlAttributeParser,
          onbeforeprint: htmlAttributeParser,
          oncontextmenu: htmlAttributeParser,
          autocomplete: htmlAttributeParser,
          onafterprint: htmlAttributeParser,
          onhashchange: htmlAttributeParser,
          onloadeddata: htmlAttributeParser,
          onmousewheel: htmlAttributeParser,
          onratechange: htmlAttributeParser,
          ontimeupdate: htmlAttributeParser,
          oncuechange: htmlAttributeParser,
          ondragenter: htmlAttributeParser,
          ondragleave: htmlAttributeParser,
          ondragstart: htmlAttributeParser,
          onloadstart: htmlAttributeParser,
          onmousedown: htmlAttributeParser,
          onmousemove: htmlAttributeParser,
          onmouseover: htmlAttributeParser,
          placeholder: htmlAttributeParser,
          formaction: htmlAttributeParser,
          "http-equiv": htmlAttributeParser,
          novalidate: htmlAttributeParser,
          ondblclick: htmlAttributeParser,
          ondragover: htmlAttributeParser,
          onkeypress: htmlAttributeParser,
          onmouseout: htmlAttributeParser,
          onpagehide: htmlAttributeParser,
          onpageshow: htmlAttributeParser,
          onpopstate: htmlAttributeParser,
          onprogress: htmlAttributeParser,
          spellcheck: htmlAttributeParser,
          accesskey: htmlAttributeParser,
          autofocus: htmlAttributeParser,
          draggable: htmlAttributeParser,
          maxlength: htmlAttributeParser,
          oncanplay: htmlAttributeParser,
          ondragend: htmlAttributeParser,
          onemptied: htmlAttributeParser,
          oninvalid: htmlAttributeParser,
          onkeydown: htmlAttributeParser,
          onmouseup: htmlAttributeParser,
          onoffline: htmlAttributeParser,
          onplaying: htmlAttributeParser,
          onseeking: htmlAttributeParser,
          onstalled: htmlAttributeParser,
          onstorage: htmlAttributeParser,
          onsuspend: htmlAttributeParser,
          onwaiting: htmlAttributeParser,
          translate: htmlAttributeParser,
          autoplay: htmlAttributeParser,
          controls: htmlAttributeParser,
          datetime: htmlAttributeParser,
          disabled: htmlAttributeParser,
          download: htmlAttributeParser,
          dropzone: htmlAttributeParser,
          hreflang: htmlAttributeParser,
          multiple: htmlAttributeParser,
          onchange: htmlAttributeParser,
          ononline: htmlAttributeParser,
          onresize: htmlAttributeParser,
          onscroll: htmlAttributeParser,
          onsearch: htmlAttributeParser,
          onseeked: htmlAttributeParser,
          onselect: htmlAttributeParser,
          onsubmit: htmlAttributeParser,
          ontoggle: htmlAttributeParser,
          onunload: htmlAttributeParser,
          property: htmlAttributeParser,
          readonly: htmlAttributeParser,
          required: htmlAttributeParser,
          reversed: htmlAttributeParser,
          selected: htmlAttributeParser,
          tabindex: htmlAttributeParser,
          bgcolor: htmlAttributeParser,
          charset: htmlAttributeParser,
          checked: htmlAttributeParser,
          colspan: htmlAttributeParser,
          content: htmlAttributeParser,
          default: htmlAttributeParser,
          dirname: htmlAttributeParser,
          enctype: htmlAttributeParser,
          headers: htmlAttributeParser,
          onabort: htmlAttributeParser,
          onclick: htmlAttributeParser,
          onended: htmlAttributeParser,
          onerror: htmlAttributeParser,
          onfocus: htmlAttributeParser,
          oninput: htmlAttributeParser,
          onkeyup: htmlAttributeParser,
          onpaste: htmlAttributeParser,
          onpause: htmlAttributeParser,
          onreset: htmlAttributeParser,
          onwheel: htmlAttributeParser,
          optimum: htmlAttributeParser,
          pattern: htmlAttributeParser,
          preload: htmlAttributeParser,
          rowspan: htmlAttributeParser,
          sandbox: htmlAttributeParser,
          srclang: htmlAttributeParser,
          accept: htmlAttributeParser,
          action: htmlAttributeParser,
          border: htmlAttributeParser,
          coords: htmlAttributeParser,
          height: htmlAttributeParser,
          hidden: htmlAttributeParser,
          method: htmlAttributeParser,
          onblur: htmlAttributeParser,
          oncopy: htmlAttributeParser,
          ondrag: htmlAttributeParser,
          ondrop: htmlAttributeParser,
          onload: htmlAttributeParser,
          onplay: htmlAttributeParser,
          poster: htmlAttributeParser,
          srcdoc: htmlAttributeParser,
          srcset: htmlAttributeParser,
          target: htmlAttributeParser,
          usemap: htmlAttributeParser,
          align: htmlAttributeParser,
          async: htmlAttributeParser,
          class: htmlAttributeParser,
          color: htmlAttributeParser,
          defer: htmlAttributeParser,
          ismap: htmlAttributeParser,
          media: htmlAttributeParser,
          muted: htmlAttributeParser,
          oncut: htmlAttributeParser,
          scope: htmlAttributeParser,
          shape: htmlAttributeParser,
          sizes: htmlAttributeParser,
          start: htmlAttributeParser,
          style: htmlAttributeParser,
          title: htmlAttributeParser,
          value: htmlAttributeParser,
          width: htmlAttributeParser,
          cols: htmlAttributeParser,
          high: htmlAttributeParser,
          href: htmlAttributeParser,
          kind: htmlAttributeParser,
          lang: htmlAttributeParser,
          list: htmlAttributeParser,
          loop: htmlAttributeParser,
          name: htmlAttributeParser,
          open: htmlAttributeParser,
          rows: htmlAttributeParser,
          size: htmlAttributeParser,
          step: htmlAttributeParser,
          type: htmlAttributeParser,
          wrap: htmlAttributeParser,
          alt: htmlAttributeParser,
          dir: htmlAttributeParser,
          for: htmlAttributeParser,
          low: htmlAttributeParser,
          max: htmlAttributeParser,
          min: htmlAttributeParser,
          rel: htmlAttributeParser,
          src: htmlAttributeParser,
          id: htmlAttributeParser,
          lineShiftClickCommand: stumpExtendedAttributeParser,
          contextMenuCommand: stumpExtendedAttributeParser,
          doubleClickCommand: stumpExtendedAttributeParser,
          shiftClickCommand: stumpExtendedAttributeParser,
          lineClickCommand: stumpExtendedAttributeParser,
          changeCommand: stumpExtendedAttributeParser,
          clickCommand: stumpExtendedAttributeParser,
          keyUpCommand: stumpExtendedAttributeParser,
          blurCommand: stumpExtendedAttributeParser,
          collapse: stumpExtendedAttributeParser,
          bern: bernParser
        }),
        [
          { regex: /^$/, parser: blankLineParser },
          { regex: /^[a-zA-Z0-9_]+Component/, parser: componentDefinitionParser }
        ]
      )
    }
    get htmlTagNameCell() {
      return this.getWord(0)
    }
    get anyHtmlContentCell() {
      return this.getWordsFrom(1)
    }
    isHtmlTagParser = true
    getTag() {
      // we need to remove the "Tag" bit to handle the style and title attribute/tag conflict.
      const firstWord = this.firstWord
      const map = {
        titleTag: "title",
        styleTag: "style"
      }
      return map[firstWord] || firstWord
    }
    _getHtmlJoinByCharacter() {
      return ""
    }
    asHtmlWithSuids() {
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
      this.filter(node => node.isAttributeParser).forEach(child => elem.setAttribute(child.firstWord, child.content))
      elem.innerHTML = this.has("bern") ? this.getNode("bern").childrenToString() : this._getOneLiner()
      this.filter(node => node.isHtmlTagParser).forEach(child => elem.appendChild(child.domElement))
      return elem
    }
    _toHtml(indentCount, withSuid) {
      const tag = this.getTag()
      const children = this.map(child => child._toHtml(indentCount + 1, withSuid)).join("")
      const attributesStr = this.filter(node => node.isAttributeParser)
        .map(child => child.getAttribute())
        .join("")
      const indent = " ".repeat(indentCount)
      const collapse = this.shouldCollapse()
      const indentForChildParsers = !collapse && this.getChildInstancesOfParserId("htmlTagParser").length > 0
      const suid = withSuid ? ` stumpUid="${this._getUid()}"` : ""
      const oneLiner = this._getOneLiner()
      return `${!collapse ? indent : ""}<${tag}${attributesStr}${suid}>${oneLiner}${indentForChildParsers ? "\n" : ""}${children}</${tag}>${collapse ? "" : "\n"}`
    }
    removeCssStumpNode() {
      return this.removeStumpNode()
    }
    removeStumpNode() {
      this.getShadow().removeShadow()
      return this.destroy()
    }
    getNodeByGuid(guid) {
      return this.topDownArray.find(node => node._getUid() === guid)
    }
    addClassToStumpNode(className) {
      const classParser = this.touchNode("class")
      const words = classParser.getWordsFrom(1)
      // note: we call add on shadow regardless, because at the moment stump may have gotten out of
      // sync with shadow, if things modified the dom. todo: cleanup.
      this.getShadow().addClassToShadow(className)
      if (words.includes(className)) return this
      words.push(className)
      classParser.setContent(words.join(this.wordBreakSymbol))
      return this
    }
    removeClassFromStumpNode(className) {
      const classParser = this.getNode("class")
      if (!classParser) return this
      const newClasses = classParser.words.filter(word => word !== className)
      if (!newClasses.length) classParser.destroy()
      else classParser.setContent(newClasses.join(" "))
      this.getShadow().removeClassFromShadow(className)
      return this
    }
    stumpNodeHasClass(className) {
      const classParser = this.getNode("class")
      return classParser && classParser.words.includes(className) ? true : false
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
      const singleNode = new TreeNode(text).getChildren()[0]
      const newNode = this.insertLineAndChildren(singleNode.getLine(), singleNode.childrenToString(), index)
      const stumpParserIndex = this.filter(node => node.isHtmlTagParser).indexOf(newNode)
      this.getShadow().insertHtmlNode(newNode, stumpParserIndex)
      return newNode
    }
    isInputType() {
      return ["input", "textarea"].includes(this.getTag()) || this.get("contenteditable") === "true"
    }
    findStumpNodeByChild(line) {
      return this.findStumpNodesByChild(line)[0]
    }
    findStumpNodeByChildString(line) {
      return this.topDownArray.find(node =>
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
      return this.topDownArray.filter(node => node.doesExtend("htmlTagParser") && node.firstWord === firstWord)
    }
    hasLine(line) {
      return this.getChildren().some(node => node.getLine() === line)
    }
    findStumpNodesByChild(line) {
      return this.topDownArray.filter(node => node.doesExtend("htmlTagParser") && node.hasLine(line))
    }
    findStumpNodesWithClass(className) {
      return this.topDownArray.filter(node => node.doesExtend("htmlTagParser") && node.has("class") && node.getNode("class").words.includes(className))
    }
    getShadowClass() {
      return this.parent.getShadowClass()
    }
    // todo: should not be here
    getStumpNodeTreeComponent() {
      return this._treeComponent || this.parent.getStumpNodeTreeComponent()
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
    get asHtml() {
      return this._toHtml()
    }
  }

  class errorParser extends ParserBackedNode {
    getErrors() {
      return this._getErrorParserErrors()
    }
  }

  class componentDefinitionParser extends htmlTagParser {
    get componentTagNameCell() {
      return this.getWord(0)
    }
    getTag() {
      return "div"
    }
  }

  class htmlAttributeParser extends ParserBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(errorParser, undefined, undefined)
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
    get isAttributeParser() {
      return true
    }
    _toHtml() {
      return ""
    }
    getTextContent() {
      return ""
    }
    getAttribute() {
      return ` ${this.firstWord}="${this.content}"`
    }
  }

  class stumpExtendedAttributeParser extends htmlAttributeParser {
    get stumpExtendedAttributeNameCell() {
      return this.getWord(0)
    }
  }

  class lineOfHtmlContentParser extends ParserBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(lineOfHtmlContentParser, undefined, undefined)
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

  class bernParser extends ParserBackedNode {
    createParserCombinator() {
      return new TreeNode.ParserCombinator(lineOfHtmlContentParser, undefined, undefined)
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

  window.stumpParser = stumpParser
}
