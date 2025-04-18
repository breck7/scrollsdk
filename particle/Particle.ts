import { AbstractParticle } from "./AbstractParticle.particle"
import { particlesTypes } from "../products/particlesTypes"

const { Utils } = require("../products/Utils.js")
const { Readable } = require("stream")

declare type int = particlesTypes.int
declare type atom = particlesTypes.atom

declare type atomFn = (str: string, rowIndex: int, colIndex: int) => any
declare type mapFn = (value: any, index: int, array: any[]) => any

enum FileFormat {
  csv = "csv",
  tsv = "tsv",
  particles = "particles"
}

const ATOM_MEMBRANE = " " // The symbol that separates atoms (words)
const PARTICLE_MEMBRANE = "\n" // The symbol that separates particles (lines)
const SUBPARTICLE_MEMBRANE = " " // The symbol, in combination with PARTICLE_MEMBRANE, that makes subparticles

declare type removeAfterRunning = boolean

declare type ParticleEventHandler = (event: AbstractParticleEvent) => removeAfterRunning

abstract class AbstractParticleEvent {
  public targetParticle: Particle
  constructor(targetParticle: Particle) {
    this.targetParticle = targetParticle
  }
}

function splitBlocks(str: string, edgeSymbol: string, particleBreakSymbol: string) {
  const regex = new RegExp(`\\${particleBreakSymbol}(?!\\${edgeSymbol})`, "g")
  return str.split(regex)
}

function _getIndentCount(str: string, edgeSymbol: string) {
  let level = 0
  const edgeChar = edgeSymbol
  while (str[level] === edgeChar) {
    level++
  }
  return level
}

class ChildAddedParticleEvent extends AbstractParticleEvent {}
class ChildRemovedParticleEvent extends AbstractParticleEvent {}
class DescendantChangedParticleEvent extends AbstractParticleEvent {}
class LineChangedParticleEvent extends AbstractParticleEvent {}

class ParticleAtom {
  private _particle: Particle
  private _atomIndex: number
  constructor(particle: Particle, atomIndex: number) {
    this._particle = particle
    this._atomIndex = atomIndex
  }
  replace(newAtom: string) {
    this._particle.setAtom(this._atomIndex, newAtom)
  }
  get atom() {
    return this._particle.getAtom(this._atomIndex)
  }
}

const ParticleEvents = { ChildAddedParticleEvent, ChildRemovedParticleEvent, DescendantChangedParticleEvent, LineChangedParticleEvent }

enum WhereOperators {
  equal = "=",
  notEqual = "!=",
  lessThan = "<",
  lessThanOrEqual = "<=",
  greaterThan = ">",
  greaterThanOrEqual = ">=",
  includes = "includes",
  doesNotInclude = "doesNotInclude",
  in = "in",
  notIn = "notIn",
  empty = "empty",
  notEmpty = "notEmpty"
}

enum ParticlesConstants {
  extends = "extends"
}

class ParserPool {
  // todo: should getErrors be under here? At least for certain types of errors?
  private _catchAllParser: particlesTypes.ParticleParser
  private _cueMap: Map<string, Function>
  private _regexTests: particlesTypes.regexTest[]
  constructor(catchAllParser: particlesTypes.ParticleParser, cueMap: particlesTypes.cueToParserMap = {}, regexTests: particlesTypes.regexTest[] = undefined) {
    this._catchAllParser = catchAllParser
    this._cueMap = new Map(Object.entries(cueMap))
    this._regexTests = regexTests
  }

  getCueOptions() {
    return Array.from(this._getCueMap().keys())
  }

  // todo: remove
  private _getCueMap() {
    return this._cueMap
  }

  // todo: remove
  _getCueMapAsObject() {
    let obj: particlesTypes.cueToParserMap = {}
    const map = this._getCueMap()
    for (let [key, val] of map.entries()) {
      obj[key] = val
    }
    return obj
  }

  _getMatchingParser(block: string, parentParticle: particlesTypes.particle, lineNumber: number, atomBreakSymbol = ATOM_MEMBRANE): particlesTypes.ParticleParser {
    return this._getCueMap().get(this._getCue(block, atomBreakSymbol)) || this._getParserFromRegexTests(block) || this._getCatchAllParser(parentParticle)
  }

  _getCatchAllParser(contextParticle: particlesTypes.particle) {
    if (this._catchAllParser) return this._catchAllParser

    const parent = contextParticle.parent

    if (parent) return parent._getParserPool()._getCatchAllParser(parent)

    return contextParticle.constructor
  }

  private _getParserFromRegexTests(block: string): particlesTypes.ParticleParser {
    if (!this._regexTests) return undefined
    const line = block.split(/\n/)[0]
    const hit = this._regexTests.find(test => test.regex.test(line))
    if (hit) return hit.parser
    return undefined
  }

  private _getCue(block: string, atomBreakSymbol: string) {
    const line = block.split(/\n/)[0]
    const firstBreak = line.indexOf(atomBreakSymbol)
    return line.substr(0, firstBreak > -1 ? firstBreak : undefined)
  }

  async appendParticleAsync(parentParticle: particlesTypes.particle, block: string): particlesTypes.particle {
    const index = parentParticle.length
    const parser: any = this._getMatchingParser(block, parentParticle, index)
    const { particleBreakSymbol } = parentParticle
    const lines = block.split(particleBreakSymbol)
    const subparticles = lines
      .slice(1)
      .map(line => line.substr(1))
      .join(particleBreakSymbol)
    const particle = new parser(undefined, lines[0], parentParticle, index)
    if (subparticles.length) await particle.appendFromStream(subparticles)
    await particle.wake()
    return particle
  }

  createParticle(parentParticle: particlesTypes.particle, block: string, index?: number): particlesTypes.particle {
    const rootParticle = parentParticle.root
    if (rootParticle.particleTransformers) {
      // A macro may return multiple new blocks.
      const blocks = splitBlocks(rootParticle._transformBlock(block), SUBPARTICLE_MEMBRANE, PARTICLE_MEMBRANE)
      const newParticles = blocks.map((block, newBlockIndex) => this._createParticle(parentParticle, block, index === undefined ? undefined : index + newBlockIndex))
      return newParticles[0]
    } else return this._createParticle(parentParticle, block, index)
  }

  _createParticle(parentParticle: particlesTypes.particle, block: string, index?: number): particlesTypes.particle {
    index = index === undefined ? parentParticle.length : index
    const parser: any = this._getMatchingParser(block, parentParticle, index)
    const { particleBreakSymbol } = parentParticle
    const lines = block.split(particleBreakSymbol)
    const subparticles = lines
      .slice(1)
      .map(line => line.substr(1))
      .join(particleBreakSymbol)
    return new parser(subparticles, lines[0], parentParticle, index)
  }
}

class Particle extends AbstractParticle {
  constructor(subparticles?: particlesTypes.subparticles, line?: string, parent?: Particle, index?: number) {
    super()
    this._parent = parent
    this._setLine(line)
    this._setSubparticles(subparticles)
    if (index !== undefined) parent._getSubparticlesArray().splice(index, 0, this)
    else if (parent) parent._getSubparticlesArray().push(this)
  }

  private _uid: int
  private _atoms: string[]
  private _parent: Particle | undefined
  private _subparticles: Particle[]
  private _line: string
  private _cueIndex: {
    [cue: string]: int
  }

  wake() {}

  execute() {}

  // If you want to link a particle to a file on the filesystem.
  setFile(file: File) {
    this.file = file
  }

  // Store all parsing state in the document, not the parser pool.
  particleTransformers?: particlesTypes.particleTransformer[]

  // todo: perhaps if needed in the future we can add more contextual params here
  _transformBlock(block: string) {
    this.particleTransformers.forEach(fn => {
      block = fn(block)
    })
    return block
  }

  addTransformer(fn: particlesTypes.particleTransformer) {
    if (!this.particleTransformers) this.particleTransformers = []
    this.particleTransformers.push(fn)
    return this
  }

  async loadRequirements(context: any) {
    // todo: remove
    await Promise.all(this.map(particle => particle.loadRequirements(context)))
  }

  getErrors(): particlesTypes.ParticleError[] {
    return []
  }

  get lineAtomTypes() {
    // todo: make this any a constant
    return "undefinedAtomType ".repeat(this.atoms.length).trim()
  }

  isNodeJs() {
    return typeof exports !== "undefined"
  }

  isBrowser() {
    return !this.isNodeJs()
  }

  getOlderSiblings() {
    if (this.isRoot()) return []
    return this.parent.slice(0, this.index)
  }

  protected _getClosestOlderSibling(): Particle | undefined {
    const olderSiblings = this.getOlderSiblings()
    return olderSiblings[olderSiblings.length - 1]
  }

  getYoungerSiblings() {
    if (this.isRoot()) return []
    return this.parent.slice(this.index + 1)
  }

  getSiblings() {
    if (this.isRoot()) return []
    return this.parent.filter(particle => particle !== this)
  }

  protected _getUid() {
    if (!this._uid) this._uid = Particle._makeUniqueId()
    return this._uid
  }

  // todo: rename getMother? grandMother et cetera?
  get parent() {
    return this._parent
  }

  getIndentLevel(relativeTo?: Particle) {
    return this._getIndentLevel(relativeTo)
  }

  get indentation() {
    const indentLevel = this._getIndentLevel() - 1
    if (indentLevel < 0) return ""
    return this.edgeSymbol.repeat(indentLevel)
  }

  protected _getTopDownArray<Parser = Particle>(arr: Parser[]) {
    this.forEach(subparticle => {
      arr.push(subparticle)
      subparticle._getTopDownArray(arr)
    })
  }

  get topDownArray(): Particle[] {
    const arr: Particle[] = []
    this._getTopDownArray(arr)
    return arr
  }

  *getTopDownArrayIterator(): IterableIterator<Particle> {
    for (let subparticle of this.getSubparticles()) {
      yield subparticle
      yield* subparticle.getTopDownArrayIterator()
    }
  }

  particleAtLine(lineNumber: particlesTypes.positiveInt): Particle | undefined {
    let index = 0
    for (let particle of this.getTopDownArrayIterator()) {
      if (lineNumber === index) return particle
      index++
    }
  }

  get numberOfLines(): int {
    let lineCount = 0
    for (let particle of this.getTopDownArrayIterator()) {
      lineCount++
    }
    return lineCount
  }

  private _getMaxUnitsOnALine() {
    let max = 0
    for (let particle of this.getTopDownArrayIterator()) {
      const count = particle.atoms.length + particle.getIndentLevel()
      if (count > max) max = count
    }
    return max
  }

  get numberOfAtoms(): int {
    let atomCount = 0
    for (let particle of this.getTopDownArrayIterator()) {
      atomCount += particle.atoms.length
    }
    return atomCount
  }

  get lineNumber(): int {
    return this._getLineNumberRelativeTo()
  }

  protected _cachedLineNumber: int
  _getLineNumber(target: Particle = this) {
    if (this._cachedLineNumber) return this._cachedLineNumber
    let lineNumber = 1
    for (let particle of this.root.getTopDownArrayIterator()) {
      if (particle === target) return lineNumber
      lineNumber++
    }
    return lineNumber
  }

  isBlankLine(): boolean {
    return !this.length && !this.getLine()
  }

  get isBlank() {
    return this.isBlankLine()
  }

  hasDuplicateCues(): boolean {
    return this.length ? new Set(this.getCues()).size !== this.length : false
  }

  isEmpty(): boolean {
    return !this.length && !this.content
  }

  protected _getLineNumberRelativeTo(relativeTo?: Particle) {
    if (this.isRoot(relativeTo)) return 0
    const start = relativeTo || this.root
    return start._getLineNumber(this)
  }

  isRoot(relativeTo?: Particle): boolean {
    return relativeTo === this || !this.parent
  }

  get root() {
    return this._getRootParticle()
  }

  protected _getRootParticle(relativeTo?: Particle): Particle | this {
    if (this.isRoot(relativeTo)) return this
    return this.parent._getRootParticle(relativeTo)
  }

  toString(indentCount = 0, language = this): string {
    if (this.isRoot()) return this._subparticlesToString(indentCount, language)
    return this._toStringWithLine(indentCount, language)
  }

  _toStringWithLine(indentCount = 0, language = this): string {
    return language.edgeSymbol.repeat(indentCount) + this.getLine(language) + (this.length ? language.particleBreakSymbol + this._subparticlesToString(indentCount + 1, language) : "")
  }

  get asString() {
    return this.toString()
  }

  printLinesFrom(start: particlesTypes.int, quantity: particlesTypes.int) {
    return this._printLinesFrom(start, quantity, false)
  }

  printLinesWithLineNumbersFrom(start: particlesTypes.int, quantity: particlesTypes.int) {
    return this._printLinesFrom(start, quantity, true)
  }

  private _printLinesFrom(start: particlesTypes.int, quantity: particlesTypes.int, printLineNumbers: boolean) {
    // todo: use iterator for better perf?
    const end = start + quantity
    this.toString()
      .split("\n")
      .slice(start, end)
      .forEach((line, index) => {
        if (printLineNumbers) console.log(`${start + index} ${line}`)
        else console.log(line)
      })
    return this
  }

  getAtom(index: int): atom {
    const atoms = this._getAtoms(0)
    if (index < 0) index = atoms.length + index
    return atoms[index]
  }

  get list() {
    return this.getAtomsFrom(1)
  }

  protected _toHtml(indentCount: int) {
    const path = this.getPathVector().join(" ")
    const classes = {
      particleLine: "particleLine",
      edgeSymbol: "edgeSymbol",
      particleBreakSymbol: "particleBreakSymbol",
      particleSubparticles: "particleSubparticles"
    }
    const edge = this.edgeSymbol.repeat(indentCount)
    // Set up the cue part of the particle
    const edgeHtml = `<span class="${classes.particleLine}" data-pathVector="${path}"><span class="${classes.edgeSymbol}">${edge}</span>`
    const lineHtml = this._getLineHtml()
    const subparticlesHtml = this.length ? `<span class="${classes.particleBreakSymbol}">${this.particleBreakSymbol}</span>` + `<span class="${classes.particleSubparticles}">${this._subparticlesToHtml(indentCount + 1)}</span>` : ""

    return `${edgeHtml}${lineHtml}${subparticlesHtml}</span>`
  }

