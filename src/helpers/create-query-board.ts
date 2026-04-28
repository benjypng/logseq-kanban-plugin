import { normalizeQueryResult } from '../libs/normalize-query-result'
import { processContent } from '../libs/process-content'
import { sortQueryMarkers } from '../libs/sort-query-markers'
import { Column } from '../types'
import { extractQueryTaskMarkers } from '../libs/extract-query-task-markers'

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

export const createQueryBoard = async (
  content: string,
  board: Column[],
): Promise<Column[]> => {
  const queryString = /\{\{query (.*?)\}\}/.exec(content)
  if (!queryString || !queryString[1]) return board

  const queryResults = await logseq.DB.q(queryString[1])
  if (!queryResults) return board

  return createQueryBoardFromResults(
    queryResults,
    board,
    processContent,
    extractQueryTaskMarkers(queryString[1]),
  )
}

export const createQueryBoardFromResults = async (
  queryResults: unknown[],
  board: Column[],
  processTaskContent: typeof processContent,
  requestedMarkers: string[] = [],
): Promise<Column[]> => {
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

  let markers = [
    ...new Set([
      ...requestedMarkers,
      ...normalizedResults.map(({ task }) => task.marker),
    ]),
  ]
  const order = markerOrder
  markers = sortQueryMarkers(markers, order)
  board = markers.map((m) => ({ id: m, title: m, cards: [] }))

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

  for (const { task } of normalizedResults) {
    const content = (await processTaskContent(task.content)) as string
    const assignCol = board.find((c) => c.id === task.marker)
    if (!assignCol) continue
    assignCol.cards.push({ id: task.uuid, description: content })
  }

  return board
}
