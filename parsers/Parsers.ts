const { Utils } = require("../products/Utils.js")
const { Particle, ParticleAtom, ExtendibleParticle, AbstractExtendibleParticle } = require("../products/Particle.js")

import { particlesTypes } from "../products/particlesTypes"

interface AbstractRuntimeProgramConstructorInterface {
  new (code?: string): ParserBackedParticle
}

declare type parserInfo = { firstAtomMap: { [firstAtom: string]: parserDefinitionParser }; regexTests: particlesTypes.regexTestDef[] }

// Compiled language parsers will include these files:
const GlobalNamespaceAdditions: particlesTypes.stringMap = {
  Utils: "Utils.js",
  Particle: "Particle.js",
  HandParsersProgram: "Parsers.js",
  ParserBackedParticle: "Parsers.js"
}

interface SimplePredictionModel {
  matrix: particlesTypes.int[][]
  idToIndex: { [id: string]: particlesTypes.int }
  indexToId: { [index: number]: string }
}

enum ParsersConstantsCompiler {
  stringTemplate = "stringTemplate", // replacement instructions
  indentCharacter = "indentCharacter",
  catchAllAtomDelimiter = "catchAllAtomDelimiter",
  openSubparticles = "openSubparticles",
  joinSubparticlesWith = "joinSubparticlesWith",
  closeSubparticles = "closeSubparticles"
}

enum ParsersConstantsMisc {
  doNotSynthesize = "doNotSynthesize"
}

enum PreludeAtomTypeIds {
  anyAtom = "anyAtom",
  keywordAtom = "keywordAtom",
  extraAtomAtom = "extraAtomAtom",
  floatAtom = "floatAtom",
  numberAtom = "numberAtom",
  bitAtom = "bitAtom",
  boolAtom = "boolAtom",
  intAtom = "intAtom"
}

enum ParsersConstantsConstantTypes {
  boolean = "boolean",
  string = "string",
  int = "int",
  float = "float"
}

enum ParsersBundleFiles {
  package = "package.json",
  readme = "readme.md",
  indexHtml = "index.html",
  indexJs = "index.js",
  testJs = "test.js"
}

enum ParsersAtomParser {
  prefix = "prefix",
  postfix = "postfix",
  omnifix = "omnifix"
}

enum ParsersConstants {
  // particle types
  extensions = "extensions",
  comment = "//",
  parser = "parser",
  atomType = "atomType",

  parsersFileExtension = "parsers",

  abstractParserPrefix = "abstract",
  parserSuffix = "Parser",
  atomTypeSuffix = "Atom",

  // error check time
  regex = "regex", // temporary?
  reservedAtoms = "reservedAtoms", // temporary?
  enumFromAtomTypes = "enumFromAtomTypes", // temporary?
  enum = "enum", // temporary?
  examples = "examples",
  min = "min",
  max = "max",

  // baseParsers
  baseParser = "baseParser",
  blobParser = "blobParser",
  errorParser = "errorParser",

  // parse time
  extends = "extends",
  root = "root",
  crux = "crux",
  cruxFromId = "cruxFromId",
  pattern = "pattern",
  inScope = "inScope",
  atoms = "atoms",
  listDelimiter = "listDelimiter",
  contentKey = "contentKey",
  subparticlesKey = "subparticlesKey",
  uniqueFirstAtom = "uniqueFirstAtom",
  catchAllAtomType = "catchAllAtomType",
  atomParser = "atomParser",
  catchAllParser = "catchAllParser",
  constants = "constants",
  required = "required", // Require this parser to be present in a particle or program
  single = "single", // Have at most 1 of these
  uniqueLine = "uniqueLine", // Can't have duplicate lines.
  tags = "tags",

  _rootNodeJsHeader = "_rootNodeJsHeader", // todo: remove

  // default catchAll parser
  BlobParser = "BlobParser",
  DefaultRootParser = "DefaultRootParser",

  // code
  javascript = "javascript",

  // compile time
  compilerParser = "compiler",
  compilesTo = "compilesTo",

  // develop time
  description = "description",
  example = "example",
  popularity = "popularity", // todo: remove. switch to conditional frequencies. potentially do that outside this core lang.
  paint = "paint"
}

class TypedAtom extends ParticleAtom {
  private _type: string
  constructor(particle: Particle, atomIndex: number, type: string) {
    super(particle, atomIndex)
    this._type = type
  }
  get type() {
    return this._type
  }
  toString() {
    return this.atom + ":" + this.type
  }
}

// todo: can we merge these methods into base Particle and ditch this class?
abstract class ParserBackedParticle extends Particle {
  private _definition: AbstractParserDefinitionParser | HandParsersProgram | parserDefinitionParser
  get definition(): AbstractParserDefinitionParser | HandParsersProgram | parserDefinitionParser {
    if (this._definition) return this._definition

    this._definition = this.isRoot() ? this.handParsersProgram : this.parent.definition.getParserDefinitionByParserId(this.constructor.name)
    return this._definition
  }

  get rootParsersParticles() {
    return this.definition.root
  }

  getAutocompleteResults(partialAtom: string, atomIndex: particlesTypes.positiveInt) {
    return atomIndex === 0 ? this._getAutocompleteResultsForFirstAtom(partialAtom) : this._getAutocompleteResultsForAtom(partialAtom, atomIndex)
  }

  makeError(message: string) {
    return new ParserDefinedError(this, message)
  }

  private _particleIndex: {
    [parserId: string]: ParserBackedParticle[]
  }

  protected get particleIndex() {
    // StringMap<int> {firstAtom: index}
    // When there are multiple tails with the same firstAtom, _index stores the last content.
    // todo: change the above behavior: when a collision occurs, create an array.
    return this._particleIndex || this._makeParticleIndex()
  }

  _clearIndex() {
    delete this._particleIndex
    return super._clearIndex()
  }

  protected _makeIndex(startAt = 0) {
    if (this._particleIndex) this._makeParticleIndex(startAt)
    return super._makeIndex(startAt)
  }

  protected _makeParticleIndex(startAt = 0) {
    if (!this._particleIndex || !startAt) this._particleIndex = {}
    const particles = this._getSubparticlesArray() as ParserBackedParticle[]
    const newIndex = this._particleIndex
    const length = particles.length

    for (let index = startAt; index < length; index++) {
      const particle = particles[index]
      const ancestors = Array.from(particle.definition._getAncestorSet()).forEach(id => {
        if (!newIndex[id]) newIndex[id] = []
        newIndex[id].push(particle)
      })
    }

    return newIndex
  }

  getSubparticleInstancesOfParserId(parserId: particlesTypes.parserId): ParserBackedParticle[] {
    return this.particleIndex[parserId] || []
  }

  doesExtend(parserId: particlesTypes.parserId) {
    return this.definition._doesExtend(parserId)
  }

  _getErrorParserErrors() {
    return [this.firstAtom ? new UnknownParserError(this) : new BlankLineError(this)]
  }

  _getBlobParserCatchAllParser() {
    return BlobParser
  }

  private _getAutocompleteResultsForFirstAtom(partialAtom: string) {
    const keywordMap = this.definition.firstAtomMapWithDefinitions
    let keywords: string[] = Object.keys(keywordMap)

    if (partialAtom) keywords = keywords.filter(keyword => keyword.includes(partialAtom))

    return keywords
      .map(keyword => {
        const def = keywordMap[keyword]
        if (def.suggestInAutocomplete === false) return false
        const description = def.description
        return {
          text: keyword,
          displayText: keyword + (description ? " " + description : "")
        }
      })
      .filter(i => i)
  }

  private _getAutocompleteResultsForAtom(partialAtom: string, atomIndex: particlesTypes.positiveInt) {
    // todo: root should be [] correct?
    const atom = this.parsedAtoms[atomIndex]
    return atom ? atom.getAutoCompleteAtoms(partialAtom) : []
  }

  // note: this is overwritten by the root particle of a runtime parsers program.
  // some of the magic that makes this all work. but maybe there's a better way.
  get handParsersProgram(): HandParsersProgram {
    if (this.isRoot()) throw new Error(`Root particle without getHandParsersProgram defined.`)
    return (<any>this.root).handParsersProgram
  }

  getRunTimeEnumOptions(atom: AbstractParsersBackedAtom<any>): string[] {
    return undefined
  }

  getRunTimeEnumOptionsForValidation(atom: AbstractParsersBackedAtom<any>): string[] {
    return this.getRunTimeEnumOptions(atom)
  }

  private _sortParticlesByInScopeOrder() {
    const parserOrder = this.definition._getMyInScopeParserIds()
    if (!parserOrder.length) return this
    const orderMap: particlesTypes.stringMap = {}
    parserOrder.forEach((atom, index) => (orderMap[atom] = index))
    this.sort(Utils.makeSortByFn((runtimeParticle: ParserBackedParticle) => orderMap[runtimeParticle.definition.parserIdFromDefinition]))
    return this
  }

  protected get requiredParticleErrors() {
    const errors: particlesTypes.ParticleError[] = []
    Object.values(this.definition.firstAtomMapWithDefinitions).forEach(def => {
      if (def.isRequired() && !this.particleIndex[def.id]) errors.push(new MissingRequiredParserError(this, def.id))
    })
    return errors
  }

  get programAsAtoms() {
    // todo: what is this?
    return this.topDownArray.map((particle: ParserBackedParticle) => {
      const atoms = particle.parsedAtoms
      let indents = particle.getIndentLevel() - 1
      while (indents) {
        atoms.unshift(undefined)
        indents--
      }
      return atoms
    })
  }

  get programWidth() {
    return Math.max(...this.programAsAtoms.map(line => line.length))
  }

  get allTypedAtoms() {
    const atoms: TypedAtom[] = []
    this.topDownArray.forEach((particle: ParserBackedParticle) => particle.atomTypes.forEach((atom, index) => atoms.push(new TypedAtom(particle, index, atom.atomTypeId))))
    return atoms
  }

  findAllAtomsWithAtomType(atomTypeId: particlesTypes.atomTypeId) {
    return this.allTypedAtoms.filter(typedAtom => typedAtom.type === atomTypeId)
  }

  findAllParticlesWithParser(parserId: particlesTypes.parserId) {
    return this.topDownArray.filter((particle: ParserBackedParticle) => particle.definition.parserIdFromDefinition === parserId)
  }

  toAtomTypeParticles() {
    return this.topDownArray.map(subparticle => subparticle.indentation + subparticle.lineAtomTypes).join("\n")
  }

  getParseTable(maxColumnWidth = 40) {
    const particle = new Particle(this.toAtomTypeParticles())
    return new Particle(
      particle.topDownArray.map((particle, lineNumber) => {
        const sourceParticle = this.particleAtLine(lineNumber)
        const errs = sourceParticle.getErrors()
        const errorCount = errs.length
        const obj: any = {
          lineNumber: lineNumber,
          source: sourceParticle.indentation + sourceParticle.getLine(),
          parser: sourceParticle.constructor.name,
          atomTypes: particle.content,
          errorCount: errorCount
        }
        if (errorCount) obj.errorMessages = errs.map(err => err.message).join(";")
        return obj
      })
    ).toFormattedTable(maxColumnWidth)
  }

  // Helper method for selecting potential parsers needed to update parsers file.
  get invalidParsers() {
    return Array.from(
      new Set(
        this.getAllErrors()
          .filter(err => err instanceof UnknownParserError)
          .map(err => err.getParticle().firstAtom)
      )
    )
  }

  private _getAllAutoCompleteAtoms() {
    return this.getAllAtomBoundaryCoordinates().map(coordinate => {
      const results = this.getAutocompleteResultsAt(coordinate.lineIndex, coordinate.charIndex)
      return {
        lineIndex: coordinate.lineIndex,
        charIndex: coordinate.charIndex,
        atomIndex: coordinate.atomIndex,
        atom: results.atom,
        suggestions: results.matches
      }
    })
  }

  toAutoCompleteCube(fillChar = "") {
    const particles: any[] = [this.clone()]
    const filled = this.clone().fill(fillChar)
    this._getAllAutoCompleteAtoms().forEach(hole => {
      hole.suggestions.forEach((suggestion, index) => {
        if (!particles[index + 1]) particles[index + 1] = filled.clone()
        particles[index + 1].particleAtLine(hole.lineIndex).setAtom(hole.atomIndex, suggestion.text)
      })
    })
    return new Particle(particles)
  }

  toAutoCompleteTable() {
    return new Particle(
      <any>this._getAllAutoCompleteAtoms().map(result => {
        result.suggestions = <any>result.suggestions.map((particle: any) => particle.text).join(" ")
        return result
      })
    ).asTable
  }

  getAutocompleteResultsAt(lineIndex: particlesTypes.positiveInt, charIndex: particlesTypes.positiveInt) {
    const lineParticle = this.particleAtLine(lineIndex) || this
    const particleInScope = <ParserBackedParticle>lineParticle.getParticleInScopeAtCharIndex(charIndex)

    // todo: add more tests
    // todo: second param this.subparticlesToString()
    // todo: change to getAutocomplete definitions

    const atomIndex = lineParticle.getAtomIndexAtCharacterIndex(charIndex)
    const atomProperties = lineParticle.getAtomProperties(atomIndex)
    return {
      startCharIndex: atomProperties.startCharIndex,
      endCharIndex: atomProperties.endCharIndex,
      atom: atomProperties.atom,
      matches: particleInScope.getAutocompleteResults(atomProperties.atom, atomIndex)
    }
  }

