import { cva } from 'class-variance-authority';

/*
 * Three columns from lg (title | dagger | content, mirrored by side), two from md (title over
 * content | dagger), one below md (no dagger column: the dagger is a small edge accent). No gaps: the
 * hairlines are the column dividers, as in the references.
 */
export const sectionShellVariants = cva(
    [
        'relative isolate mx-auto grid min-h-screen max-w-300 px-10 py-section max-md:px-6',
        "grid-cols-1 [grid-template-areas:'title'_'content'] max-lg:content-center max-lg:gap-y-8",
        'md:grid-cols-2 md:grid-rows-[auto_1fr] lg:grid-cols-3 lg:grid-rows-1'
    ],
    {
        variants: {
            side: {
                left: [
                    "md:[grid-template-areas:'title_dagger'_'content_dagger']",
                    "lg:[grid-template-areas:'title_dagger_content']"
                ],
                right: [
                    "md:[grid-template-areas:'dagger_title'_'dagger_content']",
                    "lg:[grid-template-areas:'content_dagger_title']"
                ]
            }
        }
    }
);

// Over the content box (inside the section padding), above the content panel like in the references
export const hairlinesVariants = cva(
    'pointer-events-none absolute inset-x-10 inset-y-0 z-1 max-md:inset-x-6'
);

export const hairlineVariants = cva('absolute inset-y-0 w-px bg-accent/35', {
    variants: {
        position: {
            start: 'left-0',
            oneThird: 'left-1/3 max-lg:hidden',
            twoThirds: 'left-2/3 max-lg:hidden',
            end: 'right-0'
        }
    }
});

// Query container: the title sizes itself in cqi so the longest title fits its column
export const titleColumnVariants = cva('@container [grid-area:title] max-lg:px-5 lg:self-center');

/*
 * Sticky box centred in the viewport, so the dagger stays in view while the section scrolls.
 * The negative margin starts it high enough to be centred when the section activates (top at
 * mid-viewport), otherwise the box sits low and the dagger sinks into the floor.
 * Below md there is no dagger column: a narrow strip fixed on the outer edge (opposite the
 * title side) makes the dagger a small accent; its height sets the dagger's size.
 */
export const daggerAnchorVariants = cva(
    [
        'md:sticky md:top-[30vh] md:-mt-[calc(var(--spacing-section)+20vh)] md:self-start',
        'md:h-[40vh] md:w-[min(100%,16rem)] md:justify-self-center md:[grid-area:dagger]',
        'pointer-events-none max-md:fixed max-md:top-[40vh] max-md:h-[22vh] max-md:w-12'
    ],
    {
        variants: {
            side: {
                left: 'max-md:right-0',
                right: 'max-md:left-0'
            }
        }
    }
);

// Dark panel so body text reads over the bright sky and the moon; the title column stays clear
export const contentColumnVariants = cva(
    '[grid-area:content] bg-void/45 p-6 backdrop-blur-sm max-lg:mx-5 lg:self-center'
);
