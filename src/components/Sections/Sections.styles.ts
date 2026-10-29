import { cva } from 'class-variance-authority';

/*
 * The ::before scrim sits behind the text side only, so the text reads over the floor while the
 * dagger side stays clear. It spans the viewport width and fades out at the top and bottom: no
 * edge between hero and sections. Single column (mobile): text spans the width, dim evenly.
 */
export const sectionVariants = cva(
    "relative isolate mx-auto grid min-h-screen max-w-6xl grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 px-10 py-section before:pointer-events-none before:absolute before:inset-x-[calc(50%-50vw)] before:inset-y-0 before:-z-1 before:bg-[linear-gradient(var(--scrim-direction,to_right),rgb(7_9_13/0.88)_0%,rgb(7_9_13/0.7)_40%,rgb(7_9_13/0)_65%)] before:mask-[linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] before:content-[''] max-md:grid-cols-[minmax(0,1fr)] max-md:px-6 max-md:before:bg-none max-md:before:bg-[rgb(7_9_13/0.75)]",
    {
        variants: {
            side: {
                left: '',
                right: '[--scrim-direction:to_left]'
            }
        }
    }
);

export const sectionTextVariants = cva('max-w-[55ch]', {
    variants: {
        side: {
            left: '',
            right: 'order-2 justify-self-end max-md:justify-self-start'
        }
    }
});

/*
 * Sticky box centred in the viewport, so the dagger stays in view while the section scrolls.
 * Pushed to the outer edge, clear of the daggers standing in the floor. The negative margin
 * starts it high enough to be centred when the section activates (top at mid-viewport),
 * otherwise the box sits low and the dagger sinks into the floor. Single column: no room for
 * the dagger, it stays in the floor.
 */
export const sectionAnchorVariants = cva(
    'sticky top-[30vh] -mt-[calc(var(--spacing-section)+20vh)] h-[40vh] w-[min(100%,16rem)] self-start max-md:hidden',
    {
        variants: {
            side: {
                left: 'justify-self-end',
                right: 'justify-self-start'
            }
        }
    }
);