  protected _getAtoms(startFrom: int) {
    if (!this._atoms) this._atoms = this._getLine().split(this.atomBreakSymbol)
    return startFrom ? this._atoms.slice(startFrom) : this._atoms
  }

  get atoms(): atom[] {
    return this._getAtoms(0)
  }

  doesExtend(parserId: particlesTypes.parserId) {
    return false
  }

  require(moduleName: string, filePath?: string): any {
    if (!this.isNodeJs()) return (<any>window)[moduleName]
    return require(filePath || moduleName)
  }

  getAtomsFrom(startFrom: int) {
    return this._getAtoms(startFrom)
  }

  getFirstAncestor(): Particle {
    const parent = this.parent
    return parent.isRoot() ? this : parent.getFirstAncestor()
  }

  isLoaded() {
    return true
  }

  private _runTimePhaseErrors: { [phase: string]: any }

  getRunTimePhaseErrors() {
    if (!this._runTimePhaseErrors) this._runTimePhaseErrors = {}
    return this._runTimePhaseErrors
  }

  setRunTimePhaseError(phase: string, errorObject: any) {
    if (errorObject === undefined) delete this.getRunTimePhaseErrors()[phase]
    else this.getRunTimePhaseErrors()[phase] = errorObject
    return this
  }

  _getJavascriptPrototypeChainUpTo(stopAtClassName = "Particle") {
    // todo: cross browser test this
    let constructor: any = this.constructor
    const chain: string[] = []
    while (constructor.name !== stopAtClassName) {
      chain.unshift(constructor.name)
      constructor = constructor.__proto__
    }
    chain.unshift(stopAtClassName)
    return chain
  }

  _getProjectRootDir(): string {
    return this.isRoot() ? "" : this.root._getProjectRootDir()
  }

  // Concat 2 particles amd return a new particle, but replace any particles
  // in this particle that start with the same particle from the first particle with
  // that patched version. Does not recurse.
  patch(two: Particle) {
    const copy = this.clone()
    two.forEach(particle => {
      const hit = copy.getParticle(particle.getAtom(0))
      if (hit) hit.destroy()
    })
    copy.concat(two)
    return copy
  }

  getSparsity() {
    const particles = this.getSubparticles()
    const fields = this._getUnionNames()
    let count = 0
    this.getSubparticles().forEach(particle => {
      fields.forEach(field => {
        if (particle.has(field)) count++
      })
    })

    return 1 - count / (particles.length * fields.length)
  }

  // todo: rename. what is the proper term from set/cat theory?
  getBiDirectionalMaps(propertyNameOrFn: mapFn | string, propertyNameOrFn2: mapFn | string = particle => particle.getAtom(0)) {
    const oneToTwo: { [key: string]: string[] } = {}
    const twoToOne: { [key: string]: string[] } = {}
    const is1Str = typeof propertyNameOrFn === "string"
    const is2Str = typeof propertyNameOrFn2 === "string"
    const subparticles = this.getSubparticles()
    this.forEach((particle, index) => {
      const value1 = is1Str ? particle.get(propertyNameOrFn) : (<mapFn>propertyNameOrFn)(particle, index, subparticles)
      const value2 = is2Str ? particle.get(propertyNameOrFn2) : (<mapFn>propertyNameOrFn2)(particle, index, subparticles)
      if (value1 !== undefined) {
        if (!oneToTwo[value1]) oneToTwo[value1] = []
        oneToTwo[value1].push(value2)
      }
      if (value2 !== undefined) {
        if (!twoToOne[value2]) twoToOne[value2] = []
        twoToOne[value2].push(value1)
      }
    })
    return [oneToTwo, twoToOne]
  }

  private _getAtomIndexCharacterStartPosition(atomIndex: int): particlesTypes.positiveInt {
    const xiLength = this.edgeSymbol.length
    const numIndents = this._getIndentLevel() - 1
    const indentPosition = xiLength * numIndents
    if (atomIndex < 1) return xiLength * (numIndents + atomIndex)
    return indentPosition + this.atoms.slice(0, atomIndex).join(this.atomBreakSymbol).length + this.atomBreakSymbol.length
  }

  getParticleInScopeAtCharIndex(charIndex: particlesTypes.positiveInt) {
    if (this.isRoot()) return this
    let atomIndex = this.getAtomIndexAtCharacterIndex(charIndex)
    if (atomIndex > 0) return this
    let particle: Particle = this
    while (atomIndex < 1) {
      particle = particle.parent
      atomIndex++
    }
    return particle
  }

  getAtomProperties(atomIndex: int) {
    const start = this._getAtomIndexCharacterStartPosition(atomIndex)
    const atom = atomIndex < 0 ? "" : this.getAtom(atomIndex)
    return {
      startCharIndex: start,
      endCharIndex: start + atom.length,
      atom: atom
    }
  }

  fill(fill = "") {
    this.topDownArray.forEach(line => {
      line.atoms.forEach((atom, index) => line.setAtom(index, fill))
    })
    return this
  }

  getAllAtomBoundaryCoordinates() {
    const coordinates: particlesTypes.atomBoundary[] = []
    let lineIndex = 0
    for (let particle of this.getTopDownArrayIterator()) {
      ;(<Particle>particle).getAtomBoundaryCharIndices().forEach((charIndex, atomIndex) => {
        coordinates.push({
          lineIndex: lineIndex,
          charIndex: charIndex,
          atomIndex: atomIndex
        })
      })

      lineIndex++
    }
    return coordinates
  }

  getAtomBoundaryCharIndices(): particlesTypes.positiveInt[] {
    let indentLevel = this._getIndentLevel()
    const atomBreakSymbolLength = this.atomBreakSymbol.length
    let elapsed = indentLevel
    return this.atoms.map((atom, atomIndex) => {
      const boundary = elapsed
      elapsed += atom.length + atomBreakSymbolLength
      return boundary
    })
  }

  getAtomIndexAtCharacterIndex(charIndex: particlesTypes.positiveInt): int {
    // todo: is this correct thinking for handling root?
    if (this.isRoot()) return 0
    const numberOfIndents = this._getIndentLevel(undefined) - 1
    // todo: probably want to rewrite this in a performant way.
    const spots = []
    while (spots.length < numberOfIndents) {
      spots.push(-(numberOfIndents - spots.length))
    }
    this.atoms.forEach((atom, atomIndex) => {
      atom.split("").forEach(letter => {
        spots.push(atomIndex)
      })
      spots.push(atomIndex)
    })

    return spots[charIndex]
  }

  // Note: This currently does not return any errors resulting from "required" or "single"
  getAllErrors(lineStartsAt = 1): particlesTypes.ParticleError[] {
    const errors: particlesTypes.ParticleError[] = []
    for (let particle of this.topDownArray) {
      particle._cachedLineNumber = lineStartsAt // todo: cleanup
      const errs: particlesTypes.ParticleError[] = particle.getErrors()
      errs.forEach(err => errors.push(err))
      // delete particle._cachedLineNumber
      lineStartsAt++
    }
    return errors
  }

  *getAllErrorsIterator() {
    let line = 1
    for (let particle of this.getTopDownArrayIterator()) {
      particle._cachedLineNumber = line
      const errs = particle.getErrors()
      // delete particle._cachedLineNumber
      if (errs.length) yield errs
      line++
    }
  }

  get cue(): atom {
    return this.atoms[0]
  }

  set cue(atom: atom) {
    this.setAtom(0, atom)
  }

  get content(): string {
    const atoms = this.getAtomsFrom(1)
    return atoms.length ? atoms.join(this.atomBreakSymbol) : undefined
  }

  get contentWithSubparticles(): string {
    // todo: deprecate
    const content = this.content
    return (content ? content : "") + (this.length ? this.particleBreakSymbol + this._subparticlesToString() : "")
  }

  getFirstParticle(): Particle {
    return this.particleAt(0)
  }

  getStack() {
    return this._getStack()
  }

  protected _getStack(relativeTo?: Particle): Particle[] {
    if (this.isRoot(relativeTo)) return []
    const parent = this.parent
    if (parent.isRoot(relativeTo)) return [this]
    else return parent._getStack(relativeTo).concat([this])
  }

  getStackString(): string {
    return this._getStack()
      .map((particle, index) => this.edgeSymbol.repeat(index) + particle.getLine())
      .join(this.particleBreakSymbol)
  }

  getLine(language?: Particle) {
    if (!this._atoms && !language) return this._getLine() // todo: how does this interact with "language" param?
    return this.atoms.join((language || this).atomBreakSymbol)
  }

  getColumnNames(): atom[] {
    return this._getUnionNames()
  }

  getOneHot(column: string) {
    const clone = this.clone()
    const cols = Array.from(new Set(clone.getColumn(column)))
    clone.forEach(particle => {
      const val = particle.get(column)
      particle.delete(column)
      cols.forEach(col => {
        particle.set(column + "_" + col, val === col ? "1" : "0")
      })
    })
    return clone
  }

  // todo: return array? getPathArray?
  protected _getCuePath(relativeTo?: Particle): particlesTypes.cuePath {
    if (this.isRoot(relativeTo)) return ""
    else if (this.parent.isRoot(relativeTo)) return this.cue

    return this.parent._getCuePath(relativeTo) + this.edgeSymbol + this.cue
  }

  getCuePathRelativeTo(relativeTo?: Particle): particlesTypes.cuePath {
    return this._getCuePath(relativeTo)
  }

  getCuePath(): particlesTypes.cuePath {
    return this._getCuePath()
  }

  getPathVector(): particlesTypes.pathVector {
    return this._getPathVector()
  }

  getPathVectorRelativeTo(relativeTo?: Particle): particlesTypes.pathVector {
    return this._getPathVector(relativeTo)
  }

  protected _getPathVector(relativeTo?: Particle): particlesTypes.pathVector {
    if (this.isRoot(relativeTo)) return []
    const path = this.parent._getPathVector(relativeTo)
    path.push(this.index)
    return path
  }

  get index(): int {
    return this.parent._indexOfParticle(this)
  }

  isTerminal() {
    return !this.length
  }

  protected _getLineHtml() {
    return this.atoms.map((atom, index) => `<span class="atom${index}">${Utils.stripHtml(atom)}</span>`).join(`<span class="zIncrement">${this.atomBreakSymbol}</span>`)
  }

  protected _getXmlContent(indentCount: particlesTypes.positiveInt) {
    if (this.content !== undefined) return this.contentWithSubparticles
    return this.length ? `${indentCount === -1 ? "" : "\n"}${this._subparticlesToXml(indentCount > -1 ? indentCount + 2 : -1)}${" ".repeat(indentCount)}` : ""
  }

  protected _toXml(indentCount: particlesTypes.positiveInt) {
    const indent = " ".repeat(indentCount)
    const tag = this.cue
    return `${indent}<${tag}>${this._getXmlContent(indentCount)}</${tag}>${indentCount === -1 ? "" : "\n"}`
  }

  protected _toObjectTuple() {
    const content = this.content
    const length = this.length
    const hasSubparticlesNoContent = content === undefined && length
    const hasContentAndHasSubparticles = content !== undefined && length
    // If the particle has a content and a subparticle return it as a string, as
    // Javascript object values can't be both a leaf and a particle.
    const tupleValue = hasSubparticlesNoContent ? this.toObject() : hasContentAndHasSubparticles ? this.contentWithSubparticles : content
    return [this.cue, tupleValue]
  }

  protected _indexOfParticle(needleParticle: Particle) {
    let result = -1
    this.find((particle, index) => {
      if (particle === needleParticle) {
        result = index
        return true
      }
    })
    return result
  }

  getMaxLineWidth() {
    let maxWidth = 0
    for (let particle of this.getTopDownArrayIterator()) {
      const lineWidth = particle.getLine().length
      if (lineWidth > maxWidth) maxWidth = lineWidth
    }
    return maxWidth
  }

  toParticle() {
    return new Particle(this.toString())
  }

  protected _rightPad(newWidth: number, padCharacter: string) {
    const line = this.getLine()
    this.setLine(line + padCharacter.repeat(newWidth - line.length))
    return this
  }

  rightPad(padCharacter = " ") {
    const newWidth = this.getMaxLineWidth()
    this.topDownArray.forEach(particle => particle._rightPad(newWidth, padCharacter))
    return this
  }

  lengthen(numberOfLines: int) {
    let linesToAdd = numberOfLines - this.numberOfLines
    while (linesToAdd > 0) {
      this.appendLine("")
      linesToAdd--
    }
    return this
  }

  toSideBySide(particlesOrStrings: (Particle | string)[], delimiter = " ") {
    particlesOrStrings = <Particle[]>particlesOrStrings.map(particle => (particle instanceof Particle ? particle : new Particle(particle)))
    const clone = this.toParticle()
    const particleBreakSymbol = "\n"
    let next: any
    while ((next = particlesOrStrings.shift())) {
      clone.lengthen(next.numberOfLines)
      clone.rightPad()
      next
        .toString()
        .split(particleBreakSymbol)
        .forEach((line: string, index: number) => {
          const particle = clone.particleAtLine(index)
          particle.setLine(particle.getLine() + delimiter + line)
        })
    }
    return clone
  }

  toComparison(particle: Particle | string) {
    const particleBreakSymbol = "\n"
    const lines = particle.toString().split(particleBreakSymbol)
    return new Particle(
      this.toString()
        .split(particleBreakSymbol)
        .map((line, index) => (lines[index] === line ? "" : "x"))
        .join(particleBreakSymbol)
    )
  }

