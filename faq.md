Tree Notation Frequently Asked Questions
========================================

Below is a list of questions that are commonly asked by people who are new to <a href="http://treenotation.org/">Tree Notation</a>. If you have a question not listed here please ask us by filing an issue, sending a pull request, or posting a message to the [TreeNotation Subreddit](https://www.reddit.com/r/treenotation/).

## Overview

#### There are already over 10,000 programming languages and over 1,000 syntax systems like JSON, XML and BNF, why create another one?

There is only 1 binary. Tree Notation is more like binary than it is like a programming language. Tree Notation is a basic building block that you can build higher level languages on top of.

Tree Notation will have strong network effects. If Jane is building a Tree Language and tools for automating train schedules, and John is building a Tree Language and tools for doing cancer research, even though our 2 domains are very different, we can share a lot of the tools and code.

Currently languages look like this:

1 Binary => 1,000+ Syntaxes => 10,000+ languages

In the future we think it may look like this:

1 Binary => 1 Tree Notation => 10,000+ Tree Languages

#### What's the difference between Tree Notation and Tree Languages?

Tree Notation is a base level notation. Generally users use Tree Languages, which make Tree Notation useful. We are building a Tree Language called [Grammar](http://treenotation.org/sandbox/build/#standard%20grammar) to make it easier to build Tree Languages.

#### What major problems in computer science does help Tree Notation solve?

1. Program synthesis. Tree Notation makes it easier to train AI models to write great code. Deep Learning models are only as good as the data you train it on. Tree Notation code is noiseless, clean data, which we posit will enable a 10x+ improvement over the state-of-the-art of AI programs that write code and/or assist users in writing code.
2. Clean data. In data science a rule of thumb is that 20% of your time will go toward doing data science, and 80% of your time will go toward getting, cleaning, and organizing data. Tree Notation offers a number of techniques that, coupled with network effects, will greatly reduce time wasted on cleaning data.
3. Visual programming. Tree Notation is the first notation where a visual design tool can generate code as good as someone can write by hand. Traditional languages have a critical flaw--there are infinite ways to represent any given structure. In Tree Notation there is only 1 way to represent 1 structure. This simplification is one of a few core reasons why Tree Notation is helping solve the Visual Programming problem.

We are building the data science app [Ohayo](https://github.com/treenotation/ohayo) in part to demonstrate these 3 advantages of Tree Notation.

#### How can I build a new Tree Language?

A good place to start is with our simple <a href="http://treenotation.org/sandbox/build/">Tree Language Builder</a>.

#### Where can I use Tree Notation?

Everywhere! Anywhere you use programming languages or encodings, you can use Tree Notation. In the early days of the Tree Notation Ecosystem, it will require more work but we are here to help.

#### What are some examples of Tree Languages?

There are over a dozen <a href="https://github.com/treenotation/jtree/tree/master/langs">example languages</a> in the JTree GitHub repo. Here's a language that compiles to <a href="http://treenotation.org/sandbox/build/#standard%20stump">HTML</a>, a <a href="http://treenotation.org/sandbox/build/#standard%20project">language similar to Make</a>, and a <a href="http://treenotation.org/sandbox/build/#standard%20numbers">language that does simple math </a>.

#### Languages that add numbers or compile to HTML are cute, but are there any advanced Tree Language?

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

Yes! The <a href="https://github.com/treenotation/jtree">JTree library</a> provides Tree Notation support for TypeScript and Javascript, but we hope that there will eventually be Tree Notation and Tree Grammar libraries in all programming languages, similar to how most languages nowadays have JSON libraries.

If you want to build a Tree Notation library for your language, let us know how we can help!

## Project Status

#### Who makes Tree Notation, and is it open source?

Tree Notation is free and open source. The Tree Notation Lab, a research group at the University of Hawaii Cancer Center in Oahu, is currently behind a lot of the core Tree Notation infrastructure projects. We are building the infrastructure needed so that we can build better tools for cancer researchers, clinicians, and patients, but the faster we can get the broader Tree Notation ecosystem growing, the easier our work will become.

#### Is Tree Notation ready for production use?

Sort of! Tree Notation is ready for early adopters. If you use Tree Notation today, you probably will want to stay up to date with what's happening as the tooling is still rapidly evolving.

If you'd prefer to wait until most of the details are settled, 2020 is probably a better time to start using it.

#### How can I help?

Thank you for asking! We need a lot of volunteers. Particularly important needs now are someone with project management skills to help organize and lead the team, someone to do community organizing/evangelism, dev leads to make libraries in various languages, testers to do cross platform testing, and more! Get in touch if you want to help.

## Editing Tips

#### How can I copy and paste code in Tree Notation and have the editor ensure correct indentation?

Look for a "Paste and indent" command. For example, in Sublime Text you can click Edit->Paste and Indent, or press Cmd+Shift+v.

#### Do I have to count the spaces?

No. We strongly recommend using an editor that supports Tree Notation with syntax highlighting, indentation help and more (if we don't have support for your favorite editor yet, please help us add it!). If you are finding it difficult to use Tree Notation, that's just because the editor support is in the early stages. Please let us know what problems you are having so we can get them fixed.

## For Advanced Tree Language Creators

#### What are the benefits to writing a "Grammar" file to create my Tree Language?

By creating 1 file in Grammar, you get a new programming language with autocomplete, syntax highlighting, type-checking, help, integration tests, compiling, and more. The goal of Grammar is to help you create a new, robust, well tested language as easily as possible.

#### Can I use infix notation, postfix notation, or pattern matching?

Yes! As of JTree 35, the Grammar Language that ships with Jtree now supports other notations. Originally only prefix notation was supported without writing a decent amount of target code.

#### Can I do inline Trees?

Yes! While not supported at the base Tree Notation level, your individual nodes can certainly have inline trees. Often your Tree Languages will have nodes that contain content written in traditional languages like Javascript, Lisp, or Python. Or you could even have inline trees written in Tree Notation, except using something like the pipe character as YI instead of the newline character.

## Lisp Related Questions

#### How is this different from S-Expressions?

It is largely accurate to say Tree Notation is S-Expressions without parenthesis. But this makes them almost completely different! Tree Notation gives you fewer chances to make errors, easier program concatenation and ad hoc parser writing, easier program synthesis, easier visual programming, easier code analysis, and more.

#### Is Tree Notation just Lisp?

No. It is largely accurate to say Tree Notation is Lisp without parenthesis. However, that distinction ends up making a chasmic difference which will become more important over time, and we think the Tree Notation ecosystem will grow to dwarf the Lisp ecosystem.

#### What's an example of "ad hoc" parsing that you can do with Tree Notation that you cannot do with Lisp?

If you have a Tree Language with a root nodeType named "folder", and you want to rename the keyword of that nodeType to "project", you can easily do it with an ad-hoc regex: s/^folder/project/. This would be type safe, even if you started parsing in the middle of the document. You cannot do that with S-Expressions, as you'd have to first parse the document into a Tree data structure, and could not operate on it as a string.

#### What's something else you can do with Tree Notation that you can't do with Lisp?

Easy program concatenation. For example, in Tree Notation you can create valid new programs simply by appending strings, whereas in Lisp you might first have to do some parantheses removing and inserting.

#### What's something else that is worse in Lisp?

In Lisp you have to escape certain characters. In Tree Notation, you never need to escape characters. (Note: although you are 100% free to design Tree Languages that implement escape characters, that is almost never necessary).

## History

#### Which language influenced Tree Notation the most?

Syntactically there's no question--it was <a href="http://haml.info/">HAML</a>. See the origin story below if you are curious why. Semantically there's been a lot of influences from thousands of languages. Particularly influential ones are Lisp, Haskell, Racket, ANTLR, TypeScript, C#, Python, Scheme, Javascript, COBOL, Rebol, Mathematica, APL, R, Red-Lang, Fortran, Forth, C++, JSON, XML, HTML, CSS, SQL, somewhat, but not necessarily, in that order.

#### Who is the first person to discover Tree Notation?

We came up with Tree Notation circa 2012. However, it turns out in 2003 Egil Möller <a href="https://srfi.schemers.org/srfi-49/srfi-49.html">proposed</a> "I-Expressions", or "Indentation-sensitive syntax", an alternative to S-Expressions in Scheme that is 80% similar to Tree Notation. A few implementation details weren't ideal, but the core is largely the same.

#### Why didn't I-Expressions catch on?

Not sure. We think it's because perhaps it was pitched as a different way to write Lisp, and that was it. With Tree Notation, coming up with an improved way to write Lisp was never a primary goal. Our primary goals have been to enable visual programming, simpler APIs, cleaner code and program synthesis, for which Tree Notation is an ideal tool.

#### How was Tree Notation discovered?

Below is a transcript of Breck telling the origin story. This is taken from the upcoming E! True Hollywood Story 'Tree Notation: the Drugs, Sex, and Fights in the days before it had 84 stars.`

"The year was 2012. Barack Hussein Obama was president, Prettier hadn't been released yet, and humans talked to other humans more than Alexa.

Our startup <a href="https://www.youtube.com/watch?v=ZWthAz839Og">NudgePad</a> was building a visual web page editor in our office in San Francisco, which was located in the backroom of a warehouse that built wooden pianos by hand. In comparison to Nudge Inc., the wooden piano business was *booming*.

With NudgePad, users could drag, drop and edit their web pages without touching any code. It worked awesome, at least 1 percent of the time. As the user was editing their pages visually, we coded NudgePad to read and write the language HAML, which I had learned at my previous job at <a href="https://labzero.com/">Lab Zero</a>.

I ended up needing to write my own HAML parser and code generator for reasons long since forgotten. Because we were a broke startup, I kept trying to cut syntax from the language to save time and money. This also saved me from talking to users, a key strategy behind any great business (\s).

Every now and then I would remove some syntax character from our HAML clone and still somehow get everything in NudgePad to work. Eventually the language was just spaces, newlines, and colons.

And then there was an "aha!" moment. I remember I was walking to work, going over the code in my head, and had just reached the <a href="https://goo.gl/maps/4cTV2CcpQcX8NPC16">101 overpass</a> when I realized I could dump the colons! I went straight to my desk, opened up my editor, and a couple hours later had removed the colons and everything still worked. I remember at the time thinking that was potentially a profound idea but I *was positive* someone had built it already. I thought there was no chance it hadn't been invented yet because it was so simple. By Kevin's Law, It had probably appeared on Shark Tank before.

But for years I'd ping folks in industry, post on message boards, and do a lot of Google searches. It took me years of searching for it before I thought maybe no had noticed and leveraged this idea before.

5 years later I had another "aha" moment when I realized it would also be a good base notation for *any* type of computer language, and wrote a paper about it. Which went on to be cited over (editor's note: it says "zero" here, is that correct?) times.

It was over 7 years before the first "aha" moment that Tree Notation started to get good."

## Other

#### Did you know that if you think this could grow to rival the web you are an idiot?

Thank you for reminding us the web was not built in a day!
