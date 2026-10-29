import { useMemo, useRef, useState, type RefObject } from 'react';
import { Trail } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Color, Object3D } from 'three';

import { TRAIL } from '@/components/Intro/Intro.constants';

type DaggerTrailProps = {
    /** Point on the flying dagger the streak follows */
    sourceRef: RefObject<Object3D | null>;
    glowColor: string;
};

/** Thin at the tail, full width at the dagger */
const taperToTail = (progress: number) => progress * progress;

/**
 * Light streak behind a flying dagger. The trail follows a detached anchor holding the source's
 * world position, and only mounts once that position is known, so it never streaks in from the origin.
 */
export const DaggerTrail = ({ sourceRef, glowColor }: DaggerTrailProps) => {
    const anchorRef = useRef(new Object3D());
    const [isReady, setIsReady] = useState(false);
    // Above 1 so the streak blooms
    const color = useMemo(() => new Color(glowColor).multiplyScalar(TRAIL.brightness), [glowColor]);

    useFrame(() => {
        const source = sourceRef.current;
        if (!source) return;
        source.getWorldPosition(anchorRef.current.position);
        if (!isReady) setIsReady(true);
    });

    if (!isReady) return null;
    return (
        <Trail
            target={anchorRef}
            width={TRAIL.width}
            length={TRAIL.length}
            color={color}
            attenuation={taperToTail}
        />
    );
};
