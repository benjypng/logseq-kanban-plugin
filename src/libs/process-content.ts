export const processContent = (content: string) => {
  // Remove markers
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
    content = content.replace(m, "");
  }

  // Remove logbook
  if (content.indexOf(":LOGBOOK:") !== -1)
    content = content.substring(0, content.indexOf(":LOGBOOK:"));

  return content;
};
