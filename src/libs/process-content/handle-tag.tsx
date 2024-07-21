import { ReactNode } from 'react'
import reactStringReplace from 'react-string-replace'

export const handleTag = (
  str: ReactNode[] | string,
  name: string,
): ReactNode[] | string => {
  const rxTagRef = /#(?:\[\[)?(\w+(?:\s+\w+)*)(?:\]\])?/g
  return reactStringReplace(str, rxTagRef, (match, i) => {
    if (match === '#') return str
    if (match === 'A' || match === 'B' || match === 'C') {
      return (
        <a key={match + i} href={`logseq://graph/${name}?page=${match}`}>
          {match}
        </a>
      )
    } else {
      return (
        <div key={match + i}>
          <a
            href={`logseq://graph/${name}?page=${match}`}
            className="kanban-tag"
          >
            {match}
          </a>
        </div>
      )
    }
  })
}
