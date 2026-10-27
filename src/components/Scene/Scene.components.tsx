import { FOG } from '@/components/Scene/Scene.constants';

/**
 * Warm torchlight from left, cooler fill from right
 */
export const Lights = () => {
    return (
        <>
            <pointLight position={[0, 0, 0]} intensity={2} />
            <ambientLight intensity={0.07} />
            <pointLight position={[-2.5, 5, 3]} intensity={45} color="#D0863A" decay={2} />
            <pointLight position={[3, 7, 1]} intensity={22} color="#6080B8" decay={2} />
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
