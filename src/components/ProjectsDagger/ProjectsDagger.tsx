import { DaggerPart, type DaggerPartsProps } from '@/components/Dagger/Dagger.components';
import { createBarGeometry, createWrappedHandleGeometry } from '@/components/Dagger/Dagger.helpers';
import {
    CRYSTAL,
    PROJECTS_GUARD,
    PROJECTS_HANDLE,
    PROJECTS_POMMEL
} from '@/components/ProjectsDagger/ProjectsDagger.constants';
import {
    createBladeGeometry,
    createCrystalGeometry,
    createPommelGeometry
} from '@/components/ProjectsDagger/ProjectsDagger.helpers';

// Built once: there is a single Projects dagger
const BLADE_GEOMETRY = createBladeGeometry();
const GUARD_GEOMETRY = createBarGeometry(PROJECTS_GUARD);
const CRYSTAL_GEOMETRY = createCrystalGeometry();
const HANDLE_GEOMETRY = createWrappedHandleGeometry(PROJECTS_HANDLE);
const POMMEL_GEOMETRY = createPommelGeometry();

export const ProjectsDaggerParts = ({ config, glowMaterialRef }: DaggerPartsProps) => (
    <>
        <DaggerPart
            geometry={BLADE_GEOMETRY}
            color={config.bladeColor}
            rimColor={config.glowColor}
        />
        <DaggerPart
            geometry={GUARD_GEOMETRY}
            color={config.guardColor}
            rimColor={config.glowColor}
        />
        <DaggerPart
            geometry={CRYSTAL_GEOMETRY}
            ref={glowMaterialRef}
            color={CRYSTAL.color}
            rimColor={config.glowColor}
            emissive={config.glowColor}
        />
        <DaggerPart
            geometry={HANDLE_GEOMETRY}
            color={config.handleColor}
            rimColor={config.glowColor}
        />
        <DaggerPart
            geometry={POMMEL_GEOMETRY}
            position={[0, PROJECTS_POMMEL.positionY, 0]}
            color={config.pommelColor}
            rimColor={config.glowColor}
        />
    </>
);
