import type { Dictionary } from './index'

/**
 * Spanish dictionary. Structurally checked against `en.ts` by the `Dictionary`
 * annotation below — a missing or misspelled key fails `npm run typecheck`.
 *
 * Copy is translated, not transliterated: line lengths are kept close to the
 * English source so the approved display-type geometry (Hero's two-line
 * headline, Content Universe's one-word-per-line kinetic entries, the nav
 * bar's six centre labels) holds without reflowing. See `en.ts`'s top comment
 * for what is deliberately left untranslated.
 */
export const es: Dictionary = {
  meta: {
    title: 'CarterPCs — Concepto de portafolio',
    description:
      'Concepto de portafolio interactivo no oficial inspirado en CarterPCs.',
  },

  a11y: {
    skipToContent: 'Saltar al contenido',
    primaryNavigation: 'Principal',
    chooseTheme: 'Elegir tema',
    chooseLanguage: 'Elegir idioma',
    themeMenu: 'Tema',
    languageMenu: 'Idioma',
  },

  nav: {
    sections: [
      'Proyectos',
      'Sistemas',
      'Proceso',
      'Impacto',
      'Contenido',
      'Universo',
    ],
    about: 'Sobre Carter',
    themes: {
      dark: 'Oscuro',
      light: 'Claro',
      system: 'Sistema',
    },
    languages: {
      en: 'Inglés',
      fr: 'Francés',
      es: 'Español',
    },
  },

  hero: {
    eyebrow: 'Ordenadores cinemáticos',
    headlineLabel: 'CarterPCs — Hecho diferente',
    headlineLineOne: 'Hecho',
    headlineLineTwo: 'diferente',
    support:
      'Tecnología que engancha. Montajes de PC, hardware y las decisiones tecnológicas del día a día.',
    ctaPrimary: 'Explorar el universo',
    ctaSecondary: 'Ver el vídeo',
    aboutTitle: 'Sobre Carter',
    aboutText:
      'Carter crea contenido tecnológico rápido y accesible: hardware, móviles, montajes y todo el mundo tech.',
    aboutLink: 'Saber más',
    // The audience line and the three stat labels sit in `white-space: nowrap`
    // slots sized against the approved English composition (see
    // Hero.module.css's .aboutAudience and the ≥1240px .statLabel rule), so
    // these are deliberately terse: a faithful-but-longer phrasing
    // ("Millones en todas las plataformas") measured 60px past its slot and
    // ran off the About card.
    audience: 'Millones en plataformas',
    statsTitle: 'En cifras',
    stats: {
      subscribers: 'Suscriptores YouTube',
      views: 'Total vistas YouTube',
      builds: 'PC a medida',
      dozens: 'Decenas',
    },
    tiles: {
      builds: {
        title: 'PC a medida',
        body: 'Ordenadores de alto rendimiento diseñados para la estética y la fiabilidad.',
      },
      content: {
        title: 'Creación de contenido',
        body: 'Contenido tecnológico cinematográfico que educa, entretiene e inspira.',
      },
      universe: {
        title: 'El universo',
        body: 'Explora los sistemas, la filosofía y el proceso detrás de todo.',
      },
    },
    featuredIn: 'Aparece en',
    disclaimer: 'Concepto no oficial. No implica afiliación ni respaldo.',
  },

  creator: {
    metaLabel: '02 / Creador',
    metaNote: 'Perfil del creador',
    kicker: 'El creador',
    headline: 'Conocimiento de hardware, sin relleno.',
    bodyOne:
      'Una crónica diaria en formato corto sobre montajes de PC, smartphones y decisiones tecnológicas cotidianas — grabada rápido, probada a mano y pensada para quien quiere lo esencial sin perder el contexto.',
    bodyTwo:
      'El tono es directo a propósito: explicaciones en lenguaje llano, la disposición a señalar el mal hardware y el marketing aún peor, y un humor que nunca se aleja del internet en el que creció.',
    tags: 'Hardware de PC — Tecnología móvil — Tecnología de consumo — Antiestafas',
    platforms: 'TikTok · YouTube Shorts · Instagram Reels',
  },

  /* Solo interfaz: los títulos de los Shorts se mantienen en inglés porque son
     los títulos realmente publicados (ver data/featured.ts). */
  featured: {
    metaLabel: '03 / Destacados',
    metaNote: 'Historias editoriales seleccionadas',
    title: 'Historias elegidas',
    playShort: 'Reproducir el Short',
    closePlayer: 'Cerrar el reproductor',
    watchShort: 'Ver el Short',
    a11y: {
      player: 'Reproductor de YouTube',
      opensInNewTab: 'se abre en una pestaña nueva',
    },
  },

  hardware: {
    metaLabel: '04 / Hardware',
    metaNote: 'Experiencia de hardware',
    kicker: 'Dentro del montaje',
    headline: 'Construido desde dentro.',
    support:
      'Cada componente juzgado por lo que hace, no por lo que promete la caja.',
    tags: 'PC a medida — Prueba de componentes — A medida vs. preensamblado',
  },

  contentUniverse: {
    metaLabel: '05 / Universo de contenido',
    metaNote: 'Todo el alcance',
    kicker: 'Más allá de las historias destacadas',
    headline: 'Seis territorios, un feed conectado.',
    support:
      'El terreno recurrente al que vuelve cada vídeo: desde los PC a medida hasta las historias que no tienen nada que ver con el hardware.',
  },

  /* The headline reuses this file's own opening of `hero.support`
     ("Tecnología que engancha"), broken after the subject so the verb phrase
     carries the second display line. */
  closing: {
    disclaimerLineOne: 'Concepto creativo independiente.',
    disclaimerLineTwo: 'Sin afiliación con CarterPCs.',
    headlineLineOne: 'Tecnología',
    headlineLineTwo: 'que engancha.',
    backToTop: 'Volver arriba',
  },

  /* `copyright` is the name only — the "©" and the year are composed in
     Footer.tsx. It follows this file's own `meta.title` wording. */
  footer: {
    copyright: 'CarterPCs — Concepto de portafolio',
    disclaimer: 'No implica afiliación ni respaldo.',
    a11y: {
      footerNavigation: 'Pie de página',
      socialLinks: 'Redes sociales',
      opensInNewTab: 'se abre en una pestaña nueva',
    },
  },
}