  toBraid(particlesOrStrings: (Particle | string)[]) {
    particlesOrStrings.unshift(this)
    const particleDelimiter = this.particleBreakSymbol
    return new Particle(
      Utils.interweave(particlesOrStrings.map(particle => particle.toString().split(particleDelimiter)))
        .map(line => (line === undefined ? "" : line))
        .join(particleDelimiter)
    )
  }

  getSlice(startIndexInclusive: int, stopIndexExclusive: int) {
    return new Particle(
      this.slice(startIndexInclusive, stopIndexExclusive)
        .map(subparticle => subparticle.toString())
        .join("\n")
    )
  }

  protected _hasColumns(columns: string[]) {
    const atoms = this.atoms
    return columns.every((searchTerm, index) => searchTerm === atoms[index])
  }

  hasAtom(index: int, atom: string): boolean {
    return this.getAtom(index) === atom
  }

  getParticleByColumns(...columns: string[]): Particle {
    return this.topDownArray.find(particle => particle._hasColumns(columns))
  }

  getParticleByColumn(index: int, name: string): Particle {
    return this.find(particle => particle.getAtom(index) === name)
  }

  protected _getParticlesByColumn(index: int, name: atom): Particle[] {
    return this.filter(particle => particle.getAtom(index) === name)
  }

  // todo: preserve subclasses!
  select(columnNames: string[] | string) {
    columnNames = Array.isArray(columnNames) ? columnNames : [columnNames]
    const result = new Particle()
    this.forEach(particle => {
      const newParticle = result.appendLine(particle.getLine())
      ;(<string[]>columnNames).forEach((name: string) => {
        const valueParticle = particle.getParticle(name)
        if (valueParticle) newParticle.appendParticle(valueParticle)
      })
    })
    return result
  }

  selectionToString() {
    return this.getSelectedParticles()
      .map(particle => particle.toString())
      .join("\n")
  }

  getSelectedParticles() {
    return this.topDownArray.filter(particle => particle.isSelected())
  }

  clearSelection() {
    this.getSelectedParticles().forEach(particle => particle.unselectParticle())
  }

  // Note: this is for debugging select chains
  print(message = "") {
    if (message) console.log(message)
    console.log(this.toString())
    return this
  }

  // todo: preserve subclasses!
  // todo: preserve links back to parent so you could edit as normal?
  where(columnName: string, operator: WhereOperators, fixedValue?: string | number | string[] | number[]) {
    const isArray = Array.isArray(fixedValue)
    const valueType = isArray ? typeof (<Array<string | number>>fixedValue)[0] : typeof fixedValue
    let parser: Function
    if (valueType === "number") parser = parseFloat
    const fn = (particle: Particle) => {
      const atom = particle.get(columnName)
      const typedAtom = parser ? parser(atom) : atom
      if (operator === WhereOperators.equal) return fixedValue === typedAtom
      else if (operator === WhereOperators.notEqual) return fixedValue !== typedAtom
      else if (operator === WhereOperators.includes) return typedAtom !== undefined && typedAtom.includes(fixedValue)
      else if (operator === WhereOperators.doesNotInclude) return typedAtom === undefined || !typedAtom.includes(fixedValue)
      else if (operator === WhereOperators.greaterThan) return typedAtom > fixedValue
      else if (operator === WhereOperators.lessThan) return typedAtom < fixedValue
      else if (operator === WhereOperators.greaterThanOrEqual) return typedAtom >= fixedValue
      else if (operator === WhereOperators.lessThanOrEqual) return typedAtom <= fixedValue
      else if (operator === WhereOperators.empty) return !particle.has(columnName)
      else if (operator === WhereOperators.notEmpty) return particle.has(columnName) || (atom !== "" && atom !== undefined)
      else if (operator === WhereOperators.in && isArray) return (<Array<string | number>>fixedValue).includes(typedAtom)
      else if (operator === WhereOperators.notIn && isArray) return !(<Array<string | number>>fixedValue).includes(typedAtom)
    }
    const result = new Particle()
    this.filter(fn).forEach(particle => {
      result.appendParticle(particle)
    })
    return result
  }

  with(cue: string) {
    return this.filter(particle => particle.has(cue))
  }

  without(cue: string) {
    return this.filter(particle => !particle.has(cue))
  }

  first(quantity = 1) {
    return this.limit(quantity, 0)
  }

  last(quantity = 1) {
    return this.limit(quantity, this.length - quantity)
  }

  // todo: preserve subclasses!
  limit(quantity: int, offset = 0): Particle {
    const result = new Particle()
    this.getSubparticles()
      .slice(offset, quantity + offset)
      .forEach(particle => {
        result.appendParticle(particle)
      })
    return result
  }

  getSubparticlesFirstArray() {
    const arr: Particle[] = []
    this._getSubparticlesFirstArray(arr)
    return arr
  }

  protected _getSubparticlesFirstArray(arr: Particle[]) {
    this.forEach(subparticle => {
      subparticle._getSubparticlesFirstArray(arr)
      arr.push(subparticle)
    })
  }

  protected _getIndentLevel(relativeTo?: Particle) {
    return this._getStack(relativeTo).length
  }

  getParentFirstArray() {
    const levels = this._getLevels()
    const arr: Particle[] = []
    Object.values(levels).forEach(level => {
      level.forEach(item => arr.push(item))
    })
    return arr
  }

  protected _getLevels(): { [level: number]: Particle[] } {
    const levels: { [level: number]: Particle[] } = {}
    this.topDownArray.forEach(particle => {
      const level = particle._getIndentLevel()
      if (!levels[level]) levels[level] = []
      levels[level].push(particle)
    })
    return levels
  }

  protected _getSubparticlesArray() {
    if (!this._subparticles) this._subparticles = []
    return this._subparticles
  }

  getLines(): string[] {
    return this.map(particle => particle.getLine())
  }

  getSubparticles(): any[] {
    return this._getSubparticlesArray().slice(0)
  }

  get length(): particlesTypes.positiveInt {
    return this._getSubparticlesArray().length
  }

  protected _particleAt(index: int) {
    if (index < 0) index = this.length + index
    return this._getSubparticlesArray()[index]
  }

  particleAt(indexOrIndexArray: int | int[]): Particle | undefined {
    if (typeof indexOrIndexArray === "number") return this._particleAt(indexOrIndexArray)

    if (indexOrIndexArray.length === 1) return this._particleAt(indexOrIndexArray[0])

    const first = indexOrIndexArray[0]
    const particle = this._particleAt(first)
    if (!particle) return undefined
    return particle.particleAt(indexOrIndexArray.slice(1))
  }

  // Flatten a particle into an object like {twitter:"pldb", "twitter.followers":123}.
  // Assumes you have a nested key/value list with no multiline strings.
  toFlatObject(delimiter = ".") {
    let newObject: particlesTypes.stringMap = {}
    const { edgeSymbolRegex } = this
    this.forEach((subparticle: Particle, index: number) => {
      newObject[subparticle.getAtom(0)] = subparticle.content
      subparticle.topDownArray.forEach((particle: Particle) => {
        const newColumnName = particle.getCuePathRelativeTo(this).replace(edgeSymbolRegex, delimiter)
        const value = particle.content
        newObject[newColumnName] = value
      })
    })
    return newObject
  }

  protected _toObject() {
    const obj: particlesTypes.stringMap = {}
    this.forEach(particle => {
      const tuple = particle._toObjectTuple()
      obj[tuple[0]] = tuple[1]
    })
    return obj
  }

  get asHtml(): particlesTypes.htmlString {
    return this._subparticlesToHtml(0)
  }

  protected _toHtmlCubeLine(indents = 0, lineIndex = 0, planeIndex = 0): particlesTypes.htmlString {
    const getLine = (atomIndex: number, atom = "") =>
      `<span class="htmlCubeSpan" style="top: calc(var(--topIncrement) * ${planeIndex} + var(--rowHeight) * ${lineIndex}); left:calc(var(--leftIncrement) * ${planeIndex} + var(--atomWidth) * ${atomIndex});">${atom.replace(/</g, "&lt;")}</span>`
    let atoms: string[] = []
    this.atoms.forEach((atom, index) => (atom ? atoms.push(getLine(index + indents, atom)) : ""))
    return atoms.join("")
  }

  get asHtmlCube(): particlesTypes.htmlString {
    return this.map((plane, planeIndex) => plane.topDownArray.map((line: any, lineIndex: number) => line._toHtmlCubeLine(line.getIndentLevel() - 2, lineIndex, planeIndex)).join("")).join("")
  }

  protected _getHtmlJoinByCharacter() {
    return `<span class="particleBreakSymbol">${this.particleBreakSymbol}</span>`
  }

  protected _subparticlesToHtml(indentCount: int) {
    const joinBy = this._getHtmlJoinByCharacter()
    return this.map(particle => particle._toHtml(indentCount)).join(joinBy)
  }

  protected _subparticlesToString(indentCount?: int, language = this) {
    return this.map(particle => particle.toString(indentCount, language)).join(language.particleBreakSymbol)
  }

  subparticlesToString(indentCount = 0): string {
    return this._subparticlesToString(indentCount)
  }

