// Compiled language parsers will include these files:
const GlobalNamespaceAdditions = {
  Utils: "Utils.js",
  Particle: "Particle.js",
  HandParsersProgram: "Parsers.js",
  ParserBackedParticle: "Parsers.js"
}
var ParsersConstantsCompiler
;(function (ParsersConstantsCompiler) {
  ParsersConstantsCompiler["stringTemplate"] = "stringTemplate"
  ParsersConstantsCompiler["indentCharacter"] = "indentCharacter"
  ParsersConstantsCompiler["catchAllAtomDelimiter"] = "catchAllAtomDelimiter"
  ParsersConstantsCompiler["openSubparticles"] = "openSubparticles"
  ParsersConstantsCompiler["joinSubparticlesWith"] = "joinSubparticlesWith"
  ParsersConstantsCompiler["closeSubparticles"] = "closeSubparticles"
})(ParsersConstantsCompiler || (ParsersConstantsCompiler = {}))
var ParsersConstantsMisc
;(function (ParsersConstantsMisc) {
  ParsersConstantsMisc["doNotSynthesize"] = "doNotSynthesize"
})(ParsersConstantsMisc || (ParsersConstantsMisc = {}))
var PreludeAtomTypeIds
;(function (PreludeAtomTypeIds) {
  PreludeAtomTypeIds["anyAtom"] = "anyAtom"
  PreludeAtomTypeIds["cueAtom"] = "cueAtom"
  PreludeAtomTypeIds["extraAtomAtom"] = "extraAtomAtom"
  PreludeAtomTypeIds["floatAtom"] = "floatAtom"
  PreludeAtomTypeIds["numberAtom"] = "numberAtom"
  PreludeAtomTypeIds["bitAtom"] = "bitAtom"
  PreludeAtomTypeIds["booleanAtom"] = "booleanAtom"
  PreludeAtomTypeIds["integerAtom"] = "integerAtom"
})(PreludeAtomTypeIds || (PreludeAtomTypeIds = {}))
var ParsersConstantsConstantTypes
;(function (ParsersConstantsConstantTypes) {
  ParsersConstantsConstantTypes["boolean"] = "boolean"
  ParsersConstantsConstantTypes["string"] = "string"
  ParsersConstantsConstantTypes["int"] = "int"
  ParsersConstantsConstantTypes["float"] = "float"
})(ParsersConstantsConstantTypes || (ParsersConstantsConstantTypes = {}))
var ParsersAtomParser
;(function (ParsersAtomParser) {
  ParsersAtomParser["prefix"] = "prefix"
  ParsersAtomParser["postfix"] = "postfix"
  ParsersAtomParser["omnifix"] = "omnifix"
})(ParsersAtomParser || (ParsersAtomParser = {}))
var ParsersConstants
;(function (ParsersConstants) {
  // particle types
  ParsersConstants["comment"] = "//"
  ParsersConstants["parser"] = "parser"
  ParsersConstants["atomType"] = "atomType"
  ParsersConstants["parsersFileExtension"] = "parsers"
  ParsersConstants["abstractParserPrefix"] = "abstract"
  ParsersConstants["parserSuffix"] = "Parser"
  ParsersConstants["atomTypeSuffix"] = "Atom"
  // error check time
  ParsersConstants["regex"] = "regex"
  ParsersConstants["reservedAtoms"] = "reservedAtoms"
  ParsersConstants["enumFromAtomTypes"] = "enumFromAtomTypes"
  ParsersConstants["enum"] = "enum"
  ParsersConstants["examples"] = "examples"
  ParsersConstants["min"] = "min"
  ParsersConstants["max"] = "max"
  // baseParsers
  ParsersConstants["baseParser"] = "baseParser"
  ParsersConstants["blobParser"] = "blobParser"
  ParsersConstants["errorParser"] = "errorParser"
  // parse time
  ParsersConstants["extends"] = "extends"
  ParsersConstants["root"] = "root"
  ParsersConstants["cue"] = "cue"
  ParsersConstants["cueFromId"] = "cueFromId"
  ParsersConstants["pattern"] = "pattern"
  ParsersConstants["inScope"] = "inScope"
  ParsersConstants["atoms"] = "atoms"
  ParsersConstants["listDelimiter"] = "listDelimiter"
  ParsersConstants["contentKey"] = "contentKey"
  ParsersConstants["subparticlesKey"] = "subparticlesKey"
  ParsersConstants["uniqueCue"] = "uniqueCue"
  ParsersConstants["catchAllAtomType"] = "catchAllAtomType"
  ParsersConstants["atomParser"] = "atomParser"
  ParsersConstants["catchAllParser"] = "catchAllParser"
  ParsersConstants["constants"] = "constants"
  ParsersConstants["required"] = "required"
  ParsersConstants["single"] = "single"
  ParsersConstants["uniqueLine"] = "uniqueLine"
  ParsersConstants["tags"] = "tags"
  // default catchAll parser
  ParsersConstants["BlobParser"] = "BlobParser"
  ParsersConstants["DefaultRootParser"] = "DefaultRootParser"
  // code
  ParsersConstants["javascript"] = "javascript"
  // compile time
  ParsersConstants["compilerParser"] = "compiler"
  // develop time
  ParsersConstants["description"] = "description"
  ParsersConstants["example"] = "example"
  ParsersConstants["popularity"] = "popularity"
  ParsersConstants["paint"] = "paint"
})(ParsersConstants || (ParsersConstants = {}))
class TypedAtom extends ParticleAtom {
  constructor(particle, atomIndex, type) {
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
const _parserPoolCache = {}
// todo: can we merge these methods into base Particle and ditch this class?
class ParserBackedParticle extends Particle {
  // Returns a pointer to the Particle containing the parser definition. In the future this will
  // be in the same file. Right now we still have the split between Parser definitions and program code.
  get definition() {
    if (this._definition) return this._definition
    this._definition = this.isRoot() ? this.handParsersProgram : this.parent.definition.getParserDefinitionByParserId(this.constructor.name)
    return this._definition
  }
  registerParsers(parserCode, id) {
    // Todo: hacky as shit for now. Thats fine.
    // What we do here is if a parser comes in we recreate the entire root parser.
    // What we actually want to do is just minimally update the parser pool.
    // We can do that later, but it is sort of time to look at moving the Parsers
    // concept directly into Particles, perhaps even with a bit of a rewrite, and
    // remove a lot of the classes in this file.
    const root = this.root
    const currentParserCode = (root._modifiedConstructor || root.constructor)._parserSourceCode
    const newParserCode = currentParserCode + "\n" + parserCode
    const parsersProgram = new HandParsersProgram(newParserCode)
    const rootParser = parsersProgram.compileAndReturnRootParser()
    root.topDownArray.forEach(part => part.definition) // Hacky. We need to bind all previous particles to their earlier definitions, which now may change.
    root._definition = parsersProgram
    root._modifiedConstructor = rootParser
    root._parserPool = new rootParser()._getParserPool()
    // Clear parser cache.
    delete root._parserIdIndex
    if (id) _parserPoolCache[id] = root
  }
  switchParserPool(parserPoolId) {
    const sourceParticle = _parserPoolCache[parserPoolId]
    const root = this.root
    root.topDownArray.forEach(part => part.definition) // Hacky. We need to bind all previous particles to their earlier definitions, which now may change.
    root._definition = sourceParticle._definition
    root._modifiedConstructor = sourceParticle._modifiedConstructor
    root._parserPool = sourceParticle._parserPool
    // Clear parser cache.
    delete root._parserIdIndex
  }
  get rootParsersParticles() {
    return this.definition.root
  }
  getAutocompleteResults(partialAtom, atomIndex) {
    return atomIndex === 0 ? this._getAutocompleteResultsForCue(partialAtom) : this._getAutocompleteResultsForAtom(partialAtom, atomIndex)
  }
  makeError(message) {
    return new ParserDefinedError(this, message)
  }
  usesParser(parserId) {
    return !!this.parserIdIndex[parserId]
  }
  get parserIdIndex() {
    if (this._parserIdIndex) return this._parserIdIndex
    const index = {}
    this._parserIdIndex = index
    for (let particle of this.getTopDownArrayIterator()) {
      Array.from(particle.definition._getAncestorSet()).forEach(id => {
        if (!index[id]) index[id] = []
        index[id].push(particle)
      })
    }
    return index
  }
  get particleIndex() {
    // StringMap<int> {cue: index}
    // When there are multiple tails with the same cue, index stores the last content.
    // todo: change the above behavior: when a collision occurs, create an array.
    return this._particleIndex || this._makeParticleIndex()
  }
  _clearCueIndex() {
    delete this._particleIndex
    return super._clearCueIndex()
  }
  _makeCueIndex(startAt = 0) {
    if (this._particleIndex) this._makeParticleIndex(startAt)
    return super._makeCueIndex(startAt)
  }
  _makeParticleIndex(startAt = 0) {
    if (!this._particleIndex || !startAt) this._particleIndex = {}
    const particles = this._getSubparticlesArray()
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
  /**
   * Returns the total information bits required to represent this particle and all its subparticles.
   * This is calculated as the sum of:
   * 1. Information bits of all atoms in this particle
   * 2. Information bits of all subparticles (recursive)
   */
  get bitsRequired() {
    // Get information bits for all atoms in this particle
    const atomBits = this.parsedAtoms.map(atom => atom.bitsRequired).reduce((sum, bits) => sum + bits, 0)
    // Recursively get information bits from all subparticles
    const subparticleBits = this.map(child => child.bitsRequired).reduce((sum, bits) => sum + bits, 0)
    return atomBits + subparticleBits
  }
  getSubparticleInstancesOfParserId(parserId) {
    return this.particleIndex[parserId] || []
  }
  doesExtend(parserId) {
    return this.definition._doesExtend(parserId)
  }
  _getErrorParserErrors() {
    return [this.cue ? new UnknownParserError(this) : new BlankLineError(this)]
  }
  _getBlobParserCatchAllParser() {
    return BlobParser
  }
  _getAutocompleteResultsForCue(partialAtom) {
    const cueMap = this.definition.cueMapWithDefinitions
    let cues = Object.keys(cueMap)
    if (partialAtom) cues = cues.filter(cue => cue.includes(partialAtom))
    return cues
      .map(cue => {
        const def = cueMap[cue]
        if (def.suggestInAutocomplete === false) return false
        const description = def.description
        return {
          text: cue,
          displayText: cue + (description ? " " + description : "")
        }
      })
      .filter(i => i)
  }
  _getAutocompleteResultsForAtom(partialAtom, atomIndex) {
    // todo: root should be [] correct?
    const atom = this.parsedAtoms[atomIndex]
    return atom ? atom.getAutoCompleteAtoms(partialAtom) : []
  }
  // note: this is overwritten by the root particle of a runtime parsers program.
  // some of the magic that makes this all work. but maybe there's a better way.
  get handParsersProgram() {
    if (this.isRoot()) throw new Error(`Root particle without getHandParsersProgram defined.`)
    return this.root.handParsersProgram
  }
  getRunTimeEnumOptions(atom) {
    return undefined
  }
  getRunTimeEnumOptionsForValidation(atom) {
    return this.getRunTimeEnumOptions(atom)
  }
  _sortParticlesByInScopeOrder() {
    const parserOrder = this.definition._getMyInScopeParserIds()
    if (!parserOrder.length) return this
    const orderMap = {}
    parserOrder.forEach((atom, index) => (orderMap[atom] = index))
    this.sort(Utils.makeSortByFn(runtimeParticle => orderMap[runtimeParticle.parserId]))
    return this
  }
  get requiredParticleErrors() {
    const errors = []
    Object.values(this.definition.cueMapWithDefinitions).forEach(def => {
      if (def.isRequired() && !this.particleIndex[def.id]) errors.push(new MissingRequiredParserError(this, def.id))
    })
    return errors
  }
  get programAsAtoms() {
    // todo: what is this?
    return this.topDownArray.map(particle => {
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
    const atoms = []
    this.topDownArray.forEach(particle => particle.atomTypes.forEach((atom, index) => atoms.push(new TypedAtom(particle, index, atom.atomTypeId))))
    return atoms
  }
  findAllAtomsWithAtomType(atomTypeId) {
    return this.allTypedAtoms.filter(typedAtom => typedAtom.type === atomTypeId)
  }
  findAllParticlesWithParser(parserId) {
    return this.topDownArray.filter(particle => particle.parserId === parserId)
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
        const obj = {
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
          .map(err => err.getParticle().cue)
      )
    )
  }
  _getAllAutoCompleteAtoms() {
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
    const particles = [this.clone()]
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
      this._getAllAutoCompleteAtoms().map(result => {
        result.suggestions = result.suggestions.map(particle => particle.text).join(" ")
        return result
      })
    ).asTable
  }
  getAutocompleteResultsAt(lineIndex, charIndex) {
    const lineParticle = this.particleAtLine(lineIndex) || this
    const particleInScope = lineParticle.getParticleInScopeAtCharIndex(charIndex)
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
  _sortWithParentParsersUpTop() {
    const lineage = new HandParsersProgram(this.toString()).parserLineage
    const rank = {}
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
    handParsersProgram.validConcreteAndAbstractParserDefinitions.forEach(def => {
      const requiredAtomTypeIds = def.atomParser.getRequiredAtomTypeIds()
      usage.appendLine([def.parserIdFromDefinition, "line-id", "parser", requiredAtomTypeIds.join(" ")].join(" "))
    })
    this.topDownArray.forEach((particle, lineNumber) => {
      const stats = usage.getParticle(particle.parserId)
      stats.appendLine([filepath + "-" + lineNumber, particle.atoms.join(" ")].join(" "))
    })
    return usage
  }
  toPaintParticles() {
    return this.topDownArray.map(subparticle => subparticle.indentation + subparticle.getLinePaints()).join("\n")
  }
  toDefinitionLineNumberParticles() {
    return this.topDownArray.map(subparticle => subparticle.definition.lineNumber + " " + subparticle.indentation + subparticle.atomDefinitionLineNumbers.join(" ")).join("\n")
  }
  get asAtomTypeParticlesWithParserIds() {
    return this.topDownArray.map(subparticle => subparticle.constructor.name + this.atomBreakSymbol + subparticle.indentation + subparticle.lineAtomTypes).join("\n")
  }
  toPreludeAtomTypeParticlesWithParserIds() {
    return this.topDownArray.map(subparticle => subparticle.constructor.name + this.atomBreakSymbol + subparticle.indentation + subparticle.getLineAtomPreludeTypes()).join("\n")
  }
  get asParticlesWithParsers() {
    return this.topDownArray.map(subparticle => subparticle.constructor.name + this.atomBreakSymbol + subparticle.indentation + subparticle.getLine()).join("\n")
  }
  getAtomPaintAtPosition(lineIndex, atomIndex) {
    this._initAtomTypeCache()
    const typeParticle = this._cache_paintParticles.topDownArray[lineIndex - 1]
    return typeParticle ? typeParticle.getAtom(atomIndex - 1) : undefined
  }
  _initAtomTypeCache() {
    const particleMTime = this.getLineOrSubparticlesModifiedTime()
    if (this._cache_programAtomTypeStringMTime === particleMTime) return undefined
    this._cache_typeParticles = new Particle(this.toAtomTypeParticles())
    this._cache_paintParticles = new Particle(this.toPaintParticles())
    this._cache_programAtomTypeStringMTime = particleMTime
  }
  createParserPool() {
    return this.isRoot() ? new Particle.ParserPool(BlobParser) : new Particle.ParserPool(this.parent._getParserPool()._getCatchAllParser(this.parent), {})
  }
  get parserId() {
    return this.definition.cue
  }
  get atomTypes() {
    return this.parsedAtoms.filter(atom => atom.getAtom() !== undefined)
  }
  get atomErrors() {
    const { parsedAtoms } = this // todo: speedup. takes ~3s on pldb.
    // todo: speedup getErrorIfAny. takes ~3s on pldb.
    return parsedAtoms.map(check => check.getErrorIfAny()).filter(identity => identity)
  }
  get singleParserUsedTwiceErrors() {
    const errors = []
    const parent = this.parent
    const hits = parent.getSubparticleInstancesOfParserId(this.definition.id)
    if (hits.length > 1)
      hits.forEach((particle, index) => {
        if (particle === this) errors.push(new ParserUsedMultipleTimesError(particle))
      })
    return errors
  }
  get uniqueLineAppearsTwiceErrors() {
    const errors = []
    const parent = this.parent
    const hits = parent.getSubparticleInstancesOfParserId(this.definition.id)
    if (hits.length > 1) {
      const set = new Set()
      hits.forEach((particle, index) => {
        const line = particle.getLine()
        if (set.has(line)) errors.push(new ParserUsedMultipleTimesError(particle))
        set.add(line)
      })
    }
    return errors
  }
  get scopeErrors() {
    let errors = []
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
  get parsedAtoms() {
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
  _getCompiledIndentation() {
    const indentCharacter = this.definition._getCompilerObject()[ParsersConstantsCompiler.indentCharacter]
    const indent = this.indentation
    return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent
  }
  _getFields() {
    // fields are like atoms
    const fields = {}
    this.forEach(particle => {
      const def = particle.definition
      if (def.isRequired() || def.isSingle) fields[particle.getAtom(0)] = particle.content
    })
    return fields
  }
  _getCompiledLine() {
    const compiler = this.definition._getCompilerObject()
    const catchAllAtomDelimiter = compiler[ParsersConstantsCompiler.catchAllAtomDelimiter]
    const str = compiler[ParsersConstantsCompiler.stringTemplate]
    return str !== undefined ? Utils.formatStr(str, catchAllAtomDelimiter, Object.assign(this._getFields(), this.atomsMap)) : this.getLine()
  }
  get listDelimiter() {
    return this.definition._getFromExtended(ParsersConstants.listDelimiter)
  }
  get contentKey() {
    return this.definition._getFromExtended(ParsersConstants.contentKey)
  }
  get subparticlesKey() {
    return this.definition._getFromExtended(ParsersConstants.subparticlesKey)
  }
  get subparticlesAreTextBlob() {
    return this.definition._isBlobParser()
  }
  get isArrayElement() {
    return this.definition._hasFromExtended(ParsersConstants.uniqueCue) ? false : !this.definition.isSingle
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
    const key = this.cue
    if (this.subparticlesAreTextBlob) return [key, this.subparticlesToString()]
    const { typedContent, contentKey, subparticlesKey } = this
    if (contentKey || subparticlesKey) {
      let obj = {}
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
    const should = this.shouldSerialize
    return should === undefined ? true : should
  }
  get typedMap() {
    const obj = {}
    this.forEach(particle => {
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
    const atomsMap = {}
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
  createParserPool() {
    return new Particle.ParserPool(BlobParser, {})
  }
  getErrors() {
    return []
  }
}
// todo: can we remove this? hard to extend.
class UnknownParserParticle extends ParserBackedParticle {
  createParserPool() {
    return new Particle.ParserPool(UnknownParserParticle, {})
  }
  getErrors() {
    return [new UnknownParserError(this)]
  }
}
/*
A atom contains a atom but also the type information for that atom.
*/
class AbstractParsersBackedAtom {
  constructor(particle, index, typeDef, atomTypeId, isCatchAll, parserDefinitionParser) {
    this._typeDef = typeDef
    this._particle = particle
    this._isCatchAll = isCatchAll
    this._index = index
    this._atomTypeId = atomTypeId
    this._parserDefinitionParser = parserDefinitionParser
  }
  get optionCount() {
    return this._typeDef.optionCount
  }
  get bitsRequired() {
    return Math.log2(this.optionCount)
  }
  getAtom() {
    return this._particle.getAtom(this._index)
  }
  get definitionLineNumber() {
    return this._typeDef.lineNumber
  }
  get atomTypeId() {
    return this._atomTypeId
  }
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
  get paint() {
    const definition = this.atomTypeDefinition
    if (definition) return definition.paint // todo: why the undefined?
  }
  getAutoCompleteAtoms(partialAtom = "") {
    const atomDef = this.atomTypeDefinition
    let atoms = atomDef ? atomDef._getAutocompleteAtomOptions(this.getParticle().root) : []
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
  synthesizeAtom(seed = Date.now()) {
    // todo: cleanup
    const atomDef = this.atomTypeDefinition
    const enumOptions = atomDef._getFromExtended(ParsersConstants.enum)
    if (enumOptions) return Utils.getRandomString(1, enumOptions.split(" "))
    return this._synthesizeAtom(seed)
  }
  get atomTypeDefinition() {
    return this._typeDef
  }
  _getErrorContext() {
    return this.getParticle().getLine().split(" ")[0] // todo: AtomBreakSymbol
  }
  isValid() {
    const runTimeOptions = this.getParticle().getRunTimeEnumOptionsForValidation(this)
    const atom = this.getAtom()
    if (runTimeOptions) return runTimeOptions.includes(atom)
    return this.atomTypeDefinition.isValid(atom, this.getParticle().root) && this._isValid()
  }
  getErrorIfAny() {
    const atom = this.getAtom()
    if (atom !== undefined && this.isValid()) return undefined
    // todo: refactor invalidatomError. We want better error messages.
    return atom === undefined || atom === "" ? new MissingAtomError(this) : new InvalidAtomError(this)
  }
}
AbstractParsersBackedAtom.parserFunctionName = ""
class ParsersBitAtom extends AbstractParsersBackedAtom {
  _isValid() {
    const atom = this.getAtom()
    return atom === "0" || atom === "1"
  }
  get optionCount() {
    return 2
  }
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
ParsersBitAtom.defaultPaint = "constant.numeric"
class ParsersNumberAtom extends AbstractParsersBackedAtom {}
class ParsersIntegerAtom extends ParsersNumberAtom {
  _isValid() {
    const atom = this.getAtom()
    const num = parseInt(atom)
    if (isNaN(num)) return false
    return num.toString() === atom
  }
  get optionCount() {
    const minVal = parseInt(this.min) || -Infinity
    const maxVal = parseInt(this.max) || Infinity
    return maxVal - minVal + 1
  }
  _synthesizeAtom(seed) {
    return Utils.randomUniformInt(parseInt(this.min), parseInt(this.max), seed).toString()
  }
  get regexString() {
    return "-?[0-9]+"
  }
  get parsed() {
    const atom = this.getAtom()
    return parseInt(atom)
  }
}
ParsersIntegerAtom.defaultPaint = "constant.numeric.integer"
ParsersIntegerAtom.parserFunctionName = "parseInt"
class ParsersFloatAtom extends ParsersNumberAtom {
  _isValid() {
    const atom = this.getAtom()
    const num = parseFloat(atom)
    return !isNaN(num) && /^-?\d*(\.\d+)?([eE][+-]?\d+)?$/.test(atom)
  }
  get optionCount() {
    // For floats, we'll estimate based on typical float32 precision
    // ~7 decimal digits of precision
    const minVal = parseInt(this.min) || -Infinity
    const maxVal = parseInt(this.max) || Infinity
    return (maxVal - minVal) * Math.pow(10, 7)
  }
  _synthesizeAtom(seed) {
    return Utils.randomUniformFloat(parseFloat(this.min), parseFloat(this.max), seed).toString()
  }
  get regexString() {
    return "-?d*(.d+)?"
  }
  get parsed() {
    const atom = this.getAtom()
    return parseFloat(atom)
  }
}
ParsersFloatAtom.defaultPaint = "constant.numeric.float"
ParsersFloatAtom.parserFunctionName = "parseFloat"
// ErrorAtomType => parsers asks for a '' atom type here but the parsers does not specify a '' atom type. (todo: bring in didyoumean?)
class ParsersBooleanAtom extends AbstractParsersBackedAtom {
  constructor() {
    super(...arguments)
    this._trues = new Set(["1", "true", "t", "yes"])
    this._falses = new Set(["0", "false", "f", "no"])
  }
  _isValid() {
    const atom = this.getAtom()
    const str = atom.toLowerCase()
    return this._trues.has(str) || this._falses.has(str)
  }
  get optionCount() {
    return 2
  }
  _synthesizeAtom() {
    return Utils.getRandomString(1, ["1", "true", "t", "yes", "0", "false", "f", "no"])
  }
  _getOptions() {
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
ParsersBooleanAtom.defaultPaint = "constant.language"
class ParsersAnyAtom extends AbstractParsersBackedAtom {
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
class ParsersCueAtom extends ParsersAnyAtom {
  _synthesizeAtom() {
    return this._parserDefinitionParser.cueIfAny
  }
  get optionCount() {
    return 1
  }
}
ParsersCueAtom.defaultPaint = "keyword"
class ParsersExtraAtomAtomTypeAtom extends AbstractParsersBackedAtom {
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
  getErrorIfAny() {
    return new ExtraAtomError(this)
  }
}
class ParsersUnknownAtomTypeAtom extends AbstractParsersBackedAtom {
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
  getErrorIfAny() {
    return new UnknownAtomTypeError(this)
  }
}
class AbstractParticleError {
  constructor(particle) {
    this._particle = particle
  }
  getLineIndex() {
    return this.lineNumber - 1
  }
  get lineNumber() {
    return this.getParticle()._getLineNumber() // todo: handle sourcemaps
  }
  isCursorOnAtom(lineIndex, characterIndex) {
    return lineIndex === this.getLineIndex() && this._doesCharacterIndexFallOnAtom(characterIndex)
  }
  _doesCharacterIndexFallOnAtom(characterIndex) {
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
  get parserId() {
    return this.getParticle().parserId
  }
  _getCodeMirrorLineWidgetElementAtomTypeHints() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + this.getParticle().definition.lineHints))
    el.className = "LintAtomTypeHints"
    return el
  }
  _getCodeMirrorLineWidgetElementWithoutSuggestion() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + this.message))
    el.className = "LintError"
    return el
  }
  _getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion) {
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
      path: this.getParticle().getCuePath(),
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
  get message() {
    return `${this.errorTypeName} at line ${this.lineNumber} atom ${this.atomIndex}.`
  }
}
class AbstractAtomError extends AbstractParticleError {
  constructor(atom) {
    super(atom.getParticle())
    this._atom = atom
  }
  get atom() {
    return this._atom
  }
  get atomIndex() {
    return this._atom.atomIndex
  }
  get atomSuggestion() {
    return Utils.didYouMean(
      this.atom.getAtom(),
      this.atom.getAutoCompleteAtoms().map(option => option.text)
    )
  }
}
class UnknownParserError extends AbstractParticleError {
  get message() {
    const particle = this.getParticle()
    const parentParticle = particle.parent
    const options = parentParticle._getParserPool().getCueOptions()
    return super.message + ` Invalid parser "${particle.cue}". Valid parsers are: ${Utils._listToEnglishText(options, 7)}.`
  }
  get atomSuggestion() {
    const particle = this.getParticle()
    const parentParticle = particle.parent
    return Utils.didYouMean(
      particle.cue,
      parentParticle.getAutocompleteResults("", 0).map(option => option.text)
    )
  }
  get suggestionMessage() {
    const suggestion = this.atomSuggestion
    const particle = this.getParticle()
    if (suggestion) return `Change "${particle.cue}" to "${suggestion}"`
    return ""
  }
  applySuggestion() {
    const suggestion = this.atomSuggestion
    if (suggestion) this.getParticle().setAtom(this.atomIndex, suggestion)
    return this
  }
}
class ParserDefinedError extends AbstractParticleError {
  constructor(particle, message) {
    super()
    this._particle = particle
    this._message = message
  }
  get message() {
    return this._message
  }
}
class BlankLineError extends UnknownParserError {
  get message() {
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
  constructor(particle, missingParserId) {
    super(particle)
    this._missingParserId = missingParserId
  }
  get message() {
    return super.message + ` A "${this._missingParserId}" is required.`
  }
}
class ParserUsedMultipleTimesError extends AbstractParticleError {
  get message() {
    return super.message + ` Multiple "${this.getParticle().cue}" found.`
  }
  get suggestionMessage() {
    return `Delete line ${this.lineNumber}`
  }
  applySuggestion() {
    return this.getParticle().destroy()
  }
}
class LineAppearsMultipleTimesError extends AbstractParticleError {
  get message() {
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
  get message() {
    return super.message + ` No atomType "${this.atom.atomTypeId}" found. Language parsers for "${this.getExtension()}" may need to be fixed.`
  }
}
class InvalidAtomError extends AbstractAtomError {
  get message() {
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
  get message() {
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
  get message() {
    return super.message + ` Missing atom for atom "${this.atom.atomTypeId}".`
  }
  isMissingAtomError() {
    return true
  }
}
// todo: add standard types, enum types, from disk types
class AbstractParsersAtomTestParser extends Particle {}
class ParsersRegexTestParser extends AbstractParsersAtomTestParser {
  isValid(str) {
    if (!this._regex) this._regex = new RegExp("^" + this.content + "$")
    return !!str.match(this._regex)
  }
}
class ParsersReservedAtomsTestParser extends AbstractParsersAtomTestParser {
  isValid(str) {
    if (!this._set) this._set = new Set(this.content.split(" "))
    return !this._set.has(str)
  }
}
// todo: remove in favor of custom atom type constructors
class EnumFromAtomTypesTestParser extends AbstractParsersAtomTestParser {
  _getEnumFromAtomTypes(programRootParticle) {
    const atomTypeIds = this.getAtomsFrom(1)
    const enumGroup = atomTypeIds.join(" ")
    // note: hack where we store it on the program. otherwise has global effects.
    if (!programRootParticle._enumMaps) programRootParticle._enumMaps = {}
    if (programRootParticle._enumMaps[enumGroup]) return programRootParticle._enumMaps[enumGroup]
    const atomIndex = 1
    const map = {}
    const atomTypeMap = {}
    atomTypeIds.forEach(typeId => (atomTypeMap[typeId] = true))
    programRootParticle.allTypedAtoms
      .filter(typedAtom => atomTypeMap[typedAtom.type])
      .forEach(typedAtom => {
        map[typedAtom.atom] = true
      })
    programRootParticle._enumMaps[enumGroup] = map
    return map
  }
  // todo: remove
  isValid(str, programRootParticle) {
    return this._getEnumFromAtomTypes(programRootParticle)[str] === true
  }
}
class ParsersEnumTestParticle extends AbstractParsersAtomTestParser {
  isValid(str) {
    // enum c c++ java
    return !!this.getOptions()[str]
  }
  getOptions() {
    if (!this._map) this._map = Utils.arrayToMap(this.getAtomsFrom(1))
    return this._map
  }
}
class atomTypeDefinitionParser extends AbstractExtendibleParticle {
  createParserPool() {
    const types = {}
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
    return new Particle.ParserPool(undefined, types)
  }
  get id() {
    return this.getAtom(0)
  }
  get idToParticleMap() {
    return this.parent.atomTypeDefinitions
  }
  getGetter(atomIndex) {
    const atomToNativeJavascriptTypeParser = this.getAtomConstructor().parserFunctionName
    return `get ${this.atomTypeId}() {
      return ${atomToNativeJavascriptTypeParser ? atomToNativeJavascriptTypeParser + `(this.getAtom(${atomIndex}))` : `this.getAtom(${atomIndex})`}
    }`
  }
  getCatchAllGetter(atomIndex) {
    const atomToNativeJavascriptTypeParser = this.getAtomConstructor().parserFunctionName
    return `get ${this.atomTypeId}() {
      return ${atomToNativeJavascriptTypeParser ? `this.getAtomsFrom(${atomIndex}).map(val => ${atomToNativeJavascriptTypeParser}(val))` : `this.getAtomsFrom(${atomIndex})`}
    }`
  }
  // `this.getAtomsFrom(${requireds.length + 1})`
  // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
  getAtomConstructor() {
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
  _getExtendedAtomTypeId() {
    const arr = this._getAncestorsArray()
    return arr[arr.length - 1].id
  }
  get paint() {
    const hs = this._getFromExtended(ParsersConstants.paint)
    if (hs) return hs
    const preludeKind = this.preludeKind
    if (preludeKind) return preludeKind.defaultPaint
  }
  _getEnumOptions() {
    const enumParticle = this._getParticleFromExtended(ParsersConstants.enum)
    if (!enumParticle) return undefined
    // we sort by longest first to capture longest match first. todo: add test
    const options = Object.keys(enumParticle.getParticle(ParsersConstants.enum).getOptions())
    options.sort((a, b) => b.length - a.length)
    return options
  }
  get optionCount() {
    const enumOptions = this._getEnumOptions()
    if (enumOptions) return enumOptions.length
    return Infinity
  }
  _getEnumFromAtomTypeOptions(program) {
    const particle = this._getParticleFromExtended(ParsersConstants.enumFromAtomTypes)
    return particle ? Object.keys(particle.getParticle(ParsersConstants.enumFromAtomTypes)._getEnumFromAtomTypes(program)) : undefined
  }
  _getAutocompleteAtomOptions(program) {
    return this._getEnumOptions() || this._getEnumFromAtomTypeOptions(program) || []
  }
  get regexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return this._getFromExtended(ParsersConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*")
  }
  _getAllTests() {
    return this._getSubparticlesByParserInExtended(AbstractParsersAtomTestParser)
  }
  isValid(str, programRootParticle) {
    return this._getAllTests().every(particle => particle.isValid(str, programRootParticle))
  }
  get atomTypeId() {
    return this.getAtom(0)
  }
}
class AbstractAtomParser {
  constructor(definition) {
    this._definition = definition
  }
  get catchAllAtomTypeId() {
    return this._definition._getFromExtended(ParsersConstants.catchAllAtomType)
  }
  // todo: improve layout (use bold?)
  get lineHints() {
    const catchAllAtomTypeId = this.catchAllAtomTypeId
    const parserId = this._definition.cueIfAny || this._definition.id // todo: cleanup
    return `${parserId}: ${this.getRequiredAtomTypeIds().join(" ")}${catchAllAtomTypeId ? ` ${catchAllAtomTypeId}...` : ""}`
  }
  getRequiredAtomTypeIds() {
    if (!this._requiredAtomTypeIds) {
      const parameters = this._definition._getFromExtended(ParsersConstants.atoms)
      this._requiredAtomTypeIds = parameters ? parameters.split(" ") : []
    }
    return this._requiredAtomTypeIds
  }
  _getAtomTypeId(atomIndex, requiredAtomTypeIds, totalAtomCount) {
    return requiredAtomTypeIds[atomIndex]
  }
  _isCatchAllAtom(atomIndex, numberOfRequiredAtoms, totalAtomCount) {
    return atomIndex >= numberOfRequiredAtoms
  }
  getAtomArray(particle = undefined) {
    const atomCount = particle ? particle.atoms.length : 0
    const def = this._definition
    const parsersProgram = def.languageDefinitionProgram
    const requiredAtomTypeIds = this.getRequiredAtomTypeIds()
    const numberOfRequiredAtoms = requiredAtomTypeIds.length
    const actualAtomCountOrRequiredAtomCount = Math.max(atomCount, numberOfRequiredAtoms)
    const atoms = []
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
      const anyAtomConstructor = atomConstructor
      atoms[atomIndex] = new anyAtomConstructor(particle, atomIndex, atomTypeDefinition, atomTypeId, isCatchAll, def)
    }
    return atoms
  }
}
class PrefixAtomParser extends AbstractAtomParser {}
class PostfixAtomParser extends AbstractAtomParser {
  _isCatchAllAtom(atomIndex, numberOfRequiredAtoms, totalAtomCount) {
    return atomIndex < totalAtomCount - numberOfRequiredAtoms
  }
  _getAtomTypeId(atomIndex, requiredAtomTypeIds, totalAtomCount) {
    const catchAllAtomCount = Math.max(totalAtomCount - requiredAtomTypeIds.length, 0)
    return requiredAtomTypeIds[atomIndex - catchAllAtomCount]
  }
}
class OmnifixAtomParser extends AbstractAtomParser {
  getAtomArray(particle = undefined) {
    const atomsArr = []
    const def = this._definition
    const program = particle ? particle.root : undefined
    const parsersProgram = def.languageDefinitionProgram
    const atoms = particle ? particle.atoms : []
    const requiredAtomTypeDefs = this.getRequiredAtomTypeIds().map(atomTypeId => parsersProgram.getAtomTypeDefinitionById(atomTypeId))
    const catchAllAtomTypeId = this.catchAllAtomTypeId
    const catchAllAtomTypeDef = catchAllAtomTypeId && parsersProgram.getAtomTypeDefinitionById(catchAllAtomTypeId)
    atoms.forEach((atom, atomIndex) => {
      let atomConstructor
      for (let index = 0; index < requiredAtomTypeDefs.length; index++) {
        const atomTypeDefinition = requiredAtomTypeDefs[index]
        if (atomTypeDefinition.isValid(atom, program)) {
          // todo: cleanup atomIndex/atomIndex stuff
          atomConstructor = atomTypeDefinition.getAtomConstructor()
          atomsArr.push(new atomConstructor(particle, atomIndex, atomTypeDefinition, atomTypeDefinition.id, false, def))
          requiredAtomTypeDefs.splice(index, 1)
          return true
        }
      }
      if (catchAllAtomTypeDef && catchAllAtomTypeDef.isValid(atom, program)) {
        atomConstructor = catchAllAtomTypeDef.getAtomConstructor()
        atomsArr.push(new atomConstructor(particle, atomIndex, catchAllAtomTypeDef, catchAllAtomTypeId, true, def))
        return true
      }
      atomsArr.push(new ParsersUnknownAtomTypeAtom(particle, atomIndex, undefined, undefined, false, def))
    })
    const atomCount = atoms.length
    requiredAtomTypeDefs.forEach((atomTypeDef, index) => {
      let atomConstructor = atomTypeDef.getAtomConstructor()
      atomsArr.push(new atomConstructor(particle, atomCount + index, atomTypeDef, atomTypeDef.id, false, def))
    })
    return atomsArr
  }
}
class ParsersExampleParser extends Particle {}
class ParsersCompilerParser extends Particle {
  createParserPool() {
    const types = [
      ParsersConstantsCompiler.stringTemplate,
      ParsersConstantsCompiler.indentCharacter,
      ParsersConstantsCompiler.catchAllAtomDelimiter,
      ParsersConstantsCompiler.joinSubparticlesWith,
      ParsersConstantsCompiler.openSubparticles,
      ParsersConstantsCompiler.closeSubparticles
    ]
    const map = {}
    types.forEach(type => {
      map[type] = Particle
    })
    return new Particle.ParserPool(undefined, map)
  }
}
class AbstractParserConstantParser extends Particle {
  constructor(subparticles, line, parent) {
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
class AbstractParserDefinitionParser extends AbstractExtendibleParticle {
  constructor() {
    super(...arguments)
    this._isLooping = false
  }
  createParserPool() {
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
      ParsersConstants.tags,
      ParsersConstants.cue,
      ParsersConstants.cueFromId,
      ParsersConstants.listDelimiter,
      ParsersConstants.contentKey,
      ParsersConstants.subparticlesKey,
      ParsersConstants.uniqueCue,
      ParsersConstants.uniqueLine,
      ParsersConstants.pattern,
      ParsersConstants.baseParser,
      ParsersConstants.required,
      ParsersConstants.root,
      ParsersConstants.javascript,
      ParsersConstants.javascript,
      ParsersConstants.single,
      ParsersConstants.comment
    ]
    const map = {}
    types.forEach(type => {
      map[type] = Particle
    })
    map[ParsersConstantsConstantTypes.boolean] = ParsersParserConstantBoolean
    map[ParsersConstantsConstantTypes.int] = ParsersParserConstantInt
    map[ParsersConstantsConstantTypes.string] = ParsersParserConstantString
    map[ParsersConstantsConstantTypes.float] = ParsersParserConstantFloat
    map[ParsersConstants.compilerParser] = ParsersCompilerParser
    map[ParsersConstants.example] = ParsersExampleParser
    return new Particle.ParserPool(undefined, map, [{ regex: HandParsersProgram.parserFullRegex, parser: parserDefinitionParser }])
  }
  toTypeScriptInterface(used = new Set()) {
    let subparticlesInterfaces = []
    let properties = []
    const inScope = this.cueMapWithDefinitions
    const thisId = this.id
    used.add(thisId)
    Object.keys(inScope).forEach(key => {
      const def = inScope[key]
      const map = def.cueMapWithDefinitions
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
    const obj = {}
    const items = extended ? this._getSubparticlesByParserInExtended(AbstractParserConstantParser) : this.getSubparticlesByParser(AbstractParserConstantParser)
    items.reverse() // Last definition wins.
    items.forEach(particle => (obj[particle.identifier] = particle))
    return obj
  }
  get examples() {
    return this._getSubparticlesByParserInExtended(ParsersExampleParser)
  }
  get parserIdFromDefinition() {
    return this.cue
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
  get cueIfAny() {
    return this.get(ParsersConstants.cue) || (this._hasFromExtended(ParsersConstants.cueFromId) ? this.idWithoutSuffix : undefined)
  }
  get regexMatch() {
    return this.get(ParsersConstants.pattern)
  }
  get cueEnumOptions() {
    const cueDef = this._getMyAtomTypeDefs()[0]
    return cueDef ? cueDef._getEnumOptions() : undefined
  }
  get languageDefinitionProgram() {
    return this.root
  }
  get customJavascriptMethods() {
    const hasJsCode = this.has(ParsersConstants.javascript)
    return hasJsCode ? this.getParticle(ParsersConstants.javascript).subparticlesToString() : ""
  }
  get cueMapWithDefinitions() {
    if (!this._cache_cueToParticleDefMap) this._cache_cueToParticleDefMap = this._createParserInfo(this._getInScopeParserIds()).cueMap
    return this._cache_cueToParticleDefMap
  }
  // todo: remove
  get runTimeCuesInScope() {
    return this._getParserPool().getCueOptions()
  }
  _getMyAtomTypeDefs() {
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
  get atomGettersAndParserConstants() {
    // todo: add atomType parsings
    const parsersProgram = this.languageDefinitionProgram
    const getters = this._getMyAtomTypeDefs().map((atomTypeDef, index) => atomTypeDef.getGetter(index))
    const catchAllAtomTypeId = this.get(ParsersConstants.catchAllAtomType)
    if (catchAllAtomTypeId) getters.push(parsersProgram.getAtomTypeDefinitionById(catchAllAtomTypeId).getCatchAllGetter(getters.length))
    // Constants
    Object.values(this._getUniqueConstantParticles(false)).forEach(particle => getters.push(particle.getGetter()))
    return getters.join("\n")
  }
  _createParserInfo(parserIdsInScope) {
    const result = {
      cueMap: {},
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
        const cue = def.cueIfAny
        const enumOptions = def.cueEnumOptions
        if (regex) result.regexTests.push({ regex: regex, parser: def.parserIdFromDefinition })
        else if (cue) result.cueMap[cue] = def
        else if (enumOptions) {
          enumOptions.forEach(option => (result.cueMap[option] = def))
        }
      })
    return result
  }
  get topParserDefinitions() {
    const arr = Object.values(this.cueMapWithDefinitions)
    arr.sort(Utils.makeSortByFn(definition => definition.popularity))
    arr.reverse()
    return arr
  }
  _getMyInScopeParserIds(target = this) {
    const parsersParticle = target.getParticle(ParsersConstants.inScope)
    const scopedDefinitionIds = target.myScopedParserDefinitions.map(def => def.id)
    return parsersParticle ? parsersParticle.getAtomsFrom(1).concat(scopedDefinitionIds) : scopedDefinitionIds
  }
  _getInScopeParserIds() {
    // todo: allow multiple of these if we allow mixins?
    const ids = this._getMyInScopeParserIds()
    const parentDef = this._getExtendedParent()
    return parentDef ? ids.concat(parentDef._getInScopeParserIds()) : ids
  }
  get isSingle() {
    const hit = this._getParticleFromExtended(ParsersConstants.single)
    return hit && hit.get(ParsersConstants.single) !== "false"
  }
  get isUniqueLine() {
    const hit = this._getParticleFromExtended(ParsersConstants.uniqueLine)
    return hit && hit.get(ParsersConstants.uniqueLine) !== "false"
  }
  isRequired() {
    return this._hasFromExtended(ParsersConstants.required)
  }
  getParserDefinitionByParserId(parserId) {
    // todo: return catch all?
    const def = this.programParserDefinitionCache[parserId]
    if (def) return def
    this.languageDefinitionProgram._addDefaultCatchAllBlobParser() // todo: cleanup. Why did I do this? Needs to be removed or documented.
    const particleDef = this.languageDefinitionProgram.programParserDefinitionCache[parserId]
    if (!particleDef) throw new Error(`No definition found for parser id "${parserId}". Particle: \n---\n${this.asString}\n---`)
    return particleDef
  }
  isDefined(parserId) {
    return !!this.programParserDefinitionCache[parserId]
  }
  get idToParticleMap() {
    return this.programParserDefinitionCache
  }
  _amIRoot() {
    if (this._cache_isRoot === undefined) this._cache_isRoot = this._languageRootParticle === this
    return this._cache_isRoot
  }
  get _languageRootParticle() {
    return this.root.rootParserDefinition
  }
  _isErrorParser() {
    return this.get(ParsersConstants.baseParser) === ParsersConstants.errorParser
  }
  _isBlobParser() {
    // Do not check extended classes. Only do once.
    return this._getFromExtended(ParsersConstants.baseParser) === ParsersConstants.blobParser
  }
  get errorMethodToJavascript() {
    if (this._isBlobParser()) return "getErrors() { return [] }" // Skips parsing subparticles for perf gains.
    if (this._isErrorParser()) return "getErrors() { return this._getErrorParserErrors() }"
    return ""
  }
  get parserAsJavascript() {
    if (this._isBlobParser())
      // todo: do we need this?
      return "createParserPool() { return new Particle.ParserPool(this._getBlobParserCatchAllParser())}"
    const parserInfo = this._createParserInfo(this._getMyInScopeParserIds())
    const myCueMap = parserInfo.cueMap
    const regexRules = parserInfo.regexTests
    // todo: use constants in first atom maps?
    // todo: cache the super extending?
    const cues = Object.keys(myCueMap)
    const hasCues = cues.length
    const catchAllParser = this.catchAllParserToJavascript
    if (!hasCues && !catchAllParser && !regexRules.length) return ""
    const cuesStr = hasCues ? `Object.assign(Object.assign({}, super.createParserPool()._getCueMapAsObject()), {` + cues.map(cue => `"${cue}" : ${myCueMap[cue].parserIdFromDefinition}`).join(",\n") + "})" : "undefined"
    const regexStr = regexRules.length
      ? `[${regexRules
          .map(rule => {
            return `{regex: /${rule.regex}/, parser: ${rule.parser}}`
          })
          .join(",")}]`
      : "undefined"
    const catchAllStr = catchAllParser ? catchAllParser : this._amIRoot() ? `this._getBlobParserCatchAllParser()` : "undefined"
    const scopedParserJavascript = this.myScopedParserDefinitions.map(def => def.asJavascriptClass).join("\n\n")
    return `createParserPool() {${scopedParserJavascript}
  return new Particle.ParserPool(${catchAllStr}, ${cuesStr}, ${regexStr})
  }`
  }
  get myScopedParserDefinitions() {
    return this.getSubparticlesByParser(parserDefinitionParser)
  }
  get catchAllParserToJavascript() {
    if (this._isBlobParser()) return "this._getBlobParserCatchAllParser()"
    const parserId = this.get(ParsersConstants.catchAllParser)
    if (!parserId) return ""
    const particleDef = this.getParserDefinitionByParserId(parserId)
    return particleDef.generatedClassName
  }
  get asJavascriptClass() {
    const components = [this.parserAsJavascript, this.errorMethodToJavascript, this.atomGettersAndParserConstants, this.customJavascriptMethods].filter(identity => identity)
    const thisClassName = this.generatedClassName
    if (this._amIRoot()) {
      components.push(`static _parserSourceCode = \`${Utils.escapeBackTicks(this.parent.toString().replace(/\\/g, "\\\\"))}\`
        static cachedHandParsersProgramRoot = new HandParsersProgram(this._parserSourceCode)
        get handParsersProgram() {
          return this.constructor.cachedHandParsersProgramRoot
      }`)
      components.push(`static rootParser = ${thisClassName}`)
    }
    return `class ${thisClassName} extends ${this._getExtendsClassName()} {
      ${components.join("\n")}
    }`
  }
  _getExtendsClassName() {
    const extendedDef = this._getExtendedParent()
    return extendedDef ? extendedDef.generatedClassName : "ParserBackedParticle"
  }
  _getCompilerObject() {
    let obj = {}
    const items = this._getSubparticlesByParserInExtended(ParsersCompilerParser)
    items.reverse() // Last definition wins.
    items.forEach(particle => {
      obj = Object.assign(obj, particle.toObject()) // todo: what about multiline strings?
    })
    return obj
  }
  // todo: improve layout (use bold?)
  get lineHints() {
    return this.atomParser.lineHints
  }
  isOrExtendsAParserInScope(cuesInScope) {
    const chain = this._getParserInheritanceSet()
    return cuesInScope.some(cue => chain.has(cue))
  }
  isTerminalParser() {
    return !this._getFromExtended(ParsersConstants.inScope) && !this._getFromExtended(ParsersConstants.catchAllParser)
  }
  _getParserInheritanceSet() {
    if (!this._cache_parserInheritanceSet) this._cache_parserInheritanceSet = new Set(this.ancestorParserIdsArray)
    return this._cache_parserInheritanceSet
  }
  get ancestorParserIdsArray() {
    if (!this._cache_ancestorParserIdsArray) {
      this._cache_ancestorParserIdsArray = this._getAncestorsArray().map(def => def.parserIdFromDefinition)
      this._cache_ancestorParserIdsArray.reverse()
    }
    return this._cache_ancestorParserIdsArray
  }
  get programParserDefinitionCache() {
    var _a
    if (!this._cache_parserDefinitionParsers) {
      if (this._isLooping) throw new Error(`Loop detected in ${this.id}`)
      this._isLooping = true
      this._cache_parserDefinitionParsers =
        this.isRoot() || this.hasParserDefinitions
          ? this.makeProgramParserDefinitionCache()
          : ((_a = this.parent.programParserDefinitionCache[this.get(ParsersConstants.extends)]) === null || _a === void 0 ? void 0 : _a.programParserDefinitionCache) || this.parent.programParserDefinitionCache
      this._isLooping = false
    }
    return this._cache_parserDefinitionParsers
  }
  get hasParserDefinitions() {
    return !!this.getSubparticlesByParser(parserDefinitionParser).length
  }
  makeProgramParserDefinitionCache() {
    const scopedParsers = this.getSubparticlesByParser(parserDefinitionParser)
    const cache = Object.assign({}, this.parent.programParserDefinitionCache) // todo. We don't really need this. we should just lookup the parent if no local hits.
    scopedParsers.forEach(parserDefinitionParser => (cache[parserDefinitionParser.parserIdFromDefinition] = parserDefinitionParser))
    return cache
  }
  get description() {
    return this._getFromExtended(ParsersConstants.description) || ""
  }
  get popularity() {
    const val = this._getFromExtended(ParsersConstants.popularity)
    return val ? parseFloat(val) : 0
  }
  _getExtendedParserId() {
    const ancestorIds = this.ancestorParserIdsArray
    if (ancestorIds.length > 1) return ancestorIds[ancestorIds.length - 2]
  }
  _generateSimulatedLine(seed) {
    // todo: generate simulated data from catch all
    const cue = this.cueIfAny
    return this.atomParser
      .getAtomArray()
      .map((atom, index) => (!index && cue ? cue : atom.synthesizeAtom(seed)))
      .join(" ")
  }
  _shouldSynthesize(def, parserChain) {
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
  _collectAllDefinitions(defs, collection = []) {
    defs.forEach(def => {
      collection.push(def)
      def._collectAllDefinitions(def.getSubparticlesByParser(parserDefinitionParser), collection)
    })
    return collection
  }
  get cuePath() {
    const parentPath = this.parent.cuePath
    return (parentPath ? parentPath + " " : "") + this.cueIfAny
  }
  get cuePathAsColumnName() {
    return this.cuePath.replace(/ /g, "_")
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
  _getConcreteNonErrorInScopeParticleDefinitions(parserIds) {
    const defs = []
    parserIds.forEach(parserId => {
      const def = this.getParserDefinitionByParserId(parserId)
      if (def._isErrorParser()) return
      else if (def._isAbstract()) def.concreteInScopeDescendantDefinitions.forEach(def => defs.push(def))
      else defs.push(def)
    })
    return defs
  }
  // todo: refactor
  synthesizeParticle(particleCount = 1, indentCount = -1, parsersAlreadySynthesized = [], seed = Date.now()) {
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
  createParserPool() {
    const map = {}
    map[ParsersConstants.comment] = Particle
    return new Particle.ParserPool(UnknownParserParticle, map, [
      { regex: HandParsersProgram.blankLineRegex, parser: Particle },
      { regex: HandParsersProgram.parserFullRegex, parser: parserDefinitionParser },
      { regex: HandParsersProgram.atomTypeFullRegex, parser: atomTypeDefinitionParser }
    ])
  }
  // rootParser
  // Note: this is some so far unavoidable tricky code. We need to eval the transpiled JS, in a NodeJS or browser environment.
  _compileAndReturnRootParser() {
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
  get cuePath() {
    return ""
  }
  _setDirName(name) {
    this._dirName = name
    return this
  }
  _requireInVmNodeJsRootParser(code) {
    const vm = require("vm")
    const path = require("path")
    // todo: cleanup up
    try {
      Object.keys(GlobalNamespaceAdditions).forEach(key => {
        global[key] = require("./" + GlobalNamespaceAdditions[key])
      })
      global.require = require
      global.__dirname = this._dirName
      global.module = {}
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
    const testBlocks = {}
    this.validConcreteAndAbstractParserDefinitions.forEach(def =>
      def.examples.forEach(example => {
        const id = def.id + example.content
        testBlocks[id] = equal => {
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
    return `<h3>${languageName} stats</h3>
<ul>
<li>${languageName} has ${parserLineage.topDownArray.length} parsers.</li>
<li>${languageName} has ${Object.keys(atomTypes).length} atom types.</li>
<li>The source code for ${languageName} is ${this.topDownArray.length} lines long.</li>
</ul>
`
  }
  get atomTypeDefinitions() {
    if (this._cache_atomTypes) return this._cache_atomTypes
    const types = {}
    // todo: add built in atom types?
    this.getSubparticlesByParser(atomTypeDefinitionParser).forEach(type => (types[type.atomTypeId] = type))
    this._cache_atomTypes = types
    return types
  }
  getAtomTypeDefinitionById(atomTypeId) {
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
    return this.getSubparticlesByParser(parserDefinitionParser).filter(particle => particle._hasValidParserId())
  }
  get lastRootParserDefinitionParticle() {
    return this.findLast(def => def instanceof AbstractParserDefinitionParser && def.has(ParsersConstants.root) && def._hasValidParserId())
  }
  _initRootParserDefinitionParticle() {
    if (this._cache_rootParserParticle) return
    if (!this._cache_rootParserParticle) this._cache_rootParserParticle = this.lastRootParserDefinitionParticle
    // By default, have a very permissive basic root particle.
    // todo: whats the best design pattern to use for this sort of thing?
    if (!this._cache_rootParserParticle) {
      this._cache_rootParserParticle = this.concat(`${ParsersConstants.DefaultRootParser}
 ${ParsersConstants.root}
 ${ParsersConstants.catchAllParser} ${ParsersConstants.BlobParser}`)[0]
      this._addDefaultCatchAllBlobParser()
    }
  }
  get rootParserDefinition() {
    this._initRootParserDefinitionParticle()
    return this._cache_rootParserParticle
  }
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
  get parsersName() {
    return this.rootParserId.replace(HandParsersProgram.parserSuffixRegex, "")
  }
  _getMyInScopeParserIds() {
    return super._getMyInScopeParserIds(this.rootParserDefinition)
  }
  _getInScopeParserIds() {
    const parsersParticle = this.rootParserDefinition.getParticle(ParsersConstants.inScope)
    return parsersParticle ? parsersParticle.getAtomsFrom(1) : []
  }
  makeProgramParserDefinitionCache() {
    const cache = {}
    this.getSubparticlesByParser(parserDefinitionParser).forEach(parserDefinitionParser => (cache[parserDefinitionParser.parserIdFromDefinition] = parserDefinitionParser))
    return cache
  }
  compileAndReturnRootParser() {
    if (!this._cached_rootParser) {
      const rootDef = this.rootParserDefinition
      this._cached_rootParser = rootDef.languageDefinitionProgram._compileAndReturnRootParser()
    }
    return this._cached_rootParser
  }
  toNodeJsJavascript(scrollsdkProductsPath = "scrollsdk/products") {
    return this._rootParticleDefToJavascriptClass(scrollsdkProductsPath, true).trim()
  }
  toBrowserJavascript() {
    return this._rootParticleDefToJavascriptClass("", false).trim()
  }
  _rootParticleDefToJavascriptClass(scrollsdkProductsPath, forNodeJs = true) {
    const defs = this.validConcreteAndAbstractParserDefinitions
    // todo: throw if there is no root particle defined
    const parserClasses = defs.map(def => def.asJavascriptClass).join("\n\n")
    const rootDef = this.rootParserDefinition
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
${parserClasses}

${exportScript}
}
`
  }
}
HandParsersProgram.makeParserId = str => Utils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandParsersProgram.parserSuffixRegex, "") + ParsersConstants.parserSuffix
HandParsersProgram.makeAtomTypeId = str => Utils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandParsersProgram.atomTypeSuffixRegex, "") + ParsersConstants.atomTypeSuffix
HandParsersProgram.parserSuffixRegex = new RegExp(ParsersConstants.parserSuffix + "$")
HandParsersProgram.parserFullRegex = new RegExp("^[a-zA-Z0-9_]+" + ParsersConstants.parserSuffix + "$")
HandParsersProgram.blankLineRegex = new RegExp("^$")
HandParsersProgram.atomTypeSuffixRegex = new RegExp(ParsersConstants.atomTypeSuffix + "$")
HandParsersProgram.atomTypeFullRegex = new RegExp("^[a-zA-Z0-9_]+" + ParsersConstants.atomTypeSuffix + "$")
const PreludeKinds = {}
PreludeKinds[PreludeAtomTypeIds.anyAtom] = ParsersAnyAtom
PreludeKinds[PreludeAtomTypeIds.cueAtom] = ParsersCueAtom
PreludeKinds[PreludeAtomTypeIds.floatAtom] = ParsersFloatAtom
PreludeKinds[PreludeAtomTypeIds.numberAtom] = ParsersFloatAtom
PreludeKinds[PreludeAtomTypeIds.bitAtom] = ParsersBitAtom
PreludeKinds[PreludeAtomTypeIds.booleanAtom] = ParsersBooleanAtom
PreludeKinds[PreludeAtomTypeIds.integerAtom] = ParsersIntegerAtom
class UnknownParsersProgram extends Particle {
  _inferRootParticleForAPrefixLanguage(parsersName) {
    parsersName = HandParsersProgram.makeParserId(parsersName)
    const rootParticle = new Particle(`${parsersName}
 ${ParsersConstants.root}`)
    // note: right now we assume 1 global atomTypeMap and parserMap per parsers. But we may have scopes in the future?
    const rootParticleNames = this.getCues()
      .filter(identity => identity)
      .map(atom => HandParsersProgram.makeParserId(atom))
    rootParticle
      .particleAt(0)
      .touchParticle(ParsersConstants.inScope)
      .setAtomsFrom(1, Array.from(new Set(rootParticleNames)))
    return rootParticle
  }
  _renameIntegerCues(clone) {
    // todo: why are we doing this?
    for (let particle of clone.getTopDownArrayIterator()) {
      const cueIsAnInteger = !!particle.cue.match(/^\d+$/)
      const parentCue = particle.parent.cue
      if (cueIsAnInteger && parentCue) particle.setCue(HandParsersProgram.makeParserId(parentCue + UnknownParsersProgram._subparticleSuffix))
    }
  }
  _getCueMaps(clone) {
    const cuesToChildCues = {}
    const cuesToParticleInstances = {}
    for (let particle of clone.getTopDownArrayIterator()) {
      const cue = particle.cue
      if (!cuesToChildCues[cue]) cuesToChildCues[cue] = {}
      if (!cuesToParticleInstances[cue]) cuesToParticleInstances[cue] = []
      cuesToParticleInstances[cue].push(particle)
      particle.forEach(subparticle => (cuesToChildCues[cue][subparticle.cue] = true))
    }
    return { cuesToChildCues, cuesToParticleInstances }
  }
  _inferParserDef(cue, globalAtomTypeMap, subparticleCues, instances) {
    const edgeSymbol = this.edgeSymbol
    const parserId = HandParsersProgram.makeParserId(cue)
    const particleDefParticle = new Particle(parserId).particleAt(0)
    const subparticleParserIds = subparticleCues.map(atom => HandParsersProgram.makeParserId(atom))
    if (subparticleParserIds.length) particleDefParticle.touchParticle(ParsersConstants.inScope).setAtomsFrom(1, subparticleParserIds)
    const atomsForAllInstances = instances
      .map(line => line.content)
      .filter(identity => identity)
      .map(line => line.split(edgeSymbol))
    const instanceAtomCounts = new Set(atomsForAllInstances.map(atoms => atoms.length))
    const maxAtomsOnLine = Math.max(...Array.from(instanceAtomCounts))
    const minAtomsOnLine = Math.min(...Array.from(instanceAtomCounts))
    let catchAllAtomType
    let atomTypeIds = []
    for (let atomIndex = 0; atomIndex < maxAtomsOnLine; atomIndex++) {
      const atomType = this._getBestAtomType(
        cue,
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
    const needsCueProperty = !cue.endsWith(UnknownParsersProgram._subparticleSuffix + ParsersConstants.parserSuffix) // todo: cleanup
    if (needsCueProperty) particleDefParticle.set(ParsersConstants.cue, cue)
    if (catchAllAtomType) particleDefParticle.set(ParsersConstants.catchAllAtomType, catchAllAtomType)
    const atomLine = atomTypeIds.slice()
    atomLine.unshift(PreludeAtomTypeIds.cueAtom)
    if (atomLine.length > 0) particleDefParticle.set(ParsersConstants.atoms, atomLine.join(edgeSymbol))
    //if (!catchAllAtomType && atomTypeIds.length === 1) particleDefParticle.set(ParsersConstants.atoms, atomTypeIds[0])
    // Todo: add conditional frequencies
    return particleDefParticle.parent.toString()
  }
  inferParsersFileForACueLanguage(parsersName) {
    const clone = this.clone()
    this._renameIntegerCues(clone)
    const { cuesToChildCues, cuesToParticleInstances } = this._getCueMaps(clone)
    const globalAtomTypeMap = new Map()
    globalAtomTypeMap.set(PreludeAtomTypeIds.cueAtom, undefined)
    const parserDefs = Object.keys(cuesToChildCues)
      .filter(identity => identity)
      .map(cue => this._inferParserDef(cue, globalAtomTypeMap, Object.keys(cuesToChildCues[cue]), cuesToParticleInstances[cue]))
    const atomTypeDefs = []
    globalAtomTypeMap.forEach((def, id) => atomTypeDefs.push(def ? def : id))
    const particleBreakSymbol = this.particleBreakSymbol
    return this._formatCode([this._inferRootParticleForAPrefixLanguage(parsersName).toString(), atomTypeDefs.join(particleBreakSymbol), parserDefs.join(particleBreakSymbol)].filter(identity => identity).join("\n"))
  }
  _formatCode(code) {
    // todo: make this run in browser too
    if (!this.isNodeJs()) return code
    const parsersProgram = new HandParsersProgram(Particle.fromDisk(__dirname + "/../langs/parsers/parsers.parsers"))
    const rootParser = parsersProgram.compileAndReturnRootParser()
    const program = new rootParser(code)
    return program.format().toString()
  }
  _getBestAtomType(cue, instanceCount, maxAtomsOnLine, allValues) {
    const asSet = new Set(allValues)
    const edgeSymbol = this.edgeSymbol
    const values = Array.from(asSet).filter(identity => identity)
    const every = fn => {
      for (let index = 0; index < values.length; index++) {
        if (!fn(values[index])) return false
      }
      return true
    }
    if (every(str => str === "0" || str === "1")) return { atomTypeId: PreludeAtomTypeIds.bitAtom }
    if (
      every(str => {
        const num = parseInt(str)
        if (isNaN(num)) return false
        return num.toString() === str
      })
    ) {
      return { atomTypeId: PreludeAtomTypeIds.integerAtom }
    }
    if (every(str => str.match(/^-?\d*.?\d+$/))) return { atomTypeId: PreludeAtomTypeIds.floatAtom }
    const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"])
    if (every(str => bools.has(str.toLowerCase()))) return { atomTypeId: PreludeAtomTypeIds.booleanAtom }
    // todo: cleanup
    const enumLimit = 30
    if (instanceCount > 1 && maxAtomsOnLine === 1 && allValues.length > asSet.size && asSet.size < enumLimit)
      return {
        atomTypeId: HandParsersProgram.makeAtomTypeId(cue),
        atomTypeDefinition: `${HandParsersProgram.makeAtomTypeId(cue)}
 enum ${values.join(edgeSymbol)}`
      }
    return { atomTypeId: PreludeAtomTypeIds.anyAtom }
  }
}
UnknownParsersProgram._subparticleSuffix = "Subparticle"
window.ParsersConstants = ParsersConstants
window.PreludeAtomTypeIds = PreludeAtomTypeIds
window.HandParsersProgram = HandParsersProgram
window.ParserBackedParticle = ParserBackedParticle
window.UnknownParserError = UnknownParserError
window.UnknownParsersProgram = UnknownParsersProgram
