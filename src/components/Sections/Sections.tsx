import { useRef } from 'react';

import { SECTION_BODIES } from '@/components/Sections/Sections.components';
import { SectionShell } from '@/components/SectionShell/SectionShell';

import { useSectionScroll } from '@/components/Sections/useSectionScroll';
import { useI18n } from '@/i18n/i18n.context';

import { sectionsVariants, sectionTitleVariants } from '@/components/Sections/Sections.styles';

export const Sections = () => {
    const containerRef = useRef<HTMLElement>(null);
    useSectionScroll(containerRef);
    const { t } = useI18n();

    return (
        <main ref={containerRef} className={sectionsVariants()} data-review-hidden>
            {t.sections.map(({ id, title }, index) => {
                const Body = SECTION_BODIES[id];

                return (
                    <SectionShell
                        key={id}
                        id={id}
                        side={index % 2 === 0 ? 'left' : 'right'}
                        title={
                            <h2 className={sectionTitleVariants()} data-reveal>
                                {title}
                            </h2>
                        }
                    >
                        <Body />
                    </SectionShell>
                );
            })}
        </main>
    );
};
