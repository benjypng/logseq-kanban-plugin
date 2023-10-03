[:gift_heart: Sponsor this project on Github](https://github.com/sponsors/hkgnp) or [:coffee: Get me a coffee](https://www.buymeacoffee.com/hkgnp.dev) if you like this plugin!

# Overview

Draw kanban board based on your blocks. Type `/Kanban` to start. There are 3 ways to do so:

### Normal

Use your parent blocks as headers. For example, the below blocks will give you 3 columns in your kanban respectively: Column 1, Column 2, Column 3
```md
- {{renderer :kanban_651a3832-a06f-4dee-8c77-bc15908765e8}}
 - data
  - Column 1
   - The quick brown fox
  - Column 2
   - Jumped over
  - Column 3
   - The lazy dog
```

## Normal with Queries

Use your parent blocks as headers, and use `/query` function as child blocks. Advanced queries may not work.

```md
- {{renderer :kanban_651ae900-af3c-4bef-973a-77731a060b29}}
 - query
  - Column 1
   - {{query [[Cards for Column 1]]}}
  - Column 2
   - {{query [[Cards for Column 2]]}}
```

### Tasks

Use tasks to populate the Kanban board.

```md
- {{renderer :kanban_651a3832-a06f-4dee-8c77-bc15908765e8}}
 - tasks
  - TODO The quick brown fox
  - DOING Jumped over
  - DONE The lazy dog
```

### Query Tasks

Use simple queries to populate the Kanban board. Use the `/query` function. Advanced queries may not work.

```md
- {{renderer :kanban_651a3832-a06f-4dee-8c77-bc15908765e8}}
 - query-tasks
  - {{query((task TODO DONE NOW DOING WAITING))}}
```

# Adjust card or board width
You can adjust the widths of the board or cards using the parameters:
- card-<number in pixels>
- board-<number in pixels>

```md
- {{renderer :kanban_651a3832-a06f-4dee-8c77-bc15908765e8}}
 - data card-300 board-1000
  - Column 1
   - The quick brown fox
  - Column 2
   - Jumped over
  - Column 3
   - The lazy dog
```

# Credits

[react-kanban by asseinfo](https://github.com/asseinfo/react-kanban)
