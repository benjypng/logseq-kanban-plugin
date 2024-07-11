import { ReactNode } from 'react'
import reactStringReplace from 'react-string-replace'

export const handleMarkdownLink = (str: ReactNode[]): ReactNode[] => {
  const rxLinkRef = /(https:\/\/[\w.-]+(?:\/[\w.-]*)*)/gi
  const rxLinkNameRef = /\[(.*?)\]/gi
  const newStr = rxLinkRef.exec(str as unknown as string)
  if (!newStr) return str

  const urlName = rxLinkNameRef.exec(str as unknown as string)
  if (!urlName) return str

  return reactStringReplace(newStr[0], rxLinkRef, (match, i) => (
    <a key={match + i} href={match} className="external-link" target="_blank">
      {urlName[1]}
    </a>
  ))
}
