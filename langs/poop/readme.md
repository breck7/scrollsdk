# poop Readme

[Try it now](https://treenotation.org/designer/#grammar%0A%20poopNode%0A%20%20description%20POOP%20is%20the%20Programming%20Option%20for%20Overtired%20Parents.%20It%20is%20a%20Tree%20Language%20for%20sleep%20deprived%20parents%20to%20log%20their%20child's%20bathroom%2C%20feeding%2C%20and%20sleep%20events.%20You%20can%20use%20POOP%20with%20computers%20or%20pen%20and%20paper.%20Each%20line%20records%20an%20event%2C%20a%20time%2C%20and%20optionally%20notes.%20POOP%20is%20an%20anyfix%20language.%20You%20can%20put%20the%20time%20first%20or%20the%20event%20type%20first.%20You%20can%20write%20the%20actual%20symbols%2C%20or%2C%20if%20it%20is%203am%2C%20you%20can%20just%20use%20some%20of%20the%20natural%20medium%20to%20record%20the%20event%20type.%20%0A%20%20root%0A%20%20inScope%20abstractEventNode%20_55356_57092Node%0A%20%20example%0A%20%20%20%F0%9F%8C%84%208%2029%202019%0A%20%20%20%F0%9F%98%80%204%0A%20%20%20%E2%9C%A8%206%0A%20%20%20%F0%9F%92%A9%20630%0A%20abstractEventNode%0A%20%20abstract%0A%20%20catchAllCellType%20timeIntCell%0A%20%20firstCellType%20timeIntCell%0A%20dateIntCell%0A%20%20highlightScope%20constant.numeric.integer%0A%20timeIntCell%0A%20%20highlightScope%20constant.numeric.integer%0A%20anyCell%0A%20_55357_56489Node%0A%20%20pattern%20%F0%9F%92%A9%0A%20%20extends%20abstractEventNode%0A%20%20description%20Bowel%20movement.%0A%20_10024Node%0A%20%20pattern%20%E2%9C%A8%0A%20%20description%20Bladder%20movement.%0A%20%20extends%20abstractEventNode%0A%20_55356_57212Node%0A%20%20pattern%20%F0%9F%8D%BC%0A%20%20extends%20abstractEventNode%0A%20%20description%20Feeding.%0A%20_55357_56884Node%0A%20%20pattern%20%F0%9F%98%B4%0A%20%20description%20Sleep.%0A%20%20extends%20abstractEventNode%0A%20_55357_56832Node%0A%20%20pattern%20%F0%9F%98%80%0A%20%20description%20I'm%20awake!%0A%20%20extends%20abstractEventNode%0A%20_10084_65039Node%0A%20%20pattern%20%E2%9D%A4%EF%B8%8F%0A%20%20description%20Special%20memory.%0A%20%20extends%20abstractEventNode%0A%20_55356_57092Node%0A%20%20pattern%20%F0%9F%8C%84%0A%20%20description%20We%20survived%20another%20day!%0A%20%20cells%20dateIntCell%20dateIntCell%20dateIntCell%0Asample%0A%20%F0%9F%8C%84%208%2029%202019%0A%20%F0%9F%98%80%204%0A%20%E2%9C%A8%0A%20%F0%9F%8D%BC%0A%20%E2%9C%A8%206%0A%20%F0%9F%92%A9%20630%0A%20%F0%9F%8D%BC%207%0A%208%20%F0%9F%98%B4%0A%20%F0%9F%98%80%209%0A%20%E2%9C%A8%0A%20%F0%9F%8D%BC%0A%20%F0%9F%98%B4%2011%0A%2012%20%F0%9F%98%80%0A%20%E2%9D%A4%EF%B8%8F%20she%20rolled%20over!%0A%20%E2%9C%A8%0A%20%F0%9F%8D%BC%0A%20%F0%9F%98%B4%203%0A%20%F0%9F%98%80%204%0A%20%E2%9C%A8%0A%20%F0%9F%92%A9%0A%20%F0%9F%8D%BC%206%0A%20%F0%9F%98%B4%207%0A%20%F0%9F%8C%84%208%2030%202019%0A%20%F0%9F%98%80%204%0A%20%E2%9C%A8%0A%20%F0%9F%8D%BC%0A%20%E2%9C%A8%206%0A%20%F0%9F%92%A9%20630%0A%20%F0%9F%8D%BC%207%0A%208%20%F0%9F%98%B4%0A%20%F0%9F%98%80%209%0A%20%E2%9C%A8%0A%20%F0%9F%8D%BC%0A%20%F0%9F%98%B4%2011%0A%2012%20%F0%9F%98%80%0A%20%E2%9C%A8%0A%20%F0%9F%8D%BC%0A%20%F0%9F%98%B4%203%0A%20%F0%9F%98%80%204%0A%20%E2%9C%A8%0A%20%F0%9F%92%A9%0A%20%F0%9F%8D%BC%206%0A%20%F0%9F%98%B4%207)

POOP is the *Programming Option for Overtired Parents*. It is a Tree Language for sleep deprived parents to log their child's bathroom, feeding, and sleep events. You can use POOP with computers or pen and paper. Each line records an event, a time, and optionally notes.

POOP is an anyfix language. You can put the time first or the event type first. You can write the actual symbols with pen or pencil, or, if it is 3am, you can just use some of the natural medium to record the event type.

## Quick Example

    🌄 8 29 2019
    😀 4
    ✨ 6
    630 💩


## Quick facts about poop

- poop has 9 node types.
- poop has 3 cell types
- The source code for poop is 60 lines long.

## Node Types

    poopNode
    abstractEventNode
     bowelNode
     bladderNode
     bottleNode
     sleep4Node
     awakeNode
     memoryNode
    dayNode

## Cell Types

    dateIntCell
    timeIntCell
    anyCell

This readme was auto-generated using the [JTree library](https://github.com/treenotation/jtree).

## License

💩 is just for fun, a demonstration Tree Language brought to you by the Tree Notation Lab. 💩 is hereby dumped into the public domain.

