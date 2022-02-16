[[:gift_heart: Sponsor this project on Github](https://github.com/sponsors/hkgnp) or [:coffee: Get me a coffee](https://www.buymeacoffee.com/hkgnp.dev) if you like this plugin!

# Overview

As the name suggests, this helper plugin draws kanban boards using the outliner approach. This plugin offers 2 options:

> Please note that you should use **only** 1 of the 2 approaches. They are currently not built to be used together! E.g. if you take the 'TASKS' approach, it will not support having your own headers and will be restricted to only those 3 columns.

1. A more freeform version where you can write your own headers. This approach does not support having items like "TODO" or queries. It is meant to just use the raw text from your blocks.

![](/screenshots/demo.gif)

2. Taking the "TODO, DOING, DONE" or "LATER, NOW, DONE" approach. Just need to ensure that the parent block for your data is labelled `tasks` or `TASKS`. This approach supports only having the above 3 columns.

![](/screenshots/demo3.gif)

# Adding block references

![](/screenshots/blockref-demo.gif)

# Adding Images

![](/screenshots/img-demo.gif)

# Adjustable Width of Cards

If you need to adjust the width of the card, just include a number (in pixels) after your kanban type. See below for instructions.

![](/screenshots/widthdemo.gif)

# Adjustable Width of Board

If you need to adjust the width of the whole board, just include a number (in pixels) after your width of the card. See video below.

![](/screenshots/boardwidth.gif)

# Using queries

If you have valid queries that produce **Task items (e.g. TODO, DOING)**, they are now supported in the Kanban as well!

![](/screenshots/queries.gif)

# Credits

[react-kanban by asseinfo](https://github.com/asseinfo/react-kanban)

# Future

- [ ] Add ability to customise board's colours.
