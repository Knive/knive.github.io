import { useMemo } from 'react';

import type { DaggerConfig } from '@/components/Dagger/Dagger';
import { ColourFlood, IgnitionFlare } from '@/components/IntroFx/IntroFx.components';

type IntroFxProps = {
    daggers: Pick<DaggerConfig, 'sectionId' | 'glowColor'>[];
};

/** The intro's 2D effects, all functions of the intro time */
export const IntroFx = ({ daggers }: IntroFxProps) => {
    const glowColors = useMemo(
        () => Object.fromEntries(daggers.map(({ sectionId, glowColor }) => [sectionId, glowColor])),
        [daggers]
    );
    return (
        <>
            <ColourFlood glowColors={glowColors} />
            <IgnitionFlare glowColors={glowColors} />
        </>
    );
};
