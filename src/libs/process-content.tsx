import { ReactNode } from 'react'

import { handleBlockReference } from './process-content/handle-block-reference'
import { handleBold } from './process-content/handle-bold'
import { handleImage } from './process-content/handle-image'
import { handleItalics } from './process-content/handle-italics'
import { handleLink } from './process-content/handle-link'
import { handleMarkdownLink } from './process-content/handle-markdown-link'
import { handlePageReference } from './process-content/handle-page-reference'
import { handleTag } from './process-content/handle-tag'
import { removeMarkers } from './process-content/remove-markers'

export const processContent = async (
  content: string,
): Promise<ReactNode | string> => {
  if (!content) return
  let str: ReactNode[] | string = content
  const { name, path } = (await logseq.App.getCurrentGraph())!

  // Remove markers
  str = removeMarkers(str)

  // Remove logbook
  if (str.includes(':LOGBOOK:'))
    str = str.substring(0, str.indexOf(':LOGBOOK:'))

  // Remove scheduled and deadline
  if (str.includes('SCHEDULED:') || str.includes('DEADLINE:'))
    str = str.replace(
      /(SCHEDULED|DEADLINE): <\d{4}-\d{2}-\d{2} \w{3} \d{2}:\d{2}>/g,
      '',
    )

  // Check for block reference
  str = await handleBlockReference(str, name)

  // Check for tag
  str = handleTag(str, name)

  // Check for page
  str = await handlePageReference(str, name)

  // Check for image
  str = handleImage(str, path)

  // Check for markdown link
  str = handleMarkdownLink(str)

  // Check for link
  str = handleLink(str)

  // Check for bold
  str = handleBold(str)

  // Check for italics
  str = handleItalics(str)

  return str
}
