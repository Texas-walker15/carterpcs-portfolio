/**
 * Featured Content — typed panel data for the Featured section
 * (ARCHITECTURE.md §4). Three editorial chapters, not a video grid.
 *
 * Content status: every `headlineLines`/`support` value below is
 * PROVISIONAL EDITORIAL DEVELOPMENT COPY, not a verified CarterPCs video
 * title or quote. RESEARCH.md §5 Notable Videos does contain specific
 * titles, but TECH_STACK.md §9 explicitly marks that table "a reference
 * list of candidates, not a cleared asset list" pending licensing review —
 * so no title from it is reproduced here, verbatim or paraphrased closely
 * enough to be mistaken for one. Instead, each panel's copy is written from
 * RESEARCH.md §3 Content Categories' *category-level* descriptions (typical
 * content, tone), the same sourcing tier CONTENT.md's own Featured Content
 * placeholders use. `category` names are taken directly from RESEARCH.md §3.
 * No follower/view counts, dates, or attributed quotes appear anywhere.
 */

export interface FeaturedStory {
  /** Panel index within Featured, distinct from the global "03 / Featured" section number. */
  index: string
  category: string
  headlineLines: string[]
  support: string
  /** Restrained editorial metadata, sourced from RESEARCH.md §3's category names. */
  tags: string[]
  /** Selects the panel's decorative media-stage variant (see Featured.module.css). */
  variant: 'hardware' | 'tech' | 'commentary'
}

export const featuredStories: FeaturedStory[] = [
  {
    index: '01',
    category: 'Hardware',
    headlineLines: ['Budget builds.', 'Extreme rigs.', 'One honest test.'],
    support:
      'Custom PCs judged on value and thermals, whether the price tag is a few hundred dollars or far beyond it.',
    tags: ['PC Hardware', 'Custom Builds', 'GPU / CPU Value'],
    variant: 'hardware',
  },
  {
    index: '02',
    category: 'Tech',
    headlineLines: ['Phones.', 'Features.', 'Everyday friction.'],
    support:
      'The devices people actually argue about, tested past what the marketing promises.',
    tags: ['Smartphones', 'Mobile Tech', 'Emerging Tech'],
    variant: 'tech',
  },
  {
    index: '03',
    category: 'Commentary',
    headlineLines: ['When the industry', 'gets it wrong,', 'someone says so.'],
    support:
      'Policy shifts, PR disasters, and scam gear, called out in plain language.',
    tags: ['Tech News', 'Scam Tech', 'Consumer Advocacy'],
    variant: 'commentary',
  },
]
