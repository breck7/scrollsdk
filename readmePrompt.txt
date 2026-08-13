Below is the contents of this project/repo.

Generate a beautiful readme.md file from this.

```readme.scroll
header.scroll
permalink index.html
title ScrollSDK
printTitle
# Particles, Parsers, and other code for building Scroll

container 600px

- Scroll Homepage
 https://scroll.surf
- The World Wide Scroll
 https://wws.scroll.surf

# Tools
- Parser Designer
 designer/index.html
- Particles Sandbox
 sandbox/index.html

# Docs
- SDK Release Notes
 releaseNotes.html
- Particles Homepage
 https://particles.scroll.surf
- Particles FAQ
 https://faq.scroll.surf
- WWS Subreddit
 https://www.reddit.com/r/WorldWideScroll

# Tests
https://github.com/breck7/scrollsdk/actions/workflows/didTheTestsPass.yaml/badge.svg
 width 153px
 https://github.com/breck7/scrollsdk/actions/workflows/didTheTestsPass.yaml
- ScrollSDK Node Tests
 https://github.com/breck7/scrollsdk/actions/workflows/didTheTestsPass.yaml
- ScrollSDK Browser Unit Tests
 sandbox/test.html
- ScrollSDK Browser Perf Tests
 sandbox/perfTests.html

***

? What is this repo?
This repo contains the code for Particle Syntax and the Parsers Programming Language. These are the core layers upon which Scroll is built.

? Who is this for?
This repo is for advanced Scroll developers.

? How do I build Parsers?
You can try the Parsers tutorial.
 parsersTutorial.html Parsers tutorial

***

# Writing Parsers
This ScrollSDK contains two implementations of Parsers: one in TypeScript and one in Parsers.

You write Parsers to extend Scroll. By creating Parsers with the SDK you get a parser, a type checker, syntax highlighting, autocomplete, a compiler, and virtual machine for executing your version of Scroll. The ScrollSDK also includes a simple web IDE for writing Parsers called Parser Designer.
 designer/index.html Parser Designer

At this point in time, to make your Parsers do very useful things, you also need to use another language that you know. The ScrollSDK lets you create new languages using just Scroll or Scroll + Javascript. Parsers can include code from any programming language, not just Javascript. Though at the moment only Scroll + Javascript is supported.

***

# Using the ScrollSDK
The ScrollSDK currently includes a number of libraries and apps to use (scripts in the "products" folder).

# Basic Particles library for npm projects:
code
 const {Particle} = require("scrollsdk/products/Particle.js")
 const particle = new Particle("hello world")
 console.log(particle.asString)

# Basic Particles Library + Parsers for the browser:
code
 
 
 

## Particles Sandbox web app for exploring base Particles
code
 npm install .
 npm run local
 open http://localhost:3333/

## Parser Designer web app for building new Parsers
code
 npm install .
 npm run local
 open http://localhost:3333/designer

##  Build Tools
If you look at the source, you will also see a set of build tools (such as Builder and TypeScriptRewriter). These are currently undocumented and not recommended for external use.

## Building all tools and running tests
code
 npm run build
 npm test

***

# Monorepo
The ScrollSDK is a monorepo. With on average over 1 major version released each month for the past 2.5 years, it would take a lot of overhead to constantly be updating 10+ different repositories and modules every month. Once we're more confident in the theory and best practices, it might make sense to break this repo into independent modules.
That being said, we despise unnecessary dependencies as much as anyone. If anyone wants to create some automated submodules built from the projects in this monorepo, to allow for consuming of a smaller subset of the code and dependencies in this module, feel free to do so.

***

## Visualization of the code base
 https://mango-dune-07a8b7110.1.azurestaticapps.net/?repo=breck7%2Fscrollsdk Visualization
image images/diagram.jpg

***

# Development Status
All breaking changes are mentioned in the releaseNotes. We follow semantic versioning, so breaking changes should not happen if you stay on the same major version.
 releaseNotes.html releaseNotes

***

# Particles Libraries in Other Languages
If you build a Particles library/SDK in another language, let us know and we'll add a link.

If you are working on a Particles library in a new host language, feel free to post an issue or ask for help in the WWS subreddit.
 https://www.reddit.com/r/WorldWideScroll WWS subreddit

***

## How to bump versions
code
 npm run updateVersion NEW_NUMBER

***

# Former Name
Particles was originally called Tree Notation. Parsers was originally called Grammar.

***

# Alternatives Considered
This is the first Particles and Parsers libraries in existence, so there were no alternative implementations. Note and Space were predecessors to Particles. If a better alternative low level syntax to Particles is possible, it has yet to be discovered.

All that said, the important part of this repo is not the code but the design patterns. Particles is very simple, and you can implement the patterns contained here in your own code without using this library. In fact, that is often the best way to use Particles!

## Editing in Sublime Text
It is helpful to set `"goto_anything_exclude_gitignore": true` to ignore files in gitignore. Read more here.
 https://breckyunits.com/code/my-sublime-setttings.html here

# ❤️ Public Domain ❤️

footer.scroll

```
```releaseNotes.scroll
header.scroll
title Release Notes

printTitle

buildConcepts releaseNotes.csv releaseNotes.json releaseNotes.tsv
buildMeasures releaseNotesMeasures.tsv

Here's a list of the notable changes in the Scroll SDK.
 style text-align: center;
Download as CSV | TSV | JSON
 style text-align: center;
 link releaseNotes.csv CSV
 link releaseNotes.tsv TSV
 link releaseNotes.json JSON

br

node_modules/scroll-cli/microlangs/changes.parsers

thinColumns 4

📦 107.0.1 2025-04-09
🏥 updated ParsersCodeMirrorMode API to allow for multiple parsers.

📦 107.0.0 2025-04-08

This is a major release that moves Scroll from a multi-pass parser to a single pass parser.

# Particle
🎉 Added replaceWith method
🎉 Added appendFromStream method
🎉 Added appendBlocks method

# Parsers
🎉 Added registerParsers method
🎉 Added switchParserPool method
⚠️ BREAKING: removed unused methods `trainModel`, `predictSubparticles`, `predictParents`, `toBundle`, `toSublimeSyntaxFile`, `toStumpString`

# ScrollFileSystem
SFS is now lightweight and does not do macros, imports, or parsers. Those are now done in Scroll.
🎉 Added getFile to just get a file handle
🎉 Added makeRelativePath
🎉 Added setDefaultParserFromString
🎉 Added createReadStream
🎉 Added newFile method
⚠️ BREAKING: getCachedLoadedFilesInFolder is now getFusedFilesInFolderIfCached and getLoadedFilesInFolder is getFusedFilesInFolder.
⚠️ BREAKING: removed folderCache, parsedFiles, fuseFile, parsers, combineParsers, getParser, clearParserCache
⚠️ BREAKING: removed old method for creating a new file. Use newFile instead.
⚠️ BREAKING: removed fuse. Use singlePassFuse instead
⚠️ BREAKING: removed FusedFile interface
⚠️ BREAKING: getLoadedFile is now getFusedFile

📦 106.0.1 2025-03-29
🏥 code cleanup

📦 106.0.0 2025-03-28
⚠️ BREAKING: renamed Fusion to ScrollFileSystem and FusionFile to ScrollFile.
⚠️ BREAKING: Simplified implementation of what was formerly called Fusion.

📦 105.1.0 2025-03-24
🎉 Added support for macros that add multiple blocks

📦 105.0.1 2025-03-24
🏥 perf: fix async cache race condition in fusion

📦 105.0.0 2025-03-24
🎉 Simpler "block" API for using macros.
⚠️ BREAKING: (no one should be affected) instead of macros working with `[line, subparticles]` now its just `block: string`

📦 104.0.0 2025-03-24
🎉 Support for single pass macros
⚠️ BREAKING: (no one should be affected) old evalMacros code gone

📦 103.0.0 2025-03-23
🏥 perf: don't keep build outputs in memory.
⚠️ BREAKING: (no one should be affected) productCache now an array of strings

📦 102.0.0 2025-02-18
⚠️ BREAKING: (no one should be affected) removed Path.js and move the posix class to Utils.posix
⚠️ BREAKING: (no one should be affected) removed filename and folderPath from FusionFile class (can be derived)

📦 101.3.0 2025-02-18
🎉 Fusion: pass in filepath when creating a new Scroll file

Now when parsing a Scroll file you pass file metadata via the line parameter:
code
 new Scroll("h1 Hello world", filename)
We will likely also start passing in the file metadata (timestamp, for example) via that as well.
You may still have anonymous programs, they just will have "undefined" as their filename.
This makes it conceptually simpler that all Scroll programs have a location in space (a uri), and thus all particles/parsers in a program can access that information. We already were depending on that, just doing it via the hacky setFile method.

📦 101.2.1 2025-02-11
🏥 fusion parsers imports regression fix

📦 101.2.0 2025-02-11
🎉 Fusion: better perf

📦 101.1.1 2025-02-01
🏥 fix lineCount bug in sourcemaps
🏥 fix bug where calling insertLinesAfter with empty string wasnt inserting a line

📦 101.1.0 2025-02-01
🎉 Fusion: added makeSourceMap method

📦 101.0.0 2025-01-31
⚠️ BREAKING: (no one should be affected) renamed ParserCombinator to ParserPool
⚠️ BREAKING: (no one should be affected) renamed internal methods: _getParser > _getMatchingParser; _getParser > _getParserPool

📦 100.3.0 2025-01-24
🏥 catch circular import errors in Fusion

📦 100.2.0 2024-12-23
🎉 added murmurHash for cache use

📦 100.1.1 2024-12-16
🏥 escape left bracket in htmlCube

📦 100.1.0 2024-12-16
🎉 add `asSExpression` getter

📦 100.0.1 2024-12-07
🏥 fixed bug in Parsers where inline Parsers were not in scope in child Parsers

📦 100.0.0 2024-12-07
🎉 Finished migrating "keywordAtom" to "cueAtom"
⚠️ BREAKING: every `keywordAtom` is now `cueAtom`

📦 99.2.0 2024-12-04
🎉 Fusion now makes max 1 request per url

📦 99.1.0 2024-12-01
🎉 new `bitsRequired` method
🎉 started adding infra for built-in complexity measurements

📦 99.0.0 2024-11-30
🎉 Fusion now handles all 4 parser passes
⚠️ BREAKING: (no one should be affected). Fusion API changed. No longer any `parseCode` method.

📦 98.0.0 2024-11-29
🎉 Fusion now supports URL imports
⚠️ BREAKING: (no one should be affected). Lines that are just a URL to a Scroll file now will attempt an import.

📦 97.0.0 2024-11-29
# Fusion v2 Release
🎉 Fusion is now async. Needed to support in-browser imports.
🎉 new FusionFile class
⚠️ BREAKING: fusion API is now async. update all fuseFile to await fuseFile.

📦 96.0.0 2024-11-28
# Fusion v1 Release
🎉 added Fusion console to sandbox
🎉 basics of Fusion working in browser (async/url imports coming in next release)
⚠️ BREAKING: renamed ParticleFileSystem to Fusion
⚠️ BREAKING: assembleFile is now fuseFile
⚠️ BREAKING: assembledFile is now fusedFile
⚠️ BREAKING: afterImportPass is now fused

📦 95.0.1 2024-11-21
🏥 don't crash codemirror if error in parsers

📦 95.0.0 2024-11-19
🎉 Parsers autocomplete cleanup
⚠️ BREAKING: (no one should be affected) removed unused extensions and compilesTo parsers in Parsers

📦 94.2.0 2024-11-16
🎉 added support to import content to footer.
🎉 refactored import code to enable future advanced functionality. may cause temporary perf regression.

📦 94.1.0 2024-11-15
🎉 upgraded `parsers.parsers` for latest scroll

📦 94.0.0 2024-11-13
🎉 renamed parsers in `parsers.parsers` to clean up namespace for users
⚠️ BREAKING: some parsers in `parsers.parsers` have been renamed

📦 93.0.0 2024-11-02
🎉 import now replaced "import" particles with "imported" particles which includes subparticle on results
⚠️ BREAKING: if using import, you will now get imported particles inserted

📦 92.0.0 2024-11-02
🎉 changed import behavior for better source maps
⚠️ BREAKING: (no one should be affected) instead of stripping the import line, import now prepends "// imported " and keeps original import line.

📦 91.0.1 2024-10-30
🏥 fixed regex in PFS that was matching Parsers in the middle of the line, not just suffixes

📦 91.0.0 2024-10-21
🎉 add support for gracefully handling importing non-existant files

📦 90.1.0 2024-10-12
🎉 added `parserIdIndex`
🎉 `usesParser` now recurses

📦 90.0.0 2024-10-12
🎉 added `cue` setter
🎉 added `usesParser` method
⚠️ BREAKING: `firstAtom` is now called `cue` everywhere

📦 89.0.0 2024-10-12
⚠️ BREAKING: `crux`, a "temporary" word that lasted many years, is now "cue"

📦 88.0.0 2024-10-08
⚠️ BREAKING: `getIndex()` is now just `index`

📦 87.1.0 2024-10-02
🎉 added `section` getter
🎉 added `getParticles` alias to `findParticles`
🎉 added `isLast` getter
🎉 added `isFirst` getter
🎉 added `isBlank` getter

📦 87.0.0 2024-9-15
🎉 Reduced 2 concepts "cells" and "words" to one concept: atoms
⚠️ BREAKING: MAJOR Breaks! Roughly rename Cell > Atom. cell > atom. Word > Atom. word > atom.

📦 86.0.0 2024-9-14
🎉 Switched from "children" to the term "subparticles"
⚠️ BREAKING: Generally rename children > subparticles, child => subparticle
⚠️ BREAKING: childrenToString > subparticlesToString
⚠️ BREAKING: appendLineAndChildren > appendLineAndSubparticles
⚠️ BREAKING: getChildrenByParser > getSubparticlesByParser
⚠️ BREAKING: setContentWithChildren > setContentWithSubparticles
⚠️ BREAKING: setChildren > setSubparticles
⚠️ BREAKING: getChildren > getSubparticles
⚠️ BREAKING: getDelimitedChildrenAsParticles > getDelimitedSubparticlesAsParticles
⚠️ BREAKING: insertLineAndChildren > insertLineAndSubparticles
⚠️ BREAKING: predictChildren > predictSubparticles
⚠️ BREAKING: contentWithChildren > contentWithSubparticles
⚠️ BREAKING: getLineOrChildrenModifiedTime > getLineOrSubparticlesModifiedTime
⚠️ BREAKING: getChildInstancesOfParserId > getSubparticleInstancesOfParserId

📦 85.2.0 2024-9-5
🎉 Placeholder support in codemirror
🎉 More concise readme generation

📦 85.1.0 2024-9-4
🎉 Add underlying support for quickImports in Scroll/Parsers.

📦 85.0.0 2024-9-1
🏥 renamed a few remaining uses of "ScrollNotation" to Particles.

📦 84.0.0 2024-8-29
⚠️ BREAKING: This is a MAJOR rewrite of the ScrollSDK.
⚠️ BREAKING: Scroll Notation is now Particles
⚠️ BREAKING: Nodes/Trees are now referred to universally as Particles.
⚠️ BREAKING: EVERYWHERE the atom tree or node was used, now we use the atom particle.

📦 83.1.0 2024-8-26
🎉 Parsers: tag parsers for better documentation

📦 83.0.0 2024-8-26
🎉 Parsers: better documentation
⚠️ BREAKING: (no one should be affected) `frequency` in Parsers is now `popularity`

📦 82.0.0 2024-8-25
🎉 Parsers: better documentation
⚠️ BREAKING: (no one should be affected) removed `versionParser` parser from Parsers

📦 81.1.1 2024-8-25
🏥 npm fix

📦 81.1.0 2024-8-25
🎉 Parsers: better documentation
🎉 Parsers: remove long deprecated _extendsJsClass and _rootParserJsHeaderParser cruft

📦 81.0.0 2024-8-25
⚠️ BREAKING: `highlightScope` is now called `paint` globally
⚠️ BREAKING: removed `sortTemplate`. Use `sortIndex` in Scroll instead.

📦 80.5.0 2024-8-06
🎉 Parsers: added `getRunTimeEnumOptionsForValidation`

📦 80.4.0 2024-8-02
🎉 Parsers: add support for exponential notation to numberAtoms.

📦 80.3.0 2024-7-29
🎉 added `makeError` method to ParserBackedNode

📦 80.2.0 2024-7-10
🎉 now the ScrollSDK tools can be used straight from the WWS ~scroll/sdk/index.html

📦 80.1.1 2024-7-02
🏥 tfs fix

📦 80.1.0 2024-7-02
🎉 added getCTime and stats to ParticleFileSystem

📦 80.0.0 2024-6-19
⚠️ BREAKING: the `Grammar` language is now called `Parsers`. This is a massive change but a simple Grammar/Parsers and grammar/parsers find/replace should update any affected code.

📦 79.0.0 2024-6-18
🎉 ParticleFileSystem now supports atom parsers
⚠️ BREAKING: ParticleFileSystem now expects parsers to use the `.parsers` file extension instead of `.grammar`
⚠️ BREAKING: (no one should be affected) to use the previous "// parsersOnly" perf boost, end file in `.parsers`

📦 78.0.0 2024-5-30
🎉 jtree is now called the Scroll SDK
⚠️ BREAKING: jtree => scrollsdk
⚠️ BREAKING: Tree Notation is now called Particles

📦 77.1.1 2024-5-28
🏥 attempt a Windows bug fix

📦 77.1.0 2024-5-13
🎉 TL Designer can now take a `programUrl` as well.

📦 77.0.0 2024-5-08
🎉 `assembleFile` (formerly `evaluateImports`) is now faster by stripping Parser Definitions from assembled files, using them only in the returned parsers. (There are still many speed improvements to be had here)
⚠️ BREAKING: The `ParticleFileSystem.evaluateImports` method is now `ParticleFileSystem.assembleFile`, and the interface of the returned object has changed.

📦 76.2.0 2024-5-03
🎉 only ship bare minimum files in npm package

📦 76.1.0 2024-5-03
🎉 only ship bare minimum files in npm package

📦 76.0.0 2024-5-03
🎉 all remaining dependencies moved to `devDependencies`

📦 75.2.0 2024-5-03
🎉 fewer dependencies

📦 75.1.1 2023-5-11
🏥 add a `main` entry to package.json so `require.resolve` works

📦 75.1.0 2023-4-23
🎉 colorize TestRacer. ok = green, failed = red.

📦 75.0.0 2023-4-13
🏥 switch to Joyent's browserfied path module for TFS to allow for isomorphic path strings
⚠️ BREAKING: (No one should be affected)
 - If using TFS in the browser you also now need to include: `jtree/products/Path.js`

📦 74.3.1 2023-4-13
🏥 fix path bugs in TFS

📦 74.3.0 2023-4-13
🏥 better error messages in Disk to help track down a CI bug

📦 74.2.0 2023-4-12
🎉 new library: `ParticleFileSystem.broswer.js`

📦 74.1.1 2023-4-9
🏥 bug fix in TFS

📦 74.1.0 2023-4-9
🎉 Upstreamed the `imports` code from Scroll into the `ParticleFileSystem` package for other TreeLangs to reuse

📦 74.0.0 2023-4-3
This is purely a maintenance release. Unused code and npm packages were removed. The minimum supported NodeJS version is now 16.
⚠️ BREAKING: (No one should be affected)
 - Removed WWT. WWC is now in TrueBase
 - Remove JTable. Ohayo is only user but that should switch to Owid's CoreTable or similar.

📦 73.0.1 2023-4-2
🏥 fix regression in Designer app

📦 73.0.0 2023-4-2
This is a major release with significant name breaks. All logic is the same but methods have been renamed to better express the core idea of Languages as small simple parsers combined.
⚠️ BREAKING:
 - Tree Langauges:
  - grammarNode, hakonNode, etc. > grammarParser, hakonParser
 - Particle
  - createParser > createParserCombinator
  - getAncestorByNodeConstructor
  - Particle.Parser > Particle.ParserCombinator
  - getChildInstancesOfNodeTypeId > getSubparticleInstancesOfParserId
  - findAllNodesWithNodeType > findAllNodesWithParser
 - ParsersCompiler:
  - compileParsersFileAtPathAndReturnRootConstructor > compileParsersFileAtPathAndReturnRootParser
 - Parsers.ts:
  - rootNodeTypeDefinitionNode > rootParserDefinition
  - invalidNodeTypes > invalidParsers
  - getNodeTypeUsage > getParserUsage
  - asAtomTypeParticlesWithNodeConstructorNames > asAtomTypeParticlesWithParserIds
  - toPreludeAtomTypeParticlesWithNodeConstructorNames > toPreludeAtomTypeParticlesWithParserIds
  - asTreeWithNodeTypes > asTreeWithParsers
  - nodeTypeId > parserId
  - topNodeTypeDefinitions > topParserDefinitions
  - nodeTypeLineage > parserLineage
  - validConcreteAndAbstractParticleTypeDefinitions > validConcreteAndAbstractParserDefinitions
  - rootNodeTypeId > rootParserId
  - compileAndReturnRootConstructor > compileAndReturnRootParser
 - ParticleComponentFramework:
  - AbstractParticleComponent > AbstractParticleComponentParser
⚠️ BREAKING: See Grammar Release Notes for upgrading Grammar files
 link langs/grammar/releaseNotes.html Grammar Release Notes

📦 72.2.0 2023-3-31
🎉 improved `sortTemplate`. You can now use `sortKey` in addition to keywords.

📦 72.1.0 2023-3-31
🎉 work on `sortTemplate`.

📦 72.0.0 2023-3-31
🎉 new `cuePathAsColumnName` method on parser definition nodes
⚠️ BREAKING: downstreamed all SQLite methods to TrueBase, the only place where they were used and made sense.
⚠️ BREAKING: `concreteDescendantDefinitions` now recurses. use `concreteInScopeDescendantDefinitions` for old behavior.

📦 71.0.2 2023-3-30
🏥 fix perf regression

📦 71.0.1 2023-3-30
🏥 fix blob node regression

📦 71.0.0 2023-3-30
This was a refactor of Grammar to support scoped parsers. I also took the opportunity to switch more `get()` methods to getters.
🎉 Scoped parsers in Grammar 5
⚠️ BREAKING: A lot of methods that were formerly `getX()` have been changed to getters like `get x()`:
 - getTopDownArray > topDownArray
 - getNext > next
 - getPrevious > previous
 - getDefinition > definition
 - getNodeTypeId > nodeTypeId
 - getTableNameIfAny > tableNameIfAny
 - getEdgeSymbol > edgeSymbol
 - getAtomBreakSymbol > atomBreakSymbol
 - getNodeBreakSymbol > nodeBreakSymbol
 - On errors:
  - getMessage > message
  - getLineNumber > lineNumber
⚠️ BREAKING: A lot of zero parameter methods that were formerly `toX()` have been changed to getters like `get asX()`:
 - toString > asString (toString is maintained for compability with idiomatic Javascript)
 - toCsv > asCsv; toTsv > asTsv; toSsv > asSsv

📦 70.0.0 2023-3-28
⚠️ Big changes to Grammar. See the new Grammar Release Notes.
 link langs/grammar/releaseNotes.html Grammar Release Notes

📦 69.4.1 2023-3-11
🏥 fix bug in `Disk.writeObjectToDisk`

📦 69.4.0 2023-3-11
🎉 new util methods upstreamed: `Utils.isAbsoluteUrl`, `Particle.toFlatObject`, `Disk.recursiveReaddirSync`, `Disk.writeObjectToDisk`

📦 69.3.1 2023-3-7
🏥 fix bug in Utils getRandomCharacters

📦 69.3.0 2023-3-3
🎉 added `appendUniqueLine` method

📦 69.2.1 2023-3-2
🏥 `getCustomIndex` should return arrays of hits to work for non unique keys as well

📦 69.2.0 2023-3-2
🎉 added `getCustomIndex` fn

📦 69.1.0 2023-2-28
🎉 `runCommand` now also looks for commands on the parent class

📦 69.0.0 2023-2-23
⚠️ Breaking: `TrueBase` and `tql` are now in the repo `https://github.com/breck7/truebase` and npm package `truebase`.

