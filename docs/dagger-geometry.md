# Placeholder dagger geometry (local space, y-axis along blade length)

- Blade tip at y = -bladeLength (2.2 by default; each dagger sets its own in `DaggerConfig`). The lower part is embedded below ground
- Guard at y = 0; an inner group lifts the dagger by `bladeLength * EXPOSED_BLADE_RATIO` so ~60% of the blade shows above ground (outer group at y = 0 sits at the ground)
- Handle center at y = 0.46, top at y ~0.92
- Pommel at y = 0.96

## Adding a GLB model

When replacing procedural geometry with a GLB, use `useGLTF` from Drei inside `Dagger.tsx`. The group's coordinate system above stays the same — just swap the geometry meshes with the loaded scene nodes.
