import { describe, expect, it } from 'vitest'

import { extractQueryTaskMarkers } from './extract-query-task-markers'

describe('extractQueryTaskMarkers', () => {
  it('extracts markers from simple task queries', () => {
    expect(extractQueryTaskMarkers('(task DOING DONE TODO)')).toEqual([
      'DOING',
      'DONE',
      'TODO',
    ])
  })

  it('returns no markers when no task expression is present', () => {
    expect(extractQueryTaskMarkers('(and [[Project]])')).toEqual([])
  })
})
