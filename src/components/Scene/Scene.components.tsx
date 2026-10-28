import { FOG } from '@/components/Scene/Scene.constants';

/** Warm sunset light from left, cool moonlight fill from right */
export const Lights = () => {
    return (
        <>
            <ambientLight intensity={0.15} />
            <directionalLight position={[-2, 2, 2]} intensity={5} color="#e59866" />
            <directionalLight position={[2, 4, 1]} intensity={2} color="#5dade2" />
        </>
    );
};

/** Background in the fog colour, so distant things dissolve into the night */
export const Atmosphere = () => (
    <>
        <color attach="background" args={[FOG.color]} />
        <fog attach="fog" args={[FOG.color, FOG.near, FOG.far]} />
    </>
);
