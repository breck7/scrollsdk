Tree Notation Frequently Asked Questions
========================================

Below is a list of questions that are commonly asked by people who are new to <a href="http://treenotation.org/">Tree Notation</a>. If you have a question not listed here please ask us by filing an issue, sending a pull request, or sending an email to breck7@gmail.com.

## Overview

#### There are already over 10,000 programming languages and over 1,000 syntax systems like JSON, XML and BNF, why create another one?

There is only 1 binary. Tree Notation is more like binary than it is like a programming language. Tree Notation is a basic building block that you can build higher level languages on top of.

Tree Notation will have strong network effects. If you are building a Tree Language and tools for automating train schedules, and I am building a Tree Language and tools for doing cancer research, even though our 2 domains are very different, we can share a lot of the tools and code.

Currently languages look like this:

1 Binary => 1,000+ Syntaxes => 10,000+ languages

In the future we think it may look like this:

1 Binary => 1 Tree Notation => 10,000+ languages

#### What's the difference between Tree Notation and Tree Languages?

Tree Notation is a base level notation. Generally users use Tree Languages, which make Tree Notation useful. Anyone can make a new language by simply creating 1 file in a language called Grammar, which is itself a Tree Language.

#### How can I build a new Tree Language?

A good place to start is with our simple <a href="http://treenotation.org/sandbox/build/">Tree Language Builder</a>.

#### Where can I use Tree Notation?

Everywhere! Anywhere you use programming languages or encodings, you can use Tree Notation. In the early days of the Tree ecosystem, it will require more work, and you likely will have to build your own Tree Language, but we are here to help.

#### What are some examples of Tree Languages?

There are a dozen <a href="https://github.com/breck7/jtree/tree/master/langs">example languages</a> in the JTree GitHub repo. Here's a language that compiles to <a href="http://treenotation.org/sandbox/build/#standard%20stump">HTML</a>, a <a href="http://treenotation.org/sandbox/build/#standard%20project">language similar to Make</a>, and a <a href="http://treenotation.org/sandbox/build/#standard%20numbers">language that does simple math </a>.

#### Language that add numbers or compile to HTML are cute, but are there any advanced Tree Language?

Currently the most advanced non-experimental Tree Language that we are aware of is Flow, the dataflow language used by our visual data science studio <a href="https://ohayo.computer/">Ohayo</a>. By 2020, we expect Flow to be a competitive rival to Python or R for 80% of data science tasks. Another very powerful language is <a href="http://treenotation.org/sandbox/build/#standard%20grammar">Grammar</a>, which is similar to ANTLR or Racket in that it's a language for building languages. However, in 2020 the most powerful Tree Language could be yours! We are here to help you build it!

## Structure

#### What are the data structures in Tree Notation?

This is the base Tree Notation:

    YI = "\n" // New lines separate nodes
    XI = " " // Increasing indent to denote parent/child relationship
    interface TreeNode {
      parent: &TreeNode
      children: TreeNode[]
      line: string
    }

Higher level Tree Languages are where additional concepts can be added like strings, integers, booleans, control flow, assignment, encapsulation, functions, and so forth.

#### Does Tree Notation use tabs or spaces?

Tree Notation uses a single space to indent blocks which indicates parent/child relationship. You can only increase the indent level one level at a time.

#### Does Tree Notation work on Windows?

Yes. Tree Notation only uses the "\n" character to separate nodes/lines. "\r" is either ignored or treated as a content character. Our testing so far on Windows is not that extensive, so we would love more help from Windows users!

#### Does Tree Notation support Unicode or just ASCII?

Tree Notation supports all encodings. This is perfectly valid Tree Notation:

    html
     body
      div おはようございます

In fact, there is no such thing as an invalid Tree Notation document at the base level, just as there is no such thing as an "invalid binary sequence".

Usually when using Tree Notation you use a higher level grammar, called a Tree Language, and so you can still have invalid programs in that language (because of typos, for example) even though your Tree Notation is valid.

#### How do I escape characters?

In Tree Notation you never need to escape characters. If your node spans across multiple lines, simply indent the child lines by one space more than their parent, and leave the rest of the line as is. Some Tree Languages might have the notion of escape characters in certain places, but there's no such thing at the Tree Notation base layer.

#### Does Tree Notation directly map to XML or JSON?

No. A subset of Tree Notation does, but for perfect one-to-one matching you'll want to use a Tree Language specifically designed for that language.

#### Can I use Tree Notation with any programming language?

Yes! The <a href="https://github.com/breck7/jtree">JTree library</a> provides Tree Notation support for TypeScript and Javascript, but we hope that there will eventually be Tree Notation and Tree Grammar libraries in all programming languages, similar to how most languages nowadays have JSON libraries. We currently have C++, Python, and GoLang libraries in development, but hopefully others will create those before we release ours.

If you want to build a Tree Notation library for your language, let us know how we can help!

## Project Status

#### Who makes Tree Notation, and is it open source?

