import { ReactNode } from "react";
import reactStringReplace from "react-string-replace";

export const handleLink = (str: ReactNode[]): ReactNode[] => {
  const rxLinkRef = /(https:\/\/[\w.-]+(?:\/[\w.-]*)*)/gi;
  return reactStringReplace(str, rxLinkRef, (match, i) => (
    <a key={i} href={match} className="external-link" target="_blank">
      {match}
    </a>
  ));
};
