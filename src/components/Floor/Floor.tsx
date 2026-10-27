import { useMemo } from 'react';
import { MeshReflectorMaterial } from '@react-three/drei';

import { FLOOR, REFLECTOR } from '@/components/Floor/Floor.constants';
import { createFloorTextures } from '@/components/Floor/Floor.helpers';

type FloorProps = {
    /** Real reflections (high tier) instead of the fake wet sheen */
    isReflective: boolean;
    /** World x of each embedded dagger, where cracks start */
    crackOriginsX: readonly number[];
};

/** Dark cracked wet stone floor at y = 0 */
export const Floor = ({ isReflective, crackOriginsX }: FloorProps) => {
    const { colorMap, roughnessMap } = useMemo(
        () => createFloorTextures(crackOriginsX),
        [crackOriginsX]
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