  private _sortWithParentParsersUpTop() {
    const lineage = new HandParsersProgram(this.toString()).parserLineage
    const rank: particlesTypes.stringMap = {}
    lineage.topDownArray.forEach((particle, index) => {
      rank[particle.getAtom(0)] = index
    })
    const particleAFirst = -1
    const particleBFirst = 1
    this.sort((particleA, particleB) => {
      const particleARank = rank[particleA.getAtom(0)]
      const particleBRank = rank[particleB.getAtom(0)]
      return particleARank < particleBRank ? particleAFirst : particleBFirst
    })
    return this
  }

  format() {
    if (this.isRoot()) {
      this._sortParticlesByInScopeOrder()

      try {
        this._sortWithParentParsersUpTop()
      } catch (err) {
        console.log(`Warning: ${err}`)
      }
    }
    this.topDownArray.forEach(subparticle => subparticle.format())
    return this
  }

  getParserUsage(filepath = "") {
    // returns a report on what parsers from its language the program uses
    const usage = new Particle()
    const handParsersProgram = this.handParsersProgram
    handParsersProgram.validConcreteAndAbstractParserDefinitions.forEach((def: AbstractParserDefinitionParser) => {
      const requiredAtomTypeIds = def.atomParser.getRequiredAtomTypeIds()
      usage.appendLine([def.parserIdFromDefinition, "line-id", "parser", requiredAtomTypeIds.join(" ")].join(" "))
    })
    this.topDownArray.forEach((particle: ParserBackedParticle, lineNumber: number) => {
      const stats = usage.getParticle(particle.parserId)
      stats.appendLine([filepath + "-" + lineNumber, particle.atoms.join(" ")].join(" "))
    })
    return usage
  }

  toPaintParticles() {
    return this.topDownArray.map((subparticle: ParserBackedParticle) => subparticle.indentation + subparticle.getLinePaints()).join("\n")
  }

  toDefinitionLineNumberParticles() {
    return this.topDownArray.map((subparticle: ParserBackedParticle) => subparticle.definition.lineNumber + " " + subparticle.indentation + subparticle.atomDefinitionLineNumbers.join(" ")).join("\n")
  }

  get asAtomTypeParticlesWithParserIds() {
    return this.topDownArray.map((subparticle: ParserBackedParticle) => subparticle.constructor.name + this.atomBreakSymbol + subparticle.indentation + subparticle.lineAtomTypes).join("\n")
  }

  toPreludeAtomTypeParticlesWithParserIds() {
    return this.topDownArray.map((subparticle: ParserBackedParticle) => subparticle.constructor.name + this.atomBreakSymbol + subparticle.indentation + subparticle.getLineAtomPreludeTypes()).join("\n")
  }

  get asParticlesWithParsers() {
    return this.topDownArray.map((subparticle: ParserBackedParticle) => subparticle.constructor.name + this.atomBreakSymbol + subparticle.indentation + subparticle.getLine()).join("\n")
  }

  getAtomPaintAtPosition(lineIndex: number, atomIndex: number): particlesTypes.paint | undefined {
    this._initAtomTypeCache()
    const typeParticle = this._cache_paintParticles.topDownArray[lineIndex - 1]
    return typeParticle ? typeParticle.getAtom(atomIndex - 1) : undefined
  }

  private _cache_programAtomTypeStringMTime: number
  private _cache_paintParticles: Particle
  private _cache_typeParticles: Particle

  protected _initAtomTypeCache(): void {
    const particleMTime = this.getLineOrSubparticlesModifiedTime()
    if (this._cache_programAtomTypeStringMTime === particleMTime) return undefined

    this._cache_typeParticles = new Particle(this.toAtomTypeParticles())
    this._cache_paintParticles = new Particle(this.toPaintParticles())
    this._cache_programAtomTypeStringMTime = particleMTime
  }

  createParserCombinator() {
    return this.isRoot() ? new Particle.ParserCombinator(BlobParser) : new Particle.ParserCombinator(this.parent._getParser()._getCatchAllParser(this.parent), {})
  }

  get parserId(): particlesTypes.parserId {
    return this.definition.parserIdFromDefinition
  }

  get atomTypes() {
    return this.parsedAtoms.filter(atom => atom.getAtom() !== undefined)
  }

  private get atomErrors() {
    const { parsedAtoms } = this // todo: speedup. takes ~3s on pldb.

    // todo: speedup getErrorIfAny. takes ~3s on pldb.
    return parsedAtoms.map(check => check.getErrorIfAny()).filter(identity => identity)
  }

  private get singleParserUsedTwiceErrors() {
    const errors: particlesTypes.ParticleError[] = []
    const parent = this.parent as ParserBackedParticle
    const hits = parent.getSubparticleInstancesOfParserId(this.definition.id)

    if (hits.length > 1)
      hits.forEach((particle, index) => {
        if (particle === this) errors.push(new ParserUsedMultipleTimesError(<ParserBackedParticle>particle))
      })
    return errors
  }

  private get uniqueLineAppearsTwiceErrors() {
    const errors: particlesTypes.ParticleError[] = []
    const parent = this.parent as ParserBackedParticle
    const hits = parent.getSubparticleInstancesOfParserId(this.definition.id)

    if (hits.length > 1) {
      const set = new Set()
      hits.forEach((particle, index) => {
        const line = particle.getLine()
        if (set.has(line)) errors.push(new ParserUsedMultipleTimesError(<ParserBackedParticle>particle))
        set.add(line)
      })
    }
    return errors
  }

  get scopeErrors() {
    let errors: particlesTypes.ParticleError[] = []
    const def = this.definition
    if (def.isSingle) errors = errors.concat(this.singleParserUsedTwiceErrors) // todo: speedup. takes ~1s on pldb.
    if (def.isUniqueLine) errors = errors.concat(this.uniqueLineAppearsTwiceErrors) // todo: speedup. takes ~1s on pldb.

    const { requiredParticleErrors } = this // todo: speedup. takes ~1.5s on pldb.
    if (requiredParticleErrors.length) errors = errors.concat(requiredParticleErrors)
    return errors
  }

  getErrors() {
    return this.atomErrors.concat(this.scopeErrors)
  }

  get parsedAtoms(): AbstractParsersBackedAtom<any>[] {
    return this.definition.atomParser.getAtomArray(this)
  }

  // todo: just make a fn that computes proper spacing and then is given a particle to print
  get lineAtomTypes() {
    return this.parsedAtoms.map(slot => slot.atomTypeId).join(" ")
  }

  getLineAtomPreludeTypes() {
    return this.parsedAtoms
      .map(slot => {
        const def = slot.atomTypeDefinition
        //todo: cleanup
        return def ? def.preludeKindId : PreludeAtomTypeIds.anyAtom
      })
      .join(" ")
  }

  getLinePaints(defaultScope = "source") {
    return this.parsedAtoms.map(slot => slot.paint || defaultScope).join(" ")
  }

  get atomDefinitionLineNumbers() {
    return this.parsedAtoms.map(atom => atom.definitionLineNumber)
  }

  protected _getCompiledIndentation() {
    const indentCharacter = this.definition._getCompilerObject()[ParsersConstantsCompiler.indentCharacter]
    const indent = this.indentation
    return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent
  }

  private _getFields() {
    // fields are like atoms
    const fields: any = {}
    this.forEach(particle => {
      const def = particle.definition
      if (def.isRequired() || def.isSingle) fields[particle.getAtom(0)] = particle.content
    })
    return fields
  }

  protected _getCompiledLine() {
    const compiler = this.definition._getCompilerObject()
    const catchAllAtomDelimiter = compiler[ParsersConstantsCompiler.catchAllAtomDelimiter]
    const str = compiler[ParsersConstantsCompiler.stringTemplate]
    return str !== undefined ? Utils.formatStr(str, catchAllAtomDelimiter, Object.assign(this._getFields(), this.atomsMap)) : this.getLine()
  }

  protected get listDelimiter() {
    return this.definition._getFromExtended(ParsersConstants.listDelimiter)
  }

  protected get contentKey() {
    return this.definition._getFromExtended(ParsersConstants.contentKey)
  }

  protected get subparticlesKey() {
    return this.definition._getFromExtended(ParsersConstants.subparticlesKey)
  }

  protected get subparticlesAreTextBlob() {
    return this.definition._isBlobParser()
  }

  protected get isArrayElement() {
    return this.definition._hasFromExtended(ParsersConstants.uniqueFirstAtom) ? false : !this.definition.isSingle
  }

  get list() {
    return this.listDelimiter ? this.content.split(this.listDelimiter) : super.list
  }

  get typedContent() {
    // todo: probably a better way to do this, perhaps by defining a atomDelimiter at the particle level
    // todo: this currently parse anything other than string types
    if (this.listDelimiter) return this.content.split(this.listDelimiter)

    const atoms = this.parsedAtoms
    if (atoms.length === 2) return atoms[1].parsed
    return this.content
  }

  get typedTuple() {
    const key = this.firstAtom
    if (this.subparticlesAreTextBlob) return [key, this.subparticlesToString()]

    const { typedContent, contentKey, subparticlesKey } = this

    if (contentKey || subparticlesKey) {
      let obj: any = {}
      if (subparticlesKey) obj[subparticlesKey] = this.subparticlesToString()
      else obj = this.typedMap

      if (contentKey) {
        obj[contentKey] = typedContent
      }
      return [key, obj]
    }

    const hasSubparticles = this.length > 0

    const hasSubparticlesNoContent = typedContent === undefined && hasSubparticles
    const shouldReturnValueAsObject = hasSubparticlesNoContent
    if (shouldReturnValueAsObject) return [key, this.typedMap]

    const hasSubparticlesAndContent = typedContent !== undefined && hasSubparticles
    const shouldReturnValueAsContentPlusSubparticles = hasSubparticlesAndContent

    // If the particle has a content and a subparticle return it as a string, as
    // Javascript object values can't be both a leaf and a particle.
    if (shouldReturnValueAsContentPlusSubparticles) return [key, this.contentWithSubparticles]

    return [key, typedContent]
  }

  get _shouldSerialize() {
    const should = (<any>this).shouldSerialize
    return should === undefined ? true : should
  }

  get typedMap() {
    const obj: particlesTypes.stringMap = {}
    this.forEach((particle: ParserBackedParticle) => {
      if (!particle._shouldSerialize) return true

      const tuple = particle.typedTuple
      if (!particle.isArrayElement) obj[tuple[0]] = tuple[1]
      else {
        if (!obj[tuple[0]]) obj[tuple[0]] = []
        obj[tuple[0]].push(tuple[1])
      }
    })
    return obj
  }

  fromTypedMap() {}

  compile() {
    if (this.isRoot()) return super.compile()
    const def = this.definition
    const indent = this._getCompiledIndentation()
    const compiledLine = this._getCompiledLine()

    if (def.isTerminalParser()) return indent + compiledLine

    const compiler = def._getCompilerObject()
    const openSubparticlesString = compiler[ParsersConstantsCompiler.openSubparticles] || ""
    const closeSubparticlesString = compiler[ParsersConstantsCompiler.closeSubparticles] || ""
    const subparticleJoinCharacter = compiler[ParsersConstantsCompiler.joinSubparticlesWith] || "\n"

    const compiledSubparticles = this.map(subparticle => subparticle.compile()).join(subparticleJoinCharacter)

    return `${indent + compiledLine}${openSubparticlesString}
${compiledSubparticles}
${indent}${closeSubparticlesString}`
  }

  // todo: remove
  get atomsMap() {
    const atomsMap: particlesTypes.stringMap = {}
    this.parsedAtoms.forEach(atom => {
      const atomTypeId = atom.atomTypeId
      if (!atom.isCatchAll()) atomsMap[atomTypeId] = atom.parsed
      else {
        if (!atomsMap[atomTypeId]) atomsMap[atomTypeId] = []
        atomsMap[atomTypeId].push(atom.parsed)
      }
    })
    return atomsMap
  }
}

class BlobParser extends ParserBackedParticle {
  createParserCombinator() {
    return new Particle.ParserCombinator(BlobParser, {})
  }

  getErrors(): particlesTypes.ParticleError[] {
    return []
  }
}

// todo: can we remove this? hard to extend.
class UnknownParserParticle extends ParserBackedParticle {
  createParserCombinator() {
    return new Particle.ParserCombinator(UnknownParserParticle, {})
  }

  getErrors(): particlesTypes.ParticleError[] {
    return [new UnknownParserError(this)]
  }
}

/*
A atom contains a atom but also the type information for that atom.
*/
abstract class AbstractParsersBackedAtom<T> {
  constructor(particle: ParserBackedParticle, index: particlesTypes.int, typeDef: atomTypeDefinitionParser, atomTypeId: string, isCatchAll: boolean, parserDefinitionParser: AbstractParserDefinitionParser) {
    this._typeDef = typeDef
    this._particle = particle
    this._isCatchAll = isCatchAll
    this._index = index
    this._atomTypeId = atomTypeId
    this._parserDefinitionParser = parserDefinitionParser
  }

  getAtom() {
    return this._particle.getAtom(this._index)
  }

  get definitionLineNumber() {
    return this._typeDef.lineNumber
  }

  private _particle: ParserBackedParticle
  protected _index: particlesTypes.int
  private _typeDef: atomTypeDefinitionParser
  private _isCatchAll: boolean
  private _atomTypeId: string
  protected _parserDefinitionParser: AbstractParserDefinitionParser

  get atomTypeId() {
    return this._atomTypeId
  }

  static parserFunctionName = ""

  getParticle() {
    return this._particle
  }

