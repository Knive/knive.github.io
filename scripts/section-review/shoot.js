// playwright-cli run-code template: placeholders are filled in by run.sh (run-code has no Node APIs).
// Screenshots of the hero and each section centred, canvas visible, at desktop and mobile sizes,
// then Skills again in French. Reduced motion makes the reveals static.
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
    const SETTLE_MS = 2000;

    const centreSection = async (id) => {
        await page.evaluate(
            (sectionId) =>
                document
                    .getElementById(sectionId)
                    .scrollIntoView({ block: 'center', behavior: 'instant' }),
            id
        );
        await page.waitForTimeout(SETTLE_MS);
    };

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('intro-played', 'true'));

    for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(BASE_URL);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(SETTLE_MS);
        await page.screenshot({ path: `${OUT_DIR}/${viewport.name}-0-hero.png` });

        for (const [index, sectionId] of SECTION_IDS.entries()) {
            await centreSection(sectionId);
            await page.screenshot({
                path: `${OUT_DIR}/${viewport.name}-${index + 1}-${sectionId}.png`
            });
        }

        await page.getByRole('button', { name: 'FR' }).click();
        await centreSection('skills');
        await page.screenshot({ path: `${OUT_DIR}/${viewport.name}-6-skills-fr.png` });
        await page.getByRole('button', { name: 'EN' }).click();
    }

    return 'SECTION_SHOTS=DONE';
};
