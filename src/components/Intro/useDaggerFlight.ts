import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

import type { LandingTransform } from '@/components/BladeField/BladeField.constants';
import { GLOW_INTENSITY } from '@/components/Glow/Glow.constants';
import { playGlow } from '@/components/Glow/glowStore';
import {
    applyFlightPose,
    createFlightPlan,
    toFlightSeconds
} from '@/components/Intro/Intro.helpers';

type DaggerFlightOptions = {
    daggerId: string;
    /** This dagger's strand of the braid */
    strand: number;
    landing: LandingTransform;
    isIntroPlaying: boolean;
};

/**
 * Flies the dagger along its strand of the braid, then dives it into its landing,
 * and plays its landing glow on impact. Attach the returned ref to the group holding the dagger's meshes.
 */
export const useDaggerFlight = ({
    daggerId,
    strand,
    landing,
    isIntroPlaying
}: DaggerFlightOptions) => {
    const flightRef = useRef<Group>(null);
    const hasLandedRef = useRef(false);
    const plan = useMemo(
        () => createFlightPlan(strand, daggerId, landing),
        [strand, daggerId, landing]
    );

    // Ended or skipped: back to the rest pose
    useEffect(() => {
        const flight = flightRef.current;
        if (isIntroPlaying || !flight) return;
        flight.position.set(0, 0, 0);
        flight.quaternion.identity();
    }, [isIntroPlaying]);

    useFrame(({ clock }) => {
        const flight = flightRef.current;
        if (!isIntroPlaying || !flight || hasLandedRef.current) return;

        const flightSeconds = toFlightSeconds(clock.elapsedTime);
        if (flightSeconds < plan.landingSeconds) {
            applyFlightPose(plan, flightSeconds, flight);
            return;
        }

        hasLandedRef.current = true;
        flight.position.set(0, 0, 0);
        flight.quaternion.identity();
        playGlow(daggerId, GLOW_INTENSITY.landing);
    });

    return flightRef;
};
