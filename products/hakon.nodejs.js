#! /usr/bin/env node
{
  const { jtree } = require("../index.js")

  class hakonNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        selectorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), { comment: commentNode }),
        undefined
      )
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
    static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(`tooling onsave jtree build produceLang hakon
anyCell
keywordCell
commentKeywordCell
 extends keywordCell
 highlightScope comment
 enum comment
extraCell
 highlightScope invalid
cssValueCell
 highlightScope constant.numeric
selectorCell
 highlightScope keyword.control
 examples body h1
 todo add html tags, css and ids selector regexes, etc
vendorPrefixPropertyKeywordCell
 description Properties like -moz-column-fill
 highlightScope variable.function
 extends keywordCell
propertyKeywordCell
 highlightScope variable.function
 extends keywordCell
 todo Where are these coming from? Can we add a url link
 enum align-content align-items align-self all animation animation-delay animation-direction animation-duration animation-fill-mode animation-iteration-count animation-name animation-play-state animation-timing-function backface-visibility background background-attachment background-blend-mode background-clip background-color background-image background-origin background-position background-repeat background-size border border-bottom border-bottom-color border-bottom-left-radius border-bottom-right-radius border-bottom-style border-bottom-width border-collapse border-color border-image border-image-outset border-image-repeat border-image-slice border-image-source border-image-width border-left border-left-color border-left-style border-left-width border-radius border-right border-right-color border-right-style border-right-width border-spacing border-style border-top border-top-color border-top-left-radius border-top-right-radius border-top-style border-top-width border-width bottom box-shadow box-sizing break-inside caption-side clear clip color column-count column-fill column-gap column-rule column-rule-color column-rule-style column-rule-width column-span column-width columns content counter-increment counter-reset cursor direction display empty-cells fill filter flex flex-basis flex-direction flex-flow flex-grow flex-shrink flex-wrap float font @font-face font-family font-size font-size-adjust font-stretch font-style font-variant font-weight  hanging-punctuation height hyphens justify-content @keyframes left letter-spacing line-height list-style list-style-image list-style-position list-style-type margin margin-bottom margin-left margin-right margin-top max-height max-width @media min-height min-width nav-down nav-index nav-left nav-right nav-up opacity order outline outline-color outline-offset outline-style outline-width overflow overflow-x overflow-y padding padding-bottom padding-left padding-right padding-top page-break-after page-break-before page-break-inside perspective perspective-origin position quotes resize right tab-size table-layout text-align text-align-last text-decoration text-decoration-color text-decoration-line text-decoration-style text-indent text-justify text-overflow text-shadow text-transform top transform transform-origin transform-style transition transition-delay transition-duration transition-property transition-timing-function unicode-bidi vertical-align visibility white-space width word-break word-spacing word-wrap z-index overscroll-behavior-x user-select -ms-touch-action -webkit-user-select -webkit-touch-callout -moz-user-select touch-action -ms-user-select -khtml-user-select gap grid-auto-flow grid-column grid-column-end grid-column-gap grid-column-start grid-gap grid-row grid-row-end grid-row-gap grid-row-start grid-template-columns grid-template-rows justify-items justify-self
errorCell
 highlightScope invalid
commentCell
 highlightScope comment
hakonNode
 root
 todo Add variables?
 description A prefix Tree Language that compiles to CSS
 compilesTo css
 inScope commentNode
 catchAllNodeType selectorNode
 javascript
  getSelector() {
   return ""
  }
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
propertyNode
 catchAllCellType cssValueCell
 catchAllNodeType errorNode
 javascript
  compile(spaces) {
   return \`\${spaces}\${this.getFirstWord()}: \${this.getContent()};\`
  }
 cells propertyKeywordCell
variableNode
 extends propertyNode
 pattern --
browserPrefixPropertyNode
 extends propertyNode
 pattern ^\\-\\w.+
 cells vendorPrefixPropertyKeywordCell
errorNode
 catchAllNodeType errorNode
 catchAllCellType errorCell
 baseNodeType errorNode
commentNode
 cells commentKeywordCell
 catchAllCellType commentCell
 catchAllNodeType commentNode
selectorNode
 inScope propertyNode variableNode commentNode
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
   const propertyNodes = this.getChildren().filter(node => node.doesExtend("propertyNode"))
   if (!propertyNodes.length) return ""
   const spaces = "  "
   return \`\${this.getSelector()} {
  \${propertyNodes.map(child => child.compile(spaces)).join("\\n")}
  }\\n\`
  }
 cells selectorCell`)
    getHandGrammarProgram() {
      return this.constructor.cachedHandGrammarProgramRoot
    }
    static getNodeTypeMap() {
      return {
        hakonNode: hakonNode,
        propertyNode: propertyNode,
        variableNode: variableNode,
        browserPrefixPropertyNode: browserPrefixPropertyNode,
        errorNode: errorNode,
        commentNode: commentNode,
        selectorNode: selectorNode
      }
    }
  }

  class propertyNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(errorNode, undefined, undefined)
    }
    get propertyKeywordCell() {
      return this.getWord(0)
    }
    get cssValueCell() {
      return this.getWordsFrom(1)
    }
    compile(spaces) {
      return `${spaces}${this.getFirstWord()}: ${this.getContent()};`
    }
  }

  class variableNode extends propertyNode {}

  class browserPrefixPropertyNode extends propertyNode {
    get vendorPrefixPropertyKeywordCell() {
      return this.getWord(0)
    }
  }

  class errorNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(errorNode, undefined, undefined)
    }
    getErrors() {
      return this._getErrorNodeErrors()
    }
    get errorCell() {
      return this.getWordsFrom(0)
    }
  }

  class commentNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(commentNode, undefined, undefined)
    }
    get commentKeywordCell() {
      return this.getWord(0)
    }
    get commentCell() {
      return this.getWordsFrom(1)
    }
  }

  class selectorNode extends jtree.GrammarBackedNode {
    createParser() {
      return new jtree.TreeNode.Parser(
        selectorNode,
        Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {
          "border-bottom-right-radius": propertyNode,
          "transition-timing-function": propertyNode,
          "animation-iteration-count": propertyNode,
          "animation-timing-function": propertyNode,
          "border-bottom-left-radius": propertyNode,
          "border-top-right-radius": propertyNode,
          "border-top-left-radius": propertyNode,
          "background-attachment": propertyNode,
          "background-blend-mode": propertyNode,
          "text-decoration-color": propertyNode,
          "text-decoration-style": propertyNode,
          "overscroll-behavior-x": propertyNode,
          "-webkit-touch-callout": propertyNode,
          "grid-template-columns": propertyNode,
          "animation-play-state": propertyNode,
          "text-decoration-line": propertyNode,
          "animation-direction": propertyNode,
          "animation-fill-mode": propertyNode,
          "backface-visibility": propertyNode,
          "background-position": propertyNode,
          "border-bottom-color": propertyNode,
          "border-bottom-style": propertyNode,
          "border-bottom-width": propertyNode,
          "border-image-outset": propertyNode,
          "border-image-repeat": propertyNode,
          "border-image-source": propertyNode,
          "hanging-punctuation": propertyNode,
          "list-style-position": propertyNode,
          "transition-duration": propertyNode,
          "transition-property": propertyNode,
          "-webkit-user-select": propertyNode,
          "animation-duration": propertyNode,
          "border-image-slice": propertyNode,
          "border-image-width": propertyNode,
          "border-right-color": propertyNode,
          "border-right-style": propertyNode,
          "border-right-width": propertyNode,
          "perspective-origin": propertyNode,
          "-khtml-user-select": propertyNode,
          "grid-template-rows": propertyNode,
          "background-origin": propertyNode,
          "background-repeat": propertyNode,
          "border-left-color": propertyNode,
          "border-left-style": propertyNode,
          "border-left-width": propertyNode,
          "column-rule-color": propertyNode,
          "column-rule-style": propertyNode,
          "column-rule-width": propertyNode,
          "counter-increment": propertyNode,
          "page-break-before": propertyNode,
          "page-break-inside": propertyNode,
          "grid-column-start": propertyNode,
          "background-color": propertyNode,
          "background-image": propertyNode,
          "border-top-color": propertyNode,
          "border-top-style": propertyNode,
          "border-top-width": propertyNode,
          "font-size-adjust": propertyNode,
          "list-style-image": propertyNode,
          "page-break-after": propertyNode,
          "transform-origin": propertyNode,
          "transition-delay": propertyNode,
          "-ms-touch-action": propertyNode,
          "-moz-user-select": propertyNode,
          "animation-delay": propertyNode,
          "background-clip": propertyNode,
          "background-size": propertyNode,
          "border-collapse": propertyNode,
          "justify-content": propertyNode,
          "list-style-type": propertyNode,
          "text-align-last": propertyNode,
          "text-decoration": propertyNode,
          "transform-style": propertyNode,
          "-ms-user-select": propertyNode,
          "grid-column-end": propertyNode,
          "grid-column-gap": propertyNode,
          "animation-name": propertyNode,
          "border-spacing": propertyNode,
          "flex-direction": propertyNode,
          "letter-spacing": propertyNode,
          "outline-offset": propertyNode,
          "padding-bottom": propertyNode,
          "text-transform": propertyNode,
          "vertical-align": propertyNode,
          "grid-auto-flow": propertyNode,
          "grid-row-start": propertyNode,
          "align-content": propertyNode,
          "border-bottom": propertyNode,
          "border-radius": propertyNode,
          "counter-reset": propertyNode,
          "margin-bottom": propertyNode,
          "outline-color": propertyNode,
          "outline-style": propertyNode,
          "outline-width": propertyNode,
          "padding-right": propertyNode,
          "text-overflow": propertyNode,
          "justify-items": propertyNode,
          "border-color": propertyNode,
          "border-image": propertyNode,
          "border-right": propertyNode,
          "border-style": propertyNode,
          "border-width": propertyNode,
          "break-inside": propertyNode,
          "caption-side": propertyNode,
          "column-count": propertyNode,
          "column-width": propertyNode,
          "font-stretch": propertyNode,
          "font-variant": propertyNode,
          "margin-right": propertyNode,
          "padding-left": propertyNode,
          "table-layout": propertyNode,
          "text-justify": propertyNode,
          "unicode-bidi": propertyNode,
          "word-spacing": propertyNode,
          "touch-action": propertyNode,
          "grid-row-end": propertyNode,
          "grid-row-gap": propertyNode,
          "justify-self": propertyNode,
          "align-items": propertyNode,
          "border-left": propertyNode,
          "column-fill": propertyNode,
          "column-rule": propertyNode,
          "column-span": propertyNode,
          "empty-cells": propertyNode,
          "flex-shrink": propertyNode,
          "font-family": propertyNode,
          "font-weight": propertyNode,
          "line-height": propertyNode,
          "margin-left": propertyNode,
          "padding-top": propertyNode,
          perspective: propertyNode,
          "text-indent": propertyNode,
          "text-shadow": propertyNode,
          "white-space": propertyNode,
          "user-select": propertyNode,
          "grid-column": propertyNode,
          "align-self": propertyNode,
          background: propertyNode,
          "border-top": propertyNode,
          "box-shadow": propertyNode,
          "box-sizing": propertyNode,
          "column-gap": propertyNode,
          "flex-basis": propertyNode,
          "@font-face": propertyNode,
          "font-style": propertyNode,
          "@keyframes": propertyNode,
          "list-style": propertyNode,
          "margin-top": propertyNode,
          "max-height": propertyNode,
          "min-height": propertyNode,
          "overflow-x": propertyNode,
          "overflow-y": propertyNode,
          "text-align": propertyNode,
          transition: propertyNode,
          visibility: propertyNode,
          "word-break": propertyNode,
          animation: propertyNode,
          direction: propertyNode,
          "flex-flow": propertyNode,
          "flex-grow": propertyNode,
          "flex-wrap": propertyNode,
          "font-size": propertyNode,
          "max-width": propertyNode,
          "min-width": propertyNode,
          "nav-index": propertyNode,
          "nav-right": propertyNode,
          transform: propertyNode,
          "word-wrap": propertyNode,
          "nav-down": propertyNode,
          "nav-left": propertyNode,
          overflow: propertyNode,
          position: propertyNode,
          "tab-size": propertyNode,
          "grid-gap": propertyNode,
          "grid-row": propertyNode,
          columns: propertyNode,
          content: propertyNode,
          display: propertyNode,
          hyphens: propertyNode,
          opacity: propertyNode,
          outline: propertyNode,
          padding: propertyNode,
          "z-index": propertyNode,
          border: propertyNode,
          bottom: propertyNode,
          cursor: propertyNode,
          filter: propertyNode,
          height: propertyNode,
          margin: propertyNode,
          "@media": propertyNode,
          "nav-up": propertyNode,
          quotes: propertyNode,
          resize: propertyNode,
          clear: propertyNode,
          color: propertyNode,
          float: propertyNode,
          order: propertyNode,
          right: propertyNode,
          width: propertyNode,
          clip: propertyNode,
          fill: propertyNode,
          flex: propertyNode,
          font: propertyNode,
          left: propertyNode,
          all: propertyNode,
          top: propertyNode,
          gap: propertyNode,
          "": propertyNode,
          comment: commentNode
        }),
        [{ regex: /--/, nodeConstructor: variableNode }, { regex: /^\-\w.+/, nodeConstructor: browserPrefixPropertyNode }]
      )
    }
    get selectorCell() {
      return this.getWord(0)
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
      const propertyNodes = this.getChildren().filter(node => node.doesExtend("propertyNode"))
      if (!propertyNodes.length) return ""
      const spaces = "  "
      return `${this.getSelector()} {
${propertyNodes.map(child => child.compile(spaces)).join("\n")}
}\n`
    }
  }

  module.exports = hakonNode
  hakonNode

  if (!module.parent) new hakonNode(jtree.TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
