import { useState, type ComponentType } from 'react';

import { DaggerLabel, type DaggerPartsProps } from '@/components/Dagger/Dagger.components';
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
    /** Blade, guard, handle and pommel meshes, in the local space of docs/dagger-geometry.md */
    Parts: ComponentType<DaggerPartsProps>;
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
                <config.Parts config={config} bladeMaterialRef={bladeMaterialRef} />

                {hasLanded && <DaggerLabel text={config.label} isHighlighted={isHovered} />}
            </group>
        </group>
    );
};
