export const removeMarkers = (str: string): string => {
  const markers = [
    "NOW",
    "LATER",
    "DOING",
    "DONE",
    "CANCELLED",
    "CANCELED",
    "IN-PROGRESS",
    "TODO",
    "WAITING",
    "WAIT",
  ];
  for (const m of markers) {
    str = str.replace(m, "");
  }
  return str;
};