Tree Notation is open source, free, and made by volunteers. The Tree Notation Lab, a research group in Oahu, is currently behind a lot of the core Tree Notation infrastructure projects. We are building the infrastructure needed so that we can build better tools for cancer researchers, clinicians, and patients, but the faster we can get the broader Tree Notation ecosystem growing, the easier our work will become.

#### Is Tree Notation ready for production use?

Sort of! Tree Notation is ready for early adopters. If you use Tree Notation today, you probably will want to stay up to date with what's happening as the tooling is still rapidly evolving.

If you'd prefer to wait until most of the details are settled, 2020 is probably a better time to start using it.

#### How can I help?

Thank you for asking! We need a lot of volunteers. Particularly important needs now are someone with project management skills to help organize and lead the team, someone to do community organizing/evangelism, dev leads to make libraries in various languages, testers to do cross platform testing, and more! Get in touch if you want to help.

## For Advanced Tree Language Creators

#### What are the benefits to writing a "Grammar" file to create my Tree Language?

By creating 1 file in Grammar, you get a new programming language with autocomplete, syntax highlighting, type-checking, help, integration tests, compiling, and more. The goal of Grammar is to help you create a new, robust, well tested language as easily as possible.

#### All of the demo languages currently use prefix notation. Can I use infix notation, postfix notation, or pattern matching?

Yes! Although the Grammar Language currently supports mainly prefix notation, we are working on a few iterations to allow more styles of nodeType parsing, as well as more polymorphism. New versions in the next few months should have robust implementations of those patterns.

#### Can I do inline Trees?

Yes! While not supported at the base Tree Notation level, your individual nodes can certainly have inline trees. Often your Tree Languages will have nodes that contain content written in traditional languages like Javascript, Lisp, or Python. Or you could even have inline trees written in Tree Notation, except using something like the pipe character as YI instead of the newline character.

## Lisp Related Questions

#### How is this different from S-Expressions?

It is largely accurate to say Tree Notation is S-Expressions without parenthesis. But this makes them almost completely different! Tree Notation gives you fewer chances to make errors, easier program concatenation and ad hoc parser writing, easier program synthesis, easier visual programming, easier code analysis, and more.

#### Is Tree Notation just Lisp?

No. It is largely accurate to say Tree Notation is Lisp without parenthesis. However, that distinction ends up making a chasmic difference which will become more important over time, and we think the Tree Notation ecosystem will grow to dwarf the Lisp ecosystem.

## History

#### How was Tree Notation discovered?

From Breck Yunits: "It was 2012 and Ben and I were building a visual web page editor called <a href="https://www.youtube.com/watch?v=ZWthAz839Og">NudgePad</a> in the "piano office" in San Francisco. Users could drag, drop and edit their web pages without touching any code. I made the program read and write the language HAML under the hood, which I had learned at my previous job at <a href="https://labzero.com/">Lab Zero</a>. The problem was I had to write my own HAML parser and code generator, and because we were a broke startup, I kept trying to cut syntax from the language to save time and money. Each day I would remove some syntax character from the language and still somehow get everything in the appp to work. Eventually the language was just spaces, newlines, and colons. There really was an "aha!" moment. I remember I was walking to work, going over the code in my head, and had just reached the <a href="https://goo.gl/maps/4cTV2CcpQcX8NPC16">101 overpass</a> when I realized I could drop the colons! I went straight to my desk, told Ben I had an idea, and a couple hours later had removed the colons and everything still worked. I remember at the time thinking that was potentially a profound idea but I *assumed* someone had built it already. I thought there was no chance it hadn't been invented yet because it was so simple. For years I'd ping folks in industry, post on message boards, and do a lot of Google searches. It took me years of searching for it before I thought maybe no had noticed and leveraged this idea before. It took 5 years before I wrote a paper about it, and over 7 years before it started to get good."

#### Which language influenced Tree Notation the most?

Syntactically there's no question--it was <a href="http://haml.info/">HAML</a>. See the origin story for why. Semantically there's been a lot of influences from thousands of languages. Particularly influential ones are Lisp, Haskell, Racket, ANTLR, TypeScript, Python, Scheme, Javascript, COBOL, Rebol, Mathematica, APL, R, Red-Lang, Fortran, Forth, C++, JSON, XML, HTML, CSS, SQL, somewhat, but not necessarily, in that order.

#### Who is the first person to discover Tree Notation?

We came up with Tree Notation circa 2012. However, it turns out in 2003 Egil Möller <a href="https://srfi.schemers.org/srfi-49/srfi-49.html">proposed</a> "I-Expressions", or "Indentation-sensitive syntax", an alternative to S-Expressions in Scheme that is 80% similar to Tree Notation. A few implementation details weren't ideal, but the core is largely the same.

#### Why didn't I-Expressions catch on?

Not sure. We think it's because perhaps it was pitched as a different way to write Lisp, and that was it. With Tree Notation, coming up with an improved way to write Lisp was never a primary goal. Our primary goals have been to enable visual programming, simpler APIs, cleaner code and program synthesis, for which Tree Notation is an ideal tool.

## Other

#### Did you know that if you think this could grow to rival the web you are an idiot?

Thank you for reminding us the web was not built in a day!
