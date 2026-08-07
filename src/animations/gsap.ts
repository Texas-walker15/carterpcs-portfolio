import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Registered once at module scope — ES modules are evaluated a single time,
// so importing this file anywhere is safe and never re-registers the plugin.
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
