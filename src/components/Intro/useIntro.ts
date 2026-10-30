import { useEffect, useState } from 'react';

import { markIntroPlayed, shouldPlayIntro } from '@/components/Intro/Intro.helpers';

/** Whether the intro flight is playing; it plays once per session and never under reduced motion */
export const useIntro = () => {
    const [isIntroPlaying, setIsIntroPlaying] = useState(shouldPlayIntro);

    // Marked at start, so a reload mid-intro does not replay it
    useEffect(() => {
        if (isIntroPlaying) markIntroPlayed();
    }, [isIntroPlaying]);

    const endIntro = () => setIsIntroPlaying(false);

    return { isIntroPlaying, endIntro };
};
