import { describe, expect, it } from 'vitest'

import { createQueryBoardFromResults } from './create-query-board'

describe('createQueryBoard', () => {
  const processTaskContent = async (content: string) => `processed:${content}`

  it('creates columns for every returned marker and assigns cards', async () => {
    const board = await createQueryBoardFromResults(
      [
        { uuid: '1', content: 'DONE done task', marker: 'DONE', priority: 2 },
        { uuid: '2', content: 'TODO todo task', marker: 'TODO', priority: 1 },
        { uuid: '3', content: 'REVIEW custom task', marker: 'REVIEW' },
      ],
      [],
      processTaskContent,
    )

    expect(board.map((column) => column.id)).toEqual([
      'TODO',
      'DONE',
      'REVIEW',
    ])
    expect(board[0]?.cards).toEqual([
      { id: '2', description: 'processed:TODO todo task' },
    ])
    expect(board[1]?.cards).toEqual([
      { id: '1', description: 'processed:DONE done task' },
    ])
    expect(board[2]?.cards).toEqual([
      { id: '3', description: 'processed:REVIEW custom task' },
    ])
  })

  it('supports wrapped and Datascript-style query rows', async () => {
    const board = await createQueryBoardFromResults(
      [
        [
          {
            uuid: '1',
            content: 'WAIT wrapped task',
            marker: 'WAIT',
          },
        ],
        {
          ':block/uuid': '2',
          ':block/content': 'IN-PROGRESS keyed task',
          ':block/marker': 'IN-PROGRESS',
        },
      ],
      [],
      processTaskContent,
    )

    expect(board.map((column) => column.id)).toEqual([
      'WAIT',
      'IN-PROGRESS',
    ])
    expect(
      board.flatMap((column) => column.cards.map((card) => card.id)),
    ).toEqual(['1', '2'])
  })

  it('drops malformed rows without creating blank columns', async () => {
    const board = await createQueryBoardFromResults(
      [
        { uuid: '1', content: 'No marker' },
        { content: 'No uuid', marker: 'TODO' },
        { uuid: '2', content: 'TODO valid task', marker: 'TODO' },
      ],
      [],
      processTaskContent,
    )

    expect(board).toHaveLength(1)
    expect(board[0]?.id).toBe('TODO')
    expect(board[0]?.cards).toEqual([
      { id: '2', description: 'processed:TODO valid task' },
    ])
  })

  it('keeps requested marker columns even when there are no matching tasks', async () => {
    const board = await createQueryBoardFromResults(
      [{ uuid: '1', content: 'TODO visible task', marker: 'TODO' }],
      [],
      processTaskContent,
      ['DOING', 'DONE', 'TODO'],
    )

    expect(board.map((column) => column.id)).toEqual([
      'TODO',
      'DOING',
      'DONE',
    ])
    expect(board[1]?.cards).toEqual([])
    expect(board[2]?.cards).toEqual([])
  })
})
