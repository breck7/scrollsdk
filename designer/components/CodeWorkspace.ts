const { AbstractTreeComponent } = require("../../products/TreeComponentFramework.node.js")
const { jtree } = require("../../index.js")

class CodeToolbarComponent extends AbstractTreeComponent {
	toStumpCode() {
		return `span Source Code in your Language
   input
    type checkbox
    id executeCommand
   a Execute
    clickCommand executeCommand
   span  |
   input
    type checkbox
    id compileCommand
   a Compile
    clickCommand compileCommand
   span  |
   input
    type checkbox
    id visualizeCommand
   a Explain
    clickCommand visualizeCommand`
	}
}

class CodeEditorComponent extends AbstractTreeComponent {
	toStumpCode() {
		return `textarea
 id codeConsole`
	}
}

class CodeErrorBarComponent extends AbstractTreeComponent {
	toStumpCode() {
		return `div Language Errors
 pre
  id codeErrorsConsole`
	}
}

class CompiledResultsComponent extends AbstractTreeComponent {
	toStumpCode() {
		return `textarea
 class resultsDiv
 id compileResultsDiv
 placeholder Compilation results`
	}
}

class ExecutionResultsComponent extends AbstractTreeComponent {
	toHakonCode() {
		return `#execResultsTextArea
 border 0
 width 100%`
	}
	toStumpCode() {
		return `textarea
 class resultsDiv
 id executeResultsDiv
 placeholder Execution results`
	}
}

class ExplainResultsComponent extends AbstractTreeComponent {
	toStumpCode() {
		return `div
 class resultsDiv
 style position:relative;
 id explainResultsDiv`
	}
}

class CodeWorkspaceComponent extends AbstractTreeComponent {
	createParser() {
		return new jtree.TreeNode.Parser(undefined, {
			CodeToolbarComponent,
			CodeErrorBarComponent,
			CompiledResultsComponent,
			ExecutionResultsComponent,
			ExplainResultsComponent
		})
	}

	toHakonCode() {
		return `textarea.resultsDiv
 height 120px
 width 220px`
	}
}

export { CodeWorkspaceComponent }
