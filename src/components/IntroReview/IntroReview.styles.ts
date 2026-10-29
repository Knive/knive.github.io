import { cva } from 'class-variance-authority';

// Top-left corner, styled like the storyboard's timestamps
export const introReviewVariants = cva([
    'pointer-events-none fixed top-2 left-3 z-100',
    'font-[family-name:ui-monospace,monospace] text-[2.25rem] leading-none font-semibold',
    'text-white text-shadow-[0_0_2px_#000,0_0_4px_#000]'
]);
