import { DoubleSide, PlaneGeometry } from 'three';

import { TREE_ASPECT, TREE_TEXTURE, TREES } from '@/components/TreeLine/TreeLine.constants';
import { createTreeTexture } from '@/components/TreeLine/TreeLine.helpers';

/** Drop the transparent canvas around the branches */
const ALPHA_CUTOFF = 0.5;

// Built once and shared: each tree is a scaled unit plane with one of a few silhouettes
const TREE_TEXTURES = Array.from({ length: TREE_TEXTURE.variantCount }, (_, variant) =>
    createTreeTexture(TREE_TEXTURE.seedBase + variant)
);
const UNIT_PLANE = new PlaneGeometry(1, 1);

/** Bare tree cutouts behind the daggers; unlit, faded by the scene fog */
export const TreeLine = () => (
    <>
        {TREES.map(({ x, z, height, variant, isFlipped }) => (
            <mesh
                key={`${x}:${z}`}
                geometry={UNIT_PLANE}
                position={[x, height / 2, z]}
                scale={[height * TREE_ASPECT * (isFlipped ? -1 : 1), height, 1]}
            >
                {/* DoubleSide: a flipped (negative x scale) plane shows its back face */}
                <meshBasicMaterial
                    map={TREE_TEXTURES[variant]}
                    alphaTest={ALPHA_CUTOFF}
                    side={DoubleSide}
                />
            </mesh>
        ))}
    </>
);
