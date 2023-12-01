import { ReactNode } from "react";
import reactStringReplace from "react-string-replace";

export const handleLink = (str: ReactNode[]): ReactNode[] => {
  const rxLinkRef = /(https:\/\/[\w.-]+(?:\/[\w.-]*)*)/gi;
  return reactStringReplace(str, rxLinkRef, (match, i) => {
    return (
      <a key={i} href={match} target="_blank" className="external-link">
        {match}
      </a>
    );
  });
};
