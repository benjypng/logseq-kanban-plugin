import { ReactNode } from 'react'
import reactStringReplace from 'react-string-replace'

const processMatchedTag = (
  str: ReactNode[] | string,
  match: string,
  index: number
): ReactNode => {
  if (match === '#') return str;
  if (match === 'A' || match === 'B' || match === 'C') {
    return (
      <a key={match + index} href={`logseq://graph/${name}?page=${match}`}>
        {match}
      </a>
    );
  } else {
    return (
      <div key={match + index}>
        <a
          href={`logseq://graph/${name}?page=${match}`}
          className="kanban-tag"
        >
          {match}
        </a>
      </div>
    );
  }
}

export const handleTag = (
  str: ReactNode[] | string,
  name: string,
): ReactNode[] | string => {
  const rxNoBraceTagRef = /#(\w+)/g;
  str = reactStringReplace(str, rxNoBraceTagRef,
    (match, index) => processMatchedTag(str, match, index));

  const rxBraceTagRef = /#\[\[(\w+(?:\s+\w+)*)\]\]/g;
  str = reactStringReplace(str, rxBraceTagRef,
    (match, index) => processMatchedTag(str, match, index));

  return str;
}
