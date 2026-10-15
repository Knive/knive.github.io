import React from 'react';

import { Scene } from '@/components/Scene/Scene';
import { cn } from '@/utils/cn';

import styles from '@/components/Hero/Hero.module.css';
import { heroVariants } from '@/components/Hero/Hero.styles';

export const Hero: React.FC = () => {
    return (
        <section className={cn(styles.hero, heroVariants({ intent: 'primary' }))}>
            <div className={styles['hero-identity']}>
                <h1 className={styles['hero-name']}>Kevin Nguyen</h1>
            </div>
            <div className={styles['hero-scene']}>
                <Scene />
            </div>
            <p className={styles['hero-hint']}>choose your path</p>
        </section>
    );
};
