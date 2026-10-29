import {
    DECOR_BASE_LENGTH,
    DECOR_BLADES,
    DECOR_MATERIAL
} from '@/components/BladeField/BladeField.constants';
import {
    createGripGeometry,
    createPommelGeometry,
    createVariantParts,
    toRestRotation
} from '@/components/BladeField/BladeField.helpers';
import { DaggerPart } from '@/components/Dagger/Dagger.components';
import { getGroundHeight } from '@/components/Floor/Floor.helpers';

// Built once, shared by every sword
const VARIANT_PARTS = createVariantParts();
const GRIP_GEOMETRY = createGripGeometry();
const POMMEL_GEOMETRY = createPommelGeometry();
const { bladeColor, hiltColor, rimColor } = DECOR_MATERIAL;

/** Plain swords planted around the daggers: no glow, no label, not interactive */
export const BladeField = () => (
    <>
        {DECOR_BLADES.map((blade) => {
            const { bladeGeometry, paintMap, guardGeometry } = VARIANT_PARTS[blade.variant];
            return (
                <group
                    key={`${blade.x}:${blade.z}`}
                    position={[blade.x, getGroundHeight(blade.x, blade.z), blade.z]}
                    rotation={toRestRotation(blade)}
                >
                    <group
                        position={[0, blade.bladeLength * blade.exposedRatio, 0]}
                        scale={blade.bladeLength / DECOR_BASE_LENGTH}
                    >
                        <DaggerPart
                            geometry={bladeGeometry}
                            color={bladeColor}
                            map={paintMap}
                            rimColor={rimColor}
                        />
                        <DaggerPart
                            geometry={guardGeometry}
                            color={hiltColor}
                            rimColor={rimColor}
                        />
                        <DaggerPart
                            geometry={GRIP_GEOMETRY}
                            color={hiltColor}
                            rimColor={rimColor}
                        />
                        <DaggerPart
                            geometry={POMMEL_GEOMETRY}
                            color={hiltColor}
                            rimColor={rimColor}
                        />
                    </group>
                </group>
            );
        })}
    </>
);
