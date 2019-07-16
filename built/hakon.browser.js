{
  ;("use strict")

  class hakon extends jtree.GrammarBackedRootNode {
    getCatchAllNodeConstructor() {
      return selectorNode
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
        this._cachedGrammarProgramRoot = new jtree.GrammarProgram(`nodeType hakon
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
cellType anyFirstWord
cellType extraWord
 highlightScope invalid
cellType cssValueWord
 highlightScope constant.numeric
cellType selector
 highlightScope keyword.control
cellType propertyName
 highlightScope variable.function
cellType errorWord
 highlightScope invalid
nodeType abstractPropertyNode
 catchAllCellType cssValueWord
 catchAllNodeType errorNode
 firstCellType propertyName
 javascript
  compile(spaces) { return \`\${spaces}\${this.getFirstWord()}: \${this.getContent()};\` }
 abstract
nodeType errorNode
 catchAllNodeType errorNode
 catchAllCellType errorWord
 firstCellType errorWord
 baseNodeType errorNode
nodeType selectorNode
 firstCellType selector
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
nodeType alignContent
 match align-content
 extends abstractPropertyNode
nodeType alignItems
 match align-items
 extends abstractPropertyNode
nodeType alignSelf
 match align-self
 extends abstractPropertyNode
nodeType all
 extends abstractPropertyNode
nodeType animation
 extends abstractPropertyNode
nodeType animationDelay
 match animation-delay
 extends abstractPropertyNode
nodeType animationDirection
 match animation-direction
 extends abstractPropertyNode
nodeType animationDuration
 match animation-duration
 extends abstractPropertyNode
nodeType animationFillMode
 match animation-fill-mode
 extends abstractPropertyNode
nodeType animationIterationCount
 match animation-iteration-count
 extends abstractPropertyNode
nodeType animationName
 match animation-name
 extends abstractPropertyNode
nodeType animationPlayState
 match animation-play-state
 extends abstractPropertyNode
nodeType animationTimingFunction
 match animation-timing-function
 extends abstractPropertyNode
nodeType backfaceVisibility
 match backface-visibility
 extends abstractPropertyNode
nodeType background
 extends abstractPropertyNode
nodeType backgroundAttachment
 match background-attachment
 extends abstractPropertyNode
nodeType backgroundBlendMode
 match background-blend-mode
 extends abstractPropertyNode
nodeType backgroundClip
 match background-clip
 extends abstractPropertyNode
nodeType backgroundColor
 match background-color
 extends abstractPropertyNode
nodeType backgroundImage
 match background-image
 extends abstractPropertyNode
nodeType backgroundOrigin
 match background-origin
 extends abstractPropertyNode
nodeType backgroundPosition
 match background-position
 extends abstractPropertyNode
nodeType backgroundRepeat
 match background-repeat
 extends abstractPropertyNode
nodeType backgroundSize
 match background-size
 extends abstractPropertyNode
nodeType border
 extends abstractPropertyNode
nodeType borderBottom
 match border-bottom
 extends abstractPropertyNode
nodeType borderBottomColor
 match border-bottom-color
 extends abstractPropertyNode
nodeType borderBottomLeftRadius
 match border-bottom-left-radius
 extends abstractPropertyNode
nodeType borderBottomRightRadius
 match border-bottom-right-radius
 extends abstractPropertyNode
nodeType borderBottomStyle
 match border-bottom-style
 extends abstractPropertyNode
nodeType borderBottomWidth
 match border-bottom-width
 extends abstractPropertyNode
nodeType borderCollapse
 match border-collapse
 extends abstractPropertyNode
nodeType borderColor
 match border-color
 extends abstractPropertyNode
nodeType borderImage
 match border-image
 extends abstractPropertyNode
nodeType borderImageOutset
 match border-image-outset
 extends abstractPropertyNode
nodeType borderImageRepeat
 match border-image-repeat
 extends abstractPropertyNode
nodeType borderImageSlice
 match border-image-slice
 extends abstractPropertyNode
nodeType borderImageSource
 match border-image-source
 extends abstractPropertyNode
nodeType borderImageWidth
 match border-image-width
 extends abstractPropertyNode
nodeType borderLeft
 match border-left
 extends abstractPropertyNode
nodeType borderLeftColor
 match border-left-color
 extends abstractPropertyNode
nodeType borderLeftStyle
 match border-left-style
 extends abstractPropertyNode
nodeType borderLeftWidth
 match border-left-width
 extends abstractPropertyNode
nodeType borderRadius
 match border-radius
 extends abstractPropertyNode
nodeType borderRight
 match border-right
 extends abstractPropertyNode
nodeType borderRightColor
 match border-right-color
 extends abstractPropertyNode
nodeType borderRightStyle
 match border-right-style
 extends abstractPropertyNode
nodeType borderRightWidth
 match border-right-width
 extends abstractPropertyNode
nodeType borderSpacing
 match border-spacing
 extends abstractPropertyNode
nodeType borderStyle
 match border-style
 extends abstractPropertyNode
nodeType borderTop
 match border-top
 extends abstractPropertyNode
nodeType borderTopColor
 match border-top-color
 extends abstractPropertyNode
nodeType borderTopLeftRadius
 match border-top-left-radius
 extends abstractPropertyNode
nodeType borderTopRightRadius
 match border-top-right-radius
 extends abstractPropertyNode
nodeType borderTopStyle
 match border-top-style
 extends abstractPropertyNode
nodeType borderTopWidth
 match border-top-width
 extends abstractPropertyNode
nodeType borderWidth
 match border-width
 extends abstractPropertyNode
nodeType bottom
 extends abstractPropertyNode
nodeType boxShadow
 match box-shadow
 extends abstractPropertyNode
nodeType boxSizing
 match box-sizing
 extends abstractPropertyNode
nodeType captionSide
 match caption-side
 extends abstractPropertyNode
nodeType clear
 extends abstractPropertyNode
nodeType clip
 extends abstractPropertyNode
nodeType color
 extends abstractPropertyNode
nodeType columnCount
 match column-count
 extends abstractPropertyNode
nodeType columnFill
 match column-fill
 extends abstractPropertyNode
nodeType columnGap
 match column-gap
 extends abstractPropertyNode
nodeType columnRule
 match column-rule
 extends abstractPropertyNode
nodeType columnRuleColor
 match column-rule-color
 extends abstractPropertyNode
nodeType columnRuleStyle
 match column-rule-style
 extends abstractPropertyNode
nodeType columnRuleWidth
 match column-rule-width
 extends abstractPropertyNode
nodeType columnSpan
 match column-span
 extends abstractPropertyNode
nodeType columnWidth
 match column-width
 extends abstractPropertyNode
nodeType columns
 extends abstractPropertyNode
nodeType content
 extends abstractPropertyNode
nodeType counterIncrement
 match counter-increment
 extends abstractPropertyNode
nodeType counterReset
 match counter-reset
 extends abstractPropertyNode
nodeType cursor
 extends abstractPropertyNode
nodeType direction
 extends abstractPropertyNode
nodeType display
 extends abstractPropertyNode
nodeType emptyCells
 match empty-cells
 extends abstractPropertyNode
nodeType fill
 extends abstractPropertyNode
nodeType filter
 extends abstractPropertyNode
nodeType flex
 extends abstractPropertyNode
nodeType flexBasis
 match flex-basis
 extends abstractPropertyNode
nodeType flexDirection
 match flex-direction
 extends abstractPropertyNode
nodeType flexFlow
 match flex-flow
 extends abstractPropertyNode
nodeType flexGrow
 match flex-grow
 extends abstractPropertyNode
nodeType flexShrink
 match flex-shrink
 extends abstractPropertyNode
nodeType flexWrap
 match flex-wrap
 extends abstractPropertyNode
nodeType float
 extends abstractPropertyNode
nodeType font
 extends abstractPropertyNode
nodeType fontFace
 match @font-face
 extends abstractPropertyNode
nodeType fontFamily
 match font-family
 extends abstractPropertyNode
nodeType fontSize
 match font-size
 extends abstractPropertyNode
nodeType fontSizeAdjust
 match font-size-adjust
 extends abstractPropertyNode
nodeType fontStretch
 match font-stretch
 extends abstractPropertyNode
nodeType fontStyle
 match font-style
 extends abstractPropertyNode
nodeType fontVariant
 match font-variant
 extends abstractPropertyNode
nodeType fontWeight
 match font-weight
 extends abstractPropertyNode
nodeType hangingPunctuation
 match hanging-punctuation
 extends abstractPropertyNode
nodeType height
 extends abstractPropertyNode
nodeType justifyContent
 match justify-content
 extends abstractPropertyNode
nodeType keyframes
 match @keyframes
 extends abstractPropertyNode
nodeType left
 extends abstractPropertyNode
nodeType letterSpacing
 match letter-spacing
 extends abstractPropertyNode
nodeType lineHeight
 match line-height
 extends abstractPropertyNode
nodeType listStyle
 match list-style
 extends abstractPropertyNode
nodeType listStyleImage
 match list-style-image
 extends abstractPropertyNode
nodeType listStylePosition
 match list-style-position
 extends abstractPropertyNode
nodeType listStyleType
 match list-style-type
 extends abstractPropertyNode
nodeType margin
 extends abstractPropertyNode
nodeType marginBottom
 match margin-bottom
 extends abstractPropertyNode
nodeType marginLeft
 match margin-left
 extends abstractPropertyNode
nodeType marginRight
 match margin-right
 extends abstractPropertyNode
nodeType marginTop
 match margin-top
 extends abstractPropertyNode
nodeType maxHeight
 match max-height
 extends abstractPropertyNode
nodeType maxWidth
 match max-width
 extends abstractPropertyNode
nodeType media
 match @media
 extends abstractPropertyNode
nodeType minHeight
 match min-height
 extends abstractPropertyNode
nodeType minWidth
 match min-width
 extends abstractPropertyNode
nodeType navDown
 match nav-down
 extends abstractPropertyNode
nodeType navIndex
 match nav-index
 extends abstractPropertyNode
nodeType navLeft
 match nav-left
 extends abstractPropertyNode
nodeType navRight
 match nav-right
 extends abstractPropertyNode
nodeType navUp
 match nav-up
 extends abstractPropertyNode
nodeType opacity
 extends abstractPropertyNode
nodeType order
 extends abstractPropertyNode
nodeType outline
 extends abstractPropertyNode
nodeType outlineColor
 match outline-color
 extends abstractPropertyNode
nodeType outlineOffset
 match outline-offset
 extends abstractPropertyNode
nodeType outlineStyle
 match outline-style
 extends abstractPropertyNode
nodeType outlineWidth
 match outline-width
 extends abstractPropertyNode
nodeType overflow
 extends abstractPropertyNode
nodeType overflowX
 match overflow-x
 extends abstractPropertyNode
nodeType overflowY
 match overflow-y
 extends abstractPropertyNode
nodeType padding
 extends abstractPropertyNode
nodeType paddingBottom
 match padding-bottom
 extends abstractPropertyNode
nodeType paddingLeft
 match padding-left
 extends abstractPropertyNode
nodeType paddingRight
 match padding-right
 extends abstractPropertyNode
nodeType paddingTop
 match padding-top
 extends abstractPropertyNode
nodeType pageBreakAfter
 match page-break-after
 extends abstractPropertyNode
nodeType pageBreakBefore
 match page-break-before
 extends abstractPropertyNode
nodeType pageBreakInside
 match page-break-inside
 extends abstractPropertyNode
nodeType perspective
 extends abstractPropertyNode
nodeType perspectiveOrigin
 match perspective-origin
 extends abstractPropertyNode
nodeType position
 extends abstractPropertyNode
nodeType quotes
 extends abstractPropertyNode
nodeType resize
 extends abstractPropertyNode
nodeType right
 extends abstractPropertyNode
nodeType tabSize
 match tab-size
 extends abstractPropertyNode
nodeType tableLayout
 match table-layout
 extends abstractPropertyNode
nodeType textAlign
 match text-align
 extends abstractPropertyNode
nodeType textAlignLast
 match text-align-last
 extends abstractPropertyNode
nodeType textDecoration
 match text-decoration
 extends abstractPropertyNode
nodeType textDecorationColor
 match text-decoration-color
 extends abstractPropertyNode
nodeType textDecorationLine
 match text-decoration-line
 extends abstractPropertyNode
nodeType textDecorationStyle
 match text-decoration-style
 extends abstractPropertyNode
nodeType textIndent
 match text-indent
 extends abstractPropertyNode
nodeType textJustify
 match text-justify
 extends abstractPropertyNode
nodeType textOverflow
 match text-overflow
 extends abstractPropertyNode
nodeType textShadow
 match text-shadow
 extends abstractPropertyNode
nodeType textTransform
 match text-transform
 extends abstractPropertyNode
nodeType top
 extends abstractPropertyNode
nodeType transform
 extends abstractPropertyNode
nodeType transformOrigin
 match transform-origin
 extends abstractPropertyNode
nodeType transformStyle
 match transform-style
 extends abstractPropertyNode
nodeType transition
 extends abstractPropertyNode
nodeType transitionDelay
 match transition-delay
 extends abstractPropertyNode
nodeType transitionDuration
 match transition-duration
 extends abstractPropertyNode
nodeType transitionProperty
 match transition-property
 extends abstractPropertyNode
nodeType transitionTimingFunction
 match transition-timing-function
 extends abstractPropertyNode
nodeType unicodeBidi
 match unicode-bidi
 extends abstractPropertyNode
nodeType verticalAlign
 match vertical-align
 extends abstractPropertyNode
nodeType visibility
 extends abstractPropertyNode
nodeType whiteSpace
 match white-space
 extends abstractPropertyNode
nodeType width
 extends abstractPropertyNode
nodeType wordBreak
 match word-break
 extends abstractPropertyNode
nodeType wordSpacing
 match word-spacing
 extends abstractPropertyNode
nodeType wordWrap
 match word-wrap
 extends abstractPropertyNode
nodeType zIndex
 match z-index
 extends abstractPropertyNode
nodeType overscrollBehaviorX
 match overscroll-behavior-x
 extends abstractPropertyNode
nodeType userSelect
 match user-select
 extends abstractPropertyNode
nodeType MsTouchAction
 match -ms-touch-action
 extends abstractPropertyNode
nodeType WebkitUserSelect
 match -webkit-user-select
 extends abstractPropertyNode
nodeType WebkitTouchCallout
 match -webkit-touch-callout
 extends abstractPropertyNode
nodeType MozUserSelect
 match -moz-user-select
 extends abstractPropertyNode
nodeType touchAction
 match touch-action
 extends abstractPropertyNode
nodeType MsUserSelect
 match -ms-user-select
 extends abstractPropertyNode
nodeType KhtmlUserSelect
 match -khtml-user-select`)
      return this._cachedGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        hakon: hakon,
        abstractPropertyNode: abstractPropertyNode,
        errorNode: errorNode,
        selectorNode: selectorNode,
        alignContent: alignContent,
        alignItems: alignItems,
        alignSelf: alignSelf,
        all: all,
        animation: animation,
        animationDelay: animationDelay,
        animationDirection: animationDirection,
        animationDuration: animationDuration,
        animationFillMode: animationFillMode,
        animationIterationCount: animationIterationCount,
        animationName: animationName,
        animationPlayState: animationPlayState,
        animationTimingFunction: animationTimingFunction,
        backfaceVisibility: backfaceVisibility,
        background: background,
        backgroundAttachment: backgroundAttachment,
        backgroundBlendMode: backgroundBlendMode,
        backgroundClip: backgroundClip,
        backgroundColor: backgroundColor,
        backgroundImage: backgroundImage,
        backgroundOrigin: backgroundOrigin,
        backgroundPosition: backgroundPosition,
        backgroundRepeat: backgroundRepeat,
        backgroundSize: backgroundSize,
        border: border,
        borderBottom: borderBottom,
        borderBottomColor: borderBottomColor,
        borderBottomLeftRadius: borderBottomLeftRadius,
        borderBottomRightRadius: borderBottomRightRadius,
        borderBottomStyle: borderBottomStyle,
        borderBottomWidth: borderBottomWidth,
        borderCollapse: borderCollapse,
        borderColor: borderColor,
        borderImage: borderImage,
        borderImageOutset: borderImageOutset,
        borderImageRepeat: borderImageRepeat,
        borderImageSlice: borderImageSlice,
        borderImageSource: borderImageSource,
        borderImageWidth: borderImageWidth,
        borderLeft: borderLeft,
        borderLeftColor: borderLeftColor,
        borderLeftStyle: borderLeftStyle,
        borderLeftWidth: borderLeftWidth,
        borderRadius: borderRadius,
        borderRight: borderRight,
        borderRightColor: borderRightColor,
        borderRightStyle: borderRightStyle,
        borderRightWidth: borderRightWidth,
        borderSpacing: borderSpacing,
        borderStyle: borderStyle,
        borderTop: borderTop,
        borderTopColor: borderTopColor,
        borderTopLeftRadius: borderTopLeftRadius,
        borderTopRightRadius: borderTopRightRadius,
        borderTopStyle: borderTopStyle,
        borderTopWidth: borderTopWidth,
        borderWidth: borderWidth,
        bottom: bottom,
        boxShadow: boxShadow,
        boxSizing: boxSizing,
        captionSide: captionSide,
        clear: clear,
        clip: clip,
        color: color,
        columnCount: columnCount,
        columnFill: columnFill,
        columnGap: columnGap,
        columnRule: columnRule,
        columnRuleColor: columnRuleColor,
        columnRuleStyle: columnRuleStyle,
        columnRuleWidth: columnRuleWidth,
        columnSpan: columnSpan,
        columnWidth: columnWidth,
        columns: columns,
        content: content,
        counterIncrement: counterIncrement,
        counterReset: counterReset,
        cursor: cursor,
        direction: direction,
        display: display,
        emptyCells: emptyCells,
        fill: fill,
        filter: filter,
        flex: flex,
        flexBasis: flexBasis,
        flexDirection: flexDirection,
        flexFlow: flexFlow,
        flexGrow: flexGrow,
        flexShrink: flexShrink,
        flexWrap: flexWrap,
        float: float,
        font: font,
        fontFace: fontFace,
        fontFamily: fontFamily,
        fontSize: fontSize,
        fontSizeAdjust: fontSizeAdjust,
        fontStretch: fontStretch,
        fontStyle: fontStyle,
        fontVariant: fontVariant,
        fontWeight: fontWeight,
        hangingPunctuation: hangingPunctuation,
        height: height,
        justifyContent: justifyContent,
        keyframes: keyframes,
        left: left,
        letterSpacing: letterSpacing,
        lineHeight: lineHeight,
        listStyle: listStyle,
        listStyleImage: listStyleImage,
        listStylePosition: listStylePosition,
        listStyleType: listStyleType,
        margin: margin,
        marginBottom: marginBottom,
        marginLeft: marginLeft,
        marginRight: marginRight,
        marginTop: marginTop,
        maxHeight: maxHeight,
        maxWidth: maxWidth,
        media: media,
        minHeight: minHeight,
        minWidth: minWidth,
        navDown: navDown,
        navIndex: navIndex,
        navLeft: navLeft,
        navRight: navRight,
        navUp: navUp,
        opacity: opacity,
        order: order,
        outline: outline,
        outlineColor: outlineColor,
        outlineOffset: outlineOffset,
        outlineStyle: outlineStyle,
        outlineWidth: outlineWidth,
        overflow: overflow,
        overflowX: overflowX,
        overflowY: overflowY,
        padding: padding,
        paddingBottom: paddingBottom,
        paddingLeft: paddingLeft,
        paddingRight: paddingRight,
        paddingTop: paddingTop,
        pageBreakAfter: pageBreakAfter,
        pageBreakBefore: pageBreakBefore,
        pageBreakInside: pageBreakInside,
        perspective: perspective,
        perspectiveOrigin: perspectiveOrigin,
        position: position,
        quotes: quotes,
        resize: resize,
        right: right,
        tabSize: tabSize,
        tableLayout: tableLayout,
        textAlign: textAlign,
        textAlignLast: textAlignLast,
        textDecoration: textDecoration,
        textDecorationColor: textDecorationColor,
        textDecorationLine: textDecorationLine,
        textDecorationStyle: textDecorationStyle,
        textIndent: textIndent,
        textJustify: textJustify,
        textOverflow: textOverflow,
        textShadow: textShadow,
        textTransform: textTransform,
        top: top,
        transform: transform,
        transformOrigin: transformOrigin,
        transformStyle: transformStyle,
        transition: transition,
        transitionDelay: transitionDelay,
        transitionDuration: transitionDuration,
        transitionProperty: transitionProperty,
        transitionTimingFunction: transitionTimingFunction,
        unicodeBidi: unicodeBidi,
        verticalAlign: verticalAlign,
        visibility: visibility,
        whiteSpace: whiteSpace,
        width: width,
        wordBreak: wordBreak,
        wordSpacing: wordSpacing,
        wordWrap: wordWrap,
        zIndex: zIndex,
        overscrollBehaviorX: overscrollBehaviorX,
        userSelect: userSelect,
        MsTouchAction: MsTouchAction,
        WebkitUserSelect: WebkitUserSelect,
        WebkitTouchCallout: WebkitTouchCallout,
        MozUserSelect: MozUserSelect,
        touchAction: touchAction,
        MsUserSelect: MsUserSelect,
        KhtmlUserSelect: KhtmlUserSelect
      }
    }
  }

  class abstractPropertyNode extends jtree.GrammarBackedNonRootNode {
    getCatchAllNodeConstructor() {
      return errorNode
    }
    get cssValueWord() {
      return this.getWordsFrom(1)
    }
    compile(spaces) {
      return `${spaces}${this.getFirstWord()}: ${this.getContent()};`
    }
  }

  class errorNode extends jtree.GrammarBackedNonRootNode {
    getErrors() {
      return this._getErrorNodeErrors()
    }
    getCatchAllNodeConstructor() {
      return errorNode
    }
    get errorWord() {
      return this.getWordsFrom(1)
    }
  }

  class selectorNode extends jtree.GrammarBackedNonRootNode {
    getFirstWordMap() {
      const map = Object.assign({}, super.getFirstWordMap())
      return Object.assign(map, {
        "align-content": alignContent,
        "align-items": alignItems,
        "align-self": alignSelf,
        all: all,
        animation: animation,
        "animation-delay": animationDelay,
        "animation-direction": animationDirection,
        "animation-duration": animationDuration,
        "animation-fill-mode": animationFillMode,
        "animation-iteration-count": animationIterationCount,
        "animation-name": animationName,
        "animation-play-state": animationPlayState,
        "animation-timing-function": animationTimingFunction,
        "backface-visibility": backfaceVisibility,
        background: background,
        "background-attachment": backgroundAttachment,
        "background-blend-mode": backgroundBlendMode,
        "background-clip": backgroundClip,
        "background-color": backgroundColor,
        "background-image": backgroundImage,
        "background-origin": backgroundOrigin,
        "background-position": backgroundPosition,
        "background-repeat": backgroundRepeat,
        "background-size": backgroundSize,
        border: border,
        "border-bottom": borderBottom,
        "border-bottom-color": borderBottomColor,
        "border-bottom-left-radius": borderBottomLeftRadius,
        "border-bottom-right-radius": borderBottomRightRadius,
        "border-bottom-style": borderBottomStyle,
        "border-bottom-width": borderBottomWidth,
        "border-collapse": borderCollapse,
        "border-color": borderColor,
        "border-image": borderImage,
        "border-image-outset": borderImageOutset,
        "border-image-repeat": borderImageRepeat,
        "border-image-slice": borderImageSlice,
        "border-image-source": borderImageSource,
        "border-image-width": borderImageWidth,
        "border-left": borderLeft,
        "border-left-color": borderLeftColor,
        "border-left-style": borderLeftStyle,
        "border-left-width": borderLeftWidth,
        "border-radius": borderRadius,
        "border-right": borderRight,
        "border-right-color": borderRightColor,
        "border-right-style": borderRightStyle,
        "border-right-width": borderRightWidth,
        "border-spacing": borderSpacing,
        "border-style": borderStyle,
        "border-top": borderTop,
        "border-top-color": borderTopColor,
        "border-top-left-radius": borderTopLeftRadius,
        "border-top-right-radius": borderTopRightRadius,
        "border-top-style": borderTopStyle,
        "border-top-width": borderTopWidth,
        "border-width": borderWidth,
        bottom: bottom,
        "box-shadow": boxShadow,
        "box-sizing": boxSizing,
        "caption-side": captionSide,
        clear: clear,
        clip: clip,
        color: color,
        "column-count": columnCount,
        "column-fill": columnFill,
        "column-gap": columnGap,
        "column-rule": columnRule,
        "column-rule-color": columnRuleColor,
        "column-rule-style": columnRuleStyle,
        "column-rule-width": columnRuleWidth,
        "column-span": columnSpan,
        "column-width": columnWidth,
        columns: columns,
        content: content,
        "counter-increment": counterIncrement,
        "counter-reset": counterReset,
        cursor: cursor,
        direction: direction,
        display: display,
        "empty-cells": emptyCells,
        fill: fill,
        filter: filter,
        flex: flex,
        "flex-basis": flexBasis,
        "flex-direction": flexDirection,
        "flex-flow": flexFlow,
        "flex-grow": flexGrow,
        "flex-shrink": flexShrink,
        "flex-wrap": flexWrap,
        float: float,
        font: font,
        "@font-face": fontFace,
        "font-family": fontFamily,
        "font-size": fontSize,
        "font-size-adjust": fontSizeAdjust,
        "font-stretch": fontStretch,
        "font-style": fontStyle,
        "font-variant": fontVariant,
        "font-weight": fontWeight,
        "hanging-punctuation": hangingPunctuation,
        height: height,
        "justify-content": justifyContent,
        "@keyframes": keyframes,
        left: left,
        "letter-spacing": letterSpacing,
        "line-height": lineHeight,
        "list-style": listStyle,
        "list-style-image": listStyleImage,
        "list-style-position": listStylePosition,
        "list-style-type": listStyleType,
        margin: margin,
        "margin-bottom": marginBottom,
        "margin-left": marginLeft,
        "margin-right": marginRight,
        "margin-top": marginTop,
        "max-height": maxHeight,
        "max-width": maxWidth,
        "@media": media,
        "min-height": minHeight,
        "min-width": minWidth,
        "nav-down": navDown,
        "nav-index": navIndex,
        "nav-left": navLeft,
        "nav-right": navRight,
        "nav-up": navUp,
        opacity: opacity,
        order: order,
        outline: outline,
        "outline-color": outlineColor,
        "outline-offset": outlineOffset,
        "outline-style": outlineStyle,
        "outline-width": outlineWidth,
        overflow: overflow,
        "overflow-x": overflowX,
        "overflow-y": overflowY,
        padding: padding,
        "padding-bottom": paddingBottom,
        "padding-left": paddingLeft,
        "padding-right": paddingRight,
        "padding-top": paddingTop,
        "page-break-after": pageBreakAfter,
        "page-break-before": pageBreakBefore,
        "page-break-inside": pageBreakInside,
        perspective: perspective,
        "perspective-origin": perspectiveOrigin,
        position: position,
        quotes: quotes,
        resize: resize,
        right: right,
        "tab-size": tabSize,
        "table-layout": tableLayout,
        "text-align": textAlign,
        "text-align-last": textAlignLast,
        "text-decoration": textDecoration,
        "text-decoration-color": textDecorationColor,
        "text-decoration-line": textDecorationLine,
        "text-decoration-style": textDecorationStyle,
        "text-indent": textIndent,
        "text-justify": textJustify,
        "text-overflow": textOverflow,
        "text-shadow": textShadow,
        "text-transform": textTransform,
        top: top,
        transform: transform,
        "transform-origin": transformOrigin,
        "transform-style": transformStyle,
        transition: transition,
        "transition-delay": transitionDelay,
        "transition-duration": transitionDuration,
        "transition-property": transitionProperty,
        "transition-timing-function": transitionTimingFunction,
        "unicode-bidi": unicodeBidi,
        "vertical-align": verticalAlign,
        visibility: visibility,
        "white-space": whiteSpace,
        width: width,
        "word-break": wordBreak,
        "word-spacing": wordSpacing,
        "word-wrap": wordWrap,
        "z-index": zIndex,
        "overscroll-behavior-x": overscrollBehaviorX,
        "user-select": userSelect,
        "-ms-touch-action": MsTouchAction,
        "-webkit-user-select": WebkitUserSelect,
        "-webkit-touch-callout": WebkitTouchCallout,
        "-moz-user-select": MozUserSelect,
        "touch-action": touchAction,
        "-ms-user-select": MsUserSelect
      })
    }
    getCatchAllNodeConstructor() {
      return selectorNode
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

  class alignContent extends abstractPropertyNode {}

  class alignItems extends abstractPropertyNode {}

  class alignSelf extends abstractPropertyNode {}

  class all extends abstractPropertyNode {}

  class animation extends abstractPropertyNode {}

  class animationDelay extends abstractPropertyNode {}

  class animationDirection extends abstractPropertyNode {}

  class animationDuration extends abstractPropertyNode {}

  class animationFillMode extends abstractPropertyNode {}

  class animationIterationCount extends abstractPropertyNode {}

  class animationName extends abstractPropertyNode {}

  class animationPlayState extends abstractPropertyNode {}

  class animationTimingFunction extends abstractPropertyNode {}

  class backfaceVisibility extends abstractPropertyNode {}

  class background extends abstractPropertyNode {}

  class backgroundAttachment extends abstractPropertyNode {}

  class backgroundBlendMode extends abstractPropertyNode {}

  class backgroundClip extends abstractPropertyNode {}

  class backgroundColor extends abstractPropertyNode {}

  class backgroundImage extends abstractPropertyNode {}

  class backgroundOrigin extends abstractPropertyNode {}

  class backgroundPosition extends abstractPropertyNode {}

  class backgroundRepeat extends abstractPropertyNode {}

  class backgroundSize extends abstractPropertyNode {}

  class border extends abstractPropertyNode {}

  class borderBottom extends abstractPropertyNode {}

  class borderBottomColor extends abstractPropertyNode {}

  class borderBottomLeftRadius extends abstractPropertyNode {}

  class borderBottomRightRadius extends abstractPropertyNode {}

  class borderBottomStyle extends abstractPropertyNode {}

  class borderBottomWidth extends abstractPropertyNode {}

  class borderCollapse extends abstractPropertyNode {}

  class borderColor extends abstractPropertyNode {}

  class borderImage extends abstractPropertyNode {}

  class borderImageOutset extends abstractPropertyNode {}

  class borderImageRepeat extends abstractPropertyNode {}

  class borderImageSlice extends abstractPropertyNode {}

  class borderImageSource extends abstractPropertyNode {}

  class borderImageWidth extends abstractPropertyNode {}

  class borderLeft extends abstractPropertyNode {}

  class borderLeftColor extends abstractPropertyNode {}

  class borderLeftStyle extends abstractPropertyNode {}

  class borderLeftWidth extends abstractPropertyNode {}

  class borderRadius extends abstractPropertyNode {}

  class borderRight extends abstractPropertyNode {}

  class borderRightColor extends abstractPropertyNode {}

  class borderRightStyle extends abstractPropertyNode {}

  class borderRightWidth extends abstractPropertyNode {}

  class borderSpacing extends abstractPropertyNode {}

  class borderStyle extends abstractPropertyNode {}

  class borderTop extends abstractPropertyNode {}

  class borderTopColor extends abstractPropertyNode {}

  class borderTopLeftRadius extends abstractPropertyNode {}

  class borderTopRightRadius extends abstractPropertyNode {}

  class borderTopStyle extends abstractPropertyNode {}

  class borderTopWidth extends abstractPropertyNode {}

  class borderWidth extends abstractPropertyNode {}

  class bottom extends abstractPropertyNode {}

  class boxShadow extends abstractPropertyNode {}

  class boxSizing extends abstractPropertyNode {}

  class captionSide extends abstractPropertyNode {}

  class clear extends abstractPropertyNode {}

  class clip extends abstractPropertyNode {}

  class color extends abstractPropertyNode {}

  class columnCount extends abstractPropertyNode {}

  class columnFill extends abstractPropertyNode {}

  class columnGap extends abstractPropertyNode {}

  class columnRule extends abstractPropertyNode {}

  class columnRuleColor extends abstractPropertyNode {}

  class columnRuleStyle extends abstractPropertyNode {}

  class columnRuleWidth extends abstractPropertyNode {}

  class columnSpan extends abstractPropertyNode {}

  class columnWidth extends abstractPropertyNode {}

  class columns extends abstractPropertyNode {}

  class content extends abstractPropertyNode {}

  class counterIncrement extends abstractPropertyNode {}

  class counterReset extends abstractPropertyNode {}

  class cursor extends abstractPropertyNode {}

  class direction extends abstractPropertyNode {}

  class display extends abstractPropertyNode {}

  class emptyCells extends abstractPropertyNode {}

  class fill extends abstractPropertyNode {}

  class filter extends abstractPropertyNode {}

  class flex extends abstractPropertyNode {}

  class flexBasis extends abstractPropertyNode {}

  class flexDirection extends abstractPropertyNode {}

  class flexFlow extends abstractPropertyNode {}

  class flexGrow extends abstractPropertyNode {}

  class flexShrink extends abstractPropertyNode {}

  class flexWrap extends abstractPropertyNode {}

  class float extends abstractPropertyNode {}

  class font extends abstractPropertyNode {}

  class fontFace extends abstractPropertyNode {}

  class fontFamily extends abstractPropertyNode {}

  class fontSize extends abstractPropertyNode {}

  class fontSizeAdjust extends abstractPropertyNode {}

  class fontStretch extends abstractPropertyNode {}

  class fontStyle extends abstractPropertyNode {}

  class fontVariant extends abstractPropertyNode {}

  class fontWeight extends abstractPropertyNode {}

  class hangingPunctuation extends abstractPropertyNode {}

  class height extends abstractPropertyNode {}

  class justifyContent extends abstractPropertyNode {}

  class keyframes extends abstractPropertyNode {}

  class left extends abstractPropertyNode {}

  class letterSpacing extends abstractPropertyNode {}

  class lineHeight extends abstractPropertyNode {}

  class listStyle extends abstractPropertyNode {}

  class listStyleImage extends abstractPropertyNode {}

  class listStylePosition extends abstractPropertyNode {}

  class listStyleType extends abstractPropertyNode {}

  class margin extends abstractPropertyNode {}

  class marginBottom extends abstractPropertyNode {}

  class marginLeft extends abstractPropertyNode {}

  class marginRight extends abstractPropertyNode {}

  class marginTop extends abstractPropertyNode {}

  class maxHeight extends abstractPropertyNode {}

  class maxWidth extends abstractPropertyNode {}

  class media extends abstractPropertyNode {}

  class minHeight extends abstractPropertyNode {}

  class minWidth extends abstractPropertyNode {}

  class navDown extends abstractPropertyNode {}

  class navIndex extends abstractPropertyNode {}

  class navLeft extends abstractPropertyNode {}

  class navRight extends abstractPropertyNode {}

  class navUp extends abstractPropertyNode {}

  class opacity extends abstractPropertyNode {}

  class order extends abstractPropertyNode {}

  class outline extends abstractPropertyNode {}

  class outlineColor extends abstractPropertyNode {}

  class outlineOffset extends abstractPropertyNode {}

  class outlineStyle extends abstractPropertyNode {}

  class outlineWidth extends abstractPropertyNode {}

  class overflow extends abstractPropertyNode {}

  class overflowX extends abstractPropertyNode {}

  class overflowY extends abstractPropertyNode {}

  class padding extends abstractPropertyNode {}

  class paddingBottom extends abstractPropertyNode {}

  class paddingLeft extends abstractPropertyNode {}

  class paddingRight extends abstractPropertyNode {}

  class paddingTop extends abstractPropertyNode {}

  class pageBreakAfter extends abstractPropertyNode {}

  class pageBreakBefore extends abstractPropertyNode {}

  class pageBreakInside extends abstractPropertyNode {}

  class perspective extends abstractPropertyNode {}

  class perspectiveOrigin extends abstractPropertyNode {}

  class position extends abstractPropertyNode {}

  class quotes extends abstractPropertyNode {}

  class resize extends abstractPropertyNode {}

  class right extends abstractPropertyNode {}

  class tabSize extends abstractPropertyNode {}

  class tableLayout extends abstractPropertyNode {}

  class textAlign extends abstractPropertyNode {}

  class textAlignLast extends abstractPropertyNode {}

  class textDecoration extends abstractPropertyNode {}

  class textDecorationColor extends abstractPropertyNode {}

  class textDecorationLine extends abstractPropertyNode {}

  class textDecorationStyle extends abstractPropertyNode {}

  class textIndent extends abstractPropertyNode {}

  class textJustify extends abstractPropertyNode {}

  class textOverflow extends abstractPropertyNode {}

  class textShadow extends abstractPropertyNode {}

  class textTransform extends abstractPropertyNode {}

  class top extends abstractPropertyNode {}

  class transform extends abstractPropertyNode {}

  class transformOrigin extends abstractPropertyNode {}

  class transformStyle extends abstractPropertyNode {}

  class transition extends abstractPropertyNode {}

  class transitionDelay extends abstractPropertyNode {}

  class transitionDuration extends abstractPropertyNode {}

  class transitionProperty extends abstractPropertyNode {}

  class transitionTimingFunction extends abstractPropertyNode {}

  class unicodeBidi extends abstractPropertyNode {}

  class verticalAlign extends abstractPropertyNode {}

  class visibility extends abstractPropertyNode {}

  class whiteSpace extends abstractPropertyNode {}

  class width extends abstractPropertyNode {}

  class wordBreak extends abstractPropertyNode {}

  class wordSpacing extends abstractPropertyNode {}

  class wordWrap extends abstractPropertyNode {}

  class zIndex extends abstractPropertyNode {}

  class overscrollBehaviorX extends abstractPropertyNode {}

  class userSelect extends abstractPropertyNode {}

  class MsTouchAction extends abstractPropertyNode {}

  class WebkitUserSelect extends abstractPropertyNode {}

  class WebkitTouchCallout extends abstractPropertyNode {}

  class MozUserSelect extends abstractPropertyNode {}

  class touchAction extends abstractPropertyNode {}

  class MsUserSelect extends abstractPropertyNode {}

  class KhtmlUserSelect extends jtree.GrammarBackedNonRootNode {}

  window.hakon = hakon
}
