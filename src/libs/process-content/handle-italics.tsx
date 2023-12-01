import { ReactNode } from "react";
import reactStringReplace from "react-string-replace";

export const handleItalics = (str: ReactNode[]): ReactNode[] => {
  const rxItalicsRef = /\*(.*?)\*/g;
  return reactStringReplace(str, rxItalicsRef, (match, i) => (
    <i key={i}>{match}</i>
  ));
};
