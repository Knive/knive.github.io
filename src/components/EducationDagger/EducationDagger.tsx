import { DaggerPart, type DaggerPartsProps } from '@/components/Dagger/Dagger.components';
import { createWrappedHandleGeometry } from '@/components/Dagger/Dagger.helpers';
import {
    EDUCATION_HANDLE,
    EDUCATION_POMMEL
} from '@/components/EducationDagger/EducationDagger.constants';
import {
    createBladeGeometry,
    createCentreLineTexture,
    createGuardGeometry,
    createPommelGeometry
} from '@/components/EducationDagger/EducationDagger.helpers';

// Built once: there is a single Education dagger
const BLADE_GEOMETRY = createBladeGeometry();
const GUARD_GEOMETRY = createGuardGeometry();
const HANDLE_GEOMETRY = createWrappedHandleGeometry(EDUCATION_HANDLE);
const POMMEL_GEOMETRY = createPommelGeometry();
const CENTRE_LINE_TEXTURE = createCentreLineTexture();
/** Pommel sits on top of the handle */
const POMMEL_POSITION_Y =
    EDUCATION_HANDLE.length + EDUCATION_POMMEL.radius * (1 - EDUCATION_POMMEL.sinkRatio);

export const EducationDaggerParts = ({ config, glowMaterialRef }: DaggerPartsProps) => (
    <>
        <DaggerPart
            geometry={BLADE_GEOMETRY}
            ref={glowMaterialRef}
            color={config.bladeColor}
            rimColor={config.glowColor}
            emissive={config.glowColor}
            emissiveMap={CENTRE_LINE_TEXTURE}
        />
        <DaggerPart
            geometry={GUARD_GEOMETRY}
            color={config.guardColor}
            rimColor={config.glowColor}
        />
        <DaggerPart
            geometry={HANDLE_GEOMETRY}
            color={config.handleColor}
            rimColor={config.glowColor}
        />
        <DaggerPart
            geometry={POMMEL_GEOMETRY}
            position={[0, POMMEL_POSITION_Y, 0]}
            color={config.pommelColor}
            rimColor={config.glowColor}
        />
    </>
);