  get murmurHash(): string {
    const str = this.toString()
    let h1 = 0xdeadbeef
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ char, 0x5bd1e995)
    }
    return (h1 >>> 0).toString(16)
  }

  // todo: implement
  protected _getChildJoinCharacter() {
    return "\n"
  }

  format() {
    this.forEach(subparticle => subparticle.format())
    return this
  }

  compile(): string {
    return this.map(subparticle => subparticle.compile()).join(this._getChildJoinCharacter())
  }

  get asXml(): particlesTypes.xmlString {
    return this._subparticlesToXml(0)
  }

  toDisk(path: string) {
    if (!this.isNodeJs()) throw new Error("This method only works in Node.js")
    const format = Particle._getFileFormat(path)
    const formats = {
      particles: (particle: Particle) => particle.toString(),
      csv: (particle: Particle) => particle.asCsv,
      tsv: (particle: Particle) => particle.asTsv
    }
    this.require("fs").writeFileSync(path, <string>(<any>formats)[format](this), "utf8")
    return this
  }

  _lineToYaml(indentLevel: number, listTag = "") {
    let prefix = " ".repeat(indentLevel)
    if (listTag && indentLevel > 1) prefix = " ".repeat(indentLevel - 2) + listTag + " "
    return prefix + `${this.cue}:` + (this.content ? " " + this.content : "")
  }

  _isYamlList() {
    return this.hasDuplicateCues()
  }

  get asYaml() {
    return `%YAML 1.2
---\n${this._subparticlesToYaml(0).join("\n")}`
  }

  _subparticlesToYaml(indentLevel: number): string[] {
    if (this._isYamlList()) return this._subparticlesToYamlList(indentLevel)
    else return this._subparticlesToYamlAssociativeArray(indentLevel)
  }

  // if your code-to-be-yaml has a list of associative arrays of type N and you don't
  // want the type N to print
  _collapseYamlLine() {
    return false
  }

  _toYamlListElement(indentLevel: number) {
    const subparticles = this._subparticlesToYaml(indentLevel + 1)
    if (this._collapseYamlLine()) {
      if (indentLevel > 1) return subparticles.join("\n").replace(" ".repeat(indentLevel), " ".repeat(indentLevel - 2) + "- ")
      return subparticles.join("\n")
    } else {
      subparticles.unshift(this._lineToYaml(indentLevel, "-"))
      return subparticles.join("\n")
    }
  }

  _subparticlesToYamlList(indentLevel: number): string[] {
    return this.map(particle => particle._toYamlListElement(indentLevel + 2))
  }

  _toYamlAssociativeArrayElement(indentLevel: number) {
    const subparticles = this._subparticlesToYaml(indentLevel + 1)
    subparticles.unshift(this._lineToYaml(indentLevel))
    return subparticles.join("\n")
  }

  _subparticlesToYamlAssociativeArray(indentLevel: number): string[] {
    return this.map(particle => particle._toYamlAssociativeArrayElement(indentLevel))
  }

  get asJsonSubset(): particlesTypes.jsonSubset {
    return JSON.stringify(this.toObject(), null, " ")
  }

  private _toObjectForSerialization(): particlesTypes.SerializedParticle {
    return this.length
      ? {
          atoms: this.atoms,
          subparticles: this.map(subparticle => subparticle._toObjectForSerialization())
        }
      : {
          atoms: this.atoms
        }
  }

  get asSExpression(): string {
    return this._toSExpression()
  }

  protected _toSExpression(): string {
    const thisAtoms = this.atoms.join(" ")
    if (!this.length)
      // For leaf nodes, just return (cue content) or (cue) if no content
      return `(${thisAtoms})`

    // For nodes with children, recursively process each child
    const children = this.map(particle => particle._toSExpression()).join(" ")
    return thisAtoms ? `(${thisAtoms} ${children})` : `(${children})`
  }

  get asJson(): string {
    return JSON.stringify({ subparticles: this.map(subparticle => subparticle._toObjectForSerialization()) }, null, " ")
  }

  get asGrid() {
    const AtomBreakSymbol = this.atomBreakSymbol
    return this.toString()
      .split(this.particleBreakSymbol)
      .map(line => line.split(AtomBreakSymbol))
  }

  get asGridJson() {
    return JSON.stringify(this.asGrid, null, 2)
  }

  findParticles(cuePath: particlesTypes.cuePath | particlesTypes.cuePath[]): Particle[] {
    // todo: can easily speed this up
    const map: any = {}
    if (!Array.isArray(cuePath)) cuePath = [cuePath]
    cuePath.forEach(path => (map[path] = true))
    return this.topDownArray.filter(particle => {
      if (map[particle._getCuePath(this)]) return true
      return false
    })
  }

  evalTemplateString(str: particlesTypes.templateString): string {
    const that = this
    return str.replace(/{([^\}]+)}/g, (match, path) => that.get(path) || "")
  }

  emitLogMessage(message: string) {
    console.log(message)
  }

  getColumn(path: atom): string[] {
    return this.map(particle => particle.get(path))
  }

  getFiltered(fn: particlesTypes.filterFn) {
    const clone = this.clone()
    clone
      .filter((particle, index) => !fn(particle, index))
      .forEach(particle => {
        particle.destroy()
      })
    return clone
  }

  getParticle(cuePath: particlesTypes.cuePath) {
    return this._getParticleByPath(cuePath)
  }

  getParticles(cuePath: particlesTypes.cuePath) {
    return this.findParticles(cuePath)
  }

  get section() {
    // return all particles after this one to the next blank line or end of file
    const particles = []
    if (this.isLast) return particles
    let next = this.next
    while (!next.isBlank) {
      particles.push(next)
      next = next.next
      if (next.isFirst) break
    }
    return particles
  }

  get isLast() {
    return this.index === this.parent.length - 1
  }

  get isFirst() {
    return this.index === 0
  }

  getFrom(prefix: string) {
    const hit = this.filter(particle => particle.getLine().startsWith(prefix))[0]
    if (hit) return hit.getLine().substr((prefix + this.atomBreakSymbol).length)
  }

  get(cuePath: particlesTypes.cuePath) {
    const particle = this._getParticleByPath(cuePath)
    return particle === undefined ? undefined : particle.content
  }

  getOneOf(keys: string[]) {
    for (let i = 0; i < keys.length; i++) {
      const value = this.get(keys[i])
      if (value) return value
    }
    return ""
  }

  pick(fields: string[]) {
    const newParticle = new Particle(this.toString()) // todo: why not clone?
    const map = Utils.arrayToMap(fields)
    newParticle.particleAt(0).forEach((particle: particlesTypes.particle) => {
      if (!map[particle.getAtom(0)]) particle.destroy()
    })

    return newParticle
  }

  getParticlesByGlobPath(query: particlesTypes.globPath): Particle[] {
    return this._getParticlesByGlobPath(query)
  }

  private _getParticlesByGlobPath(globPath: particlesTypes.globPath): Particle[] {
    const edgeSymbol = this.edgeSymbol
    if (!globPath.includes(edgeSymbol)) {
      if (globPath === "*") return this.getSubparticles()
      return this.filter(particle => particle.cue === globPath)
    }

    const parts = globPath.split(edgeSymbol)
    const current = parts.shift()
    const rest = parts.join(edgeSymbol)
    const matchingParticles = current === "*" ? this.getSubparticles() : this.filter(subparticle => subparticle.cue === current)

    return [].concat.apply(
      [],
      matchingParticles.map(particle => particle._getParticlesByGlobPath(rest))
    )
  }

  protected _getParticleByPath(cuePath: particlesTypes.cuePath): Particle {
    const edgeSymbol = this.edgeSymbol
    if (!cuePath.includes(edgeSymbol)) {
      const index = this.indexOfLast(cuePath)
      return index === -1 ? undefined : this._particleAt(index)
    }

    const parts = cuePath.split(edgeSymbol)
    const current = parts.shift()
    const currentParticle = this._getSubparticlesArray()[this._getCueIndex()[current]]
    return currentParticle ? currentParticle._getParticleByPath(parts.join(edgeSymbol)) : undefined
  }

  get next(): Particle {
    if (this.isRoot()) return this
    const index = this.index
    const parent = this.parent
    const length = parent.length
    const next = index + 1
    return next === length ? parent._getSubparticlesArray()[0] : parent._getSubparticlesArray()[next]
  }

  get previous(): Particle {
    if (this.isRoot()) return this
    const index = this.index
    const parent = this.parent
    const length = parent.length
    const prev = index - 1
    return prev === -1 ? parent._getSubparticlesArray()[length - 1] : parent._getSubparticlesArray()[prev]
  }

  protected _getUnionNames() {
    if (!this.length) return []

    const obj: particlesTypes.stringMap = {}
    this.forEach((particle: Particle) => {
      if (!particle.length) return undefined
      particle.forEach(particle => {
        obj[particle.cue] = 1
      })
    })
    return Object.keys(obj)
  }

  getAncestorParticlesByInheritanceViaExtendsCue(key: atom): Particle[] {
    const ancestorParticles = this._getAncestorParticles(
      (particle, id) => particle._getParticlesByColumn(0, id),
      particle => particle.get(key),
      this
    )
    ancestorParticles.push(this)
    return ancestorParticles
  }

  // Note: as you can probably tell by the name of this method, I don't recommend using this as it will likely be replaced by something better.
  getAncestorParticlesByInheritanceViaColumnIndices(thisColumnNumber: int, extendsColumnNumber: int): Particle[] {
    const ancestorParticles = this._getAncestorParticles(
      (particle, id) => particle._getParticlesByColumn(thisColumnNumber, id),
      particle => particle.getAtom(extendsColumnNumber),
      this
    )
    ancestorParticles.push(this)
    return ancestorParticles
  }

  protected _getAncestorParticles(getPotentialParentParticlesByIdFn: (thisParentParticle: Particle, id: atom) => Particle[], getParentIdFn: (thisParticle: Particle) => atom, cannotContainParticle: Particle): Particle[] {
    const parentId = getParentIdFn(this)
    if (!parentId) return []

    const potentialParentParticles = getPotentialParentParticlesByIdFn(this.parent, parentId)
    if (!potentialParentParticles.length) throw new Error(`"${this.getLine()} tried to extend "${parentId}" but "${parentId}" not found.`)

    if (potentialParentParticles.length > 1) throw new Error(`Invalid inheritance paths. Multiple unique ids found for "${parentId}"`)

    const parentParticle = potentialParentParticles[0]

    // todo: detect loops
    if (parentParticle === cannotContainParticle) throw new Error(`Loop detected between '${this.getLine()}' and '${parentParticle.getLine()}'`)

    const ancestorParticles = parentParticle._getAncestorParticles(getPotentialParentParticlesByIdFn, getParentIdFn, cannotContainParticle)
    ancestorParticles.push(parentParticle)
    return ancestorParticles
  }

  pathVectorToCuePath(pathVector: particlesTypes.pathVector): atom[] {
    const path = pathVector.slice() // copy array
    const names = []
    let particle: Particle = this
    while (path.length) {
      if (!particle) return names
      names.push(particle.particleAt(path[0]).cue)
      particle = particle.particleAt(path.shift())
    }
    return names
  }

  toStringWithLineNumbers() {
    return this.toString()
      .split("\n")
      .map((line, index) => `${index + 1} ${line}`)
      .join("\n")
  }

  get asCsv(): string {
    return this.toDelimited(",")
  }

  protected _getTypes(header: string[]) {
    const matrix = this._getMatrix(header)
    const types = header.map(i => "int")
    matrix.forEach(row => {
      row.forEach((value, index) => {
        const type = types[index]
        if (type === "string") return 1
        if (value === undefined || value === "") return 1
        if (type === "float") {
          if (value.match(/^\-?[0-9]*\.?[0-9]*$/)) return 1
          types[index] = "string"
        }
        if (value.match(/^\-?[0-9]+$/)) return 1
        types[index] = "string"
      })
    })
    return types
  }

  toDataTable(header = this._getUnionNames()): particlesTypes.dataTable {
    const types = this._getTypes(header)
    const parsers: { [parseName: string]: (str: string) => any } = {
      string: str => str,
      float: parseFloat,
      int: parseInt
    }
    const atomFn: atomFn = (atomValue, rowIndex, columnIndex) => (rowIndex ? parsers[types[columnIndex]](atomValue) : atomValue)
    const arrays = this._toArrays(header, atomFn)
    arrays.rows.unshift(arrays.header)
    return arrays.rows
  }

  toDelimited(delimiter: particlesTypes.delimiter, header = this._getUnionNames(), escapeSpecialChars = true) {
    const regex = new RegExp(`(\\n|\\"|\\${delimiter})`)
    const atomFn: atomFn = (str, row, column) => (!str.toString().match(regex) ? str : `"` + str.replace(/\"/g, `""`) + `"`)
    return this._toDelimited(delimiter, header, escapeSpecialChars ? atomFn : str => str)
  }

  protected _getMatrix(columns: string[]) {
    const matrix: string[][] = []
    this.forEach(subparticle => {
      const row: string[] = []
      columns.forEach(col => {
        row.push(subparticle.get(col))
      })
      matrix.push(row)
    })
    return matrix
  }

  protected _toArrays(columnNames: string[], atomFn: atomFn) {
    const skipHeaderRow = 1
    const header = columnNames.map((columnName, index) => atomFn(columnName, 0, index))
    const rows = this.map((particle, rowNumber) =>
      columnNames.map((columnName, columnIndex) => {
        const subparticleParticle = particle.getParticle(columnName)
        const content = subparticleParticle ? subparticleParticle.contentWithSubparticles : ""
        return atomFn(content, rowNumber + skipHeaderRow, columnIndex)
      })
    )
    return {
      rows,
      header
    }
  }

  _toDelimited(delimiter: particlesTypes.delimiter, header: string[], atomFn: atomFn) {
    const data = this._toArrays(header, atomFn)
    return data.header.join(delimiter) + "\n" + data.rows.map(row => row.join(delimiter)).join("\n")
  }

  get asTable(): string {
    // Output a table for printing
    return this._toTable(100, false)
  }

  toFormattedTable(maxCharactersPerColumn: number, alignRight = false): string {
    return this._toTable(maxCharactersPerColumn, alignRight)
  }

  protected _toTable(maxCharactersPerColumn: number, alignRight = false) {
    const header = this._getUnionNames()
    // Set initial column widths
    const widths = header.map(col => (col.length > maxCharactersPerColumn ? maxCharactersPerColumn : col.length))

    // Expand column widths if needed
    this.forEach(particle => {
      if (!particle.length) return true
      header.forEach((col, index) => {
        const atomValue = particle.get(col)
        if (!atomValue) return true
        const length = atomValue.toString().length
        if (length > widths[index]) widths[index] = length > maxCharactersPerColumn ? maxCharactersPerColumn : length
      })
    })

    const atomFn = (atomText: string, row: particlesTypes.positiveInt, col: particlesTypes.positiveInt) => {
      const width = widths[col]
      // Strip newlines in fixedWidth output
      const atomValue = atomText.toString().replace(/\n/g, "\\n")
      const atomLength = atomValue.length
      if (atomLength > width) return atomValue.substr(0, width) + "..."

      const padding = " ".repeat(width - atomLength)
      return alignRight ? padding + atomValue : atomValue + padding
    }
    return this._toDelimited(" ", header, atomFn)
  }

  get asSsv(): string {
    return this.toDelimited(" ")
  }

  get asOutline(): string {
    return this._toOutline(particle => particle.getLine())
  }

  toMappedOutline(particleFn: particlesTypes.particleToStringFn): string {
    return this._toOutline(particleFn)
  }

  // Adapted from: https://github.com/notatestuser/treeify.js
  protected _toOutline(particleFn: particlesTypes.particleToStringFn) {
    const growBranch = (outlineParticle: any, last: boolean, lastStates: any[], particleFn: particlesTypes.particleToStringFn, callback: any) => {
      let lastStatesCopy = lastStates.slice(0)
      const particle: Particle = outlineParticle.particle

      if (lastStatesCopy.push([outlineParticle, last]) && lastStates.length > 0) {
        let line = ""
        // cued on the "was last element" states of whatever we're nested within,
        // we need to append either blankness or a branch to our line
        lastStates.forEach((lastState, idx) => {
          if (idx > 0) line += lastState[1] ? " " : "│"
        })

        // the prefix varies cued on whether the key contains something to show and
        // whether we're dealing with the last element in this collection
        // the extra "-" just makes things stand out more.
        line += (last ? "└" : "├") + particleFn(particle)
        callback(line)
      }

      if (!particle) return

      const length = particle.length
      let index = 0
      particle.forEach(particle => {
        let lastKey = ++index === length

        growBranch({ particle: particle }, lastKey, lastStatesCopy, particleFn, callback)
      })
    }

    let output = ""
    growBranch({ particle: this }, false, [], particleFn, (line: string) => (output += line + "\n"))
    return output
  }

  copyTo(particle: Particle, index: int) {
    return particle._insertBlock(this.toString(), index)
  }

  // Note: Splits using a positive lookahead
  // this.split("foo").join("\n") === this.toString()
  split(cue: particlesTypes.atom): Particle[] {
    // todo: cleanup
    const constructor = this._modifiedConstructor || <any>this.constructor
    const ParticleBreakSymbol = this.particleBreakSymbol
    const AtomBreakSymbol = this.atomBreakSymbol

    // todo: cleanup. the escaping is wierd.
    return this.toString()
      .split(new RegExp(`\\${ParticleBreakSymbol}(?=${cue}(?:${AtomBreakSymbol}|\\${ParticleBreakSymbol}))`, "g"))
      .map(str => new constructor(str))
  }

  get asMarkdownTable(): string {
    return this.toMarkdownTableAdvanced(this._getUnionNames(), (val: string) => val)
  }

  toMarkdownTableAdvanced(columns: atom[], formatFn: particlesTypes.formatFunction): string {
    const matrix = this._getMatrix(columns)
    const empty = columns.map(col => "-")
    matrix.unshift(empty)
    matrix.unshift(columns)
    const lines = matrix.map((row, rowIndex) => {
      const formattedValues = row.map((val, colIndex) => formatFn(val, rowIndex, colIndex))
      return `|${formattedValues.join("|")}|`
    })
    return lines.join("\n")
  }

  get asTsv(): string {
    return this.toDelimited("\t")
  }

  get particleBreakSymbol(): string {
    return PARTICLE_MEMBRANE
  }

  get atomBreakSymbol(): string {
    return ATOM_MEMBRANE
  }

  get edgeSymbolRegex() {
    return new RegExp(this.edgeSymbol, "g")
  }

  get particleBreakSymbolRegex() {
    return new RegExp(this.particleBreakSymbol, "g")
  }

  get edgeSymbol(): string {
    return SUBPARTICLE_MEMBRANE
  }

  protected _textToContentAndSubparticlesTuple(text: string) {
    const lines = text.split(this.particleBreakSymbolRegex)
    const firstLine = lines.shift()
    const subparticles = !lines.length
      ? undefined
      : lines
          .map(line => (line.substr(0, 1) === this.edgeSymbol ? line : this.edgeSymbol + line))
          .map(line => line.substr(1))
          .join(this.particleBreakSymbol)
    return [firstLine, subparticles]
  }

  protected _getLine() {
    return this._line
  }

  protected _setLine(line = "") {
    this._line = line
    if (this._atoms) delete this._atoms
    return this
  }

  protected _clearSubparticles() {
    this._deleteByIndexes(Utils.getRange(0, this.length))
    delete this._subparticles
    return this
  }

  protected _setSubparticles(content: any, circularCheckArray?: any[]) {
    this._clearSubparticles()
    // todo: is this correct? seems like `new Particle("").length` should be 1, not 0.
    if (!content) return this

    // set from string
    if (typeof content === "string") {
      this._appendSubparticlesFromString(content)
      return this
    }

    // set from particle
    if (content instanceof Particle) {
      content.forEach(particle => this._insertBlock(particle.toString()))
      return this
    }

    // If we set from object, create an array of inserted objects to avoid circular loops
    if (!circularCheckArray) circularCheckArray = [content]

    return this._setFromObject(content, circularCheckArray)
  }

  protected _setFromObject(content: any, circularCheckArray: Object[]) {
    for (let cue in content) {
      if (!content.hasOwnProperty(cue)) continue
      // Branch the circularCheckArray, as we only have same branch circular arrays
      this._appendFromJavascriptObjectTuple(cue, content[cue], circularCheckArray.slice(0))
    }

    return this
  }

  // todo: refactor the below.
  protected _appendFromJavascriptObjectTuple(cue: particlesTypes.atom, content: any, circularCheckArray: Object[]) {
    const type = typeof content
    let line
    let subparticles
    if (content === null) line = cue + " " + null
    else if (content === undefined) line = cue
    else if (type === "string") {
      const tuple = this._textToContentAndSubparticlesTuple(content)
      line = cue + " " + tuple[0]
      subparticles = tuple[1]
    } else if (type === "function") line = cue + " " + content.toString()
    else if (type !== "object") line = cue + " " + content
    else if (content instanceof Date) line = cue + " " + content.getTime().toString()
    else if (content instanceof Particle) {
      line = cue
      subparticles = new Particle(content.subparticlesToString(), content.getLine())
    } else if (circularCheckArray.indexOf(content) === -1) {
      circularCheckArray.push(content)
      line = cue
      const length = content instanceof Array ? content.length : Object.keys(content).length
      if (length) subparticles = new Particle()._setSubparticles(content, circularCheckArray)
    } else {
      // iirc this is return early from circular
      return
    }
    this._insertBlock(this._makeBlock(line, subparticles))
  }

  protected _insertBlock(block: string, index?: number) {
    if (index !== undefined) index = index < 0 ? this.length + index : index
    const newParticle = this._getParserPool().createParticle(this, block, index)
    if (this._cueIndex) this._makeCueIndex(index)
    this.clearQuickCache()
    return newParticle
  }

  protected _insertLines(lines: string, index = this.length) {
    const parser: any = this.constructor
    const newParticle = new parser()
    if (typeof lines === "string") newParticle._appendSubparticlesFromString(lines)
    const adjustedIndex = index < 0 ? this.length + index : index
    this._getSubparticlesArray().splice(adjustedIndex, 0, ...newParticle.getSubparticles())
    if (this._cueIndex) this._makeCueIndex(adjustedIndex)
    this.clearQuickCache()
    return this.getSubparticles().slice(index, index + newParticle.length)
  }

  insertLinesAfter(lines: string) {
    return this.parent._insertLines(lines, this.index + 1)
  }

  protected _appendSubparticlesFromString(str: string) {
    const { edgeSymbol, particleBreakSymbol } = this
    const blocks = splitBlocks(str, edgeSymbol, particleBreakSymbol)
    const parserPool = this._getParserPool()
    return blocks.map((block, index) => parserPool.createParticle(this, block))
  }

  private async _appendBlockAsync(block) {
    // We need to keep grapping the parserPool in case it changed.
    // todo: cleanup and perf optimize
    let parserPool = this._getParserPool()
    await parserPool.appendParticleAsync(this, block)
  }

  private async _transformAndAppendBlockAsync(block: string): particlesTypes.particle {
    block = block.replace(/\r/g, "") // I hate \r
    const rootParticle = this.root
    if (this._beforeAppend) this._beforeAppend(block) // todo: clean this up and document it.
    if (rootParticle.particleTransformers) {
      // A macro may return multiple new blocks.
      const blocks = splitBlocks(rootParticle._transformBlock(block), SUBPARTICLE_MEMBRANE, PARTICLE_MEMBRANE)

      const newParticles: particlesTypes.particle[] = []
      for (const [newBlockIndex, block] of blocks.entries()) {
        const particle = await this._appendBlockAsync(block)
        newParticles.push(particle)
      }
      return newParticles[0]
    }

    const newParticle = await this._appendBlockAsync(block)
    return newParticle
  }

  async appendFromStream(input) {
    const { edgeSymbol, particleBreakSymbol } = this

    let buffer = ""
    const breakRegex = new RegExp(`${particleBreakSymbol}(?!${edgeSymbol})`)

    // Node.js Readable stream
    if (typeof process !== "undefined" && input instanceof require("stream").Readable) {
      for await (const chunk of input) {
        buffer += chunk.toString("utf8")

        while (true) {
          const breakIndex = buffer.search(breakRegex)
          if (breakIndex === -1) break

          const block = buffer.slice(0, breakIndex)
          buffer = buffer.slice(breakIndex + particleBreakSymbol.length)

          await this._transformAndAppendBlockAsync(block)
        }
      }
      // Process remaining buffer
      await this._transformAndAppendBlockAsync(buffer)
    }
    // Browser ReadableStream
    else if (typeof ReadableStream !== "undefined" && input instanceof ReadableStream) {
      const reader = input.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += new TextDecoder().decode(value) // Convert Uint8Array to string

          while (true) {
            const breakIndex = buffer.search(breakRegex)
            if (breakIndex === -1) break

            const block = buffer.slice(0, breakIndex)
            buffer = buffer.slice(breakIndex + particleBreakSymbol.length)

            await this._transformAndAppendBlockAsync(block)
          }
        }
        // Process remaining buffer
        await this._transformAndAppendBlockAsync(buffer)
      } finally {
        reader.releaseLock()
      }
    }
    // Plain string input (works in both environments)
    else if (typeof input === "string") {
      buffer = input
      while (true) {
        const breakIndex = buffer.search(breakRegex)
        if (breakIndex === -1) break

        const block = buffer.slice(0, breakIndex)
        buffer = buffer.slice(breakIndex + particleBreakSymbol.length)

        await this._transformAndAppendBlockAsync(block)
      }
      await this._transformAndAppendBlockAsync(buffer)
    } else {
      throw new Error("Unsupported input type. Expected string, Node.js Readable, or ReadableStream.")
    }
  }

  protected _getCueIndex() {
    // StringMap<int> {cue: index}
    // When there are multiple tails with the same cue, index stores the last content.
    // todo: change the above behavior: when a collision occurs, create an array.
    return this._cueIndex || this._makeCueIndex()
  }

  getContentsArray() {
    return this.map(particle => particle.content)
  }

  getSubparticlesByParser(parser: Function) {
    return this.filter(subparticle => subparticle instanceof parser)
  }

  getAncestorByParser(parser: Function): Particle | undefined {
    if (this instanceof parser) return this
    if (this.isRoot()) return undefined
    const parent = this.parent
    return parent instanceof parser ? parent : parent.getAncestorByParser(parser)
  }

  getParticleByParser(parser: Function) {
    return this.find(subparticle => subparticle instanceof parser)
  }

  // todo: switch to native classes and parsers in particles and away from javascript classes for parsing.
  // move off particle.ts
  // make the below work.
  // By default every particle has a parser. By default they all match to the first particle.
  get parser() {
    return this._parser || this.root.particleAt(0)
  }

  // The parserId of a particle at the moment is defined as the cue of the parser it is matched to.
  get parserId() {
    return this.parser.cue
  }

  indexOfLast(cue: atom): int {
    const result = this._getCueIndex()[cue]
    return result === undefined ? -1 : result
  }

  // todo: renmae to indexOfFirst?
  indexOf(cue: atom): int {
    if (!this.has(cue)) return -1

    const length = this.length
    const particles = this._getSubparticlesArray()

    for (let index = 0; index < length; index++) {
      if (particles[index].cue === cue) return index
    }
  }

  // todo: rename this. it is a particular type of object.
  toObject(): particlesTypes.stringMap {
    return this._toObject()
  }

  getCues(): atom[] {
    return this.map(particle => particle.cue)
  }

  protected _makeCueIndex(startAt = 0) {
    if (!this._cueIndex || !startAt) this._cueIndex = {}
    const particles = this._getSubparticlesArray()
    const newIndex = this._cueIndex
    const length = particles.length

    for (let index = startAt; index < length; index++) {
      newIndex[particles[index].cue] = index
    }

    return newIndex
  }

  protected _subparticlesToXml(indentCount: particlesTypes.positiveInt) {
    return this.map(particle => particle._toXml(indentCount)).join("")
  }

  clone(subparticles = this.subparticlesToString(), line = this.getLine()): Particle {
    return new (<any>this.constructor)(subparticles, line)
  }

  hasCue(cue: atom): boolean {
    return this._hasCue(cue)
  }

  has(cuePath: particlesTypes.cuePath): boolean {
    const edgeSymbol = this.edgeSymbol
    if (!cuePath.includes(edgeSymbol)) return this.hasCue(cuePath)

    const parts = cuePath.split(edgeSymbol)
    const next = this.getParticle(parts.shift())
    if (!next) return false
    return next.has(parts.join(edgeSymbol))
  }

  hasParticle(particle: Particle | string): boolean {
    const needle = particle.toString()
    return this.getSubparticles().some(particle => particle.toString() === needle)
  }

  protected _hasCue(cue: string) {
    return this._getCueIndex()[cue] !== undefined
  }

  map(fn: mapFn) {
    return this.getSubparticles().map(fn)
  }

  filter(fn: particlesTypes.filterFn = item => item) {
    return this.getSubparticles().filter(fn)
  }

  find(fn: particlesTypes.filterFn) {
    return this.getSubparticles().find(fn)
  }

  findLast(fn: particlesTypes.filterFn) {
    return this.getSubparticles().reverse().find(fn)
  }

  every(fn: particlesTypes.everyFn) {
    let index = 0
    for (let particle of this.getTopDownArrayIterator()) {
      if (!fn(particle, index)) return false
      index++
    }
    return true
  }

  forEach(fn: particlesTypes.forEachFn) {
    this.getSubparticles().forEach(fn)
    return this
  }

  // Recurse if predicate passes
  deepVisit(predicate: (particle: any) => boolean) {
    this.forEach(particle => {
      if (predicate(particle) !== false) particle.deepVisit(predicate)
    })
  }

  _quickCache: particlesTypes.stringMap
  get quickCache() {
    if (!this._quickCache) this._quickCache = {}
    return this._quickCache
  }

  getCustomIndex(key: string) {
    if (!this.quickCache.customIndexes) this.quickCache.customIndexes = {}
    const customIndexes = this.quickCache.customIndexes
    if (customIndexes[key]) return customIndexes[key]
    const customIndex: { [cue: string]: Particle[] } = {}
    customIndexes[key] = customIndex
    this.filter(file => file.has(key)).forEach(file => {
      const value = file.get(key)
      if (!customIndex[value]) customIndex[value] = []
      customIndex[value].push(file)
    })
    return customIndex
  }

  clearQuickCache() {
    delete this._quickCache
  }

  // todo: protected?
  _clearCueIndex() {
    delete this._cueIndex
    this.clearQuickCache()
  }

  slice(start: int, end?: int): Particle[] {
    return this.getSubparticles().slice(start, end)
  }

  // todo: make 0 and 1 a param
  getInheritanceParticles() {
    const paths: particlesTypes.stringMap = {}
    const result = new Particle()
    this.forEach(particle => {
      const key = particle.getAtom(0)
      const parentKey = particle.getAtom(1)
      const parentPath = paths[parentKey]
      paths[key] = parentPath ? [parentPath, key].join(" ") : key
      result.touchParticle(paths[key])
    })
    return result
  }

  protected _getGrandParent(): Particle | undefined {
    return this.isRoot() || this.parent.isRoot() ? undefined : this.parent.parent
  }

  private static _parserPoolsCache = new Map<any, ParserPool>()

  private _parserPool?: ParserPool
  _getParserPool() {
    if (this._parserPool) return this._parserPool
    if (!Particle._parserPoolsCache.has(this.constructor)) Particle._parserPoolsCache.set(this.constructor, this.createParserPool())
    return Particle._parserPoolsCache.get(this.constructor)
  }

  createParserPool(): ParserPool {
    return new ParserPool(this.constructor)
  }

  private static _uniqueId: int

  static _makeUniqueId() {
    if (this._uniqueId === undefined) this._uniqueId = 0
    this._uniqueId++
    return this._uniqueId
  }

  protected static _getFileFormat(path: string) {
    const format = path.split(".").pop()
    return (<any>FileFormat)[format] ? format : FileFormat.particles
  }

  static ParserPool = ParserPool

  static iris = `sepal_length,sepal_width,petal_length,petal_width,species
6.1,3,4.9,1.8,virginica
5.6,2.7,4.2,1.3,versicolor
5.6,2.8,4.9,2,virginica
6.2,2.8,4.8,1.8,virginica
7.7,3.8,6.7,2.2,virginica
5.3,3.7,1.5,0.2,setosa
6.2,3.4,5.4,2.3,virginica
4.9,2.5,4.5,1.7,virginica
5.1,3.5,1.4,0.2,setosa
5,3.4,1.5,0.2,setosa`

  // BEGIN MUTABLE METHODS BELOw

  private _particleCreationTime: number = this._getProcessTimeInMilliseconds()
  private _lineModifiedTime: number
  private _subparticleArrayModifiedTime: number

  getLineModifiedTime(): number {
    return this._lineModifiedTime || this._particleCreationTime
  }

  getChildArrayModifiedTime() {
    return this._subparticleArrayModifiedTime || this._particleCreationTime
  }

  protected _setChildArrayMofifiedTime(value: number) {
    this._subparticleArrayModifiedTime = value
    return this
  }

  getLineOrSubparticlesModifiedTime(): number {
    return Math.max(
      this.getLineModifiedTime(),
      this.getChildArrayModifiedTime(),
      Math.max.apply(
        null,
        this.map(subparticle => subparticle.getLineOrSubparticlesModifiedTime())
      )
    )
  }

  private _virtualParentParticle: Particle
  protected _setVirtualParentParticle(particle: Particle) {
    this._virtualParentParticle = particle
    return this
  }

  protected _getVirtualParentParticle() {
    return this._virtualParentParticle
  }

  private _setVirtualAncestorParticlesByInheritanceViaColumnIndicesAndThenExpand(particles: Particle[], thisIdColumnNumber: int, extendsIdColumnNumber: int) {
    const map: { [particleId: string]: particlesTypes.inheritanceInfo } = {}
    for (let particle of particles) {
      const particleId = particle.getAtom(thisIdColumnNumber)
      if (map[particleId]) throw new Error(`Tried to define a particle with id "${particleId}" but one is already defined.`)
      map[particleId] = {
        particleId: particleId,
        particle: particle,
        parentId: particle.getAtom(extendsIdColumnNumber)
      }
    }
    // Add parent Particles
    Object.values(map).forEach(particleInfo => {
      const parentId = particleInfo.parentId
      const parentParticle = map[parentId]
      if (parentId && !parentParticle) throw new Error(`Particle "${particleInfo.particleId}" tried to extend "${parentId}" but "${parentId}" not found.`)
      if (parentId) particleInfo.particle._setVirtualParentParticle(parentParticle.particle)
    })

    particles.forEach(particle => particle._expandFromVirtualParentParticle())
    return this
  }

  private _isVirtualExpanded: boolean
  private _isExpanding: boolean // for loop detection

  protected _expandFromVirtualParentParticle() {
    if (this._isVirtualExpanded) return this

    this._isExpanding = true

    let parentParticle = this._getVirtualParentParticle()
    if (parentParticle) {
      if (parentParticle._isExpanding) throw new Error(`Loop detected: '${this.getLine()}' is the ancestor of one of its ancestors.`)
      parentParticle._expandFromVirtualParentParticle()
      const clone = this.clone()
      this._setSubparticles(parentParticle.subparticlesToString())
      this.extend(clone)
    }

    this._isExpanding = false
    this._isVirtualExpanded = true
  }

  // todo: solve issue related to whether extend should overwrite or append.
  _expandSubparticles(thisIdColumnNumber: int, extendsIdColumnNumber: int, subparticlesThatNeedExpanding = this.getSubparticles()) {
    return this._setVirtualAncestorParticlesByInheritanceViaColumnIndicesAndThenExpand(subparticlesThatNeedExpanding, thisIdColumnNumber, extendsIdColumnNumber)
  }

  // todo: add more testing.
  // todo: solve issue with where extend should overwrite or append
  // todo: should take a parsers? to decide whether to overwrite or append.
  // todo: this is slow.
  extend(particleOrStr: Particle | string | Object) {
    const particle = particleOrStr instanceof Particle ? particleOrStr : new Particle(particleOrStr)
    const usedCues = new Set()
    particle.forEach(sourceParticle => {
      const cue = sourceParticle.cue
      let targetParticle
      const isAnArrayNotMap = usedCues.has(cue)
      if (!this.has(cue)) {
        usedCues.add(cue)
        this.appendLineAndSubparticles(sourceParticle.getLine(), sourceParticle.subparticlesToString())
        return true
      }
      if (isAnArrayNotMap) targetParticle = this.appendLine(sourceParticle.getLine())
      else {
        targetParticle = this.touchParticle(cue).setContent(sourceParticle.content)
        usedCues.add(cue)
      }
      if (sourceParticle.length) targetParticle.extend(sourceParticle)
    })
    return this
  }

  lastParticle(): Particle {
    return this.getSubparticles()[this.length - 1]
  }

  expandLastFromTopMatter(): Particle {
    const clone = this.clone()
    const map = new Map()
    const lastParticle = clone.lastParticle()
    lastParticle.getOlderSiblings().forEach(particle => map.set(particle.getAtom(0), particle))
    lastParticle.topDownArray.forEach(particle => {
      const replacement = map.get(particle.getAtom(0))
      if (!replacement) return

      particle.replaceParticle(str => replacement.toString())
    })
    return lastParticle
  }

  macroExpand(macroDefinitionAtom: string, macroUsageAtom: string): Particle {
    const clone = this.clone()
    const defs = clone.findParticles(macroDefinitionAtom)
    const allUses = clone.findParticles(macroUsageAtom)
    const atomBreakSymbol = clone.atomBreakSymbol
    defs.forEach(def => {
      const macroName = def.getAtom(1)
      const uses = allUses.filter(particle => particle.hasAtom(1, macroName))
      const params = def.getAtomsFrom(2)
      const replaceFn = (str: string) => {
        const paramValues = str.split(atomBreakSymbol).slice(2)
        let newParticle = def.subparticlesToString()
        params.forEach((param, index) => {
          newParticle = newParticle.replace(new RegExp(param, "g"), paramValues[index])
        })
        return newParticle
      }
      uses.forEach(particle => {
        particle.replaceParticle(replaceFn)
      })
      def.destroy()
    })
    return clone
  }

  setSubparticles(subparticles: particlesTypes.subparticles) {
    return this._setSubparticles(subparticles)
  }

  protected _updateLineModifiedTimeAndTriggerEvent() {
    this._lineModifiedTime = this._getProcessTimeInMilliseconds()
  }

  insertAtom(index: int, atom: string) {
    const wi = this.atomBreakSymbol
    const atoms = this._getLine().split(wi)
    atoms.splice(index, 0, atom)
    this.setLine(atoms.join(wi))
    return this
  }

  deleteDuplicates() {
    const set = new Set()
    this.topDownArray.forEach(particle => {
      const str = particle.toString()
      if (set.has(str)) particle.destroy()
      else set.add(str)
    })
    return this
  }

  setAtom(index: int, atom: string) {
    const wi = this.atomBreakSymbol
    const atoms = this._getLine().split(wi)
    atoms[index] = atom
    this.setLine(atoms.join(wi))
    return this
  }

  deleteSubparticles() {
    return this._clearSubparticles()
  }

  setContent(content: string): Particle {
    if (content === this.content) return this
    const newArray = [this.cue]
    if (content !== undefined) {
      content = content.toString()
      if (content.match(this.particleBreakSymbol)) return this.setContentWithSubparticles(content)
      newArray.push(content)
    }
    this._setLine(newArray.join(this.atomBreakSymbol))
    this._updateLineModifiedTimeAndTriggerEvent()
    return this
  }

  prependSibling(line: string, subparticles: string) {
    return this.parent.insertLineAndSubparticles(line, subparticles, this.index)
  }

  appendSibling(line: string, subparticles: string) {
    return this.parent.insertLineAndSubparticles(line, subparticles, this.index + 1)
  }

  setContentWithSubparticles(text: string) {
    // todo: deprecate
    if (!text.includes(this.particleBreakSymbol)) {
      this._clearSubparticles()
      return this.setContent(text)
    }

    const lines = text.split(this.particleBreakSymbolRegex)
    const firstLine = lines.shift()
    this.setContent(firstLine)

    // tood: cleanup.
    const remainingString = lines.join(this.particleBreakSymbol)
    const subparticles = new Particle(remainingString)
    if (!remainingString) subparticles.appendLine("")
    this.setSubparticles(subparticles)
    return this
  }

  setCue(cue: atom) {
    return this.setAtom(0, cue)
  }

  setLine(line: string) {
    if (line === this.getLine()) return this
    // todo: clear parent TMTimes
    this.parent._clearCueIndex()
    this._setLine(line)
    this._updateLineModifiedTimeAndTriggerEvent()
    return this
  }

  duplicate() {
    return this.parent._insertBlock(this.toString(), this.index + 1)
  }

  trim() {
    // todo: could do this so only the trimmed rows are deleted.
    this.setSubparticles(this.subparticlesToString().trim())
    return this
  }

  destroy() {
    ;(this.parent as Particle)._deleteParticle(this)
  }

  set(cuePath: particlesTypes.cuePath, text: string) {
    return this.touchParticle(cuePath).setContentWithSubparticles(text)
  }

  setFromText(text: string) {
    if (this.toString() === text) return this
    const tuple = this._textToContentAndSubparticlesTuple(text)
    this.setLine(tuple[0])
    return this._setSubparticles(tuple[1])
  }

  setPropertyIfMissing(prop: string, value: string) {
    if (this.has(prop)) return true
    return this.touchParticle(prop).setContent(value)
  }

  setProperties(propMap: particlesTypes.stringMap) {
    const props = Object.keys(propMap)
    const values = Object.values(propMap)
    // todo: is there a built in particle method to do this?
    props.forEach((prop, index) => {
      const value = <string>values[index]
      if (!value) return true
      if (this.get(prop) === value) return true
      this.touchParticle(prop).setContent(value)
    })
    return this
  }

  // todo: throw error if line contains a \n
  appendLine(line: string) {
    return this._insertBlock(line)
  }

  appendUniqueLine(line: string) {
    if (!this.hasLine(line)) return this.appendLine(line)
    return this.findLine(line)
  }

  appendLineAndSubparticles(line: string, subparticles: particlesTypes.subparticles) {
    return this._insertBlock(this._makeBlock(line, subparticles))
  }

  appendBlocks(blocks: string) {
    return this._appendSubparticlesFromString(blocks)
  }

  _makeBlock(line: string, subparticles: particlesTypes.subparticles) {
    if (subparticles === undefined) return line
    const particle = new Particle(subparticles, line)
    return particle._toStringWithLine()
  }

  getParticlesByRegex(regex: RegExp | RegExp[]) {
    const matches: Particle[] = []
    regex = regex instanceof RegExp ? [regex] : regex
    this._getParticlesByLineRegex(matches, regex)
    return matches
  }

  // todo: remove?
  getParticlesByLinePrefixes(columns: string[]) {
    const matches: Particle[] = []
    this._getParticlesByLineRegex(
      matches,
      columns.map(str => new RegExp("^" + str))
    )
    return matches
  }

  particlesThatStartWith(prefix: string) {
    return this.filter(particle => particle.getLine().startsWith(prefix))
  }

  protected _getParticlesByLineRegex(matches: Particle[], regs: RegExp[]) {
    const rgs = regs.slice(0)
    const reg = rgs.shift()
    const candidates = this.filter(subparticle => subparticle.getLine().match(reg))
    if (!rgs.length) return candidates.forEach(cand => matches.push(cand))
    candidates.forEach(cand => (<any>cand)._getParticlesByLineRegex(matches, rgs))
  }

  concat(particle: string | Particle) {
    if (typeof particle === "string") particle = new Particle(particle)
    return particle.map(particle => this._insertBlock(particle.toString()))
  }

  protected _deleteByIndexes(indexesToDelete: int[]) {
    if (!indexesToDelete.length) return this
    this._clearCueIndex()
    // note: assumes indexesToDelete is in ascending order
    const deletedParticles = indexesToDelete.reverse().map(index => this._getSubparticlesArray().splice(index, 1)[0])
    this._setChildArrayMofifiedTime(this._getProcessTimeInMilliseconds())
    return this
  }

  protected _deleteParticle(particle: Particle) {
    const index = this._indexOfParticle(particle)
    return index > -1 ? this._deleteByIndexes([index]) : 0
  }

  reverse() {
    this._clearCueIndex()
    this._getSubparticlesArray().reverse()
    return this
  }

  shift() {
    if (!this.length) return null
    const particle = this._getSubparticlesArray().shift()
    return particle.copyTo(new (<any>this.constructor)(), 0)
  }

  sort(fn: particlesTypes.sortFn) {
    this._getSubparticlesArray().sort(fn)
    this._clearCueIndex()
    return this
  }

  invert() {
    this.forEach(particle => particle.atoms.reverse())
    return this
  }

  protected _rename(oldCue: particlesTypes.atom, newCue: particlesTypes.atom) {
    const index = this.indexOf(oldCue)

    if (index === -1) return this

    const particle = <Particle>this._getSubparticlesArray()[index]

    particle.setCue(newCue)
    this._clearCueIndex()
    return this
  }

  // Does not recurse.
  remap(map: particlesTypes.stringMap) {
    this.forEach(particle => {
      const cue = particle.cue
      if (map[cue] !== undefined) particle.setCue(map[cue])
    })
    return this
  }

  rename(oldCue: atom, newCue: atom) {
    this._rename(oldCue, newCue)
    return this
  }

  renameAll(oldName: atom, newName: atom) {
    this.findParticles(oldName).forEach(particle => particle.setCue(newName))
    return this
  }

  protected _deleteAllChildParticlesWithCue(cue: atom) {
    if (!this.has(cue)) return this
    const allParticles = this._getSubparticlesArray()
    const indexesToDelete: int[] = []
    allParticles.forEach((particle, index) => {
      if (particle.cue === cue) indexesToDelete.push(index)
    })
    return this._deleteByIndexes(indexesToDelete)
  }

  delete(path: particlesTypes.cuePath = "") {
    const edgeSymbol = this.edgeSymbol
    if (!path.includes(edgeSymbol)) return this._deleteAllChildParticlesWithCue(path)

    const parts = path.split(edgeSymbol)
    const nextCue = parts.pop()
    const targetParticle = <Particle>this.getParticle(parts.join(edgeSymbol))

    return targetParticle ? targetParticle._deleteAllChildParticlesWithCue(nextCue) : 0
  }

  deleteColumn(cue = "") {
    this.forEach(particle => particle.delete(cue))
    return this
  }

  protected _getNonMaps(): Particle[] {
    const results = this.topDownArray.filter(particle => particle.hasDuplicateCues())
    if (this.hasDuplicateCues()) results.unshift(this)
    return results
  }

  replaceWith(blocks: string) {
    const split = splitBlocks(blocks, SUBPARTICLE_MEMBRANE, PARTICLE_MEMBRANE).reverse()
    const parent = this.parent
    const index = this.index
    const newParticles = split.map((block, newBlockIndex) => parent._insertBlock(block, index))
    this.destroy()
    return newParticles
  }

  replaceParticle(fn: (thisStr: string) => string) {
    const parent = this.parent
    const index = this.index
    const newParticles = new Particle(fn(this.toString()))
    const returnedParticles: Particle[] = []
    newParticles.forEach((subparticle, subparticleIndex) => {
      const newParticle = parent.insertLineAndSubparticles(subparticle.getLine(), subparticle.subparticlesToString(), index + subparticleIndex)
      returnedParticles.push(newParticle)
    })
    this.destroy()
    return returnedParticles
  }

  insertLineAndSubparticles(line: string, subparticles: particlesTypes.subparticles, index: int) {
    return this._insertBlock(this._makeBlock(line, subparticles), index)
  }

  insertLine(line: string, index: int) {
    return this._insertBlock(line, index)
  }

  insertSection(lines: string, index: int) {
    return this._insertBlock(lines, index)
  }

  prependLine(line: string) {
    return this.insertLine(line, 0)
  }

  pushContentAndSubparticles(content?: particlesTypes.line, subparticles?: particlesTypes.subparticles) {
    let index = this.length

    while (this.has(index.toString())) {
      index++
    }
    const line = index.toString() + (content === undefined ? "" : this.atomBreakSymbol + content)
    return this.appendLineAndSubparticles(line, subparticles)
  }

  deleteBlanks() {
    this.getSubparticles()
      .filter(particle => particle.isBlankLine())
      .forEach(particle => (<Particle>particle).destroy())
    return this
  }

  // todo: add "globalReplace" method? Which runs a global regex or string replace on the Particle as a string?

  cueSort(cueOrder: particlesTypes.atom[]): this {
    return this._cueSort(cueOrder)
  }

  deleteAtomAt(atomIndex: particlesTypes.positiveInt): this {
    const atoms = this.atoms
    atoms.splice(atomIndex, 1)
    return this.setAtoms(atoms)
  }

  private _listeners: Map<any, ParticleEventHandler[]>

  trigger(event: AbstractParticleEvent) {
    if (this._listeners && this._listeners.has(event.constructor)) {
      const listeners = this._listeners.get(event.constructor)
      const listenersToRemove: int[] = []
      for (let index = 0; index < listeners.length; index++) {
        const listener = listeners[index]
        if (listener(event) === true) listenersToRemove.push(index)
      }
      listenersToRemove.reverse().forEach(index => listenersToRemove.splice(index, 1))
    }
  }

  triggerAncestors(event: AbstractParticleEvent) {
    if (this.isRoot()) return
    const parent = this.parent
    parent.trigger(event)
    parent.triggerAncestors(event)
  }

  onLineChanged(eventHandler: ParticleEventHandler) {
    return this._addEventListener(LineChangedParticleEvent, eventHandler)
  }

  onDescendantChanged(eventHandler: ParticleEventHandler) {
    return this._addEventListener(DescendantChangedParticleEvent, eventHandler)
  }

  onChildAdded(eventHandler: ParticleEventHandler) {
    return this._addEventListener(ChildAddedParticleEvent, eventHandler)
  }

  onChildRemoved(eventHandler: ParticleEventHandler) {
    return this._addEventListener(ChildRemovedParticleEvent, eventHandler)
  }

  private _addEventListener(eventClass: any, eventHandler: ParticleEventHandler) {
    if (!this._listeners) this._listeners = new Map()
    if (!this._listeners.has(eventClass)) this._listeners.set(eventClass, [])
    this._listeners.get(eventClass).push(eventHandler)
    return this
  }

  setAtoms(atoms: particlesTypes.atom[]): this {
    return this.setLine(atoms.join(this.atomBreakSymbol))
  }

  setAtomsFrom(index: particlesTypes.positiveInt, atoms: particlesTypes.atom[]): this {
    this.setAtoms(this.atoms.slice(0, index).concat(atoms))
    return this
  }

  appendAtom(atom: particlesTypes.atom): this {
    const atoms = this.atoms
    atoms.push(atom)
    return this.setAtoms(atoms)
  }

  _cueSort(cueOrder: particlesTypes.atom[], secondarySortFn?: particlesTypes.sortFn): this {
    const particleAFirst = -1
    const particleBFirst = 1
    const map: { [cue: string]: int } = {}
    cueOrder.forEach((atom, index) => {
      map[atom] = index
    })
    this.sort((particleA, particleB) => {
      const valA = map[particleA.cue]
      const valB = map[particleB.cue]
      if (valA > valB) return particleBFirst
      if (valA < valB) return particleAFirst
      return secondarySortFn ? secondarySortFn(particleA, particleB) : 0
    })
    return this
  }

  protected _touchParticle(cuePathArray: particlesTypes.atom[]) {
    let contextParticle = this
    cuePathArray.forEach(cue => {
      contextParticle = contextParticle.getParticle(cue) || contextParticle.appendLine(cue)
    })
    return contextParticle
  }

  protected _touchParticleByString(str: string) {
    str = str.replace(this.particleBreakSymbolRegex, "") // todo: do we want to do this sanitization?
    return this._touchParticle(str.split(this.atomBreakSymbol))
  }

  touchParticle(str: particlesTypes.cuePath) {
    return this._touchParticleByString(str)
  }

  appendParticle(particle: Particle) {
    return this.appendLineAndSubparticles(particle.getLine(), particle.subparticlesToString())
  }

  hasLine(line: particlesTypes.line) {
    return this.getSubparticles().some(particle => particle.getLine() === line)
  }

  findLine(line: particlesTypes.line) {
    return this.getSubparticles().find(particle => particle.getLine() === line)
  }

  getParticlesByLine(line: particlesTypes.line) {
    return this.filter(particle => particle.getLine() === line)
  }

  toggleLine(line: particlesTypes.line): Particle {
    const lines = this.getParticlesByLine(line)
    if (lines.length) {
      lines.map(line => line.destroy())
      return this
    }

    return this.appendLine(line)
  }

  // todo: remove?
  sortByColumns(indexOrIndices: int | int[]) {
    const indices = indexOrIndices instanceof Array ? indexOrIndices : [indexOrIndices]

    const length = indices.length
    this.sort((particleA, particleB) => {
      const atomsA = particleA.atoms
      const atomsB = particleB.atoms

      for (let index = 0; index < length; index++) {
        const col = indices[index]
        const av = atomsA[col]
        const bv = atomsB[col]

        if (av === undefined) return -1
        if (bv === undefined) return 1

        if (av > bv) return 1
        else if (av < bv) return -1
      }
      return 0
    })
    return this
  }

  getAtomsAsSet() {
    return new Set(this.getAtomsFrom(1))
  }

  appendAtomIfMissing(atom: string) {
    if (this.getAtomsAsSet().has(atom)) return this
    return this.appendAtom(atom)
  }

  // todo: check to ensure identical objects
  addObjectsAsDelimited(arrayOfObjects: Object[], delimiter = Utils._chooseDelimiter(new Particle(arrayOfObjects).toString())) {
    const header = Object.keys(arrayOfObjects[0])
      .join(delimiter)
      .replace(/[\n\r]/g, "")
    const rows = arrayOfObjects.map(item =>
      Object.values(item)
        .join(delimiter)
        .replace(/[\n\r]/g, "")
    )
    return this.addUniqueRowsToNestedDelimited(header, rows)
  }

  setSubparticlesAsDelimited(particle: Particle | string, delimiter = Utils._chooseDelimiter(particle.toString())) {
    particle = particle instanceof Particle ? particle : new Particle(particle)
    return this.setSubparticles(particle.toDelimited(delimiter))
  }

  convertSubparticlesToDelimited(delimiter = Utils._chooseDelimiter(this.subparticlesToString())) {
    // todo: handle newlines!!!
    return this.setSubparticles(this.toDelimited(delimiter))
  }

  addUniqueRowsToNestedDelimited(header: string, rowsAsStrings: string[]) {
    if (!this.length) this.appendLine(header)

    // todo: this looks brittle
    rowsAsStrings.forEach(row => {
      if (!this.toString().includes(row)) this.appendLine(row)
    })

    return this
  }

  shiftLeft(): Particle {
    const grandParent = <Particle>this._getGrandParent()
    if (!grandParent) return this

    const parentIndex = this.parent.index
    const newParticle = grandParent.insertLineAndSubparticles(this.getLine(), this.length ? this.subparticlesToString() : undefined, parentIndex + 1)
    this.destroy()
    return newParticle
  }

  pasteText(text: string) {
    const parent = this.parent
    const index = this.index
    const newParticles = new Particle(text)
    const firstParticle = newParticles.particleAt(0)
    if (firstParticle) {
      this.setLine(firstParticle.getLine())
      if (firstParticle.length) this.setSubparticles(firstParticle.subparticlesToString())
    } else {
      this.setLine("")
    }
    newParticles.forEach((subparticle, subparticleIndex) => {
      if (!subparticleIndex)
        // skip first
        return true
      parent.insertLineAndSubparticles(subparticle.getLine(), subparticle.subparticlesToString(), index + subparticleIndex)
    })
    return this
  }

  templateToString(obj: particlesTypes.stringMap): string {
    // todo: compile/cache for perf?
    const particle = this.clone()
    particle.topDownArray.forEach(particle => {
      const line = particle.getLine().replace(/{([^\}]+)}/g, (match, path) => {
        const replacement = obj[path]
        if (replacement === undefined) throw new Error(`In string template no match found on line "${particle.getLine()}"`)
        return replacement
      })
      particle.pasteText(line)
    })
    return particle.toString()
  }

  shiftRight(): Particle {
    const olderSibling = <Particle>this._getClosestOlderSibling()
    if (!olderSibling) return this

    const newParticle = olderSibling.appendLineAndSubparticles(this.getLine(), this.length ? this.subparticlesToString() : undefined)
    this.destroy()
    return newParticle
  }

  shiftYoungerSibsRight(): Particle {
    const particles = <Particle[]>this.getYoungerSiblings()
    particles.forEach(particle => particle.shiftRight())
    return this
  }

  sortBy(nameOrNames: particlesTypes.atom[]) {
    const names = nameOrNames instanceof Array ? nameOrNames : [nameOrNames]

    const length = names.length
    this.sort((particleA, particleB) => {
      if (!particleB.length && !particleA.length) return 0
      else if (!particleA.length) return -1
      else if (!particleB.length) return 1

      for (let index = 0; index < length; index++) {
        const cue = names[index]
        const av = particleA.get(cue)
        const bv = particleB.get(cue)

        if (av > bv) return 1
        else if (av < bv) return -1
      }
      return 0
    })
    return this
  }

  private _selected: boolean

  selectParticle() {
    this._selected = true
  }

  unselectParticle() {
    delete this._selected
  }

  isSelected() {
    return !!this._selected
  }

  async saveVersion() {
    const newVersion = this.toString()
    const topUndoVersion = this._getTopUndoVersion()
    if (newVersion === topUndoVersion) return undefined
    this._recordChange(newVersion)
    this._setSavedVersion(this.toString())
    return this
  }

  hasUnsavedChanges() {
    return this.toString() !== this._getSavedVersion()
  }

  async redo() {
    const undoStack = this._getUndoStack()
    const redoStack = this._getRedoStack()
    if (!redoStack.length) return undefined
    undoStack.push(redoStack.pop())
    return this._reloadFromUndoTop()
  }

  async undo() {
    const undoStack = this._getUndoStack()
    const redoStack = this._getRedoStack()
    if (undoStack.length === 1) return undefined
    redoStack.push(undoStack.pop())
    return this._reloadFromUndoTop()
  }

  private _savedVersion: string

  private _getSavedVersion() {
    return this._savedVersion
  }

  private _setSavedVersion(str: string) {
    this._savedVersion = str
    return this
  }

  private _clearRedoStack() {
    const redoStack = this._getRedoStack()
    redoStack.splice(0, redoStack.length)
  }

  private _undoStack: string[]
  private _redoStack: string[]

  getChangeHistory() {
    return this._getUndoStack().slice(0)
  }

  private _getUndoStack() {
    if (!this._undoStack) this._undoStack = []
    return this._undoStack
  }

  private _getRedoStack() {
    if (!this._redoStack) this._redoStack = []
    return this._redoStack
  }

  private _getTopUndoVersion() {
    const undoStack = this._getUndoStack()
    return undoStack[undoStack.length - 1]
  }

  private async _reloadFromUndoTop() {
    this.setSubparticles(this._getTopUndoVersion())
  }

  private _recordChange(newVersion: string) {
    this._clearRedoStack()
    this._getUndoStack().push(newVersion) // todo: use diffs?
  }

  static fromCsv(str: string) {
    return this.fromDelimited(str, ",", '"')
  }

  // todo: jeez i think we can come up with a better name than "JsonSubset"
  static fromJsonSubset(str: particlesTypes.jsonSubset) {
    return new Particle(JSON.parse(str))
  }

  static serializedParticleToParticle(particle: particlesTypes.SerializedParticle) {
    const language = new Particle()
    const atomDelimiter = language.atomBreakSymbol
    const particleDelimiter = language.particleBreakSymbol
    const line = particle.atoms ? particle.atoms.join(atomDelimiter) : undefined
    const newParticle = new Particle(undefined, line)
    if (particle.subparticles)
      particle.subparticles.forEach(subparticle => {
        newParticle.appendParticle(this.serializedParticleToParticle(subparticle))
      })
    return newParticle
  }

  static fromJson(str: particlesTypes.serializedParticle) {
    return this.serializedParticleToParticle(JSON.parse(str))
  }

  static fromGridJson(str: string) {
    const lines = JSON.parse(str)
    const language = new Particle()
    const atomDelimiter = language.atomBreakSymbol
    const particleDelimiter = language.particleBreakSymbol
    return new Particle(lines.map((line: any) => line.join(atomDelimiter)).join(particleDelimiter))
  }

  static fromSsv(str: string) {
    return this.fromDelimited(str, " ", '"')
  }

  static fromTsv(str: string) {
    return this.fromDelimited(str, "\t", '"')
  }

  static fromDelimited(str: string, delimiter: string, quoteChar: string = '"') {
    str = str.replace(/\r/g, "") // remove windows newlines if present
    const rows = this._getEscapedRows(str, delimiter, quoteChar)
    return this._rowsToParticle(rows, delimiter, true)
  }

  static _getEscapedRows(str: string, delimiter: string, quoteChar: string) {
    return str.includes(quoteChar) ? this._strToRows(str, delimiter, quoteChar) : str.split("\n").map(line => line.split(delimiter))
  }

  static fromDelimitedNoHeaders(str: string, delimiter: string, quoteChar: string) {
    str = str.replace(/\r/g, "") // remove windows newlines if present
    const rows = this._getEscapedRows(str, delimiter, quoteChar)
    return this._rowsToParticle(rows, delimiter, false)
  }

  static _strToRows(str: string, delimiter: string, quoteChar: string, newLineChar = "\n") {
    const rows: string[][] = [[]]
    const newLine = "\n"
    const length = str.length
    let currentAtom = ""
    let inQuote = str.substr(0, 1) === quoteChar
    let currentPosition = inQuote ? 1 : 0
    let nextChar
    let isLastChar
    let currentRow = 0
    let char
    let isNextCharAQuote

    while (currentPosition < length) {
      char = str[currentPosition]
      isLastChar = currentPosition + 1 === length
      nextChar = str[currentPosition + 1]
      isNextCharAQuote = nextChar === quoteChar

      if (inQuote) {
        if (char !== quoteChar) currentAtom += char
        else if (isNextCharAQuote) {
          // Both the current and next char are ", so the " is escaped
          currentAtom += nextChar
          currentPosition++ // Jump 2
        } else {
          // If the current char is a " and the next char is not, it's the end of the quotes
          inQuote = false
          if (isLastChar) rows[currentRow].push(currentAtom)
        }
      } else {
        if (char === delimiter) {
          rows[currentRow].push(currentAtom)
          currentAtom = ""
          if (isNextCharAQuote) {
            inQuote = true
            currentPosition++ // Jump 2
          }
        } else if (char === newLine) {
          rows[currentRow].push(currentAtom)
          currentAtom = ""
          currentRow++
          if (nextChar) rows[currentRow] = []
          if (isNextCharAQuote) {
            inQuote = true
            currentPosition++ // Jump 2
          }
        } else if (isLastChar) rows[currentRow].push(currentAtom + char)
        else currentAtom += char
      }
      currentPosition++
    }
    return rows
  }

  static multiply(particleA: Particle, particleB: Particle) {
    const productParticle = particleA.clone()
    productParticle.forEach((particle, index) => {
      particle.setSubparticles(particle.length ? this.multiply(particle, particleB) : particleB.clone())
    })
    return productParticle
  }

  // Given an array return a particle
  static _rowsToParticle(rows: string[][], delimiter: string, hasHeaders: boolean) {
    const numberOfColumns = rows[0].length
    const particle = new Particle()
    const names = this._getHeader(rows, hasHeaders)

    const rowCount = rows.length
    for (let rowIndex = hasHeaders ? 1 : 0; rowIndex < rowCount; rowIndex++) {
      let row = rows[rowIndex]
      // If the row contains too many columns, shift the extra columns onto the last one.
      // This allows you to not have to escape delimiter characters in the final column.
      if (row.length > numberOfColumns) {
        row[numberOfColumns - 1] = row.slice(numberOfColumns - 1).join(delimiter)
        row = row.slice(0, numberOfColumns)
      } else if (row.length < numberOfColumns) {
        // If the row is missing columns add empty columns until it is full.
        // This allows you to make including delimiters for empty ending columns in each row optional.
        while (row.length < numberOfColumns) {
          row.push("")
        }
      }

      const obj: particlesTypes.stringMap = {}
      row.forEach((atomValue, index) => {
        obj[names[index]] = atomValue
      })

      particle.pushContentAndSubparticles(undefined, obj)
    }
    return particle
  }

  // todo: cleanup. add types
  private static _xmlParser: any

  static _initializeXmlParser() {
    if (this._xmlParser) return
    const windowObj = <any>window

    if (typeof windowObj.DOMParser !== "undefined") this._xmlParser = (xmlStr: string) => new windowObj.DOMParser().parseFromString(xmlStr, "text/xml")
    else if (typeof windowObj.ActiveXObject !== "undefined" && new windowObj.ActiveXObject("Microsoft.XMLDOM")) {
      this._xmlParser = (xmlStr: string) => {
        const xmlDoc = new windowObj.ActiveXObject("Microsoft.XMLDOM")
        xmlDoc.async = "false"
        xmlDoc.loadXML(xmlStr)
        return xmlDoc
      }
    } else throw new Error("No XML parser found")
  }

  static fromXml(str: string) {
    this._initializeXmlParser()
    const xml = this._xmlParser(str)

    try {
      return this._particleFromXml(xml).getParticle("subparticles")
    } catch (err) {
      return this._particleFromXml(this._parseXml2(str)).getParticle("subparticles")
    }
  }

  static _zipObject(keys: string[], values: any) {
    const obj: particlesTypes.stringMap = {}
    keys.forEach((key, index) => (obj[key] = values[index]))
    return obj
  }

  static fromShape(shapeArr: int[], rootParticle = new Particle()) {
    const part = shapeArr.shift()
    if (part !== undefined) {
      for (let index = 0; index < part; index++) {
        rootParticle.appendLine(index.toString())
      }
    }
    if (shapeArr.length) rootParticle.forEach(particle => Particle.fromShape(shapeArr.slice(0), particle))

    return rootParticle
  }

  static fromDataTable(table: particlesTypes.dataTable) {
    const header = table.shift()
    return new Particle(table.map(row => this._zipObject(header, row)))
  }

  static _parseXml2(str: string) {
    const el = document.createElement("div")
    el.innerHTML = str
    return el
  }

  // todo: cleanup typings
  static _particleFromXml(xml: any) {
    const result = new Particle()
    const subparticles = new Particle()

    // Set attributes
    if (xml.attributes) {
      for (let index = 0; index < xml.attributes.length; index++) {
        result.set(xml.attributes[index].name, xml.attributes[index].value)
      }
    }

    if (xml.data) subparticles.pushContentAndSubparticles(xml.data)

    // Set content
    if (xml.childNodes && xml.childNodes.length > 0) {
      for (let index = 0; index < xml.childNodes.length; index++) {
        const child = xml.childNodes[index]

        if (child.tagName && child.tagName.match(/parsererror/i)) throw new Error("Parse Error")

        if (child.childNodes.length > 0 && child.tagName) subparticles.appendLineAndSubparticles(child.tagName, this._particleFromXml(child))
        else if (child.tagName) subparticles.appendLine(child.tagName)
        else if (child.data) {
          const data = child.data.trim()
          if (data) subparticles.pushContentAndSubparticles(data)
        }
      }
    }

    if (subparticles.length > 0) result.touchParticle("subparticles").setSubparticles(subparticles)

    return result
  }

  static _getHeader(rows: string[][], hasHeaders: boolean) {
    const numberOfColumns = rows[0].length
    const headerRow = hasHeaders ? rows[0] : []
    const AtomBreakSymbol = " "
    const ziRegex = new RegExp(AtomBreakSymbol, "g")

    if (hasHeaders) {
      // Strip any AtomBreakSymbols from column names in the header row.
      // This makes the mapping not quite 1 to 1 if there are any AtomBreakSymbols in names.
      for (let index = 0; index < numberOfColumns; index++) {
        headerRow[index] = headerRow[index].replace(ziRegex, "")
      }
    } else {
      // If str has no headers, create them as 0,1,2,3
      for (let index = 0; index < numberOfColumns; index++) {
        headerRow.push(index.toString())
      }
    }
    return headerRow
  }

  static nest(str: string, xValue: int) {
    const ParticleBreakSymbol = PARTICLE_MEMBRANE
    const AtomBreakSymbol = ATOM_MEMBRANE
    const indent = ParticleBreakSymbol + AtomBreakSymbol.repeat(xValue)
    return str ? indent + str.replace(/\n/g, indent) : ""
  }

  static getVersion = () => "107.0.1"

  static fromDisk(path: string): Particle {
    const format = this._getFileFormat(path)
    const content = require("fs").readFileSync(path, "utf8")
    const methods: { [kind: string]: (content: string) => Particle } = {
      particles: (content: string) => new Particle(content),
      csv: (content: string) => this.fromCsv(content),
      tsv: (content: string) => this.fromTsv(content)
    }

    if (!methods[format]) throw new Error(`No support for '${format}'`)

    return methods[format](content)
  }

  static fromFolder(folderPath: string, filepathPredicate = (filepath: string) => filepath !== ".DS_Store"): Particle {
    const path = require("path")
    const fs = require("fs")
    const particle = new Particle()
    const files = fs
      .readdirSync(folderPath)
      .map((filename: string) => path.join(folderPath, filename))
      .filter((filepath: string) => !fs.statSync(filepath).isDirectory() && filepathPredicate(filepath))
      .forEach((filePath: string) => particle.appendLineAndSubparticles(filePath, fs.readFileSync(filePath, "utf8")))
    return particle
  }
}

abstract class AbstractExtendibleParticle extends Particle {
  _getFromExtended(cuePath: particlesTypes.cuePath) {
    const hit = this._getParticleFromExtended(cuePath)
    return hit ? hit.get(cuePath) : undefined
  }

  _getLineage() {
    const newParticle = new Particle()
    this.forEach(particle => {
      const path = particle._getAncestorsArray().map((particle: AbstractExtendibleParticle) => particle.id)
      path.reverse()
      newParticle.touchParticle(path.join(SUBPARTICLE_MEMBRANE))
    })
    return newParticle
  }

  // todo: be more specific with the param
  _getSubparticlesByParserInExtended(parser: Function): Particle[] {
    return Utils.flatten(<any>this._getAncestorsArray().map(particle => particle.getSubparticlesByParser(parser)))
  }

  _getExtendedParent() {
    return this._getAncestorsArray()[1]
  }

  _hasFromExtended(cuePath: particlesTypes.cuePath) {
    return !!this._getParticleFromExtended(cuePath)
  }

  _getParticleFromExtended(cuePath: particlesTypes.cuePath) {
    return this._getAncestorsArray().find(particle => particle.has(cuePath))
  }

  _getConcatBlockStringFromExtended(cuePath: particlesTypes.cuePath) {
    return this._getAncestorsArray()
      .filter(particle => particle.has(cuePath))
      .map(particle => particle.getParticle(cuePath).subparticlesToString())
      .reverse()
      .join("\n")
  }

  _doesExtend(parserId: particlesTypes.parserId) {
    return this._getAncestorSet().has(parserId)
  }

  _getAncestorSet() {
    if (!this._cache_ancestorSet) this._cache_ancestorSet = new Set(this._getAncestorsArray().map(def => def.id))
    return this._cache_ancestorSet
  }

  abstract get id(): string

  private _cache_ancestorSet: Set<particlesTypes.parserId>
  private _cache_ancestorsArray: AbstractExtendibleParticle[]

  // Note: the order is: [this, parent, grandParent, ...]
  _getAncestorsArray(cannotContainParticles?: AbstractExtendibleParticle[]) {
    this._initAncestorsArrayCache(cannotContainParticles)
    return this._cache_ancestorsArray
  }

  private get idThatThisExtends() {
    return this.get(ParticlesConstants.extends)
  }

  abstract get idToParticleMap(): { [id: string]: AbstractExtendibleParticle }

  protected _initAncestorsArrayCache(cannotContainParticles?: AbstractExtendibleParticle[]): void {
    if (this._cache_ancestorsArray) return undefined
    if (cannotContainParticles && cannotContainParticles.includes(this)) throw new Error(`Loop detected: '${this.getLine()}' is the ancestor of one of its ancestors.`)
    cannotContainParticles = cannotContainParticles || [this]
    let ancestors: AbstractExtendibleParticle[] = [this]
    const extendedId = this.idThatThisExtends
    if (extendedId) {
      const parentParticle = this.idToParticleMap[extendedId]
      if (!parentParticle) throw new Error(`${extendedId} not found`)

      ancestors = ancestors.concat(parentParticle._getAncestorsArray(cannotContainParticles))
    }
    this._cache_ancestorsArray = ancestors
  }
}

class ExtendibleParticle extends AbstractExtendibleParticle {
  private _particleMapCache: { [id: string]: AbstractExtendibleParticle }
  get idToParticleMap() {
    if (!this.isRoot()) return (<AbstractExtendibleParticle>this.root).idToParticleMap
    if (!this._particleMapCache) {
      this._particleMapCache = {}
      this.forEach(subparticle => {
        this._particleMapCache[subparticle.id] = subparticle
      })
    }
    return this._particleMapCache
  }

  get id() {
    return this.getAtom(0)
  }
}

export { Particle, ExtendibleParticle, AbstractExtendibleParticle, ParticleEvents, ParticleAtom }
