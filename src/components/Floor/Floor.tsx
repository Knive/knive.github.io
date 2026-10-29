import { useMemo } from 'react';

import { FLOOR } from '@/components/Floor/Floor.constants';
import {
    createFloorTexture,
    createGroundGeometry,
    type CrackLayout
} from '@/components/Floor/Floor.helpers';

type FloorProps = {
    /** Shared with the crack glow so both draw the same cracks */
    crackLayout: CrackLayout;
};

const GROUND_GEOMETRY = createGroundGeometry();

/** Bumpy dry dirt ground, flat along the dagger row */
export const Floor = ({ crackLayout }: FloorProps) => {
    const colorMap = useMemo(() => createFloorTexture(crackLayout), [crackLayout]);

    return (
        <mesh geometry={GROUND_GEOMETRY}>
            <meshStandardMaterial map={colorMap} roughness={FLOOR.roughness} />
        </mesh>
    );
};
