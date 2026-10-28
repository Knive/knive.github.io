import React from 'react';

import { useIntro } from '@/components/Intro/useIntro';
import { Scene } from '@/components/Scene/Scene';
import { PROFILE } from '@/components/Sections/Sections.constants';
import { cn } from '@/utils/cn';

import styles from '@/components/Hero/Hero.module.css';
import { heroVariants } from '@/components/Hero/Hero.styles';

export const Hero: React.FC = () => {
    const { isIntroPlaying, endIntro } = useIntro();

    return (
        <section id="hero" className={cn(styles.hero, heroVariants({ intent: 'primary' }))}>
            <div className={styles['hero-title']}>
                <h1 className={styles['hero-name']}>{PROFILE.name}</h1>
                <p className={styles['hero-job']}>{PROFILE.jobTitle}</p>
            </div>
            {/* Fixed behind the whole page; decorative, the header nav is its accessible equivalent */}
            <div className={styles['hero-scene']} aria-hidden="true">
                <Scene isIntroPlaying={isIntroPlaying} onIntroEnd={endIntro} />
            </div>
            {isIntroPlaying && (
                <button type="button" className={styles['hero-skip']} onClick={endIntro}>
                    Skip intro
                </button>
            )}
        </section>
    );
};
