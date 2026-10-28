import { useRef } from 'react';

import { SECTION_BODIES } from '@/components/Sections/Sections.components';
import { SECTIONS } from '@/components/Sections/Sections.constants';
import { getDaggerAnchorId } from '@/components/Sections/Sections.helpers';

import { useSectionScroll } from '@/components/Sections/useSectionScroll';

import styles from '@/components/Sections/Sections.module.css';

export const Sections = () => {
    const containerRef = useRef<HTMLElement>(null);
    useSectionScroll(containerRef);

    return (
        <main ref={containerRef} className={styles.sections}>
            {SECTIONS.map(({ id, title }, index) => {
                const Body = SECTION_BODIES[id];
                const textSide = index % 2 === 0 ? 'left' : 'right';

                return (
                    <section key={id} id={id} className={styles.section} data-side={textSide}>
                        <div className={styles.text}>
                            <h2 className={styles.title} data-reveal>
                                {title}
                            </h2>
                            <Body />
                        </div>
                        {/* Empty: the 3D dagger is placed over this box, in the margin opposite the text */}
                        <div id={getDaggerAnchorId(id)} className={styles.anchor} />
                    </section>
                );
            })}
        </main>
    );
};
