import { ReactNode } from "react";
import reactStringReplace from "react-string-replace";

export const handleTag = (str: ReactNode[], name: string): ReactNode[] => {
  const rxTagRef = /(#(.*?))/g;
  return reactStringReplace(str, rxTagRef, (match, i) => (
    <a key={match + i} href={`logseq://graph/${name}?page=${match}`}>
      {match}
    </a>
  ));
};
