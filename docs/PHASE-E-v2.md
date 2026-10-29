# Phase E v2: the 4-second flight intro

How to use this file:

1. Put this file at `docs/PHASE-E-v2.md` in the repo (the prompt refers to it) and `mha-storyboard.png` in `docs/references/`. That folder is gitignored; the frames belong to the anime's owners, so they stay on your machine. Claude Code cannot watch a video, so the storyboard is its only view of the clip.
2. Update the intro lines in CLAUDE.md (section 6).
3. Start Claude Code in plan mode, paste the storyboard image with Ctrl+V, then paste the prompt from section 4.

## 1. What the reference clip actually does

I went through your clip frame by frame. The first 0.7 s is a black lead-in, so the action runs from clip time 0.75 s to about 4.5 s. Times below are clip times, as burned into the storyboard.

| Clip time   | What happens                                                                                                                                                                                                                          | What to reproduce                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 0.75 to 0.9 | A lens-flare star ignites at screen centre with a long horizontal anamorphic streak.                                                                                                                                                  | Ignition: a point of light with a cross flare and a horizontal streak, from black.        |
| 1.0 to 1.5  | Blue shot. A glowing head with a thick white-hot trail crosses the frame on a diagonal. The whole frame floods saturated blue, a noisy textured sphere blooms (1.125), a 4-point cross flare grows until the screen whites out (1.5). | One shot = one colour. Full-frame tint, an orb sprite, a cross flare, a whiteout.         |
| 1.6 to 2.0  | Back to dark cloudy sky. A white beam sweeps through, then a red shot with a curved arc trail (1.875).                                                                                                                                | Dark cloud layers between colour shots, and curved trails, not only straight ones.        |
| 2.0 to 2.4  | Two trails (white and magenta) cross in an X with a green lens dot.                                                                                                                                                                   | Other daggers' trails stay visible and cross the frame while the camera follows one head. |
| 2.5 to 2.75 | Green flood, a vertical trail with light rays.                                                                                                                                                                                        | Same recipe, new colour, new camera angle.                                                |
| 2.9 to 3.4  | Curved arc trails, an orange flash at 3.125.                                                                                                                                                                                          | Arcs again, each at a different angle.                                                    |
| 3.6 to 3.9  | Magenta burst then whiteout.                                                                                                                                                                                                          |                                                                                           |
| 4.1 to 4.5  | Yellow burst, then a full white screen.                                                                                                                                                                                               | Finale burst then whiteout.                                                               |

What defines the look:

- **Hard cuts about every 0.4 to 0.5 s**, each cut hidden by a colour flash. There is no smooth camera travel between targets.
- **The tint is a strong flood**, 60 to 90 percent of the frame, not a faint wash.
- **The camera is glued to the head**, very close, and the head is often off-centre. The trail sweeps through the lens.
- **Radial speed lines** from a vanishing point, thin, multi-coloured (teal, violet, yellow, white), pulsing with speed. The vanishing point changes every shot.
- **The 2D FX are the style**: textured orb spheres, cross flares, horizontal streaks, painted-edge trail ribbons. These are sprites and quads, so they are cheap.
- **No repetition**: every shot has a different angle, roll, trail shape and length.

## 2. Why the current version misses (your feedback, mapped to likely causes)

I have not read the code, so Claude Code must confirm each cause in the diagnosis step.

| Your feedback                                         | Likely cause                                                                                      | Fix                                                                                                                                                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The camera alternating between daggers is invisible   | A smooth interpolation between targets and a faint tint                                           | Hard cuts hidden by a saturated flash. Each shot has its own camera archetype.                                                                                                                                                 |
| Not dynamic, repetitive, no chaos                     | One periodic braid (the same sinusoids for every dagger)                                          | Seeded, per-dagger path generator with different archetypes, noise displacement and uneven speed pulses.                                                                                                                       |
| The split before landing looks like it stops abruptly | A velocity or orientation discontinuity when switching from the flight path to the landing motion | One continuous clock. The flight spline hands over to the landing spline with matched position, tangent and speed. A smooth global time-scale curve produces the slow motion. Orientation follows a damped spring, not a snap. |
| Too long                                              | 6 to 8 s timeline from the old CLAUDE.md                                                          | 4.0 s, see section 3.                                                                                                                                                                                                          |

## 3. Timeline (4.0 s)

Assumption to confirm: the 4.0 s run from the first flare to the last impact. The settle (dust, embers, crack glow, title fade-in) plays on top of the final scene afterwards and never blocks interaction.