📦 68.0.0 2023-2-22
⚠️ Breaking: Renamed TreeBase to TrueBase

📦 67.4.0 2023-2-19
🎉 TQL: added `selectAll` keyword

📦 67.3.0 2023-2-17
🎉 Particle: added `quickCache`
🎉 TrueBase: upstreamed work from pldb. New methods and getters are:

TrueBaseFolder:
loop
 atoms makeId getFile rename createFile searchIndex
 javascript `${item}`
 join  

TrueBaseFile:
loop
 atoms sort prettifyAndSave parsed updatePermalinks names linksToOtherFiles
 javascript `${item}`
 join  

TrueBaseServer:
loop
 atoms applyPatch validateSubmission
 javascript `${item}`

📦 67.2.0 2023-2-12
🎉 TrueBase: add `requestTimes.log`

📦 67.1.0 2023-2-10
🎉 Disk: add `writeIfChanged` method.

📦 67.0.0 2023-2-9
⚠️ TrueBaseServer: Refactored search routes. Downstreamed HTML rendering of Search Results Pages. Default just provides json, csv, and tree results now.

📦 66.1.0 2023-2-7
🏥 Grammar: fixed bug when sorting a root node.

📦 66.0.0 2023-2-7
⚠️ Legacy `products/jtree.browser.js` has been removed.
⚠️ Particle: This is the first of the *getter releases*. Start the long overdue switch to Javascript getters for `get` methods with zero params.
table
 printTable
 data
  Before After
  getParent() parent
  getContent() content
  getRootNode() root
  getAtoms() atoms
  getFirstAtom() firstAtom

📦 65.4.0 2023-2-6
🎉 Utils: Upstream `titleToPermalink` method from pldb

📦 65.3.0 2023-2-6
🎉 Grammar: upstreamed `sortFromSortTemplate` method from pldb

