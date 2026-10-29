import {
    DaggerPart,
    LeatherGrip,
    type DaggerPartsProps
} from '@/components/Dagger/Dagger.components';
import { createOutlinedPart } from '@/components/Dagger/Dagger.helpers';
import {
    EDUCATION_GRIP,
    GUARD_CRYSTAL,
    GUARD_LEAVES,
    POMMEL,
    POMMEL_OUTLINE
} from '@/components/EducationDagger/EducationDagger.constants';
import {
    createBlade,
    createCrystalGeometry,
    createGuardGeometries
} from '@/components/EducationDagger/EducationDagger.helpers';

// Built once: there is a single Education dagger
const BLADE = createBlade();
const GUARD = createGuardGeometries();
const CRYSTAL_GEOMETRY = createCrystalGeometry();
const POMMEL_GEOMETRY = createOutlinedPart(POMMEL_OUTLINE, POMMEL).geometry;
const CRYSTAL_POSITION: [number, number, number] = [
    GUARD_LEAVES.rightLength,
    GUARD_LEAVES.lift + GUARD_CRYSTAL.offsetY,
    0
];

export const EducationDaggerParts = ({ config, glowMaterialRef }: DaggerPartsProps) => (
    <>
        <DaggerPart
            geometry={BLADE.geometry}
            ref={glowMaterialRef}
            color={config.bladeColor}
            map={BLADE.paintMap}
            rimColor={config.glowColor}
            emissive={config.glowColor}
            emissiveMap={BLADE.runeMap}
        />

        {[GUARD.leftLeaf, GUARD.rightLeaf].map((geometry) => (
            <DaggerPart
                key={geometry.uuid}
                geometry={geometry}
                color={config.guardColor}
                rimColor={config.glowColor}
            />
        ))}
        <DaggerPart
            geometry={CRYSTAL_GEOMETRY}
            position={CRYSTAL_POSITION}
            ref={glowMaterialRef}
            color={GUARD_CRYSTAL.color}
            rimColor={config.glowColor}
            emissive={config.glowColor}
        />

        <LeatherGrip spec={EDUCATION_GRIP} color={config.handleColor} rimColor={config.glowColor} />

        <DaggerPart
            geometry={POMMEL_GEOMETRY}
            position={[0, POMMEL.positionY, 0]}
            color={config.pommelColor}
            rimColor={config.glowColor}
        />
    </>
);
