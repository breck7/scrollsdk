import { jTableTypes } from "../../worldWideTypes/jTableTypes"
import { VegaTypes, JavascriptNativeTypeNames } from "../JTableConstants"

abstract class AbstractPrimitiveType {
  constructor(typeName: jTableTypes.primitiveType) {
    this._name = typeName
  }

  private _name: jTableTypes.primitiveType

  abstract getAsNativeJavascriptType(val: any): string | number | Date

  getPrimitiveTypeName(): jTableTypes.primitiveType {
    return this._name
  }

  abstract getJavascriptTypeName(): JavascriptNativeTypeNames

  // Abstract methods:

  toDisplayString(value: any, format: string) {
    return value
  }

  getDefaultFormat(columnName: jTableTypes.columnName, sample: any): jTableTypes.displayFormat {
    return ""
  }

  getProbForColumnSpecimen(value: any): jTableTypes.probability {
    return 0
  }

  isInvalidValue(value: any) {
    if (value === undefined || value === "") return true
    return false
  }

  abstract fromStringToNumeric(value: string): number

  abstract isString(): boolean

  abstract isTemporal(): boolean

  abstract isNumeric(): boolean

  abstract getStringExamples(): string[]

  abstract getVegaType(): VegaTypes
}

export { AbstractPrimitiveType }