📦 65.2.0 2023-2-6
🎉 Particle: upstreamed `patch` method from pldb
🎉 Utils: upstreamed some methods from pldb

📦 65.1.0 2023-2-4
🎉 TQL: added `rename` keyword

📦 65.0.2 2023-2-3
🏥 TrueBaseServer: discovered morgan (thank god!) and now logging works.

📦 65.0.1 2023-2-3
🏥 TrueBaseServer: fix format of server log files

📦 65.0.0 2023-2-3
🎉 TrueBaseServer: added request logging.
⚠️ TrueBaseServer: ignore folder now required in constructor and not passed in `initSearch` or `listenProd` methods.

📦 64.4.0 2023-2-1
🎉 TQL: added `limit` keyword
🎉 TQL: added `oneOf` operator
🎉 TQL: added `title` and `description` fields
🎉 TQL: started readme

📦 64.3.0 2023-1-31
🎉 TQL: added support for nested dot paths like `github.stars`
🏥 TQL: various fixes.
🏥 Particle: renamed current `has` to `hasFirstAtom` and `has` now works correctly for deep paths.

📦 64.2.0 2023-1-31
🎉 TQL: Added `sortBy` and `reverse` keywords.
🎉 TrueBase: Added `csv`, `text`, and `scroll` output formats.

📦 64.1.0 2023-1-31
🎉 TQL: improved error handling

📦 64.0.1 2023-1-30
🏥 version number fix

📦 64.0.0 2023-1-30
This releases introduced a new language called Tree Query Language (TQL) for quering TrueBases. This release may have some bugs, you may want to wait before upgrading.

🎉 Grammar: constants are now available on the grammar definition nodes at runtime in addition to instance nodes.
⚠️ BREAKING: TrueBaseServer has been rewritten and basic search has been replaced by TQL search.

📦 63.0.0 2023-1-26
This is a major release that makes the code more modular and eliminates a lot of technical debt. In the past to simplify NodeJs+Browser isomorphism I created the `jtree` namespace and bundled everything together. This was a mistake. This release fixes that, and makes each subproject more independent. This should speed up future development.

⚠️ BREAKING: Replace all `jtree.getVersion()` with `Particle.getVersion()`
⚠️ BREAKING: `products/TreeNotationCodeMirrorMode.js` is now `products/ParsersCodeMirrorMode.js`
⚠️ BREAKING: The bundled file `jtree.browser.js` is now deprecated. That file will be kept for now (for external links) but will no longer be updated and will be removed in a future version. Include exactly what you need.
Before:
code
 
After: (to get everything that was previously in the bundle)
code
 
 
 
 

⚠️ BREAKING: The `jtree` namespace is no more. Include exactly what you need:
Before:
code
 const {jtree} = require("jtree")
 const tree = new jtree.Particle("hello world")
After:
code
 const {Particle} = require("jtree/products/Particle.js")
 const tree = new Particle("hello world")

📦 62.2.0 2023-1-12
🎉 removed jtree.node.js and added instructions for only importing the specific product needed directly.

📦 62.1.0 2023-1-12
🎉 new Node products to import directly from: Parsers.js, Particle.js, TestRacer.js, ParsersCompiler.js

📦 62.0.0 2023-1-11
⚠️ Removed Upgrader. In practice better handled by an external package which can have multiple versions of jtree as dependencies.
🎉 export `Utils` as top level export

📦 61.4.1 2023-1-8
🏥 TrueBase: search server fixes

📦 61.4.0 2023-1-7
🎉 added `Particle.fromFolder` method

📦 61.3.0 2023-1-7
🎉 new `list` getter on Grammar backed nodes returns an array of strings split by `listDelimiter`. Fallback is same behavior as if ` ` is the listDelimiter.
🏥 TrueBase: search results page now sets title meta tag
🏥 TrueBase: fixed highlight hit bug

📦 61.2.0 2023-1-5
🎉 Performance improvements to core (typed map method).

📦 61.1.0 2023-1-5
🎉 Performance improvements to core.

📦 61.0.1 2023-1-4
🏥 TrueBase: SearchServer now exported correctly

📦 61.0.0 2023-1-4
⚠️ Grammar: BREAKING: `contentDelimiter` is now `listDelimiter`
🎉 Grammar: New keyword `uniqueLine` to check for duplicate lines.

📦 60.0.0 2022-12-12
This is an unstable release. Please wait a few days for bug fix releases before using.

⚠️ BREAKING: TrueBaseServer is now exported from `trueBaseServer.node.js` and has been rewritten
⚠️ BREAKING: SearchServer is now exported from `trueBaseServer.node.js`
🎉 New class: `TrueBaseBuilder` and rewritten class `TrueBaseServer`

📦 59.1.2 2022-12-10
🏥 TrueBase: copy fix in search engine

📦 59.1.1 2022-12-03
🏥 TrueBase: bug fixes in `rank` and `webPermalink`

📦 59.1.0 2022-12-02
🎉 TrueBase: SearchServer now shipped in JTree

📦 59.0.0 2022-10-10
⚠️ BREAKING: removed CommandLine app 'jtree'

📦 58.0.0 2022-10-10
⚠️ BREAKING: removed AbstractBuilder
🏥 more path fixes for Windows users

📦 57.0.0 2022-10-10
⚠️ BREAKING: removed rarely commands from CLI app: 'usage', 'programs', 'allHistory', 'distribute', 'combined'

📦 56.0.1 2022-09-26
🏥 minor dependency bump

📦 56.0.0 2022-08-31
⚠️ BREAKING: removed the keyword `abstract` from Grammar Language. Grammar Language is now a suffix AND prefix language. The functionality of abstract node type definitions is identical, but now instead of flagging them with the `abstract` keyword, you need to ensure that the node type definition id begins with the atom `abstract`. This turned out to be the best design pattern already, so you may already do this, and then the migration step is simple—just delete all occurrences of `/^ abstract\n/` in your `*.grammar` files. In the rare chance you have any nodes that are not abstract whose id's begin with the prefix `abstract`, you will need to give those nodes a new id.

📦 55.1.1 2022-08-18
🏥 TrueBase: fixed error reporting bug.

📦 55.1.0 2022-08-02
🏥 TrueBase: fixed error reporting regression and added test.

📦 55.0.0 2022-08-02
🎉 TrueBase: grammarDir and row dir can now be different
⚠️ TrueBase: setDir and setGrammarDir must now be used instead of a constructor
⚠️ TrueBase: TrueBaseFile instances have the id as key; TrueBaseFolder handles mapping to filesystem
⚠️ TrueBase: grammar parsing now done at TrueBaseFile level
⚠️ TrueBase: removed atomCheckWithProgressBar; removed `_getDir` (use `dir`); removed toProgram; _getGrammarPaths is now grammarFilePaths
⚠️ TrueBase: typedMapShort is now typedMap
⚠️ TrueBase: define fileExtension in Grammar files (or programmatically)
⚠️ Grammar: toSQLiteInsertStatement now takes a string instead of function

📦 54.2.1 2022-07-27
🏥 Utils: linkify Wikipedia urls correctly

📦 54.2.0 2022-07-27
🎉 CLI: added serve command

📦 54.1.0 2022-07-25
🎉 Grammar: `contentDelimiter` property

📦 54.0.0 2022-07-24
🎉 TrueBase: typedMapShort, id, and dir
🎉 Grammar: typedMap
🎉 Grammar: contentKey, childrenKey, uniqueFirstAtom (may all be temporary), to support typedMap

📦 53.7.1 2022-07-20
🏥 Designer: shows root level required and dupe use errors

📦 53.7.0 2022-07-20
🎉 Grammar: `single` keyword in a parent nodeType now propogates to child nodeTypes

📦 53.6.0 2022-07-14
🎉 Grammar: perf improvement

📦 53.5.1 2022-07-12
🏥 Grammar: ship latest version

📦 53.5.0 2022-07-12
🎉 Grammar: add cueFromId

📦 53.4.0 2022-07-12
🎉 Core: add param to use toDelimited without escaping `tree.toDelimited("|", undefined, false)`

📦 53.3.0 2022-06-17
🎉 Grammar: toTypeScriptInterface includes descriptions now
🏥 Grammar: fix dumb bug in toTypeScriptInterface (+ test)

📦 53.2.0 2022-06-15
🎉 Grammar: toTypeScriptInterface method on grammar nodes
⚠️ methods with SqlLite had typo fix to SQLite
🏥 Core: fix bug where a deep `where` query with `notEmpty` operator would fail

📦 53.1.0 2022-01-18
🏥 Builder: larger buffer for jtree build
🏥 TrueBase: should not run trim when loading files

📦 53.0.0 2021-07-27
🎉 pcf: 60% faster rendering
🎉 pcf/stump: removed jquery dependency
🏥 designer & sandbox regression fixes
⚠️ stump: removed `setStumpNodeCss`
⚠️ pcf: by default html elements are now added w/o surrounding whitespace when mounted
⚠️ pcf: removed `setShadowCss`
⚠️ pcf: removed makeResizable, makeDraggable, makeSelectable, _getJQElement
⚠️ pcf: middle param to onShadowEvent dropped. use onShadowEventWithSelector instead.
⚠️ pcf: triggerShadowEvent, insertHtmlNode, getShadowCss, getShadowPosition implementations changed
⚠️ pcf: shadowHasClass, getShadowValue, triggerShadowEvent, addClassToShadow, removeClassFromShadow implementations changed
⚠️ pcf: onShadowEvent, offShadowEvent, toggleShadow, setShadowCss implementations changed
⚠️ pcf: getShadowOuterHeight, getShadowOuterWidth, getShadowWidth, getShadowHeight, getShadowOffset implementations changed

📦 52.1.0 2021-07-22
🏥 pcf bug fix

📦 52.0.0 2021-07-22
🎉 stump/pcf: ~200% faster when inserting lots of elements
🎉 pcf: added keyUpCommand support
⚠️ pcf: forceRepaint function now a no-op
⚠️ pcf: getWindowSize, getDocumentSize, setCopyHandler, setCutHandler, setResizeEndHandler implementation change
⚠️ pcf: getWillowBrowser is now "willowBrowser" getter
⚠️ pcf: getShadowElement is now "shadowElement" getter
⚠️ pcf: removed getShadowHtml

📦 51.7.0 2021-07-22
🎉 perf improvement in PCF—don't insert CSS nodes if no CSS

📦 51.6.0 2021-06-25
🎉 bumped pick, setProperties, getOneOf, and setPropertyIfMissing to root ParticleClass
⚠️ extract method on TrueBase is now "pick" on Particle

📦 51.5.1 2021-05-05
🏥 code cleanup in DD lang

📦 51.5.0 2021-03-26
🎉 silence() method on stamp

📦 51.4.0 2021-03-12
🎉 added hyphens prop to hakon

📦 51.3.0 2021-02-18
🎉 added break-inside CSS prop to hakon

📦 51.2.1 2021-02-13
🏥 removed leftover console.log

📦 51.2.0 2021-02-13
🎉 Core: expandLastFromTopMatter and lastMode methods
🎉 Stump now supports defining components

📦 51.1.0 2021-02-11
🎉 add missing CSS Grid properties to Hakon

📦 51.0.0 2021-02-08
⚠️ removed "prompt" node and executable stamps. Almost never used, and make it a lot more confusing to write Stamp libraries in other langs.

📦 50.2.0 2021-02-07
🎉 Stamp now creates file recursively
🎉 Stamp now accepts a target dir

📦 50.1.0 2021-02-07
🏥 bug fix in executing a stamp file

📦 50.0.0 2020-12-20
🎉 core: toJson, toGrid, toGridJson, fromJson and fromGridJson methods
🎉 sandbox: added share link and toJson and toGridJson consoles

📦 49.8.0 2020-03-01
🎉 jtable: getValues method on columns (use instead of accessing private _getSummaryVector method)
🏥 jtable: pivot column generation now operates in a more pass by copy manner and references to source columns are dropped
⚠️ unused method getSourceColumnName is now _getSourceColumnName

📦 49.7.0 2020-02-08
🎉 hasNode method in core
🎉 toProgram method on TrueBase

📦 49.6.1 2020-02-03
🏥 PCF save mouse event on click
🏥 getNextOrPrevious test and fix
⚠️ unused isShadowResizable method

📦 49.6.0 2020-01-24
🏥 windows return characters now stripped in fromDelimited methods

📦 49.5.0 2020-01-03
🎉 jtable: getMin, toVector, toMatrix, toNumericMatrix methods
🎉 nodesThatStartWith core method
🎉 started build server
🏥 clean column names method drop columns fix

📦 49.4.0 2019-12-12
🎉 fillMissing method
🏥 fix for Invalid Date

📦 49.3.0 2019-12-12
🎉 started trainModel, predictChildren and predictParents methods

📦 49.2.0 2019-12-11
🎉 JTable synthesizeTable and toSimpleSchema

📦 49.1.0 2019-12-09
🎉 isValueEmpty util method
🎉 JTable: renameColumns and cloneWithCleanColumnNames methods

