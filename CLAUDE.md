# Claude

## Project

Freelance frontend developer's CV site. One page, French or English content, deployed as a static site at knive.github.io.

Central concept: a WebGL hero scene where five fantasy daggers fly through a sunset sky and embed in a bumpy dry-dirt ground (Unlimited Blade Works-like crest), each dagger representing a CV section. Clicking a dagger scrolls to that section. Each section must have its corresponding dagger to its left or right.

Art direction: painted, stylized, inspired by Arcane (Riot/Fortiche): high-contrast lighting, coloured rim light, dark scene. Inspired by it, not a copy.

## Stack

- Vite 8 + React 19 + TypeScript 6
- React Three Fiber v9 + Drei v10 (Three.js v0.186)
- @react-three/postprocessing (bloom, grain, vignette)
- TailwindCSS/cva/clsx with cn utility function — CSS custom properties in `src/styles/global.css` or in [Named] component folder.
- GSAP + ScrollTrigger for scroll-driven animation
- Deployed to GitHub Pages by a GitHub Actions workflow (Settings → Pages → Source: "GitHub Actions"). The repo is `knive.github.io`, so the site is served from the root and Vite's `base` stays `/`.

## Sections and daggers

All five are chunky and asymmetric, with a wrapped leather grip, a crystal or ornament in the guard, worn edges and runes in an emissive mask.

| Section    | Design            | Silhouette                                                                           | Glow           |
| ---------- | ----------------- | ------------------------------------------------------------------------------------ | -------------- |
| Experience | Foreman's Cleaver | Broad blade, notched spine, gear guard with amber crystal, square hook, hex pommel   | Amber/gold     |
| Skills     | Rune Fang         | Long blade, scalloped edge, runes in the fuller, forward crescent guard, hook pommel | Cyan/teal      |
| Projects   | Crescent Wave     | Wavy blade with spine hook, open crescent ring around a violet orb, star pommel      | Magenta/violet |
| Education  | Scribe's Quill    | Short thick quill-nib blade, open-book guard with green drop, bone-white grip        | Green          |
| Contact    | Ember Hook        | Saw-backed hooked blade, red worn edge, single hooking quillon, ring pommel          | Orange/red     |

Each dagger has its own glow colour AND its own pulse/flicker behaviour, so colour-blind visitors can tell them apart.

## Behaviour

- Intro: scripted keyframed flight (not physics), camera follows the lead dagger along a CatmullRomCurve3, slow-motion before impact, daggers land about 0.4 s apart with a small camera shake. 6 to 8 seconds, played once per session, with a visible Skip button.
- `playGlow(daggerId, intensity)` is the single function for the landing effect and the hover effect (hover uses lower intensity). Landing: emissive pulse, shockwave ring, glowing floor cracks, sparks.
- Hover: raycast against an invisible, slightly oversized hit shape. Tap on touch screens triggers glow and navigation.
- Scroll: one fixed full-screen canvas behind the content. The active section's dagger lifts out of the floor and moves to the left or right margin (alternating), positioned from the section's DOM rectangle.
- After the hero, fade the floor into dark fog or a vignette so text stays readable.

## Modelling

- Procedural geometry: blades and flat ornaments are bevelled extrusions of `Outline`s (UVs map to the shape's bounds, so painted wear and runes line up), grips are a core plus a helical leather strap (`LeatherGrip`). Runes go in an emissive mask, wear in a painted blade texture. Textures can be replaced later by hand-painted ones.
- Every glowing part (blade runes, guard crystal) registers with `glowMaterialRef`, so they pulse together.
- Toon-style stepped shading with light outlines. Only runes and effects feed the bloom (luminance threshold).

## Performance budget

One scene, three quality tiers (high, medium, low), adapted with PerformanceMonitor. No real-time reflections; tiers change pixel ratio and bloom.

- Low-poly daggers (a few thousand triangles each), textures 1024 px, compressed (KTX2), GLB files Draco-compressed and under 1 MB when used.
- Few lights; one shared moving light for the active glow. No real-time shadows: use a fake contact shadow.
- Cap pixel ratio at about 1.5 to 2, pause rendering when the hero is off screen, let physics sleep once daggers rest.
- Reduce or disable post-processing on mobile and low-end devices.

## Accessibility and content

- The CV content is real HTML, readable and navigable without the canvas. The canvas is decorative and `aria-hidden`; each dagger has a keyboard-reachable HTML equivalent (link or button) that goes to its section.
- Respect `prefers-reduced-motion`: show the static final scene, no flight, no shake.
- Lazy-load the 3D scene and show a static image fallback while it loads or when WebGL is unavailable.

## Working rules

- Work in small steps. After each step the site must build and run (`pnpm run build` must pass).
- Run lint and type-check before declaring a step done, and tell me how you verified it.
- Ask before adding a new dependency.
- Keep components small: one file per dagger, one for the floor, one for the intro camera, one for the glow system.
- Commit messages follow commitlint.config.ts (conventional commits). Never bypass hooks with --no-verify

## Architecture

- `src/components/` is where there are the components used in the project
- `src/components/[Component]` is used when components have more than one file
- `.styles.ts(x)` suffix is for css styling
- `.constants.ts(x)` suffix is for constants
- `.components.ts(x)` suffix is for small blocks composing the named [Component]
- `.helpers.ts` suffix is for functions that only serve the named [Component] (geometry, texture builders); project-agnostic functions go in `src/utils/`
- Each hook has its own named file

## Reference docs

- Design system (palette, typography): @docs/design-system.md
- Placeholder dagger geometry and GLB swap: @docs/dagger-geometry.md

## Inspiration

The CV website should be inspired from <https://illoca.unseen.co> featuring a 3D Hero which stays in the view when scrolling and with each section with texts coming left and right after some animation in the 3D canvas. The same thing should happen with the daggers representing a section each.

## Additional infos

Layout: sticky header, hero about 80 vh, fixed canvas behind, camera never tilts on scroll.
Camera: low and tilted up, so the sky fills most of the frame and the daggers tower.
Environment: sunset gradient sky with stars and moon, dirt mounds (flat along the dagger row, short impact cracks only), rocks, grass and bush cards, tree line.
Glow is a 2D FX (sprites and particles); bloom only supplements it.
Landing positions come from a hand-placed config, not runtime randomness.
