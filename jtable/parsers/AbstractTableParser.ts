import { RowStringSpecimen } from "./RowStringSpecimen"
import { jTableTypes } from "../../worldWideTypes/jTableTypes"

abstract class AbstractTableParser {
  isNodeJs() {
    return typeof exports !== "undefined"
  }

  abstract getProbForRowSpecimen(specimen: RowStringSpecimen): jTableTypes.probability
  abstract getExample(): string
  abstract getParserId(): string
  abstract _parseTableInputsFromString(str: string): jTableTypes.tableInputs
}

export { AbstractTableParser }
