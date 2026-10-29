// playwright-cli run-code template: placeholders are filled in by run.sh (run-code has no Node APIs).
// Skips the intro, screenshots the ground sliding out over the first screen, then each section
// transition (leaving dagger flies back, next one rises and settles) in real time.
// run-code evaluates this file as a single function expression, so it cannot be assigned or exported.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
    const OUT_DIR = '__OUT_DIR__';
    const BASE_URL = '__BASE_URL__';
    const SECTION_IDS = ['experience', 'skills', 'projects', 'education', 'contact'];
    const GROUND_SLIDE_STEPS = [0, 0.25, 0.5, 0.75, 1];
    const TRANSITION_FRAMES = 16;
    const FRAME_INTERVAL_MS = 100;
    const WARM_UP_MS = 2500;
    // A section is active once its top passes the viewport centre: scroll it a bit higher than that
    const SECTION_TOP_RATIO = 0.3;

    const settleFrames = () =>
        page.evaluate(
            () =>
                new Promise((resolve) =>
                    requestAnimationFrame(() => requestAnimationFrame(resolve))
                )
        );

    await page.setViewportSize({ width: 1280, height: 720 });
    // Marks the intro as already played this session, so the landed scene shows straight away
    await page.addInitScript(() => sessionStorage.setItem('intro-played', 'true'));
    await page.goto(BASE_URL);
    await page.waitForTimeout(WARM_UP_MS);

    for (const [index, viewports] of GROUND_SLIDE_STEPS.entries()) {
        await page.evaluate((top) => window.scrollTo(0, top * window.innerHeight), viewports);
        await settleFrames();
        await page.screenshot({ path: `${OUT_DIR}/ground/${String(index).padStart(4, '0')}.png` });
    }

    for (const sectionId of SECTION_IDS) {
        await page.evaluate(
            ([id, ratio]) => {
                const top = document.getElementById(id).getBoundingClientRect().top;
                window.scrollTo(0, window.scrollY + top - window.innerHeight * ratio);
            },
            [sectionId, SECTION_TOP_RATIO]
        );
        for (let frame = 0; frame < TRANSITION_FRAMES; frame++) {
            await page.screenshot({
                path: `${OUT_DIR}/${sectionId}/${String(frame).padStart(4, '0')}.png`
            });
            await page.waitForTimeout(FRAME_INTERVAL_MS);
        }
    }

    return 'SCROLL_FRAMES=DONE';
};
