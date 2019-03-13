$(document).ready(function() {
  const mainArea = $("#tree")
  mainArea.on("keyup", function() {
    var tree = new TreeNode($(this).val())
    $("#outline").html(tree.toOutline())
    window.tree = tree
  })

  mainArea.on("blur", function() {
    localStorage.setItem("tree", $(this).val())
  })

  const val = localStorage.getItem("tree")
  if (val) mainArea.val(val)

  $("#version").html("Version: " + jtree.getVersion())

  mainArea.keyup()
})
