import { AbstractPrimitiveType } from "./AbstractPrimitiveType"

import { VegaTypes, JavascriptNativeTypeNames } from "../JTableConstants"

class BooleanType extends AbstractPrimitiveType {
  getAsNativeJavascriptType(val: any): number {
    // todo: handle false, etc
    return val ? 1 : 0
  }

  getJavascriptTypeName() {
    return JavascriptNativeTypeNames.boolean
  }

  fromStringToNumeric(val: any) {
    return val.toString() === "true" ? 1 : 0
  }

  getStringExamples() {
    return ["true"]
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

export { BooleanType }
