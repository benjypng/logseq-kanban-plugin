import { ReactNode } from 'react'
import reactStringReplace from 'react-string-replace'

// This code tries to approximate how logseq itself parses tags:
// - https://github.com/logseq/mldoc/blob/master/lib/syntax/inline.ml#L1296
// - https://github.com/logseq/mldoc/blob/master/lib/syntax/extended/hash_tag.ml
// - https://github.com/logseq/mldoc/blob/master/lib/parsers.ml

const processMatchedTag = (
  name: string,
  match: string,
  index: number,
): ReactNode => {
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
  // With brackets: [[ followed by any characters up to the next ]]
  const rxBracketTagRef = /#\[\[((?:[^\]]|\][^\]])*)\]\]/gu;
  str = reactStringReplace(str, rxBracketTagRef,
    (match, index) => processMatchedTag(name, match, index));

  // Without brackets: Any characters other than tag_delims, space_chars, eol_chars (see logseq/mldoc sources)
  const rxNoBracketTagRef = /#([^,;.!?'":# \t\r\n]+)/gu;
  str = reactStringReplace(str, rxNoBracketTagRef,
    (match, index) => processMatchedTag(name, match, index));

  return str;
}