| Time (s)     | Beat                       | Camera                                            | FX                                                                                         |
| ------------ | -------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 0.00 to 0.20 | Black, ignition            | Static                                            | Flare star with horizontal streak at centre                                                |
| 0.20 to 0.75 | Skills dagger, cyan        | Head-cam, close, rolled about 12 degrees          | Cyan flood, orb sprite, cross flare, speed lines                                           |
| 0.75 to 1.25 | Contact dagger, orange-red | Higher and further back, opposite roll            | Curved arc trail, red flood                                                                |
| 1.25 to 1.70 | Education dagger, green    | Low, looking up along the trail                   | Vertical trail, green flood                                                                |
| 1.70 to 2.20 | Experience dagger, amber   | Side-on pass, head crosses the frame              | Other trails cross in an X                                                                 |
| 2.20 to 2.75 | Projects dagger, magenta   | Closest to the lens, the head nearly touches it   | Cross flare grows                                                                          |
| 2.75 to 3.10 | Convergence                | Cut to a wide shot behind the group               | All five heads and trails braid into one burst, whiteout at 3.0                            |
| 3.10 to 4.00 | Landing                    | Low wide hero camera, ends on the Phase D framing | Time scale 1.0 to 0.12, staggered impacts, shake, painted impact FX, cracks via `playGlow` |

Beat durations vary on purpose (0.45 to 0.55 s). Colours come from the glow colours in CLAUDE.md.

## 4. The prompt (plan mode)