  get atomIndex() {
    return this._index
  }

  isCatchAll() {
    return this._isCatchAll
  }

  get min() {
    return this.atomTypeDefinition.get(ParsersConstants.min) || "0"
  }

  get max() {
    return this.atomTypeDefinition.get(ParsersConstants.max) || "100"
  }

  get placeholder() {
    return this.atomTypeDefinition.get(ParsersConstants.examples) || ""
  }

  abstract get parsed(): T

  get paint(): string | undefined {
    const definition = this.atomTypeDefinition
    if (definition) return definition.paint // todo: why the undefined?
  }

  getAutoCompleteAtoms(partialAtom: string = "") {
    const atomDef = this.atomTypeDefinition
    let atoms = atomDef ? atomDef._getAutocompleteAtomOptions(<ParserBackedParticle>this.getParticle().root) : []

    const runTimeOptions = this.getParticle().getRunTimeEnumOptions(this)
    if (runTimeOptions) atoms = runTimeOptions.concat(atoms)

    if (partialAtom) atoms = atoms.filter(atom => atom.includes(partialAtom))
    return atoms.map(atom => {
      return {
        text: atom,
        displayText: atom
      }
    })
  }

  synthesizeAtom(seed = Date.now()): string {
    // todo: cleanup
    const atomDef = this.atomTypeDefinition
    const enumOptions = atomDef._getFromExtended(ParsersConstants.enum)
    if (enumOptions) return Utils.getRandomString(1, enumOptions.split(" "))

    return this._synthesizeAtom(seed)
  }

  _getStumpEnumInput(crux: string): string {
    const atomDef = this.atomTypeDefinition
    const enumOptions = atomDef._getFromExtended(ParsersConstants.enum)
    if (!enumOptions) return undefined
    const options = new Particle(
      enumOptions
        .split(" ")
        .map(option => `option ${option}`)
        .join("\n")
    )
    return `select
 name ${crux}
${options.toString(1)}`
  }

  _toStumpInput(crux: string): string {
    // todo: remove
    const enumInput = this._getStumpEnumInput(crux)
    if (enumInput) return enumInput
    // todo: cleanup. We shouldn't have these dual atomType classes.
    return `input
 name ${crux}
 placeholder ${this.placeholder}`
  }

  abstract _synthesizeAtom(seed?: number): string

  get atomTypeDefinition() {
    return this._typeDef
  }

  protected _getErrorContext() {
    return this.getParticle().getLine().split(" ")[0] // todo: AtomBreakSymbol
  }

  protected abstract _isValid(): boolean

  isValid(): boolean {
    const runTimeOptions = this.getParticle().getRunTimeEnumOptionsForValidation(this)
    const atom = this.getAtom()
    if (runTimeOptions) return runTimeOptions.includes(atom)
    return this.atomTypeDefinition.isValid(atom, <ParserBackedParticle>this.getParticle().root) && this._isValid()
  }

  getErrorIfAny(): particlesTypes.ParticleError {
    const atom = this.getAtom()
    if (atom !== undefined && this.isValid()) return undefined

    // todo: refactor invalidatomError. We want better error messages.
    return atom === undefined || atom === "" ? new MissingAtomError(this) : new InvalidAtomError(this)
  }
}

class ParsersBitAtom extends AbstractParsersBackedAtom<boolean> {
  _isValid() {
    const atom = this.getAtom()
    return atom === "0" || atom === "1"
  }

  static defaultPaint = "constant.numeric"

  _synthesizeAtom() {
    return Utils.getRandomString(1, "01".split(""))
  }

  get regexString() {
    return "[01]"
  }

  get parsed() {
    const atom = this.getAtom()
    return !!parseInt(atom)
  }
}

abstract class ParsersNumericAtom extends AbstractParsersBackedAtom<number> {
  _toStumpInput(crux: string): string {
    return `input
 name ${crux}
 type number
 placeholder ${this.placeholder}
 min ${this.min}
 max ${this.max}`
  }
}

class ParsersIntAtom extends ParsersNumericAtom {
  _isValid() {
    const atom = this.getAtom()
    const num = parseInt(atom)
    if (isNaN(num)) return false
    return num.toString() === atom
  }

  static defaultPaint = "constant.numeric.integer"

  _synthesizeAtom(seed: number) {
    return Utils.randomUniformInt(parseInt(this.min), parseInt(this.max), seed).toString()
  }

  get regexString() {
    return "-?[0-9]+"
  }

  get parsed() {
    const atom = this.getAtom()
    return parseInt(atom)
  }

  static parserFunctionName = "parseInt"
}

class ParsersFloatAtom extends ParsersNumericAtom {
  _isValid() {
    const atom = this.getAtom()
    const num = parseFloat(atom)
    return !isNaN(num) && /^-?\d*(\.\d+)?([eE][+-]?\d+)?$/.test(atom)
  }

  static defaultPaint = "constant.numeric.float"

  _synthesizeAtom(seed: number) {
    return Utils.randomUniformFloat(parseFloat(this.min), parseFloat(this.max), seed).toString()
  }

  get regexString() {
    return "-?d*(.d+)?"
  }

  get parsed() {
    const atom = this.getAtom()
    return parseFloat(atom)
  }

  static parserFunctionName = "parseFloat"
}

// ErrorAtomType => parsers asks for a '' atom type here but the parsers does not specify a '' atom type. (todo: bring in didyoumean?)

class ParsersBoolAtom extends AbstractParsersBackedAtom<boolean> {
  private _trues = new Set(["1", "true", "t", "yes"])
  private _falses = new Set(["0", "false", "f", "no"])

  _isValid() {
    const atom = this.getAtom()
    const str = atom.toLowerCase()
    return this._trues.has(str) || this._falses.has(str)
  }

  static defaultPaint = "constant.numeric"

  _synthesizeAtom() {
    return Utils.getRandomString(1, ["1", "true", "t", "yes", "0", "false", "f", "no"])
  }

  private _getOptions() {
    return Array.from(this._trues).concat(Array.from(this._falses))
  }

  get regexString() {
    return "(?:" + this._getOptions().join("|") + ")"
  }

  get parsed() {
    const atom = this.getAtom()
    return this._trues.has(atom.toLowerCase())
  }
}

class ParsersAnyAtom extends AbstractParsersBackedAtom<string> {
  _isValid() {
    return true
  }

  _synthesizeAtom() {
    const examples = this.atomTypeDefinition._getFromExtended(ParsersConstants.examples)
    if (examples) return Utils.getRandomString(1, examples.split(" "))
    return this._parserDefinitionParser.parserIdFromDefinition + "-" + this.constructor.name
  }

  get regexString() {
    return "[^ ]+"
  }

  get parsed() {
    return this.getAtom()
  }
}

class ParsersKeyatomAtom extends ParsersAnyAtom {
  static defaultPaint = "keyword"

  _synthesizeAtom() {
    return this._parserDefinitionParser.cruxIfAny
  }
}

class ParsersExtraAtomAtomTypeAtom extends AbstractParsersBackedAtom<string> {
  _isValid() {
    return false
  }

  synthesizeAtom() {
    throw new Error(`Trying to synthesize a ParsersExtraAtomAtomTypeAtom`)
    return this._synthesizeAtom()
  }

  _synthesizeAtom() {
    return "extraAtom" // should never occur?
  }

  get parsed() {
    return this.getAtom()
  }

  getErrorIfAny(): particlesTypes.ParticleError {
    return new ExtraAtomError(this)
  }
}

class ParsersUnknownAtomTypeAtom extends AbstractParsersBackedAtom<string> {
  _isValid() {
    return false
  }

  synthesizeAtom() {
    throw new Error(`Trying to synthesize an ParsersUnknownAtomTypeAtom`)
    return this._synthesizeAtom()
  }

  _synthesizeAtom() {
    return "extraAtom" // should never occur?
  }

  get parsed() {
    return this.getAtom()
  }

  getErrorIfAny(): particlesTypes.ParticleError {
    return new UnknownAtomTypeError(this)
  }
}

abstract class AbstractParticleError implements particlesTypes.ParticleError {
  constructor(particle: ParserBackedParticle) {
    this._particle = particle
  }
  private _particle: ParserBackedParticle // todo: would it ever be a Particle?

  getLineIndex(): particlesTypes.positiveInt {
    return this.lineNumber - 1
  }

  get lineNumber(): particlesTypes.positiveInt {
    return this.getParticle()._getLineNumber() // todo: handle sourcemaps
  }

  isCursorOnAtom(lineIndex: particlesTypes.positiveInt, characterIndex: particlesTypes.positiveInt) {
    return lineIndex === this.getLineIndex() && this._doesCharacterIndexFallOnAtom(characterIndex)
  }

  private _doesCharacterIndexFallOnAtom(characterIndex: particlesTypes.positiveInt) {
    return this.atomIndex === this.getParticle().getAtomIndexAtCharacterIndex(characterIndex)
  }

  // convenience method. may be removed.
  isBlankLineError() {
    return false
  }

  // convenience method. may be removed.
  isMissingAtomError() {
    return false
  }

  getIndent() {
    return this.getParticle().indentation
  }

  getCodeMirrorLineWidgetElement(onApplySuggestionCallBack = () => {}) {
    const suggestion = this.suggestionMessage
    if (this.isMissingAtomError()) return this._getCodeMirrorLineWidgetElementAtomTypeHints()
    if (suggestion) return this._getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion)
    return this._getCodeMirrorLineWidgetElementWithoutSuggestion()
  }

  get parserId(): string {
    return (<ParserBackedParticle>this.getParticle()).definition.parserIdFromDefinition
  }

  private _getCodeMirrorLineWidgetElementAtomTypeHints() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + (<ParserBackedParticle>this.getParticle()).definition.lineHints))
    el.className = "LintAtomTypeHints"
    return el
  }

  private _getCodeMirrorLineWidgetElementWithoutSuggestion() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + this.message))
    el.className = "LintError"
    return el
  }

  private _getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack: Function, suggestion: string) {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + `${this.errorTypeName}. Suggestion: ${suggestion}`))
    el.className = "LintErrorWithSuggestion"
    el.onclick = () => {
      this.applySuggestion()
      onApplySuggestionCallBack()
    }
    return el
  }

  getLine() {
    return this.getParticle().getLine()
  }

  getExtension() {
    return this.getParticle().handParsersProgram.extensionName
  }

  getParticle() {
    return this._particle
  }

  get errorTypeName() {
    return this.constructor.name.replace("Error", "")
  }

  get atomIndex() {
    return 0
  }

  toObject() {
    return {
      type: this.errorTypeName,
      line: this.lineNumber,
      atom: this.atomIndex,
      suggestion: this.suggestionMessage,
      path: this.getParticle().getFirstAtomPath(),
      message: this.message
    }
  }

  hasSuggestion() {
    return this.suggestionMessage !== ""
  }

  get suggestionMessage() {
    return ""
  }

  toString() {
    return this.message
  }

  applySuggestion() {}

  get message(): string {
    return `${this.errorTypeName} at line ${this.lineNumber} atom ${this.atomIndex}.`
  }
}

abstract class AbstractAtomError extends AbstractParticleError {
  constructor(atom: AbstractParsersBackedAtom<any>) {
    super(atom.getParticle())
    this._atom = atom
  }

  get atom() {
    return this._atom
  }

  get atomIndex() {
    return this._atom.atomIndex
  }

  protected get atomSuggestion() {
    return Utils.didYouMean(
      this.atom.getAtom(),
      this.atom.getAutoCompleteAtoms().map(option => option.text)
    )
  }

  private _atom: AbstractParsersBackedAtom<any>
}

class UnknownParserError extends AbstractParticleError {
  get message(): string {
    const particle = this.getParticle()
    const parentParticle = particle.parent
    const options = parentParticle._getParser().getFirstAtomOptions()
    return super.message + ` Invalid parser "${particle.firstAtom}". Valid parsers are: ${Utils._listToEnglishText(options, 7)}.`
  }

  protected get atomSuggestion() {
    const particle = this.getParticle()
    const parentParticle = particle.parent
    return Utils.didYouMean(
      particle.firstAtom,
      (<ParserBackedParticle>parentParticle).getAutocompleteResults("", 0).map(option => option.text)
    )
  }

  get suggestionMessage() {
    const suggestion = this.atomSuggestion
    const particle = this.getParticle()

    if (suggestion) return `Change "${particle.firstAtom}" to "${suggestion}"`

    return ""
  }

  applySuggestion() {
    const suggestion = this.atomSuggestion
    if (suggestion) this.getParticle().setAtom(this.atomIndex, suggestion)
    return this
  }
}

class ParserDefinedError extends AbstractParticleError {
  constructor(particle: ParserBackedParticle, message: string) {
    super()
    this._particle = particle
    this._message = message
  }
  private _message: string
  get message() {
    return this._message
  }
}

class BlankLineError extends UnknownParserError {
  get message(): string {
    return super.message + ` Line: "${this.getParticle().getLine()}". Blank lines are errors.`
  }

  // convenience method
  isBlankLineError() {
    return true
  }

  get suggestionMessage() {
    return `Delete line ${this.lineNumber}`
  }

  applySuggestion() {
    this.getParticle().destroy()
    return this
  }
}

class MissingRequiredParserError extends AbstractParticleError {
  constructor(particle: ParserBackedParticle, missingParserId: particlesTypes.firstAtom) {
    super(particle)
    this._missingParserId = missingParserId
  }

  private _missingParserId: particlesTypes.parserId

  get message(): string {
    return super.message + ` A "${this._missingParserId}" is required.`
  }
}

