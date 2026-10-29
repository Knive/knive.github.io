// playwright-cli run-code template: placeholders are filled in by run.sh (run-code has no Node APIs).
// Seeks the intro frame by frame, screenshots each frame, then returns the numeric checks as JSON.
// run-code evaluates this file as a single function expression, so it cannot be assigned or exported.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
    const OUT_DIR = '__OUT_DIR__';
    const BASE_URL = '__BASE_URL__';
    const FRAMES_PER_SECOND = 30;
    const END_SECONDS = 4;
    const WARM_UP_MS = 2000;

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${BASE_URL}?review&t=0`);
    await page.waitForFunction(() => window.__intro !== undefined);
    // Textures, shaders and the first frames
    await page.waitForTimeout(WARM_UP_MS);

    const frameCount = Math.round(END_SECONDS * FRAMES_PER_SECOND);
    for (let frame = 0; frame <= frameCount; frame++) {
        await page.evaluate((seconds) => window.__intro.seek(seconds), frame / FRAMES_PER_SECOND);
        // Two animation frames: the scene renders at the new time before the screenshot
        await page.evaluate(
            () =>
                new Promise((resolve) =>
                    requestAnimationFrame(() => requestAnimationFrame(resolve))
                )
        );
        await page.screenshot({ path: `${OUT_DIR}/frames/${String(frame).padStart(4, '0')}.png` });
    }

    // The overall result first, on its own line, for run.sh to read
    const report = await page.evaluate(() => window.__intro.check());
    return `INTRO_CHECKS=${report.passed ? 'PASSED' : 'FAILED'}\n${JSON.stringify(report, null, 2)}`;
};
