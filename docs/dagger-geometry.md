# Dagger geometry (local space, y-axis along blade length)

- Blade tip at y = -bladeLength (each dagger sets its own blade constant, used by `DaggerConfig.bladeLength`). The lower part is embedded below ground, so silhouette details belong in the upper ~60% of the blade
- Guard at y = 0; an inner group lifts the dagger by `bladeLength * EXPOSED_BLADE_RATIO` so ~60% of the blade shows above ground (outer group at y = 0 sits at the ground)
- Grip and pommel heights vary per dagger (see each `*Dagger.constants.ts`); keep the top of the pommel at or below y = 1 (`DAGGER_LIFT.hiltTopY`, `HIT_SHAPE.hiltHeight`)
- Blades and flat ornaments face the camera: shapes in the xy plane, extruded along z and centred on z = 0

## Adding a GLB model

When replacing procedural geometry with a GLB, use `useGLTF` from Drei inside that dagger's `*DaggerParts`. The coordinate system above stays the same — just swap the geometry meshes with the loaded scene nodes, and pass `glowMaterialRef` to every glowing material.
