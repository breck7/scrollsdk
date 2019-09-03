enum VegaTypes {
  nominal = "nominal",
  ordinal = "ordinal",
  geojson = "geojson",
  quantitative = "quantitative",
  temporal = "temporal"
}

enum ComparisonOperators {
  lessThan = "<",
  greaterThan = ">",
  lessThanOrEqual = "<=",
  greaterThanOrEqual = ">=",
  equal = "=",
  notEqual = "!="
}

enum JavascriptNativeTypeNames {
  number = "number",
  string = "string",
  Date = "Date",
  boolean = "boolean"
}

enum TableParserIds {
  csv = "csv",
  ssv = "ssv",
  psv = "psv",
  tsv = "tsv",
  xml = "xml",
  html = "html",
  spaced = "spaced",
  tree = "tree",
  treeRows = "treeRows",
  sections = "sections",
  txt = "txt",
  list = "list",
  text = "text",
  jsonVector = "jsonVector",
  json = "json",
  jsonDataTableWithHeader = "jsonDataTableWithHeader",
  jsonMap = "jsonMap",
  jsonCounts = "jsonCounts"
}

export { VegaTypes, ComparisonOperators, JavascriptNativeTypeNames, TableParserIds }
