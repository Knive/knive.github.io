import { DaggerPart, type DaggerPartsProps } from '@/components/Dagger/Dagger.components';
import { createBarGeometry, createWrappedHandleGeometry } from '@/components/Dagger/Dagger.helpers';
import {
    SKILLS_GUARD,
    SKILLS_HANDLE,
    SKILLS_POMMEL
} from '@/components/SkillsDagger/SkillsDagger.constants';
import {
    createBladeGeometry,
    createPommelGeometry,
    createRuneTexture
} from '@/components/SkillsDagger/SkillsDagger.helpers';

// Built once: there is a single Skills dagger
const BLADE_GEOMETRY = createBladeGeometry();
const GUARD_GEOMETRY = createBarGeometry(SKILLS_GUARD);
const HANDLE_GEOMETRY = createWrappedHandleGeometry(SKILLS_HANDLE);
const POMMEL_GEOMETRY = createPommelGeometry();
const RUNE_TEXTURE_MAP = createRuneTexture();

export const SkillsDaggerParts = ({ config, glowMaterialRef }: DaggerPartsProps) => (
    <>
        <DaggerPart
            geometry={BLADE_GEOMETRY}
            ref={glowMaterialRef}
            color={config.bladeColor}
            rimColor={config.glowColor}
            emissive={config.glowColor}
            emissiveMap={RUNE_TEXTURE_MAP}
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
            position={[0, SKILLS_POMMEL.positionY, 0]}
            color={config.pommelColor}
            rimColor={config.glowColor}
        />
    </>
);
