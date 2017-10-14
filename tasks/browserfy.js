const browserfy = file =>
  file.replace(/\nmodule\.exports \= (.*)/g, "\nwindow.$1 = $1").replace(/\nconst .* \= require\(.*/g, "\n")

module.exports = browserfy