📦 49.0.1 2019-12-09
🎉 JTable: seed param in Table class
🏥 JTable: first non-blank atom now used for column type prediction

📦 49.0.0 2019-12-08
🧹 general refactor to prep for switch to have Grammar entirely written in Grammar
🧹 generally use "products/" folder now to use compiled grammars instead of recompiling everytime
🎉 swarm and testRacer now prints number of skipped tests
🎉 examplesToTestBlocks method on grammar programs
🎉 command line app uses compiled grammar files more
⚠️ getRootConstructor is now compileAndReturnRootConstructor
⚠️ jtree.getProgramConstructor is now compileParsersFileAtPathAndReturnRootConstructor
⚠️ jtree.ParsersProgram is now jtree.HandParsersProgram
⚠️ getParsersProgram is now getHandParsersProgram
⚠️ _getRootNodeTypeDefinitionNode is now getRootNodeTypeDefinitionNode
⚠️ removed commandLineApp "create" command. Was broken. Use the Designer app instead.
⚠️ removed jtree.executeFiles
⚠️ removed all /langs/lang/lang.node.js files. Use /products/lang.nodejs.js instead.
⚠️ removed commandLineApp "runSync" method.
⚠️ removed jtree.executeFileSync and executeFile methods
⚠️ removed executeSync method on Core.
⚠️ removed default execute implementation on Core. Up to grammar to specify.
⚠️ jtree.makeProgram is now jtree.compileParsersAndCreateProgram
⚠️ jtree.formatFile is now jtree.formatFileInPlace and jtree.formatProgram is now jtree.formatCode
⚠️ removed getErrorsInGrammarExamples. Use examplesToTestBlocks

📦 48.1.0 2019-12-06
🎉 toSQLite method on TrueBase
🎉 getFrom core method

📦 48.0.0 2019-12-02
⚠️ PCF: removed AbstractParticleComponent.startApp and getDefaultStartState methods. Use startWhenReady and start() pattern instead.
⚠️ PCF: getNextOrPrevious is now on TreeUtils
⚠️ PCF: no more DataShadowEvents
⚠️ PCF: stumpOnClickCommand is now clickCommand, stumpOnBlurCommand is now blurCommand, stumpOnChangeCommand to changeCommand, stumpOnContextMenuCommand to contextMenuCommand, stumpOnShiftClickCommand to shiftClickCommand, stumpOnDblClickCommand to doubleClickCommand, stumpOnLineClick to lineClick, stumpOnLineShiftClick to lineShiftClick
⚠️ PCF: no longer exports WillowConstants
⚠️ PCF: getWillowProgram is now getWillowBrowser
⚠️ PCF: isLoaded() is now checked before calling particleComponentDidUpdate and particleComponentDidMount
⚠️ Stump: stumpCollapse is now collapse
⚠️ Stump: removed stumpNoOp. Empty lines are fine now.

📦 47.1.0 2019-11-29
🎉 pasteText and templateToString methods
🎉 blank lines are now okay in stump to work better with templates
🧹 Performance improvements via caching parsers

📦 47.0.0 2019-11-22
🎉 toAutoCompleteCube method
🎉 support for CSS variables in Hakon
🎉 fill method
🎉 toHtmlCube method
⚠️ getAllSuggestions is now toAutoCompleteTable
⚠️ removed getPoint. Use getIndentLevel and getLineNumber
⚠️ getAllAtomBoundaryCoordinates now returns type with members lineIndex and charIndex instead of y and x
⚠️ getAtomBoundaryIndices is now getAtomBoundaryCharIndices
🏥 getIndentLevel now returns correct level

📦 46.1.0 2019-11-22
🎉 Swarm tests now execute in browser

📦 46.0.0 2019-11-20
🎉 getCommandNames method on PCF
⚠️ removed AbstractCommander concept from PCF. Move methods with a Command suffix for methods on PCF classes.

📦 45.1.0 2019-11-20
🎉 PCF added getTextContent to ParticleComponent and getHash and setHash methods to WillowBrowser class
🎉 added deepVisit method to core

📦 45.0.1 2019-11-13
🏥 web form generation fixes

📦 45.0.0 2019-11-08
🎉 toDefinitionLineNumberParticles method added to Grammar programs
🎉 lengthen core method
🎉 added seeds to all psuedo-stochastic functions and removed all Math.random calls
🎉 toStumpString added to Grammar programs and webForm added to CLI
⚠️ getInPlaceAtomTypeParticles: toAtomTypeParticles, getInPlaceAtomTypeParticlesWithNodeConstructorNames: toAtomTypeParticlesWithNodeConstructorNames, getInPlaceHighlightScopeTree: toHighlightScopeTree, getInPlacePreludeAtomTypeParticlesWithNodeConstructorNames: toPreludeAtomTypeParticlesWithNodeConstructorNames
🏥 toSideBySide fix for when later trees are longer than earlier ones

📦 44.1.0 2019-11-05
🎉 added stamp command to commandLineApp tool
🎉 added produceProductFromInstructionsParticles and buildBuilder to abstractBuilder
🏥 bug where if a string contained __proto__  or constructor it was parsing incorrectly

📦 44.0.3 2019-11-02
🏥 in PCF rewrote queryObjectToQueryString to make working/testable in node

📦 44.0.2 2019-11-02
🏥 incorrect path in compiled grammars

📦 44.0.1 2019-11-02
🏥 some case insensitive filenames on Mac broke linux build
🏥 removed isDesktopVersion from PCF

📦 44.0.0 2019-11-01
🎉 toBraid and toSideBySide and toComparison methods
🎉 toStringWithLineNumbers method
🎉 loadRequirements, runTimePhaseError methods
🎉 selection methods
🎉 undo/redo/save methods
🏥 sweepercraft perf fix
🏥 table derived tables from column filtering fix
⚠️ removed "dirty" methods in ParticleComponentFramework. Update the lines is a better pattern.
⚠️ format() is now evalTemplateString()
⚠️ in Grammar: match is now "cue" for now
⚠️ getTopNodeTypeIds is now getTopNodeTypeDefinitions
⚠️ commandLineApp.prettify is now format
⚠️ changed getCssClassNames behavior in PCF
⚠️ in swarm: blockStringParam is now withParagraph. blockStringIs to assertParagraphIs, lengthIs:assertLengthIs, stringExcludes:assertStringExcludes, stringIncludes:assertStringIncludes, typeIs:assertTypeIs. constructWithBlockString to constructWithParagraph. arrangeTestSubject to arrange.
🧹 Created TestRacer and moved tests and swarm to that
🧹 builder will now look for compiled builder.js first
🧹 commandLineapp will now will first look for compiled grammar when executing a Tree program
🧹 removed qunit, tap, and tap mocha dependencies

📦 43.0.0 2019-10-07
⚠️ getYI is now getNodeBreakSymbol, getYIRegex is getNodeBreakSymbolRegex, getZI is getAtomBreakSymbol, getXI is getEdgeSymbol
🧹 PCF debugger work

📦 42.2.0 2019-10-04
🎉 getNumberOfAtoms method
🧹 added swim tests

📦 42.1.0 2019-10-03
⚠️ reverted the implicit event system. Made trigger and triggerAncestors public methods instead for finer control over events.

📦 42.0.0 2019-10-01
🎉 readded event listening code in Particle core class
🎉 onLineChanged, onDescendantChanged, onChildAdded, onChildRemoved methods
🎉 getAncestorByNodeConstructor method
🎉 TrueBaseServer exported class
⚠️ getMTime is now getLineModifiedTime, getChildArrayModifiedTime, and getLineOrChildrenModifiedTime
⚠️ startExpressApp in TrueBase is removed. Now use TrueBaseServer class instead.
⚠️ some default routes changed in TrueBase
⚠️ experimental generateSimulatedData methods are now synthesizeNode and synthesizeAtom
🧹 moved papers to treenotation/research

📦 41.2.0 2019-09-24
🎉 without method

📦 41.1.0 2019-09-18
🎉 error handling in PCF commands
🏥 uncaught command error displaying in Designer app
🏥 generateSimulatedData regression fix and tests

📦 41.0.0 2019-09-17
🎉 postfix atom parsing
🎉 omnifix atom parsing
🎉 atomParser keyword in Grammar Language
🎉 chuck demo lang demonstrating postfix atom parsing
🎉 improved Explain visualization on designer app
🏥 poop demo lang now implements omnifix
⚠️ removed _getGrammarBackedAtomArray method and replaced with new AtomParser class

📦 40.3.0 2019-09-16
🎉 added Arrow sample language
🎉 required and single nodeTypes are accessible to compiler string template
🎉 added wwt sample language
🎉 Github triangle and PCF debugger components
🎉 removeNonAscii util method
🏥 poop demo language now compiles to csv correctly
🧹 build fixes. No more manually fixing TypeScript build artifacts
🧹 wwt types
🧹 command line app now shows options when invalid command entered
🧹 ParticleComponentFramework work
🧹 builder improvements

📦 40.2.0 2019-09-11
🎉 getInPlacePreludeAtomTypeParticlesWithNodeConstructorNames
🎉 generateSimulatedData
🎉 designer app - simulate data and explain roots buttons
🎉 explain 2D visualizer in designer app
🏥 highlighting fix for regression caused by blank atoms fix
🏥 generateSimulatedData improvements
🧹 migrated Sandbox and Designer apps to PCF

📦 40.1.0 2019-09-08
🏥 missing atoms now trigger "MissingAtom" error instead of "InvalidAtom"
🏥 fixed bug in codemirror where a missing atom would break syntax highlighting of remaining atoms
🏥 bug fix in Disk
🏥 added GitHub link and show keyboard shortcuts by default in SweeperCraft

📦 40.0.0 2019-09-03
⚠️ removed "firstAtomType" property. Now you must specifically add a atom for the firstAtomType for keyword Languages. langs/grammar/GrammarUpgrader.ts should be able to automatically upgrade most grammars without manual intervention.
🎉 default highlightScopes for basic atomTypes
🏥 fixes from reducing complexity of ExtendibleParticle and firstAtomType

📦 39.6.0 2019-09-03
🎉 added jtable

📦 39.5.0 2019-09-01
🎉 added comments to hakon

📦 39.4.0 2019-08-31
⚠️ toReadme now generates Dumbdown instead of markdown
🎉 added dumbdown language
🎉 toReadme now generates roadmap from todos
🏥 fix for poop compile
🏥 fix for compiling with an empty stringTemplate

📦 39.3.0 2019-08-31
🎉 added "Explain" button to Designer
🎉 renamed poop node types

📦 39.2.0 2019-08-31
🎉 new layout for Designer app from feedback
🎉 show readme for Grammars in Designer app

📦 39.1.0 2019-08-30
🎉 added "config" sample language
🎉 added "poop" sample language

📦 39.0.0 2019-08-30
⚠️ we now export {jtree} instead of jtree. We removed all TypeScript export default.
🎉 added "map" demo language
🧹 refactored build system
🧹 moved Disk to products
🧹 removed tsconfigs
🧹 created products.scroll
🧹 started worldWideTypes folder
🧹 PCF tests now included in npm test

📦 38.2.0 2019-08-28
🎉 appendSibling base method
🎉 ParticleComponentFramework added to products
🎉 added SweeperCraft demo to products
🎉 added hakon and stump to products

📦 38.1.0 2019-08-23
🎉 errors.csv route to TrueBase

📦 38.0.1 2019-08-17
🏥 cleanup to bundle filenames
🏥 sample code fix in bundle files

📦 38.0.0 2019-08-17
🎉 toReadMe method on ParsersProgram
🎉 toBundle method on ParsersProgram
⚠️ removed "anyFirstAtom". Now just use "anyAtom"
🏥 anyAtom now always added to inferred grammar
🏥 various fixes to make inferring prefix grammars more robust
🧹 now run UnknownParsersProgram against all sample grammars
🧹 builder is now compiled into a product

📦 37.1.0 2019-08-10
🎉 support for inference of prefix languages with unicode characters (emojis)
⚠️ UnknownParsersProgram "getPredictedGrammarFile" is now "inferGrammarFileForAPrefixLanguage" to be more precise about what the method does

📦 37.0.0 2019-08-08
⚠️ No more "dist" folder. Use files in "/products/" folder instead.
🏥 Grammar inference (UnknownParsersProgram) now predicts base atom types
🧹 switched to TypeScript for all JS src files and test files.
🧹 new folders for each product
🧹 "products" folder. Currently checking in compiled versions as this makes distribution simpler. In the future maybe move products to separate repo.

📦 36.2.0 2019-08-01
⚠️ builder refactor. Instead "jbuild.js" now do "builder.js".

📦 36.1.0 2019-07-31
🧹 jBuild
🧹 improved error messaging for invalid nodeType.
⚠️ some method names changed in Project Language. See that readme for details.

📦 36.0.2 2019-07-30
🏥 TrueBase Disk path fix

📦 36.0.1 2019-07-30
🏥 TrueBase path fix

