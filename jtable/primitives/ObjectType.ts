import { AbstractPrimitiveType } from "./AbstractPrimitiveType"

import { VegaTypes, JavascriptNativeTypeNames } from "../JTableConstants"

class ObjectType extends AbstractPrimitiveType {
  getAsNativeJavascriptType(val: any): string {
    return val === undefined ? "" : val.toString()
  }
  // todo: not sure about this.
  getStringExamples() {
    return ["{score: 10}"]
  }

  fromStringToNumeric() {
    return undefined
  }

  getJavascriptTypeName() {
    return JavascriptNativeTypeNames.string
  }

  getVegaType() {
    return VegaTypes.nominal
  }

  isNumeric() {
    return false
  }

  isString() {
    return false
  }

  isTemporal() {
    return false
  }
}

export { ObjectType }
