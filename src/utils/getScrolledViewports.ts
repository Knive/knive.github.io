/** How far the page has scrolled, in viewport heights (0 at the top, 1 after one screen) */
export const getScrolledViewports = () => window.scrollY / window.innerHeight;
