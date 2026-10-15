import { useState } from 'react';

import {
    Blade,
    CrossGuard,
    DaggerLabel,
    Handle,
    Pommel
} from '@/components/Dagger/Dagger.components';
import { EXPOSED_BLADE_LENGTH, FALL_HEIGHT } from '@/components/Dagger/Dagger.constants';
import { useDaggerAnimation } from '@/components/Dagger/useDaggerAnimation';

export interface DaggerConfig {
    /** Id of the CV section this dagger scrolls to */
    sectionId: string;
    label: string;
    positionX: number;
    bladeColor: string;
    guardColor: string;
    handleColor: string;
    pommelColor: string;
    glowColor: string;
}

type DaggerProps = {
    config: DaggerConfig;
    fallDelaySeconds: number;
};

const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
};

export const Dagger = ({ config, fallDelaySeconds }: DaggerProps) => {
    const [hasLanded, setHasLanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const { groupRef, bladeMaterialRef } = useDaggerAnimation({
        fallDelaySeconds,
        swayPhaseOffset: config.positionX,
        isHovered,
        onLand: () => setHasLanded(true)
    });

    const handlePointerOver = () => {
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = () => {
        setIsHovered(false);
        document.body.style.cursor = 'auto';
    };

    return (
        <group
            ref={groupRef}
            position={[config.positionX, FALL_HEIGHT, 0]}
            onClick={() => scrollToSection(config.sectionId)}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            {/* Outer group pivots at ground level; this offset keeps part of the blade above it */}
            <group position={[0, EXPOSED_BLADE_LENGTH, 0]}>
                <Blade
                    color={config.bladeColor}
                    glowColor={config.glowColor}
                    materialRef={bladeMaterialRef}
                />
                <CrossGuard color={config.guardColor} />
                <Handle color={config.handleColor} />
                <Pommel color={config.pommelColor} />

                {hasLanded && <DaggerLabel text={config.label} isHighlighted={isHovered} />}
            </group>
        </group>
    );
};
