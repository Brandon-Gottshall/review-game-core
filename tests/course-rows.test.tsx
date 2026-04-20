// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Silence React's "not configured to support act(...)" warning in jsdom.
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import type { CourseHierarchy } from '../src/concept/hierarchy.js'
import { CourseHierarchyRows } from '../src/ui/course-rows.js'

const hierarchy: CourseHierarchy = {
  units: [
    {
      id: 'exam-1',
      label: 'Exam 1',
      kind: 'exam',
      assessmentDates: [],
      sections: [
        {
          id: 'section-a',
          label: 'Section A',
          kind: 'section',
          topics: [
            { id: 'topic-1', label: 'Topic 1', kind: 'topic' },
          ],
        },
        {
          id: 'section-b',
          label: 'Section B',
          kind: 'section',
          topics: [],
        },
      ],
    },
    {
      id: 'exam-2',
      label: 'Exam 2',
      kind: 'exam',
      assessmentDates: [],
      sections: [],
    },
  ],
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
})

const getToggle = (examId: string, sectionId?: string): HTMLButtonElement => {
  const rows = Array.from(container.querySelectorAll<HTMLElement>('.rg-exam-row, .rg-section-row'))
  const target = rows.find((row) => {
    const title = row.querySelector('.rg-exam-row__title, .rg-section-row__title')?.textContent
    if (sectionId) {
      return title === (sectionId === 'section-a' ? 'Section A' : 'Section B')
    }
    return title === (examId === 'exam-1' ? 'Exam 1' : 'Exam 2')
  })
  const toggle = target?.querySelector<HTMLButtonElement>('[data-rg-rowtoggle="true"]')
  if (!toggle) throw new Error(`Missing toggle for ${examId}${sectionId ? '/' + sectionId : ''}`)
  return toggle
}

const press = (element: HTMLElement, key: string): void => {
  act(() => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })
}

describe('CourseHierarchyRows keyboard', () => {
  it('ArrowRight expands a collapsed exam row', () => {
    const onToggleExam = vi.fn()
    act(() => {
      root.render(
        <CourseHierarchyRows
          hierarchy={hierarchy}
          expandedExamId={null}
          expandedSectionId={null}
          onToggleExam={onToggleExam}
        />,
      )
    })

    const examOne = getToggle('exam-1')
    examOne.focus()
    press(examOne, 'ArrowRight')
    expect(onToggleExam).toHaveBeenCalledWith('exam-1')
  })

  it('ArrowRight on an already-expanded exam descends to the first section toggle', () => {
    act(() => {
      root.render(
        <CourseHierarchyRows
          hierarchy={hierarchy}
          expandedExamId="exam-1"
          expandedSectionId={null}
        />,
      )
    })

    const examOne = getToggle('exam-1')
    examOne.focus()
    press(examOne, 'ArrowRight')
    const sectionA = getToggle('exam-1', 'section-a')
    expect(document.activeElement).toBe(sectionA)
  })

  it('ArrowLeft collapses an expanded row', () => {
    const onToggleExam = vi.fn()
    act(() => {
      root.render(
        <CourseHierarchyRows
          hierarchy={hierarchy}
          expandedExamId="exam-1"
          expandedSectionId={null}
          onToggleExam={onToggleExam}
        />,
      )
    })

    const examOne = getToggle('exam-1')
    examOne.focus()
    press(examOne, 'ArrowLeft')
    expect(onToggleExam).toHaveBeenCalledWith('exam-1')
  })

  it('ArrowLeft on a collapsed section ascends to its parent exam toggle', () => {
    act(() => {
      root.render(
        <CourseHierarchyRows
          hierarchy={hierarchy}
          expandedExamId="exam-1"
          expandedSectionId={null}
        />,
      )
    })

    const sectionA = getToggle('exam-1', 'section-a')
    sectionA.focus()
    press(sectionA, 'ArrowLeft')
    const examOne = getToggle('exam-1')
    expect(document.activeElement).toBe(examOne)
  })

  it('ArrowDown navigates to the next sibling at the same level', () => {
    act(() => {
      root.render(
        <CourseHierarchyRows
          hierarchy={hierarchy}
          expandedExamId="exam-1"
          expandedSectionId={null}
        />,
      )
    })

    const sectionA = getToggle('exam-1', 'section-a')
    sectionA.focus()
    press(sectionA, 'ArrowDown')
    const sectionB = getToggle('exam-1', 'section-b')
    expect(document.activeElement).toBe(sectionB)
  })

  it('Home jumps to the first toggle in the tree from any depth', () => {
    act(() => {
      root.render(
        <CourseHierarchyRows
          hierarchy={hierarchy}
          expandedExamId="exam-1"
          expandedSectionId={null}
        />,
      )
    })

    const sectionB = getToggle('exam-1', 'section-b')
    sectionB.focus()
    press(sectionB, 'Home')
    const examOne = getToggle('exam-1')
    expect(document.activeElement).toBe(examOne)
  })

  it('End jumps to the last toggle in the tree from any depth', () => {
    act(() => {
      root.render(
        <CourseHierarchyRows
          hierarchy={hierarchy}
          expandedExamId="exam-1"
          expandedSectionId={null}
        />,
      )
    })

    const examOne = getToggle('exam-1')
    examOne.focus()
    press(examOne, 'End')
    const examTwo = getToggle('exam-2')
    expect(document.activeElement).toBe(examTwo)
  })

  it('ArrowLeft on a root-level collapsed exam does not steal focus', () => {
    act(() => {
      root.render(
        <CourseHierarchyRows
          hierarchy={hierarchy}
          expandedExamId={null}
          expandedSectionId={null}
        />,
      )
    })

    const examOne = getToggle('exam-1')
    examOne.focus()
    press(examOne, 'ArrowLeft')
    expect(document.activeElement).toBe(examOne)
  })
})
