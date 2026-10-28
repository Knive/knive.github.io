import React from 'react';

import { useIntro } from '@/components/Intro/useIntro';
import { Scene } from '@/components/Scene/Scene';
import { SECTIONS } from '@/components/Sections/Sections.constants';
import { cn } from '@/utils/cn';

import styles from '@/components/Hero/Hero.module.css';
import { heroVariants } from '@/components/Hero/Hero.styles';

export const Hero: React.FC = () => {
    const { isIntroPlaying, endIntro } = useIntro();

    return (
        <section id="hero" className={cn(styles.hero, heroVariants({ intent: 'primary' }))}>
            <div className={styles['hero-identity']}>
                <h1 className={styles['hero-name']}>Kevin Nguyen</h1>
            </div>
            {/* Fixed behind the whole page; decorative, the nav below is its accessible equivalent */}
            <div className={styles['hero-scene']} aria-hidden="true">
                <Scene isIntroPlaying={isIntroPlaying} onIntroEnd={endIntro} />
            </div>
            {isIntroPlaying && (
                <button type="button" className={styles['hero-skip']} onClick={endIntro}>
                    Skip intro
                </button>
            )}
            <p className={styles['hero-hint']}>choose your path</p>
            <nav className={styles['hero-nav']} aria-label="Sections">
                <ul className={styles['hero-nav-list']}>
                    {SECTIONS.map(({ id, title }) => (
                        <li key={id}>
                            <a className={styles['hero-nav-link']} href={`#${id}`}>
                                {title}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </section>
    );
};