class ParserUsedMultipleTimesError extends AbstractParticleError {
  get message(): string {
    return super.message + ` Multiple "${this.getParticle().firstAtom}" found.`
  }

  get suggestionMessage() {
    return `Delete line ${this.lineNumber}`
  }

  applySuggestion() {
    return this.getParticle().destroy()
  }
}

class LineAppearsMultipleTimesError extends AbstractParticleError {
  get message(): string {
    return super.message + ` "${this.getParticle().getLine()}" appears multiple times.`
  }

  get suggestionMessage() {
    return `Delete line ${this.lineNumber}`
  }

  applySuggestion() {
    return this.getParticle().destroy()
  }
}

class UnknownAtomTypeError extends AbstractAtomError {
  get message(): string {
    return super.message + ` No atomType "${this.atom.atomTypeId}" found. Language parsers for "${this.getExtension()}" may need to be fixed.`
  }
}

class InvalidAtomError extends AbstractAtomError {
  get message(): string {
    return super.message + ` "${this.atom.getAtom()}" does not fit in atomType "${this.atom.atomTypeId}".`
  }

  get suggestionMessage() {
    const suggestion = this.atomSuggestion

    if (suggestion) return `Change "${this.atom.getAtom()}" to "${suggestion}"`

    return ""
  }

  applySuggestion() {
    const suggestion = this.atomSuggestion
    if (suggestion) this.getParticle().setAtom(this.atomIndex, suggestion)
    return this
  }
}

class ExtraAtomError extends AbstractAtomError {
  get message(): string {
    return super.message + ` Extra atom "${this.atom.getAtom()}" in ${this.parserId}.`
  }

  get suggestionMessage() {
    return `Delete atom "${this.atom.getAtom()}" at atom ${this.atomIndex}`
  }

  applySuggestion() {
    return this.getParticle().deleteAtomAt(this.atomIndex)
  }
}

class MissingAtomError extends AbstractAtomError {
  // todo: autocomplete suggestion

  get message(): string {
    return super.message + ` Missing atom for atom "${this.atom.atomTypeId}".`
  }

  isMissingAtomError() {
    return true
  }
}

// todo: add standard types, enum types, from disk types

abstract class AbstractParsersAtomTestParser extends Particle {
  abstract isValid(str: string, programRootParticle?: ParserBackedParticle): boolean
}

class ParsersRegexTestParser extends AbstractParsersAtomTestParser {
  private _regex: RegExp

  isValid(str: string) {
    if (!this._regex) this._regex = new RegExp("^" + this.content + "$")
    return !!str.match(this._regex)
  }
}

class ParsersReservedAtomsTestParser extends AbstractParsersAtomTestParser {
  private _set: Set<string>

  isValid(str: string) {
    if (!this._set) this._set = new Set(this.content.split(" "))
    return !this._set.has(str)
  }
}

// todo: remove in favor of custom atom type constructors
class EnumFromAtomTypesTestParser extends AbstractParsersAtomTestParser {
  _getEnumFromAtomTypes(programRootParticle: ParserBackedParticle): particlesTypes.stringMap {
    const atomTypeIds = this.getAtomsFrom(1)
    const enumGroup = atomTypeIds.join(" ")
    // note: hack where we store it on the program. otherwise has global effects.
    if (!(<any>programRootParticle)._enumMaps) (<any>programRootParticle)._enumMaps = {}
    if ((<any>programRootParticle)._enumMaps[enumGroup]) return (<any>programRootParticle)._enumMaps[enumGroup]

    const atomIndex = 1
    const map: particlesTypes.stringMap = {}
    const atomTypeMap: particlesTypes.stringMap = {}
    atomTypeIds.forEach(typeId => (atomTypeMap[typeId] = true))
    programRootParticle.allTypedAtoms
      .filter((typedAtom: TypedAtom) => atomTypeMap[typedAtom.type])
      .forEach(typedAtom => {
        map[typedAtom.atom] = true
      })
    ;(<any>programRootParticle)._enumMaps[enumGroup] = map
    return map
  }

  // todo: remove
  isValid(str: string, programRootParticle: ParserBackedParticle) {
    return this._getEnumFromAtomTypes(programRootParticle)[str] === true
  }
}

class ParsersEnumTestParticle extends AbstractParsersAtomTestParser {
  private _map: particlesTypes.stringMap

  isValid(str: string) {
    // enum c c++ java
    return !!this.getOptions()[str]
  }

  getOptions() {
    if (!this._map) this._map = Utils.arrayToMap(this.getAtomsFrom(1))
    return this._map
  }
}

class atomTypeDefinitionParser extends AbstractExtendibleParticle {
  createParserCombinator() {
    const types: particlesTypes.stringMap = {}
    types[ParsersConstants.regex] = ParsersRegexTestParser
    types[ParsersConstants.reservedAtoms] = ParsersReservedAtomsTestParser
    types[ParsersConstants.enumFromAtomTypes] = EnumFromAtomTypesTestParser
    types[ParsersConstants.enum] = ParsersEnumTestParticle
    types[ParsersConstants.paint] = Particle
    types[ParsersConstants.comment] = Particle
    types[ParsersConstants.examples] = Particle
    types[ParsersConstants.min] = Particle
    types[ParsersConstants.max] = Particle
    types[ParsersConstants.description] = Particle
    types[ParsersConstants.extends] = Particle
    return new Particle.ParserCombinator(undefined, types)
  }

  get id() {
    return this.getAtom(0)
  }

  get idToParticleMap() {
    return (<HandParsersProgram>this.parent).atomTypeDefinitions
  }

  getGetter(atomIndex: number) {
    const atomToNativeJavascriptTypeParser = this.getAtomConstructor().parserFunctionName
    return `get ${this.atomTypeId}() {
      return ${atomToNativeJavascriptTypeParser ? atomToNativeJavascriptTypeParser + `(this.getAtom(${atomIndex}))` : `this.getAtom(${atomIndex})`}
    }`
  }

  getCatchAllGetter(atomIndex: number) {
    const atomToNativeJavascriptTypeParser = this.getAtomConstructor().parserFunctionName
    return `get ${this.atomTypeId}() {
      return ${atomToNativeJavascriptTypeParser ? `this.getAtomsFrom(${atomIndex}).map(val => ${atomToNativeJavascriptTypeParser}(val))` : `this.getAtomsFrom(${atomIndex})`}
    }`
  }

  // `this.getAtomsFrom(${requireds.length + 1})`

  // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
  getAtomConstructor(): typeof AbstractParsersBackedAtom {
    return this.preludeKind || ParsersAnyAtom
  }

  get preludeKind() {
    return PreludeKinds[this.getAtom(0)] || PreludeKinds[this._getExtendedAtomTypeId()]
  }

  get preludeKindId() {
    if (PreludeKinds[this.getAtom(0)]) return this.getAtom(0)
    else if (PreludeKinds[this._getExtendedAtomTypeId()]) return this._getExtendedAtomTypeId()
    return PreludeAtomTypeIds.anyAtom
  }

  private _getExtendedAtomTypeId() {
    const arr = this._getAncestorsArray()
    return arr[arr.length - 1].id
  }

  get paint(): string | undefined {
    const hs = this._getFromExtended(ParsersConstants.paint)
    if (hs) return hs
    const preludeKind = this.preludeKind
    if (preludeKind) return preludeKind.defaultPaint
  }

  _getEnumOptions() {
    const enumParticle = this._getParticleFromExtended(ParsersConstants.enum)
    if (!enumParticle) return undefined

    // we sort by longest first to capture longest match first. todo: add test
    const options = Object.keys((<ParsersEnumTestParticle>enumParticle.getParticle(ParsersConstants.enum)).getOptions())
    options.sort((a, b) => b.length - a.length)

    return options
  }

  private _getEnumFromAtomTypeOptions(program: ParserBackedParticle) {
    const particle = this._getParticleFromExtended(ParsersConstants.enumFromAtomTypes)
    return particle ? Object.keys((<EnumFromAtomTypesTestParser>particle.getParticle(ParsersConstants.enumFromAtomTypes))._getEnumFromAtomTypes(program)) : undefined
  }

  _getAutocompleteAtomOptions(program: ParserBackedParticle): string[] {
    return this._getEnumOptions() || this._getEnumFromAtomTypeOptions(program) || []
  }

  get regexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return this._getFromExtended(ParsersConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*")
  }

  private _getAllTests() {
    return this._getSubparticlesByParserInExtended(AbstractParsersAtomTestParser)
  }

  isValid(str: string, programRootParticle: ParserBackedParticle) {
    return this._getAllTests().every(particle => (<AbstractParsersAtomTestParser>particle).isValid(str, programRootParticle))
  }

  get atomTypeId(): particlesTypes.atomTypeId {
    return this.getAtom(0)
  }

  public static types: any
}

abstract class AbstractAtomParser {
  constructor(definition: AbstractParserDefinitionParser) {
    this._definition = definition
  }

  get catchAllAtomTypeId(): particlesTypes.atomTypeId | undefined {
    return this._definition._getFromExtended(ParsersConstants.catchAllAtomType)
  }

  // todo: improve layout (use bold?)
  get lineHints(): string {
    const catchAllAtomTypeId = this.catchAllAtomTypeId
    const parserId = this._definition.cruxIfAny || this._definition.id // todo: cleanup
    return `${parserId}: ${this.getRequiredAtomTypeIds().join(" ")}${catchAllAtomTypeId ? ` ${catchAllAtomTypeId}...` : ""}`
  }

  protected _definition: AbstractParserDefinitionParser

  private _requiredAtomTypeIds: string[]
  getRequiredAtomTypeIds(): particlesTypes.atomTypeId[] {
    if (!this._requiredAtomTypeIds) {
      const parameters = this._definition._getFromExtended(ParsersConstants.atoms)
      this._requiredAtomTypeIds = parameters ? parameters.split(" ") : []
    }
    return this._requiredAtomTypeIds
  }

  protected _getAtomTypeId(atomIndex: particlesTypes.int, requiredAtomTypeIds: string[], totalAtomCount: particlesTypes.int) {
    return requiredAtomTypeIds[atomIndex]
  }

  protected _isCatchAllAtom(atomIndex: particlesTypes.int, numberOfRequiredAtoms: particlesTypes.int, totalAtomCount: particlesTypes.int) {
    return atomIndex >= numberOfRequiredAtoms
  }

  getAtomArray(particle: ParserBackedParticle = undefined): AbstractParsersBackedAtom<any>[] {
    const atomCount = particle ? particle.atoms.length : 0
    const def = this._definition
    const parsersProgram = def.languageDefinitionProgram
    const requiredAtomTypeIds = this.getRequiredAtomTypeIds()
    const numberOfRequiredAtoms = requiredAtomTypeIds.length

    const actualAtomCountOrRequiredAtomCount = Math.max(atomCount, numberOfRequiredAtoms)
    const atoms: AbstractParsersBackedAtom<any>[] = []

    // A for loop instead of map because "numberOfAtomsToFill" can be longer than atoms.length
    for (let atomIndex = 0; atomIndex < actualAtomCountOrRequiredAtomCount; atomIndex++) {
      const isCatchAll = this._isCatchAllAtom(atomIndex, numberOfRequiredAtoms, atomCount)

      let atomTypeId = isCatchAll ? this.catchAllAtomTypeId : this._getAtomTypeId(atomIndex, requiredAtomTypeIds, atomCount)

      let atomTypeDefinition = parsersProgram.getAtomTypeDefinitionById(atomTypeId)

      let atomConstructor
      if (atomTypeDefinition) atomConstructor = atomTypeDefinition.getAtomConstructor()
      else if (atomTypeId) atomConstructor = ParsersUnknownAtomTypeAtom
      else {
        atomConstructor = ParsersExtraAtomAtomTypeAtom
        atomTypeId = PreludeAtomTypeIds.extraAtomAtom
        atomTypeDefinition = parsersProgram.getAtomTypeDefinitionById(atomTypeId)
      }

      const anyAtomConstructor = <any>atomConstructor
      atoms[atomIndex] = new anyAtomConstructor(particle, atomIndex, atomTypeDefinition, atomTypeId, isCatchAll, def)
    }
    return atoms
  }
}

class PrefixAtomParser extends AbstractAtomParser {}

class PostfixAtomParser extends AbstractAtomParser {
  protected _isCatchAllAtom(atomIndex: particlesTypes.int, numberOfRequiredAtoms: particlesTypes.int, totalAtomCount: particlesTypes.int) {
    return atomIndex < totalAtomCount - numberOfRequiredAtoms
  }

  protected _getAtomTypeId(atomIndex: particlesTypes.int, requiredAtomTypeIds: string[], totalAtomCount: particlesTypes.int) {
    const catchAllAtomCount = Math.max(totalAtomCount - requiredAtomTypeIds.length, 0)
    return requiredAtomTypeIds[atomIndex - catchAllAtomCount]
  }
}

