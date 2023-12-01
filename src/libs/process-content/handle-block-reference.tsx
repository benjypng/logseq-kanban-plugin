import { ReactNode } from "react";
import reactStringReplace from "react-string-replace";

export const handleBlockReference = async (
  str: string,
  name: string,
): Promise<ReactNode[] | string> => {
  const rxUuidRef = /\(\((.*?)\)\)/g;
  const matchedUuidRefArray = rxUuidRef.exec(str);

  if (matchedUuidRefArray) {
    const blk = await logseq.Editor.getBlock(matchedUuidRefArray[1] as string);
    if (!blk) return str;
    const text = blk.content.substring(0, blk.content.indexOf("id:: "));

    return reactStringReplace(text, text, (match) => (
      <a
        href={`logseq://graph/${name}?block-id=${matchedUuidRefArray[1]?.trim()}`}
      >
        {match}
      </a>
    ));
  } else {
    return str;
  }
};