📦 36.0.0 2019-07-30
🎉 added TrueBase and "base" command to CLI
🎉 added methods to base class: getAtomsAsSet, appendAtomIfMissing, addObjectsAsDelimited, setSubparticlesAsDelimited, convertChildrenToDelimited, addUniqueRowsToNestedDelimited, with, getBiDirectionalMaps, getSparsity
🏥 fixed grammar concatenation bug where you might have 2 nodeTypes extending from RootNode
⚠️ removed nodeTypeOrder property from Grammar Language. Now just uses inScope order.
⚠️ getPrettified() is now "sortNodesByInScopeOrder().getSortedByInheritance()"
🧹 added basic tests for trueBase and made sure particleComponent framework test getting run
🧹 moved repo from breck7/jtree to treenotation/jtree

📦 35.1.0 2019-07-25
🎉 printLinesFrom and printLinesWithLineNumbersFrom methods
🏥 fix for npm install -g dependency issues

📦 35.0.1 2019-07-25
🏥 fixed uncaught error when an old grammar is used with a "root" subnode
🏥 more precise pattern matching in Grammar Language
🏥 improved highlight scopes for Grammar Language

📦 35.0.0 2019-07-24
🎉 "pattern" property on nodeType to support any type of "fix" notation: prefix, postfix, etc.
🎉 polymorphism and symbol tables via enumFromAtomTypes
🎉 Grammar Language now uses suffix notation instead of prefix notation for root node types.
🎉 in Grammar Language instead of `nodeType person` now do `personNode` and instead of `atomType int` do `integerAtom`
🎉 findAllAtomsWithAtomType and findAllNodesWithNodeType methods in Grammar Programs which are like our versions of "findAllReferences"
🎉 getAllTypedAtoms method in Grammar Programs
🏥 removed all "parsersPath" 2nd params to new jtree.ParsersProgram(grammarCode, gammarPath), since it is no longer used.
⚠️ Javascript code and compiler nodes that previously referred to atomTypes that have been renamed, must be updated manually
⚠️ Javascript code that previously referred to nodeTypeIds that have been renamed, must be updated manually (check uses of getChildInstancesOfNodeTypeId and doesExtend)
⚠️ lineHints string is different
⚠️ enumFromGrammar is now enumFromAtomTypes and accepts any atomTypeId
⚠️ atomTypes that ended in "Atom" now end in "Atom".
⚠️ removed public "getFirstAtomMap" method.
⚠️ removed "updateNodeTypeIds" method. Use findAllAtomsWithAtomType and findAllNodesWithNodeType
⚠️ use createParser() instead of getNodeConstructor

📦 34.2.0 2019-07-21
🎉 compiled nodejs grammar files are now executables and accept an input filepath
🏥 switched all hashbangs to "#! /usr/bin/env node" for better cross platform support

📦 34.1.0 2019-07-19
🎉 root nodes can now extend other root nodes for easier grammar combinations and extensions

📦 34.0.0 2019-07-16
🎉 the empty Grammar "" is now a valid Grammar and works properly
🎉 the default catch all node for Grammar Backed Languages is now Blob Node, and not Error Node
🏥 now the empty Grammar language returns a forgiving grammar by default.
🏥 now an empty nodeTypeId won't break the grammar parser
🏥 fixes for Download Bundle command
⚠️ getConcreteAndAbstractParticleTypeDefinitions is now getValidConcreteAndAbstractParticleTypeDefinitions
⚠️ the empty Grammar is now valid. Should not break anything but could allow for code removal.
⚠️ removed getTheAnyLanguageRootConstructor(). Just use the empty grammar now.
⚠️ the default catch all node is now Blob node, not error node.

📦 33.0.2 2019-07-15
🎉 added "infer" button to Grammar Builder
🏥 polyfill flat method
🏥 CLI fixes
🧹 upgrade version script

📦 33.0.1 2019-07-15
🏥 changed browser target to es2016 to fix the "flat" bug in Linux Chrome

📦 33.0.0 2019-07-10
⚠️ no more "constants" or "nodeTypeMap" exports in compiled. Now 1 export per grammar, of root language node. You can still access the others via that.
⚠️ removed runTimeFirstAtom methods. Now that grammars are compiled, just use normal firstAtom methods.
⚠️ removed unused getTheGrammarFilePath method
⚠️ compile to node/browser now saves a lang named "foo" to "foo.browser.js" instead of "fooLanguage"
🏥 prettify grammar files multiple inheritance sort fix and added regression test
🏥 getErrorsInGrammarExamples now prints correct source line where errors occur
🏥 fixed bug and added test where inScope was not extending correctly
🧹 removed dead code
🧹 compiled grammars are now much less code and rely on native JS class tree
🧹 compiled grammar vs runtime code paths are largely merged

📦 32.0.0 2019-07-07
🎉 getParseTable method on Grammar backed programs
🎉 CLI "parse" command
🏥 fixed blobNode and errorNode regressions
⚠️ removed getDoc
⚠️ no longer export BlobNode or ErrorNode
⚠️ toFormattedTable now adds ellipsis ("...") when columns overrun limit
⚠️ removed toNodeJsJavascriptPrettier and toBrowserJavascriptPrettier. Use compileParsersForNodeJs and compileParsersForBrowser w/prettier param instead.
🧹 fixed 2.5x test speed regression and got them back down to 2s

📦 31.0.0 2019-07-05
🎉 added "joinChildrenWith" atom to compiler nodeTypes in grammar language
🎉 added "dug" language which compiles to JSON
🎉 improved documentation for grammar compiler nodeTypes
🎉 in compiler nodes, and generated classes, you can now access the firstAtomType in this.atoms just like other atoms
🏥 fixed bugs in runtime extended nodeType constructor loading
⚠️ rarely used listDelimiter compiler property in Grammar Language is now "catchAllAtomDelimiter"
⚠️ Terminal vs NonTerminal nodeTypes are now determined by duck typing. Use GrammarBackedNonRootNode in place of those now.

📦 30.0.0 2019-07-03
🎉 much easier way to do Grammar Composition => simple concatenate strings & define a new nodeType as root!
⚠️ removed newFromCondensed method, which became a noOp. Use new ParsersProgram(grammarCode, parsersPath) instead
⚠️ removed "grammar" root node type in Parsers. Add a "root" property to a nodeType for the new root node.
⚠️ instead of "{parsersName}ProgramRoot" as the root class, the root class is now just "parsersName"
⚠️ paths to shipped language program constructors are now like "fire.js" instead of "FireProgram.js"

📦 29.0.0 2019-07-02
🎉 doesExtend and getChildInstancesOfNodeTypeId methods on Extendible nodes
🎉 GrammarUpgrader additions
🧹 refactor of Swarm/Stamp/Project/Jibberish/Stump to be 1 file.
⚠️ no more "constructors" node for nodeTypes or root programs.

📦 28.0.0 2019-07-02
🎉 "match" keyword in Grammar Language to use if you have a non-alphanumeric keyword as the first atom match
🎉 "reservedAtoms" attribute on atomTypes in Grammar Language
⚠️ removed "abstract" nodeType in Grammar Language. now its a property of nodeType
⚠️ compileParsers method is now compileParsersForNodeJs and compileParsersForBrowser
⚠️ nodeTypeId's now can only be alphanumeric
⚠️ nodeTypeId's are now identical to the generated Javascript class names. Some nodeTypeIds are now reserved and those now require using a "match" node
⚠️ atomTypeId's now can only be alphanumeric
⚠️ constants in Grammar Language alphanumeric
⚠️ removed "group" property on abstract nodeTypes. To achieve the same affect use a build script.
⚠️ "constructors" now no longer take a class name. The class name must be identical to nodeTypeId.

📦 27.2.0 2019-06-26
🎉 /sandbox/build/ => refactored Language IDE
🎉 added "New" simple grammar language template
🎉 added deep linking to /sandbox/build/
⚠️ removed undocumented BackupConstructor feature as IDE should no longer need it
🏥 stump compile fix

📦 27.1.0 2019-06-25
🎉 appendNode, select, where, limit, first, last, and print methods

📦 27.0.0 2019-06-23
🎉 simplified compile method to take 0 params
🎉 refactored Fire language
🎉 compilesTo property on grammar node in Parsers
🎉 perf fix for compiled languages
🏥 fire grammar fixes
🏥 compilation open and close children fixes
⚠️ you can now only have 1 target compilation language per grammar. If you want multiple targets just extend the grammar.
⚠️ "sub" compiler property is now "templateString"
⚠️ Fire experimental language changed a lot
⚠️ for internal use only makeGraphSortFunction util function is now _makeGraphSortFunction and method signature changed

📦 26.5.0 2019-06-23
🎉 todos in swarm
🏥 escaping backslash fix for compiled files
🧹 more testing of compiled code

📦 26.4.0 2019-06-23
⚠️ moved getLineHints back to definition node

📦 26.3.0 2019-06-23
🏥 extension bug in classes with more than 1 ancestor
⚠️ getNodeTypeDefintions is now getConcreteAndAbstractParticleTypeDefinitions

📦 26.2.0 2019-06-22
🏥 extends now works correctly
🎉 added "todo" nodeType to grammar language
🎉 added "extends" keyword in place of previous one line method
⚠️ instead of "nodeType/atomType foo extendsFoo" now do "nodeType foo\n extends extendsFoo"

📦 26.1.1 2019-06-21
🏥 support for mutliline strings in getConstantsObject

📦 26.1.0 2019-06-21
🎉 restored getConstantsObject on definition nodes

📦 26.0.2 2019-06-21
🏥 backtick escaping in getter generation
🏥 migrate constants in grammar updater
🎉 dump generated code for more information when something goes wrong

📦 26.0.1 2019-06-21
🏥 fixed require bug

📦 26.0.0 2019-06-21
- Warning: this was a major refactor that may have introduced new bugs, so if using please be ready to ping me with bug reports
🎉 ability to compile grammar files to Javascript
🎉 grammar sandbox now has "download bundle"
🎉 Upgrader class for making Language upgrades easier
🎉 added support for "tooling" directives in Grammar language
🎉 getFirstNode method
🎉 getNodeTypeId on NonRootRunTime nodes
🎉 findNodes in base can now take an array of first atoms
🎉 "nodeType javascript" property
🎉 add custom javascript to rootNodeTypes in grammar files
⚠️ stamp.js script is now stamp.cli.js
⚠️ removed "defaults" from grammar
⚠️ avoid getDefinition() when possible--use methods on nodes directly: getConstantsObject, getNodeTypeId, getLineHints,
⚠️ removed getExpectedLineAtomTypes--use getLineHints
⚠️ nodeTypes in grammar is now "inScope", and is one line instead of parent/children
⚠️ removed unused isLeafColumn, _getDuplicateLinesMap(), _getFirstAtomByIndex, toFlatTree
⚠️ fromJson is now fromJsonSubset and toJson is now toJsonSubset
⚠️ deprecating getExpanded. Now renamed to _expandChildren and now has a 3rd parameter.
⚠️ removed getCompiledProgramName
⚠️ getAncestorNodeTypeNamesArray is now getAncestorNodeTypeIdsArray
⚠️ getCatchAllAtomTypeName is now getCatchAllAtomTypeId
⚠️ getRequiredAtomTypeNames is now getRequiredAtomTypeIds
⚠️ getRunTimeNodeTypeNames is now getRunTimeFirstAtomsInScope
⚠️ removed getProgramErrorMessages. Use getAllErrors
⚠️ getFirstAtomType is now getFirstAtomTypeId
⚠️ getProgram() is now get getRootProgramNode and getProgram on grammar programs is getLanguageDefinitionProgram
⚠️ getParsersProgram is now getParsersProgramRoot
⚠️ getParsedAtoms removed
⚠️ getAtomTypeName is now getAtomTypeId
⚠️ getAtomTypeDefinition is now getAtomTypeDefinitionById
⚠️ getNodeTypeDefinitionByName is now getNodeTypeDefinitionByNodeTypeId
⚠️ getProgramErrors is now getAllErrors, getProgramErrorsIterator is now getAllErrorsIterator
⚠️ getCompiledIndentation, getCompiledLine, getCompilerNode are now protected
⚠️ removed "nodeType constructors javascript" in Parsers. Use "nodeType javascript" directly.
⚠️ no more getConstantsObject. No more "constants". Instead use "nodeType > boolean|int|string|float id value...". Adds getters to generated nodeType classes.
⚠️ in Parsers, use "stringAtom" instead of "string", "integerAtom" instead of "int", "floatAtom" instead of "float"
⚠️ no more "ErrorNode", "BlobNode", "Terminal/NonTerminal" built in constructors. BlobNode is no longer exported. Now use "baseNodeType" to specify a base node type.
⚠️ the nodeType name for each nodeType is now based on the nodeTypeId. It is no longer TerminalNode, NonTerminalNode, etc.

A regex for finding breaks in untyped code:

regexCode
 \b(defaults|getExpectedLineAtomTypes|nodeTypes|isLeafColumn|_getDuplicateLinesMap|_getFirstAtomByIndex|toFlatTree|fromJson|toJson|getExpanded|getCompiledProgramName|getAncestorNodeTypeNamesArray|getCatchAllAtomTypeName|getRequiredAtomTypeNames|getRunTimeNodeTypeNames|getProgramErrorMessages|getFirstAtomType|getProgram|getParsersProgram|getParsedAtoms|getAtomTypeName|getAtomTypeDefinition|getNodeTypeDefinitionByName|getProgramErrors|getCompiledIndentation|getCompiledLine|getCompilerNode|getProgramErrorsIterator)\b