class OmnifixAtomParser extends AbstractAtomParser {
  getAtomArray(particle: ParserBackedParticle = undefined): AbstractParsersBackedAtom<any>[] {
    const atoms: AbstractParsersBackedAtom<any>[] = []
    const def = this._definition
    const program = <ParserBackedParticle>(particle ? particle.root : undefined)
    const parsersProgram = def.languageDefinitionProgram
    const atoms = particle ? particle.atoms : []
    const requiredAtomTypeDefs = this.getRequiredAtomTypeIds().map(atomTypeId => parsersProgram.getAtomTypeDefinitionById(atomTypeId))
    const catchAllAtomTypeId = this.catchAllAtomTypeId
    const catchAllAtomTypeDef = catchAllAtomTypeId && parsersProgram.getAtomTypeDefinitionById(catchAllAtomTypeId)

    atoms.forEach((atom, atomIndex) => {
      let atomConstructor: any
      for (let index = 0; index < requiredAtomTypeDefs.length; index++) {
        const atomTypeDefinition = requiredAtomTypeDefs[index]
        if (atomTypeDefinition.isValid(atom, program)) {
          // todo: cleanup atomIndex/atomIndex stuff
          atomConstructor = atomTypeDefinition.getAtomConstructor()
          atoms.push(new atomConstructor(particle, atomIndex, atomTypeDefinition, atomTypeDefinition.id, false, def))
          requiredAtomTypeDefs.splice(index, 1)
          return true
        }
      }
      if (catchAllAtomTypeDef && catchAllAtomTypeDef.isValid(atom, program)) {
        atomConstructor = catchAllAtomTypeDef.getAtomConstructor()
        atoms.push(new atomConstructor(particle, atomIndex, catchAllAtomTypeDef, catchAllAtomTypeId, true, def))
        return true
      }
      atoms.push(new ParsersUnknownAtomTypeAtom(particle, atomIndex, undefined, undefined, false, def))
    })
    const atomCount = atoms.length
    requiredAtomTypeDefs.forEach((atomTypeDef, index) => {
      let atomConstructor: any = atomTypeDef.getAtomConstructor()
      atoms.push(new atomConstructor(particle, atomCount + index, atomTypeDef, atomTypeDef.id, false, def))
    })

    return atoms
  }
}

class ParsersExampleParser extends Particle {}

class ParsersCompilerParser extends Particle {
  createParserCombinator() {
    const types = [
      ParsersConstantsCompiler.stringTemplate,
      ParsersConstantsCompiler.indentCharacter,
      ParsersConstantsCompiler.catchAllAtomDelimiter,
      ParsersConstantsCompiler.joinSubparticlesWith,
      ParsersConstantsCompiler.openSubparticles,
      ParsersConstantsCompiler.closeSubparticles
    ]
    const map: particlesTypes.firstAtomToParserMap = {}
    types.forEach(type => {
      map[type] = Particle
    })
    return new Particle.ParserCombinator(undefined, map)
  }
}

abstract class AbstractParserConstantParser extends Particle {
  constructor(subparticles?: particlesTypes.subparticles, line?: string, parent?: Particle) {
    super(subparticles, line, parent)
    parent[this.identifier] = this.constantValue
  }

  getGetter() {
    return `get ${this.identifier}() { return ${this.constantValueAsJsText} }`
  }

  get identifier() {
    return this.getAtom(1)
  }

  get constantValueAsJsText() {
    const atoms = this.getAtomsFrom(2)
    return atoms.length > 1 ? `[${atoms.join(",")}]` : atoms[0]
  }

  get constantValue() {
    return JSON.parse(this.constantValueAsJsText)
  }
}

class ParsersParserConstantInt extends AbstractParserConstantParser {}
class ParsersParserConstantString extends AbstractParserConstantParser {
  get constantValueAsJsText() {
    return "`" + Utils.escapeBackTicks(this.constantValue) + "`"
  }

  get constantValue() {
    return this.length ? this.subparticlesToString() : this.getAtomsFrom(2).join(" ")
  }
}
class ParsersParserConstantFloat extends AbstractParserConstantParser {}
class ParsersParserConstantBoolean extends AbstractParserConstantParser {}

abstract class AbstractParserDefinitionParser extends AbstractExtendibleParticle {
  createParserCombinator() {
    // todo: some of these should just be on nonRootParticles
    const types = [
      ParsersConstants.popularity,
      ParsersConstants.inScope,
      ParsersConstants.atoms,
      ParsersConstants.extends,
      ParsersConstants.description,
      ParsersConstants.catchAllParser,
      ParsersConstants.catchAllAtomType,
      ParsersConstants.atomParser,
      ParsersConstants.extensions,
      ParsersConstants.tags,
      ParsersConstants.crux,
      ParsersConstants.cruxFromId,
      ParsersConstants.listDelimiter,
      ParsersConstants.contentKey,
      ParsersConstants.subparticlesKey,
      ParsersConstants.uniqueFirstAtom,
      ParsersConstants.uniqueLine,
      ParsersConstants.pattern,
      ParsersConstants.baseParser,
      ParsersConstants.required,
      ParsersConstants.root,
      ParsersConstants._rootNodeJsHeader,
      ParsersConstants.javascript,
      ParsersConstants.compilesTo,
      ParsersConstants.javascript,
      ParsersConstants.single,
      ParsersConstants.comment
    ]

    const map: particlesTypes.firstAtomToParserMap = {}
    types.forEach(type => {
      map[type] = Particle
    })
    map[ParsersConstantsConstantTypes.boolean] = ParsersParserConstantBoolean
    map[ParsersConstantsConstantTypes.int] = ParsersParserConstantInt
    map[ParsersConstantsConstantTypes.string] = ParsersParserConstantString
    map[ParsersConstantsConstantTypes.float] = ParsersParserConstantFloat
    map[ParsersConstants.compilerParser] = ParsersCompilerParser
    map[ParsersConstants.example] = ParsersExampleParser
    return new Particle.ParserCombinator(undefined, map, [{ regex: HandParsersProgram.parserFullRegex, parser: parserDefinitionParser }])
  }

  toTypeScriptInterface(used = new Set<string>()) {
    let subparticlesInterfaces: string[] = []
    let properties: string[] = []
    const inScope = this.firstAtomMapWithDefinitions
    const thisId = this.id

    used.add(thisId)
    Object.keys(inScope).forEach(key => {
      const def = inScope[key]
      const map = def.firstAtomMapWithDefinitions
      const id = def.id
      const optionalTag = def.isRequired() ? "" : "?"
      const escapedKey = key.match(/\?/) ? `"${key}"` : key
      const description = def.description
      if (Object.keys(map).length && !used.has(id)) {
        subparticlesInterfaces.push(def.toTypeScriptInterface(used))
        properties.push(` ${escapedKey}${optionalTag}: ${id}`)
      } else properties.push(` ${escapedKey}${optionalTag}: any${description ? " // " + description : ""}`)
    })

    properties.sort()
    const description = this.description

    const myInterface = ""
    return `${subparticlesInterfaces.join("\n")}
${description ? "// " + description : ""}
interface ${thisId} {
${properties.join("\n")}
}`.trim()
  }

  get id() {
    return this.getAtom(0)
  }

  get idWithoutSuffix() {
    return this.id.replace(HandParsersProgram.parserSuffixRegex, "")
  }

  get constantsObject() {
    const obj = this._getUniqueConstantParticles()
    Object.keys(obj).forEach(key => (obj[key] = obj[key].constantValue))
    return obj
  }

  _getUniqueConstantParticles(extended = true) {
    const obj: { [key: string]: AbstractParserConstantParser } = {}
    const items = extended ? this._getSubparticlesByParserInExtended(AbstractParserConstantParser) : this.getSubparticlesByParser(AbstractParserConstantParser)
    items.reverse() // Last definition wins.
    items.forEach((particle: AbstractParserConstantParser) => (obj[particle.identifier] = particle))
    return obj
  }

  get examples(): ParsersExampleParser[] {
    return this._getSubparticlesByParserInExtended(ParsersExampleParser)
  }

  get parserIdFromDefinition(): particlesTypes.parserId {
    return this.getAtom(0)
  }

  // todo: remove? just reused parserId
  get generatedClassName() {
    return this.parserIdFromDefinition
  }

  _hasValidParserId() {
    return !!this.generatedClassName
  }

  _isAbstract() {
    return this.id.startsWith(ParsersConstants.abstractParserPrefix)
  }

  get cruxIfAny(): string {
    return this.get(ParsersConstants.crux) || (this._hasFromExtended(ParsersConstants.cruxFromId) ? this.idWithoutSuffix : undefined)
  }

  get regexMatch() {
    return this.get(ParsersConstants.pattern)
  }

  get firstAtomEnumOptions() {
    const firstAtomDef = this._getMyAtomTypeDefs()[0]
    return firstAtomDef ? firstAtomDef._getEnumOptions() : undefined
  }

  get languageDefinitionProgram(): HandParsersProgram {
    return <HandParsersProgram>this.root
  }

  protected get customJavascriptMethods(): particlesTypes.javascriptCode {
    const hasJsCode = this.has(ParsersConstants.javascript)
    return hasJsCode ? this.getParticle(ParsersConstants.javascript).subparticlesToString() : ""
  }

  private _cache_firstAtomToParticleDefMap: { [firstAtom: string]: parserDefinitionParser }

  get firstAtomMapWithDefinitions() {
    if (!this._cache_firstAtomToParticleDefMap) this._cache_firstAtomToParticleDefMap = this._createParserInfo(this._getInScopeParserIds()).firstAtomMap
    return this._cache_firstAtomToParticleDefMap
  }

  // todo: remove
  get runTimeFirstAtomsInScope(): particlesTypes.parserId[] {
    return this._getParser().getFirstAtomOptions()
  }

  private _getMyAtomTypeDefs() {
    const requiredAtoms = this.get(ParsersConstants.atoms)
    if (!requiredAtoms) return []
    const parsersProgram = this.languageDefinitionProgram
    return requiredAtoms.split(" ").map(atomTypeId => {
      const atomTypeDef = parsersProgram.getAtomTypeDefinitionById(atomTypeId)
      if (!atomTypeDef) throw new Error(`No atomType "${atomTypeId}" found`)
      return atomTypeDef
    })
  }

  // todo: what happens when you have a atom getter and constant with same name?
  private get atomGettersAndParserConstants() {
    // todo: add atomType parsings
    const parsersProgram = this.languageDefinitionProgram
    const getters = this._getMyAtomTypeDefs().map((atomTypeDef, index) => atomTypeDef.getGetter(index))

    const catchAllAtomTypeId = this.get(ParsersConstants.catchAllAtomType)
    if (catchAllAtomTypeId) getters.push(parsersProgram.getAtomTypeDefinitionById(catchAllAtomTypeId).getCatchAllGetter(getters.length))

    // Constants
    Object.values(this._getUniqueConstantParticles(false)).forEach(particle => getters.push(particle.getGetter()))

    return getters.join("\n")
  }

  protected _createParserInfo(parserIdsInScope: particlesTypes.parserId[]): parserInfo {
    const result: parserInfo = {
      firstAtomMap: {},
      regexTests: []
    }

    if (!parserIdsInScope.length) return result

    const allProgramParserDefinitionsMap = this.programParserDefinitionCache
    Object.keys(allProgramParserDefinitionsMap)
      .filter(parserId => {
        const def = allProgramParserDefinitionsMap[parserId]
        return def.isOrExtendsAParserInScope(parserIdsInScope) && !def._isAbstract()
      })
      .forEach(parserId => {
        const def = allProgramParserDefinitionsMap[parserId]
        const regex = def.regexMatch
        const crux = def.cruxIfAny
        const enumOptions = def.firstAtomEnumOptions
        if (regex) result.regexTests.push({ regex: regex, parser: def.parserIdFromDefinition })
        else if (crux) result.firstAtomMap[crux] = def
        else if (enumOptions) {
          enumOptions.forEach(option => (result.firstAtomMap[option] = def))
        }
      })
    return result
  }

  get topParserDefinitions(): parserDefinitionParser[] {
    const arr = Object.values(this.firstAtomMapWithDefinitions)
    arr.sort(Utils.makeSortByFn((definition: parserDefinitionParser) => definition.popularity))
    arr.reverse()
    return arr
  }

  _getMyInScopeParserIds(target: AbstractParserDefinitionParser = this): particlesTypes.parserId[] {
    const parsersParticle = target.getParticle(ParsersConstants.inScope)
    const scopedDefinitionIds = target.myScopedParserDefinitions.map(def => def.id)
    return parsersParticle ? parsersParticle.getAtomsFrom(1).concat(scopedDefinitionIds) : scopedDefinitionIds
  }

  protected _getInScopeParserIds(): particlesTypes.parserId[] {
    // todo: allow multiple of these if we allow mixins?
    const ids = this._getMyInScopeParserIds()
    const parentDef = this._getExtendedParent()
    return parentDef ? ids.concat((<AbstractParserDefinitionParser>parentDef)._getInScopeParserIds()) : ids
  }

  get isSingle() {
    const hit = this._getParticleFromExtended(ParsersConstants.single)
    return hit && hit.get(ParsersConstants.single) !== "false"
  }

  get isUniqueLine() {
    const hit = this._getParticleFromExtended(ParsersConstants.uniqueLine)
    return hit && hit.get(ParsersConstants.uniqueLine) !== "false"
  }

  isRequired(): boolean {
    return this._hasFromExtended(ParsersConstants.required)
  }

  getParserDefinitionByParserId(parserId: particlesTypes.parserId): AbstractParserDefinitionParser {
    // todo: return catch all?
    const def = this.programParserDefinitionCache[parserId]
    if (def) return def
    this.languageDefinitionProgram._addDefaultCatchAllBlobParser() // todo: cleanup. Why did I do this? Needs to be removed or documented.
    const particleDef = this.languageDefinitionProgram.programParserDefinitionCache[parserId]
    if (!particleDef) throw new Error(`No definition found for parser id "${parserId}". Particle: \n---\n${this.asString}\n---`)
    return particleDef
  }

