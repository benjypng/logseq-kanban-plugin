import { ReactNode } from "react";
import reactStringReplace from "react-string-replace";

export const handleBold = (str: ReactNode[]): ReactNode[] => {
  const rxBoldRef = /\*\*(.*?)\*\*/g;
  return reactStringReplace(str, rxBoldRef, (match, i) => (
    <b key={i}>{match}</b>
  ));
};
