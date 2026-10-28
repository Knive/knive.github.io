/** Text blocks slide in from their side, one after another, as the section scrolls in */
export const SECTION_REVEAL = {
    offsetPx: 80,
    durationSeconds: 0.9,
    staggerSeconds: 0.08,
    /** ScrollTrigger start: section top reaches 70% of the viewport height */
    start: 'top 70%'
} as const;

// Placeholder CV content: replace with the real entries

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

/** Page order; ids match the daggers' sectionId. Text sides alternate, starting on the left */
export const SECTIONS: { id: SectionId; title: string }[] = [
    { id: 'experience', title: 'Experience' },
    { id: 'skills', title: 'Skills' },
    { id: 'projects', title: 'Projects' },
    { id: 'education', title: 'Education' },
    { id: 'contact', title: 'Contact' }
];

export const EXPERIENCE: TimelineEntry[] = [
    {
        title: 'Freelance frontend developer',
        place: 'Self-employed',
        period: '2023 – present',
        summary: 'Interfaces and interactive sites for studios and product teams.'
    },
    {
        title: 'Senior frontend developer',
        place: 'Company name',
        period: '2020 – 2023',
        summary: 'Led the design system and the migration of the web app to React.'
    },
    {
        title: 'Frontend developer',
        place: 'Company name',
        period: '2017 – 2020',
        summary: 'Built customer-facing features and the component library.'
    }
];

export const SKILL_GROUPS: SkillGroup[] = [
    { name: 'Languages', skills: ['TypeScript', 'JavaScript', 'HTML', 'CSS'] },
    { name: 'Frameworks', skills: ['React', 'Vite', 'Tailwind CSS'] },
    { name: '3D and motion', skills: ['Three.js', 'React Three Fiber', 'GSAP'] },
    { name: 'Practices', skills: ['Accessibility', 'Performance', 'Design systems'] }
];

export const PROJECTS: Project[] = [
    {
        name: 'Project name',
        description: 'A short line on what it is and what you built.',
        tags: ['React', 'WebGL']
    },
    {
        name: 'Project name',
        description: 'A short line on what it is and what you built.',
        tags: ['TypeScript', 'Design system']
    },
    {
        name: 'Project name',
        description: 'A short line on what it is and what you built.',
        tags: ['Vite', 'Animation']
    }
];

export const EDUCATION: TimelineEntry[] = [
    {
        title: 'Degree name',
        place: 'School name',
        period: '2014 – 2017',
        summary: 'Field of study and a notable detail.'
    },
    {
        title: 'Certification name',
        place: 'Issuer',
        period: '2019',
        summary: 'What it covered.'
    }
];

export const CONTACT_LINKS: ContactLink[] = [
    { label: 'Email', href: 'mailto:hello@example.com', text: 'hello@example.com' },
    { label: 'GitHub', href: 'https://github.com/knive', text: 'github.com/knive' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/', text: 'LinkedIn profile' }
];
