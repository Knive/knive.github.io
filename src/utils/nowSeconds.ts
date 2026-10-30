/** Seconds on the page's monotonic clock, shared by the glow bursts and the dagger arrivals */
export const nowSeconds = () => performance.now() / 1000;