📦 25.2.0 2019-05-30
🏥 Node.js fix for _getNow and renamed to _getProcessTimeInMilliseconds
🏥 Stump div is now no longer an inputType unless it has contenteditable

📦 25.1.0 2019-05-29
🎉 Added BlankLineError type.
🎉 Added inline syntax highlighting with error correction suggestions to grammar sandbox.
🎉 Added parameters hints for nodeTypes with required atoms in codeMirror
🎉 enabled using backup constructors in browser to allow Grammar Sandbox without access to constructor files
🎉 ErrorType messaging improvments

📦 25.0.0 2019-05-28
🎉 standardized error messages with suggested fixes!
🎉 added deleteAtomAt method
🏥 minor fixes to grammar sandbox and updated to use new error message code
⚠️ interface of errors changed, so code that uses getErrors, getErrorsInGrammarExamples, or getProgramErrors needs to change
🧹 refactored "types" file into "jTreeTypes"
🧹 removed unneeded npm packages
🧹 fixed TypeScript browser target build issues

📦 24.2.0 2019-05-27
🎉 extraAtom syntax highlighting
🎉 improved syntax highlighting for Hakon, Stump, and others

📦 24.1.0 2019-05-27
🎉 getAncestorNodeTypeNamesArray method on definition nodes
🎉 getNodeTypeLineage method on parsersPrograms
🎉 setAtoms, setAtomsFrom and appendAtom methods on base tree

📦 24.0.0 2019-05-21
🎉 targeting es2017
🏥 sandbox onload fix

📦 23.2.1 2019-05-21
🏥 fix for updateNodeTypeIds recursion bug

📦 23.2.0 2019-05-21
🎉 updateNodeTypeIds method
🎉 Swarm files now no longer require a root level setup node.
🧹 added prettier config to package.json
⚠️ in Swarm, createTestDummy is now getTestSubject
⚠️ Swarm grammar changed.

Use code below to update programs:

code
 swarmProgram.updateNodeTypeIds(`#setup arrange
 %%| constructWith
 %| blockStringParam
 =📦 lengthIs
 =+ stringIncludes
 =- stringExcludes
 == stringIs
 =| blockStringIs
 =~ typeIs
 #test test
 +#test testOnly
 -#test skipTest`)

📦 23.1.0 2019-05-21
🎉 executeFiles method
🎉 50% speed improvement in getExpanded and extend and ParsersProgram.newFromCondensed
⚠️ getGraphByKey is now getAncestorNodesByInheritanceViaExtendsKeyword
⚠️ getGraph is now getAncestorNodesByInheritanceViaColumnIndices

📦 23.0.1 2019-05-20
🏥 sublime syntax regression fix
🏥 small lang regression fixes

📦 23.0.0 2019-05-20
⚠️ highlightScope is now defined only on atomTypes (no longer on nodeTypes)
⚠️ "any" grammar nodeType property is now "blob", and jtree.AnyNode is now jtree.BlobNode
⚠️ grammars should all define a "atomType any" if they have leave any firstAtomTypes undefined
⚠️ getKeyword is now getFirstAtom, getKeywords is getFirstAtoms, hasDuplicateKeywords is now hasDuplicateFirstAtoms, setKeyword is now setFirstAtom, getKeywordPath is getFirstAtomPath, pathVectorToKeywordPath is pathVectorToFirstAtomPath, getKeywordMap is getFirstAtomMap, keywordSort is firstAtomSort
⚠️ in grammar, keyword is nodeType, catchAllKeyword is catchAllNodeType, keywords is nodeTypes, keywordOrder is nodeTypeOrder
⚠️ `def.getId` is now `def.getNodeTypeIdFromDefinition`, def.getTopNodeTypes is now def.getTopNodeTypeIds, def.getKeywordDefinitionByName is now def.getNodeTypeDefinitionByName, def.getRunTimeKeywordMap is now def.getRunTimeFirstAtomMap, def.getRunTimeKeywordNames is def.getRunTimeNodeTypeNames, def.getRunTimeKeywordMapWithDefinitions is def.getRunTimeFirstAtomMapWithDefinitions, def.isOrExtendsAKeywordInScope is def.isOrExtendsANodeTypeInScope, def.getKeywordInheritanceSet is def.getNodeTypeInheritanceSet, def.getSyntaxContextId is def.getSublimeSyntaxContextId
⚠️ program.getKeywordDefinitions is program def.getNodeTypeDefinitions, program.getKeywordUsage is now getNodeTypeUsage, program.getKeywordDefinitionByKeywordPath is program.getNodeTypeDefinitionByFirstAtomPath, program.getInvalidKeywords is program.getInvalidNodeTypes, program.getInPlaceSyntaxTreeWithNodeTypes is program.getInPlaceAtomTypeParticlesWithNodeConstructorNames, program.getInPlaceSyntaxTree is now program.getInPlaceAtomTypeParticles
⚠️ in stump, findStumpNodeByKeyword is now findStumpNodeByFirstAtom
⚠️ getLineSyntax is now getLineAtomTypes

📦 22.3.0 2019-05-16
⚠️ instead of FireProgram.js do Fire.js Program and same for Hakon and Numbers and Project and Stump and Swarm

📦 22.2.0 2019-05-16
⚠️ jtree.program is now jtree.programRoot
⚠️ renamed root program lang nodes so things like StumpProgram now refer to the grammar generated constructor and StumpProgramRoot to the program root instance
⚠️ instead of "index.js" files in the langs packages, we now have FireProgram.js, HakonProgram.js, ProjectProgram.js, StampProgram.js, StumpProgram.js, and SwarmProgram.js

📦 22.1.1 2019-05-16
🏥 missing constant

📦 22.1.0 2019-05-16
🎉 expand will append rather than set if a node is obviously not a map

📦 22.0.0 2019-05-15
🎉 Hakon, Stump and Fire languages moved into this repo, monorepo style
🎉 wrote grammars for Hakon and Stump
🎉 getNodesByGlobPath, every, hasLine, getNodesByLine, toggleLine methods
🎉 combineFiles method in node version with glob patterns
🎉 compile and execute button in grammar sandbox
🎉 basic browser module constructor loading in grammar sandbox
🏥 better reset functionality in grammar sandbox
⚠️ getSubparticlesByNodeType is now getSubparticlesByNodeConstructor
⚠️ extend now throws if attempting to extend with a non-map. Better solution to come.
⚠️ removed combine.js script
⚠️ ParsersProgram.predictGrammarFile is now new UnknownParsersProgram(input).getPredictedGrammarFile()
⚠️ instead of title or style tags in Stump use "titleTag" or "styleTag" to overcome the inherent attribute/tag html name conflict.
⚠️ no more @ prefix in Stump
⚠️ for Stump collapseNode, just have it, don't set it to "true"
⚠️ fire has been refactored a bit

📦 21.0.0 2019-05-04
🎉 getRunTimeEnumOptions method allows for run time autocomplete and run time validation
🎉 autocomplete for grammar atomTypes
🎉 grammar name keyword
🎉 atoms property on grammar non-root runtime nodes
🎉 makeGraphSort function. Also now used in grammar file prettification
⚠️ in grammar language: atomType to atomType, columns to atoms, catchAllColumn to catchAllAtomType
⚠️ removed ability in grammar files to have a atomType and keyword share the same name
⚠️ getGraph now requires a uniqueId column. Throws if you attempt to extend a non-unique id
⚠️ instead of "grammar parsersName" oneliner now use the grammar name keyword
⚠️ removed parseWith atomType property
⚠️ removed jtree.getLanguage. Instead do require('.../langs/...').
⚠️ in grammar keywordTable now enumFromGrammar
🏥 all atom types now have default regex of [^ ]* so no need to specify it
🏥 grammar code cleanup
🏥 small fixes to grammar sandbox
🧹 repo folder cleanup

📦 20.0.0 2019-04-30
🎉 simpler grammar files (no more @ prefix)
🎉 catchAllColumn grammar keyword
🎉 new methods shiftLeft, shiftRight, shiftYoungerSibsRight, split
🎉 new methods keywordSort, getPrettified
🎉 new method getCatchAllAtomTypeName
⚠️ the "@" prefix on grammar keywords has been removed
⚠️ for catch all columns use catchAllColumn instead of *
⚠️ getNodeColumnTypes is now getRequiredAtomTypeNames
⚠️ autocomplete help now only gets description and does not fall back to showing required columns
⚠️ removed getNodeColumnRegexes method

📦 19.5.1 2019-04-26
🏥 codeMirror autocomplete will now close if 1 option matching input text
🏥 fixed 0 autocomplete results when at position 0,0 on a blank line
🏥 fixed codeMirror bug in long documents

📦 19.5.0 2019-04-25
🎉 @example keyword in grammar
🎉 getErrorsInGrammarExamples method on ParsersProgram

📦 19.4.0 2019-04-24
🎉 getKeywordInheritanceSet method

📦 19.3.2 2019-04-23
🏥 better error handling for incomplete grammars

📦 19.3.1 2019-04-22
🏥 grammar checking of grammar files now only checks constructors if in correct env

📦 19.3.0 2019-04-22
🎉 autocomplete for atoms beyond keywords
🎉 new base methods nodeAtLine, getNodeInScopeAtCharIndex, getAtomIndexAtCharacterIndex, getAtomProperties, getAtomBoundaryIndices,   getAllAtomBoundaryCoordinates
🎉 on runtime programs: getAutocompleteAtomsAt and getAllSuggestions
🎉 getAutocompleteResults now provides descriptions, if present, along with completion atom
🏥 error highlight scope fixes
⚠️ instead of getAutocompleteAtoms use getAutocompleteAtomsAt

📦 19.2.1 2019-04-20
🏥 grammar sandbox bug on first visit

📦 19.2.0 2019-04-20
🎉 @highlightScope is now an enum for better checking and autocomplete
🎉 CodeMirror now uses @highlightScope for styles.
🏥 we sort @enum options to now match largest hit first
🏥 fixed cache bug in @keywordTable
⚠️ CodeMirror now uses @highlightScope for styles so colors may have changed.

📦 19.1.0 2019-04-20
🎉 custom constructors can now specify a "." nested path to the JS constructor
🎉 added error printing in Grammar sandbox

📦 19.0.0 2019-04-19
🎉 CodeMirror support
🎉 Language Sandbox webpage using CodeMirror
🎉 in Grammar files we now have support for different constructors for node and browser environments
⚠️ in grammar files @constructor is now @constructors. Browser and nodejs constructors must be specified separately.

📦 18.2.0 2019-04-11
🎉 very basic toYaml method

📦 18.1.3 2019-03-26
🎉 more TypeScript typings

📦 18.1.2 2019-03-25
🎉 more TypeScript typings

📦 18.1.1 2019-03-25
🏥 added "types" field to package.json

📦 18.1.0 2019-03-25
🎉 now with d.ts files

📦 18.0.0 2019-03-24
🎉 basic .sublime-syntax file generation works. Scopes not yet integrated.
🎉 added gen command to cli.js for generating syntax files
🎉 added @highlightScope property to @keyword and @atomType in grammar language
🎉 added @required feature to grammar with appropriate error messages
🎉 added @single feature to grammar with appropriate error messages
🎉 added @tags feature to grammar
⚠️ @atomType > @regex with `.?` should now be `.*`
⚠️ in @atomType > @regex now all @regex are enclosed by ^$ automatically
⚠️ AbstractGrammarDefinitionNode: getDefinitionByName is now getKeywordDefinitionByName
⚠️ _isOrExtendsAKeywordInScope is now isOrExtendsAKeywordInScope

📦 17.1.3 2019-03-14
🏥 added support for constructors with nested paths in grammar languages in browser

📦 17.1.2 2019-03-14
🏥 added support for spaces in filenames in langs-project

📦 17.1.1 2019-03-13
🏥 circular array check false positives when creating tree from Javascript object.

📦 17.1.0 2019-03-13
⚠️ getCatchAllNodeClass is now getCatchAllNodeConstructor
⚠️ getRunTimeCatchAllNodeClass is now getRunTimeCatchAllNodeConstructor
🏥 catchAllKeywords can now instantiate a custom class
🎉 checking a grammar programmatically now throws an error a constructor path in a grammar file does not exist
🧹 added tap-mocha-reporter for clearer test run output

📦 17.0.0 2019-03-11
⚠️ In Particle, parseNodeType is now getNodeConstructor
⚠️ jtree.getParser is now jtree.getProgramConstructor
⚠️ In .grammar files @parser is now @constructor
⚠️ In grammar JS getParserClass is now getDefinedConstructor
⚠️ In grammar JS getRootParserClass is now getRootConstructor
🎉 moved BrowserScript and swarm, project and stamp languages into this project to avoid circular dependencies
🎉 (temporary) getLanguage method for accessing included languages
🎉 error message when you have an inheritance loop in grammar file
🏥 line number error message regression fix
🧹 minor CLI app refactor

