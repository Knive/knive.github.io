import { useState, type ComponentType } from 'react';

import {
    ContactShadow,
    DaggerLabel,
    type DaggerPartsProps
} from '@/components/Dagger/Dagger.components';
import { EXPOSED_BLADE_RATIO } from '@/components/Dagger/Dagger.constants';
import { useDaggerHoverGlow } from '@/components/Dagger/useDaggerHoverGlow';

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
    /** Distance from the guard (y = 0) to the tip (y = -bladeLength) */
    bladeLength: number;
    /** Blade, guard, handle and pommel meshes, in the local space of docs/dagger-geometry.md */
    Parts: ComponentType<DaggerPartsProps>;
}

type DaggerProps = {
    config: DaggerConfig;
};

const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
};

export const Dagger = ({ config }: DaggerProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const glowMaterialRef = useDaggerHoverGlow(isHovered);

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
            position={[config.positionX, 0, 0]}
            onClick={() => scrollToSection(config.sectionId)}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            <ContactShadow />

            {/* Outer group sits at ground level; this offset keeps part of the blade above it */}
            <group position={[0, config.bladeLength * EXPOSED_BLADE_RATIO, 0]}>
                <config.Parts config={config} glowMaterialRef={glowMaterialRef} />
                <DaggerLabel text={config.label} isHighlighted={isHovered} />
            </group>
        </group>
    );
};
