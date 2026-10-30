import { cva } from 'class-variance-authority';

// Translucent blurred bar: the sky shows through, text scrolling underneath does not
export const headerVariants = cva([
    'sticky top-0 z-20',
    'flex items-center justify-between gap-x-8',
    'bg-void/70 px-10 py-4 backdrop-blur-md max-md:px-6'
]);

export const headerNameVariants = cva([
    'font-display text-xl tracking-[0.3em] font- text-white no-underline',
    'hover:text-ember focus-visible:text-ember'
]);

// Below md only: toggles the nav panel
export const menuButtonVariants = cva([
    'cursor-pointer bg-transparent font-display text-[0.9rem] tracking-[0.2em] text-steel md:hidden',
    'hover:text-ember focus-visible:text-ember'
]);

// A row from md; below md a dropdown panel under the bar, shown only while the menu is open
export const navListVariants = cva(
    [
        'flex list-none gap-x-6 md:flex-wrap',
        'max-md:absolute max-md:inset-x-0 max-md:top-full max-md:flex-col max-md:gap-y-4',
        'max-md:bg-void/90 max-md:px-6 max-md:py-5 max-md:backdrop-blur-md'
    ],
    {
        variants: {
            isOpen: {
                true: '',
                false: 'max-md:hidden'
            }
        }
    }
);

// Section links and the language toggle share one look
export const navLinkVariants = cva([
    'cursor-pointer bg-transparent',
    'font-nav text-sm uppercase font-medium tracking-widest text-steel no-underline max-md:text-base',
    'transition-[color] duration-200 ease-[ease]',
    'hover:text-ember focus-visible:text-ember'
]);

export const languageButtonStyle = 'md:w-5 md:border-l md:border-ember md:pl-6';