  isDefined(parserId: string) {
    return !!this.programParserDefinitionCache[parserId]
  }

  get idToParticleMap() {
    return this.programParserDefinitionCache
  }

  private _cache_isRoot: boolean

  private _amIRoot(): boolean {
    if (this._cache_isRoot === undefined) this._cache_isRoot = this._languageRootParticle === this
    return this._cache_isRoot
  }

  private get _languageRootParticle() {
    return (<HandParsersProgram>this.root).rootParserDefinition
  }

  private _isErrorParser() {
    return this.get(ParsersConstants.baseParser) === ParsersConstants.errorParser
  }

  _isBlobParser() {
    // Do not check extended classes. Only do once.
    return this._getFromExtended(ParsersConstants.baseParser) === ParsersConstants.blobParser
  }

  private get errorMethodToJavascript(): particlesTypes.javascriptCode {
    if (this._isBlobParser()) return "getErrors() { return [] }" // Skips parsing subparticles for perf gains.
    if (this._isErrorParser()) return "getErrors() { return this._getErrorParserErrors() }"
    return ""
  }

  private get parserAsJavascript(): particlesTypes.javascriptCode {
    if (this._isBlobParser())
      // todo: do we need this?
      return "createParserCombinator() { return new Particle.ParserCombinator(this._getBlobParserCatchAllParser())}"
    const parserInfo = this._createParserInfo(this._getMyInScopeParserIds())
    const myFirstAtomMap = parserInfo.firstAtomMap
    const regexRules = parserInfo.regexTests

    // todo: use constants in first atom maps?
    // todo: cache the super extending?
    const firstAtoms = Object.keys(myFirstAtomMap)
    const hasFirstAtoms = firstAtoms.length
    const catchAllParser = this.catchAllParserToJavascript
    if (!hasFirstAtoms && !catchAllParser && !regexRules.length) return ""

    const firstAtomsStr = hasFirstAtoms
      ? `Object.assign(Object.assign({}, super.createParserCombinator()._getFirstAtomMapAsObject()), {` + firstAtoms.map(firstAtom => `"${firstAtom}" : ${myFirstAtomMap[firstAtom].parserIdFromDefinition}`).join(",\n") + "})"
      : "undefined"

    const regexStr = regexRules.length
      ? `[${regexRules
          .map(rule => {
            return `{regex: /${rule.regex}/, parser: ${rule.parser}}`
          })
          .join(",")}]`
      : "undefined"

    const catchAllStr = catchAllParser ? catchAllParser : this._amIRoot() ? `this._getBlobParserCatchAllParser()` : "undefined"

    const scopedParserJavascript = this.myScopedParserDefinitions.map(def => def.asJavascriptClass).join("\n\n")

    return `createParserCombinator() {${scopedParserJavascript}
  return new Particle.ParserCombinator(${catchAllStr}, ${firstAtomsStr}, ${regexStr})
  }`
  }

  private get myScopedParserDefinitions() {
    return <parserDefinitionParser[]>this.getSubparticlesByParser(parserDefinitionParser)
  }

  private get catchAllParserToJavascript(): particlesTypes.javascriptCode {
    if (this._isBlobParser()) return "this._getBlobParserCatchAllParser()"
    const parserId = this.get(ParsersConstants.catchAllParser)
    if (!parserId) return ""
    const particleDef = this.getParserDefinitionByParserId(parserId)
    return particleDef.generatedClassName
  }

  get asJavascriptClass(): particlesTypes.javascriptCode {
    const components = [this.parserAsJavascript, this.errorMethodToJavascript, this.atomGettersAndParserConstants, this.customJavascriptMethods].filter(identity => identity)
    const thisClassName = this.generatedClassName

    if (this._amIRoot()) {
      components.push(`static cachedHandParsersProgramRoot = new HandParsersProgram(\`${Utils.escapeBackTicks(this.parent.toString().replace(/\\/g, "\\\\"))}\`)
        get handParsersProgram() {
          return this.constructor.cachedHandParsersProgramRoot
      }`)

      components.push(`static rootParser = ${thisClassName}`)
    }

    return `class ${thisClassName} extends ${this._getExtendsClassName()} {
      ${components.join("\n")}
    }`
  }

  private _getExtendsClassName() {
    const extendedDef = <AbstractParserDefinitionParser>this._getExtendedParent()
    return extendedDef ? extendedDef.generatedClassName : "ParserBackedParticle"
  }

  _getCompilerObject(): particlesTypes.stringMap {
    let obj: { [key: string]: string } = {}
    const items = this._getSubparticlesByParserInExtended(ParsersCompilerParser)
    items.reverse() // Last definition wins.
    items.forEach((particle: ParsersCompilerParser) => {
      obj = Object.assign(obj, particle.toObject()) // todo: what about multiline strings?
    })
    return obj
  }

  // todo: improve layout (use bold?)
  get lineHints() {
    return this.atomParser.lineHints
  }

  isOrExtendsAParserInScope(firstAtomsInScope: string[]): boolean {
    const chain = this._getParserInheritanceSet()
    return firstAtomsInScope.some(firstAtom => chain.has(firstAtom))
  }

  isTerminalParser() {
    return !this._getFromExtended(ParsersConstants.inScope) && !this._getFromExtended(ParsersConstants.catchAllParser)
  }

  private get sublimeMatchLine() {
    const regexMatch = this.regexMatch
    if (regexMatch) return `'${regexMatch}'`
    const cruxMatch = this.cruxIfAny
    if (cruxMatch) return `'^ *${Utils.escapeRegExp(cruxMatch)}(?: |$)'`
    const enumOptions = this.firstAtomEnumOptions
    if (enumOptions) return `'^ *(${Utils.escapeRegExp(enumOptions.join("|"))})(?: |$)'`
  }

  // todo: refactor. move some parts to atomParser?
  _toSublimeMatchBlock() {
    const defaultPaint = "source"
    const program = this.languageDefinitionProgram
    const atomParser = this.atomParser
    const requiredAtomTypeIds = atomParser.getRequiredAtomTypeIds()
    const catchAllAtomTypeId = atomParser.catchAllAtomTypeId
    const firstAtomTypeDef = program.getAtomTypeDefinitionById(requiredAtomTypeIds[0])
    const firstAtomPaint = (firstAtomTypeDef ? firstAtomTypeDef.paint : defaultPaint) + "." + this.parserIdFromDefinition
    const topHalf = ` '${this.parserIdFromDefinition}':
  - match: ${this.sublimeMatchLine}
    scope: ${firstAtomPaint}`
    if (catchAllAtomTypeId) requiredAtomTypeIds.push(catchAllAtomTypeId)
    if (!requiredAtomTypeIds.length) return topHalf
    const captures = requiredAtomTypeIds
      .map((atomTypeId, index) => {
        const atomTypeDefinition = program.getAtomTypeDefinitionById(atomTypeId) // todo: cleanup
        if (!atomTypeDefinition) throw new Error(`No ${ParsersConstants.atomType} ${atomTypeId} found`) // todo: standardize error/capture error at parsers time
        return `        ${index + 1}: ${(atomTypeDefinition.paint || defaultPaint) + "." + atomTypeDefinition.atomTypeId}`
      })
      .join("\n")

    const atomTypesToRegex = (atomTypeIds: string[]) => atomTypeIds.map((atomTypeId: string) => `({{${atomTypeId}}})?`).join(" ?")

    return `${topHalf}
    push:
     - match: ${atomTypesToRegex(requiredAtomTypeIds)}
       captures:
${captures}
     - match: $
       pop: true`
  }

  private _cache_parserInheritanceSet: Set<particlesTypes.parserId>
  private _cache_ancestorParserIdsArray: particlesTypes.parserId[]

  _getParserInheritanceSet() {
    if (!this._cache_parserInheritanceSet) this._cache_parserInheritanceSet = new Set(this.ancestorParserIdsArray)
    return this._cache_parserInheritanceSet
  }

  get ancestorParserIdsArray(): particlesTypes.parserId[] {
    if (!this._cache_ancestorParserIdsArray) {
      this._cache_ancestorParserIdsArray = this._getAncestorsArray().map(def => (<AbstractParserDefinitionParser>def).parserIdFromDefinition)
      this._cache_ancestorParserIdsArray.reverse()
    }
    return this._cache_ancestorParserIdsArray
  }

  protected _cache_parserDefinitionParsers: { [parserId: string]: parserDefinitionParser }
  get programParserDefinitionCache() {
    if (!this._cache_parserDefinitionParsers) this._cache_parserDefinitionParsers = this.isRoot || this.hasParserDefinitions ? this.makeProgramParserDefinitionCache() : this.parent.programParserDefinitionCache
    return this._cache_parserDefinitionParsers
  }

  get hasParserDefinitions() {
    return !!this.getSubparticlesByParser(parserDefinitionParser).length
  }

  makeProgramParserDefinitionCache() {
    const scopedParsers = this.getSubparticlesByParser(parserDefinitionParser)
    const cache = Object.assign({}, this.parent.programParserDefinitionCache) // todo. We don't really need this. we should just lookup the parent if no local hits.
    scopedParsers.forEach(parserDefinitionParser => (cache[(<parserDefinitionParser>parserDefinitionParser).parserIdFromDefinition] = parserDefinitionParser))
    return cache
  }

  get description(): string {
    return this._getFromExtended(ParsersConstants.description) || ""
  }

  get popularity() {
    const val = this._getFromExtended(ParsersConstants.popularity)
    return val ? parseFloat(val) : 0
  }

  private _getExtendedParserId(): particlesTypes.parserId {
    const ancestorIds = this.ancestorParserIdsArray
    if (ancestorIds.length > 1) return ancestorIds[ancestorIds.length - 2]
  }

  protected _toStumpString() {
    const crux = this.cruxIfAny
    const atomArray = this.atomParser.getAtomArray().filter((item, index) => index) // for now this only works for keyword langs
    if (!atomArray.length)
      // todo: remove this! just doing it for now until we refactor getAtomArray to handle catchAlls better.
      return ""
    const atoms = new Particle(atomArray.map((atom, index) => atom._toStumpInput(crux)).join("\n"))
    return `div
 label ${crux}
${atoms.toString(1)}`
  }

  toStumpString() {
    const particleBreakSymbol = "\n"
    return this._getConcreteNonErrorInScopeParticleDefinitions(this._getInScopeParserIds())
      .map(def => def._toStumpString())
      .filter(identity => identity)
      .join(particleBreakSymbol)
  }

  private _generateSimulatedLine(seed: number): string {
    // todo: generate simulated data from catch all
    const crux = this.cruxIfAny
    return this.atomParser
      .getAtomArray()
      .map((atom, index) => (!index && crux ? crux : atom.synthesizeAtom(seed)))
      .join(" ")
  }

  private _shouldSynthesize(def: AbstractParserDefinitionParser, parserChain: string[]) {
    if (def._isErrorParser() || def._isAbstract()) return false
    if (parserChain.includes(def.id)) return false
    const tags = def.get(ParsersConstants.tags)
    if (tags && tags.includes(ParsersConstantsMisc.doNotSynthesize)) return false
    return true
  }

  // Get all definitions in this current scope down, even ones that are scoped inside other definitions.
  get inScopeAndDescendantDefinitions() {
    return this.languageDefinitionProgram._collectAllDefinitions(Object.values(this.programParserDefinitionCache), [])
  }

  private _collectAllDefinitions(defs: parserDefinitionParser[], collection: parserDefinitionParser[] = []) {
    defs.forEach((def: parserDefinitionParser) => {
      collection.push(def)
      def._collectAllDefinitions(def.getSubparticlesByParser(parserDefinitionParser), collection)
    })
    return collection
  }

  get cruxPath() {
    const parentPath = this.parent.cruxPath
    return (parentPath ? parentPath + " " : "") + this.cruxIfAny
  }

  get cruxPathAsColumnName() {
    return this.cruxPath.replace(/ /g, "_")
  }

  // Get every definition that extends from this one, even ones that are scoped inside other definitions.
  get concreteDescendantDefinitions() {
    const { inScopeAndDescendantDefinitions, id } = this
    return Object.values(inScopeAndDescendantDefinitions).filter(def => def._doesExtend(id) && !def._isAbstract())
  }

  get concreteInScopeDescendantDefinitions() {
    // Note: non-recursive.
    const defs = this.programParserDefinitionCache
    const id = this.id
    return Object.values(defs).filter(def => def._doesExtend(id) && !def._isAbstract())
  }

  private _getConcreteNonErrorInScopeParticleDefinitions(parserIds: string[]) {
    const defs: AbstractParserDefinitionParser[] = []
    parserIds.forEach(parserId => {
      const def = this.getParserDefinitionByParserId(parserId)
      if (def._isErrorParser()) return
      else if (def._isAbstract()) def.concreteInScopeDescendantDefinitions.forEach(def => defs.push(def))
      else defs.push(def)
    })
    return defs
  }

  // todo: refactor
  synthesizeParticle(particleCount = 1, indentCount = -1, parsersAlreadySynthesized: string[] = [], seed = Date.now()) {
    let inScopeParserIds = this._getInScopeParserIds()
    const catchAllParserId = this._getFromExtended(ParsersConstants.catchAllParser)
    if (catchAllParserId) inScopeParserIds.push(catchAllParserId)
    const thisId = this.id
    if (!parsersAlreadySynthesized.includes(thisId)) parsersAlreadySynthesized.push(thisId)
    const lines = []
    while (particleCount) {
      const line = this._generateSimulatedLine(seed)
      if (line) lines.push(" ".repeat(indentCount >= 0 ? indentCount : 0) + line)

      this._getConcreteNonErrorInScopeParticleDefinitions(inScopeParserIds.filter(parserId => !parsersAlreadySynthesized.includes(parserId)))
        .filter(def => this._shouldSynthesize(def, parsersAlreadySynthesized))
        .forEach(def => {
          const chain = parsersAlreadySynthesized // .slice(0)
          chain.push(def.id)
          def.synthesizeParticle(1, indentCount + 1, chain, seed).forEach(line => lines.push(line))
        })
      particleCount--
    }
    return lines
  }

