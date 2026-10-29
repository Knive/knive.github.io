// playwright-cli run-code template: placeholders are filled in by run.sh (run-code has no Node APIs).
// Screenshots the HTML layer only (canvas hidden) of the hero and each section, at desktop and
// mobile sizes, for pixel diffs during style refactors. Reduced motion makes the reveals static.
// run-code evaluates this file as a single function expression, so it cannot be assigned or exported.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
    const OUT_DIR = '__OUT_DIR__';
    const BASE_URL = '__BASE_URL__';
    const SECTION_IDS = ['experience', 'skills', 'projects', 'education', 'contact'];
    const VIEWPORTS = [
        { name: 'desktop', width: 1440, height: 900 },
        { name: 'mobile', width: 390, height: 844 }
    ];
    const SETTLE_MS = 1500;

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('intro-played', 'true'));

    for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(BASE_URL);
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({ content: 'canvas { visibility: hidden !important; }' });
        await page.waitForTimeout(SETTLE_MS);
        await page.screenshot({ path: `${OUT_DIR}/${viewport.name}-hero.png` });

        for (const sectionId of SECTION_IDS) {
            await page.evaluate(
                (id) =>
                    document
                        .getElementById(id)
                        .scrollIntoView({ block: 'center', behavior: 'instant' }),
                sectionId
            );
            await page.waitForTimeout(SETTLE_MS);
            await page.screenshot({ path: `${OUT_DIR}/${viewport.name}-${sectionId}.png` });
        }
    }

    return 'STYLE_SHOTS=DONE';
};
