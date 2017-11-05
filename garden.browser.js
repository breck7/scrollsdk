$(document).ready(function() {
  $("#treeprogram").on("keyup", function() {
    var tree = new TreeProgram($(this).val())
    $("#outline").html(tree.toOutline())
    window.tree = tree
  })

  $("#treeprogram").on("blur", function() {
    localStorage.setItem("tree", $(this).val())
  })

  const val = localStorage.getItem("tree")
  if (val) $("#treeprogram").val(val)

  $("#treeprogram").keyup()
})
