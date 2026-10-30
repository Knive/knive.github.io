# Phase F polish: styling rules, camera and moon, themed sections

How to use this file:

1. Put it at `docs/PHASE-F-polish.md` in the repo and the UI and moon references in `docs/references/` (gitignored; the images belong to Riot Games and the artists, so they stay on your machine).
2. Run the four prompts below **in order**, each in plan mode, `/clear` between them, and review the screenshots Claude Code produces before approving the next one.
3. Paste the CLAUDE.md changes (section 5) before you start. They matter most for the Tailwind problem.

## 1. What I saw on the live site (1440x900, and a quick 390x844 check)

| Observation                                                                                                                                                                                                                                        | Evidence                                                                                                                  | Matters for       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| The camera tilts up on scroll, but trees and the ground are still visible in every section                                                                                                                                                         | At 900 px and 1800 px of scroll, bare trees and a purple ground band sit in the lower third                               | Prompt 2          |
| The moon leaves the frame                                                                                                                                                                                                                          | It is visible at the top at 450 and 900 px, gone at 1800 px (Skills). It is a small white disc with a halo                | Prompt 2          |
| Section text is plain, left-aligned, one column, Cormorant on the dark scene, with a thin rule under the title                                                                                                                                     | Experience and Skills screenshots; Skills puts the text on the right and the dagger on the left, so the alternation works | Prompt 3          |
| Styling is mixed: CSS-module hashed classes (`_header_vfddj_2`, `_hero_1f2f6_1`, `_sections_1c5p6_2`, `_title_1c5p6_73`, `_entry-title_1c5p6_93`) plus a few Tailwind utilities (`h-[80vh] w-screen min-h-150 bg-primary text-primary-foreground`) | Class names read from the DOM                                                                                             | Prompt 1          |
| The hero `<section>` carries a stray class token `fontSize`, probably a style prop name leaking into `className`                                                                                                                                   | Same DOM read                                                                                                             | Prompt 1          |
| The header nav wraps onto two rows at 390 px wide, and no dagger was visible beside Skills                                                                                                                                                         | I resized without reloading, so treat this as "to verify", not confirmed                                                  | Prompt 4          |
| Console warns `THREE.Clock: This module has been deprecated`                                                                                                                                                                                       | Probably from React Three Fiber internals; only act if it is in your code                                                 | Prompt 4          |
| Content is still placeholder (`Company name`, `hello@example.com`, three identical `Project name` cards)                                                                                                                                           | `get_page_text`                                                                                                           | Not in this phase |

Why you got CSS modules: CLAUDE.md says both "TailwindCSS/cva/clsx with cn utility" and "`.styles.ts(x)` suffix is for css styling" and "CSS custom properties ... in [Named] component folder". The last two read as "write CSS next to the component". The rewrite in section 5 removes that ambiguity.

## 2. Decisions and assumptions (veto any of them)

- **Camera.** Hero keeps today's composition (landed daggers, trees, ground). The tilt gets steeper, so from the first section onwards only sky, stars, clouds and the moon are in frame. This reverses the "camera never tilts" rule in PLAN-v2; section 5 updates it.
- **Moon.** A painted sprite fixed in the sky dome, much bigger (about 14 percent of viewport height in the hero, 35 to 40 percent when fully tilted) and always in frame. Not a copy of the reference moon.
- **Section layout.** The refs use three columns split by thin vertical lines: big title left, subject in the middle, text right. I map that to title | dagger | content, mirrored on alternate sections, so the dagger floats in the middle column and the alternation you wanted stays.
- **Per-section colour theme.** Each section takes its dagger's glow colour (amber, cyan, magenta/violet, green, orange-red) for the colour grade, hairlines, counter and active nav item. The sky tint cross-fades to it.
- **Typography conflict.** Your CLAUDE.md says "no tracked-out ALL CAPS labels", but the refs are exactly that (wide-tracked caps, condensed display numbers). Prompt 3 asks Claude Code to propose two type systems and wait for you: (A) a condensed display face for titles and numbers plus a light grotesk body, closest to the refs; (B) keep Cinzel and Cormorant, with wide-tracked Cinzel caps. I would pick A.
- **Order.** Migration to Tailwind first, so the new section UI is written in Tailwind from the start instead of being migrated twice.

