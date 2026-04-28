import { describe, expect, it } from 'vitest'

import { createQueryTaskColumns } from './create-query-task-columns'

describe('createQueryTaskColumns', () => {
  it('builds DND columns from normalized query task rows', () => {
    const columns = createQueryTaskColumns([
      { uuid: '1', content: 'DONE done task', marker: 'DONE', priority: 2 },
      { uuid: '2', content: 'TODO todo task', marker: 'TODO', priority: 1 },
      {
        ':block/uuid': '3',
        ':block/content': 'REVIEW custom task',
        ':block/marker': 'REVIEW',
      },
      { uuid: '4', content: 'No marker' },
    ])
    const childUuids = (index: number) =>
      columns[index]?.children?.map((child) =>
        typeof child === 'object' && !Array.isArray(child)
          ? child.uuid
          : child[1],
      )

    expect(columns.map((column) => column.content)).toEqual([
      'TODO',
      'DONE',
      'REVIEW',
    ])
    expect(childUuids(0)).toEqual(['2'])
    expect(childUuids(1)).toEqual(['1'])
    expect(childUuids(2)).toEqual(['3'])
  })

  it('keeps requested DND marker columns without tasks', () => {
    const columns = createQueryTaskColumns(
      [{ uuid: '1', content: 'TODO visible task', marker: 'TODO' }],
      ['DOING', 'DONE', 'TODO'],
    )

    expect(columns.map((column) => column.content)).toEqual([
      'TODO',
      'DOING',
      'DONE',
    ])
    expect(columns[1]?.children).toEqual([])
    expect(columns[2]?.children).toEqual([])
  })
})
