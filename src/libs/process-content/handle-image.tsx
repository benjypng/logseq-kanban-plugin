import { ReactNode } from "react";
import reactStringReplace from "react-string-replace";

export const handleImage = (str: ReactNode[], path: string): ReactNode[] => {
  const rxImgRef = /!\[(.*?)\}/g;
  return reactStringReplace(str, rxImgRef, (match, i) => {
    const filename = /\(\.\.\/assets\/(.*?)\)/.exec(match)![1];
    const height = /:height(.*?)(\d+)/.exec(match)![2];
    const width = /:width(.*?)(\d+)/.exec(match)![2];
    if (height && width) {
      return (
        <img
          key={i}
          src={`assets://${path}/assets/${filename}`}
          height={height}
          width={width}
        />
      );
    } else {
      return <img key={i} src={`assets://${path}/assets/${filename}`} />;
    }
  });
};
