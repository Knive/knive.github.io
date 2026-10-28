import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { DAGGER_LIFT_SECONDS, SECTION_REVEAL } from '@/components/Sections/Sections.constants';
import { getSectionLift, heroScroll } from '@/components/Sections/scrollStore';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const HALFWAY = 0.5;

/**
 * Scroll-driven behaviour of the page: hero scroll-out progress for the scene,
 * each section's dagger lift, and its text sliding in from its side.
 */
export const useSectionScroll = (containerRef: RefObject<HTMLElement | null>) => {
    useLayoutEffect(() => {
        const media = gsap.matchMedia();

        media.add({ isReducedMotion: REDUCED_MOTION_QUERY }, (context) => {
            const isReducedMotion = Boolean(context.conditions?.isReducedMotion);

            ScrollTrigger.create({
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                onUpdate: ({ progress }) => {
                    // Reduced motion: the camera jumps once halfway instead of following the scroll
                    heroScroll.progress = isReducedMotion ? Number(progress >= HALFWAY) : progress;
                }
            });

            if (!containerRef.current) return;
            const sections = gsap.utils.toArray<HTMLElement>('[data-side]', containerRef.current);

            // The section crossing the viewport centre is active: its dagger moves to its margin
            sections.forEach((section) => {
                ScrollTrigger.create({
                    trigger: section,
                    start: 'top center',
                    end: 'bottom center',
                    onToggle: ({ isActive }) => {
                        gsap.to(getSectionLift(section.id), {
                            value: Number(isActive),
                            duration: isReducedMotion ? 0 : DAGGER_LIFT_SECONDS,
                            ease: 'power2.inOut',
                            overwrite: true
                        });
                    }
                });
            });

            if (isReducedMotion) return;

            sections.forEach((section) => {
                const fromX =
                    section.dataset.side === 'left'
                        ? -SECTION_REVEAL.offsetPx
                        : SECTION_REVEAL.offsetPx;
                // Opacity, not visibility: hidden blocks must stay focusable for keyboard users
                gsap.from(section.querySelectorAll('[data-reveal]'), {
                    x: fromX,
                    opacity: 0,
                    duration: SECTION_REVEAL.durationSeconds,
                    stagger: SECTION_REVEAL.staggerSeconds,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: SECTION_REVEAL.start,
                        toggleActions: 'play none none reverse'
                    }
                });
            });
        });

        return () => media.revert();
    }, [containerRef]);
};
