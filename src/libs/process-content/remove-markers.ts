export const removeMarkers = (str: string): string => {
  const taskMarker =
    /^(NOW|LATER|DOING|DONE|CANCELLED|CANCELED|IN-PROGRESS|TODO|WAITING|WAIT)\b\s*/

  return str.replace(taskMarker, '')
}
