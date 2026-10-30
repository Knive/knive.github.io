import { cva } from 'class-variance-authority';

// Hidden on narrow screens, where it would clip at the edge accent and the hero borders
export const daggerLabelVariants = cva(
    [
        'pointer-events-none whitespace-nowrap select-none max-md:hidden',
        'font-display text-[0.68rem] tracking-[0.14em]',
        'transition-[color] duration-400 ease-[ease]'
    ],
    {
        variants: {
            isHighlighted: {
                true: 'text-moonlight',
                false: 'text-[#6a7a8a]'
            }
        },
        defaultVariants: { isHighlighted: false }
    }
);
