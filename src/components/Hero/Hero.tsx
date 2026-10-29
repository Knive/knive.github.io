import React, { useRef } from 'react';

import { useHeroScroll } from '@/components/Hero/useHeroScroll';
import { isIntroReviewRequested } from '@/components/Intro/Intro.helpers';
import { useIntro } from '@/components/Intro/useIntro';
import { IntroReview } from '@/components/IntroReview/IntroReview';
import { Scene } from '@/components/Scene/Scene';
import { PROFILE_NAME } from '@/components/Sections/Sections.constants';
import { useI18n } from '@/i18n/i18n.context';

import {
    heroJobVariants,
    heroNameVariants,
    heroSceneVariants,
    heroSkipVariants,
    heroTitleVariants,
    heroVariants
} from '@/components/Hero/Hero.styles';

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
                <Scene isIntroPlaying={isIntroPlaying} onIntroEnd={endIntro} />
            </div>
            {isIntroReviewRequested() && <IntroReview />}
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
