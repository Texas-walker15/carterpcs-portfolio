/**
 * The section destinations, in bar order.
 *
 * Shared by the top navigation and the footer so the two can never drift out
 * of sync: their labels already come from one place (`nav.sections` in the
 * dictionary, in this same order), and before this the hrefs were a private
 * const in Nav.tsx that the footer would have had to copy.
 *
 * The reference's six labels (Work / Systems / Process / Impact / Content /
 * Universe) described the full 11-section site, most of which is not built:
 * mapping every label to the nearest existing section left two PAIRS of
 * labels pointing at the same anchor ("Work" and "Impact" both at #featured,
 * "Content" and "Universe" both at #content-universe) — six promises, four
 * destinations. The two labels whose targets were duplicates are dropped
 * rather than renamed or pointed at invented sections: every remaining label
 * keeps exactly the destination it already had, one label per section.
 *
 * #hero stays reachable through the wordmark, #creator also through the
 * "About Carter" utility — those two are identity/utility controls, not
 * section links, so they are not part of this list.
 */
export const SECTION_HREFS = [
  '#featured',
  '#hardware',
  '#creator',
  '#content-universe',
] as const
