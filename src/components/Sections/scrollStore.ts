/**
 * Scroll state written by ScrollTrigger and read every frame by the scene.
 * Plain module state, like the glow store: scrolling never triggers React renders.
 */

/** 0 with the hero fully in view, 1 once it has scrolled out */
export const heroScroll = { progress: 0 };
