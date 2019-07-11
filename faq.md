Tree Notation Frequently Asked Questions
========================================

Below is a list of questions that commonly come up with people who are just hearing about <a href="http://treenotation.org/">Tree Notation</a>. If you have a question not listed here, file an issue, send a pull request, or send an email to byunits@cc.hawaii.edu.

## Overview

#### There are already over 10,000 programming languages and over 1,000 syntax systems, why create another one?

There is only 1 binary. Tree Notation is more like binary than it is like a programming language. Tree Notation is a basic building block that you can build higher level languages on top of.

The benefits of Tree Notation is that if you are building tools for your Tree Language for automating train schedules, and I am building tools for my Tree Language for doing cancer research faster, even though our 2 domains are very different, we can share a lot of the tools and code. The Tree Notation network effects will be huge.

Currently languages look like this:

1 Binary => 1,000+ Syntaxes => 10,000+ languages

In the future it may look like this:

1 Binary => 1 Tree Notation => 10,000+ languages

#### What's the difference between Tree Notation and Tree Languages?

Tree Notation is a base level notation. Generally users use Tree Languages, which make Tree Notation useful.

#### How can I build a new Tree Language?

One place to try is using our simple <a href="http://treenotation.org/sandbox/build/">Tree Language Web IDE</a>.

#### Where can I use Tree Notation?

Everywhere! Anywhere you use programming languages or encodings, you can use Tree Notation. In the early days of the Tree ecosystem, it will require more work, but we are here to help.

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

In fact, there is no such thing as an invalid Tree Notation document, at the base level, just as there is no such thing as an "invalid binary sequence".

Usually when using Tree Notation you use a higher level grammar, called a Tree Language, and so you can still have invalid programs in that language (because of typos, for example) even though your Tree Notation is valid.

#### How do I escape characters?

In Tree Notation you never need to escape characters. If your node spans across multiple lines, simply indent the child lines by one space more than their parent, and leave the rest of the line as is.

#### Does Tree Notation directly map to XML or JSON?

No. A subset of Tree Notation does, but for perfect one-to-one matching you'll want to use a Tree Language specifically designed for that language.

#### Can I use Tree Notation with some other programming language?

Yes! We hope that there will eventually be Tree Notation and Tree Grammar libraries in all programming languages, similar to how most languages nowadays have JSON libraries.

If you want to build a Tree Notation library for your language, let us know how we can help!

## Project Status

#### Who makes Tree Notation, and is it open source?

Tree Notation is open source, free, and made by volunteers. The Tree Notation Lab, a research group in Oahu, is currently behind a lot of the infrastructure projects building out Tree Notation. We are building infrastructure needed so that we can build better tools for cancer researchers, clinicians, and patients, but the faster we can get the broader Tree Notation ecosystem growing, the easier our work will become.

#### Is Tree Notation ready for production use?

Sort of! Tree Notation is ready for early adopters. If you use Tree Notation today, you probably will want to stay up to date with what's happening as the tooling is still rapidly evolving.

If you'd prefer to wait until most of the details are settled, 2020 is probably a better time to start using it.

## Lisp Related Questions

#### How is this different from S-Expressions?

It is largely accurate to say Tree Notation is S-Expressions without parenthesis. It turns out, that matters a lot!

#### Is Tree Notation just Lisp?

No. It is largely accurate to say Tree Notation is Lisp without parenthesis. However, that distinction ends up making a chasmic difference which will become more important over time, and we think the Tree Notation ecosystem will grow to dwarf the Lisp ecosystem.

## History

#### How was Tree Notation discovered?

From Breck Yunits: `It was 2012 and Ben and I were building a visual web page editor called <a href="https://www.youtube.com/watch?v=ZWthAz839Og">NudgePad</a> in the "piano office" in San Francisco. Users could drag, drop and edit their web pages without touching any code. I made the program read and write the language HAML under the hood, which I had learned at my previous job at <a href="https://labzero.com/">Lab Zero</a>. The problem was I had to write my own HAML parser and code generator, and because we were a broke startup, I kept trying to cut syntax from the language to save time and money. Each day I would remove some syntax character from the language and still somehow get everything in the appp to work. Eventually the language was just spaces, newlines, and colons. There really was an "aha!" moment. I remember I was walking to work, going over the code in my head, and had just reached the <a href="https://goo.gl/maps/4cTV2CcpQcX8NPC16">101 overpass</a> when realized I could drop the colons! I went straight to my desk, told Ben I had an idea, and a couple hours later had removed the colons and everything still worked. I remember at the time thinking that was potentially a profound idea but I *assumed* someone had built it already. I thought there was no chance it hadn't been invented yet because it was so simple. For years I'd ping folks in industry, post on message boards, and do a lot of Google searches. It took me years of searching for it before I thought maybe no had noticed and leveraged this idea before. It took 5 years before I wrote a paper about it, and over 7 years before it started to get good.`

#### Which language influenced Tree Notation the most?

Syntactically there's no doubt--it was <a href="http://haml.info/">HAML</a>. See story about how Tree Notation was discovered. Semantically there's been a lot of incluences from thousands of languages. As for particularly influential ones--Lisp, Haskell, Racket, TypeScript, Python, Scheme, Javascript, Fortran, Forth, C++, JSON, XML, HTML, CSS, SQL all come to mind.

#### Who is the first person to discover Tree Notation?

We came up with Tree Notation circa 2012. However, it turns out in 2003 Egil Möller <a href="https://srfi.schemers.org/srfi-49/srfi-49.html">proposed</a> "I-Expressions", or "Indentation-sensitive syntax", an alternative to S-Expressions in Scheme that is 80% similar to Tree Notation. A few implementation details weren't ideal, but the core is largely the same.

#### Why didn't I-Expressions catch on?

Not sure. We think it's because perhaps it was pitched as a different way to write Lisp, and that was it. With Tree Notation, coming up with an improved way to write Lisp was never a primary goal. Our primary goals have been to enable visual programming, simpler APIs, cleaner code and program synthesis, for which Tree Notation is an ideal tool.
