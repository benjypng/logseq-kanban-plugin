import { ReactNode } from 'react'
import reactStringReplace from 'react-string-replace'

export const handlePageReference = async (
  str: ReactNode[] | string,
  name: string,
): Promise<ReactNode[]> => {
  const rxPageRef = /\[\[(.*?)\]\]/g
  return reactStringReplace(str, rxPageRef, (match, i) => {
    return (
      <a key={match + i} href={`logseq://graph/${name}?page=${match}`}>
        {match}
      </a>
    )
  })
}