## 3. Prompts

### Prompt 1: styling rules and Tailwind migration (no visual change)

```
Read CLAUDE.md (I have updated the Styling rules section).

STEP 1: DIAGNOSE (no code changes)
On the live site the DOM shows CSS-module hashed classes (_header_vfddj_2, _hero_1f2f6_1, _sections_1c5p6_2, _title_1c5p6_73, _entry-title_1c5p6_93) next to a few Tailwind utilities, and the hero <section> has a stray class token "fontSize". Tell me:
- every *.module.css or other CSS file under src/, and which component uses each;
- the Tailwind version and how it is wired (@theme, @tailwindcss/vite or PostCSS);
- whether a cn() helper exists, where, and whether clsx, tailwind-merge and class-variance-authority are installed;
- where the "fontSize" class comes from.

STEP 2: PLAN a pure refactor with zero visual change
- Convert every component to Tailwind utility classes with cn(); variants with cva in `[Component].styles.ts` (class strings only, never CSS).
- Design tokens (palette from CLAUDE.md, fonts, spacing, per-section accent colours) go into an @theme block in src/styles/global.css; keyframes and base styles stay in that file. No other .css file.
- Migration order, one commit each: Header, Hero, Sections shell, Experience, Skills, Projects, Education, Contact.
- A guard so it cannot come back: an ESLint no-restricted-imports rule for `*.css` imports outside the app entry. Ask before adding any dependency (for example prettier-plugin-tailwindcss).
- Verification: before touching anything, capture baseline screenshots at 1440x900 and 390x844 for: hero, and each section centred in the viewport, into docs/review/baseline/ (gitignored). After each component, recapture and pixel-diff against the baseline; report the diff percentage and show me anything above 0.5 percent. The WebGL canvas will differ between runs, so mask it or compare only the HTML layer.
- Delete each .module.css file as soon as its component is migrated.
Wait for my approval of the plan before coding.
```

Done when: no `.module.css` file remains, the baseline diffs are under 0.5 percent, and `pnpm run build` and lint pass.

### Prompt 2: steeper camera tilt, no trees in sections, bigger painted moon

Paste the moon reference (the red moon with painted craters) with this prompt.

```
Read CLAUDE.md and docs/PHASE-F-polish.md. The pasted image is my reference for the moon: mood, scale and painted treatment, not something to copy.

STEP 1: DIAGNOSE (no code changes)
Tell me: how scroll maps to camera pitch today (file, constants, pitch at the hero and at each section); why trees and the ground are still in frame in every section (at 900 px and 1800 px scroll, 1440x900); why the moon leaves the frame after the first section; and whether the dagger float anchors are computed in world space or camera space.

STEP 2: PLAN (commit in two steps: camera first, moon second)
a) Camera. Keep the tilt-up on scroll, but steeper. The hero keeps its current composition. By the time the Experience section is in view, the horizon, ground and every tree must be out of frame at every viewport from 390x844 to 1920x1080. From there to Contact only sky, stars, clouds and the moon are visible. Eased pitch driven by scroll progress, no roll, a slow continued drift (star and cloud parallax, moon rising slightly) so nothing feels frozen. All tuning values in one constants file.
b) Once ground, trees, rocks and bushes are out of frame, stop rendering them (visible = false) and confirm the frame-time gain.
c) Moon. A painted sprite fixed on the sky dome so it moves with the pitch. Size: about 14 percent of viewport height in the hero, growing to about 35 to 40 percent when fully tilted; it stays in frame in every section and sits behind the dagger/title area, not behind body text (per breakpoint). Look: large flat crater shapes with lighter lit edges and darker facets, a thin rim light, a soft additive halo, and dark painted cloud streaks drifting across it. Pale cool moon with a warm rim in the hero; its tint shifts by at most 25 percent toward the active section's accent colour. Propose how to produce the texture: a generator script in scripts/ that paints it procedurally into a 2048x2048 image (then compressed), or I provide my own. Original crater layout.
d) Stars: more of them visible as the pitch rises, gentle twinkle, one Points object.
e) Dagger float anchors must live in camera/view space (derived from the section's DOM rectangle) so changing the pitch cannot misalign them. Fix it if they are world-space.
f) Tiers: the moon sprite stays on all tiers; reduce halo and cloud streaks on the low tier.
g) Verification: screenshots at 1440x900 and 390x844 at: hero, and each section centred. For each, report: trees visible (yes/no), moon visible and its height as a percent of the viewport, dagger beside the section (yes/no). Compare with the reference and say what still differs.
Wait for my approval of the plan before coding.
```

