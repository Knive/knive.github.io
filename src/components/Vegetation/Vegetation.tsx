import { Instance, Instances } from '@react-three/drei';
import { DoubleSide, PlaneGeometry, type Texture } from 'three';

import { BUSHES, GRASS } from '@/components/Vegetation/Vegetation.constants';
import {
    createBushTexture,
    createGrassTexture,
    scatterCards
} from '@/components/Vegetation/Vegetation.helpers';

/** Drop the transparent canvas around the silhouettes */
const ALPHA_CUTOFF = 0.5;

/** Unit card standing on its bottom edge */
const CARD_GEOMETRY = new PlaneGeometry(1, 1).translate(0, 0.5, 0);

const GRASS_CARDS = scatterCards(GRASS.count, GRASS.seed, GRASS.minHeight, GRASS.maxHeight);
const BUSH_CARDS = scatterCards(BUSHES.count, BUSHES.seed, BUSHES.minHeight, BUSHES.maxHeight);
const GRASS_TEXTURE = createGrassTexture();
const BUSH_TEXTURE = createBushTexture();

type CardFieldProps = {
    cards: ReturnType<typeof scatterCards>;
    texture: Texture;
    aspect: number;
};

/** One draw call for all cards sharing a silhouette; they face the camera (+z) */
const CardField = ({ cards, texture, aspect }: CardFieldProps) => (
    <Instances geometry={CARD_GEOMETRY} limit={cards.length}>
        {/* DoubleSide: a flipped (negative x scale) card shows its back face */}
        <meshBasicMaterial map={texture} alphaTest={ALPHA_CUTOFF} side={DoubleSide} />
        {cards.map(({ x, y, z, height, isFlipped }) => (
            <Instance
                key={`${x}:${z}`}
                position={[x, y, z]}
                scale={[height * aspect * (isFlipped ? -1 : 1), height, 1]}
            />
        ))}
    </Instances>
);

/** Grass tufts and bushes scattered on the ground */
export const Vegetation = () => (
    <>
        <CardField cards={GRASS_CARDS} texture={GRASS_TEXTURE} aspect={GRASS.aspect} />
        <CardField cards={BUSH_CARDS} texture={BUSH_TEXTURE} aspect={BUSHES.aspect} />
    </>
);
