// playwright-cli run-code template: placeholders are filled in by run.sh (run-code has no Node APIs).
// Screenshots the scene (hero and each section centred) and reads window.__scene.measure() at each
// position, then compares draw calls and frame time at Skills with and without ?keepGround.
// run-code evaluates this file as a single function expression, so it cannot be assigned or exported.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
    const OUT_DIR = '__OUT_DIR__';
    const BASE_URL = '__BASE_URL__';
    const POSITIONS = ['hero', 'experience', 'skills', 'projects', 'education', 'contact'];
    // Screenshots at the first two; the others only check the framing numbers
    const VIEWPORTS = [
        { name: 'desktop', width: 1440, height: 900, isShot: true },
        { name: 'mobile', width: 390, height: 844, isShot: true },
        { name: 'tablet', width: 768, height: 1024, isShot: false },
        { name: 'wide', width: 1920, height: 1080, isShot: false }
    ];
    const WARM_UP_MS = 3000;
    // Dagger lift (1.1 s) plus the camera damping settling
    const SETTLE_MS = 2500;
    // Heavy enough that the frame no longer fits the 60 fps budget, so its real cost shows
    const CPU_THROTTLE = 20;
    const FRAME_SAMPLE_MS = 3000;

    const scrollTo = (position) =>
        page.evaluate((id) => {
            if (id === 'hero') window.scrollTo({ top: 0, behavior: 'instant' });
            else
                document
                    .getElementById(id)
                    .scrollIntoView({ block: 'center', behavior: 'instant' });
        }, position);

    const measure = () => page.evaluate(() => window.__scene.measure());

    const format = (viewport, position, m) =>
        [
            `${viewport.name} ${viewport.width}x${viewport.height}`.padEnd(20),
            position.padEnd(11),
            `tilt ${m.tilt.toFixed(2)}`,
            `trees ${m.isTreeInFrustum ? 'YES' : 'no'}`,
            `ground ${m.isGroundInFrustum ? 'YES' : 'no'}`,
            `scenery ${m.isSceneryRendered ? 'drawn' : 'hidden'}`,
            `moon ${m.isMoonInFrame ? 'in' : 'OUT'} ${m.moonHeightPercent}%vh`,
            `dagger ${m.isDaggerBesideSection === null ? 'n/a' : m.isDaggerBesideSection ? 'beside' : 'OFF'}`,
            `calls ${m.drawCalls}`
        ].join(' | ');

    const sampleFrameMs = () =>
        page.evaluate(
            (duration) =>
                new Promise((resolve) => {
                    const times = [];
                    let last = performance.now();
                    const start = last;
                    const tick = (now) => {
                        times.push(now - last);
                        last = now;
                        if (now - start < duration) requestAnimationFrame(tick);
                        else resolve(times.reduce((sum, t) => sum + t, 0) / times.length);
                    };
                    requestAnimationFrame(tick);
                }),
            FRAME_SAMPLE_MS
        );

    await page.addInitScript(() => sessionStorage.setItem('intro-played', 'true'));
    const lines = [];

    for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(BASE_URL);
        await page.waitForTimeout(WARM_UP_MS);
        for (const [index, position] of POSITIONS.entries()) {
            await scrollTo(position);
            await page.waitForTimeout(SETTLE_MS);
            lines.push(format(viewport, position, await measure()));
            if (viewport.isShot) {
                await page.screenshot({
                    path: `${OUT_DIR}/${viewport.name}-${index}-${position}.png`
                });
            }
        }
    }

    // Frame cost at Skills: scenery hidden (default) against kept (?keepGround)
    const cdp = await page.context().newCDPSession(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const query of ['', '?keepGround']) {
        await page.goto(BASE_URL + query);
        await page.waitForTimeout(WARM_UP_MS);
        await scrollTo('skills');
        await page.waitForTimeout(SETTLE_MS);
        const m = await measure();
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE });
        const frameMs = await sampleFrameMs();
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
        lines.push(
            `perf skills ${query || '(scenery hidden)'}: ${m.drawCalls} draw calls, ${m.triangles} triangles, ` +
                `${frameMs.toFixed(1)} ms/frame at ${CPU_THROTTLE}x CPU throttle`
        );
    }

    return lines.join('\n') + '\nSCENE_REVIEW=DONE';
};
