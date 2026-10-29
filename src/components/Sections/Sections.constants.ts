/** Text blocks slide in from their side, one after another, as the section scrolls in */
export const SECTION_REVEAL = {
    offsetPx: 80,
    durationSeconds: 0.9,
    staggerSeconds: 0.08,
    /** ScrollTrigger start: section top reaches 70% of the viewport height */
    start: 'top 70%'
} as const;

/** Time for a dagger to rise from the floor to its section's margin, and back */
export const DAGGER_LIFT_SECONDS = 1.1;

export const PROFILE_NAME = 'Kevin Nguyen';

export interface TimelineEntry {
    title: string;
    place: string;
    period: string;
    summary: string;
}

export interface SkillGroup {
    name: string;
    skills: string[];
}

export interface Project {
    name: string;
    description: string;
    tags: string[];
}

export interface ContactLink {
    label: string;
    href: string;
    text: string;
}

export type SectionId = 'experience' | 'skills' | 'projects' | 'education' | 'contact';
