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
 *
 * LOCALIZATION: every text field is a `Localized` record carrying all three
 * languages, stored next to the structural fields (`index`, `variant`) that
 * the copy must stay in sync with. `getFeaturedStories(language)` resolves one
 * language into the flat `FeaturedStory` shape the section renders. The French
 * and Spanish headlines keep the English version's three-beat cadence and
 * comparable line lengths, because the panel's display type is set to that
 * measure. Nothing here is machine-translated at runtime.
 */

import { localize, type Language, type Localized } from '../i18n'

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

/** Authoring shape: structure once, copy three times. */
interface FeaturedStorySource {
  index: string
  variant: FeaturedStory['variant']
  category: Localized<string>
  headlineLines: Localized<string[]>
  support: Localized<string>
  tags: Localized<string[]>
}

const featuredStorySources: FeaturedStorySource[] = [
  {
    index: '01',
    variant: 'hardware',
    category: {
      en: 'Hardware',
      fr: 'Matériel',
      es: 'Hardware',
    },
    headlineLines: {
      en: ['Budget builds.', 'Extreme rigs.', 'One honest test.'],
      fr: ['Petits budgets.', 'Machines extrêmes.', 'Un test honnête.'],
      es: ['Montajes económicos.', 'Equipos extremos.', 'Una prueba honesta.'],
    },
    support: {
      en: 'Custom PCs judged on value and thermals, whether the price tag is a few hundred dollars or far beyond it.',
      fr: 'Des PC sur mesure jugés sur le rapport qualité-prix et les températures, que la facture soit de quelques centaines d’euros ou bien davantage.',
      es: 'PC a medida juzgados por su relación calidad-precio y sus temperaturas, cueste unos cientos de euros o mucho más.',
    },
    tags: {
      en: ['PC Hardware', 'Custom Builds', 'GPU / CPU Value'],
      fr: ['Matériel PC', 'PC sur mesure', 'Valeur GPU / CPU'],
      es: ['Hardware de PC', 'PC a medida', 'Valor GPU / CPU'],
    },
  },
  {
    index: '02',
    variant: 'tech',
    category: {
      en: 'Tech',
      fr: 'Tech',
      es: 'Tecnología',
    },
    headlineLines: {
      en: ['Phones.', 'Features.', 'Everyday friction.'],
      fr: ['Téléphones.', 'Fonctionnalités.', 'Frictions du quotidien.'],
      es: ['Teléfonos.', 'Funciones.', 'Fricciones diarias.'],
    },
    support: {
      en: 'The devices people actually argue about, tested past what the marketing promises.',
      fr: 'Les appareils dont on débat vraiment, testés au-delà des promesses du marketing.',
      es: 'Los dispositivos sobre los que la gente discute de verdad, probados más allá de lo que promete el marketing.',
    },
    tags: {
      en: ['Smartphones', 'Mobile Tech', 'Emerging Tech'],
      fr: ['Smartphones', 'Tech mobile', 'Tech émergente'],
      es: ['Smartphones', 'Tecnología móvil', 'Tecnología emergente'],
    },
  },
  {
    index: '03',
    variant: 'commentary',
    category: {
      en: 'Commentary',
      fr: 'Analyse',
      es: 'Opinión',
    },
    headlineLines: {
      en: ['When the industry', 'gets it wrong,', 'someone says so.'],
      fr: ['Quand l’industrie', 'se trompe,', 'quelqu’un le dit.'],
      es: ['Cuando la industria', 'se equivoca,', 'alguien lo dice.'],
    },
    support: {
      en: 'Policy shifts, PR disasters, and scam gear, called out in plain language.',
      fr: 'Virages réglementaires, fiascos de communication et matériel frauduleux, dénoncés en langage clair.',
      es: 'Giros normativos, desastres de comunicación y aparatos fraudulentos, señalados en lenguaje llano.',
    },
    tags: {
      en: ['Tech News', 'Scam Tech', 'Consumer Advocacy'],
      fr: ['Actus tech', 'Arnaques tech', 'Défense du consommateur'],
      es: ['Noticias tech', 'Tecnología fraudulenta', 'Defensa del consumidor'],
    },
  },
]

/** Panel count is language-independent — safe for layout math before a render. */
export const featuredStoryCount = featuredStorySources.length

export function getFeaturedStories(language: Language): FeaturedStory[] {
  return featuredStorySources.map((story) => ({
    index: story.index,
    variant: story.variant,
    category: localize(story.category, language),
    headlineLines: localize(story.headlineLines, language),
    support: localize(story.support, language),
    tags: localize(story.tags, language),
  }))
}
