/**
 * The six section destinations, in bar order.
 *
 * Shared by the top navigation and the footer so the two can never drift out
 * of sync: their labels already come from one place (`nav.sections` in the
 * dictionary, in this same order), and before this the hrefs were a private
 * const in Nav.tsx that the footer would have had to copy.
 *
 * The reference's labels (Work / Systems / Process / Impact / Content /
 * Universe) describe the full 11-section site, most of which is not built
 * yet. Every label therefore anchors to the nearest EXISTING section so no
 * link is ever dead; the mapping tightens as later sections land.
 * "About Carter" remains the sole #creator entry in spirit — Process points
 * there too only until a real process section exists.
 */
export const SECTION_HREFS = [
  '#featured',
  '#hardware',
  '#creator',
  '#featured',
  '#content-universe',
  '#content-universe',
] as const
