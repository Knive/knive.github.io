import { HAIRLINE_POSITIONS } from '@/components/SectionShell/SectionShell.constants';

import { hairlinesVariants, hairlineVariants } from '@/components/SectionShell/SectionShell.styles';

// data-hairline: the scroll animation draws each line from top to bottom
export const Hairlines = () => (
    <div className={hairlinesVariants()} aria-hidden="true">
        {HAIRLINE_POSITIONS.map((position) => (
            <span key={position} className={hairlineVariants({ position })} data-hairline />
        ))}
    </div>
);
