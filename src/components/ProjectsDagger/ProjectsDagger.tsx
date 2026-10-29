import { CylinderGeometry } from 'three';

import {
    DaggerPart,
    LeatherGrip,
    type DaggerPartsProps
} from '@/components/Dagger/Dagger.components';
import {
    COPPER_BANDS,
    CRESCENT_RING,
    GUARD_ORB,
    PROJECTS_GRIP,
    STAR_POMMEL
} from '@/components/ProjectsDagger/ProjectsDagger.constants';
import {
    createBlade,
    createCrescentRingGeometry,
    createOrbGeometry,
    createStarPommelGeometry
} from '@/components/ProjectsDagger/ProjectsDagger.helpers';

// Built once: there is a single Projects dagger
const BLADE = createBlade();
const RING_GEOMETRY = createCrescentRingGeometry();
const ORB_GEOMETRY = createOrbGeometry();
const BAND_GEOMETRY = new CylinderGeometry(
    COPPER_BANDS.radius,
    COPPER_BANDS.radius,
    COPPER_BANDS.height,
    COPPER_BANDS.radialSegments
);
const POMMEL_GEOMETRY = createStarPommelGeometry();

export const ProjectsDaggerParts = ({ config, glowMaterialRef }: DaggerPartsProps) => (
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

        <DaggerPart
            geometry={RING_GEOMETRY}
            position={[0, CRESCENT_RING.centerY, 0]}
            color={config.guardColor}
            rimColor={config.glowColor}
        />
        <DaggerPart
            geometry={ORB_GEOMETRY}
            position={[0, CRESCENT_RING.centerY, 0]}
            ref={glowMaterialRef}
            color={GUARD_ORB.color}
            rimColor={config.glowColor}
            emissive={config.glowColor}
        />

        <LeatherGrip spec={PROJECTS_GRIP} color={config.handleColor} rimColor={config.glowColor} />
        {COPPER_BANDS.positionsY.map((positionY) => (
            <DaggerPart
                key={positionY}
                geometry={BAND_GEOMETRY}
                position={[0, positionY, 0]}
                color={COPPER_BANDS.color}
                rimColor={config.glowColor}
            />
        ))}

        <DaggerPart
            geometry={POMMEL_GEOMETRY}
            position={[0, STAR_POMMEL.positionY, 0]}
            color={config.pommelColor}
            rimColor={config.glowColor}
        />
    </>
);
