import { useEffect, useRef } from 'react';

import { getIntroTime } from '@/components/Intro/introStore';

import styles from '@/components/IntroReview/IntroReview.module.css';

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

    return <div ref={timestampRef} className={styles['intro-review']} aria-hidden="true" />;
};
