import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { normalizeQueryResult } from '../libs/normalize-query-result'
import { sortQueryMarkers } from '../libs/sort-query-markers'

const markerOrder = {
  NOW: 2,
  LATER: 5,
  DOING: 4,
  DONE: 111,
  CANCELLED: 8,
  CANCELED: 9,
  'IN-PROGRESS': 7,
  TODO: 1,
  WAITING: 6,
  WAIT: 3,
  default: 999,
}

export const createQueryTaskColumns = (
  queryResults: unknown[],
  requestedMarkers: string[] = [],
): BlockEntity[] => {
  const normalizedResults = queryResults
    .map((result: unknown, index: number) => ({
      task: normalizeQueryResult(result),
      index,
    }))
    .filter(
      (
        result,
      ): result is {
        task: NonNullable<ReturnType<typeof normalizeQueryResult>>
        index: number
      } => Boolean(result.task),
    )

  normalizedResults.sort((a, b) => {
    const aPriority = a.task.priority
    const bPriority = b.task.priority

    if (aPriority !== undefined && bPriority !== undefined) {
      return aPriority - bPriority || a.index - b.index
    }
    if (aPriority !== undefined) return -1
    if (bPriority !== undefined) return 1
    return a.index - b.index
  })

  let markers = [
    ...new Set([
      ...requestedMarkers,
      ...normalizedResults.map(({ task }) => task.marker),
    ]),
  ]
  markers = sortQueryMarkers(markers, markerOrder)

  return markers.map((marker) => ({
    uuid: marker,
    content: marker,
    children: normalizedResults
      .filter(({ task }) => task.marker === marker)
      .map(({ task }) => ({
        uuid: task.uuid,
        content: task.content,
        marker: task.marker,
      })) as unknown as BlockEntity[],
  })) as unknown as BlockEntity[]
}
