import { useMemo } from 'react';
import { MeshReflectorMaterial } from '@react-three/drei';

import { FLOOR, REFLECTOR } from '@/components/Floor/Floor.constants';
import { createFloorTextures, type CrackLayout } from '@/components/Floor/Floor.helpers';

type FloorProps = {
    /** Real reflections (high tier) instead of the fake wet sheen */
    isReflective: boolean;
    /** Shared with the crack glow so both draw the same cracks */
    crackLayout: CrackLayout;
};

/** Dark cracked wet stone floor at y = 0 */
export const Floor = ({ isReflective, crackLayout }: FloorProps) => {
    const { colorMap, roughnessMap } = useMemo(
        () => createFloorTextures(crackLayout),
        [crackLayout]
    );

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[FLOOR.size, FLOOR.size]} />
            {isReflective ? (
                <MeshReflectorMaterial
                    map={colorMap}
                    roughnessMap={roughnessMap}
                    metalness={FLOOR.metalness}
                    {...REFLECTOR}
                />
            ) : (
                <meshStandardMaterial
                    map={colorMap}
                    roughnessMap={roughnessMap}
                    metalness={FLOOR.metalness}
                />
            )}
        </mesh>
    );
};
