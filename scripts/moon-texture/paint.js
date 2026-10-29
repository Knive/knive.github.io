// playwright-cli run-code template: placeholders are filled in by run.sh (run-code has no Node APIs).
// Paints the moon disc procedurally into a 2048x2048 canvas (transparent outside the disc) and
// screenshots it with a transparent background. Seeded: the same seed paints the same moon.
// Painted look, after the Arcane moon reference: flat crater shapes with lit rims and dark facets,
// foreshortened toward the limb, over soft mottled tones.
// run-code evaluates this file as a single function expression, so it cannot be assigned or exported.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
    const OUT_FILE = '__OUT_FILE__';
    const SIZE = 2048;

    await page.setViewportSize({ width: SIZE, height: SIZE });
    await page.setContent(
        `<html><body style="margin:0;background:transparent"><canvas width="${SIZE}" height="${SIZE}" style="display:block"></canvas></body></html>`
    );

    await page.evaluate((size) => {
        const SEED = 7;
        // Light comes from the upper left: lit edges face it, shadows fall away from it
        const LIGHT_ANGLE = Math.atan2(-1, -1);
        const PALETTE = {
            base: '#e1e6ee',
            mottleLight: '#f4f6fa',
            mottleDark: '#aab3c3',
            plate: '#c9d0dc',
            plateEdge: '#edf0f5',
            floor: '#cdd4df',
            shadow: '#a3adbe',
            lit: '#f3f5f9',
            rimLight: '#fafbfd',
            terrace: '#b6bfcd',
            shade: 'rgba(56, 66, 92, 0.34)'
        };
        // Count and radius range (in pixels) of each crater scale, largest first
        const CRATER_SCALES = [
            { count: 5, minRadius: 170, maxRadius: 320, hasTerrace: true },
            { count: 16, minRadius: 55, maxRadius: 140, hasTerrace: true },
            { count: 55, minRadius: 12, maxRadius: 40, hasTerrace: false }
        ];
        const PLATE_COUNT = 5;
        const MOTTLE_COUNT = 70;
        const DAB_COUNT = 1400;
        // Craters at the limb keep at least this much of their width
        const MIN_SQUASH = 0.22;

        // mulberry32: small seeded generator
        let state = SEED;
        const random = () => {
            state = (state + 0x6d2b79f5) | 0;
            let t = Math.imul(state ^ (state >>> 15), 1 | state);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const between = (min, max) => min + random() * (max - min);

        const context = document.querySelector('canvas').getContext('2d');
        const centre = size / 2;
        const discRadius = size / 2 - 8;

        const circle = (x, y, radius) => {
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
        };
        // Random point inside the disc, kept at least `margin` pixels from its edge
        const pointInDisc = (margin) => {
            const angle = between(0, Math.PI * 2);
            const distance = Math.sqrt(random()) * (discRadius - margin);
            return {
                x: centre + Math.cos(angle) * distance,
                y: centre + Math.sin(angle) * distance
            };
        };
        /**
         * Local frame of a surface feature: rotated toward the disc centre and squashed along that
         * radial axis, as a flat shape on a sphere appears near the limb. Returns the light angle
         * in that frame.
         */
        const enterSurfaceFrame = (x, y) => {
            const radialAngle = Math.atan2(y - centre, x - centre);
            const distance = Math.hypot(x - centre, y - centre) / discRadius;
            const squash = Math.max(MIN_SQUASH, Math.sqrt(Math.max(0, 1 - distance * distance)));
            context.translate(x, y);
            context.rotate(radialAngle);
            context.scale(squash, 1);
            return LIGHT_ANGLE - radialAngle;
        };

        // Everything is painted inside the disc
        circle(centre, centre, discRadius);
        context.clip();
        context.fillStyle = PALETTE.base;
        context.fillRect(0, 0, size, size);

        // Large soft tonal patches, light and dark, under everything
        for (let patch = 0; patch < MOTTLE_COUNT; patch++) {
            const { x, y } = pointInDisc(0);
            context.save();
            enterSurfaceFrame(x, y);
            context.globalAlpha = between(0.05, 0.12);
            context.fillStyle = random() < 0.5 ? PALETTE.mottleLight : PALETTE.mottleDark;
            circle(0, 0, between(90, 320));
            context.fill();
            context.restore();
        }

        // Large flat plates (maria): smooth lumpy shapes with a lighter edge on the lit side
        for (let plate = 0; plate < PLATE_COUNT; plate++) {
            const { x, y } = pointInDisc(260);
            const radius = between(220, 400);
            const lumps = 14;
            const points = Array.from({ length: lumps }, (_, index) => {
                const angle = (index / lumps) * Math.PI * 2;
                const r = radius * between(0.82, 1.08);
                return { x: Math.cos(angle) * r, y: Math.sin(angle) * r * 0.85 };
            });
            const tracePlate = (dx, dy) => {
                context.beginPath();
                points.forEach((point, index) => {
                    const next = points[(index + 1) % lumps];
                    const midX = (point.x + next.x) / 2 + dx;
                    const midY = (point.y + next.y) / 2 + dy;
                    if (index === 0) context.moveTo(midX, midY);
                    context.quadraticCurveTo(next.x + dx, next.y + dy, midX, midY);
                });
                context.closePath();
            };
            context.save();
            const lightAngle = enterSurfaceFrame(x, y);
            context.fillStyle = PALETTE.plateEdge;
            tracePlate(Math.cos(lightAngle) * 14, Math.sin(lightAngle) * 14);
            context.fill();
            context.globalAlpha = 0.85;
            context.fillStyle = PALETTE.plate;
            tracePlate(0, 0);
            context.fill();
            context.restore();
        }

        // Craters, in their surface frame: a lit outer rim toward the light, then in the bowl a
        // shadow crescent on the wall facing the light, a lit far wall, a flat floor and, on the
        // larger ones, a terrace arc
        for (const { count, minRadius, maxRadius, hasTerrace } of CRATER_SCALES) {
            for (let crater = 0; crater < count; crater++) {
                const radius = between(minRadius, maxRadius);
                const { x, y } = pointInDisc(radius * 0.4);
                const shift = radius * 0.18;

                context.save();
                const lightAngle = enterSurfaceFrame(x, y);
                const lightX = Math.cos(lightAngle);
                const lightY = Math.sin(lightAngle);

                context.strokeStyle = PALETTE.rimLight;
                context.lineWidth = Math.max(3, radius * 0.07);
                context.beginPath();
                context.arc(0, 0, radius * 1.05, lightAngle - 1.1, lightAngle + 1.1);
                context.stroke();

                circle(0, 0, radius);
                context.clip();
                context.fillStyle = PALETTE.lit;
                context.fill();
                context.fillStyle = PALETTE.shadow;
                circle(lightX * shift * 0.35, lightY * shift * 0.35, radius);
                context.fill();
                context.fillStyle = PALETTE.floor;
                circle(-lightX * shift * 0.45, -lightY * shift * 0.45, radius * 0.78);
                context.fill();
                if (hasTerrace) {
                    context.strokeStyle = PALETTE.terrace;
                    context.lineWidth = Math.max(2, radius * 0.035);
                    context.beginPath();
                    context.arc(
                        -lightX * shift * 0.6,
                        -lightY * shift * 0.6,
                        radius * between(0.45, 0.6),
                        lightAngle + Math.PI - 1.3,
                        lightAngle + Math.PI + 1.3
                    );
                    context.stroke();
                }
                context.restore();
            }
        }

        // Brushwork: faint round dabs, light and dark, flattened like the surface
        for (let dab = 0; dab < DAB_COUNT; dab++) {
            const { x, y } = pointInDisc(0);
            context.save();
            enterSurfaceFrame(x, y);
            context.globalAlpha = between(0.04, 0.09);
            context.fillStyle = random() < 0.55 ? PALETTE.mottleLight : PALETTE.mottleDark;
            context.beginPath();
            context.ellipse(
                0,
                0,
                between(6, 26),
                between(10, 40),
                between(0, Math.PI),
                0,
                Math.PI * 2
            );
            context.fill();
            context.restore();
        }

        // Volume: the disc darkens away from the light, in a soft band toward the lower right
        const shade = context.createRadialGradient(
            centre + Math.cos(LIGHT_ANGLE) * discRadius * 0.45,
            centre + Math.sin(LIGHT_ANGLE) * discRadius * 0.45,
            discRadius * 0.35,
            centre,
            centre,
            discRadius * 1.05
        );
        shade.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shade.addColorStop(1, PALETTE.shade);
        context.fillStyle = shade;
        context.fillRect(0, 0, size, size);
    }, SIZE);

    await page.screenshot({ path: OUT_FILE, omitBackground: true });
    return 'MOON_TEXTURE=DONE';
};
