{
  ;("use strict")

  class hakonNode extends jtree.GrammarBackedRootNode {
    createParser() {
      return new jtree.TreeNode.Parser(selectorNode, undefined, undefined)
    }
    getSelector() {
      return ""
    }
    compile() {
      return this.getTopDownArray()
        .filter(node => node.isSelectorNode)
        .map(child => child.compile())
        .join("")
    }
    getGrammarProgramRoot() {
      if (!this._cachedGrammarProgramRoot)
        this._cachedGrammarProgramRoot = new jtree.GrammarProgram(`hakonNode
 root
 description A Tree Language that compiles to CSS
 compilesTo css
 catchAllNodeType selectorNode
 javascript
  getSelector() { return "" }
  compile() {
    return this.getTopDownArray()
      .filter(node => node.isSelectorNode)
      .map(child => child.compile())
      .join("")
  }
 example A basic example
  body
   font-size 12px
   h1,h2
    color red
  a
   &:hover
    color blue
    font-size 17px
anyFirstCell
extraCell
 highlightScope invalid
cssValueCell
 highlightScope constant.numeric
selectorCell
 highlightScope keyword.control
propertyKeywordCell
 highlightScope variable.function
errorCell
 highlightScope invalid
abstractPropertyNode
 catchAllCellType cssValueCell
 catchAllNodeType errorNode
 firstCellType propertyKeywordCell
 javascript
  compile(spaces) { return \`\${spaces}\${this.getFirstWord()}: \${this.getContent()};\` }
 abstract
errorNode
 catchAllNodeType errorNode
 catchAllCellType errorCell
 firstCellType errorCell
 baseNodeType errorNode
selectorNode
 firstCellType selectorCell
 inScope abstractPropertyNode
 catchAllNodeType selectorNode
 boolean isSelectorNode true
 javascript
  getSelector() {
    const parentSelector = this.getParent().getSelector()
    return this.getFirstWord()
      .split(",")
      .map(part => {
        if (part.startsWith("&")) return parentSelector + part.substr(1)
        return parentSelector ? parentSelector + " " + part : part
      })
      .join(",")
  }
  compile() {
    const propertyNodes = this.getChildren().filter(node => node.doesExtend("abstractPropertyNode"))
    if (!propertyNodes.length) return ""
    const spaces = "  "
    return \`\${this.getSelector()} {
  \${propertyNodes.map(child => child.compile(spaces)).join("\\n")}
  }\\n\`
    }
alignContentNode
 match align-content
 extends abstractPropertyNode
alignItemsNode
 match align-items
 extends abstractPropertyNode
alignSelfNode
 match align-self
 extends abstractPropertyNode
allNode
 extends abstractPropertyNode
animationNode
 extends abstractPropertyNode
animationDelayNode
 match animation-delay
 extends abstractPropertyNode
animationDirectionNode
 match animation-direction
 extends abstractPropertyNode
animationDurationNode
 match animation-duration
 extends abstractPropertyNode
animationFillModeNode
 match animation-fill-mode
 extends abstractPropertyNode
animationIterationCountNode
 match animation-iteration-count
 extends abstractPropertyNode
animationNameNode
 match animation-name
 extends abstractPropertyNode
animationPlayStateNode
 match animation-play-state
 extends abstractPropertyNode
animationTimingFunctionNode
 match animation-timing-function
 extends abstractPropertyNode
backfaceVisibilityNode
 match backface-visibility
 extends abstractPropertyNode
backgroundNode
 extends abstractPropertyNode
backgroundAttachmentNode
 match background-attachment
 extends abstractPropertyNode
backgroundBlendModeNode
 match background-blend-mode
 extends abstractPropertyNode
backgroundClipNode
 match background-clip
 extends abstractPropertyNode
backgroundColorNode
 match background-color
 extends abstractPropertyNode
backgroundImageNode
 match background-image
 extends abstractPropertyNode
backgroundOriginNode
 match background-origin
 extends abstractPropertyNode
backgroundPositionNode
 match background-position
 extends abstractPropertyNode
backgroundRepeatNode
 match background-repeat
 extends abstractPropertyNode
backgroundSizeNode
 match background-size
 extends abstractPropertyNode
borderNode
 extends abstractPropertyNode
borderBottomNode
 match border-bottom
 extends abstractPropertyNode
borderBottomColorNode
 match border-bottom-color
 extends abstractPropertyNode
borderBottomLeftRadiusNode
 match border-bottom-left-radius
 extends abstractPropertyNode
borderBottomRightRadiusNode
 match border-bottom-right-radius
 extends abstractPropertyNode
borderBottomStyleNode
 match border-bottom-style
 extends abstractPropertyNode
borderBottomWidthNode
 match border-bottom-width
 extends abstractPropertyNode
borderCollapseNode
 match border-collapse
 extends abstractPropertyNode
borderColorNode
 match border-color
 extends abstractPropertyNode
borderImageNode
 match border-image
 extends abstractPropertyNode
borderImageOutsetNode
 match border-image-outset
 extends abstractPropertyNode
borderImageRepeatNode
 match border-image-repeat
 extends abstractPropertyNode
borderImageSliceNode
 match border-image-slice
 extends abstractPropertyNode
borderImageSourceNode
 match border-image-source
 extends abstractPropertyNode
borderImageWidthNode
 match border-image-width
 extends abstractPropertyNode
borderLeftNode
 match border-left
 extends abstractPropertyNode
borderLeftColorNode
 match border-left-color
 extends abstractPropertyNode
borderLeftStyleNode
 match border-left-style
 extends abstractPropertyNode
borderLeftWidthNode
 match border-left-width
 extends abstractPropertyNode
borderRadiusNode
 match border-radius
 extends abstractPropertyNode
borderRightNode
 match border-right
 extends abstractPropertyNode
borderRightColorNode
 match border-right-color
 extends abstractPropertyNode
borderRightStyleNode
 match border-right-style
 extends abstractPropertyNode
borderRightWidthNode
 match border-right-width
 extends abstractPropertyNode
borderSpacingNode
 match border-spacing
 extends abstractPropertyNode
borderStyleNode
 match border-style
 extends abstractPropertyNode
borderTopNode
 match border-top
 extends abstractPropertyNode
borderTopColorNode
 match border-top-color
 extends abstractPropertyNode
borderTopLeftRadiusNode
 match border-top-left-radius
 extends abstractPropertyNode
borderTopRightRadiusNode
 match border-top-right-radius
 extends abstractPropertyNode
borderTopStyleNode
 match border-top-style
 extends abstractPropertyNode
borderTopWidthNode
 match border-top-width
 extends abstractPropertyNode
borderWidthNode
 match border-width
 extends abstractPropertyNode
bottomNode
 extends abstractPropertyNode
boxShadowNode
 match box-shadow
 extends abstractPropertyNode
boxSizingNode
 match box-sizing
 extends abstractPropertyNode
captionSideNode
 match caption-side
 extends abstractPropertyNode
clearNode
 extends abstractPropertyNode
clipNode
 extends abstractPropertyNode
colorNode
 extends abstractPropertyNode
columnCountNode
 match column-count
 extends abstractPropertyNode
columnFillNode
 match column-fill
 extends abstractPropertyNode
columnGapNode
 match column-gap
 extends abstractPropertyNode
columnRuleNode
 match column-rule
 extends abstractPropertyNode
columnRuleColorNode
 match column-rule-color
 extends abstractPropertyNode
columnRuleStyleNode
 match column-rule-style
 extends abstractPropertyNode
columnRuleWidthNode
 match column-rule-width
 extends abstractPropertyNode
columnSpanNode
 match column-span
 extends abstractPropertyNode
columnWidthNode
 match column-width
 extends abstractPropertyNode
columnsNode
 extends abstractPropertyNode
contentNode
 extends abstractPropertyNode
counterIncrementNode
 match counter-increment
 extends abstractPropertyNode
counterResetNode
 match counter-reset
 extends abstractPropertyNode
cursorNode
 extends abstractPropertyNode
directionNode
 extends abstractPropertyNode
displayNode
 extends abstractPropertyNode
emptyCellsNode
 match empty-cells
 extends abstractPropertyNode
fillNode
 extends abstractPropertyNode
filterNode
 extends abstractPropertyNode
flexNode
 extends abstractPropertyNode
flexBasisNode
 match flex-basis
 extends abstractPropertyNode
flexDirectionNode
 match flex-direction
 extends abstractPropertyNode
flexFlowNode
 match flex-flow
 extends abstractPropertyNode
flexGrowNode
 match flex-grow
 extends abstractPropertyNode
flexShrinkNode
 match flex-shrink
 extends abstractPropertyNode
flexWrapNode
 match flex-wrap
 extends abstractPropertyNode
floatNode
 extends abstractPropertyNode
fontNode
 extends abstractPropertyNode
fontFaceNode
 match @font-face
 extends abstractPropertyNode
fontFamilyNode
 match font-family
 extends abstractPropertyNode
fontSizeNode
 match font-size
 extends abstractPropertyNode
fontSizeAdjustNode
 match font-size-adjust
 extends abstractPropertyNode
fontStretchNode
 match font-stretch
 extends abstractPropertyNode
fontStyleNode
 match font-style
 extends abstractPropertyNode
fontVariantNode
 match font-variant
 extends abstractPropertyNode
fontWeightNode
 match font-weight
 extends abstractPropertyNode
hangingPunctuationNode
 match hanging-punctuation
 extends abstractPropertyNode
heightNode
 extends abstractPropertyNode
justifyContentNode
 match justify-content
 extends abstractPropertyNode
keyframesNode
 match @keyframes
 extends abstractPropertyNode
leftNode
 extends abstractPropertyNode
letterSpacingNode
 match letter-spacing
 extends abstractPropertyNode
lineHeightNode
 match line-height
 extends abstractPropertyNode
listStyleNode
 match list-style
 extends abstractPropertyNode
listStyleImageNode
 match list-style-image
 extends abstractPropertyNode
listStylePositionNode
 match list-style-position
 extends abstractPropertyNode
listStyleTypeNode
 match list-style-type
 extends abstractPropertyNode
marginNode
 extends abstractPropertyNode
marginBottomNode
 match margin-bottom
 extends abstractPropertyNode
marginLeftNode
 match margin-left
 extends abstractPropertyNode
marginRightNode
 match margin-right
 extends abstractPropertyNode
marginTopNode
 match margin-top
 extends abstractPropertyNode
maxHeightNode
 match max-height
 extends abstractPropertyNode
maxWidthNode
 match max-width
 extends abstractPropertyNode
mediaNode
 match @media
 extends abstractPropertyNode
minHeightNode
 match min-height
 extends abstractPropertyNode
minWidthNode
 match min-width
 extends abstractPropertyNode
navDownNode
 match nav-down
 extends abstractPropertyNode
navIndexNode
 match nav-index
 extends abstractPropertyNode
navLeftNode
 match nav-left
 extends abstractPropertyNode
navRightNode
 match nav-right
 extends abstractPropertyNode
navUpNode
 match nav-up
 extends abstractPropertyNode
opacityNode
 extends abstractPropertyNode
orderNode
 extends abstractPropertyNode
outlineNode
 extends abstractPropertyNode
outlineColorNode
 match outline-color
 extends abstractPropertyNode
outlineOffsetNode
 match outline-offset
 extends abstractPropertyNode
outlineStyleNode
 match outline-style
 extends abstractPropertyNode
outlineWidthNode
 match outline-width
 extends abstractPropertyNode
overflowNode
 extends abstractPropertyNode
overflowXNode
 match overflow-x
 extends abstractPropertyNode
overflowYNode
 match overflow-y
 extends abstractPropertyNode
paddingNode
 extends abstractPropertyNode
paddingBottomNode
 match padding-bottom
 extends abstractPropertyNode
paddingLeftNode
 match padding-left
 extends abstractPropertyNode
paddingRightNode
 match padding-right
 extends abstractPropertyNode
paddingTopNode
 match padding-top
 extends abstractPropertyNode
pageBreakAfterNode
 match page-break-after
 extends abstractPropertyNode
pageBreakBeforeNode
 match page-break-before
 extends abstractPropertyNode
pageBreakInsideNode
 match page-break-inside
 extends abstractPropertyNode
perspectiveNode
 extends abstractPropertyNode
perspectiveOriginNode
 match perspective-origin
 extends abstractPropertyNode
positionNode
 extends abstractPropertyNode
quotesNode
 extends abstractPropertyNode
resizeNode
 extends abstractPropertyNode
rightNode
 extends abstractPropertyNode
tabSizeNode
 match tab-size
 extends abstractPropertyNode
tableLayoutNode
 match table-layout
 extends abstractPropertyNode
textAlignNode
 match text-align
 extends abstractPropertyNode
textAlignLastNode
 match text-align-last
 extends abstractPropertyNode
textDecorationNode
 match text-decoration
 extends abstractPropertyNode
textDecorationColorNode
 match text-decoration-color
 extends abstractPropertyNode
textDecorationLineNode
 match text-decoration-line
 extends abstractPropertyNode
textDecorationStyleNode
 match text-decoration-style
 extends abstractPropertyNode
textIndentNode
 match text-indent
 extends abstractPropertyNode
textJustifyNode
 match text-justify
 extends abstractPropertyNode
textOverflowNode
 match text-overflow
 extends abstractPropertyNode
textShadowNode
 match text-shadow
 extends abstractPropertyNode
textTransformNode
 match text-transform
 extends abstractPropertyNode
topNode
 extends abstractPropertyNode
transformNode
 extends abstractPropertyNode
transformOriginNode
 match transform-origin
 extends abstractPropertyNode
transformStyleNode
 match transform-style
 extends abstractPropertyNode
transitionNode
 extends abstractPropertyNode
transitionDelayNode
 match transition-delay
 extends abstractPropertyNode
transitionDurationNode
 match transition-duration
 extends abstractPropertyNode
transitionPropertyNode
 match transition-property
 extends abstractPropertyNode
transitionTimingFunctionNode
 match transition-timing-function
 extends abstractPropertyNode
unicodeBidiNode
 match unicode-bidi
 extends abstractPropertyNode
verticalAlignNode
 match vertical-align
 extends abstractPropertyNode
visibilityNode
 extends abstractPropertyNode
whiteSpaceNode
 match white-space
 extends abstractPropertyNode
widthNode
 extends abstractPropertyNode
wordBreakNode
 match word-break
 extends abstractPropertyNode
wordSpacingNode
 match word-spacing
 extends abstractPropertyNode
wordWrapNode
 match word-wrap
 extends abstractPropertyNode
zIndexNode
 match z-index
 extends abstractPropertyNode
overscrollBehaviorXNode
 match overscroll-behavior-x
 extends abstractPropertyNode
userSelectNode
 match user-select
 extends abstractPropertyNode
MsTouchActionNode
 match -ms-touch-action
 extends abstractPropertyNode
WebkitUserSelectNode
 match -webkit-user-select
 extends abstractPropertyNode
WebkitTouchCalloutNode
 match -webkit-touch-callout
 extends abstractPropertyNode
MozUserSelectNode
 match -moz-user-select
 extends abstractPropertyNode
touchActionNode
 match touch-action
 extends abstractPropertyNode
MsUserSelectNode
 match -ms-user-select
 extends abstractPropertyNode
KhtmlUserSelectNode
 match -khtml-user-select`)
      return this._cachedGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        hakonNode: hakonNode,
        abstractPropertyNode: abstractPropertyNode,
        errorNode: errorNode,
        selectorNode: selectorNode,
        alignContentNode: alignContentNode,
        alignItemsNode: alignItemsNode,
        alignSelfNode: alignSelfNode,
        allNode: allNode,
        animationNode: animationNode,
        animationDelayNode: animationDelayNode,
        animationDirectionNode: animationDirectionNode,
        animationDurationNode: animationDurationNode,
        animationFillModeNode: animationFillModeNode,
        animationIterationCountNode: animationIterationCountNode,
        animationNameNode: animationNameNode,
        animationPlayStateNode: animationPlayStateNode,
        animationTimingFunctionNode: animationTimingFunctionNode,
        backfaceVisibilityNode: backfaceVisibilityNode,
        backgroundNode: backgroundNode,
        backgroundAttachmentNode: backgroundAttachmentNode,
        backgroundBlendModeNode: backgroundBlendModeNode,
        backgroundClipNode: backgroundClipNode,
        backgroundColorNode: backgroundColorNode,
        backgroundImageNode: backgroundImageNode,
        backgroundOriginNode: backgroundOriginNode,
        backgroundPositionNode: backgroundPositionNode,
        backgroundRepeatNode: backgroundRepeatNode,
        backgroundSizeNode: backgroundSizeNode,
        borderNode: borderNode,
        borderBottomNode: borderBottomNode,
        borderBottomColorNode: borderBottomColorNode,
        borderBottomLeftRadiusNode: borderBottomLeftRadiusNode,
        borderBottomRightRadiusNode: borderBottomRightRadiusNode,
        borderBottomStyleNode: borderBottomStyleNode,
        borderBottomWidthNode: borderBottomWidthNode,
        borderCollapseNode: borderCollapseNode,
        borderColorNode: borderColorNode,
        borderImageNode: borderImageNode,
        borderImageOutsetNode: borderImageOutsetNode,
        borderImageRepeatNode: borderImageRepeatNode,
        borderImageSliceNode: borderImageSliceNode,
        borderImageSourceNode: borderImageSourceNode,
        borderImageWidthNode: borderImageWidthNode,
        borderLeftNode: borderLeftNode,
        borderLeftColorNode: borderLeftColorNode,
        borderLeftStyleNode: borderLeftStyleNode,
        borderLeftWidthNode: borderLeftWidthNode,
        borderRadiusNode: borderRadiusNode,
        borderRightNode: borderRightNode,
        borderRightColorNode: borderRightColorNode,
        borderRightStyleNode: borderRightStyleNode,
        borderRightWidthNode: borderRightWidthNode,
        borderSpacingNode: borderSpacingNode,
        borderStyleNode: borderStyleNode,
        borderTopNode: borderTopNode,
        borderTopColorNode: borderTopColorNode,
        borderTopLeftRadiusNode: borderTopLeftRadiusNode,
        borderTopRightRadiusNode: borderTopRightRadiusNode,
        borderTopStyleNode: borderTopStyleNode,
        borderTopWidthNode: borderTopWidthNode,
        borderWidthNode: borderWidthNode,
        bottomNode: bottomNode,
        boxShadowNode: boxShadowNode,
        boxSizingNode: boxSizingNode,
        captionSideNode: captionSideNode,
        clearNode: clearNode,
        clipNode: clipNode,
        colorNode: colorNode,
        columnCountNode: columnCountNode,
        columnFillNode: columnFillNode,
        columnGapNode: columnGapNode,
        columnRuleNode: columnRuleNode,
        columnRuleColorNode: columnRuleColorNode,
        columnRuleStyleNode: columnRuleStyleNode,
        columnRuleWidthNode: columnRuleWidthNode,
        columnSpanNode: columnSpanNode,
        columnWidthNode: columnWidthNode,
        columnsNode: columnsNode,
        contentNode: contentNode,
        counterIncrementNode: counterIncrementNode,
        counterResetNode: counterResetNode,
        cursorNode: cursorNode,
        directionNode: directionNode,
        displayNode: displayNode,
        emptyCellsNode: emptyCellsNode,
        fillNode: fillNode,
        filterNode: filterNode,
        flexNode: flexNode,
        flexBasisNode: flexBasisNode,
        flexDirectionNode: flexDirectionNode,
        flexFlowNode: flexFlowNode,
        flexGrowNode: flexGrowNode,
        flexShrinkNode: flexShrinkNode,
        flexWrapNode: flexWrapNode,
        floatNode: floatNode,
        fontNode: fontNode,
        fontFaceNode: fontFaceNode,
        fontFamilyNode: fontFamilyNode,
        fontSizeNode: fontSizeNode,
        fontSizeAdjustNode: fontSizeAdjustNode,
        fontStretchNode: fontStretchNode,
        fontStyleNode: fontStyleNode,
        fontVariantNode: fontVariantNode,
        fontWeightNode: fontWeightNode,
        hangingPunctuationNode: hangingPunctuationNode,
        heightNode: heightNode,
        justifyContentNode: justifyContentNode,
        keyframesNode: keyframesNode,
        leftNode: leftNode,
        letterSpacingNode: letterSpacingNode,
        lineHeightNode: lineHeightNode,
        listStyleNode: listStyleNode,
        listStyleImageNode: listStyleImageNode,
        listStylePositionNode: listStylePositionNode,
        listStyleTypeNode: listStyleTypeNode,
        marginNode: marginNode,
        marginBottomNode: marginBottomNode,
        marginLeftNode: marginLeftNode,
        marginRightNode: marginRightNode,
        marginTopNode: marginTopNode,
        maxHeightNode: maxHeightNode,
        maxWidthNode: maxWidthNode,
        mediaNode: mediaNode,
        minHeightNode: minHeightNode,
        minWidthNode: minWidthNode,
        navDownNode: navDownNode,
        navIndexNode: navIndexNode,
        navLeftNode: navLeftNode,
        navRightNode: navRightNode,
        navUpNode: navUpNode,
        opacityNode: opacityNode,
        orderNode: orderNode,
        outlineNode: outlineNode,
        outlineColorNode: outlineColorNode,
        outlineOffsetNode: outlineOffsetNode,
        outlineStyleNode: outlineStyleNode,
        outlineWidthNode: outlineWidthNode,
        overflowNode: overflowNode,
        overflowXNode: overflowXNode,
        overflowYNode: overflowYNode,
        paddingNode: paddingNode,
        paddingBottomNode: paddingBottomNode,
        paddingLeftNode: paddingLeftNode,
        paddingRightNode: paddingRightNode,
        paddingTopNode: paddingTopNode,
        pageBreakAfterNode: pageBreakAfterNode,
        pageBreakBeforeNode: pageBreakBeforeNode,
        pageBreakInsideNode: pageBreakInsideNode,
        perspectiveNode: perspectiveNode,
        perspectiveOriginNode: perspectiveOriginNode,
        positionNode: positionNode,
        quotesNode: quotesNode,
        resizeNode: resizeNode,
        rightNode: rightNode,
        tabSizeNode: tabSizeNode,
        tableLayoutNode: tableLayoutNode,
        textAlignNode: textAlignNode,
        textAlignLastNode: textAlignLastNode,
        textDecorationNode: textDecorationNode,
        textDecorationColorNode: textDecorationColorNode,
        textDecorationLineNode: textDecorationLineNode,
        textDecorationStyleNode: textDecorationStyleNode,
        textIndentNode: textIndentNode,
        textJustifyNode: textJustifyNode,
        textOverflowNode: textOverflowNode,
        textShadowNode: textShadowNode,
        textTransformNode: textTransformNode,
        topNode: topNode,
        transformNode: transformNode,
        transformOriginNode: transformOriginNode,
        transformStyleNode: transformStyleNode,
        transitionNode: transitionNode,
        transitionDelayNode: transitionDelayNode,
        transitionDurationNode: transitionDurationNode,
        transitionPropertyNode: transitionPropertyNode,
        transitionTimingFunctionNode: transitionTimingFunctionNode,
        unicodeBidiNode: unicodeBidiNode,
        verticalAlignNode: verticalAlignNode,
        visibilityNode: visibilityNode,
        whiteSpaceNode: whiteSpaceNode,
        widthNode: widthNode,
        wordBreakNode: wordBreakNode,
        wordSpacingNode: wordSpacingNode,
        wordWrapNode: wordWrapNode,
        zIndexNode: zIndexNode,
        overscrollBehaviorXNode: overscrollBehaviorXNode,
        userSelectNode: userSelectNode,
        MsTouchActionNode: MsTouchActionNode,
        WebkitUserSelectNode: WebkitUserSelectNode,
        WebkitTouchCalloutNode: WebkitTouchCalloutNode,
        MozUserSelectNode: MozUserSelectNode,
        touchActionNode: touchActionNode,
        MsUserSelectNode: MsUserSelectNode,
        KhtmlUserSelectNode: KhtmlUserSelectNode
      }
    }
  }

  class abstractPropertyNode extends jtree.GrammarBackedNonRootNode {
    createParser() {
      return new jtree.TreeNode.Parser(errorNode, undefined, undefined)
    }
    get cssValueCell() {
      return this.getWordsFrom(1)
    }
    compile(spaces) {
      return `${spaces}${this.getFirstWord()}: ${this.getContent()};`
    }
  }

  class errorNode extends jtree.GrammarBackedNonRootNode {
    createParser() {
      return new jtree.TreeNode.Parser(errorNode, undefined, undefined)
    }
    getErrors() {
      return this._getErrorNodeErrors()
    }
    get errorCell() {
      return this.getWordsFrom(1)
    }
  }

  class selectorNode extends jtree.GrammarBackedNonRootNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        selectorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMap()), {
          "align-content": alignContentNode,
          "align-items": alignItemsNode,
          "align-self": alignSelfNode,
          all: allNode,
          animation: animationNode,
          "animation-delay": animationDelayNode,
          "animation-direction": animationDirectionNode,
          "animation-duration": animationDurationNode,
          "animation-fill-mode": animationFillModeNode,
          "animation-iteration-count": animationIterationCountNode,
          "animation-name": animationNameNode,
          "animation-play-state": animationPlayStateNode,
          "animation-timing-function": animationTimingFunctionNode,
          "backface-visibility": backfaceVisibilityNode,
          background: backgroundNode,
          "background-attachment": backgroundAttachmentNode,
          "background-blend-mode": backgroundBlendModeNode,
          "background-clip": backgroundClipNode,
          "background-color": backgroundColorNode,
          "background-image": backgroundImageNode,
          "background-origin": backgroundOriginNode,
          "background-position": backgroundPositionNode,
          "background-repeat": backgroundRepeatNode,
          "background-size": backgroundSizeNode,
          border: borderNode,
          "border-bottom": borderBottomNode,
          "border-bottom-color": borderBottomColorNode,
          "border-bottom-left-radius": borderBottomLeftRadiusNode,
          "border-bottom-right-radius": borderBottomRightRadiusNode,
          "border-bottom-style": borderBottomStyleNode,
          "border-bottom-width": borderBottomWidthNode,
          "border-collapse": borderCollapseNode,
          "border-color": borderColorNode,
          "border-image": borderImageNode,
          "border-image-outset": borderImageOutsetNode,
          "border-image-repeat": borderImageRepeatNode,
          "border-image-slice": borderImageSliceNode,
          "border-image-source": borderImageSourceNode,
          "border-image-width": borderImageWidthNode,
          "border-left": borderLeftNode,
          "border-left-color": borderLeftColorNode,
          "border-left-style": borderLeftStyleNode,
          "border-left-width": borderLeftWidthNode,
          "border-radius": borderRadiusNode,
          "border-right": borderRightNode,
          "border-right-color": borderRightColorNode,
          "border-right-style": borderRightStyleNode,
          "border-right-width": borderRightWidthNode,
          "border-spacing": borderSpacingNode,
          "border-style": borderStyleNode,
          "border-top": borderTopNode,
          "border-top-color": borderTopColorNode,
          "border-top-left-radius": borderTopLeftRadiusNode,
          "border-top-right-radius": borderTopRightRadiusNode,
          "border-top-style": borderTopStyleNode,
          "border-top-width": borderTopWidthNode,
          "border-width": borderWidthNode,
          bottom: bottomNode,
          "box-shadow": boxShadowNode,
          "box-sizing": boxSizingNode,
          "caption-side": captionSideNode,
          clear: clearNode,
          clip: clipNode,
          color: colorNode,
          "column-count": columnCountNode,
          "column-fill": columnFillNode,
          "column-gap": columnGapNode,
          "column-rule": columnRuleNode,
          "column-rule-color": columnRuleColorNode,
          "column-rule-style": columnRuleStyleNode,
          "column-rule-width": columnRuleWidthNode,
          "column-span": columnSpanNode,
          "column-width": columnWidthNode,
          columns: columnsNode,
          content: contentNode,
          "counter-increment": counterIncrementNode,
          "counter-reset": counterResetNode,
          cursor: cursorNode,
          direction: directionNode,
          display: displayNode,
          "empty-cells": emptyCellsNode,
          fill: fillNode,
          filter: filterNode,
          flex: flexNode,
          "flex-basis": flexBasisNode,
          "flex-direction": flexDirectionNode,
          "flex-flow": flexFlowNode,
          "flex-grow": flexGrowNode,
          "flex-shrink": flexShrinkNode,
          "flex-wrap": flexWrapNode,
          float: floatNode,
          font: fontNode,
          "@font-face": fontFaceNode,
          "font-family": fontFamilyNode,
          "font-size": fontSizeNode,
          "font-size-adjust": fontSizeAdjustNode,
          "font-stretch": fontStretchNode,
          "font-style": fontStyleNode,
          "font-variant": fontVariantNode,
          "font-weight": fontWeightNode,
          "hanging-punctuation": hangingPunctuationNode,
          height: heightNode,
          "justify-content": justifyContentNode,
          "@keyframes": keyframesNode,
          left: leftNode,
          "letter-spacing": letterSpacingNode,
          "line-height": lineHeightNode,
          "list-style": listStyleNode,
          "list-style-image": listStyleImageNode,
          "list-style-position": listStylePositionNode,
          "list-style-type": listStyleTypeNode,
          margin: marginNode,
          "margin-bottom": marginBottomNode,
          "margin-left": marginLeftNode,
          "margin-right": marginRightNode,
          "margin-top": marginTopNode,
          "max-height": maxHeightNode,
          "max-width": maxWidthNode,
          "@media": mediaNode,
          "min-height": minHeightNode,
          "min-width": minWidthNode,
          "nav-down": navDownNode,
          "nav-index": navIndexNode,
          "nav-left": navLeftNode,
          "nav-right": navRightNode,
          "nav-up": navUpNode,
          opacity: opacityNode,
          order: orderNode,
          outline: outlineNode,
          "outline-color": outlineColorNode,
          "outline-offset": outlineOffsetNode,
          "outline-style": outlineStyleNode,
          "outline-width": outlineWidthNode,
          overflow: overflowNode,
          "overflow-x": overflowXNode,
          "overflow-y": overflowYNode,
          padding: paddingNode,
          "padding-bottom": paddingBottomNode,
          "padding-left": paddingLeftNode,
          "padding-right": paddingRightNode,
          "padding-top": paddingTopNode,
          "page-break-after": pageBreakAfterNode,
          "page-break-before": pageBreakBeforeNode,
          "page-break-inside": pageBreakInsideNode,
          perspective: perspectiveNode,
          "perspective-origin": perspectiveOriginNode,
          position: positionNode,
          quotes: quotesNode,
          resize: resizeNode,
          right: rightNode,
          "tab-size": tabSizeNode,
          "table-layout": tableLayoutNode,
          "text-align": textAlignNode,
          "text-align-last": textAlignLastNode,
          "text-decoration": textDecorationNode,
          "text-decoration-color": textDecorationColorNode,
          "text-decoration-line": textDecorationLineNode,
          "text-decoration-style": textDecorationStyleNode,
          "text-indent": textIndentNode,
          "text-justify": textJustifyNode,
          "text-overflow": textOverflowNode,
          "text-shadow": textShadowNode,
          "text-transform": textTransformNode,
          top: topNode,
          transform: transformNode,
          "transform-origin": transformOriginNode,
          "transform-style": transformStyleNode,
          transition: transitionNode,
          "transition-delay": transitionDelayNode,
          "transition-duration": transitionDurationNode,
          "transition-property": transitionPropertyNode,
          "transition-timing-function": transitionTimingFunctionNode,
          "unicode-bidi": unicodeBidiNode,
          "vertical-align": verticalAlignNode,
          visibility: visibilityNode,
          "white-space": whiteSpaceNode,
          width: widthNode,
          "word-break": wordBreakNode,
          "word-spacing": wordSpacingNode,
          "word-wrap": wordWrapNode,
          "z-index": zIndexNode,
          "overscroll-behavior-x": overscrollBehaviorXNode,
          "user-select": userSelectNode,
          "-ms-touch-action": MsTouchActionNode,
          "-webkit-user-select": WebkitUserSelectNode,
          "-webkit-touch-callout": WebkitTouchCalloutNode,
          "-moz-user-select": MozUserSelectNode,
          "touch-action": touchActionNode,
          "-ms-user-select": MsUserSelectNode
        }),
        undefined
      )
    }
    get isSelectorNode() {
      return true
    }
    getSelector() {
      const parentSelector = this.getParent().getSelector()
      return this.getFirstWord()
        .split(",")
        .map(part => {
          if (part.startsWith("&")) return parentSelector + part.substr(1)
          return parentSelector ? parentSelector + " " + part : part
        })
        .join(",")
    }
    compile() {
      const propertyNodes = this.getChildren().filter(node => node.doesExtend("abstractPropertyNode"))
      if (!propertyNodes.length) return ""
      const spaces = "  "
      return `${this.getSelector()} {
${propertyNodes.map(child => child.compile(spaces)).join("\n")}
}\n`
    }
  }

  class alignContentNode extends abstractPropertyNode {}

  class alignItemsNode extends abstractPropertyNode {}

  class alignSelfNode extends abstractPropertyNode {}

  class allNode extends abstractPropertyNode {}

  class animationNode extends abstractPropertyNode {}

  class animationDelayNode extends abstractPropertyNode {}

  class animationDirectionNode extends abstractPropertyNode {}

  class animationDurationNode extends abstractPropertyNode {}

  class animationFillModeNode extends abstractPropertyNode {}

  class animationIterationCountNode extends abstractPropertyNode {}

  class animationNameNode extends abstractPropertyNode {}

  class animationPlayStateNode extends abstractPropertyNode {}

  class animationTimingFunctionNode extends abstractPropertyNode {}

  class backfaceVisibilityNode extends abstractPropertyNode {}

  class backgroundNode extends abstractPropertyNode {}

  class backgroundAttachmentNode extends abstractPropertyNode {}

  class backgroundBlendModeNode extends abstractPropertyNode {}

  class backgroundClipNode extends abstractPropertyNode {}

  class backgroundColorNode extends abstractPropertyNode {}

  class backgroundImageNode extends abstractPropertyNode {}

  class backgroundOriginNode extends abstractPropertyNode {}

  class backgroundPositionNode extends abstractPropertyNode {}

  class backgroundRepeatNode extends abstractPropertyNode {}

  class backgroundSizeNode extends abstractPropertyNode {}

  class borderNode extends abstractPropertyNode {}

  class borderBottomNode extends abstractPropertyNode {}

  class borderBottomColorNode extends abstractPropertyNode {}

  class borderBottomLeftRadiusNode extends abstractPropertyNode {}

  class borderBottomRightRadiusNode extends abstractPropertyNode {}

  class borderBottomStyleNode extends abstractPropertyNode {}

  class borderBottomWidthNode extends abstractPropertyNode {}

  class borderCollapseNode extends abstractPropertyNode {}

  class borderColorNode extends abstractPropertyNode {}

  class borderImageNode extends abstractPropertyNode {}

  class borderImageOutsetNode extends abstractPropertyNode {}

  class borderImageRepeatNode extends abstractPropertyNode {}

  class borderImageSliceNode extends abstractPropertyNode {}

  class borderImageSourceNode extends abstractPropertyNode {}

  class borderImageWidthNode extends abstractPropertyNode {}

  class borderLeftNode extends abstractPropertyNode {}

  class borderLeftColorNode extends abstractPropertyNode {}

  class borderLeftStyleNode extends abstractPropertyNode {}

  class borderLeftWidthNode extends abstractPropertyNode {}

  class borderRadiusNode extends abstractPropertyNode {}

  class borderRightNode extends abstractPropertyNode {}

  class borderRightColorNode extends abstractPropertyNode {}

  class borderRightStyleNode extends abstractPropertyNode {}

  class borderRightWidthNode extends abstractPropertyNode {}

  class borderSpacingNode extends abstractPropertyNode {}

  class borderStyleNode extends abstractPropertyNode {}

  class borderTopNode extends abstractPropertyNode {}

  class borderTopColorNode extends abstractPropertyNode {}

  class borderTopLeftRadiusNode extends abstractPropertyNode {}

  class borderTopRightRadiusNode extends abstractPropertyNode {}

  class borderTopStyleNode extends abstractPropertyNode {}

  class borderTopWidthNode extends abstractPropertyNode {}

  class borderWidthNode extends abstractPropertyNode {}

  class bottomNode extends abstractPropertyNode {}

  class boxShadowNode extends abstractPropertyNode {}

  class boxSizingNode extends abstractPropertyNode {}

  class captionSideNode extends abstractPropertyNode {}

  class clearNode extends abstractPropertyNode {}

  class clipNode extends abstractPropertyNode {}

  class colorNode extends abstractPropertyNode {}

  class columnCountNode extends abstractPropertyNode {}

  class columnFillNode extends abstractPropertyNode {}

  class columnGapNode extends abstractPropertyNode {}

  class columnRuleNode extends abstractPropertyNode {}

  class columnRuleColorNode extends abstractPropertyNode {}

  class columnRuleStyleNode extends abstractPropertyNode {}

  class columnRuleWidthNode extends abstractPropertyNode {}

  class columnSpanNode extends abstractPropertyNode {}

  class columnWidthNode extends abstractPropertyNode {}

  class columnsNode extends abstractPropertyNode {}

  class contentNode extends abstractPropertyNode {}

  class counterIncrementNode extends abstractPropertyNode {}

  class counterResetNode extends abstractPropertyNode {}

  class cursorNode extends abstractPropertyNode {}

  class directionNode extends abstractPropertyNode {}

  class displayNode extends abstractPropertyNode {}

  class emptyCellsNode extends abstractPropertyNode {}

  class fillNode extends abstractPropertyNode {}

  class filterNode extends abstractPropertyNode {}

  class flexNode extends abstractPropertyNode {}

  class flexBasisNode extends abstractPropertyNode {}

  class flexDirectionNode extends abstractPropertyNode {}

  class flexFlowNode extends abstractPropertyNode {}

  class flexGrowNode extends abstractPropertyNode {}

  class flexShrinkNode extends abstractPropertyNode {}

  class flexWrapNode extends abstractPropertyNode {}

  class floatNode extends abstractPropertyNode {}

  class fontNode extends abstractPropertyNode {}

  class fontFaceNode extends abstractPropertyNode {}

  class fontFamilyNode extends abstractPropertyNode {}

  class fontSizeNode extends abstractPropertyNode {}

  class fontSizeAdjustNode extends abstractPropertyNode {}

  class fontStretchNode extends abstractPropertyNode {}

  class fontStyleNode extends abstractPropertyNode {}

  class fontVariantNode extends abstractPropertyNode {}

  class fontWeightNode extends abstractPropertyNode {}

  class hangingPunctuationNode extends abstractPropertyNode {}

  class heightNode extends abstractPropertyNode {}

  class justifyContentNode extends abstractPropertyNode {}

  class keyframesNode extends abstractPropertyNode {}

  class leftNode extends abstractPropertyNode {}

  class letterSpacingNode extends abstractPropertyNode {}

  class lineHeightNode extends abstractPropertyNode {}

  class listStyleNode extends abstractPropertyNode {}

  class listStyleImageNode extends abstractPropertyNode {}

  class listStylePositionNode extends abstractPropertyNode {}

  class listStyleTypeNode extends abstractPropertyNode {}

  class marginNode extends abstractPropertyNode {}

  class marginBottomNode extends abstractPropertyNode {}

  class marginLeftNode extends abstractPropertyNode {}

  class marginRightNode extends abstractPropertyNode {}

  class marginTopNode extends abstractPropertyNode {}

  class maxHeightNode extends abstractPropertyNode {}

  class maxWidthNode extends abstractPropertyNode {}

  class mediaNode extends abstractPropertyNode {}

  class minHeightNode extends abstractPropertyNode {}

  class minWidthNode extends abstractPropertyNode {}

  class navDownNode extends abstractPropertyNode {}

  class navIndexNode extends abstractPropertyNode {}

  class navLeftNode extends abstractPropertyNode {}

  class navRightNode extends abstractPropertyNode {}

  class navUpNode extends abstractPropertyNode {}

  class opacityNode extends abstractPropertyNode {}

  class orderNode extends abstractPropertyNode {}

  class outlineNode extends abstractPropertyNode {}

  class outlineColorNode extends abstractPropertyNode {}

  class outlineOffsetNode extends abstractPropertyNode {}

  class outlineStyleNode extends abstractPropertyNode {}

  class outlineWidthNode extends abstractPropertyNode {}

  class overflowNode extends abstractPropertyNode {}

  class overflowXNode extends abstractPropertyNode {}

  class overflowYNode extends abstractPropertyNode {}

  class paddingNode extends abstractPropertyNode {}

  class paddingBottomNode extends abstractPropertyNode {}

  class paddingLeftNode extends abstractPropertyNode {}

  class paddingRightNode extends abstractPropertyNode {}

  class paddingTopNode extends abstractPropertyNode {}

  class pageBreakAfterNode extends abstractPropertyNode {}

  class pageBreakBeforeNode extends abstractPropertyNode {}

  class pageBreakInsideNode extends abstractPropertyNode {}

  class perspectiveNode extends abstractPropertyNode {}

  class perspectiveOriginNode extends abstractPropertyNode {}

  class positionNode extends abstractPropertyNode {}

  class quotesNode extends abstractPropertyNode {}

  class resizeNode extends abstractPropertyNode {}

  class rightNode extends abstractPropertyNode {}

  class tabSizeNode extends abstractPropertyNode {}

  class tableLayoutNode extends abstractPropertyNode {}

  class textAlignNode extends abstractPropertyNode {}

  class textAlignLastNode extends abstractPropertyNode {}

  class textDecorationNode extends abstractPropertyNode {}

  class textDecorationColorNode extends abstractPropertyNode {}

  class textDecorationLineNode extends abstractPropertyNode {}

  class textDecorationStyleNode extends abstractPropertyNode {}

  class textIndentNode extends abstractPropertyNode {}

  class textJustifyNode extends abstractPropertyNode {}

  class textOverflowNode extends abstractPropertyNode {}

  class textShadowNode extends abstractPropertyNode {}

  class textTransformNode extends abstractPropertyNode {}

  class topNode extends abstractPropertyNode {}

  class transformNode extends abstractPropertyNode {}

  class transformOriginNode extends abstractPropertyNode {}

  class transformStyleNode extends abstractPropertyNode {}

  class transitionNode extends abstractPropertyNode {}

  class transitionDelayNode extends abstractPropertyNode {}

  class transitionDurationNode extends abstractPropertyNode {}

  class transitionPropertyNode extends abstractPropertyNode {}

  class transitionTimingFunctionNode extends abstractPropertyNode {}

  class unicodeBidiNode extends abstractPropertyNode {}

  class verticalAlignNode extends abstractPropertyNode {}

  class visibilityNode extends abstractPropertyNode {}

  class whiteSpaceNode extends abstractPropertyNode {}

  class widthNode extends abstractPropertyNode {}

  class wordBreakNode extends abstractPropertyNode {}

  class wordSpacingNode extends abstractPropertyNode {}

  class wordWrapNode extends abstractPropertyNode {}

  class zIndexNode extends abstractPropertyNode {}

  class overscrollBehaviorXNode extends abstractPropertyNode {}

  class userSelectNode extends abstractPropertyNode {}

  class MsTouchActionNode extends abstractPropertyNode {}

  class WebkitUserSelectNode extends abstractPropertyNode {}

  class WebkitTouchCalloutNode extends abstractPropertyNode {}

  class MozUserSelectNode extends abstractPropertyNode {}

  class touchActionNode extends abstractPropertyNode {}

  class MsUserSelectNode extends abstractPropertyNode {}

  class KhtmlUserSelectNode extends jtree.GrammarBackedNonRootNode {}

  window.hakonNode = hakonNode
}
