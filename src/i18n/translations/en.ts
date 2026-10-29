import type { Translations } from '../i18n.types';

export const en: Translations = {
    profile: {
        jobTitle: 'Senior Fullstack Engineer'
    },
    sections: [
        { id: 'experience', title: 'Experience' },
        { id: 'skills', title: 'Skills' },
        { id: 'projects', title: 'Projects' },
        { id: 'education', title: 'Education' },
        { id: 'contact', title: 'Contact' }
    ],
    experience: [
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
    ],
    skillGroups: [
        { name: 'Languages', skills: ['TypeScript', 'JavaScript', 'HTML', 'CSS'] },
        { name: 'Frameworks', skills: ['React', 'Vite', 'Tailwind CSS'] },
        { name: '3D and motion', skills: ['Three.js', 'React Three Fiber', 'GSAP'] },
        { name: 'Practices', skills: ['Accessibility', 'Performance', 'Design systems'] }
    ],
    projects: [
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
    ],
    education: [
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
    ],
    contactLinks: [
        { label: 'Email', href: 'mailto:hello@example.com', text: 'hello@example.com' },
        { label: 'GitHub', href: 'https://github.com/knive', text: 'github.com/knive' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/', text: 'LinkedIn profile' }
    ],
    ui: {
        skipIntro: 'Skip intro'
    }
};
