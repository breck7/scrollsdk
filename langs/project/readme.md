## A Tree Language for project dependency management.

Helps with building and serving Javascript and TypeScript projects.

2.0.0 / 2019-07-31
==================
- Breaking: getProjectProgram is now makeProjectProgramFromArrayOfScripts
- Breaking: getImports is now getTypeScriptAndJavaScriptImportsFromSourceCode
- Breaking: getOrderedDependenciesArray is now getScriptPathsInCorrectDependencyOrder

1.9.0 / 2019-03-14
==================
- Fix: add support for files with spaces in their names or paths

1.8.0 / 2019-03-11
==================
- New: moved into root TreeNotation project

1.7.0 / 2019-03-03
==================
- New: ported BrowserScript class
- New: "import" support
