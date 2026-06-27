export const extractQueryTaskMarkers = (query: string): string[] => {
  const taskExpression = /\(task\s+([^)]+)\)/i.exec(query)
  if (!taskExpression?.[1]) return []

  return [
    ...new Set(
      taskExpression[1]
        .split(/\s+/)
        .map((marker) => marker.replace(/[^\w-]/g, '').trim())
        .filter(Boolean),
    ),
  ]
}
