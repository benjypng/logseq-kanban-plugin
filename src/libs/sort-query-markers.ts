export const sortQueryMarkers = (markers: any, order: any) => {
  return markers.sort(
    (a: any, b: any) =>
      (order[a] || order.default) - (order[b] || order.default) ||
      a > b ||
      -(a < b),
  )
}