📦 16.0.1 2019-03-03
🏥 minor migration fix

📦 16.0.0 2019-03-03
🧹 migrated to TypeScript

📦 15.3.0 2019-03-01
🎉 for convenience added map, forEach, filter, find and slice methods aliasing getSubparticles().map ...
🎉 sortByColumns method
🎉 predictGrammarFile method
🎉 getInvalidKeywords method
🎉 @abstract keyword in grammars
🎉 @any keyword in grammars
🎉 any, bit, bool, float, int default atom types
🎉 toDisk method in node.js version
🎉 getOneHot method
🎉 deleteColumn method
🎉 getColumnNames method
🎉 isBlankLine method
🎉 isEmpty method
🎉 deleteChildren method
🎉 deleteDuplicates method
🎉 deleteBlanks method
🎉 getNodesByRegex method
🎉 fromShape method
🎉 getFiltered method
🎉 added sample of iris dataset to static Particle for handy testing and exploring
🏥 renameAll fix
⚠️ getExpanded - if multiple parent nodes match, getExpanded will extend node with matching keyword
⚠️ getProgramErrors() is now getProgramErrorMessages(). getProgramErrors() now returns err objects
🧹 makeRandomParticles method & updates to perf test pages
🧹 Default sandbox port now 3333

📦 15.2.0 2019-02-10
🎉 added `getNumberOfLines` method
🎉 ParsersProgram speedup 20%+
🎉 getProgramErrors speedup 10x+
🎉 toString speedup 5%+

📦 15.1.0 2019-02-10
🎉 10x+ faster typechecking of "any" nodes
🎉 60% faster typechecking of other types
🎉 50% faster parsing for large trees
🧹 sandbox cleanup
🎉 added getProgramErrorsIterator() method
🎉 experimental _getSyntaxTreeHtml() method

📦 15.0.2 2019-02-07
🏥 setSubparticles wasn't clearing cache
🏥 findNodes wasn't recursing

📦 15.0.1 2019-01-02
🏥 Chrome wasn't always monotonically increasing perf.now due to precision

📦 15.0.0 2018-12-01
🎉 added toDataTable and fromDataTable methods
🎉 added getSlice method
🎉 added set method (to revert to original get/set behavior)
⚠️ renamed findBeam to get
⚠️ renamed getBeam to getContent
⚠️ renamed getBeams to getContentsArray
⚠️ removed undocumented getRest method
🧹 renamed "garden" to "sandbox" for clarity
🧹 moved "papers" to one folder

📦 14.6.0 2018-09-23
🏥 Fix for browsers removing monotonically increasing perf.now
🎉 getSubparticles() now returns a copy of array enabling in loop deletes

📦 14.5.1 2017-11-24
🧹 removed dead code

📦 14.5.0 2017-11-23
🎉 standardized error messages into a grammar
🎉 @parseWith atomType property

📦 14.4.0 2017-11-19
🎉 added @enum atomType

📦 14.3.3 2017-11-17
🎉 added toMarkdownTable methods

📦 14.3.2 2017-11-16
🎉 getNodesByLinePrefixes method

📦 14.3.1 2017-11-14
🎉 cases cli command

📦 14.3.0 2017-11-13
🎉 added macroExpand method
🎉 hasAtom method

📦 14.2.0 2017-11-12
🎉 added @version keyword to grammar
🧹 renamed TreeGrammar.grammar to grammar.grammar
🧹 removed ohayo constants

📦 14.1.0 2017-11-11
🎉 split check into check and checkAll commands
🎉 compile cli command can now take a target extension

📦 14.0.1 2017-11-11
🧹 Moved dependencies to devDependencies

📦 14.0.0 2017-11-10
⚠️ renamed otree to jtree

📦 13.0.0 2017-11-09
⚠️ Tree Grammar switched to @atomType nodes for defining atom types, no more implicit types
⚠️ replaceNode now returns an array

📦 12.2.1 2017-11-09
🏥 bug fix in getExpanded

📦 12.2.0 2017-11-09
🎉 insertAtom method
🏥 fixes to usage reports
⚠️ renamed getBeamParameters to getNodeColumnTypes

📦 12.1.0 2017-11-09
⚠️ getAtomTypeLine is now getLineSyntax
⚠️ getProgramAtomTypeString is now getInPlaceSyntaxTree
🎉 getTreeWithNodeTypes and getInPlaceSyntaxTreeWithNodeTypes methods for inspecting the parse

📦 12.0.0 2017-11-09
⚠️ grammar file grammar change, first node should be @grammar, keywords should be @keyword
⚠️ getGraph now takes 2 params, use getGraph(0, 1) for previous behavior
⚠️ getExpanded now takes 2 params, use getExpanded(0, 1) for previous behavior
🎉 getNodeByColumn method

📦 11.5.0 2017-11-08
🎉 appendLine method
🎉 insertLine method
⚠️ append is now appendLineAndSubparticles
⚠️ insert is now insertLineAndChildren
⚠️ prepend is now prependLine and takes only 1 param
⚠️ copyTo now requires second arg
⚠️ toOutline now takes 0 args. use toMappedOutline to pass a mapping fn
⚠️ fromCsv, fromSsv, fromTsv no longer take optional hasHeaders param. Use new fromDelimitedNoHeaders
⚠️ fromDelimited now requires quoteChar param
⚠️ toTable now accepts 0 params, use toFormattedTable to pass params
⚠️ getPoint now takes no params, use getPointRelativeTo; getPathVector => getPathVectorRelativeTo
⚠️ getKeywordPath now takes no params, use getKeywordPathRelativeTo
⚠️ getStack, getRootNode now take no params
⚠️ getAtoms now takes 0 params. use getAtomsFrom
⚠️ use getGraphByKey to getGraphByKey

📦 11.4.1 2017-11-08
🎉 export ParsersProgram

📦 11.4.0 2017-11-08
⚠️ getGrammarUsage is now getKeywordUsage
⚠️ removed undocumented getNodeClasses, run, and getErrorCount methods

📦 11.3.0 2017-11-07
🎉 added support for putting multiple parse nodes in one file

📦 11.2.3 2017-11-06
🧹 TestCoverage 90.44% Smt 2137/2363 72.32% Brnch 384/531 85.37% Fn 496/581 91.89% Loc 2017/2195

📦 11.2.2 2017-11-06
🧹 updated ProjectLang

📦 11.2.1 2017-11-06
🏥 path fixes

📦 11.2.0 2017-11-06
⚠️ otree.getProgramClassFromGrammarFile is now otree.getParser
⚠️ otree.AbstractGrammarBackedProgram is now otree.program

📦 11.1.0 2017-11-06
🏥 path and other fixes from otree move

📦 11.0.0 2017-11-06
⚠️ renamed TreeProgram to otree

📦 10.1.2 2017-11-06
🧹 rearranged code into base node and grammar backed folders

📦 10.1.1 2017-11-05
🎉 started Tree Garden web console
🏥 Fixed create command line tool

📦 10.1.0 2017-11-04
🏥 parsing top level program class fix
🏥 getNodeByColumns now works when search and target have different 📦 of columns
🧹 started tests for console, static, and grammar classes

📦 10.0.1 2017-11-03
🏥 static method path bug fixes

📦 10.0.0 2017-11-03
🎉 getNodeByColumns method
⚠️ grammar file is now primary file, use static getProgramClassFromGrammarFile method to create a VM/compiler
⚠️ languages.tree => grammars.tree
⚠️ grammars.tree now points to grammar files, not index files

📦 9.2.0 2017-11-03
⚠️ TreeProgram.getGrammarErrors => TreeProgram.Tools.getGrammarErrors
⚠️ TreeProgram.executeFile => TreeProgram.Tools.executeFile
🧹 cleanup for making grammar files source of truth

📦 9.1.0 2017-11-02
🎉 refactored Tree Grammar to support compiler-compilers and vms in languages other than ES6
⚠️ "@parseClass" => "@constructor js"
🏥 @ char is now acceptable in filepaths

📦 9.0.0 2017-11-02
🎉 support for multiple compile targets
🎉 CLI history command can show all history
🎉 CLI check command now alternately accepts a language extension to check a collection
⚠️ @targetExtension => @compiler, @compiled => @sub, @compiledIndentCharacter => @indentCharacter
⚠️ @sub, @indentCharacter, @listDelimiter, @openChildren, @closeChildren moved under @compiler
⚠️ compile method now requires a target extension
🧹 renamed slot types to columnTypes and better error messaging for when graph expansion fails

📦 8.6.0 2017-10-30
⚠️ renamed @parameters to @columns in Grammar Language

📦 8.5.0 2017-10-30
🎉 New usage command line tool
🎉 New getGrammarUsage method

📦 8.4.1 2017-10-28
🏥 init the languages and history file on cli first use
🧹 added a tiny bit of documentation to readme

📦 8.4.0 2017-10-28
🎉 added getNodeClasses method to TreeProgram to support multiple node classes in 1 file

📦 8.3.1 2017-10-28
🏥 expose TerminalNode and NonTerminalNode in browser distribution

📦 8.3.0 2017-10-27
🎉 replaceNode method
🎉 getSiblings, getYoungerSiblings, getOlderSiblings methods

📦 8.2.3 2017-10-27
🎉 export TreeTerminalNode class
🧹 minor cleanup of cli app

📦 8.2.2 2017-10-26
🧹 recursive dependency fix and console code cleanup

📦 8.2.1 2017-10-26
🎉 support absolute paths in grammar files

📦 8.2.0 2017-10-26
🎉 export TreeNonTerminalNode class
🎉 support for relative paths in grammar files

📦 8.1.0 2017-10-25
⚠️ renamed fixedWidthTable method to toTable and changed default to left aligned.

📦 8.0.1 2017-10-15
🏥 fixed browser version

📦 8.0.0 2017-10-15
🎉 Create new Languages using a tree grammar file
🎉 Tree Console app
⚠️ ImmutableNode no longer exposed on TreeProgram

📦 7.2.0 2017-10-14
⚠️ for use in browser, now use treeprogram.browser.js instead of treeprogram.js
🧹 prep work for grammar and blaze library merger -- consoleApp and src directory

📦 7.1.1 2017-9-17
🎉 getErrors and getAtomTypeLine methods
🏥 fix for executeFile static method when more than one #! line.

📦 7.1.0 2017-9-15
⚠️ Symbol is now Keyword throughout. Same changes at 7.0.0, except substitute keyword for symbol.

📦 7.0.0 2017-9-14
⚠️ getNodeTypes is now getSymbolMap
⚠️ getDefaultNodeType is now getCatchAllNodeClass
⚠️ getBase is now getSymbol
⚠️ getBasePath is now getSymbolPath
⚠️ getBases is now getSymbols
⚠️ pathVectorToBasePath is now pathVectorToSymbolPath
⚠️ setBase is now setSymbol

📦 6.1.3 2017-9-8
🎉 added executeSync method
🧹 removed outdated ETNs
🧹 switched to Tap from Tape to get code coverage working again with nyc

📦 6.1.2 2017-9-6
🏥 bug fix in getCMTime

📦 6.1.1 2017-8-27
🎉 added getExpanded method

📦 6.1.0 2017-8-25
🎉 added getDefaultNodeType and getNodeTypes methods
🎉 added default compile method
🏥 updated outdated code in readme

📦 6.0.0 2017-8-24
⚠️ Renamed TreeNotation to TreeProgram.
⚠️ github is now at breck7/treeprogram
⚠️ npm install treenotation is now npm install treeprogram
🏥 fixed timing bug in getTreeMTime

📦 5.7.0 2017-8-24
🎉 getAtom can now take a negative int
🎉 added static method executeFile and cli.js

📦 5.6.2 2017-8-20
🏥 child nodes can now inspect their parent's line at parse time to enable dependent types

📦 5.6.1 2017-8-20
🏥 stale index when using setLine or setBase methods

📦 5.6.0 2017-8-18
⚠️ base execute now returns a Promise.all that resolves when all children have resolves
🎉 Added getIndentation method

📦 5.5.0 2017-8-8
🎉 Added getTreeMTime method

📦 5.4.0 2017-8-8
⚠️ getMTime now always returns a number (previously it could return undefined). Initializes lazily on first call.

📦 5.3.0 2017-8-3
🎉 Added nest static method

📦 5.2.0 2017-8-1
🎉 Added getInheritanceTree method

📦 5.1.0 2017-7-25
🎉 Added "relativeTo" parameter to: getPoint, isRoot, getRootNode, getStack, getStackString, getBasePath, getPathVector

📦 5.0.1 2017-7-24
🏥 getBasePath works

📦 5.0.0 2017-7-24
⚠️ getWI is now getZI for consistency with X,Y,Z convention.
⚠️ getHead is now getBase
⚠️ setHead is now setBase
⚠️ pathVectorToPathName is now pathVectorToBasePath
⚠️ getPathName is now getBasePath
⚠️ getTail is now getBeam
⚠️ setTail is now setBeam
⚠️ findTail is now findBeam
⚠️ pushTailAndChildren is now pushBeamAndChildren
⚠️ getTailWithChildren is now getBeamWithChildren
⚠️ setTailWithChildren is now setBeamWithChildren
⚠️ getTails is now getBeams

