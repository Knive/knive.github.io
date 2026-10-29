import { useEffect } from 'react';

import {
    getIntroSeed,
    getIntroTime,
    isIntroSeeking,
    pauseIntro,
    playIntro,
    seekIntro
} from '@/components/Intro/introStore';
import { REVIEW_BODY_CLASS } from '@/components/IntroReview/IntroReview.constants';
import {
    createBraidIntroModel,
    runIntroChecks
} from '@/components/IntroReview/IntroReview.helpers';
import { isIntroReviewRequested } from '@/components/Intro/Intro.helpers';

type IntroDevApi = {
    seek: (seconds: number) => void;
    play: () => void;
    pause: () => void;
    info: () => { seconds: number; isSeeking: boolean; seed: number };
    check: () => ReturnType<typeof runIntroChecks>;
};

declare global {
    interface Window {
        /** Dev only: scrub the intro and run its numeric checks from the console or a script */
        __intro?: IntroDevApi;
    }
}

/** Dev only: window.__intro scrubbing API, and review mode (?review hides the page chrome) */
export const useIntroDevTools = () => {
    useEffect(() => {
        if (!import.meta.env.DEV) return;

        window.__intro = {
            seek: seekIntro,
            play: playIntro,
            pause: pauseIntro,
            info: () => ({
                seconds: getIntroTime(),
                isSeeking: isIntroSeeking(),
                seed: getIntroSeed()
            }),
            check: () => runIntroChecks(createBraidIntroModel())
        };
        const isReview = isIntroReviewRequested();
        if (isReview) document.body.classList.add(REVIEW_BODY_CLASS);

        return () => {
            delete window.__intro;
            document.body.classList.remove(REVIEW_BODY_CLASS);
        };
    }, []);
};
