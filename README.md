![GitHub all releases](https://img.shields.io/github/downloads/hkgnp/logseq-kanban-plugin/total)

# Overview

As the name suggests, this helper plugin draws kanban boards using the outliner approach. This plugin offers 2 options:

> Please note that you should use **only** 1 of the 2 approaches. They are currently not built to be used together! E.g. if you take the 'TASKS' approach, it will not support having your own headers and will be restricted to only those 3 columns.

1. A more freeform version where you can write your own headers. This approach does not support having items like "TODO" or queries. It is meant to just use the raw text from your blocks.

![](/screenshots/demo.gif)

2. Taking the "TODO, DOING, DONE" approach. Just need to ensure that the parent block for your data is labelled `tasks` or `TASKS`. This approach supports only having the above 3 columns.

![](/screenshots/demo2.gif)

# Adding Images

> 2021/12/31: This is not tested on Windows yet

![](/screenshots/img-demo.gif)

# Credits

[react-kanban by asseinfo](https://github.com/asseinfo/react-kanban)

# Future

- [ ] Add ability to customise board's colours.
