/** Number from a URL query parameter, in dev builds only; null in production or when absent */
export const getDevUrlNumber = (name: string) => {
    if (!import.meta.env.DEV) return null;
    const value = new URLSearchParams(window.location.search).get(name);
    if (value === null || value.trim() === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};
