import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

import { GLOW_INTENSITY } from '@/components/Glow/Glow.constants';
import { playGlow } from '@/components/Glow/glowStore';
import {
    applyFlightPose,
    createFlightCurve,
    getFlightProgress,
    getLandingSeconds,
    toFlightSeconds
} from '@/components/Intro/Intro.helpers';

type DaggerFlightOptions = {
    daggerId: string;
    /** 0 for the lead dagger, then one landing gap later per step */
    landingOrder: number;
    isIntroPlaying: boolean;
};

/**
 * Flies the dagger from the sky to its rest position during the intro and plays
 * its landing glow on impact. Attach the returned ref to the group holding the dagger's meshes.
 */
export const useDaggerFlight = ({
    daggerId,
    landingOrder,
    isIntroPlaying
}: DaggerFlightOptions) => {
    const flightRef = useRef<Group>(null);
    const hasLandedRef = useRef(false);
    const curve = useMemo(() => createFlightCurve(landingOrder), [landingOrder]);
    const landingSeconds = getLandingSeconds(landingOrder);

    // Ended or skipped: back to the rest pose
    useEffect(() => {
        const flight = flightRef.current;
        if (isIntroPlaying || !flight) return;
        flight.position.set(0, 0, 0);
        flight.quaternion.identity();
        flight.visible = true;
    }, [isIntroPlaying]);

    useFrame(({ clock }) => {
        const flight = flightRef.current;
        if (!isIntroPlaying || !flight || hasLandedRef.current) return;

        const flightSeconds = toFlightSeconds(clock.elapsedTime);
        const progress = getFlightProgress(landingSeconds, flightSeconds);
        flight.visible = progress > 0;
        applyFlightPose(curve, progress, flight);

        if (progress < 1) return;
        hasLandedRef.current = true;
        flight.quaternion.identity();
        playGlow(daggerId, GLOW_INTENSITY.landing);
    });

    return flightRef;
};
