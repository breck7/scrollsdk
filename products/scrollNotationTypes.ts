namespace scrollNotationTypes {
  export interface point {
    x: int
    y: int
  }

  export interface wordBoundary {
    lineIndex: int
    charIndex: int
    wordIndex: int
  }

  export interface inheritanceInfo {
    node: particle
    nodeId: string
    parentId: string
  }

  export interface ParticleError {
    getLineIndex(): positiveInt
    getLine(): line
    getExtension(): fileExtension
    getNode(): particle
    getErrorTypeName(): string
    getCellIndex(): positiveInt
    hasSuggestion(): boolean
    getSuggestionMessage(): string
    applySuggestion(): void
    getMessage(): string
  }

  export interface regexTest {
    regex: RegExp
    parser: ParticleParser
  }

  export interface regexTestDef {
    regex: string
    parser: string
  }

  export interface SerializedParticle {
    cells?: string[]
    children?: SerializedParticle[]
  }
  export declare type serializedParticle = string

  export declare type particle = any
  export declare type line = string // no NodeBreakSymbol (\n)
  export declare type int = number
  export declare type positiveInt = number
  export declare type stringMap = { [firstWord: string]: any }
  export declare type queryStringMap = { [firstWord: string]: any }
  export declare type htmlString = string
  export declare type xmlString = string
  export declare type dataTable = any[][]
  export declare type delimiter = string

  export declare type rawRowJavascriptObject = Object

  // A subset of JSON that has the property that it translates to and from JSON and Particles identically.
  // So, this rules out JSON objects with non-string types or spaces in their key name.
  // For closer fidelity to JSON, use Parsers.
  export declare type jsonSubset = string

  export declare type templateString = string // "Hello {name}! You are {age} years old."
  export declare type firstWordPath = string // user emailAddress
  export declare type pathVector = int[] // example: [0,1,1]
  export declare type word = string // string that cannot contain the NodeBreakSymbol, WordBreakSymbol or WordBreakSymbol
  export declare type firstWord = word
  export declare type triInt = int // -1 0 1
  export declare type filepath = string
  export declare type fileContent = string
  export declare type diskMap = { [filepath: string]: fileContent }
  export declare type requirePath = string // something that could go in a "require" statement
  export declare type url = string
  export declare type typeScriptFilePath = filepath
  export declare type particleProgramFilePath = filepath
  export declare type parsersFilePath = filepath
  export declare type fileName = string
  export declare type parsersName = string
  export declare type globPattern = string
  export declare type highlightScope = string
  export declare type fileExtension = string
  export declare type globPath = string // * firstWord firstWord *
  export declare type targetLanguageId = fileExtension
  export declare type sortFn = (nodeA: particle, nodeB: particle) => triInt
  export declare type filterFn = (node: particle, index: int) => boolean
  export declare type forEachFn = (node: particle, index: int) => void
  export declare type everyFn = (node: particle, index: int) => boolean
  export declare type nodeToStringFn = (node: particle) => string
  export declare type formatFunction = (val: string, rowIndex: positiveInt, colIndex: positiveInt) => string
  export declare type typeScriptCode = string
  export declare type javascriptCode = string
  export declare type id = string
  export declare type portNumber = int

  export declare type testParticles = { [testName: string]: (equalMethod: Function) => void }

  export declare type idAccessorFunction = (particle: particle) => id

  export declare type parserId = string // todo: add character restrictions.
  export declare type cellTypeId = string // todo: add character restrictions.

  export declare type semanticVersion = string

  export declare type absoluteFilePath = filepath
  export declare type absoluteFolderPath = absoluteFilePath

  export declare type javascriptClassPath = string // "scrollsdk.Foo.Bar"

  export declare type children = string | Object | particle | any // todo: specify better.

  export declare type ParticleParser = Function // A constructor extending ParticleParser
  export declare type ParticleProgramParser = Function // A constructor extending AbstractRuntimeParticle
  export declare type particleProgram = particle // A constructor extending AbstractRuntimeParticle

  export declare type upgradeFunction = (particle: particle) => particle
  export declare type upgradeToMap = { [toVersion: string]: upgradeFunction }
  export declare type upgradeFromMap = { [fromVersion: string]: upgradeToMap }

  export declare type firstWordToParserMap = { [firstWord: string]: ParticleParser }
}

export { scrollNotationTypes }
