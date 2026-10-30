import React, { lazy, Suspense, useRef } from 'react';

import { useHeroScroll } from '@/components/Hero/useHeroScroll';
import { isIntroReviewRequested } from '@/components/Intro/Intro.helpers';
import { useIntro } from '@/components/Intro/useIntro';
import { PROFILE_NAME } from '@/components/Sections/Sections.constants';
import { useI18n } from '@/i18n/i18n.context';

import {
    heroJobVariants,
    heroSceneFallbackVariants,
    heroNameVariants,
    heroSceneVariants,
    heroSkipVariants,
    heroTitleVariants,
    heroVariants
} from '@/components/Hero/Hero.styles';

// Its own chunk (three.js and the whole scene), so the CV text does not wait for it
const Scene = lazy(() =>
    import('@/components/Scene/Scene').then((module) => ({ default: module.Scene }))
);
// Dev review overlay: it reads the intro clock, which lives in the scene code
const IntroReview = lazy(() =>
    import('@/components/IntroReview/IntroReview').then((module) => ({
        default: module.IntroReview
    }))
);

export const Hero: React.FC = () => {
    const { isIntroPlaying, endIntro } = useIntro();
    const { t } = useI18n();
    const titleRef = useRef<HTMLDivElement>(null);
    useHeroScroll(titleRef);

    return (
        <section id="hero" className={heroVariants()}>
            <div ref={titleRef} className={heroTitleVariants()} data-review-hidden>
                <h1 className={heroNameVariants()}>{PROFILE_NAME}</h1>
                <p className={heroJobVariants()}>{t.profile.jobTitle}</p>
            </div>
            {/* Fixed behind the whole page; decorative, the header nav is its accessible equivalent */}
            <div className={heroSceneVariants()} aria-hidden="true">
                <Suspense fallback={<div className={heroSceneFallbackVariants()} />}>
                    <Scene isIntroPlaying={isIntroPlaying} onIntroEnd={endIntro} />
                </Suspense>
            </div>
            {isIntroReviewRequested() && (
                <Suspense>
                    <IntroReview />
                </Suspense>
            )}
            {isIntroPlaying && (
                <button
                    type="button"
                    className={heroSkipVariants()}
                    onClick={endIntro}
                    data-review-hidden
                >
                    {t.ui.skipIntro}
                </button>
            )}
        </section>
    );
};
