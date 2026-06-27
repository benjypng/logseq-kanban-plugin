import { describe, expect, it } from 'vitest'

import { removeMarkers } from './remove-markers'

describe('removeMarkers', () => {
  it('removes a leading task marker', () => {
    expect(removeMarkers('TODO write the card')).toBe('write the card')
  })

  it('keeps marker words inside task content', () => {
    expect(removeMarkers('Write TODO parser after lunch')).toBe(
      'Write TODO parser after lunch',
    )
  })
})
