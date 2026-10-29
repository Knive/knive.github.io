import { useEffect, useRef } from 'react';

import { getIntroTime } from '@/components/Intro/introStore';

/** 1.125 → "00:00:01.125", like the timestamps burned into the reference storyboard */
const formatTimestamp = (seconds: number) => `00:00:${seconds.toFixed(3).padStart(6, '0')}`;

/** Dev review mode only: the intro time burned into every frame, for the contact sheets */
export const IntroReview = () => {
    const timestampRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let frame = 0;
        const update = () => {
            if (timestampRef.current) {
                timestampRef.current.textContent = formatTimestamp(getIntroTime());
            }
            frame = requestAnimationFrame(update);
        };
        update();
        return () => cancelAnimationFrame(frame);
    }, []);

    // Top-left corner, styled like the storyboard's timestamps
    return (
        <div
            ref={timestampRef}
            className="pointer-events-none fixed top-2 left-3 z-100 font-[family-name:ui-monospace,monospace] text-[2.25rem] leading-none font-semibold text-white text-shadow-[0_0_2px_#000,0_0_4px_#000]"
            aria-hidden="true"
        />
    );
};
