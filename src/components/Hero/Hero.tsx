import React, { useRef } from 'react';

import { useHeroScroll } from '@/components/Hero/useHeroScroll';
import { isIntroReviewRequested } from '@/components/Intro/Intro.helpers';
import { useIntro } from '@/components/Intro/useIntro';
import { IntroReview } from '@/components/IntroReview/IntroReview';
import { Scene } from '@/components/Scene/Scene';
import { PROFILE } from '@/components/Sections/Sections.constants';
import { cn } from '@/utils/cn';

import styles from '@/components/Hero/Hero.module.css';
import { heroVariants } from '@/components/Hero/Hero.styles';

export const Hero: React.FC = () => {
    const { isIntroPlaying, endIntro } = useIntro();
    const titleRef = useRef<HTMLDivElement>(null);
    useHeroScroll(titleRef);

    return (
        <section id="hero" className={cn(styles.hero, heroVariants({ intent: 'primary' }))}>
            <div ref={titleRef} className={styles['hero-title']} data-review-hidden>
                <h1 className={styles['hero-name']}>{PROFILE.name}</h1>
                <p className={styles['hero-job']}>{PROFILE.jobTitle}</p>
            </div>
            {/* Fixed behind the whole page; decorative, the header nav is its accessible equivalent */}
            <div className={styles['hero-scene']} aria-hidden="true">
                <Scene isIntroPlaying={isIntroPlaying} onIntroEnd={endIntro} />
            </div>
            {isIntroReviewRequested() && <IntroReview />}
            {isIntroPlaying && (
                <button
                    type="button"
                    className={styles['hero-skip']}
                    onClick={endIntro}
                    data-review-hidden
                >
                    Skip intro
                </button>
            )}
        </section>
    );
};
