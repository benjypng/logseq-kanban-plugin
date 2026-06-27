import { describe, expect, it } from 'vitest'

import { normalizeQueryResult } from './normalize-query-result'

describe('normalizeQueryResult', () => {
  it('normalizes direct block entities', () => {
    expect(
      normalizeQueryResult({
        uuid: 'block-1',
        content: 'TODO direct task',
        marker: 'TODO',
        priority: 2,
      }),
    ).toEqual({
      uuid: 'block-1',
      content: 'TODO direct task',
      marker: 'TODO',
      priority: 2,
    })
  })

  it('normalizes array-wrapped block entities', () => {
    expect(
      normalizeQueryResult([
        {
          uuid: 'block-2',
          content: 'DONE wrapped task',
          marker: 'DONE',
        },
      ]),
    ).toMatchObject({
      uuid: 'block-2',
      content: 'DONE wrapped task',
      marker: 'DONE',
    })
  })

  it('normalizes Datascript-style keyed maps', () => {
    expect(
      normalizeQueryResult({
        ':block/uuid': 'block-3',
        ':block/content': 'WAIT keyed task',
        ':block/marker': 'WAIT',
        ':block/priority': '3',
      }),
    ).toEqual({
      uuid: 'block-3',
      content: 'WAIT keyed task',
      marker: 'WAIT',
      priority: 3,
    })
  })

  it('drops rows without a marker', () => {
    expect(
      normalizeQueryResult({
        uuid: 'block-4',
        content: 'No marker here',
      }),
    ).toBeUndefined()
  })

  it('keeps custom markers', () => {
    expect(
      normalizeQueryResult({
        uuid: 'block-5',
        content: 'REVIEW custom task',
        marker: 'REVIEW',
      }),
    ).toMatchObject({
      uuid: 'block-5',
      content: 'REVIEW custom task',
      marker: 'REVIEW',
    })
  })
})
