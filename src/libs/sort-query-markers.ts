//@ts-nocheck
export const sortQueryMarkers = (markers, order) => {
  return markers.sort(
    (a, b) =>
      (order[a] || order.default) - (order[b] || order.default) ||
      a > b ||
      -(a < b),
  );
};
