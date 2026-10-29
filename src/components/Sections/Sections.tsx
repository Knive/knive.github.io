import { useRef } from 'react';

import { SECTION_BODIES } from '@/components/Sections/Sections.components';
import { getDaggerAnchorId } from '@/components/Sections/Sections.helpers';

import { useSectionScroll } from '@/components/Sections/useSectionScroll';
import { useI18n } from '@/i18n/i18n.context';

import {
    sectionAnchorVariants,
    sectionsVariants,
    sectionTextVariants,
    sectionTitleVariants,
    sectionVariants
} from '@/components/Sections/Sections.styles';

export const Sections = () => {
    const containerRef = useRef<HTMLElement>(null);
    useSectionScroll(containerRef);
    const { t } = useI18n();

    return (
        <main ref={containerRef} className={sectionsVariants()} data-review-hidden>
            {t.sections.map(({ id, title }, index) => {
                const Body = SECTION_BODIES[id];
                const textSide = index % 2 === 0 ? 'left' : 'right';

                return (
                    <section
                        key={id}
                        id={id}
                        className={sectionVariants({ side: textSide })}
                        data-side={textSide}
                        data-section={id}
                    >
                        <div className={sectionTextVariants({ side: textSide })}>
                            <h2 className={sectionTitleVariants()} data-reveal>
                                {title}
                            </h2>
                            <Body />
                        </div>
                        {/* Empty: the 3D dagger is placed over this box, in the margin opposite the text */}
                        <div
                            id={getDaggerAnchorId(id)}
                            className={sectionAnchorVariants({ side: textSide })}
                        />
                    </section>
                );
            })}
        </main>
    );
};
