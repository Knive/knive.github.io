import {
    CONTACT_GRIP,
    GUARD_BEVEL,
    GUARD_CRYSTAL,
    GUARD_OUTLINE,
    RING_POMMEL,
    TANG_COLOR
} from '@/components/ContactDagger/ContactDagger.constants';
import {
    createBlade,
    createCrystalGeometry,
    createRingGeometry
} from '@/components/ContactDagger/ContactDagger.helpers';
import {
    DaggerPart,
    LeatherGrip,
    type DaggerPartsProps
} from '@/components/Dagger/Dagger.components';
import { createOutlinedPart } from '@/components/Dagger/Dagger.helpers';

// Built once: there is a single Contact dagger
const BLADE = createBlade();
const GUARD_GEOMETRY = createOutlinedPart(GUARD_OUTLINE, GUARD_BEVEL).geometry;
const CRYSTAL_GEOMETRY = createCrystalGeometry();
const RING_GEOMETRY = createRingGeometry();
/** Ring sits on top of the grip, touching it */
const RING_POSITION_Y =
    CONTACT_GRIP.startY + CONTACT_GRIP.length + RING_POMMEL.radius + RING_POMMEL.tube;

export const ContactDaggerParts = ({ config, glowMaterialRef }: DaggerPartsProps) => (
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
            geometry={GUARD_GEOMETRY}
            color={config.guardColor}
            rimColor={config.glowColor}
        />
        <DaggerPart
            geometry={CRYSTAL_GEOMETRY}
            position={GUARD_CRYSTAL.position}
            ref={glowMaterialRef}
            color={GUARD_CRYSTAL.color}
            rimColor={config.glowColor}
            emissive={config.glowColor}
        />

        <LeatherGrip
            spec={CONTACT_GRIP}
            color={config.handleColor}
            rimColor={config.glowColor}
            coreColor={TANG_COLOR}
        />

        <DaggerPart
            geometry={RING_GEOMETRY}
            position={[0, RING_POSITION_Y, 0]}
            color={config.pommelColor}
            rimColor={config.glowColor}
        />
    </>
);
