import { BackSide, SphereGeometry } from 'three';

import { MOON, SKY_RADIUS, STARS } from '@/components/Sky/Sky.constants';
import {
    createMoonTexture,
    createSkyTexture,
    createStarGeometry,
    toSkyPosition
} from '@/components/Sky/Sky.helpers';

const SKY_GEOMETRY = new SphereGeometry(SKY_RADIUS, 32, 32);
const SKY_TEXTURE = createSkyTexture();
const STAR_GEOMETRY = createStarGeometry();
const MOON_TEXTURE = createMoonTexture();
const MOON_POSITION = toSkyPosition(MOON.elevation, MOON.azimuth, MOON.distance);

/** Sunset gradient dome, stars and moon; painted colours, so no fog and no tone mapping */
export const Sky = () => (
    <>
        <mesh geometry={SKY_GEOMETRY}>
            <meshBasicMaterial
                map={SKY_TEXTURE}
                side={BackSide}
                fog={false}
                toneMapped={false}
                depthWrite={false}
            />
        </mesh>
        <points geometry={STAR_GEOMETRY}>
            <pointsMaterial
                size={STARS.size}
                sizeAttenuation={false}
                vertexColors
                fog={false}
                toneMapped={false}
            />
        </points>
        <sprite position={MOON_POSITION} scale={MOON.size}>
            <spriteMaterial
                map={MOON_TEXTURE}
                transparent
                fog={false}
                toneMapped={false}
                depthWrite={false}
            />
        </sprite>
    </>
);
