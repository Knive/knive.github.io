import { cva } from 'class-variance-authority';

export const heroVariants = cva('h-screen w-screen min-h-150 overflow-hidden', {
    variants: {
        intent: {
            primary: 'bg-primary text-primary-foreground',
            secondary: 'bg-secondary text-secondary-foreground',
            danger: 'bg-danger text-danger-foreground'
        },
        size: {
            sm: { fontSize: '12px' },
            md: { fontSize: '16px' },
            lg: { fontSize: '24px' }
        }
    },
    defaultVariants: {
        intent: 'primary',
        size: 'md'
    }
});
