{
  ;("use strict")

  class stumpNode extends jtree.GrammarBackedRootNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        errorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMap()), {
          a: aNode,
          abbr: abbrNode,
          address: addressNode,
          area: areaNode,
          article: articleNode,
          aside: asideNode,
          b: bNode,
          base: baseNode,
          bdi: bdiNode,
          bdo: bdoNode,
          blockquote: blockquoteNode,
          body: bodyNode,
          br: brNode,
          button: buttonNode,
          canvas: canvasNode,
          caption: captionNode,
          code: codeNode,
          col: colNode,
          colgroup: colgroupNode,
          datalist: datalistNode,
          dd: ddNode,
          del: delNode,
          details: detailsNode,
          dfn: dfnNode,
          dialog: dialogNode,
          div: divNode,
          dl: dlNode,
          dt: dtNode,
          em: emNode,
          embed: embedNode,
          fieldset: fieldsetNode,
          figure: figureNode,
          footer: footerNode,
          form: formNode,
          h1: h1Node,
          h2: h2Node,
          h3: h3Node,
          h4: h4Node,
          h5: h5Node,
          h6: h6Node,
          head: headNode,
          header: headerNode,
          hgroup: hgroupNode,
          hr: hrNode,
          html: htmlNode,
          i: iNode,
          iframe: iframeNode,
          img: imgNode,
          input: inputNode,
          ins: insNode,
          kbd: kbdNode,
          keygen: keygenNode,
          label: labelNode,
          legend: legendNode,
          li: liNode,
          link: linkNode,
          main: mainNode,
          map: mapNode,
          mark: markNode,
          menu: menuNode,
          menuitem: menuitemNode,
          meta: metaNode,
          meter: meterNode,
          nav: navNode,
          noscript: noscriptNode,
          object: objectNode,
          ol: olNode,
          optgroup: optgroupNode,
          option: optionNode,
          output: outputNode,
          p: pNode,
          param: paramNode,
          pre: preNode,
          progress: progressNode,
          q: qNode,
          rb: rbNode,
          rp: rpNode,
          rt: rtNode,
          rtc: rtcNode,
          ruby: rubyNode,
          s: sNode,
          samp: sampNode,
          script: scriptNode,
          section: sectionNode,
          select: selectNode,
          small: smallNode,
          source: sourceNode,
          span: spanNode,
          strong: strongNode,
          styleTag: styleTagNode,
          sub: subNode,
          summary: summaryNode,
          sup: supNode,
          table: tableNode,
          tbody: tbodyNode,
          td: tdNode,
          template: templateNode,
          textarea: textareaNode,
          tfoot: tfootNode,
          th: thNode,
          thead: theadNode,
          time: timeNode,
          titleTag: titleTagNode,
          tr: trNode,
          track: trackNode,
          u: uNode,
          ul: ulNode,
          var: varNode,
          video: videoNode,
          wbr: wbrNode
        }),
        undefined
      )
    }
    compile() {
      return this.toHtml()
    }
    getGrammarProgramRoot() {
      if (!this._cachedGrammarProgramRoot)
        this._cachedGrammarProgramRoot = new jtree.GrammarProgram(`stumpNode
 root
 description A Tree Language that compiles to HTML.
 catchAllNodeType errorNode
 inScope abstractHtmlTagNode
 compilesTo html
 javascript
  compile() { return this.toHtml() }
anyFirstCell
extraCell
 highlightScope invalid
anyHtmlContentCell
 highlightScope string
attributeValueCell
 highlightScope constant.language
htmlTagNameCell
 highlightScope variable.function
htmlAttributeNameCell
 highlightScope entity.name.type
contentHolderNameCell
 highlightScope keyword
abstractHtmlTagNode
 firstCellType htmlTagNameCell
 inScope bernNode abstractHtmlTagNode abstractHtmlAttributeNode
 catchAllCellType anyHtmlContentCell
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
    const indentForChildNodes = !collapse && this.getChildInstancesOfNodeTypeId("abstractHtmlTagNode").length > 0
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
    const stumpNodeIndex = this.getChildInstancesOfNodeTypeId("abstractHtmlTagNode").indexOf(newNode)
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
    return this.getTopDownArray().filter(node => node.doesExtend("abstractHtmlTagNode") && node.getFirstWord() === firstWord)
  }
  hasLine(line) {
    return this.getChildren().some(node => node.getLine() === line)
  }
  findStumpNodesByChild(line) {
    return this.getTopDownArray().filter(node => node.doesExtend("abstractHtmlTagNode") && node.hasLine(line))
  }
  findStumpNodesWithClass(className) {
    return this.getTopDownArray().filter(
      node =>
        node.doesExtend("abstractHtmlTagNode") &&
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
errorNode
 baseNodeType errorNode
abstractHtmlAttributeNode
 firstCellType htmlAttributeNameCell
 javascript
  _toHtml() { return "" }
  getAttribute() { return \` \${this.getFirstWord()}="\${this.getContent()}"\` }
 boolean isAttributeNode true
 catchAllNodeType errorNode
 catchAllCellType attributeValueCell
 abstract
lineOfHtmlContentNode
 catchAllNodeType lineOfHtmlContentNode
 catchAllCellType anyHtmlContentCell
 firstCellType anyHtmlContentCell
bernNode
 todo Rename this node type
 description This is a node where you can put any HTML content. It is called "bern" until someone comes up with a better name.
 firstCellType contentHolderNameCell
 catchAllNodeType lineOfHtmlContentNode
 javascript
  _toHtml() { return this.childrenToString() }
aNode
 extends abstractHtmlTagNode
abbrNode
 extends abstractHtmlTagNode
addressNode
 extends abstractHtmlTagNode
areaNode
 extends abstractHtmlTagNode
articleNode
 extends abstractHtmlTagNode
asideNode
 extends abstractHtmlTagNode
bNode
 extends abstractHtmlTagNode
baseNode
 extends abstractHtmlTagNode
bdiNode
 extends abstractHtmlTagNode
bdoNode
 extends abstractHtmlTagNode
blockquoteNode
 extends abstractHtmlTagNode
bodyNode
 extends abstractHtmlTagNode
brNode
 extends abstractHtmlTagNode
buttonNode
 extends abstractHtmlTagNode
canvasNode
 extends abstractHtmlTagNode
captionNode
 extends abstractHtmlTagNode
codeNode
 extends abstractHtmlTagNode
colNode
 extends abstractHtmlTagNode
colgroupNode
 extends abstractHtmlTagNode
datalistNode
 extends abstractHtmlTagNode
ddNode
 extends abstractHtmlTagNode
delNode
 extends abstractHtmlTagNode
detailsNode
 extends abstractHtmlTagNode
dfnNode
 extends abstractHtmlTagNode
dialogNode
 extends abstractHtmlTagNode
divNode
 extends abstractHtmlTagNode
dlNode
 extends abstractHtmlTagNode
dtNode
 extends abstractHtmlTagNode
emNode
 extends abstractHtmlTagNode
embedNode
 extends abstractHtmlTagNode
fieldsetNode
 extends abstractHtmlTagNode
figureNode
 extends abstractHtmlTagNode
footerNode
 extends abstractHtmlTagNode
formNode
 extends abstractHtmlTagNode
h1Node
 extends abstractHtmlTagNode
h2Node
 extends abstractHtmlTagNode
h3Node
 extends abstractHtmlTagNode
h4Node
 extends abstractHtmlTagNode
h5Node
 extends abstractHtmlTagNode
h6Node
 extends abstractHtmlTagNode
headNode
 extends abstractHtmlTagNode
headerNode
 extends abstractHtmlTagNode
hgroupNode
 extends abstractHtmlTagNode
hrNode
 extends abstractHtmlTagNode
htmlNode
 extends abstractHtmlTagNode
iNode
 extends abstractHtmlTagNode
iframeNode
 extends abstractHtmlTagNode
imgNode
 extends abstractHtmlTagNode
inputNode
 extends abstractHtmlTagNode
insNode
 extends abstractHtmlTagNode
kbdNode
 extends abstractHtmlTagNode
keygenNode
 extends abstractHtmlTagNode
labelNode
 extends abstractHtmlTagNode
legendNode
 extends abstractHtmlTagNode
liNode
 extends abstractHtmlTagNode
linkNode
 extends abstractHtmlTagNode
mainNode
 extends abstractHtmlTagNode
mapNode
 extends abstractHtmlTagNode
markNode
 extends abstractHtmlTagNode
menuNode
 extends abstractHtmlTagNode
menuitemNode
 extends abstractHtmlTagNode
metaNode
 extends abstractHtmlTagNode
meterNode
 extends abstractHtmlTagNode
navNode
 extends abstractHtmlTagNode
noscriptNode
 extends abstractHtmlTagNode
objectNode
 extends abstractHtmlTagNode
olNode
 extends abstractHtmlTagNode
optgroupNode
 extends abstractHtmlTagNode
optionNode
 extends abstractHtmlTagNode
outputNode
 extends abstractHtmlTagNode
pNode
 extends abstractHtmlTagNode
paramNode
 extends abstractHtmlTagNode
preNode
 extends abstractHtmlTagNode
progressNode
 extends abstractHtmlTagNode
qNode
 extends abstractHtmlTagNode
rbNode
 extends abstractHtmlTagNode
rpNode
 extends abstractHtmlTagNode
rtNode
 extends abstractHtmlTagNode
rtcNode
 extends abstractHtmlTagNode
rubyNode
 extends abstractHtmlTagNode
sNode
 extends abstractHtmlTagNode
sampNode
 extends abstractHtmlTagNode
scriptNode
 extends abstractHtmlTagNode
sectionNode
 extends abstractHtmlTagNode
selectNode
 extends abstractHtmlTagNode
smallNode
 extends abstractHtmlTagNode
sourceNode
 extends abstractHtmlTagNode
spanNode
 extends abstractHtmlTagNode
strongNode
 extends abstractHtmlTagNode
styleTagNode
 extends abstractHtmlTagNode
subNode
 extends abstractHtmlTagNode
summaryNode
 extends abstractHtmlTagNode
supNode
 extends abstractHtmlTagNode
tableNode
 extends abstractHtmlTagNode
tbodyNode
 extends abstractHtmlTagNode
tdNode
 extends abstractHtmlTagNode
templateNode
 extends abstractHtmlTagNode
textareaNode
 extends abstractHtmlTagNode
tfootNode
 extends abstractHtmlTagNode
thNode
 extends abstractHtmlTagNode
theadNode
 extends abstractHtmlTagNode
timeNode
 extends abstractHtmlTagNode
titleTagNode
 extends abstractHtmlTagNode
trNode
 extends abstractHtmlTagNode
trackNode
 extends abstractHtmlTagNode
uNode
 extends abstractHtmlTagNode
ulNode
 extends abstractHtmlTagNode
varNode
 match var
 extends abstractHtmlTagNode
videoNode
 extends abstractHtmlTagNode
wbrNode
 extends abstractHtmlTagNode
acceptNode
 extends abstractHtmlAttributeNode
accesskeyNode
 extends abstractHtmlAttributeNode
actionNode
 extends abstractHtmlAttributeNode
alignNode
 extends abstractHtmlAttributeNode
altNode
 extends abstractHtmlAttributeNode
asyncNode
 extends abstractHtmlAttributeNode
autocompleteNode
 extends abstractHtmlAttributeNode
autofocusNode
 extends abstractHtmlAttributeNode
autoplayNode
 extends abstractHtmlAttributeNode
bgcolorNode
 extends abstractHtmlAttributeNode
borderNode
 extends abstractHtmlAttributeNode
charsetNode
 extends abstractHtmlAttributeNode
checkedNode
 extends abstractHtmlAttributeNode
classNode
 match class
 extends abstractHtmlAttributeNode
colorNode
 extends abstractHtmlAttributeNode
colsNode
 extends abstractHtmlAttributeNode
colspanNode
 extends abstractHtmlAttributeNode
contentNode
 extends abstractHtmlAttributeNode
contenteditableNode
 extends abstractHtmlAttributeNode
controlsNode
 extends abstractHtmlAttributeNode
coordsNode
 extends abstractHtmlAttributeNode
datetimeNode
 extends abstractHtmlAttributeNode
defaultNode
 match default
 extends abstractHtmlAttributeNode
deferNode
 extends abstractHtmlAttributeNode
dirNode
 extends abstractHtmlAttributeNode
dirnameNode
 extends abstractHtmlAttributeNode
disabledNode
 extends abstractHtmlAttributeNode
downloadNode
 extends abstractHtmlAttributeNode
draggableNode
 extends abstractHtmlAttributeNode
dropzoneNode
 extends abstractHtmlAttributeNode
enctypeNode
 extends abstractHtmlAttributeNode
forNode
 match for
 extends abstractHtmlAttributeNode
formactionNode
 extends abstractHtmlAttributeNode
headersNode
 extends abstractHtmlAttributeNode
heightNode
 extends abstractHtmlAttributeNode
hiddenNode
 extends abstractHtmlAttributeNode
highNode
 extends abstractHtmlAttributeNode
hrefNode
 extends abstractHtmlAttributeNode
hreflangNode
 extends abstractHtmlAttributeNode
idNode
 extends abstractHtmlAttributeNode
ismapNode
 extends abstractHtmlAttributeNode
kindNode
 extends abstractHtmlAttributeNode
langNode
 extends abstractHtmlAttributeNode
listNode
 extends abstractHtmlAttributeNode
loopNode
 extends abstractHtmlAttributeNode
lowNode
 extends abstractHtmlAttributeNode
maxNode
 extends abstractHtmlAttributeNode
maxlengthNode
 extends abstractHtmlAttributeNode
mediaNode
 extends abstractHtmlAttributeNode
methodNode
 extends abstractHtmlAttributeNode
minNode
 extends abstractHtmlAttributeNode
multipleNode
 extends abstractHtmlAttributeNode
mutedNode
 extends abstractHtmlAttributeNode
nameNode
 extends abstractHtmlAttributeNode
novalidateNode
 extends abstractHtmlAttributeNode
onabortNode
 extends abstractHtmlAttributeNode
onafterprintNode
 extends abstractHtmlAttributeNode
onbeforeprintNode
 extends abstractHtmlAttributeNode
onbeforeunloadNode
 extends abstractHtmlAttributeNode
onblurNode
 extends abstractHtmlAttributeNode
oncanplayNode
 extends abstractHtmlAttributeNode
oncanplaythroughNode
 extends abstractHtmlAttributeNode
onchangeNode
 extends abstractHtmlAttributeNode
onclickNode
 extends abstractHtmlAttributeNode
oncontextmenuNode
 extends abstractHtmlAttributeNode
oncopyNode
 extends abstractHtmlAttributeNode
oncuechangeNode
 extends abstractHtmlAttributeNode
oncutNode
 extends abstractHtmlAttributeNode
ondblclickNode
 extends abstractHtmlAttributeNode
ondragNode
 extends abstractHtmlAttributeNode
ondragendNode
 extends abstractHtmlAttributeNode
ondragenterNode
 extends abstractHtmlAttributeNode
ondragleaveNode
 extends abstractHtmlAttributeNode
ondragoverNode
 extends abstractHtmlAttributeNode
ondragstartNode
 extends abstractHtmlAttributeNode
ondropNode
 extends abstractHtmlAttributeNode
ondurationchangeNode
 extends abstractHtmlAttributeNode
onemptiedNode
 extends abstractHtmlAttributeNode
onendedNode
 extends abstractHtmlAttributeNode
onerrorNode
 extends abstractHtmlAttributeNode
onfocusNode
 extends abstractHtmlAttributeNode
onhashchangeNode
 extends abstractHtmlAttributeNode
oninputNode
 extends abstractHtmlAttributeNode
oninvalidNode
 extends abstractHtmlAttributeNode
onkeydownNode
 extends abstractHtmlAttributeNode
onkeypressNode
 extends abstractHtmlAttributeNode
onkeyupNode
 extends abstractHtmlAttributeNode
onloadNode
 extends abstractHtmlAttributeNode
onloadeddataNode
 extends abstractHtmlAttributeNode
onloadedmetadataNode
 extends abstractHtmlAttributeNode
onloadstartNode
 extends abstractHtmlAttributeNode
onmousedownNode
 extends abstractHtmlAttributeNode
onmousemoveNode
 extends abstractHtmlAttributeNode
onmouseoutNode
 extends abstractHtmlAttributeNode
onmouseoverNode
 extends abstractHtmlAttributeNode
onmouseupNode
 extends abstractHtmlAttributeNode
onmousewheelNode
 extends abstractHtmlAttributeNode
onofflineNode
 extends abstractHtmlAttributeNode
ononlineNode
 extends abstractHtmlAttributeNode
onpagehideNode
 extends abstractHtmlAttributeNode
onpageshowNode
 extends abstractHtmlAttributeNode
onpasteNode
 extends abstractHtmlAttributeNode
onpauseNode
 extends abstractHtmlAttributeNode
onplayNode
 extends abstractHtmlAttributeNode
onplayingNode
 extends abstractHtmlAttributeNode
onpopstateNode
 extends abstractHtmlAttributeNode
onprogressNode
 extends abstractHtmlAttributeNode
onratechangeNode
 extends abstractHtmlAttributeNode
onresetNode
 extends abstractHtmlAttributeNode
onresizeNode
 extends abstractHtmlAttributeNode
onscrollNode
 extends abstractHtmlAttributeNode
onsearchNode
 extends abstractHtmlAttributeNode
onseekedNode
 extends abstractHtmlAttributeNode
onseekingNode
 extends abstractHtmlAttributeNode
onselectNode
 extends abstractHtmlAttributeNode
onstalledNode
 extends abstractHtmlAttributeNode
onstorageNode
 extends abstractHtmlAttributeNode
onsubmitNode
 extends abstractHtmlAttributeNode
onsuspendNode
 extends abstractHtmlAttributeNode
ontimeupdateNode
 extends abstractHtmlAttributeNode
ontoggleNode
 extends abstractHtmlAttributeNode
onunloadNode
 extends abstractHtmlAttributeNode
onvolumechangeNode
 extends abstractHtmlAttributeNode
onwaitingNode
 extends abstractHtmlAttributeNode
onwheelNode
 extends abstractHtmlAttributeNode
openNode
 extends abstractHtmlAttributeNode
optimumNode
 extends abstractHtmlAttributeNode
patternNode
 extends abstractHtmlAttributeNode
placeholderNode
 extends abstractHtmlAttributeNode
posterNode
 extends abstractHtmlAttributeNode
preloadNode
 extends abstractHtmlAttributeNode
readonlyNode
 extends abstractHtmlAttributeNode
relNode
 extends abstractHtmlAttributeNode
requiredNode
 extends abstractHtmlAttributeNode
reversedNode
 extends abstractHtmlAttributeNode
rowsNode
 extends abstractHtmlAttributeNode
rowspanNode
 extends abstractHtmlAttributeNode
sandboxNode
 extends abstractHtmlAttributeNode
scopeNode
 extends abstractHtmlAttributeNode
selectedNode
 extends abstractHtmlAttributeNode
shapeNode
 extends abstractHtmlAttributeNode
sizeNode
 extends abstractHtmlAttributeNode
sizesNode
 extends abstractHtmlAttributeNode
spellcheckNode
 extends abstractHtmlAttributeNode
srcNode
 extends abstractHtmlAttributeNode
srcdocNode
 extends abstractHtmlAttributeNode
srclangNode
 extends abstractHtmlAttributeNode
srcsetNode
 extends abstractHtmlAttributeNode
startNode
 extends abstractHtmlAttributeNode
stepNode
 extends abstractHtmlAttributeNode
acceptCharsetNode
 match accept-charset
 extends abstractHtmlAttributeNode
httpEquivNode
 match http-equiv
 extends abstractHtmlAttributeNode
styleNode
 extends abstractHtmlAttributeNode
tabindexNode
 extends abstractHtmlAttributeNode
targetNode
 extends abstractHtmlAttributeNode
titleNode
 extends abstractHtmlAttributeNode
translateNode
 extends abstractHtmlAttributeNode
typeNode
 extends abstractHtmlAttributeNode
usemapNode
 extends abstractHtmlAttributeNode
valueNode
 extends abstractHtmlAttributeNode
widthNode
 extends abstractHtmlAttributeNode
wrapNode
 extends abstractHtmlAttributeNode
stumpExtendedAttributeNode
 abstract
 description Node types not present in HTML but included in stump.
 extends abstractHtmlAttributeNode
stumpNoOpNode
 extends stumpExtendedAttributeNode
stumpStyleForNode
 extends stumpExtendedAttributeNode
stumpOnBlurCommandNode
 extends stumpExtendedAttributeNode
stumpOnLineClickNode
 extends stumpExtendedAttributeNode
stumpOnLineShiftClickNode
 extends stumpExtendedAttributeNode
stumpOnClickCommandNode
 extends stumpExtendedAttributeNode
stumpOnContextMenuCommandNode
 extends stumpExtendedAttributeNode
stumpOnChangeCommandNode
 extends stumpExtendedAttributeNode
stumpOnDblClickCommandNode
 extends stumpExtendedAttributeNode
stumpCollapseNode
 extends stumpExtendedAttributeNode`)
      return this._cachedGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        stumpNode: stumpNode,
        abstractHtmlTagNode: abstractHtmlTagNode,
        errorNode: errorNode,
        abstractHtmlAttributeNode: abstractHtmlAttributeNode,
        lineOfHtmlContentNode: lineOfHtmlContentNode,
        bernNode: bernNode,
        aNode: aNode,
        abbrNode: abbrNode,
        addressNode: addressNode,
        areaNode: areaNode,
        articleNode: articleNode,
        asideNode: asideNode,
        bNode: bNode,
        baseNode: baseNode,
        bdiNode: bdiNode,
        bdoNode: bdoNode,
        blockquoteNode: blockquoteNode,
        bodyNode: bodyNode,
        brNode: brNode,
        buttonNode: buttonNode,
        canvasNode: canvasNode,
        captionNode: captionNode,
        codeNode: codeNode,
        colNode: colNode,
        colgroupNode: colgroupNode,
        datalistNode: datalistNode,
        ddNode: ddNode,
        delNode: delNode,
        detailsNode: detailsNode,
        dfnNode: dfnNode,
        dialogNode: dialogNode,
        divNode: divNode,
        dlNode: dlNode,
        dtNode: dtNode,
        emNode: emNode,
        embedNode: embedNode,
        fieldsetNode: fieldsetNode,
        figureNode: figureNode,
        footerNode: footerNode,
        formNode: formNode,
        h1Node: h1Node,
        h2Node: h2Node,
        h3Node: h3Node,
        h4Node: h4Node,
        h5Node: h5Node,
        h6Node: h6Node,
        headNode: headNode,
        headerNode: headerNode,
        hgroupNode: hgroupNode,
        hrNode: hrNode,
        htmlNode: htmlNode,
        iNode: iNode,
        iframeNode: iframeNode,
        imgNode: imgNode,
        inputNode: inputNode,
        insNode: insNode,
        kbdNode: kbdNode,
        keygenNode: keygenNode,
        labelNode: labelNode,
        legendNode: legendNode,
        liNode: liNode,
        linkNode: linkNode,
        mainNode: mainNode,
        mapNode: mapNode,
        markNode: markNode,
        menuNode: menuNode,
        menuitemNode: menuitemNode,
        metaNode: metaNode,
        meterNode: meterNode,
        navNode: navNode,
        noscriptNode: noscriptNode,
        objectNode: objectNode,
        olNode: olNode,
        optgroupNode: optgroupNode,
        optionNode: optionNode,
        outputNode: outputNode,
        pNode: pNode,
        paramNode: paramNode,
        preNode: preNode,
        progressNode: progressNode,
        qNode: qNode,
        rbNode: rbNode,
        rpNode: rpNode,
        rtNode: rtNode,
        rtcNode: rtcNode,
        rubyNode: rubyNode,
        sNode: sNode,
        sampNode: sampNode,
        scriptNode: scriptNode,
        sectionNode: sectionNode,
        selectNode: selectNode,
        smallNode: smallNode,
        sourceNode: sourceNode,
        spanNode: spanNode,
        strongNode: strongNode,
        styleTagNode: styleTagNode,
        subNode: subNode,
        summaryNode: summaryNode,
        supNode: supNode,
        tableNode: tableNode,
        tbodyNode: tbodyNode,
        tdNode: tdNode,
        templateNode: templateNode,
        textareaNode: textareaNode,
        tfootNode: tfootNode,
        thNode: thNode,
        theadNode: theadNode,
        timeNode: timeNode,
        titleTagNode: titleTagNode,
        trNode: trNode,
        trackNode: trackNode,
        uNode: uNode,
        ulNode: ulNode,
        varNode: varNode,
        videoNode: videoNode,
        wbrNode: wbrNode,
        acceptNode: acceptNode,
        accesskeyNode: accesskeyNode,
        actionNode: actionNode,
        alignNode: alignNode,
        altNode: altNode,
        asyncNode: asyncNode,
        autocompleteNode: autocompleteNode,
        autofocusNode: autofocusNode,
        autoplayNode: autoplayNode,
        bgcolorNode: bgcolorNode,
        borderNode: borderNode,
        charsetNode: charsetNode,
        checkedNode: checkedNode,
        classNode: classNode,
        colorNode: colorNode,
        colsNode: colsNode,
        colspanNode: colspanNode,
        contentNode: contentNode,
        contenteditableNode: contenteditableNode,
        controlsNode: controlsNode,
        coordsNode: coordsNode,
        datetimeNode: datetimeNode,
        defaultNode: defaultNode,
        deferNode: deferNode,
        dirNode: dirNode,
        dirnameNode: dirnameNode,
        disabledNode: disabledNode,
        downloadNode: downloadNode,
        draggableNode: draggableNode,
        dropzoneNode: dropzoneNode,
        enctypeNode: enctypeNode,
        forNode: forNode,
        formactionNode: formactionNode,
        headersNode: headersNode,
        heightNode: heightNode,
        hiddenNode: hiddenNode,
        highNode: highNode,
        hrefNode: hrefNode,
        hreflangNode: hreflangNode,
        idNode: idNode,
        ismapNode: ismapNode,
        kindNode: kindNode,
        langNode: langNode,
        listNode: listNode,
        loopNode: loopNode,
        lowNode: lowNode,
        maxNode: maxNode,
        maxlengthNode: maxlengthNode,
        mediaNode: mediaNode,
        methodNode: methodNode,
        minNode: minNode,
        multipleNode: multipleNode,
        mutedNode: mutedNode,
        nameNode: nameNode,
        novalidateNode: novalidateNode,
        onabortNode: onabortNode,
        onafterprintNode: onafterprintNode,
        onbeforeprintNode: onbeforeprintNode,
        onbeforeunloadNode: onbeforeunloadNode,
        onblurNode: onblurNode,
        oncanplayNode: oncanplayNode,
        oncanplaythroughNode: oncanplaythroughNode,
        onchangeNode: onchangeNode,
        onclickNode: onclickNode,
        oncontextmenuNode: oncontextmenuNode,
        oncopyNode: oncopyNode,
        oncuechangeNode: oncuechangeNode,
        oncutNode: oncutNode,
        ondblclickNode: ondblclickNode,
        ondragNode: ondragNode,
        ondragendNode: ondragendNode,
        ondragenterNode: ondragenterNode,
        ondragleaveNode: ondragleaveNode,
        ondragoverNode: ondragoverNode,
        ondragstartNode: ondragstartNode,
        ondropNode: ondropNode,
        ondurationchangeNode: ondurationchangeNode,
        onemptiedNode: onemptiedNode,
        onendedNode: onendedNode,
        onerrorNode: onerrorNode,
        onfocusNode: onfocusNode,
        onhashchangeNode: onhashchangeNode,
        oninputNode: oninputNode,
        oninvalidNode: oninvalidNode,
        onkeydownNode: onkeydownNode,
        onkeypressNode: onkeypressNode,
        onkeyupNode: onkeyupNode,
        onloadNode: onloadNode,
        onloadeddataNode: onloadeddataNode,
        onloadedmetadataNode: onloadedmetadataNode,
        onloadstartNode: onloadstartNode,
        onmousedownNode: onmousedownNode,
        onmousemoveNode: onmousemoveNode,
        onmouseoutNode: onmouseoutNode,
        onmouseoverNode: onmouseoverNode,
        onmouseupNode: onmouseupNode,
        onmousewheelNode: onmousewheelNode,
        onofflineNode: onofflineNode,
        ononlineNode: ononlineNode,
        onpagehideNode: onpagehideNode,
        onpageshowNode: onpageshowNode,
        onpasteNode: onpasteNode,
        onpauseNode: onpauseNode,
        onplayNode: onplayNode,
        onplayingNode: onplayingNode,
        onpopstateNode: onpopstateNode,
        onprogressNode: onprogressNode,
        onratechangeNode: onratechangeNode,
        onresetNode: onresetNode,
        onresizeNode: onresizeNode,
        onscrollNode: onscrollNode,
        onsearchNode: onsearchNode,
        onseekedNode: onseekedNode,
        onseekingNode: onseekingNode,
        onselectNode: onselectNode,
        onstalledNode: onstalledNode,
        onstorageNode: onstorageNode,
        onsubmitNode: onsubmitNode,
        onsuspendNode: onsuspendNode,
        ontimeupdateNode: ontimeupdateNode,
        ontoggleNode: ontoggleNode,
        onunloadNode: onunloadNode,
        onvolumechangeNode: onvolumechangeNode,
        onwaitingNode: onwaitingNode,
        onwheelNode: onwheelNode,
        openNode: openNode,
        optimumNode: optimumNode,
        patternNode: patternNode,
        placeholderNode: placeholderNode,
        posterNode: posterNode,
        preloadNode: preloadNode,
        readonlyNode: readonlyNode,
        relNode: relNode,
        requiredNode: requiredNode,
        reversedNode: reversedNode,
        rowsNode: rowsNode,
        rowspanNode: rowspanNode,
        sandboxNode: sandboxNode,
        scopeNode: scopeNode,
        selectedNode: selectedNode,
        shapeNode: shapeNode,
        sizeNode: sizeNode,
        sizesNode: sizesNode,
        spellcheckNode: spellcheckNode,
        srcNode: srcNode,
        srcdocNode: srcdocNode,
        srclangNode: srclangNode,
        srcsetNode: srcsetNode,
        startNode: startNode,
        stepNode: stepNode,
        acceptCharsetNode: acceptCharsetNode,
        httpEquivNode: httpEquivNode,
        styleNode: styleNode,
        tabindexNode: tabindexNode,
        targetNode: targetNode,
        titleNode: titleNode,
        translateNode: translateNode,
        typeNode: typeNode,
        usemapNode: usemapNode,
        valueNode: valueNode,
        widthNode: widthNode,
        wrapNode: wrapNode,
        stumpExtendedAttributeNode: stumpExtendedAttributeNode,
        stumpNoOpNode: stumpNoOpNode,
        stumpStyleForNode: stumpStyleForNode,
        stumpOnBlurCommandNode: stumpOnBlurCommandNode,
        stumpOnLineClickNode: stumpOnLineClickNode,
        stumpOnLineShiftClickNode: stumpOnLineShiftClickNode,
        stumpOnClickCommandNode: stumpOnClickCommandNode,
        stumpOnContextMenuCommandNode: stumpOnContextMenuCommandNode,
        stumpOnChangeCommandNode: stumpOnChangeCommandNode,
        stumpOnDblClickCommandNode: stumpOnDblClickCommandNode,
        stumpCollapseNode: stumpCollapseNode
      }
    }
  }

  class abstractHtmlTagNode extends jtree.GrammarBackedNonRootNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        undefined,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMap()), {
          bern: bernNode,
          a: aNode,
          abbr: abbrNode,
          address: addressNode,
          area: areaNode,
          article: articleNode,
          aside: asideNode,
          b: bNode,
          base: baseNode,
          bdi: bdiNode,
          bdo: bdoNode,
          blockquote: blockquoteNode,
          body: bodyNode,
          br: brNode,
          button: buttonNode,
          canvas: canvasNode,
          caption: captionNode,
          code: codeNode,
          col: colNode,
          colgroup: colgroupNode,
          datalist: datalistNode,
          dd: ddNode,
          del: delNode,
          details: detailsNode,
          dfn: dfnNode,
          dialog: dialogNode,
          div: divNode,
          dl: dlNode,
          dt: dtNode,
          em: emNode,
          embed: embedNode,
          fieldset: fieldsetNode,
          figure: figureNode,
          footer: footerNode,
          form: formNode,
          h1: h1Node,
          h2: h2Node,
          h3: h3Node,
          h4: h4Node,
          h5: h5Node,
          h6: h6Node,
          head: headNode,
          header: headerNode,
          hgroup: hgroupNode,
          hr: hrNode,
          html: htmlNode,
          i: iNode,
          iframe: iframeNode,
          img: imgNode,
          input: inputNode,
          ins: insNode,
          kbd: kbdNode,
          keygen: keygenNode,
          label: labelNode,
          legend: legendNode,
          li: liNode,
          link: linkNode,
          main: mainNode,
          map: mapNode,
          mark: markNode,
          menu: menuNode,
          menuitem: menuitemNode,
          meta: metaNode,
          meter: meterNode,
          nav: navNode,
          noscript: noscriptNode,
          object: objectNode,
          ol: olNode,
          optgroup: optgroupNode,
          option: optionNode,
          output: outputNode,
          p: pNode,
          param: paramNode,
          pre: preNode,
          progress: progressNode,
          q: qNode,
          rb: rbNode,
          rp: rpNode,
          rt: rtNode,
          rtc: rtcNode,
          ruby: rubyNode,
          s: sNode,
          samp: sampNode,
          script: scriptNode,
          section: sectionNode,
          select: selectNode,
          small: smallNode,
          source: sourceNode,
          span: spanNode,
          strong: strongNode,
          styleTag: styleTagNode,
          sub: subNode,
          summary: summaryNode,
          sup: supNode,
          table: tableNode,
          tbody: tbodyNode,
          td: tdNode,
          template: templateNode,
          textarea: textareaNode,
          tfoot: tfootNode,
          th: thNode,
          thead: theadNode,
          time: timeNode,
          titleTag: titleTagNode,
          tr: trNode,
          track: trackNode,
          u: uNode,
          ul: ulNode,
          var: varNode,
          video: videoNode,
          wbr: wbrNode,
          accept: acceptNode,
          accesskey: accesskeyNode,
          action: actionNode,
          align: alignNode,
          alt: altNode,
          async: asyncNode,
          autocomplete: autocompleteNode,
          autofocus: autofocusNode,
          autoplay: autoplayNode,
          bgcolor: bgcolorNode,
          border: borderNode,
          charset: charsetNode,
          checked: checkedNode,
          class: classNode,
          color: colorNode,
          cols: colsNode,
          colspan: colspanNode,
          content: contentNode,
          contenteditable: contenteditableNode,
          controls: controlsNode,
          coords: coordsNode,
          datetime: datetimeNode,
          default: defaultNode,
          defer: deferNode,
          dir: dirNode,
          dirname: dirnameNode,
          disabled: disabledNode,
          download: downloadNode,
          draggable: draggableNode,
          dropzone: dropzoneNode,
          enctype: enctypeNode,
          for: forNode,
          formaction: formactionNode,
          headers: headersNode,
          height: heightNode,
          hidden: hiddenNode,
          high: highNode,
          href: hrefNode,
          hreflang: hreflangNode,
          id: idNode,
          ismap: ismapNode,
          kind: kindNode,
          lang: langNode,
          list: listNode,
          loop: loopNode,
          low: lowNode,
          max: maxNode,
          maxlength: maxlengthNode,
          media: mediaNode,
          method: methodNode,
          min: minNode,
          multiple: multipleNode,
          muted: mutedNode,
          name: nameNode,
          novalidate: novalidateNode,
          onabort: onabortNode,
          onafterprint: onafterprintNode,
          onbeforeprint: onbeforeprintNode,
          onbeforeunload: onbeforeunloadNode,
          onblur: onblurNode,
          oncanplay: oncanplayNode,
          oncanplaythrough: oncanplaythroughNode,
          onchange: onchangeNode,
          onclick: onclickNode,
          oncontextmenu: oncontextmenuNode,
          oncopy: oncopyNode,
          oncuechange: oncuechangeNode,
          oncut: oncutNode,
          ondblclick: ondblclickNode,
          ondrag: ondragNode,
          ondragend: ondragendNode,
          ondragenter: ondragenterNode,
          ondragleave: ondragleaveNode,
          ondragover: ondragoverNode,
          ondragstart: ondragstartNode,
          ondrop: ondropNode,
          ondurationchange: ondurationchangeNode,
          onemptied: onemptiedNode,
          onended: onendedNode,
          onerror: onerrorNode,
          onfocus: onfocusNode,
          onhashchange: onhashchangeNode,
          oninput: oninputNode,
          oninvalid: oninvalidNode,
          onkeydown: onkeydownNode,
          onkeypress: onkeypressNode,
          onkeyup: onkeyupNode,
          onload: onloadNode,
          onloadeddata: onloadeddataNode,
          onloadedmetadata: onloadedmetadataNode,
          onloadstart: onloadstartNode,
          onmousedown: onmousedownNode,
          onmousemove: onmousemoveNode,
          onmouseout: onmouseoutNode,
          onmouseover: onmouseoverNode,
          onmouseup: onmouseupNode,
          onmousewheel: onmousewheelNode,
          onoffline: onofflineNode,
          ononline: ononlineNode,
          onpagehide: onpagehideNode,
          onpageshow: onpageshowNode,
          onpaste: onpasteNode,
          onpause: onpauseNode,
          onplay: onplayNode,
          onplaying: onplayingNode,
          onpopstate: onpopstateNode,
          onprogress: onprogressNode,
          onratechange: onratechangeNode,
          onreset: onresetNode,
          onresize: onresizeNode,
          onscroll: onscrollNode,
          onsearch: onsearchNode,
          onseeked: onseekedNode,
          onseeking: onseekingNode,
          onselect: onselectNode,
          onstalled: onstalledNode,
          onstorage: onstorageNode,
          onsubmit: onsubmitNode,
          onsuspend: onsuspendNode,
          ontimeupdate: ontimeupdateNode,
          ontoggle: ontoggleNode,
          onunload: onunloadNode,
          onvolumechange: onvolumechangeNode,
          onwaiting: onwaitingNode,
          onwheel: onwheelNode,
          open: openNode,
          optimum: optimumNode,
          pattern: patternNode,
          placeholder: placeholderNode,
          poster: posterNode,
          preload: preloadNode,
          readonly: readonlyNode,
          rel: relNode,
          required: requiredNode,
          reversed: reversedNode,
          rows: rowsNode,
          rowspan: rowspanNode,
          sandbox: sandboxNode,
          scope: scopeNode,
          selected: selectedNode,
          shape: shapeNode,
          size: sizeNode,
          sizes: sizesNode,
          spellcheck: spellcheckNode,
          src: srcNode,
          srcdoc: srcdocNode,
          srclang: srclangNode,
          srcset: srcsetNode,
          start: startNode,
          step: stepNode,
          "accept-charset": acceptCharsetNode,
          "http-equiv": httpEquivNode,
          style: styleNode,
          tabindex: tabindexNode,
          target: targetNode,
          title: titleNode,
          translate: translateNode,
          type: typeNode,
          usemap: usemapNode,
          value: valueNode,
          width: widthNode,
          wrap: wrapNode,
          stumpNoOp: stumpNoOpNode,
          stumpStyleFor: stumpStyleForNode,
          stumpOnBlurCommand: stumpOnBlurCommandNode,
          stumpOnLineClick: stumpOnLineClickNode,
          stumpOnLineShiftClick: stumpOnLineShiftClickNode,
          stumpOnClickCommand: stumpOnClickCommandNode,
          stumpOnContextMenuCommand: stumpOnContextMenuCommandNode,
          stumpOnChangeCommand: stumpOnChangeCommandNode,
          stumpOnDblClickCommand: stumpOnDblClickCommandNode,
          stumpCollapse: stumpCollapseNode
        }),
        undefined
      )
    }
    get anyHtmlContentCell() {
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
      const indentForChildNodes = !collapse && this.getChildInstancesOfNodeTypeId("abstractHtmlTagNode").length > 0
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
      const stumpNodeIndex = this.getChildInstancesOfNodeTypeId("abstractHtmlTagNode").indexOf(newNode)
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
      return this.getTopDownArray().filter(node => node.doesExtend("abstractHtmlTagNode") && node.getFirstWord() === firstWord)
    }
    hasLine(line) {
      return this.getChildren().some(node => node.getLine() === line)
    }
    findStumpNodesByChild(line) {
      return this.getTopDownArray().filter(node => node.doesExtend("abstractHtmlTagNode") && node.hasLine(line))
    }
    findStumpNodesWithClass(className) {
      return this.getTopDownArray().filter(
        node =>
          node.doesExtend("abstractHtmlTagNode") &&
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

  class abstractHtmlAttributeNode extends jtree.GrammarBackedNonRootNode {
    createParser() {
      return new jtree.TreeNode.Parser(errorNode, undefined, undefined)
    }
    get attributeValueCell() {
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

  class lineOfHtmlContentNode extends jtree.GrammarBackedNonRootNode {
    createParser() {
      return new jtree.TreeNode.Parser(lineOfHtmlContentNode, undefined, undefined)
    }
    get anyHtmlContentCell() {
      return this.getWordsFrom(1)
    }
  }

  class bernNode extends jtree.GrammarBackedNonRootNode {
    createParser() {
      return new jtree.TreeNode.Parser(lineOfHtmlContentNode, undefined, undefined)
    }
    _toHtml() {
      return this.childrenToString()
    }
  }

  class aNode extends abstractHtmlTagNode {}

  class abbrNode extends abstractHtmlTagNode {}

  class addressNode extends abstractHtmlTagNode {}

  class areaNode extends abstractHtmlTagNode {}

  class articleNode extends abstractHtmlTagNode {}

  class asideNode extends abstractHtmlTagNode {}

  class bNode extends abstractHtmlTagNode {}

  class baseNode extends abstractHtmlTagNode {}

  class bdiNode extends abstractHtmlTagNode {}

  class bdoNode extends abstractHtmlTagNode {}

  class blockquoteNode extends abstractHtmlTagNode {}

  class bodyNode extends abstractHtmlTagNode {}

  class brNode extends abstractHtmlTagNode {}

  class buttonNode extends abstractHtmlTagNode {}

  class canvasNode extends abstractHtmlTagNode {}

  class captionNode extends abstractHtmlTagNode {}

  class codeNode extends abstractHtmlTagNode {}

  class colNode extends abstractHtmlTagNode {}

  class colgroupNode extends abstractHtmlTagNode {}

  class datalistNode extends abstractHtmlTagNode {}

  class ddNode extends abstractHtmlTagNode {}

  class delNode extends abstractHtmlTagNode {}

  class detailsNode extends abstractHtmlTagNode {}

  class dfnNode extends abstractHtmlTagNode {}

  class dialogNode extends abstractHtmlTagNode {}

  class divNode extends abstractHtmlTagNode {}

  class dlNode extends abstractHtmlTagNode {}

  class dtNode extends abstractHtmlTagNode {}

  class emNode extends abstractHtmlTagNode {}

  class embedNode extends abstractHtmlTagNode {}

  class fieldsetNode extends abstractHtmlTagNode {}

  class figureNode extends abstractHtmlTagNode {}

  class footerNode extends abstractHtmlTagNode {}

  class formNode extends abstractHtmlTagNode {}

  class h1Node extends abstractHtmlTagNode {}

  class h2Node extends abstractHtmlTagNode {}

  class h3Node extends abstractHtmlTagNode {}

  class h4Node extends abstractHtmlTagNode {}

  class h5Node extends abstractHtmlTagNode {}

  class h6Node extends abstractHtmlTagNode {}

  class headNode extends abstractHtmlTagNode {}

  class headerNode extends abstractHtmlTagNode {}

  class hgroupNode extends abstractHtmlTagNode {}

  class hrNode extends abstractHtmlTagNode {}

  class htmlNode extends abstractHtmlTagNode {}

  class iNode extends abstractHtmlTagNode {}

  class iframeNode extends abstractHtmlTagNode {}

  class imgNode extends abstractHtmlTagNode {}

  class inputNode extends abstractHtmlTagNode {}

  class insNode extends abstractHtmlTagNode {}

  class kbdNode extends abstractHtmlTagNode {}

  class keygenNode extends abstractHtmlTagNode {}

  class labelNode extends abstractHtmlTagNode {}

  class legendNode extends abstractHtmlTagNode {}

  class liNode extends abstractHtmlTagNode {}

  class linkNode extends abstractHtmlTagNode {}

  class mainNode extends abstractHtmlTagNode {}

  class mapNode extends abstractHtmlTagNode {}

  class markNode extends abstractHtmlTagNode {}

  class menuNode extends abstractHtmlTagNode {}

  class menuitemNode extends abstractHtmlTagNode {}

  class metaNode extends abstractHtmlTagNode {}

  class meterNode extends abstractHtmlTagNode {}

  class navNode extends abstractHtmlTagNode {}

  class noscriptNode extends abstractHtmlTagNode {}

  class objectNode extends abstractHtmlTagNode {}

  class olNode extends abstractHtmlTagNode {}

  class optgroupNode extends abstractHtmlTagNode {}

  class optionNode extends abstractHtmlTagNode {}

  class outputNode extends abstractHtmlTagNode {}

  class pNode extends abstractHtmlTagNode {}

  class paramNode extends abstractHtmlTagNode {}

  class preNode extends abstractHtmlTagNode {}

  class progressNode extends abstractHtmlTagNode {}

  class qNode extends abstractHtmlTagNode {}

  class rbNode extends abstractHtmlTagNode {}

  class rpNode extends abstractHtmlTagNode {}

  class rtNode extends abstractHtmlTagNode {}

  class rtcNode extends abstractHtmlTagNode {}

  class rubyNode extends abstractHtmlTagNode {}

  class sNode extends abstractHtmlTagNode {}

  class sampNode extends abstractHtmlTagNode {}

  class scriptNode extends abstractHtmlTagNode {}

  class sectionNode extends abstractHtmlTagNode {}

  class selectNode extends abstractHtmlTagNode {}

  class smallNode extends abstractHtmlTagNode {}

  class sourceNode extends abstractHtmlTagNode {}

  class spanNode extends abstractHtmlTagNode {}

  class strongNode extends abstractHtmlTagNode {}

  class styleTagNode extends abstractHtmlTagNode {}

  class subNode extends abstractHtmlTagNode {}

  class summaryNode extends abstractHtmlTagNode {}

  class supNode extends abstractHtmlTagNode {}

  class tableNode extends abstractHtmlTagNode {}

  class tbodyNode extends abstractHtmlTagNode {}

  class tdNode extends abstractHtmlTagNode {}

  class templateNode extends abstractHtmlTagNode {}

  class textareaNode extends abstractHtmlTagNode {}

  class tfootNode extends abstractHtmlTagNode {}

  class thNode extends abstractHtmlTagNode {}

  class theadNode extends abstractHtmlTagNode {}

  class timeNode extends abstractHtmlTagNode {}

  class titleTagNode extends abstractHtmlTagNode {}

  class trNode extends abstractHtmlTagNode {}

  class trackNode extends abstractHtmlTagNode {}

  class uNode extends abstractHtmlTagNode {}

  class ulNode extends abstractHtmlTagNode {}

  class varNode extends abstractHtmlTagNode {}

  class videoNode extends abstractHtmlTagNode {}

  class wbrNode extends abstractHtmlTagNode {}

  class acceptNode extends abstractHtmlAttributeNode {}

  class accesskeyNode extends abstractHtmlAttributeNode {}

  class actionNode extends abstractHtmlAttributeNode {}

  class alignNode extends abstractHtmlAttributeNode {}

  class altNode extends abstractHtmlAttributeNode {}

  class asyncNode extends abstractHtmlAttributeNode {}

  class autocompleteNode extends abstractHtmlAttributeNode {}

  class autofocusNode extends abstractHtmlAttributeNode {}

  class autoplayNode extends abstractHtmlAttributeNode {}

  class bgcolorNode extends abstractHtmlAttributeNode {}

  class borderNode extends abstractHtmlAttributeNode {}

  class charsetNode extends abstractHtmlAttributeNode {}

  class checkedNode extends abstractHtmlAttributeNode {}

  class classNode extends abstractHtmlAttributeNode {}

  class colorNode extends abstractHtmlAttributeNode {}

  class colsNode extends abstractHtmlAttributeNode {}

  class colspanNode extends abstractHtmlAttributeNode {}

  class contentNode extends abstractHtmlAttributeNode {}

  class contenteditableNode extends abstractHtmlAttributeNode {}

  class controlsNode extends abstractHtmlAttributeNode {}

  class coordsNode extends abstractHtmlAttributeNode {}

  class datetimeNode extends abstractHtmlAttributeNode {}

  class defaultNode extends abstractHtmlAttributeNode {}

  class deferNode extends abstractHtmlAttributeNode {}

  class dirNode extends abstractHtmlAttributeNode {}

  class dirnameNode extends abstractHtmlAttributeNode {}

  class disabledNode extends abstractHtmlAttributeNode {}

  class downloadNode extends abstractHtmlAttributeNode {}

  class draggableNode extends abstractHtmlAttributeNode {}

  class dropzoneNode extends abstractHtmlAttributeNode {}

  class enctypeNode extends abstractHtmlAttributeNode {}

  class forNode extends abstractHtmlAttributeNode {}

  class formactionNode extends abstractHtmlAttributeNode {}

  class headersNode extends abstractHtmlAttributeNode {}

  class heightNode extends abstractHtmlAttributeNode {}

  class hiddenNode extends abstractHtmlAttributeNode {}

  class highNode extends abstractHtmlAttributeNode {}

  class hrefNode extends abstractHtmlAttributeNode {}

  class hreflangNode extends abstractHtmlAttributeNode {}

  class idNode extends abstractHtmlAttributeNode {}

  class ismapNode extends abstractHtmlAttributeNode {}

  class kindNode extends abstractHtmlAttributeNode {}

  class langNode extends abstractHtmlAttributeNode {}

  class listNode extends abstractHtmlAttributeNode {}

  class loopNode extends abstractHtmlAttributeNode {}

  class lowNode extends abstractHtmlAttributeNode {}

  class maxNode extends abstractHtmlAttributeNode {}

  class maxlengthNode extends abstractHtmlAttributeNode {}

  class mediaNode extends abstractHtmlAttributeNode {}

  class methodNode extends abstractHtmlAttributeNode {}

  class minNode extends abstractHtmlAttributeNode {}

  class multipleNode extends abstractHtmlAttributeNode {}

  class mutedNode extends abstractHtmlAttributeNode {}

  class nameNode extends abstractHtmlAttributeNode {}

  class novalidateNode extends abstractHtmlAttributeNode {}

  class onabortNode extends abstractHtmlAttributeNode {}

  class onafterprintNode extends abstractHtmlAttributeNode {}

  class onbeforeprintNode extends abstractHtmlAttributeNode {}

  class onbeforeunloadNode extends abstractHtmlAttributeNode {}

  class onblurNode extends abstractHtmlAttributeNode {}

  class oncanplayNode extends abstractHtmlAttributeNode {}

  class oncanplaythroughNode extends abstractHtmlAttributeNode {}

  class onchangeNode extends abstractHtmlAttributeNode {}

  class onclickNode extends abstractHtmlAttributeNode {}

  class oncontextmenuNode extends abstractHtmlAttributeNode {}

  class oncopyNode extends abstractHtmlAttributeNode {}

  class oncuechangeNode extends abstractHtmlAttributeNode {}

  class oncutNode extends abstractHtmlAttributeNode {}

  class ondblclickNode extends abstractHtmlAttributeNode {}

  class ondragNode extends abstractHtmlAttributeNode {}

  class ondragendNode extends abstractHtmlAttributeNode {}

  class ondragenterNode extends abstractHtmlAttributeNode {}

  class ondragleaveNode extends abstractHtmlAttributeNode {}

  class ondragoverNode extends abstractHtmlAttributeNode {}

  class ondragstartNode extends abstractHtmlAttributeNode {}

  class ondropNode extends abstractHtmlAttributeNode {}

  class ondurationchangeNode extends abstractHtmlAttributeNode {}

  class onemptiedNode extends abstractHtmlAttributeNode {}

  class onendedNode extends abstractHtmlAttributeNode {}

  class onerrorNode extends abstractHtmlAttributeNode {}

  class onfocusNode extends abstractHtmlAttributeNode {}

  class onhashchangeNode extends abstractHtmlAttributeNode {}

  class oninputNode extends abstractHtmlAttributeNode {}

  class oninvalidNode extends abstractHtmlAttributeNode {}

  class onkeydownNode extends abstractHtmlAttributeNode {}

  class onkeypressNode extends abstractHtmlAttributeNode {}

  class onkeyupNode extends abstractHtmlAttributeNode {}

  class onloadNode extends abstractHtmlAttributeNode {}

  class onloadeddataNode extends abstractHtmlAttributeNode {}

  class onloadedmetadataNode extends abstractHtmlAttributeNode {}

  class onloadstartNode extends abstractHtmlAttributeNode {}

  class onmousedownNode extends abstractHtmlAttributeNode {}

  class onmousemoveNode extends abstractHtmlAttributeNode {}

  class onmouseoutNode extends abstractHtmlAttributeNode {}

  class onmouseoverNode extends abstractHtmlAttributeNode {}

  class onmouseupNode extends abstractHtmlAttributeNode {}

  class onmousewheelNode extends abstractHtmlAttributeNode {}

  class onofflineNode extends abstractHtmlAttributeNode {}

  class ononlineNode extends abstractHtmlAttributeNode {}

  class onpagehideNode extends abstractHtmlAttributeNode {}

  class onpageshowNode extends abstractHtmlAttributeNode {}

  class onpasteNode extends abstractHtmlAttributeNode {}

  class onpauseNode extends abstractHtmlAttributeNode {}

  class onplayNode extends abstractHtmlAttributeNode {}

  class onplayingNode extends abstractHtmlAttributeNode {}

  class onpopstateNode extends abstractHtmlAttributeNode {}

  class onprogressNode extends abstractHtmlAttributeNode {}

  class onratechangeNode extends abstractHtmlAttributeNode {}

  class onresetNode extends abstractHtmlAttributeNode {}

  class onresizeNode extends abstractHtmlAttributeNode {}

  class onscrollNode extends abstractHtmlAttributeNode {}

  class onsearchNode extends abstractHtmlAttributeNode {}

  class onseekedNode extends abstractHtmlAttributeNode {}

  class onseekingNode extends abstractHtmlAttributeNode {}

  class onselectNode extends abstractHtmlAttributeNode {}

  class onstalledNode extends abstractHtmlAttributeNode {}

  class onstorageNode extends abstractHtmlAttributeNode {}

  class onsubmitNode extends abstractHtmlAttributeNode {}

  class onsuspendNode extends abstractHtmlAttributeNode {}

  class ontimeupdateNode extends abstractHtmlAttributeNode {}

  class ontoggleNode extends abstractHtmlAttributeNode {}

  class onunloadNode extends abstractHtmlAttributeNode {}

  class onvolumechangeNode extends abstractHtmlAttributeNode {}

  class onwaitingNode extends abstractHtmlAttributeNode {}

  class onwheelNode extends abstractHtmlAttributeNode {}

  class openNode extends abstractHtmlAttributeNode {}

  class optimumNode extends abstractHtmlAttributeNode {}

  class patternNode extends abstractHtmlAttributeNode {}

  class placeholderNode extends abstractHtmlAttributeNode {}

  class posterNode extends abstractHtmlAttributeNode {}

  class preloadNode extends abstractHtmlAttributeNode {}

  class readonlyNode extends abstractHtmlAttributeNode {}

  class relNode extends abstractHtmlAttributeNode {}

  class requiredNode extends abstractHtmlAttributeNode {}

  class reversedNode extends abstractHtmlAttributeNode {}

  class rowsNode extends abstractHtmlAttributeNode {}

  class rowspanNode extends abstractHtmlAttributeNode {}

  class sandboxNode extends abstractHtmlAttributeNode {}

  class scopeNode extends abstractHtmlAttributeNode {}

  class selectedNode extends abstractHtmlAttributeNode {}

  class shapeNode extends abstractHtmlAttributeNode {}

  class sizeNode extends abstractHtmlAttributeNode {}

  class sizesNode extends abstractHtmlAttributeNode {}

  class spellcheckNode extends abstractHtmlAttributeNode {}

  class srcNode extends abstractHtmlAttributeNode {}

  class srcdocNode extends abstractHtmlAttributeNode {}

  class srclangNode extends abstractHtmlAttributeNode {}

  class srcsetNode extends abstractHtmlAttributeNode {}

  class startNode extends abstractHtmlAttributeNode {}

  class stepNode extends abstractHtmlAttributeNode {}

  class acceptCharsetNode extends abstractHtmlAttributeNode {}

  class httpEquivNode extends abstractHtmlAttributeNode {}

  class styleNode extends abstractHtmlAttributeNode {}

  class tabindexNode extends abstractHtmlAttributeNode {}

  class targetNode extends abstractHtmlAttributeNode {}

  class titleNode extends abstractHtmlAttributeNode {}

  class translateNode extends abstractHtmlAttributeNode {}

  class typeNode extends abstractHtmlAttributeNode {}

  class usemapNode extends abstractHtmlAttributeNode {}

  class valueNode extends abstractHtmlAttributeNode {}

  class widthNode extends abstractHtmlAttributeNode {}

  class wrapNode extends abstractHtmlAttributeNode {}

  class stumpExtendedAttributeNode extends abstractHtmlAttributeNode {}

  class stumpNoOpNode extends stumpExtendedAttributeNode {}

  class stumpStyleForNode extends stumpExtendedAttributeNode {}

  class stumpOnBlurCommandNode extends stumpExtendedAttributeNode {}

  class stumpOnLineClickNode extends stumpExtendedAttributeNode {}

  class stumpOnLineShiftClickNode extends stumpExtendedAttributeNode {}

  class stumpOnClickCommandNode extends stumpExtendedAttributeNode {}

  class stumpOnContextMenuCommandNode extends stumpExtendedAttributeNode {}

  class stumpOnChangeCommandNode extends stumpExtendedAttributeNode {}

  class stumpOnDblClickCommandNode extends stumpExtendedAttributeNode {}

  class stumpCollapseNode extends stumpExtendedAttributeNode {}

  window.stumpNode = stumpNode
}