  private _atomParser: AbstractAtomParser

  get atomParser() {
    if (!this._atomParser) {
      const atomParsingStrategy = this._getFromExtended(ParsersConstants.atomParser)
      if (atomParsingStrategy === ParsersAtomParser.postfix) this._atomParser = new PostfixAtomParser(this)
      else if (atomParsingStrategy === ParsersAtomParser.omnifix) this._atomParser = new OmnifixAtomParser(this)
      else this._atomParser = new PrefixAtomParser(this)
    }
    return this._atomParser
  }
}

// todo: remove?
class parserDefinitionParser extends AbstractParserDefinitionParser {}

// HandParsersProgram is a constructor that takes a parsers file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class HandParsersProgram extends AbstractParserDefinitionParser {
  createParserCombinator() {
    const map: particlesTypes.stringMap = {}
    map[ParsersConstants.comment] = Particle
    return new Particle.ParserCombinator(UnknownParserParticle, map, [
      { regex: HandParsersProgram.blankLineRegex, parser: Particle },
      { regex: HandParsersProgram.parserFullRegex, parser: parserDefinitionParser },
      { regex: HandParsersProgram.atomTypeFullRegex, parser: atomTypeDefinitionParser }
    ])
  }

  static makeParserId = (str: string) => Utils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandParsersProgram.parserSuffixRegex, "") + ParsersConstants.parserSuffix
  static makeAtomTypeId = (str: string) => Utils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandParsersProgram.atomTypeSuffixRegex, "") + ParsersConstants.atomTypeSuffix

  static parserSuffixRegex = new RegExp(ParsersConstants.parserSuffix + "$")
  static parserFullRegex = new RegExp("^[a-zA-Z0-9_]+" + ParsersConstants.parserSuffix + "$")
  static blankLineRegex = new RegExp("^$")

  static atomTypeSuffixRegex = new RegExp(ParsersConstants.atomTypeSuffix + "$")
  static atomTypeFullRegex = new RegExp("^[a-zA-Z0-9_]+" + ParsersConstants.atomTypeSuffix + "$")

  private _cache_rootParser: any
  // rootParser
  // Note: this is some so far unavoidable tricky code. We need to eval the transpiled JS, in a NodeJS or browser environment.
  _compileAndReturnRootParser(): Function {
    if (this._cache_rootParser) return this._cache_rootParser

    if (!this.isNodeJs()) {
      this._cache_rootParser = Utils.appendCodeAndReturnValueOnWindow(this.toBrowserJavascript(), this.rootParserId).rootParser
      return this._cache_rootParser
    }

    const path = require("path")
    const code = this.toNodeJsJavascript(__dirname)
    try {
      const rootParticle = this._requireInVmNodeJsRootParser(code)
      this._cache_rootParser = rootParticle.rootParser
      if (!this._cache_rootParser) throw new Error(`Failed to rootParser`)
    } catch (err) {
      // todo: figure out best error pattern here for debugging
      console.log(err)
      // console.log(`Error in code: `)
      // console.log(new Particle(code).toStringWithLineNumbers())
    }
    return this._cache_rootParser
  }

  get cruxPath() {
    return ""
  }

  trainModel(programs: string[], rootParser = this.compileAndReturnRootParser()): SimplePredictionModel {
    const particleDefs = this.validConcreteAndAbstractParserDefinitions
    const particleDefCountIncludingRoot = particleDefs.length + 1
    const matrix = Utils.makeMatrix(particleDefCountIncludingRoot, particleDefCountIncludingRoot, 0)
    const idToIndex: { [id: string]: number } = {}
    const indexToId: { [index: number]: string } = {}
    particleDefs.forEach((def, index) => {
      const id = def.id
      idToIndex[id] = index + 1
      indexToId[index + 1] = id
    })
    programs.forEach(code => {
      const exampleProgram = new rootParser(code)
      exampleProgram.topDownArray.forEach((particle: ParserBackedParticle) => {
        const particleIndex = idToIndex[particle.definition.id]
        const parentParticle = <ParserBackedParticle>particle.parent
        if (!particleIndex) return undefined
        if (parentParticle.isRoot()) matrix[0][particleIndex]++
        else {
          const parentIndex = idToIndex[parentParticle.definition.id]
          if (!parentIndex) return undefined
          matrix[parentIndex][particleIndex]++
        }
      })
    })
    return {
      idToIndex,
      indexToId,
      matrix
    }
  }

  private _mapPredictions(predictionsVector: number[], model: SimplePredictionModel) {
    const total = Utils.sum(predictionsVector)
    const predictions = predictionsVector.slice(1).map((count, index) => {
      const id = model.indexToId[index + 1]
      return {
        id,
        def: this.getParserDefinitionByParserId(id),
        count,
        prob: count / total
      }
    })
    predictions.sort(Utils.makeSortByFn((prediction: any) => prediction.count)).reverse()
    return predictions
  }

  predictSubparticles(model: SimplePredictionModel, particle: ParserBackedParticle) {
    return this._mapPredictions(this._predictSubparticles(model, particle), model)
  }

  predictParents(model: SimplePredictionModel, particle: ParserBackedParticle) {
    return this._mapPredictions(this._predictParents(model, particle), model)
  }

  private _predictSubparticles(model: SimplePredictionModel, particle: ParserBackedParticle) {
    return model.matrix[particle.isRoot() ? 0 : model.idToIndex[particle.definition.id]]
  }

  private _predictParents(model: SimplePredictionModel, particle: ParserBackedParticle) {
    if (particle.isRoot()) return []
    const particleIndex = model.idToIndex[particle.definition.id]
    return model.matrix.map(row => row[particleIndex])
  }

  // todo: hacky, remove
  private _dirName: string
  _setDirName(name: string) {
    this._dirName = name
    return this
  }

  private _requireInVmNodeJsRootParser(code: particlesTypes.javascriptCode): any {
    const vm = require("vm")
    const path = require("path")
    // todo: cleanup up
    try {
      Object.keys(GlobalNamespaceAdditions).forEach(key => {
        ;(<any>global)[key] = require("./" + GlobalNamespaceAdditions[key])
      })
      ;(<any>global).require = require
      ;(<any>global).__dirname = this._dirName
      ;(<any>global).module = {}
      return vm.runInThisContext(code)
    } catch (err) {
      // todo: figure out best error pattern here for debugging
      console.log(`Error in compiled parsers code for language "${this.parsersName}"`)
      // console.log(new Particle(code).toStringWithLineNumbers())
      console.log(err)
      throw err
    }
  }

  examplesToTestBlocks(rootParser = this.compileAndReturnRootParser(), expectedErrorMessage = "") {
    const testBlocks: { [id: string]: Function } = {}
    this.validConcreteAndAbstractParserDefinitions.forEach(def =>
      def.examples.forEach(example => {
        const id = def.id + example.content
        testBlocks[id] = (equal: Function) => {
          const exampleProgram = new rootParser(example.subparticlesToString())
          const errors = exampleProgram.getAllErrors(example._getLineNumber() + 1)
          equal(errors.join("\n"), expectedErrorMessage, `Expected no errors in ${id}`)
        }
      })
    )
    return testBlocks
  }

  toReadMe() {
    const languageName = this.extensionName
    const rootParticleDef = this.rootParserDefinition
    const atomTypes = this.atomTypeDefinitions
    const parserLineage = this.parserLineage
    const exampleParticle = rootParticleDef.examples[0]
    return `title2 ${languageName} stats

list
 - ${languageName} has ${parserLineage.topDownArray.length} parsers.
 - ${languageName} has ${Object.keys(atomTypes).length} atom types.
 - The source code for ${languageName} is ${this.topDownArray.length} lines long.
`
  }

  toBundle() {
    const files: particlesTypes.stringMap = {}
    const rootParticleDef = this.rootParserDefinition
    const languageName = this.extensionName
    const example = rootParticleDef.examples[0]
    const sampleCode = example ? example.subparticlesToString() : ""

    files[ParsersBundleFiles.package] = JSON.stringify(
      {
        name: languageName,
        private: true,
        dependencies: {
          scrollsdk: Particle.getVersion()
        }
      },
      null,
      2
    )
    files[ParsersBundleFiles.readme] = this.toReadMe()

    const testCode = `const program = new ${languageName}(sampleCode)
const errors = program.getAllErrors()
console.log("Sample program compiled with " + errors.length + " errors.")
if (errors.length)
 console.log(errors.map(error => error.message))`

    const nodePath = `${languageName}.node.js`
    files[nodePath] = this.toNodeJsJavascript()
    files[ParsersBundleFiles.indexJs] = `module.exports = require("./${nodePath}")`

    const browserPath = `${languageName}.browser.js`
    files[browserPath] = this.toBrowserJavascript()
    files[ParsersBundleFiles.indexHtml] = `<script src="node_modules/scrollsdk/products/Utils.browser.js"></script>
<script src="node_modules/scrollsdk/products/Particle.browser.js"></script>
<script src="node_modules/scrollsdk/products/Parsers.ts.browser.js"></script>
<script src="${browserPath}"></script>
<script>
const sampleCode = \`${sampleCode.toString()}\`
${testCode}
</script>`

    const samplePath = "sample." + this.extensionName
    files[samplePath] = sampleCode.toString()
    files[ParsersBundleFiles.testJs] = `const ${languageName} = require("./index.js")
/*keep-line*/ const sampleCode = require("fs").readFileSync("${samplePath}", "utf8")
${testCode}`
    return files
  }

  get targetExtension() {
    return this.rootParserDefinition.get(ParsersConstants.compilesTo)
  }

  private _cache_atomTypes: {
    [name: string]: atomTypeDefinitionParser
  }

  get atomTypeDefinitions() {
    if (this._cache_atomTypes) return this._cache_atomTypes
    const types: { [typeName: string]: atomTypeDefinitionParser } = {}
    // todo: add built in atom types?
    this.getSubparticlesByParser(atomTypeDefinitionParser).forEach(type => (types[(<atomTypeDefinitionParser>type).atomTypeId] = type))
    this._cache_atomTypes = types
    return types
  }

  getAtomTypeDefinitionById(atomTypeId: particlesTypes.atomTypeId) {
    // todo: return unknownAtomTypeDefinition? or is that handled somewhere else?
    return this.atomTypeDefinitions[atomTypeId]
  }

  get parserLineage() {
    const newParticle = new Particle()
    Object.values(this.validConcreteAndAbstractParserDefinitions).forEach(particle => newParticle.touchParticle(particle.ancestorParserIdsArray.join(" ")))
    return newParticle
  }

  get languageDefinitionProgram() {
    return this
  }

  get validConcreteAndAbstractParserDefinitions() {
    return <parserDefinitionParser[]>this.getSubparticlesByParser(parserDefinitionParser).filter((particle: parserDefinitionParser) => particle._hasValidParserId())
  }

  private _cache_rootParserParticle: parserDefinitionParser

  private get lastRootParserDefinitionParticle() {
    return this.findLast(def => def instanceof AbstractParserDefinitionParser && def.has(ParsersConstants.root) && def._hasValidParserId())
  }

  private _initRootParserDefinitionParticle() {
    if (this._cache_rootParserParticle) return
    if (!this._cache_rootParserParticle) this._cache_rootParserParticle = this.lastRootParserDefinitionParticle
    // By default, have a very permissive basic root particle.
    // todo: whats the best design pattern to use for this sort of thing?
    if (!this._cache_rootParserParticle) {
      this._cache_rootParserParticle = <parserDefinitionParser>this.concat(`${ParsersConstants.DefaultRootParser}
 ${ParsersConstants.root}
 ${ParsersConstants.catchAllParser} ${ParsersConstants.BlobParser}`)[0]
      this._addDefaultCatchAllBlobParser()
    }
  }

  get rootParserDefinition() {
    this._initRootParserDefinitionParticle()
    return this._cache_rootParserParticle
  }

  // todo: whats the best design pattern to use for this sort of thing?
  // todo: remove this, or at least document wtf is going on
  _addedCatchAll: any
  _addDefaultCatchAllBlobParser() {
    if (this._addedCatchAll) return
    this._addedCatchAll = true
    delete this._cache_parserDefinitionParsers
    this.concat(`${ParsersConstants.BlobParser}
 ${ParsersConstants.baseParser} ${ParsersConstants.blobParser}`)
  }

  get extensionName() {
    return this.parsersName
  }

  get id() {
    return this.rootParserId
  }

  get rootParserId() {
    return this.rootParserDefinition.parserIdFromDefinition
  }

  get parsersName(): string | undefined {
    return this.rootParserId.replace(HandParsersProgram.parserSuffixRegex, "")
  }

  _getMyInScopeParserIds() {
    return super._getMyInScopeParserIds(this.rootParserDefinition)
  }

  protected _getInScopeParserIds(): particlesTypes.parserId[] {
    const parsersParticle = this.rootParserDefinition.getParticle(ParsersConstants.inScope)
    return parsersParticle ? parsersParticle.getAtomsFrom(1) : []
  }

  makeProgramParserDefinitionCache() {
    const cache = {}
    this.getSubparticlesByParser(parserDefinitionParser).forEach(parserDefinitionParser => (cache[(<parserDefinitionParser>parserDefinitionParser).parserIdFromDefinition] = parserDefinitionParser))
    return cache
  }

  static _languages: any = {}
  static _parsers: any = {}

  // todo: add explanation
  private _cached_rootParser: AbstractRuntimeProgramConstructorInterface
  compileAndReturnRootParser() {
    if (!this._cached_rootParser) {
      const rootDef = this.rootParserDefinition
      this._cached_rootParser = <AbstractRuntimeProgramConstructorInterface>rootDef.languageDefinitionProgram._compileAndReturnRootParser()
    }
    return this._cached_rootParser
  }

  private get fileExtensions(): string {
    return this.rootParserDefinition.get(ParsersConstants.extensions) ? this.rootParserDefinition.get(ParsersConstants.extensions).split(" ").join(",") : this.extensionName
  }

  toNodeJsJavascript(scrollsdkProductsPath: particlesTypes.requirePath = "scrollsdk/products"): particlesTypes.javascriptCode {
    return this._rootParticleDefToJavascriptClass(scrollsdkProductsPath, true).trim()
  }

  toBrowserJavascript(): particlesTypes.javascriptCode {
    return this._rootParticleDefToJavascriptClass("", false).trim()
  }

  private _rootParticleDefToJavascriptClass(scrollsdkProductsPath: particlesTypes.requirePath, forNodeJs = true): particlesTypes.javascriptCode {
    const defs = this.validConcreteAndAbstractParserDefinitions
    // todo: throw if there is no root particle defined
    const parserClasses = defs.map(def => def.asJavascriptClass).join("\n\n")
    const rootDef = this.rootParserDefinition
    const rootNodeJsHeader = forNodeJs && rootDef._getConcatBlockStringFromExtended(ParsersConstants._rootNodeJsHeader)
    const rootName = rootDef.generatedClassName

    if (!rootName) throw new Error(`Root Particle Type Has No Name`)

    let exportScript = ""
    if (forNodeJs)
      exportScript = `module.exports = ${rootName};
${rootName}`
    else exportScript = `window.${rootName} = ${rootName}`

    let nodeJsImports = ``
    if (forNodeJs) {
      const path = require("path")
      nodeJsImports = Object.keys(GlobalNamespaceAdditions)
        .map(key => {
          const thePath = scrollsdkProductsPath + "/" + GlobalNamespaceAdditions[key]
          return `const { ${key} } = require("${thePath.replace(/\\/g, "\\\\")}")` // escape windows backslashes
        })
        .join("\n")
    }

    // todo: we can expose the previous "constants" export, if needed, via the parsers, which we preserve.
    return `{
${nodeJsImports}
${rootNodeJsHeader ? rootNodeJsHeader : ""}
${parserClasses}

${exportScript}
}
`
  }

  toSublimeSyntaxFile() {
    const atomTypeDefs = this.atomTypeDefinitions
    const variables = Object.keys(atomTypeDefs)
      .map(name => ` ${name}: '${atomTypeDefs[name].regexString}'`)
      .join("\n")

    const defs = this.validConcreteAndAbstractParserDefinitions.filter(kw => !kw._isAbstract())
    const parserContexts = defs.map(def => def._toSublimeMatchBlock()).join("\n\n")
    const includes = defs.map(parserDef => `  - include: '${parserDef.parserIdFromDefinition}'`).join("\n")

    return `%YAML 1.2
---
name: ${this.extensionName}
file_extensions: [${this.fileExtensions}]
scope: source.${this.extensionName}

variables:
${variables}

contexts:
 main:
${includes}

${parserContexts}`
  }
}