```
We are redoing Phase E, the intro flight. Read CLAUDE.md first. The pasted storyboard is the reference: 20 frames from an anime clip, with timestamps. Also read docs/PHASE-E-v2.md for the beat table and the timeline.

STEP 1: DIAGNOSE (no code changes)
Read the current intro code and tell me, for each of these problems, the actual cause in the code:
(a) the camera alternation between daggers is not perceptible, and the colour tint is too faint;
(b) the flight is repetitive: the daggers just intermingle with each other;
(c) just before landing the daggers split and seem to stop abruptly before the slow-motion landing;
(d) the intro is longer than 4 s.
Name the files and functions involved.

STEP 2: PLAN
Then propose a plan for a rewrite with these requirements. Do not code before I approve the plan.

A. One clock, pure function of time.
Everything in the intro (paths, cameras, FX, flashes, landing) is a pure function of one intro time t, with a global timeScale(t) curve. No per-frame random numbers and no state that depends on frame rate. This makes it scrubbable and testable.

B. Timeline: exactly 4.0 s from first flare to last impact, as in docs/PHASE-E-v2.md section 3. Beats and colours as listed there. Settle FX continue after t = 4.0 but do not block the UI. Skip button stays. Play once per session. prefers-reduced-motion shows the final scene.

C. Shot director (hard cuts).
- Each beat is a head-cam on one dagger: camera behind and beside the head, distance 1.2 to 3.0 m, head off-centre in the frame (30 to 70 percent), lookAt slightly ahead of the head.
- Every beat has a different camera archetype: roll (alternate sign, 8 to 25 degrees), lateral offset, height, FOV (70 to 100, widening with speed), and a low-frequency handheld noise.
- No interpolation between beats. The cut happens at the peak of a full-screen flash in the beat's colour: alpha 0 to 0.9 in about 2 frames, hold 1 to 2 frames, decay about 0.12 s. The flood must be strong, not a faint tint.
- Other daggers' trails are in the scene, so they cross the frame during a shot.

D. Paths with real variety.
- A seeded generator (mulberry32 or similar), one path per dagger, from a small set of archetypes (steep dive, helix with a turn, low skim across the horizon, S-curve whip, wide arc). No two daggers share an archetype in one run.
- Each path: a CatmullRomCurve3 with 6 to 9 control points with jittered radius and height, plus 2-octave curl-noise displacement. Non-uniform speed: bursts and pulses, not constant speed.
- The paths must cross each other at least 3 times in world space, and the convergence beat must bring all five together.
- Ship a fixed, hand-picked seed. Support ?seed=123 in dev so I can re-roll and choose. Add only a tiny per-visit jitter (noise phase) that cannot break the composition.

E. 2D FX, painted-looking (this is the style, not an add-on).
- Heads: noisy-sphere orb flipbook (8 frames, stepped at 12 fps, "on twos"), 4-point cross flare, horizontal anamorphic streak.
- Trails: camera-facing ribbon (about 48 segments), tapered, UV along the length, white-hot core with a coloured fringe from a painted gradient texture. Trail lifetime 0.35 to 0.6 s.
- Speed lines: one fullscreen shader or one InstancedMesh (150 to 250 thin quads), radial from a vanishing point that follows the head's velocity direction. Palette: teal, violet, yellow, white. Pulsing with speed.
- Sky: stars, 2 or 3 dark cloud layers with parallax, visible between colour shots.
- Reveal the dagger: in the last 0.15 s of each beat, the camera or the dagger rolls so the blade crosses the frame as a backlit silhouette for 3 to 4 frames. The viewer must see these are daggers and not shooting stars.
- Everything is sprites, instanced or batched. Budget: at most about 15 draw calls for the intro FX.
- I am not asking for a particle library. Ask before adding any dependency.

F. Landing, without a stop.
- At convergence (about 2.75 s) the five trails merge into one burst, then the formation opens like a fan with no pause. Whiteout at about 3.0, fading out over about 0.25 s into the wide low hero camera, which hides the cut.
- Each dagger's flight spline hands over to its landing spline with matched position, tangent and speed (C1 continuity). Landing target = the hand-placed transform from the Phase D config (position, tilt, embed depth).
- The slow motion comes only from the global timeScale(t) curve: smooth ramp 1.0 to about 0.12 over about 0.35 s, starting about 0.15 s before the first impact, and back to 1.0 over about 0.5 s after the last impact. No dagger stops on its own.
- Orientation: a critically damped spring toward the landing pose, over the last 0.3 s. No snap.
- Impacts staggered with uneven gaps (for example 0.09, 0.21, 0.07, 0.30 s, from the seed), not a regular 0.4 s rhythm.
- Per impact: painted impact flipbook (ring plus burst, 6 to 8 frames), dust, sparks, playGlow(daggerId, 1.0) so the crack decal persists, camera shake decaying in about 0.35 s. A short white flash on the first impact only.
- The camera ends on the Phase D hero framing at t = 4.0.

G. Verification tooling (Claude cannot watch animations, so build the eyes first).
- A dev-only scrub API: window.__intro.seek(t) and ?t=1.25 render the intro at exactly time t.
- A script that dumps frames at 30 fps (t = 0 to 4.0) to docs/review/ (gitignored) and builds contact sheets of 20 frames, formatted like the storyboard so I can compare them side by side.
- A numeric check: log each dagger's world speed and screen-space speed per frame and fail if consecutive frames differ by more than 25 percent outside the designed slow-motion window. Also check: path crossings >= 3, no two consecutive beats with the same camera archetype, total duration 4.0 s within one frame, and last impact at t <= 4.0.
- Headless Chromium needs software GL flags for WebGL. Find out what works here. Ask before adding Playwright or any other dependency.

H. Performance and tiers.
- High: everything. Medium: no cloud layers, fewer speed lines. Low: no flipbook orbs (static sprites), a flat flash instead of the full-screen shader effects, and the intro skippable by default on very weak devices.
- Follow the repo conventions in CLAUDE.md (component folders, .constants.ts, one hook per file, pnpm, conventional commits with the husky hooks).

Plan the file structure and the commit order. Suggested commits: (1) clock, scrub API, frame dump and checks; (2) paths, shot director, flashes; (3) 2D FX; (4) landing handover and impacts. After each commit, run the frame dump, show me the contact sheet, tell me what differs from the storyboard, then stop for my review.
```

## 5. Review checklist (for you)

After each commit, compare the contact sheet with the storyboard and ask:

- Can I see a different camera angle and a different colour at every cut?
- Do the floods read as strong colour, like the blue and red frames in the clip?
- Are other trails crossing the frame, and are the curves different from one dagger to the next?
- Can I tell these are daggers for a few frames per beat?
- At the split, does the speed change smoothly, with no frame where things freeze?
- Is the last impact at 4.0 s or earlier?

## 6. Lines to replace in CLAUDE.md

Replace the intro bullet in Behaviour with:

```
- Intro: 4.0 s from first flare to last impact, a pure function of one intro time t (scrubbable with window.__intro.seek). Five head-cam beats with hard cuts hidden by saturated colour floods, seeded per-dagger paths (fixed shipped seed, ?seed= in dev), 2D FX (orb flipbooks, cross flares, ribbon trails, radial speed lines), convergence burst and whiteout, then a landing with one global timeScale curve (slow motion), staggered impacts, and the Phase D landing transforms. Played once per session, visible Skip button, static final scene for prefers-reduced-motion. Reference storyboard: docs/references/mha-storyboard.png (local only).
```

And add under Working rules: "For animation work, verify with the frame dump and contact sheet, not by reading code."
