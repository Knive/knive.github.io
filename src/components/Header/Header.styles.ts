import { cva } from 'class-variance-authority';

// Solid enough to read over scrolling text, then only the bottom padding fades into the scene
export const headerVariants = cva([
    'sticky top-0 z-20',
    'flex flex-wrap items-center justify-between gap-x-8 gap-y-2',
    'px-10 pt-5 pb-8 max-md:px-6',
    'bg-[linear-gradient(to_bottom,var(--color-void)_calc(100%-2rem),rgb(7_9_13/0))]'
]);

export const headerNameVariants = cva([
    'font-display text-[1.05rem] tracking-[0.3em] text-steel no-underline',
    'hover:text-ember focus-visible:text-ember'
]);

export const navListVariants = cva([
    'flex list-none flex-wrap',
    'gap-x-6 gap-y-2 max-md:gap-x-4 max-md:gap-y-1'
]);

// Section links and the language toggle share one look
export const navLinkVariants = cva([
    'font-display text-[0.85rem] text-steel no-underline max-md:text-[0.75rem]',
    'transition-[color] duration-200 ease-[ease]',
    'hover:text-ember focus-visible:text-ember'
]);
