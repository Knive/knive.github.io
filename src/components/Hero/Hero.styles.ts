import { cva } from 'class-variance-authority';

export const heroVariants = cva('relative h-[80vh] min-h-150 w-screen overflow-clip');

// Sticky just below the header while the hero scrolls, so its scroll fade and rise stay visible
export const heroTitleVariants = cva(
    'pointer-events-none sticky top-24 z-10 px-6 pt-[2vh] text-center'
);

export const heroNameVariants = cva('text-[length:clamp(2.25rem,5vw,3.75rem)] text-moonlight');

export const heroJobVariants = cva(
    'mt-3 text-[length:clamp(1.15rem,2vw,1.5rem)] text-steel italic'
);

// Fixed behind the whole page
export const heroSceneVariants = cva('fixed inset-0 z-0');

// Static sunset sky while the scene chunk loads
export const heroSceneFallbackVariants = cva(
    'size-full bg-linear-to-b from-void via-sapphire/40 to-ember/30'
);

export const heroSkipVariants = cva([
    'absolute right-10 bottom-8 z-10',
    'cursor-pointer border border-copper bg-transparent px-4 py-2',
    'font-display text-[0.8rem] text-steel',
    'transition-[color,border-color] duration-200 ease-[ease]',
    'hover:border-ember hover:text-ember',
    'focus-visible:border-ember focus-visible:text-ember',
    'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ember'
]);
