import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { SECTION_REVEAL } from '@/components/Sections/Sections.constants';
import { heroScroll } from '@/components/Sections/scrollStore';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const HALFWAY = 0.5;

/**
 * Scroll-driven behaviour of the page: hero scroll-out progress for the scene,
 * and each section's text sliding in from its side.
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

            if (isReducedMotion || !containerRef.current) return;

            gsap.utils
                .toArray<HTMLElement>('[data-side]', containerRef.current)
                .forEach((section) => {
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
