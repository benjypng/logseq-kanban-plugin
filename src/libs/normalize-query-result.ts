export interface NormalizedQueryTask {
  uuid: string
  content: string
  marker: string
  priority?: number
}

const blockKeys = [
  'block',
  'result',
  'entity',
  'task',
  ':block',
  ':result',
  ':entity',
  ':task',
]

const getValue = (row: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null) return value
  }
}

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return
  return value as Record<string, unknown>
}

const normalizePriority = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string' || value.trim() === '') return

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const findRecordWithTaskFields = (
  value: unknown,
): Record<string, unknown> | undefined => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findRecordWithTaskFields(item)
      if (result) return result
    }
    return
  }

  const row = asRecord(value)
  if (!row) return

  const marker = getValue(row, ['marker', ':block/marker'])
  const uuid = getValue(row, ['uuid', ':block/uuid', 'id', ':db/id'])
  const content = getValue(row, [
    'content',
    ':block/content',
    'originalName',
    'original-name',
    'name',
    ':block/name',
  ])

  if (marker !== undefined || uuid !== undefined || content !== undefined) {
    return row
  }

  for (const key of blockKeys) {
    const result = findRecordWithTaskFields(row[key])
    if (result) return result
  }
}

export const normalizeQueryResult = (
  value: unknown,
): NormalizedQueryTask | undefined => {
  const row = findRecordWithTaskFields(value)
  if (!row) return

  const uuid = getValue(row, ['uuid', ':block/uuid', 'id', ':db/id'])
  const content = getValue(row, [
    'content',
    ':block/content',
    'originalName',
    'original-name',
    'name',
    ':block/name',
  ])
  const marker = getValue(row, ['marker', ':block/marker'])

  if (typeof marker !== 'string' || marker.trim() === '') return
  if (typeof uuid !== 'string' && typeof uuid !== 'number') return
  if (typeof content !== 'string' || content.trim() === '') return

  const priority = normalizePriority(
    getValue(row, ['priority', ':block/priority', 'priorityNumber']),
  )
  const task: NormalizedQueryTask = {
    uuid: String(uuid),
    content,
    marker: marker.trim(),
  }

  if (priority !== undefined) task.priority = priority

  return task
}
