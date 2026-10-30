import type { Translations } from '../i18n.types';

export const fr: Translations = {
    profile: {
        jobTitle: 'Senior Fullstack Engineer'
    },
    sections: [
        { id: 'experience', title: 'Expérience' },
        { id: 'skills', title: 'Compétences' },
        { id: 'projects', title: 'Projets' },
        { id: 'education', title: 'Formation' },
        { id: 'contact', title: 'Contact' }
    ],
    experience: [
        {
            title: 'Développeur frontend freelance',
            place: 'Indépendant',
            period: '2023 – présent',
            summary: 'Interfaces et sites interactifs pour studios et équipes produit.'
        },
        {
            title: 'Développeur frontend senior',
            place: 'Nom de l’entreprise',
            period: '2020 – 2023',
            summary: 'Direction du design system et migration de l’application web vers React.'
        },
        {
            title: 'Développeur frontend',
            place: 'Nom de l’entreprise',
            period: '2017 – 2020',
            summary: 'Développement de fonctionnalités client et de la bibliothèque de composants.'
        }
    ],
    skillGroups: [
        { name: 'Langages', skills: ['TypeScript', 'JavaScript', 'HTML', 'CSS'] },
        { name: 'Frameworks', skills: ['React', 'Vite', 'Tailwind CSS'] },
        { name: '3D et mouvement', skills: ['Three.js', 'React Three Fiber', 'GSAP'] },
        { name: 'Pratiques', skills: ['Accessibilité', 'Performance', 'Design systems'] }
    ],
    projects: [
        {
            name: 'Nom du projet',
            description: 'Une courte description de ce que c’est et de ce que vous avez construit.',
            tags: ['React', 'WebGL']
        },
        {
            name: 'Nom du projet',
            description: 'Une courte description de ce que c’est et de ce que vous avez construit.',
            tags: ['TypeScript', 'Design system']
        },
        {
            name: 'Nom du projet',
            description: 'Une courte description de ce que c’est et de ce que vous avez construit.',
            tags: ['Vite', 'Animation']
        }
    ],
    education: [
        {
            title: 'Nom du diplôme',
            place: 'Nom de l’école',
            period: '2014 – 2017',
            summary: 'Domaine d’études et un détail notable.'
        },
        {
            title: 'Nom de la certification',
            place: 'Émetteur',
            period: '2019',
            summary: 'Sujets couverts.'
        }
    ],
    contactLinks: [
        { label: 'Email', href: 'mailto:hello@example.com', text: 'hello@example.com' },
        { label: 'GitHub', href: 'https://github.com/knive', text: 'github.com/knive' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/', text: 'Profil LinkedIn' }
    ],
    ui: {
        skipIntro: 'Passer l’intro',
        menu: 'Menu',
        sectionsNav: 'Sections'
    }
};
