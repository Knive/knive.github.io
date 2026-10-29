import { cva } from 'class-variance-authority';

export const daggerLabelVariants = cva(
    [
        'pointer-events-none whitespace-nowrap select-none',
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
