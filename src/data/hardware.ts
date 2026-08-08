/**
 * Hardware Experience — typed beat content for the Hardware section
 * (ARCHITECTURE.md §5). Three restrained internal chapter markers, not
 * clickable tabs/cards — see Hardware.tsx.
 *
 * Content status: headline/support/beat copy is original editorial
 * development language, not a CarterPCs quote. Grounded in RESEARCH.md §7's
 * "Custom PCs vs. Overpriced Prebuilts" theme (value-oriented, hands-on,
 * unfiltered-critique tone) and CONTENT.md §Hardware Sequence's category
 * list (CPU, GPU, RAM, cooling, storage, build) — used only as *category*
 * references, never as specific specs, benchmarks, or claims. No follower
 * counts, view counts, dates, prices, or attributed quotes appear anywhere.
 */

export interface HardwareBeat {
  index: string
  label: string
  description: string
}

export const hardwareBeats: HardwareBeat[] = [
  {
    index: '01',
    label: 'Build',
    description:
      'The machine as a finished object — assembled, cabled, and powered on.',
  },
  {
    index: '02',
    label: 'Components',
    description:
      'The individual pieces that matter, examined up close: GPU, CPU, cooling, storage.',
  },
  {
    index: '03',
    label: 'Performance',
    description:
      'Not a benchmark chart — what the hardware actually enables day to day.',
  },
]
