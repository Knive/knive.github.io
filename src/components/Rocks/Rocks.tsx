import { IcosahedronGeometry } from 'three';

import { DaggerOutline, ToonMaterial } from '@/components/Dagger/Dagger.components';
import { ROCK_MATERIAL, ROCKS } from '@/components/Rocks/Rocks.constants';

/** Detail 0 keeps the faces flat: a chunky low-poly stone */
const ROCK_GEOMETRY = new IcosahedronGeometry(0.5, 0);

/** Half-buried low-poly stones, toon-shaded like the daggers */
export const Rocks = () => (
    <>
        {ROCKS.map(({ position, scale, rotationY }) => (
            <mesh
                key={position.join(':')}
                geometry={ROCK_GEOMETRY}
                position={position}
                scale={scale}
                rotation={[0, rotationY, 0]}
            >
                <ToonMaterial {...ROCK_MATERIAL} />
                <DaggerOutline />
            </mesh>
        ))}
    </>
);
