import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { processContent } from '../libs/process-content'
import { sortQueryMarkers } from '../libs/sort-query-markers'
import { Column } from '../types'

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

  let queryResults = await logseq.DB.q(queryString[1])
  if (!queryResults) return board

  let markers = [...new Set(queryResults.map((c: BlockEntity) => c.marker))]
  const order = markerOrder
  markers = sortQueryMarkers(markers, order)
  board = markers.map((m) => ({ id: m, title: m, cards: [] }))

  queryResults = queryResults.sort((a, b) => a.priority - b.priority)

  for (const r of queryResults) {
    const content = (await processContent(r.content)) as string
    const assignCol = board.filter((c) => c.id === r.marker)[0]
    if (!assignCol) continue
    assignCol?.cards.push({ id: r.uuid, description: content })
  }

  return board
}
