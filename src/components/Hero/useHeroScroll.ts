import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { HERO_SCROLL } from '@/components/Hero/Hero.constants';

gsap.registerPlugin(ScrollTrigger);

/** Only set up when motion is allowed: under reduced motion the title just stays put */
const MOTION_ALLOWED_QUERY = '(prefers-reduced-motion: no-preference)';

/** Fades the hero title out and moves it up, following the scroll until the hero has left the viewport */
export const useHeroScroll = (titleRef: RefObject<HTMLElement | null>) => {
    useLayoutEffect(() => {
        const media = gsap.matchMedia();

        media.add(MOTION_ALLOWED_QUERY, () => {
            gsap.to(titleRef.current, {
                y: -HERO_SCROLL.risePx,
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#hero',
                    // From the very top of the page: the sticky header sits above the hero
                    start: 0,
                    end: 'bottom top',
                    scrub: true
                }
            });
        });

        return () => media.revert();
    }, [titleRef]);
};
