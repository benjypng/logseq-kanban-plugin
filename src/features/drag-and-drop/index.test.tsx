import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
import React, { ComponentProps } from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { KanbanBoard } from './index'

vi.mock('@dnd-kit/core', async () => ({
  ...(await vi.importActual<typeof import('@dnd-kit/core')>('@dnd-kit/core')),
  DndContext: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DragOverlay: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useDroppable: () => ({ setNodeRef: () => undefined }),
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: React.PropsWithChildren) => <>{children}</>,
  verticalListSortingStrategy: vi.fn(),
}))

vi.mock('../../components/SortableItem', () => ({
  SortableItem: ({ id, children }: React.PropsWithChildren<{ id: string }>) => (
    <div data-task-id={id}>{children}</div>
  ),
}))

vi.mock('../../libs/process-content', () => ({
  processContent: async (content: string) => content,
}))

const block = (uuid: string, children: BlockEntity[] = []): BlockEntity =>
  ({ uuid, content: uuid, children }) as BlockEntity

const rect = (left: number, top: number, width = 100, height = 40) => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
})

describe('KanbanBoard drag and drop', () => {
  let initial: BlockEntity[]
  let saved: BlockEntity[]
  let renderer: ReactTestRenderer
  let moveBlock: ReturnType<typeof vi.fn>
  let getBlock: ReturnType<typeof vi.fn>
  let showMsg: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    initial = [
      block('backlog', [block('card-a', [block('subtask')]), block('card-b')]),
      block('progress', [block('card-c')]),
      block('done'),
    ]
    saved = structuredClone(initial)
    moveBlock = vi.fn(async (id, target, { before, children }) => {
      const source = saved.find((column) =>
        (column.children as BlockEntity[]).some((card) => card.uuid === id),
      )!
      const sourceCards = source.children as BlockEntity[]
      const [card] = sourceCards.splice(
        sourceCards.findIndex((item) => item.uuid === id),
        1,
      )
      if (children) {
        const parent = [
          ...saved,
          ...saved.flatMap((column) => column.children!),
        ].find((item) => (item as BlockEntity).uuid === target) as BlockEntity
        parent.children!.unshift(card!)
      } else {
        const destination = saved.find((column) =>
          (column.children as BlockEntity[]).some(
            (item) => item.uuid === target,
          ),
        )!
        const cards = destination.children as BlockEntity[]
        const index = cards.findIndex((item) => item.uuid === target)
        cards.splice(index + (before ? 0 : 1), 0, card!)
      }
    })
    getBlock = vi.fn(async (uuid) =>
      structuredClone(saved.find((column) => column.uuid === uuid)),
    )
    showMsg = vi.fn()
    vi.stubGlobal('logseq', {
      Editor: { moveBlock, getBlock },
      UI: { showMsg },
    })
    await act(async () => {
      renderer = create(<KanbanBoard data={initial} />)
    })
  })

  afterEach(() => {
    act(() => renderer.unmount())
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const context = () =>
    renderer.root.findByType(DndContext).props as ComponentProps<
      typeof DndContext
    >

  const cardsIn = (column: string) =>
    renderer.root
      .findByProps({ 'data-column-id': column })
      .findAll((node) => Boolean(node.props['data-task-id']))
      .map((node) => node.props['data-task-id'])

  const drop = async (id: string, target: string | null, below = false) => {
    const event = {
      active: {
        id,
        rect: { current: { translated: rect(0, below ? 100 : 0) } },
      },
      over: target ? { id: target, rect: rect(0, 50) } : null,
    } as DragEndEvent
    await act(async () => {
      await context().onDragEnd!(event)
    })
  }

  it('activates after movement instead of cancelling a quick drag', () => {
    expect(context().sensors![0]!.options.activationConstraint).toEqual({
      distance: 4,
    })
  })

  it('refreshes the rendered columns after a drop into empty Done', async () => {
    const original = structuredClone(initial)
    await drop('card-a', 'done')

    expect(moveBlock).toHaveBeenCalledWith('card-a', 'done', {
      before: false,
      children: true,
    })
    expect(cardsIn('backlog')).toEqual(['card-b'])
    expect(cardsIn('done')).toEqual(['card-a'])
    expect(initial).toEqual(original)
    expect(getBlock).toHaveBeenCalledWith('done', { includeChildren: true })
    expect((saved[2]!.children![0] as BlockEntity).children).toEqual([
      block('subtask'),
    ])
  })

  it.each([false, true])(
    'drops beside the first card, never inside it (below: %s)',
    async (below) => {
      await drop('card-a', 'card-c', below)
      expect(moveBlock).toHaveBeenCalledWith('card-a', 'card-c', {
        before: !below,
        children: false,
      })
      expect(cardsIn('progress')).toEqual(
        below ? ['card-c', 'card-a'] : ['card-a', 'card-c'],
      )
    },
  )

  it('keeps repeated moves and same-column ordering aligned with saved blocks', async () => {
    await drop('card-a', 'done')
    await drop('card-a', 'card-b', true)
    expect(cardsIn('backlog')).toEqual(['card-b', 'card-a'])
    await drop('card-a', 'card-b')
    expect(cardsIn('backlog')).toEqual(['card-a', 'card-b'])
    await drop('card-a', 'card-b', true)
    expect(cardsIn('backlog')).toEqual(['card-b', 'card-a'])
    expect(cardsIn('done')).toEqual([])

    for (const column of saved) {
      expect(cardsIn(column.uuid)).toEqual(
        (column.children as BlockEntity[]).map((card) => card.uuid),
      )
    }
    const ids = saved.flatMap((column) =>
      (column.children as BlockEntity[]).map((card) => card.uuid),
    )
    expect(ids.sort()).toEqual(['card-a', 'card-b', 'card-c'])
  })

  it('ignores self, unknown, and outside drops', async () => {
    await drop('card-a', 'card-a')
    await drop('card-a', 'unknown')
    await drop('unknown', 'done')
    await drop('card-a', null)
    expect(moveBlock).not.toHaveBeenCalled()
    expect(cardsIn('backlog')).toEqual(['card-a', 'card-b'])
  })

  it('clears the drag overlay on cancel without moving a card', async () => {
    await act(async () => {
      context().onDragStart!({ active: { id: 'card-a' } } as never)
    })
    expect(
      renderer.root.findAllByProps({ className: 'task dragging' }),
    ).toHaveLength(1)
    await act(async () => context().onDragCancel!({} as never))
    expect(
      renderer.root.findAllByProps({ className: 'task dragging' }),
    ).toHaveLength(0)
    expect(moveBlock).not.toHaveBeenCalled()
  })

  it.each(['move', 'refresh'])(
    'reports a %s failure and clears the overlay without claiming success',
    async (failure) => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
      if (failure === 'move')
        moveBlock.mockRejectedValueOnce(new Error('move failed'))
      else getBlock.mockResolvedValueOnce(null)
      await act(async () => {
        context().onDragStart!({ active: { id: 'card-a' } } as never)
      })
      await drop('card-a', 'done')
      expect(showMsg).toHaveBeenCalledWith(expect.any(String), 'error')
      expect(cardsIn('backlog')).toEqual(['card-a', 'card-b'])
      expect(
        renderer.root.findAllByProps({ className: 'task dragging' }),
      ).toHaveLength(0)
    },
  )

  it('targets the pointed-at card or empty column and rejects outside drops', () => {
    const collisionDetection = context().collisionDetection!
    const rectangles = new Map([
      ['backlog', rect(0, 0, 100, 200)],
      ['card-a', rect(10, 50, 80, 40)],
      ['done', rect(200, 0, 100, 160)],
    ])
    const collisionsAt = (x: number, y: number, active = 'card-b') =>
      collisionDetection({
        active: { id: active },
        pointerCoordinates: { x, y },
        collisionRect: rect(x, y),
        droppableRects: rectangles,
        droppableContainers: [...rectangles.keys()].map((id) => ({ id })),
      } as Parameters<typeof collisionDetection>[0]).map((hit) => hit.id)

    expect(collisionsAt(50, 70)).toEqual(['card-a'])
    expect(collisionsAt(250, 100)).toEqual(['done'])
    expect(collisionsAt(150, 100)).toEqual([])
    expect(collisionsAt(50, 70, 'card-a')).toEqual(['backlog'])
  })
})
