const TreeColumnTypes = `any
 isValid .?
something
 isValid .
url
 isValid .?
type
 isValid ^(any|url|something|int|boolean|number)$
int
 isValid ^\-?[0-9]+$
reduction
 isValid ^(count|sum|average|min|max|median)$
boolean
 isValid ^(false|true)$
number
 isValid ^\-?[0-9]*\.?[0-9]*$
prob
 description Number between 0 and 1
 isValid ^\-?[0-9]*\.?[0-9]*$
alphanumeric
 isValid ^[a-zA-Z0-9]+$
comparison
 isValid ^(\<|\>|==)$
filepath
 isValid ^[a-zA-Z0-9\.\_\/\-\@]+$
identifier
 isValid ^[$A-Za-z_][0-9a-zA-Z_$]*$
alpha
 isValid ^[a-zA-Z]+$`

module.exports = TreeColumnTypes
