$(document).ready(function() {
  $("#treeprogram").on("keyup", function() {
    var tree = new TreeProgram($(this).val())
    $("#outline").html(tree.toOutline())
    window.tree = tree
  })

  $("#treeprogram").keyup()
})