const PreludeKinds: particlesTypes.stringMap = {}
PreludeKinds[PreludeAtomTypeIds.anyAtom] = ParsersAnyAtom
PreludeKinds[PreludeAtomTypeIds.keywordAtom] = ParsersKeyatomAtom
PreludeKinds[PreludeAtomTypeIds.floatAtom] = ParsersFloatAtom
PreludeKinds[PreludeAtomTypeIds.numberAtom] = ParsersFloatAtom
PreludeKinds[PreludeAtomTypeIds.bitAtom] = ParsersBitAtom
PreludeKinds[PreludeAtomTypeIds.boolAtom] = ParsersBoolAtom
PreludeKinds[PreludeAtomTypeIds.intAtom] = ParsersIntAtom

class UnknownParsersProgram extends Particle {
  private _inferRootParticleForAPrefixLanguage(parsersName: string): Particle {
    parsersName = HandParsersProgram.makeParserId(parsersName)
    const rootParticle = new Particle(`${parsersName}
 ${ParsersConstants.root}`)

    // note: right now we assume 1 global atomTypeMap and parserMap per parsers. But we may have scopes in the future?
    const rootParticleNames = this.getFirstAtoms()
      .filter(identity => identity)
      .map(atom => HandParsersProgram.makeParserId(atom))
    rootParticle
      .particleAt(0)
      .touchParticle(ParsersConstants.inScope)
      .setAtomsFrom(1, Array.from(new Set(rootParticleNames)))

    return rootParticle
  }

  private static _subparticleSuffix = "Subparticle"

  private _renameIntegerKeyatoms(clone: UnknownParsersProgram) {
    // todo: why are we doing this?
    for (let particle of clone.getTopDownArrayIterator()) {
      const firstAtomIsAnInteger = !!particle.firstAtom.match(/^\d+$/)
      const parentFirstAtom = particle.parent.firstAtom
      if (firstAtomIsAnInteger && parentFirstAtom) particle.setFirstAtom(HandParsersProgram.makeParserId(parentFirstAtom + UnknownParsersProgram._subparticleSuffix))
    }
  }

  private _getKeyatomMaps(clone: UnknownParsersProgram) {
    const keywordsToChildKeyatoms: { [firstAtom: string]: particlesTypes.stringMap } = {}
    const keywordsToParticleInstances: { [firstAtom: string]: Particle[] } = {}
    for (let particle of clone.getTopDownArrayIterator()) {
      const firstAtom = particle.firstAtom
      if (!keywordsToChildKeyatoms[firstAtom]) keywordsToChildKeyatoms[firstAtom] = {}
      if (!keywordsToParticleInstances[firstAtom]) keywordsToParticleInstances[firstAtom] = []
      keywordsToParticleInstances[firstAtom].push(particle)
      particle.forEach((subparticle: Particle) => (keywordsToChildKeyatoms[firstAtom][subparticle.firstAtom] = true))
    }
    return { keywordsToChildKeyatoms: keywordsToChildKeyatoms, keywordsToParticleInstances: keywordsToParticleInstances }
  }

  private _inferParserDef(firstAtom: string, globalAtomTypeMap: Map<string, string>, subparticleFirstAtoms: string[], instances: Particle[]) {
    const edgeSymbol = this.edgeSymbol
    const parserId = HandParsersProgram.makeParserId(firstAtom)
    const particleDefParticle = <Particle>new Particle(parserId).particleAt(0)
    const subparticleParserIds = subparticleFirstAtoms.map(atom => HandParsersProgram.makeParserId(atom))
    if (subparticleParserIds.length) particleDefParticle.touchParticle(ParsersConstants.inScope).setAtomsFrom(1, subparticleParserIds)

    const atomsForAllInstances = instances
      .map(line => line.content)
      .filter(identity => identity)
      .map(line => line.split(edgeSymbol))
    const instanceAtomCounts = new Set(atomsForAllInstances.map(atoms => atoms.length))
    const maxAtomsOnLine = Math.max(...Array.from(instanceAtomCounts))
    const minAtomsOnLine = Math.min(...Array.from(instanceAtomCounts))
    let catchAllAtomType: string
    let atomTypeIds = []
    for (let atomIndex = 0; atomIndex < maxAtomsOnLine; atomIndex++) {
      const atomType = this._getBestAtomType(
        firstAtom,
        instances.length,
        maxAtomsOnLine,
        atomsForAllInstances.map(atoms => atoms[atomIndex])
      )
      if (!globalAtomTypeMap.has(atomType.atomTypeId)) globalAtomTypeMap.set(atomType.atomTypeId, atomType.atomTypeDefinition)

      atomTypeIds.push(atomType.atomTypeId)
    }
    if (maxAtomsOnLine > minAtomsOnLine) {
      //columns = columns.slice(0, min)
      catchAllAtomType = atomTypeIds.pop()
      while (atomTypeIds[atomTypeIds.length - 1] === catchAllAtomType) {
        atomTypeIds.pop()
      }
    }

    const needsCruxProperty = !firstAtom.endsWith(UnknownParsersProgram._subparticleSuffix + ParsersConstants.parserSuffix) // todo: cleanup
    if (needsCruxProperty) particleDefParticle.set(ParsersConstants.crux, firstAtom)

    if (catchAllAtomType) particleDefParticle.set(ParsersConstants.catchAllAtomType, catchAllAtomType)

    const atomLine = atomTypeIds.slice()
    atomLine.unshift(PreludeAtomTypeIds.keywordAtom)
    if (atomLine.length > 0) particleDefParticle.set(ParsersConstants.atoms, atomLine.join(edgeSymbol))

    //if (!catchAllAtomType && atomTypeIds.length === 1) particleDefParticle.set(ParsersConstants.atoms, atomTypeIds[0])

    // Todo: add conditional frequencies
    return particleDefParticle.parent.toString()
  }

  //  inferParsersFileForAnSSVLanguage(parsersName: string): string {
  //     parsersName = HandParsersProgram.makeParserId(parsersName)
  //    const rootParticle = new Particle(`${parsersName}
  // ${ParsersConstants.root}`)

  //    // note: right now we assume 1 global atomTypeMap and parserMap per parsers. But we may have scopes in the future?
  //    const rootParticleNames = this.getFirstAtoms().map(atom => HandParsersProgram.makeParserId(atom))
  //    rootParticle
  //      .particleAt(0)
  //      .touchParticle(ParsersConstants.inScope)
  //      .setAtomsFrom(1, Array.from(new Set(rootParticleNames)))

  //    return rootParticle
  //  }

  inferParsersFileForAKeyatomLanguage(parsersName: string): string {
    const clone = <UnknownParsersProgram>this.clone()
    this._renameIntegerKeyatoms(clone)

    const { keywordsToChildKeyatoms, keywordsToParticleInstances } = this._getKeyatomMaps(clone)

    const globalAtomTypeMap = new Map()
    globalAtomTypeMap.set(PreludeAtomTypeIds.keywordAtom, undefined)
    const parserDefs = Object.keys(keywordsToChildKeyatoms)
      .filter(identity => identity)
      .map(firstAtom => this._inferParserDef(firstAtom, globalAtomTypeMap, Object.keys(keywordsToChildKeyatoms[firstAtom]), keywordsToParticleInstances[firstAtom]))

    const atomTypeDefs: string[] = []
    globalAtomTypeMap.forEach((def, id) => atomTypeDefs.push(def ? def : id))
    const particleBreakSymbol = this.particleBreakSymbol

    return this._formatCode([this._inferRootParticleForAPrefixLanguage(parsersName).toString(), atomTypeDefs.join(particleBreakSymbol), parserDefs.join(particleBreakSymbol)].filter(identity => identity).join("\n"))
  }

  private _formatCode(code: string) {
    // todo: make this run in browser too
    if (!this.isNodeJs()) return code

    const parsersProgram = new HandParsersProgram(Particle.fromDisk(__dirname + "/../langs/parsers/parsers.parsers"))
    const rootParser = <any>parsersProgram.compileAndReturnRootParser()
    const program = new rootParser(code)
    return program.format().toString()
  }

  private _getBestAtomType(firstAtom: string, instanceCount: particlesTypes.int, maxAtomsOnLine: particlesTypes.int, allValues: any[]): { atomTypeId: string; atomTypeDefinition?: string } {
    const asSet = new Set(allValues)
    const edgeSymbol = this.edgeSymbol
    const values = Array.from(asSet).filter(identity => identity)
    const every = (fn: Function) => {
      for (let index = 0; index < values.length; index++) {
        if (!fn(values[index])) return false
      }
      return true
    }
    if (every((str: string) => str === "0" || str === "1")) return { atomTypeId: PreludeAtomTypeIds.bitAtom }

    if (
      every((str: string) => {
        const num = parseInt(str)
        if (isNaN(num)) return false
        return num.toString() === str
      })
    ) {
      return { atomTypeId: PreludeAtomTypeIds.intAtom }
    }

    if (every((str: string) => str.match(/^-?\d*.?\d+$/))) return { atomTypeId: PreludeAtomTypeIds.floatAtom }

    const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"])
    if (every((str: string) => bools.has(str.toLowerCase()))) return { atomTypeId: PreludeAtomTypeIds.boolAtom }

    // todo: cleanup
    const enumLimit = 30
    if (instanceCount > 1 && maxAtomsOnLine === 1 && allValues.length > asSet.size && asSet.size < enumLimit)
      return {
        atomTypeId: HandParsersProgram.makeAtomTypeId(firstAtom),
        atomTypeDefinition: `${HandParsersProgram.makeAtomTypeId(firstAtom)}
 enum ${values.join(edgeSymbol)}`
      }

    return { atomTypeId: PreludeAtomTypeIds.anyAtom }
  }
}

export { ParsersConstants, PreludeAtomTypeIds, HandParsersProgram, ParserBackedParticle, UnknownParserError, UnknownParsersProgram }
