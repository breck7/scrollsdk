import { AbstractPrimitiveType } from "./AbstractPrimitiveType"

import { VegaTypes, JavascriptNativeTypeNames } from "../JTableConstants"

abstract class AbstractStringCol extends AbstractPrimitiveType {
  isString() {
    return true
  }
  isNumeric() {
    return false
  }
  getStringExamples() {
    return ["Anything"]
  }

  getVegaType() {
    return VegaTypes.nominal
  }

  getJavascriptTypeName() {
    return JavascriptNativeTypeNames.string
  }

  fromStringToNumeric() {
    return undefined
  }

  isTemporal() {
    return false
  }

  getAsNativeJavascriptType(val: any): string {
    return val === undefined ? "" : val.toString()
  }
}

class StringCol extends AbstractStringCol {}

class UrlCol extends AbstractStringCol {
  getStringExamples() {
    return ["www.foo.com"]
  }
}

class TextCol extends AbstractStringCol {}

abstract class AbstractCodeCol extends AbstractStringCol {}

class CodeCol extends AbstractCodeCol {
  getStringExamples() {
    return ["i++"]
  }
}

class HTMLCol extends AbstractCodeCol {
  getStringExamples() {
    return ["<b>hi</b>"]
  }
}

abstract class AbstractPathCol extends AbstractStringCol {}

// filepath
class PathCol extends AbstractPathCol {}

// Directory
class DirCol extends AbstractPathCol {}

export { StringCol, UrlCol, TextCol, CodeCol, HTMLCol, PathCol, DirCol }
