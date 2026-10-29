import React, { useRef } from 'react';

import { useHeroScroll } from '@/components/Hero/useHeroScroll';
import { isIntroReviewRequested } from '@/components/Intro/Intro.helpers';
import { useIntro } from '@/components/Intro/useIntro';
import { IntroReview } from '@/components/IntroReview/IntroReview';
import { Scene } from '@/components/Scene/Scene';
import { PROFILE_NAME } from '@/components/Sections/Sections.constants';
import { useI18n } from '@/i18n/i18n.context';

export const Hero: React.FC = () => {
    const { isIntroPlaying, endIntro } = useIntro();
    const { t } = useI18n();
    const titleRef = useRef<HTMLDivElement>(null);
    useHeroScroll(titleRef);

    return (
        <section id="hero" className="relative h-[80vh] min-h-150 w-screen overflow-clip">
            {/* Sticky just below the header while the hero scrolls, so its scroll fade and rise stay visible */}
            <div
                ref={titleRef}
                className="pointer-events-none sticky top-24 z-10 px-6 pt-[2vh] text-center"
                data-review-hidden
            >
                <h1 className="text-[length:clamp(2.25rem,5vw,3.75rem)] text-moonlight">
                    {PROFILE_NAME}
                </h1>
                <p className="mt-3 text-[length:clamp(1.15rem,2vw,1.5rem)] text-steel italic">
                    {t.profile.jobTitle}
                </p>
            </div>
            {/* Fixed behind the whole page; decorative, the header nav is its accessible equivalent */}
            <div className="fixed inset-0 z-0" aria-hidden="true">
                <Scene isIntroPlaying={isIntroPlaying} onIntroEnd={endIntro} />
            </div>
            {isIntroReviewRequested() && <IntroReview />}
            {isIntroPlaying && (
                <button
                    type="button"
                    className="absolute right-10 bottom-8 z-10 cursor-pointer border border-copper bg-transparent px-4 py-2 font-display text-[0.8rem] text-steel transition-[color,border-color] duration-200 ease-[ease] hover:border-ember hover:text-ember focus-visible:border-ember focus-visible:text-ember focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ember"
                    onClick={endIntro}
                    data-review-hidden
                >
                    {t.ui.skipIntro}
                </button>
            )}
        </section>
    );
};