📦 4.1.2 2017-6-26
🎉 Added setAtom method

📦 4.1.1 2017-6-26
🏥 Bug fix in getPoint method

📦 4.1.0 2017-6-20
⚠️ removed toJavascript method on base class.

📦 4.0.3 2017-6-20
🏥 Reverted last.

📦 4.0.2 2017-6-20
🏥 Fix so Hakon works in browser

📦 4.0.1 2017-6-20
🎉 Added HTML, CSS and Unit Testing ETNs (I named them Bray, Hakon, and Wall).

📦 4.0.0 2017-6-18
⚠️ removed _getSize if any ETNs were using that
⚠️ changes some output classes in toHtml() method
🎉 getAtoms() now takes an optional starting WI location
🎉 Final version of paper, mistakes and all.

📦 3.10.0 2017-6-17
⚠️ getAncestorNodes is now getStack
🎉 Added getStackString method

📦 3.9.2 2017-6-17
🎉 getGraph method now also takes 0 params, in which case it uses atom1.

📦 3.9.1 2017-6-17
🎉 Added getGraph method

📦 3.9.0 2017-6-16
⚠️ Removed Particle.ExecutableParticle. TreeNotation now has execute method by default.
⚠️ getAtom now ignores getSize. In fact, we'll probably ditch getSize.

📦 3.8.0 2017-6-15
🎉 toOutline now takes an optional mapping fn

📦 3.7.4 2017-6-15
🏥 setTailWithChildren Regression fix.

📦 3.7.3 2017-6-15
🏥 Fix for closure compiler

📦 3.7.2 2017-6-15
🏥 setSubparticles regression fix

📦 3.7.1 2017-6-15
🏥 ETN parsing regression fix

📦 3.7.0 2017-6-15
⚠️ expose TreeNotation now and not Particle
⚠️ Particle.ExecutableParticle is now TreeNotation.ExecutableETN
⚠️ TreeNotation.ImmutableParticle is now TreeNotation.ImmutableNode
🏥 Fixed regression introduced in 3.6 in ETN parsing in parseString method
🎉 Updated readme with an ETN example

📦 3.6.0 2017-6-15
⚠️ parseNode is now parseNodeType and only takes a line param.
⚠️ getMTime() now returns undefined if the node hasn't been modified.
🎉 Added more laziness to get a ~2.5x improvement in parse time. Parses about ~1M loc of basic TN a sec on test machine

📦 3.5.3 2017-6-14
🎉 Added getSubparticlesByNodeType method
🎉 Expose a simple ExecutableParticle class
🏥 Fixed bug when initiating from an ETN

📦 3.5.2 2017-6-13
🎉 Added getNext and getPrevious methods

📦 3.5.1 2017-6-13
🎉 Added getPoint method

📦 3.5.0 2017-6-9
⚠️ changed parseNode method to just return the new node class.

📦 3.4.0 2017-6-6
⚠️ removed reload method

📦 3.3.0 2017-6-5
⚠️ in the toHtml() method, the child nodes div now has class nodeChildren instead of nodeTree
⚠️ pushTailAndTree is now pushTailAndChildren

📦 3.2.1 2017-6-5
🎉 Added getMTime method

📦 3.2.0 2017-6-5
⚠️ removed moveTo method. Use the new copyTo method follow by destroy.
⚠️ destroy no longer returns the detached node.
🎉 Experimental: expose ImmutableParticle
🎉 Improvements to _parseNode(), increased test coverage, and reduced test code size

📦 3.1.1 2017-6-2
🏥 Regression fix in extend method

📦 3.1.0 2017-6-1
⚠️ removed every() method
🎉 Added getTopDownArray (preorder), getSubparticlesFirstArray (postorder), getParentFirstArray(breadth first) methods

📦 3.0.1 2017-5-30
🎉 Added findTail method

📦 3.0.0 2017-5-30
⚠️ merged all subclasses into one Particle class.
⚠️ getNodes is now getSubparticles
⚠️ setName > setHead, setValue > setTail, getName > getHead, getValue > getTail
⚠️ getNames > getHeads, getValues > getTails, setValue > setTail
⚠️ removed seed methods
⚠️ removed findTrees and findValues methods
⚠️ removed tree next and prev methods
⚠️ removed tree setText...do tree.touchNode().setTailWithChildren(text)
⚠️ removed tree setTree...do tree.touchNode().setSubparticles()
⚠️ removed tree setTail...do tree.touchNode().setTail()
⚠️ removed tree getTail...do tree.getParticle(path).getTail()
⚠️ removed tree getTree...do tree.getParticle(path).getTree()
⚠️ removed tree getText...do tree.getParticle(path).getText()
⚠️ node setTree is now node setSubparticles
⚠️ append now takes only 2 params, line and tree.
⚠️ appendLine is now just append
⚠️ getAncestorTrees is now getAncestorNodes
⚠️ getText now getTailWithChildren
⚠️ removed getTrees method.
⚠️ removed tree clear method.
⚠️ removed node initTree
⚠️ removed treeAt method
⚠️ insert now takes line and not head and tail params
⚠️ pushValue is now pushTailAndTree
⚠️ prepend method now takes line and not head and tail params
🎉 Added insertNode public method
🏥 Bug fix: toString no longer returns an empty line after you delete last node in a nested tree

📦 2.3.0 2017-5-9
⚠️ created abstract classes and language classes. PairTree = require("treenotation").PairTreeLanguage.PairTree
⚠️ fromCsv and other from methods are now static methods on PairTreeLanguage, not PairTree.

📦 2.2.4 2017-4-28
🏥 Dist npm fix

📦 2.2.3 2017-4-28
🎉 Started using Prettier
🎉 Swapped out Browserfy in favor of simple express router transform flow
🎉 Created tasks folder in place of npm scripts
🎉 Code cleanup: turned helper methods into statics

📦 2.2.2 2017-4-17
🎉 Added getAncestorTrees method to node.

📦 2.2.1 2017-4-17
🎉 Added getRootTree method to node.

📦 2.2.0 2017-4-17
⚠️ extend method on PairTree is now recursive.

📦 2.1.1 2017-4-16
🏥 Bug fix: fixed uncaught error when parsing malformed delimited input

📦 2.1.0 2017-4-13
⚠️ in base and pair, values are now converted to strings. Use a higher level language to preserve types.

📦 2.0.3 2017-4-05
🎉 Added prepublish hook

📦 2.0.2 2017-4-05
🏥 Bug fix in node.setTree method

📦 2.0.1 2017-4-05
🏥 NPM bundle fix

📦 2.0.0 2017-4-05
🎉 Made TreeNotation the root namespace and separated PairTree out as a sublanguage
⚠️ new Tree() now needs to be new TreeNotation.PairTree() or just add a Tree = TreeNotation.PairTree
⚠️ node.getPath is now node.getPathName
⚠️ indexPathToNamePath is now pathVectorToPathName
⚠️ node.getNodeParentTree is now node.getParentTree
⚠️ tree.push is now tree.pushValue
⚠️ removed tree.toggleValue
⚠️ tree.toFixedWidth is now tree.toFixedWidthTable
⚠️ node.getIndexPath is now node.getPathVector
⚠️ removed tree.deleteNodeAt
⚠️ tree.getTrees() no longer accepts a parameter.
⚠️ tree.getValues() no longer accepts a parameter.
⚠️ in html returned from tree.toHtml(), data-path is now data-pathVector
⚠️ fromDelimiter is now fromDelimited
🎉 Removed gulp devDependency. Switched to browserify.

📦 1.2.2 2017-4-02
🎉 Removed package.tree and fixed gulp version update script

📦 1.2.1 2017-3-31
⚠️ append, insert, prepend, push, and shift now return the new Tree Nodes.

📦 1.1.1 2017-3-26
⚠️ Removed each method

📦 1.0.7 2017-3-25
🎉 Added moveTo method on Particle

📦 1.0.6 2017-3-19
🎉 Added isTerminal, fromSeed, seedToTree, invert, remap, and toSeed methods

📦 1.0.5 2017-3-17
🏥 Version number generator fix.

📦 1.0.4 2017-3-17
🏥 Bug fix in node.setFromText

📦 1.0.3 2017-3-15
🎉 Added extend method

📦 1.0.2 2017-3-02
🎉 Initial release

footer.scroll

```
```products.scroll
nodeProduct
 outputFileName ParticleComponentFramework.node.js
 combineTypeScriptFiles products/particlesTypes.ts particleComponentFramework/ParticleComponentFramework.ts
 insertLastLine module.exports = { AbstractParticleComponentParser, WillowBrowser, AbstractGithubTriangleComponent, ParticleComponentFrameworkDebuggerComponent }
nodeProduct
 outputFileName Particle.js
 insertLastLine module.exports = {Particle, ExtendibleParticle, AbstractExtendibleParticle, ParticleEvents, ParticleAtom }
 combineTypeScriptFiles products/particlesTypes.ts particle/AbstractParticle.node.ts particle/Particle.ts
nodeProduct
 outputFileName Parsers.js
 insertLastLine module.exports = { ParsersConstants, PreludeAtomTypeIds, HandParsersProgram, ParserBackedParticle, UnknownParserError, UnknownParsersProgram }
 combineTypeScriptFiles products/particlesTypes.ts parsers/Parsers.ts
nodeProduct
 outputFileName TestRacer.js
 insertLastLine module.exports = {TestRacer}
 combineTypeScriptFiles testRacer/TestRacer.ts
nodeProduct
 outputFileName ParsersCodeMirrorMode.js
 insertLastLine module.exports = {ParsersCodeMirrorMode}
 combineTypeScriptFiles products/particlesTypes.ts parsers/ParsersCodeMirrorMode.ts
nodeProduct
 outputFileName ParsersCompiler.js
 insertLastLine module.exports = {ParsersCompiler}
 combineTypeScriptFiles products/particlesTypes.ts parsers/ParsersCompiler.ts
nodeProduct
 outputFileName Disk.node.js
 insertLastLine module.exports = {Disk}
 combineTypeScriptFiles disk/Disk.node.ts
nodeProduct
 outputFileName Utils.js
 insertLastLine module.exports = {Utils}
 combineTypeScriptFiles utils/Utils.ts
nodeProduct
 outputFileName ScrollFileSystem.js
 insertLastLine module.exports = {ScrollFileSystem, ScrollFile}
 combineTypeScriptFiles scrollFileSystem/ScrollFileSystem.ts
nodeProduct
 outputFileName Kitchen.node.js
 combineTypeScriptFiles products/particlesTypes.ts kitchen/Kitchen.node.ts
 insertLastLine module.exports = {Kitchen}
nodeProduct
 outputFileName TypeScriptRewriter.js
 combineTypeScriptFiles typeScriptRewriter/TypeScriptRewriter.ts
 insertLastLine module.exports = {TypeScriptRewriter}
browserProduct
 outputFileName SweeperCraft.browser.js
 combineTypeScriptFiles particleComponentFramework/sweepercraft/SweeperCraft.ts
browserProduct
 outputFileName ParticleComponentFramework.browser.js
 removeAll window.particlesTypes = particlesTypes
 combineTypeScriptFiles products/particlesTypes.ts particleComponentFramework/ParticleComponentFramework.ts
browserProduct
 outputFileName Particle.test.browser.js
 removeAll window.particlesTypes = particlesTypes
 combineTypeScriptFiles products/particlesTypes.ts particle/Particle.test.ts
browserProduct
 outputFileName Parsers.ts.browser.js
 removeAll window.particlesTypes = particlesTypes
 combineTypeScriptFiles products/particlesTypes.ts parsers/Parsers.ts
browserProduct
 outputFileName Utils.browser.js
 combineTypeScriptFiles utils/Utils.ts
browserProduct
 outputFileName ScrollFileSystem.browser.js
 combineTypeScriptFiles scrollFileSystem/ScrollFileSystem.ts
browserProduct
 outputFileName Particle.browser.js
 removeAll window.particlesTypes = particlesTypes
 combineTypeScriptFiles products/particlesTypes.ts particle/AbstractParticle.browser.ts particle/Particle.ts
browserProduct
 outputFileName TestRacer.browser.js
 removeAll window.particlesTypes = particlesTypes
 combineTypeScriptFiles products/particlesTypes.ts testRacer/TestRacer.ts
browserProduct
 outputFileName ParsersCodeMirrorMode.browser.js
 removeAll Object.defineProperty(exports, "__esModule", { value: true })
 removeAll window.particlesTypes = particlesTypes
 combineTypeScriptFiles products/particlesTypes.ts parsers/ParsersCodeMirrorMode.ts
browserProduct
 outputFileName DesignerApp.browser.js
 combineTypeScriptFiles designer/DesignerApp.ts
browserProduct
 combineTypeScriptFiles sandbox/SandboxApp.ts
 outputFileName SandboxApp.browser.js
```
