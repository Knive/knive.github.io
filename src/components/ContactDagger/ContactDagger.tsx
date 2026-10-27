import { DaggerPart, type DaggerPartsProps } from '@/components/Dagger/Dagger.components';
import { createBarGeometry, createWrappedHandleGeometry } from '@/components/Dagger/Dagger.helpers';
import {
    CONTACT_COLLAR,
    CONTACT_HANDLE,
    CONTACT_RING
} from '@/components/ContactDagger/ContactDagger.constants';
import {
    createBladeGeometry,
    createNotchTexture,
    createRingGeometry
} from '@/components/ContactDagger/ContactDagger.helpers';

// Built once: there is a single Contact dagger
const BLADE_GEOMETRY = createBladeGeometry();
const COLLAR_GEOMETRY = createBarGeometry(CONTACT_COLLAR);
const HANDLE_GEOMETRY = createWrappedHandleGeometry(CONTACT_HANDLE);
const RING_GEOMETRY = createRingGeometry();
const NOTCH_TEXTURE = createNotchTexture();
/** Ring hangs from the top of the handle, overlapping it slightly */
const RING_POSITION_Y = CONTACT_HANDLE.length + CONTACT_RING.radius;

export const ContactDaggerParts = ({ config, glowMaterialRef }: DaggerPartsProps) => (
    <>
        <DaggerPart
            geometry={BLADE_GEOMETRY}
            ref={glowMaterialRef}
            color={config.bladeColor}
            rimColor={config.glowColor}
            emissive={config.glowColor}
            emissiveMap={NOTCH_TEXTURE}
        />
        <DaggerPart
            geometry={COLLAR_GEOMETRY}
            color={config.guardColor}
            rimColor={config.glowColor}
        />
        <DaggerPart
            geometry={HANDLE_GEOMETRY}
            color={config.handleColor}
            rimColor={config.glowColor}
        />
        <DaggerPart
            geometry={RING_GEOMETRY}
            position={[0, RING_POSITION_Y, 0]}
            color={config.pommelColor}
            rimColor={config.glowColor}
        />
    </>
);
