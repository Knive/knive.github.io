import { useState, type ComponentType } from 'react';

import type { LandingTransform } from '@/components/BladeField/BladeField.constants';
import { toRestRotation } from '@/components/BladeField/BladeField.helpers';
import {
    ContactShadow,
    DaggerHitShape,
    DaggerLabel,
    type DaggerPartsProps
} from '@/components/Dagger/Dagger.components';
import { HIT_SHAPE } from '@/components/Dagger/Dagger.constants';
import { useDaggerGlow } from '@/components/Dagger/useDaggerGlow';
import { useDaggerLift } from '@/components/Dagger/useDaggerLift';
import type { CrackPath } from '@/components/Floor/Floor.helpers';
import { DaggerGlowEffects } from '@/components/Glow/Glow';
import { GLOW_INTENSITY } from '@/components/Glow/Glow.constants';
import type { GlowPulse } from '@/components/Glow/Glow.helpers';
import { clearHoveredDagger, playGlow, setHoveredDagger } from '@/components/Glow/glowStore';
import { useDaggerFlight } from '@/components/Intro/useDaggerFlight';

export interface DaggerConfig {
    /** Id of the CV section this dagger scrolls to */
    sectionId: string;
    label: string;
    /** Where and how the dagger is planted, from BladeField.constants */
    landing: LandingTransform;
    bladeColor: string;
    guardColor: string;
    handleColor: string;
    pommelColor: string;
    glowColor: string;
    /** Distance from the guard (y = 0) to the tip (y = -bladeLength) */
    bladeLength: number;
    /** Sustained glow rhythm, distinct per dagger so they differ beyond colour */
    pulse: GlowPulse;
    /** Blade, guard, handle and pommel meshes, in the local space of docs/dagger-geometry.md */
    Parts: ComponentType<DaggerPartsProps>;
}

type DaggerProps = {
    config: DaggerConfig;
    /** This dagger's floor cracks, lit by its bursts */
    cracks: CrackPath[];
    /** This dagger's strand of the intro braid */
    flightStrand: number;
    isIntroPlaying: boolean;
};

const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
};

export const Dagger = ({ config, cracks, flightStrand, isIntroPlaying }: DaggerProps) => {
    const { sectionId, bladeLength, pulse } = config;
    const [isHovered, setIsHovered] = useState(false);
    const glowMaterialRef = useDaggerGlow({ daggerId: sectionId, isHovered, pulse });
    const flightRef = useDaggerFlight({
        daggerId: sectionId,
        strand: flightStrand,
        landing: config.landing,
        isIntroPlaying
    });
    const liftRef = useDaggerLift({
        sectionId,
        landing: config.landing,
        bladeLength,
        isIntroPlaying
    });
    const exposedBladeLength = bladeLength * config.landing.exposedRatio;

    const handlePointerOver = () => {
        setIsHovered(true);
        setHoveredDagger(sectionId);
        playGlow(sectionId, GLOW_INTENSITY.hover);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = () => {
        setIsHovered(false);
        clearHoveredDagger(sectionId);
        document.body.style.cursor = 'auto';
    };

    // Also fires on tap, so touch screens get the glow and the navigation
    const handleClick = () => {
        playGlow(sectionId, GLOW_INTENSITY.landing);
        scrollToSection(sectionId);
    };

    return (
        <group position={[config.landing.x, 0, config.landing.z]}>
            <ContactShadow />
            <DaggerGlowEffects
                daggerId={sectionId}
                glowColor={config.glowColor}
                landing={config.landing}
                cracks={cracks}
                isIntroPlaying={isIntroPlaying}
            />
            <group rotation={toRestRotation(config.landing)}>
                <DaggerHitShape
                    height={exposedBladeLength + HIT_SHAPE.hiltHeight}
                    onClick={handleClick}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                />
            </group>

            {/* Only the meshes fly in and lift out; shadow, effects and hit shape stay on the floor */}
            <group ref={liftRef}>
                <group ref={flightRef}>
                    {/* Outer group sits at ground level; this offset keeps part of the blade above it */}
                    <group position={[0, exposedBladeLength, 0]}>
                        <config.Parts config={config} glowMaterialRef={glowMaterialRef} />
                        {/* Html ignores the group's visibility, so hide the label until landed */}
                        {!isIntroPlaying && (
                            <DaggerLabel text={config.label} isHighlighted={isHovered} />
                        )}
                    </group>
                </group>
            </group>
        </group>
    );
};