Done when: every section screenshot shows sky, stars and moon only, the moon is in frame in all five, and daggers still sit beside their sections.

### Prompt 3: section UI in the theme of the references

Paste UI references 2, 3, 5 and 6 (the pink/blue, magenta/blue, green and green-street slides). They are concept art for a series landing page: use the structure and the effects, not the content or branding.

```
Read CLAUDE.md and docs/PHASE-F-polish.md. The pasted images are UI concept art. Study how they work, then translate the system to my five sections (Experience, Skills, Projects, Education, Contact).

STEP 1: ANALYSE AND PROPOSE (no code)
List what makes the references work: the three-column grid divided by thin vertical hairlines; the big wide-tracked title with stacks of faint ultra-wide-tracked ghost lines around it; the small condensed number above a condensed caps heading; the light small body text; the bordered thumbnail with a frosted circular button; the "01/05" counter; the minimal tracked-caps nav; per-slide colour grade, grain and vignette.
Then propose, as a short written spec with one text mockup per section:
1. Grid: title | dagger | content, mirrored on alternate sections; single column on mobile with only the outer hairlines.
2. Per-section accent from the dagger glow colours (amber, cyan, magenta/violet, green, orange-red), exposed as a CSS variable set by a data-section attribute in global.css and used through Tailwind (for example text-(--accent)). Use it for the colour grade, hairlines, counter and active nav item.
3. Title block: the number, the big title (long titles such as "Experience" and "Education" must fit their column; use container-relative sizing and tell me the minimum size on 390 px), a small italic line under it, and 3 or 4 ghost lines (aria-hidden) with a short phrase per section. Use placeholder phrases and list them for me to edit.
4. Content cards: thin 1px borders, small numbers on each entry, light body text. Projects use bordered thumbnails with a frosted circular "open" button; each entry stays a real link with a visible focus ring in the accent colour.
5. Counter "01/05" bottom-right that follows the active section, and an active state on the header nav in the accent colour.
6. Colour grade and grain: accent gradients at 15 to 25 percent over the canvas, an SVG or tiny tiled-noise grain overlay, a vignette; the sky tint in the 3D scene cross-fades to the accent in about 0.6 s on section change.
7. Motion: section content slides in from its side with a stagger, hairlines draw from top to bottom, the counter changes; everything off under prefers-reduced-motion.
8. Readability: where body text sits over bright sky or the moon, add a scrim or a backdrop-blur panel so contrast stays at least 4.5:1; say how you will measure it.
9. Typography: the references use wide-tracked caps and a condensed display face, which conflicts with the current Design system rule in CLAUDE.md. Render a specimen page for two options and wait for my choice: (A) a condensed display face for titles, numbers and nav plus a light grotesk for body (closest to the references); (B) keep Cinzel and Cormorant, with wide-tracked Cinzel caps. Do not pick for me; recommend one and say why.
10. All new strings go through the existing FR/EN mechanism (the header has an FR toggle).
Wait for my approval of the spec before coding. After approval, commit in this order: (a) tokens, SectionShell, grid and hairlines; (b) title block, ghost lines, counter; (c) content cards per section; (d) colour grade, grain, sky tint; (e) motion. All styling in Tailwind with cn() and cva, per CLAUDE.md. After each commit, screenshots at 1440x900 and 390x844 (hero and each section centred), compared with the references, then stop for my review.
```

