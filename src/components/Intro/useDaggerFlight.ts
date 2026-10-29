import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

import { GLOW_INTENSITY } from '@/components/Glow/Glow.constants';
import { playGlow } from '@/components/Glow/glowStore';
import { getIntroPaths, getIntroTime } from '@/components/Intro/introStore';
import { applyPathPose } from '@/components/IntroPaths/IntroPaths.helpers';

type DaggerFlightOptions = {
    daggerId: string;
    isIntroPlaying: boolean;
};

/**
 * Poses the dagger on its seeded flight path for the current intro time (a pure function of t),
 * and plays its landing glow once it rests. Attach the returned ref to the group holding the dagger's meshes.
 */
export const useDaggerFlight = ({ daggerId, isIntroPlaying }: DaggerFlightOptions) => {
    const flightRef = useRef<Group>(null);
    const hasLandedRef = useRef(false);

    // Ended or skipped: back to the rest pose
    useEffect(() => {
        const flight = flightRef.current;
        if (isIntroPlaying || !flight) return;
        flight.position.set(0, 0, 0);
        flight.quaternion.identity();
    }, [isIntroPlaying]);

    useFrame(() => {
        const flight = flightRef.current;
        const path = getIntroPaths().find(({ sectionId }) => sectionId === daggerId);
        if (!isIntroPlaying || !flight || !path) return;

        const seconds = getIntroTime();
        applyPathPose(path, seconds, flight);

        // Side effect only (the crack decal); a seek back before the landing re-arms it
        const isLanded = seconds >= path.impactSeconds;
        if (isLanded && !hasLandedRef.current) playGlow(daggerId, GLOW_INTENSITY.landing);
        hasLandedRef.current = isLanded;
    });

    return flightRef;
};
