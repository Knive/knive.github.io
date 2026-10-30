import { type ReactNode } from 'react';

import { type SectionId } from '@/components/Sections/Sections.constants';
import { getDaggerAnchorId } from '@/components/Sections/Sections.helpers';
import { Hairlines } from '@/components/SectionShell/SectionShell.components';
import { type SectionSide } from '@/components/SectionShell/SectionShell.constants';

import {
    contentColumnVariants,
    daggerAnchorVariants,
    sectionShellVariants,
    titleColumnVariants
} from '@/components/SectionShell/SectionShell.styles';

type SectionShellProps = {
    id: SectionId;
    side: SectionSide;
    title: ReactNode;
    children: ReactNode;
};

/** One themed slide: title | dagger | content between hairlines, mirrored by side */
export const SectionShell = ({ id, side, title, children }: SectionShellProps) => (
    <section id={id} className={sectionShellVariants({ side })} data-side={side} data-section={id}>
        <Hairlines />
        <div className={titleColumnVariants()}>{title}</div>
        {/* Empty: the 3D dagger is placed over this box, in the middle column */}
        <div id={getDaggerAnchorId(id)} className={daggerAnchorVariants()} />
        <div className={contentColumnVariants()}>{children}</div>
    </section>
);