Done when: each section is recognisably a themed slide of the same system, text is readable over the moon, and mobile is a clean single column.

### Prompt 4: polish, mobile and accessibility

```
Read CLAUDE.md. Final polish pass, in plan mode first.
1. Mobile (390x844): the header nav wraps onto two rows and I could not see a dagger beside Skills. Reproduce, then fix: a compact header (name plus a menu or a single row), and the daggers as small edge accents that stay visible.
2. Header and hero: the name and job title in the hero fade out as the camera tilts; no overlap with the moon; sticky header stays readable over the sky at every scroll position.
3. Accessibility review (WCAG 2.1 AA): contrast of text over the moving sky and the moon, keyboard navigation through nav, sections and dagger links, visible focus states in the accent colour, heading order, prefers-reduced-motion (no tilt animation, no float, static moon), canvas aria-hidden.
4. Performance: frame time on a throttled CPU, bundle size change since Phase E, no work on hidden elements, texture sizes. Report numbers before and after.
5. Check whether the "THREE.Clock has been deprecated" console warning comes from our code or from a dependency; fix only if it is ours.
Show me the findings and a plan before changing anything; commit per item.
```

## 4. Review checklist (for you, after each prompt)

- Prompt 1: does the site look identical, and does `git grep module.css` return nothing?
- Prompt 2: in every section screenshot, any tree or ground left? Is the moon in frame and big enough to feel like a feature?
- Prompt 3: can you tell the sections apart by colour at a glance? Is body text comfortable to read over the moon? Do the titles fit on 390 px?
- Prompt 4: keyboard-only walkthrough of the whole page, once with reduced motion on.

## 5. CLAUDE.md changes

Replace the `TailwindCSS/cva/clsx ...` line in Stack and the Architecture styling bullets with:

```
## Styling rules (strict)
- All styling is Tailwind utility classes in JSX, composed with `cn()` (clsx + tailwind-merge). Tailwind v4 syntax (check package.json for the version).
- Variants use `cva` in `[Component].styles.ts`. That file contains only Tailwind class strings, never CSS.
- Design tokens (palette, fonts, spacing, per-section accents) live in the `@theme` block of `src/styles/global.css`. Per-section accent is the CSS variable `--accent`, set from a `data-section` attribute in `global.css`.
- `src/styles/global.css` is the only CSS file. Do NOT create `*.module.css`, per-component `.css`, or styled-components. If Tailwind truly cannot express something, add an `@utility` or a `@layer components` rule in `global.css` and tell me why.
- Never pass style property names (for example `fontSize`) into `className`.
```

Replace the Architecture bullet `.styles.ts(x) suffix is for css styling` with: `.styles.ts suffix holds cva variant definitions (Tailwind class strings only)`.

Replace the Scroll bullet in Behaviour with:

```
- Scroll: one fixed full-screen canvas behind the content. The camera pitches up on scroll (eased, no roll): the hero keeps the landed scene; from the first section on only sky, stars, clouds and the painted moon are in frame. Ground and trees stop rendering once out of frame. The active section's dagger floats beside it (mirrored layout: title | dagger | content), anchored in camera space from the section's DOM rectangle.
```

If your CLAUDE.md or PLAN-v2 still says "camera never tilts on scroll", delete that line. Update the Design system typography block after you choose A or B in Prompt 3. Add under Inspiration: "Section UI: Arcane landing concept references in docs/references/ (local only)".
