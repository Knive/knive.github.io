import { cva } from 'class-variance-authority';

// Above the fixed canvas and transparent; clip (not hidden) keeps the sticky anchors working
export const sectionsVariants = cva('relative z-1 overflow-x-clip');

export const sectionTitleVariants = cva([
    'mb-8 text-[length:clamp(1.6rem,3vw,2.2rem)]',
    "after:mt-4 after:block after:h-px after:w-8 after:bg-copper after:content-['']"
]);

// Shared by every section body
export const entryListVariants = cva('grid list-none gap-7');

export const entryTitleVariants = cva('font-display text-[1.05rem] text-moonlight');

export const entryMetaVariants = cva('text-copper-light italic');

export const contactLinkVariants = cva([
    'text-steel decoration-copper underline-offset-[0.2em]',
    'transition-[color] duration-200 ease-[ease]',
    'hover:text-ember focus-visible:text-ember'
]);
