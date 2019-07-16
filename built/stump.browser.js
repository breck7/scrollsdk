{
  ;("use strict")

  class stump extends jtree.GrammarBackedRootNode {
    getFirstWordMap() {
      const map = Object.assign({}, super.getFirstWordMap())
      return Object.assign(map, {
        a: a,
        abbr: abbr,
        address: address,
        area: area,
        article: article,
        aside: aside,
        b: b,
        base: base,
        bdi: bdi,
        bdo: bdo,
        blockquote: blockquote,
        body: body,
        br: br,
        button: button,
        canvas: canvas,
        caption: caption,
        code: code,
        col: col,
        colgroup: colgroup,
        datalist: datalist,
        dd: dd,
        del: del,
        details: details,
        dfn: dfn,
        dialog: dialog,
        div: div,
        dl: dl,
        dt: dt,
        em: em,
        embed: embed,
        fieldset: fieldset,
        figure: figure,
        footer: footer,
        form: form,
        h1: h1,
        h2: h2,
        h3: h3,
        h4: h4,
        h5: h5,
        h6: h6,
        head: head,
        header: header,
        hgroup: hgroup,
        hr: hr,
        html: html,
        i: i,
        iframe: iframe,
        img: img,
        input: input,
        ins: ins,
        kbd: kbd,
        keygen: keygen,
        label: label,
        legend: legend,
        li: li,
        link: link,
        main: main,
        map: map,
        mark: mark,
        menu: menu,
        menuitem: menuitem,
        meta: meta,
        meter: meter,
        nav: nav,
        noscript: noscript,
        object: object,
        ol: ol,
        optgroup: optgroup,
        option: option,
        output: output,
        p: p,
        param: param,
        pre: pre,
        progress: progress,
        q: q,
        rb: rb,
        rp: rp,
        rt: rt,
        rtc: rtc,
        ruby: ruby,
        s: s,
        samp: samp,
        script: script,
        section: section,
        select: select,
        small: small,
        source: source,
        span: span,
        strong: strong,
        styleTag: styleTag,
        sub: sub,
        summary: summary,
        sup: sup,
        table: table,
        tbody: tbody,
        td: td,
        template: template,
        textarea: textarea,
        tfoot: tfoot,
        th: th,
        thead: thead,
        time: time,
        titleTag: titleTag,
        tr: tr,
        track: track,
        u: u,
        ul: ul,
        var: varNode,
        video: video,
        wbr: wbr
      })
    }
    getCatchAllNodeConstructor() {
      return errorNode
    }
    compile() {
      return this.toHtml()
    }
    getGrammarProgramRoot() {
      if (!this._cachedGrammarProgramRoot)
        this._cachedGrammarProgramRoot = new jtree.GrammarProgram(`nodeType stump
 root
 description A Tree Language that compiles to HTML.
 catchAllNodeType errorNode
 inScope abstractHtmlTag
 compilesTo html
 javascript
  compile() { return this.toHtml() }
cellType anyFirstWord
cellType extraWord
 highlightScope invalid
cellType anyHtmlContent
 highlightScope string
cellType attributeValue
 highlightScope constant.language
cellType htmlTagName
 highlightScope variable.function
cellType htmlAttributeName
 highlightScope entity.name.type
cellType contentHolderName
 highlightScope keyword
nodeType abstractHtmlTag
 firstCellType htmlTagName
 inScope bern abstractHtmlTag abstractHtmlAttribute
 catchAllCellType anyHtmlContent
 javascript
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
    return \`\`
  }
  toHtmlWithSuids() {
    return this._toHtml(undefined, true)
  }
  _getOneLiner() {
    const oneLinerWords = this.getWordsFrom(1)
    return oneLinerWords.length ? oneLinerWords.join(" ") : ""
  }
  shouldCollapse() {
    return this.has("stumpCollapseNode")
  }
  _toHtml(indentCount, withSuid) {
    const tag = this.getTag()
    const children = this.map(child => child._toHtml(indentCount + 1, withSuid)).join("")
    const attributesStr = this.filter(node => node.isAttributeNode)
      .map(child => child.getAttribute())
      .join("")
    const indent = " ".repeat(indentCount)
    const collapse = this.shouldCollapse()
    const indentForChildNodes = !collapse && this.getChildInstancesOfNodeTypeId("abstractHtmlTag").length > 0
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
    classNode.setContent(words.join(this.getZI()))
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
    const stumpNodeIndex = this.getChildInstancesOfNodeTypeId("abstractHtmlTag").indexOf(newNode)
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
    return this.getTopDownArray().filter(node => node.doesExtend("abstractHtmlTag") && node.getFirstWord() === firstWord)
  }
  hasLine(line) {
    return this.getChildren().some(node => node.getLine() === line)
  }
  findStumpNodesByChild(line) {
    return this.getTopDownArray().filter(node => node.doesExtend("abstractHtmlTag") && node.hasLine(line))
  }
  findStumpNodesWithClass(className) {
    return this.getTopDownArray().filter(
      node =>
        node.doesExtend("abstractHtmlTag") &&
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
  // todo: whats this? move to base?
  getLines(start = 0, end) {
    return this.toString()
      .split("\\n")
      .slice(start, end)
      .join("\\n")
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
  setStumpNodeCss(css) {
    this.getShadow().setShadowCss(css)
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
 abstract
nodeType errorNode
 baseNodeType errorNode
nodeType abstractHtmlAttribute
 firstCellType htmlAttributeName
 javascript
  _toHtml() { return "" }
  getAttribute() { return \` \${this.getFirstWord()}="\${this.getContent()}"\` }
 boolean isAttributeNode true
 catchAllNodeType errorNode
 catchAllCellType attributeValue
 abstract
nodeType lineOfHtmlContent
 catchAllNodeType lineOfHtmlContent
 catchAllCellType anyHtmlContent
 firstCellType anyHtmlContent
nodeType bern
 todo Rename this node type
 description This is a node where you can put any HTML content. It is called "bern" until someone comes up with a better name.
 firstCellType contentHolderName
 catchAllNodeType lineOfHtmlContent
 javascript
  _toHtml() { return this.childrenToString() }
nodeType a
 extends abstractHtmlTag
nodeType abbr
 extends abstractHtmlTag
nodeType address
 extends abstractHtmlTag
nodeType area
 extends abstractHtmlTag
nodeType article
 extends abstractHtmlTag
nodeType aside
 extends abstractHtmlTag
nodeType b
 extends abstractHtmlTag
nodeType base
 extends abstractHtmlTag
nodeType bdi
 extends abstractHtmlTag
nodeType bdo
 extends abstractHtmlTag
nodeType blockquote
 extends abstractHtmlTag
nodeType body
 extends abstractHtmlTag
nodeType br
 extends abstractHtmlTag
nodeType button
 extends abstractHtmlTag
nodeType canvas
 extends abstractHtmlTag
nodeType caption
 extends abstractHtmlTag
nodeType code
 extends abstractHtmlTag
nodeType col
 extends abstractHtmlTag
nodeType colgroup
 extends abstractHtmlTag
nodeType datalist
 extends abstractHtmlTag
nodeType dd
 extends abstractHtmlTag
nodeType del
 extends abstractHtmlTag
nodeType details
 extends abstractHtmlTag
nodeType dfn
 extends abstractHtmlTag
nodeType dialog
 extends abstractHtmlTag
nodeType div
 extends abstractHtmlTag
nodeType dl
 extends abstractHtmlTag
nodeType dt
 extends abstractHtmlTag
nodeType em
 extends abstractHtmlTag
nodeType embed
 extends abstractHtmlTag
nodeType fieldset
 extends abstractHtmlTag
nodeType figure
 extends abstractHtmlTag
nodeType footer
 extends abstractHtmlTag
nodeType form
 extends abstractHtmlTag
nodeType h1
 extends abstractHtmlTag
nodeType h2
 extends abstractHtmlTag
nodeType h3
 extends abstractHtmlTag
nodeType h4
 extends abstractHtmlTag
nodeType h5
 extends abstractHtmlTag
nodeType h6
 extends abstractHtmlTag
nodeType head
 extends abstractHtmlTag
nodeType header
 extends abstractHtmlTag
nodeType hgroup
 extends abstractHtmlTag
nodeType hr
 extends abstractHtmlTag
nodeType html
 extends abstractHtmlTag
nodeType i
 extends abstractHtmlTag
nodeType iframe
 extends abstractHtmlTag
nodeType img
 extends abstractHtmlTag
nodeType input
 extends abstractHtmlTag
nodeType ins
 extends abstractHtmlTag
nodeType kbd
 extends abstractHtmlTag
nodeType keygen
 extends abstractHtmlTag
nodeType label
 extends abstractHtmlTag
nodeType legend
 extends abstractHtmlTag
nodeType li
 extends abstractHtmlTag
nodeType link
 extends abstractHtmlTag
nodeType main
 extends abstractHtmlTag
nodeType map
 extends abstractHtmlTag
nodeType mark
 extends abstractHtmlTag
nodeType menu
 extends abstractHtmlTag
nodeType menuitem
 extends abstractHtmlTag
nodeType meta
 extends abstractHtmlTag
nodeType meter
 extends abstractHtmlTag
nodeType nav
 extends abstractHtmlTag
nodeType noscript
 extends abstractHtmlTag
nodeType object
 extends abstractHtmlTag
nodeType ol
 extends abstractHtmlTag
nodeType optgroup
 extends abstractHtmlTag
nodeType option
 extends abstractHtmlTag
nodeType output
 extends abstractHtmlTag
nodeType p
 extends abstractHtmlTag
nodeType param
 extends abstractHtmlTag
nodeType pre
 extends abstractHtmlTag
nodeType progress
 extends abstractHtmlTag
nodeType q
 extends abstractHtmlTag
nodeType rb
 extends abstractHtmlTag
nodeType rp
 extends abstractHtmlTag
nodeType rt
 extends abstractHtmlTag
nodeType rtc
 extends abstractHtmlTag
nodeType ruby
 extends abstractHtmlTag
nodeType s
 extends abstractHtmlTag
nodeType samp
 extends abstractHtmlTag
nodeType script
 extends abstractHtmlTag
nodeType section
 extends abstractHtmlTag
nodeType select
 extends abstractHtmlTag
nodeType small
 extends abstractHtmlTag
nodeType source
 extends abstractHtmlTag
nodeType span
 extends abstractHtmlTag
nodeType strong
 extends abstractHtmlTag
nodeType styleTag
 extends abstractHtmlTag
nodeType sub
 extends abstractHtmlTag
nodeType summary
 extends abstractHtmlTag
nodeType sup
 extends abstractHtmlTag
nodeType table
 extends abstractHtmlTag
nodeType tbody
 extends abstractHtmlTag
nodeType td
 extends abstractHtmlTag
nodeType template
 extends abstractHtmlTag
nodeType textarea
 extends abstractHtmlTag
nodeType tfoot
 extends abstractHtmlTag
nodeType th
 extends abstractHtmlTag
nodeType thead
 extends abstractHtmlTag
nodeType time
 extends abstractHtmlTag
nodeType titleTag
 extends abstractHtmlTag
nodeType tr
 extends abstractHtmlTag
nodeType track
 extends abstractHtmlTag
nodeType u
 extends abstractHtmlTag
nodeType ul
 extends abstractHtmlTag
nodeType varNode
 match var
 extends abstractHtmlTag
nodeType video
 extends abstractHtmlTag
nodeType wbr
 extends abstractHtmlTag
nodeType accept
 extends abstractHtmlAttribute
nodeType accesskey
 extends abstractHtmlAttribute
nodeType action
 extends abstractHtmlAttribute
nodeType align
 extends abstractHtmlAttribute
nodeType alt
 extends abstractHtmlAttribute
nodeType async
 extends abstractHtmlAttribute
nodeType autocomplete
 extends abstractHtmlAttribute
nodeType autofocus
 extends abstractHtmlAttribute
nodeType autoplay
 extends abstractHtmlAttribute
nodeType bgcolor
 extends abstractHtmlAttribute
nodeType border
 extends abstractHtmlAttribute
nodeType charset
 extends abstractHtmlAttribute
nodeType checked
 extends abstractHtmlAttribute
nodeType classNode
 match class
 extends abstractHtmlAttribute
nodeType color
 extends abstractHtmlAttribute
nodeType cols
 extends abstractHtmlAttribute
nodeType colspan
 extends abstractHtmlAttribute
nodeType content
 extends abstractHtmlAttribute
nodeType contenteditable
 extends abstractHtmlAttribute
nodeType controls
 extends abstractHtmlAttribute
nodeType coords
 extends abstractHtmlAttribute
nodeType datetime
 extends abstractHtmlAttribute
nodeType defaultNode
 match default
 extends abstractHtmlAttribute
nodeType defer
 extends abstractHtmlAttribute
nodeType dir
 extends abstractHtmlAttribute
nodeType dirname
 extends abstractHtmlAttribute
nodeType disabled
 extends abstractHtmlAttribute
nodeType download
 extends abstractHtmlAttribute
nodeType draggable
 extends abstractHtmlAttribute
nodeType dropzone
 extends abstractHtmlAttribute
nodeType enctype
 extends abstractHtmlAttribute
nodeType forNode
 match for
 extends abstractHtmlAttribute
nodeType formaction
 extends abstractHtmlAttribute
nodeType headers
 extends abstractHtmlAttribute
nodeType height
 extends abstractHtmlAttribute
nodeType hidden
 extends abstractHtmlAttribute
nodeType high
 extends abstractHtmlAttribute
nodeType href
 extends abstractHtmlAttribute
nodeType hreflang
 extends abstractHtmlAttribute
nodeType id
 extends abstractHtmlAttribute
nodeType ismap
 extends abstractHtmlAttribute
nodeType kind
 extends abstractHtmlAttribute
nodeType lang
 extends abstractHtmlAttribute
nodeType list
 extends abstractHtmlAttribute
nodeType loop
 extends abstractHtmlAttribute
nodeType low
 extends abstractHtmlAttribute
nodeType max
 extends abstractHtmlAttribute
nodeType maxlength
 extends abstractHtmlAttribute
nodeType media
 extends abstractHtmlAttribute
nodeType method
 extends abstractHtmlAttribute
nodeType min
 extends abstractHtmlAttribute
nodeType multiple
 extends abstractHtmlAttribute
nodeType muted
 extends abstractHtmlAttribute
nodeType name
 extends abstractHtmlAttribute
nodeType novalidate
 extends abstractHtmlAttribute
nodeType onabort
 extends abstractHtmlAttribute
nodeType onafterprint
 extends abstractHtmlAttribute
nodeType onbeforeprint
 extends abstractHtmlAttribute
nodeType onbeforeunload
 extends abstractHtmlAttribute
nodeType onblur
 extends abstractHtmlAttribute
nodeType oncanplay
 extends abstractHtmlAttribute
nodeType oncanplaythrough
 extends abstractHtmlAttribute
nodeType onchange
 extends abstractHtmlAttribute
nodeType onclick
 extends abstractHtmlAttribute
nodeType oncontextmenu
 extends abstractHtmlAttribute
nodeType oncopy
 extends abstractHtmlAttribute
nodeType oncuechange
 extends abstractHtmlAttribute
nodeType oncut
 extends abstractHtmlAttribute
nodeType ondblclick
 extends abstractHtmlAttribute
nodeType ondrag
 extends abstractHtmlAttribute
nodeType ondragend
 extends abstractHtmlAttribute
nodeType ondragenter
 extends abstractHtmlAttribute
nodeType ondragleave
 extends abstractHtmlAttribute
nodeType ondragover
 extends abstractHtmlAttribute
nodeType ondragstart
 extends abstractHtmlAttribute
nodeType ondrop
 extends abstractHtmlAttribute
nodeType ondurationchange
 extends abstractHtmlAttribute
nodeType onemptied
 extends abstractHtmlAttribute
nodeType onended
 extends abstractHtmlAttribute
nodeType onerror
 extends abstractHtmlAttribute
nodeType onfocus
 extends abstractHtmlAttribute
nodeType onhashchange
 extends abstractHtmlAttribute
nodeType oninput
 extends abstractHtmlAttribute
nodeType oninvalid
 extends abstractHtmlAttribute
nodeType onkeydown
 extends abstractHtmlAttribute
nodeType onkeypress
 extends abstractHtmlAttribute
nodeType onkeyup
 extends abstractHtmlAttribute
nodeType onload
 extends abstractHtmlAttribute
nodeType onloadeddata
 extends abstractHtmlAttribute
nodeType onloadedmetadata
 extends abstractHtmlAttribute
nodeType onloadstart
 extends abstractHtmlAttribute
nodeType onmousedown
 extends abstractHtmlAttribute
nodeType onmousemove
 extends abstractHtmlAttribute
nodeType onmouseout
 extends abstractHtmlAttribute
nodeType onmouseover
 extends abstractHtmlAttribute
nodeType onmouseup
 extends abstractHtmlAttribute
nodeType onmousewheel
 extends abstractHtmlAttribute
nodeType onoffline
 extends abstractHtmlAttribute
nodeType ononline
 extends abstractHtmlAttribute
nodeType onpagehide
 extends abstractHtmlAttribute
nodeType onpageshow
 extends abstractHtmlAttribute
nodeType onpaste
 extends abstractHtmlAttribute
nodeType onpause
 extends abstractHtmlAttribute
nodeType onplay
 extends abstractHtmlAttribute
nodeType onplaying
 extends abstractHtmlAttribute
nodeType onpopstate
 extends abstractHtmlAttribute
nodeType onprogress
 extends abstractHtmlAttribute
nodeType onratechange
 extends abstractHtmlAttribute
nodeType onreset
 extends abstractHtmlAttribute
nodeType onresize
 extends abstractHtmlAttribute
nodeType onscroll
 extends abstractHtmlAttribute
nodeType onsearch
 extends abstractHtmlAttribute
nodeType onseeked
 extends abstractHtmlAttribute
nodeType onseeking
 extends abstractHtmlAttribute
nodeType onselect
 extends abstractHtmlAttribute
nodeType onstalled
 extends abstractHtmlAttribute
nodeType onstorage
 extends abstractHtmlAttribute
nodeType onsubmit
 extends abstractHtmlAttribute
nodeType onsuspend
 extends abstractHtmlAttribute
nodeType ontimeupdate
 extends abstractHtmlAttribute
nodeType ontoggle
 extends abstractHtmlAttribute
nodeType onunload
 extends abstractHtmlAttribute
nodeType onvolumechange
 extends abstractHtmlAttribute
nodeType onwaiting
 extends abstractHtmlAttribute
nodeType onwheel
 extends abstractHtmlAttribute
nodeType open
 extends abstractHtmlAttribute
nodeType optimum
 extends abstractHtmlAttribute
nodeType pattern
 extends abstractHtmlAttribute
nodeType placeholder
 extends abstractHtmlAttribute
nodeType poster
 extends abstractHtmlAttribute
nodeType preload
 extends abstractHtmlAttribute
nodeType readonly
 extends abstractHtmlAttribute
nodeType rel
 extends abstractHtmlAttribute
nodeType required
 extends abstractHtmlAttribute
nodeType reversed
 extends abstractHtmlAttribute
nodeType rows
 extends abstractHtmlAttribute
nodeType rowspan
 extends abstractHtmlAttribute
nodeType sandbox
 extends abstractHtmlAttribute
nodeType scope
 extends abstractHtmlAttribute
nodeType selected
 extends abstractHtmlAttribute
nodeType shape
 extends abstractHtmlAttribute
nodeType size
 extends abstractHtmlAttribute
nodeType sizes
 extends abstractHtmlAttribute
nodeType spellcheck
 extends abstractHtmlAttribute
nodeType src
 extends abstractHtmlAttribute
nodeType srcdoc
 extends abstractHtmlAttribute
nodeType srclang
 extends abstractHtmlAttribute
nodeType srcset
 extends abstractHtmlAttribute
nodeType start
 extends abstractHtmlAttribute
nodeType step
 extends abstractHtmlAttribute
nodeType acceptCharset
 match accept-charset
 extends abstractHtmlAttribute
nodeType httpEquiv
 match http-equiv
 extends abstractHtmlAttribute
nodeType style
 extends abstractHtmlAttribute
nodeType tabindex
 extends abstractHtmlAttribute
nodeType target
 extends abstractHtmlAttribute
nodeType title
 extends abstractHtmlAttribute
nodeType translate
 extends abstractHtmlAttribute
nodeType type
 extends abstractHtmlAttribute
nodeType usemap
 extends abstractHtmlAttribute
nodeType value
 extends abstractHtmlAttribute
nodeType width
 extends abstractHtmlAttribute
nodeType wrap
 extends abstractHtmlAttribute
nodeType stumpExtendedAttribute
 abstract
 description Node types not present in HTML but included in stump.
 extends abstractHtmlAttribute
nodeType stumpNoOp
 extends stumpExtendedAttribute
nodeType stumpStyleFor
 extends stumpExtendedAttribute
nodeType stumpOnBlurCommand
 extends stumpExtendedAttribute
nodeType stumpOnLineClick
 extends stumpExtendedAttribute
nodeType stumpOnLineShiftClick
 extends stumpExtendedAttribute
nodeType stumpOnClickCommand
 extends stumpExtendedAttribute
nodeType stumpOnContextMenuCommand
 extends stumpExtendedAttribute
nodeType stumpOnChangeCommand
 extends stumpExtendedAttribute
nodeType stumpOnDblClickCommand
 extends stumpExtendedAttribute
nodeType stumpCollapseNode
 extends stumpExtendedAttribute`)
      return this._cachedGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        stump: stump,
        abstractHtmlTag: abstractHtmlTag,
        errorNode: errorNode,
        abstractHtmlAttribute: abstractHtmlAttribute,
        lineOfHtmlContent: lineOfHtmlContent,
        bern: bern,
        a: a,
        abbr: abbr,
        address: address,
        area: area,
        article: article,
        aside: aside,
        b: b,
        base: base,
        bdi: bdi,
        bdo: bdo,
        blockquote: blockquote,
        body: body,
        br: br,
        button: button,
        canvas: canvas,
        caption: caption,
        code: code,
        col: col,
        colgroup: colgroup,
        datalist: datalist,
        dd: dd,
        del: del,
        details: details,
        dfn: dfn,
        dialog: dialog,
        div: div,
        dl: dl,
        dt: dt,
        em: em,
        embed: embed,
        fieldset: fieldset,
        figure: figure,
        footer: footer,
        form: form,
        h1: h1,
        h2: h2,
        h3: h3,
        h4: h4,
        h5: h5,
        h6: h6,
        head: head,
        header: header,
        hgroup: hgroup,
        hr: hr,
        html: html,
        i: i,
        iframe: iframe,
        img: img,
        input: input,
        ins: ins,
        kbd: kbd,
        keygen: keygen,
        label: label,
        legend: legend,
        li: li,
        link: link,
        main: main,
        map: map,
        mark: mark,
        menu: menu,
        menuitem: menuitem,
        meta: meta,
        meter: meter,
        nav: nav,
        noscript: noscript,
        object: object,
        ol: ol,
        optgroup: optgroup,
        option: option,
        output: output,
        p: p,
        param: param,
        pre: pre,
        progress: progress,
        q: q,
        rb: rb,
        rp: rp,
        rt: rt,
        rtc: rtc,
        ruby: ruby,
        s: s,
        samp: samp,
        script: script,
        section: section,
        select: select,
        small: small,
        source: source,
        span: span,
        strong: strong,
        styleTag: styleTag,
        sub: sub,
        summary: summary,
        sup: sup,
        table: table,
        tbody: tbody,
        td: td,
        template: template,
        textarea: textarea,
        tfoot: tfoot,
        th: th,
        thead: thead,
        time: time,
        titleTag: titleTag,
        tr: tr,
        track: track,
        u: u,
        ul: ul,
        varNode: varNode,
        video: video,
        wbr: wbr,
        accept: accept,
        accesskey: accesskey,
        action: action,
        align: align,
        alt: alt,
        async: async,
        autocomplete: autocomplete,
        autofocus: autofocus,
        autoplay: autoplay,
        bgcolor: bgcolor,
        border: border,
        charset: charset,
        checked: checked,
        classNode: classNode,
        color: color,
        cols: cols,
        colspan: colspan,
        content: content,
        contenteditable: contenteditable,
        controls: controls,
        coords: coords,
        datetime: datetime,
        defaultNode: defaultNode,
        defer: defer,
        dir: dir,
        dirname: dirname,
        disabled: disabled,
        download: download,
        draggable: draggable,
        dropzone: dropzone,
        enctype: enctype,
        forNode: forNode,
        formaction: formaction,
        headers: headers,
        height: height,
        hidden: hidden,
        high: high,
        href: href,
        hreflang: hreflang,
        id: id,
        ismap: ismap,
        kind: kind,
        lang: lang,
        list: list,
        loop: loop,
        low: low,
        max: max,
        maxlength: maxlength,
        media: media,
        method: method,
        min: min,
        multiple: multiple,
        muted: muted,
        name: name,
        novalidate: novalidate,
        onabort: onabort,
        onafterprint: onafterprint,
        onbeforeprint: onbeforeprint,
        onbeforeunload: onbeforeunload,
        onblur: onblur,
        oncanplay: oncanplay,
        oncanplaythrough: oncanplaythrough,
        onchange: onchange,
        onclick: onclick,
        oncontextmenu: oncontextmenu,
        oncopy: oncopy,
        oncuechange: oncuechange,
        oncut: oncut,
        ondblclick: ondblclick,
        ondrag: ondrag,
        ondragend: ondragend,
        ondragenter: ondragenter,
        ondragleave: ondragleave,
        ondragover: ondragover,
        ondragstart: ondragstart,
        ondrop: ondrop,
        ondurationchange: ondurationchange,
        onemptied: onemptied,
        onended: onended,
        onerror: onerror,
        onfocus: onfocus,
        onhashchange: onhashchange,
        oninput: oninput,
        oninvalid: oninvalid,
        onkeydown: onkeydown,
        onkeypress: onkeypress,
        onkeyup: onkeyup,
        onload: onload,
        onloadeddata: onloadeddata,
        onloadedmetadata: onloadedmetadata,
        onloadstart: onloadstart,
        onmousedown: onmousedown,
        onmousemove: onmousemove,
        onmouseout: onmouseout,
        onmouseover: onmouseover,
        onmouseup: onmouseup,
        onmousewheel: onmousewheel,
        onoffline: onoffline,
        ononline: ononline,
        onpagehide: onpagehide,
        onpageshow: onpageshow,
        onpaste: onpaste,
        onpause: onpause,
        onplay: onplay,
        onplaying: onplaying,
        onpopstate: onpopstate,
        onprogress: onprogress,
        onratechange: onratechange,
        onreset: onreset,
        onresize: onresize,
        onscroll: onscroll,
        onsearch: onsearch,
        onseeked: onseeked,
        onseeking: onseeking,
        onselect: onselect,
        onstalled: onstalled,
        onstorage: onstorage,
        onsubmit: onsubmit,
        onsuspend: onsuspend,
        ontimeupdate: ontimeupdate,
        ontoggle: ontoggle,
        onunload: onunload,
        onvolumechange: onvolumechange,
        onwaiting: onwaiting,
        onwheel: onwheel,
        open: open,
        optimum: optimum,
        pattern: pattern,
        placeholder: placeholder,
        poster: poster,
        preload: preload,
        readonly: readonly,
        rel: rel,
        required: required,
        reversed: reversed,
        rows: rows,
        rowspan: rowspan,
        sandbox: sandbox,
        scope: scope,
        selected: selected,
        shape: shape,
        size: size,
        sizes: sizes,
        spellcheck: spellcheck,
        src: src,
        srcdoc: srcdoc,
        srclang: srclang,
        srcset: srcset,
        start: start,
        step: step,
        acceptCharset: acceptCharset,
        httpEquiv: httpEquiv,
        style: style,
        tabindex: tabindex,
        target: target,
        title: title,
        translate: translate,
        type: type,
        usemap: usemap,
        value: value,
        width: width,
        wrap: wrap,
        stumpExtendedAttribute: stumpExtendedAttribute,
        stumpNoOp: stumpNoOp,
        stumpStyleFor: stumpStyleFor,
        stumpOnBlurCommand: stumpOnBlurCommand,
        stumpOnLineClick: stumpOnLineClick,
        stumpOnLineShiftClick: stumpOnLineShiftClick,
        stumpOnClickCommand: stumpOnClickCommand,
        stumpOnContextMenuCommand: stumpOnContextMenuCommand,
        stumpOnChangeCommand: stumpOnChangeCommand,
        stumpOnDblClickCommand: stumpOnDblClickCommand,
        stumpCollapseNode: stumpCollapseNode
      }
    }
  }

  class abstractHtmlTag extends jtree.GrammarBackedNonRootNode {
    getFirstWordMap() {
      const map = Object.assign({}, super.getFirstWordMap())
      return Object.assign(map, {
        bern: bern,
        a: a,
        abbr: abbr,
        address: address,
        area: area,
        article: article,
        aside: aside,
        b: b,
        base: base,
        bdi: bdi,
        bdo: bdo,
        blockquote: blockquote,
        body: body,
        br: br,
        button: button,
        canvas: canvas,
        caption: caption,
        code: code,
        col: col,
        colgroup: colgroup,
        datalist: datalist,
        dd: dd,
        del: del,
        details: details,
        dfn: dfn,
        dialog: dialog,
        div: div,
        dl: dl,
        dt: dt,
        em: em,
        embed: embed,
        fieldset: fieldset,
        figure: figure,
        footer: footer,
        form: form,
        h1: h1,
        h2: h2,
        h3: h3,
        h4: h4,
        h5: h5,
        h6: h6,
        head: head,
        header: header,
        hgroup: hgroup,
        hr: hr,
        html: html,
        i: i,
        iframe: iframe,
        img: img,
        input: input,
        ins: ins,
        kbd: kbd,
        keygen: keygen,
        label: label,
        legend: legend,
        li: li,
        link: link,
        main: main,
        map: map,
        mark: mark,
        menu: menu,
        menuitem: menuitem,
        meta: meta,
        meter: meter,
        nav: nav,
        noscript: noscript,
        object: object,
        ol: ol,
        optgroup: optgroup,
        option: option,
        output: output,
        p: p,
        param: param,
        pre: pre,
        progress: progress,
        q: q,
        rb: rb,
        rp: rp,
        rt: rt,
        rtc: rtc,
        ruby: ruby,
        s: s,
        samp: samp,
        script: script,
        section: section,
        select: select,
        small: small,
        source: source,
        span: span,
        strong: strong,
        styleTag: styleTag,
        sub: sub,
        summary: summary,
        sup: sup,
        table: table,
        tbody: tbody,
        td: td,
        template: template,
        textarea: textarea,
        tfoot: tfoot,
        th: th,
        thead: thead,
        time: time,
        titleTag: titleTag,
        tr: tr,
        track: track,
        u: u,
        ul: ul,
        var: varNode,
        video: video,
        wbr: wbr,
        accept: accept,
        accesskey: accesskey,
        action: action,
        align: align,
        alt: alt,
        async: async,
        autocomplete: autocomplete,
        autofocus: autofocus,
        autoplay: autoplay,
        bgcolor: bgcolor,
        border: border,
        charset: charset,
        checked: checked,
        class: classNode,
        color: color,
        cols: cols,
        colspan: colspan,
        content: content,
        contenteditable: contenteditable,
        controls: controls,
        coords: coords,
        datetime: datetime,
        default: defaultNode,
        defer: defer,
        dir: dir,
        dirname: dirname,
        disabled: disabled,
        download: download,
        draggable: draggable,
        dropzone: dropzone,
        enctype: enctype,
        for: forNode,
        formaction: formaction,
        headers: headers,
        height: height,
        hidden: hidden,
        high: high,
        href: href,
        hreflang: hreflang,
        id: id,
        ismap: ismap,
        kind: kind,
        lang: lang,
        list: list,
        loop: loop,
        low: low,
        max: max,
        maxlength: maxlength,
        media: media,
        method: method,
        min: min,
        multiple: multiple,
        muted: muted,
        name: name,
        novalidate: novalidate,
        onabort: onabort,
        onafterprint: onafterprint,
        onbeforeprint: onbeforeprint,
        onbeforeunload: onbeforeunload,
        onblur: onblur,
        oncanplay: oncanplay,
        oncanplaythrough: oncanplaythrough,
        onchange: onchange,
        onclick: onclick,
        oncontextmenu: oncontextmenu,
        oncopy: oncopy,
        oncuechange: oncuechange,
        oncut: oncut,
        ondblclick: ondblclick,
        ondrag: ondrag,
        ondragend: ondragend,
        ondragenter: ondragenter,
        ondragleave: ondragleave,
        ondragover: ondragover,
        ondragstart: ondragstart,
        ondrop: ondrop,
        ondurationchange: ondurationchange,
        onemptied: onemptied,
        onended: onended,
        onerror: onerror,
        onfocus: onfocus,
        onhashchange: onhashchange,
        oninput: oninput,
        oninvalid: oninvalid,
        onkeydown: onkeydown,
        onkeypress: onkeypress,
        onkeyup: onkeyup,
        onload: onload,
        onloadeddata: onloadeddata,
        onloadedmetadata: onloadedmetadata,
        onloadstart: onloadstart,
        onmousedown: onmousedown,
        onmousemove: onmousemove,
        onmouseout: onmouseout,
        onmouseover: onmouseover,
        onmouseup: onmouseup,
        onmousewheel: onmousewheel,
        onoffline: onoffline,
        ononline: ononline,
        onpagehide: onpagehide,
        onpageshow: onpageshow,
        onpaste: onpaste,
        onpause: onpause,
        onplay: onplay,
        onplaying: onplaying,
        onpopstate: onpopstate,
        onprogress: onprogress,
        onratechange: onratechange,
        onreset: onreset,
        onresize: onresize,
        onscroll: onscroll,
        onsearch: onsearch,
        onseeked: onseeked,
        onseeking: onseeking,
        onselect: onselect,
        onstalled: onstalled,
        onstorage: onstorage,
        onsubmit: onsubmit,
        onsuspend: onsuspend,
        ontimeupdate: ontimeupdate,
        ontoggle: ontoggle,
        onunload: onunload,
        onvolumechange: onvolumechange,
        onwaiting: onwaiting,
        onwheel: onwheel,
        open: open,
        optimum: optimum,
        pattern: pattern,
        placeholder: placeholder,
        poster: poster,
        preload: preload,
        readonly: readonly,
        rel: rel,
        required: required,
        reversed: reversed,
        rows: rows,
        rowspan: rowspan,
        sandbox: sandbox,
        scope: scope,
        selected: selected,
        shape: shape,
        size: size,
        sizes: sizes,
        spellcheck: spellcheck,
        src: src,
        srcdoc: srcdoc,
        srclang: srclang,
        srcset: srcset,
        start: start,
        step: step,
        "accept-charset": acceptCharset,
        "http-equiv": httpEquiv,
        style: style,
        tabindex: tabindex,
        target: target,
        title: title,
        translate: translate,
        type: type,
        usemap: usemap,
        value: value,
        width: width,
        wrap: wrap,
        stumpNoOp: stumpNoOp,
        stumpStyleFor: stumpStyleFor,
        stumpOnBlurCommand: stumpOnBlurCommand,
        stumpOnLineClick: stumpOnLineClick,
        stumpOnLineShiftClick: stumpOnLineShiftClick,
        stumpOnClickCommand: stumpOnClickCommand,
        stumpOnContextMenuCommand: stumpOnContextMenuCommand,
        stumpOnChangeCommand: stumpOnChangeCommand,
        stumpOnDblClickCommand: stumpOnDblClickCommand,
        stumpCollapseNode: stumpCollapseNode
      })
    }
    get anyHtmlContent() {
      return this.getWordsFrom(1)
    }
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
      return ``
    }
    toHtmlWithSuids() {
      return this._toHtml(undefined, true)
    }
    _getOneLiner() {
      const oneLinerWords = this.getWordsFrom(1)
      return oneLinerWords.length ? oneLinerWords.join(" ") : ""
    }
    shouldCollapse() {
      return this.has("stumpCollapseNode")
    }
    _toHtml(indentCount, withSuid) {
      const tag = this.getTag()
      const children = this.map(child => child._toHtml(indentCount + 1, withSuid)).join("")
      const attributesStr = this.filter(node => node.isAttributeNode)
        .map(child => child.getAttribute())
        .join("")
      const indent = " ".repeat(indentCount)
      const collapse = this.shouldCollapse()
      const indentForChildNodes = !collapse && this.getChildInstancesOfNodeTypeId("abstractHtmlTag").length > 0
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
      classNode.setContent(words.join(this.getZI()))
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
      const stumpNodeIndex = this.getChildInstancesOfNodeTypeId("abstractHtmlTag").indexOf(newNode)
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
      return this.getTopDownArray().filter(node => node.doesExtend("abstractHtmlTag") && node.getFirstWord() === firstWord)
    }
    hasLine(line) {
      return this.getChildren().some(node => node.getLine() === line)
    }
    findStumpNodesByChild(line) {
      return this.getTopDownArray().filter(node => node.doesExtend("abstractHtmlTag") && node.hasLine(line))
    }
    findStumpNodesWithClass(className) {
      return this.getTopDownArray().filter(
        node =>
          node.doesExtend("abstractHtmlTag") &&
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
    // todo: whats this? move to base?
    getLines(start = 0, end) {
      return this.toString()
        .split("\n")
        .slice(start, end)
        .join("\n")
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
    setStumpNodeCss(css) {
      this.getShadow().setShadowCss(css)
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

  class errorNode extends jtree.GrammarBackedNonRootNode {
    getErrors() {
      return this._getErrorNodeErrors()
    }
  }

  class abstractHtmlAttribute extends jtree.GrammarBackedNonRootNode {
    getCatchAllNodeConstructor() {
      return errorNode
    }
    get attributeValue() {
      return this.getWordsFrom(1)
    }
    get isAttributeNode() {
      return true
    }
    _toHtml() {
      return ""
    }
    getAttribute() {
      return ` ${this.getFirstWord()}="${this.getContent()}"`
    }
  }

  class lineOfHtmlContent extends jtree.GrammarBackedNonRootNode {
    getCatchAllNodeConstructor() {
      return lineOfHtmlContent
    }
    get anyHtmlContent() {
      return this.getWordsFrom(1)
    }
  }

  class bern extends jtree.GrammarBackedNonRootNode {
    getCatchAllNodeConstructor() {
      return lineOfHtmlContent
    }
    _toHtml() {
      return this.childrenToString()
    }
  }

  class a extends abstractHtmlTag {}

  class abbr extends abstractHtmlTag {}

  class address extends abstractHtmlTag {}

  class area extends abstractHtmlTag {}

  class article extends abstractHtmlTag {}

  class aside extends abstractHtmlTag {}

  class b extends abstractHtmlTag {}

  class base extends abstractHtmlTag {}

  class bdi extends abstractHtmlTag {}

  class bdo extends abstractHtmlTag {}

  class blockquote extends abstractHtmlTag {}

  class body extends abstractHtmlTag {}

  class br extends abstractHtmlTag {}

  class button extends abstractHtmlTag {}

  class canvas extends abstractHtmlTag {}

  class caption extends abstractHtmlTag {}

  class code extends abstractHtmlTag {}

  class col extends abstractHtmlTag {}

  class colgroup extends abstractHtmlTag {}

  class datalist extends abstractHtmlTag {}

  class dd extends abstractHtmlTag {}

  class del extends abstractHtmlTag {}

  class details extends abstractHtmlTag {}

  class dfn extends abstractHtmlTag {}

  class dialog extends abstractHtmlTag {}

  class div extends abstractHtmlTag {}

  class dl extends abstractHtmlTag {}

  class dt extends abstractHtmlTag {}

  class em extends abstractHtmlTag {}

  class embed extends abstractHtmlTag {}

  class fieldset extends abstractHtmlTag {}

  class figure extends abstractHtmlTag {}

  class footer extends abstractHtmlTag {}

  class form extends abstractHtmlTag {}

  class h1 extends abstractHtmlTag {}

  class h2 extends abstractHtmlTag {}

  class h3 extends abstractHtmlTag {}

  class h4 extends abstractHtmlTag {}

  class h5 extends abstractHtmlTag {}

  class h6 extends abstractHtmlTag {}

  class head extends abstractHtmlTag {}

  class header extends abstractHtmlTag {}

  class hgroup extends abstractHtmlTag {}

  class hr extends abstractHtmlTag {}

  class html extends abstractHtmlTag {}

  class i extends abstractHtmlTag {}

  class iframe extends abstractHtmlTag {}

  class img extends abstractHtmlTag {}

  class input extends abstractHtmlTag {}

  class ins extends abstractHtmlTag {}

  class kbd extends abstractHtmlTag {}

  class keygen extends abstractHtmlTag {}

  class label extends abstractHtmlTag {}

  class legend extends abstractHtmlTag {}

  class li extends abstractHtmlTag {}

  class link extends abstractHtmlTag {}

  class main extends abstractHtmlTag {}

  class map extends abstractHtmlTag {}

  class mark extends abstractHtmlTag {}

  class menu extends abstractHtmlTag {}

  class menuitem extends abstractHtmlTag {}

  class meta extends abstractHtmlTag {}

  class meter extends abstractHtmlTag {}

  class nav extends abstractHtmlTag {}

  class noscript extends abstractHtmlTag {}

  class object extends abstractHtmlTag {}

  class ol extends abstractHtmlTag {}

  class optgroup extends abstractHtmlTag {}

  class option extends abstractHtmlTag {}

  class output extends abstractHtmlTag {}

  class p extends abstractHtmlTag {}

  class param extends abstractHtmlTag {}

  class pre extends abstractHtmlTag {}

  class progress extends abstractHtmlTag {}

  class q extends abstractHtmlTag {}

  class rb extends abstractHtmlTag {}

  class rp extends abstractHtmlTag {}

  class rt extends abstractHtmlTag {}

  class rtc extends abstractHtmlTag {}

  class ruby extends abstractHtmlTag {}

  class s extends abstractHtmlTag {}

  class samp extends abstractHtmlTag {}

  class script extends abstractHtmlTag {}

  class section extends abstractHtmlTag {}

  class select extends abstractHtmlTag {}

  class small extends abstractHtmlTag {}

  class source extends abstractHtmlTag {}

  class span extends abstractHtmlTag {}

  class strong extends abstractHtmlTag {}

  class styleTag extends abstractHtmlTag {}

  class sub extends abstractHtmlTag {}

  class summary extends abstractHtmlTag {}

  class sup extends abstractHtmlTag {}

  class table extends abstractHtmlTag {}

  class tbody extends abstractHtmlTag {}

  class td extends abstractHtmlTag {}

  class template extends abstractHtmlTag {}

  class textarea extends abstractHtmlTag {}

  class tfoot extends abstractHtmlTag {}

  class th extends abstractHtmlTag {}

  class thead extends abstractHtmlTag {}

  class time extends abstractHtmlTag {}

  class titleTag extends abstractHtmlTag {}

  class tr extends abstractHtmlTag {}

  class track extends abstractHtmlTag {}

  class u extends abstractHtmlTag {}

  class ul extends abstractHtmlTag {}

  class varNode extends abstractHtmlTag {}

  class video extends abstractHtmlTag {}

  class wbr extends abstractHtmlTag {}

  class accept extends abstractHtmlAttribute {}

  class accesskey extends abstractHtmlAttribute {}

  class action extends abstractHtmlAttribute {}

  class align extends abstractHtmlAttribute {}

  class alt extends abstractHtmlAttribute {}

  class async extends abstractHtmlAttribute {}

  class autocomplete extends abstractHtmlAttribute {}

  class autofocus extends abstractHtmlAttribute {}

  class autoplay extends abstractHtmlAttribute {}

  class bgcolor extends abstractHtmlAttribute {}

  class border extends abstractHtmlAttribute {}

  class charset extends abstractHtmlAttribute {}

  class checked extends abstractHtmlAttribute {}

  class classNode extends abstractHtmlAttribute {}

  class color extends abstractHtmlAttribute {}

  class cols extends abstractHtmlAttribute {}

  class colspan extends abstractHtmlAttribute {}

  class content extends abstractHtmlAttribute {}

  class contenteditable extends abstractHtmlAttribute {}

  class controls extends abstractHtmlAttribute {}

  class coords extends abstractHtmlAttribute {}

  class datetime extends abstractHtmlAttribute {}

  class defaultNode extends abstractHtmlAttribute {}

  class defer extends abstractHtmlAttribute {}

  class dir extends abstractHtmlAttribute {}

  class dirname extends abstractHtmlAttribute {}

  class disabled extends abstractHtmlAttribute {}

  class download extends abstractHtmlAttribute {}

  class draggable extends abstractHtmlAttribute {}

  class dropzone extends abstractHtmlAttribute {}

  class enctype extends abstractHtmlAttribute {}

  class forNode extends abstractHtmlAttribute {}

  class formaction extends abstractHtmlAttribute {}

  class headers extends abstractHtmlAttribute {}

  class height extends abstractHtmlAttribute {}

  class hidden extends abstractHtmlAttribute {}

  class high extends abstractHtmlAttribute {}

  class href extends abstractHtmlAttribute {}

  class hreflang extends abstractHtmlAttribute {}

  class id extends abstractHtmlAttribute {}

  class ismap extends abstractHtmlAttribute {}

  class kind extends abstractHtmlAttribute {}

  class lang extends abstractHtmlAttribute {}

  class list extends abstractHtmlAttribute {}

  class loop extends abstractHtmlAttribute {}

  class low extends abstractHtmlAttribute {}

  class max extends abstractHtmlAttribute {}

  class maxlength extends abstractHtmlAttribute {}

  class media extends abstractHtmlAttribute {}

  class method extends abstractHtmlAttribute {}

  class min extends abstractHtmlAttribute {}

  class multiple extends abstractHtmlAttribute {}

  class muted extends abstractHtmlAttribute {}

  class name extends abstractHtmlAttribute {}

  class novalidate extends abstractHtmlAttribute {}

  class onabort extends abstractHtmlAttribute {}

  class onafterprint extends abstractHtmlAttribute {}

  class onbeforeprint extends abstractHtmlAttribute {}

  class onbeforeunload extends abstractHtmlAttribute {}

  class onblur extends abstractHtmlAttribute {}

  class oncanplay extends abstractHtmlAttribute {}

  class oncanplaythrough extends abstractHtmlAttribute {}

  class onchange extends abstractHtmlAttribute {}

  class onclick extends abstractHtmlAttribute {}

  class oncontextmenu extends abstractHtmlAttribute {}

  class oncopy extends abstractHtmlAttribute {}

  class oncuechange extends abstractHtmlAttribute {}

  class oncut extends abstractHtmlAttribute {}

  class ondblclick extends abstractHtmlAttribute {}

  class ondrag extends abstractHtmlAttribute {}

  class ondragend extends abstractHtmlAttribute {}

  class ondragenter extends abstractHtmlAttribute {}

  class ondragleave extends abstractHtmlAttribute {}

  class ondragover extends abstractHtmlAttribute {}

  class ondragstart extends abstractHtmlAttribute {}

  class ondrop extends abstractHtmlAttribute {}

  class ondurationchange extends abstractHtmlAttribute {}

  class onemptied extends abstractHtmlAttribute {}

  class onended extends abstractHtmlAttribute {}

  class onerror extends abstractHtmlAttribute {}

  class onfocus extends abstractHtmlAttribute {}

  class onhashchange extends abstractHtmlAttribute {}

  class oninput extends abstractHtmlAttribute {}

  class oninvalid extends abstractHtmlAttribute {}

  class onkeydown extends abstractHtmlAttribute {}

  class onkeypress extends abstractHtmlAttribute {}

  class onkeyup extends abstractHtmlAttribute {}

  class onload extends abstractHtmlAttribute {}

  class onloadeddata extends abstractHtmlAttribute {}

  class onloadedmetadata extends abstractHtmlAttribute {}

  class onloadstart extends abstractHtmlAttribute {}

  class onmousedown extends abstractHtmlAttribute {}

  class onmousemove extends abstractHtmlAttribute {}

  class onmouseout extends abstractHtmlAttribute {}

  class onmouseover extends abstractHtmlAttribute {}

  class onmouseup extends abstractHtmlAttribute {}

  class onmousewheel extends abstractHtmlAttribute {}

  class onoffline extends abstractHtmlAttribute {}

  class ononline extends abstractHtmlAttribute {}

  class onpagehide extends abstractHtmlAttribute {}

  class onpageshow extends abstractHtmlAttribute {}

  class onpaste extends abstractHtmlAttribute {}

  class onpause extends abstractHtmlAttribute {}

  class onplay extends abstractHtmlAttribute {}

  class onplaying extends abstractHtmlAttribute {}

  class onpopstate extends abstractHtmlAttribute {}

  class onprogress extends abstractHtmlAttribute {}

  class onratechange extends abstractHtmlAttribute {}

  class onreset extends abstractHtmlAttribute {}

  class onresize extends abstractHtmlAttribute {}

  class onscroll extends abstractHtmlAttribute {}

  class onsearch extends abstractHtmlAttribute {}

  class onseeked extends abstractHtmlAttribute {}

  class onseeking extends abstractHtmlAttribute {}

  class onselect extends abstractHtmlAttribute {}

  class onstalled extends abstractHtmlAttribute {}

  class onstorage extends abstractHtmlAttribute {}

  class onsubmit extends abstractHtmlAttribute {}

  class onsuspend extends abstractHtmlAttribute {}

  class ontimeupdate extends abstractHtmlAttribute {}

  class ontoggle extends abstractHtmlAttribute {}

  class onunload extends abstractHtmlAttribute {}

  class onvolumechange extends abstractHtmlAttribute {}

  class onwaiting extends abstractHtmlAttribute {}

  class onwheel extends abstractHtmlAttribute {}

  class open extends abstractHtmlAttribute {}

  class optimum extends abstractHtmlAttribute {}

  class pattern extends abstractHtmlAttribute {}

  class placeholder extends abstractHtmlAttribute {}

  class poster extends abstractHtmlAttribute {}

  class preload extends abstractHtmlAttribute {}

  class readonly extends abstractHtmlAttribute {}

  class rel extends abstractHtmlAttribute {}

  class required extends abstractHtmlAttribute {}

  class reversed extends abstractHtmlAttribute {}

  class rows extends abstractHtmlAttribute {}

  class rowspan extends abstractHtmlAttribute {}

  class sandbox extends abstractHtmlAttribute {}

  class scope extends abstractHtmlAttribute {}

  class selected extends abstractHtmlAttribute {}

  class shape extends abstractHtmlAttribute {}

  class size extends abstractHtmlAttribute {}

  class sizes extends abstractHtmlAttribute {}

  class spellcheck extends abstractHtmlAttribute {}

  class src extends abstractHtmlAttribute {}

  class srcdoc extends abstractHtmlAttribute {}

  class srclang extends abstractHtmlAttribute {}

  class srcset extends abstractHtmlAttribute {}

  class start extends abstractHtmlAttribute {}

  class step extends abstractHtmlAttribute {}

  class acceptCharset extends abstractHtmlAttribute {}

  class httpEquiv extends abstractHtmlAttribute {}

  class style extends abstractHtmlAttribute {}

  class tabindex extends abstractHtmlAttribute {}

  class target extends abstractHtmlAttribute {}

  class title extends abstractHtmlAttribute {}

  class translate extends abstractHtmlAttribute {}

  class type extends abstractHtmlAttribute {}

  class usemap extends abstractHtmlAttribute {}

  class value extends abstractHtmlAttribute {}

  class width extends abstractHtmlAttribute {}

  class wrap extends abstractHtmlAttribute {}

  class stumpExtendedAttribute extends abstractHtmlAttribute {}

  class stumpNoOp extends stumpExtendedAttribute {}

  class stumpStyleFor extends stumpExtendedAttribute {}

  class stumpOnBlurCommand extends stumpExtendedAttribute {}

  class stumpOnLineClick extends stumpExtendedAttribute {}

  class stumpOnLineShiftClick extends stumpExtendedAttribute {}

  class stumpOnClickCommand extends stumpExtendedAttribute {}

  class stumpOnContextMenuCommand extends stumpExtendedAttribute {}

  class stumpOnChangeCommand extends stumpExtendedAttribute {}

  class stumpOnDblClickCommand extends stumpExtendedAttribute {}

  class stumpCollapseNode extends stumpExtendedAttribute {}

  window.stump = stump
}
