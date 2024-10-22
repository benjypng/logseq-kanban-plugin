import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { processContent } from '../libs/process-content'
import { Column } from '../types'

const rxQuery = /\{\{query (.*?)\}\}/
export const createNormalBoardWithQuery = async (
  board: Column[],
  children: BlockEntity[],
) => {
  for (const col of children) {
    const column: Column = {
      id: col.uuid,
      title: col.content,
      cards: [],
    }
    if (!col.children) continue
    for (const crd of col.children as BlockEntity[]) {
      const queryString = rxQuery.exec(crd.content)
      if (!queryString || !queryString[1]) return board

      const queryResults = await logseq.DB.q(queryString[1])
      if (!queryResults) return board

      for (const r of queryResults) {
        const content = (await processContent(
          r.content ?? r.originalName,
        )) as string
        column.cards.push({
          id: r.uuid,
          description: content,
        })
      }
    }
    board.push(column)
  }
  return board
}
