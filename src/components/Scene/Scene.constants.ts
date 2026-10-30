import type { Vector3Tuple } from 'three';

import { DAGGER_LANDINGS } from '@/components/BladeField/BladeField.constants';
import type { DaggerConfig } from '@/components/Dagger/Dagger';
import { createCrackLayout } from '@/components/Floor/Floor.helpers';
import { GLOW_PULSES } from '@/components/Glow/Glow.helpers';
import { ContactDaggerParts } from '@/components/ContactDagger/ContactDagger';
import { CONTACT_BLADE } from '@/components/ContactDagger/ContactDagger.constants';
import { EducationDaggerParts } from '@/components/EducationDagger/EducationDagger';
import { EDUCATION_BLADE } from '@/components/EducationDagger/EducationDagger.constants';
import { ExperienceDaggerParts } from '@/components/ExperienceDagger/ExperienceDagger';
import { EXPERIENCE_BLADE } from '@/components/ExperienceDagger/ExperienceDagger.constants';
import { ProjectsDaggerParts } from '@/components/ProjectsDagger/ProjectsDagger';
import { PROJECTS_BLADE } from '@/components/ProjectsDagger/ProjectsDagger.constants';
import { SkillsDaggerParts } from '@/components/SkillsDagger/SkillsDagger';
import { SKILLS_BLADE } from '@/components/SkillsDagger/SkillsDagger.constants';

export type QualityTier = 'low' | 'medium' | 'high';

type QualitySettings = {
    /** Device pixel ratio cap */
    dpr: number;
    hasBloom: boolean;
};

/** From cheapest to most expensive; PerformanceMonitor steps through this order */
export const QUALITY_TIER_ORDER: readonly QualityTier[] = ['low', 'medium', 'high'];

export const QUALITY_TIERS: Record<QualityTier, QualitySettings> = {
    low: { dpr: 1, hasBloom: false },
    medium: { dpr: 1.5, hasBloom: true },
    high: { dpr: 2, hasBloom: true }
};

/** postprocessing's ToneMappingMode.LINEAR, an identity pass here; the enum's package is not a direct dependency */
export const LINEAR_TONE_MAPPING_MODE = 0;

/** Tier changes allowed before PerformanceMonitor gives up and falls back to low */
export const PERFORMANCE_MONITOR_FLIPFLOPS = 3;

export const CAMERA: { position: Vector3Tuple; fov: number; lookAt: Vector3Tuple } = {
    // Low and looking up, so the sky fills most of the frame and the daggers tower
    position: [0, 0.5, 5],
    fov: 50,
    // Camera Tilt
    lookAt: [0, 1.75, 0]
};

/** Linear fog in world units from the camera: daggers stay clear, the floor edge and far trees fade out */
export const FOG = {
    color: '#3a2a3e',
    near: 1,
    far: 13
} as const;

/** Only HDR emissive (the runes) exceeds 1, so nothing else blooms */
export const BLOOM = {
    luminanceThreshold: 1,
    intensity: 1.2
} as const;

export const DAGGERS: DaggerConfig[] = [
    {
        sectionId: 'experience',
        label: 'Experience',
        landing: DAGGER_LANDINGS.experience,
        bladeColor: '#B0B8A4',
        guardColor: '#B08D57',
        handleColor: '#4A3020',
        pommelColor: '#B08D57',
        glowColor: '#C9A24A',
        bladeLength: EXPERIENCE_BLADE.length,
        pulse: GLOW_PULSES.clockwork,
        Parts: ExperienceDaggerParts
    },
    {
        sectionId: 'skills',
        label: 'Skills',
        landing: DAGGER_LANDINGS.skills,
        bladeColor: '#9AAAB8',
        guardColor: '#252E3C',
        handleColor: '#161E2A',
        pommelColor: '#303848',
        glowColor: '#2FB8B0',
        bladeLength: SKILLS_BLADE.length,
        pulse: GLOW_PULSES.runeShimmer,
        Parts: SkillsDaggerParts
    },
    {
        sectionId: 'projects',
        label: 'Projects',
        landing: DAGGER_LANDINGS.projects,
        bladeColor: '#C4CED6',
        guardColor: '#4A4438',
        handleColor: '#2A2420',
        pommelColor: '#5A5048',
        glowColor: '#B04AC9',
        bladeLength: PROJECTS_BLADE.length,
        pulse: GLOW_PULSES.signalWave,
        Parts: ProjectsDaggerParts
    },
    {
        sectionId: 'education',
        label: 'Education',
        landing: DAGGER_LANDINGS.education,
        bladeColor: '#A8A898',
        guardColor: '#3A3828',
        // Bone-white leather
        handleColor: '#D9CDB4',
        pommelColor: '#C4B870',
        glowColor: '#4FAF5A',
        bladeLength: EDUCATION_BLADE.length,
        pulse: GLOW_PULSES.breathing,
        Parts: EducationDaggerParts
    },
    {
        sectionId: 'contact',
        label: 'Contact',
        landing: DAGGER_LANDINGS.contact,
        bladeColor: '#8090A0',
        guardColor: '#28283A',
        // Red-brown leather
        handleColor: '#6B2A1C',
        pommelColor: '#383858',
        glowColor: '#D9502E',
        bladeLength: CONTACT_BLADE.length,
        pulse: GLOW_PULSES.emberFlicker,
        Parts: ContactDaggerParts
    }
];

/** Cracks in the floor radiate from where each dagger is embedded; built once, shared by floor and glow */
export const CRACK_LAYOUT = createCrackLayout(
    DAGGERS.map(({ sectionId, landing }) => ({ daggerId: sectionId, x: landing.x, z: landing.z }))
);
