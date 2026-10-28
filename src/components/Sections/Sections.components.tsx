import {
    CONTACT_LINKS,
    EDUCATION,
    EXPERIENCE,
    PROJECTS,
    SKILL_GROUPS,
    type SectionId,
    type TimelineEntry
} from '@/components/Sections/Sections.constants';

import styles from '@/components/Sections/Sections.module.css';

// Every direct block carries data-reveal: the scroll animation slides them in one by one

type TimelineProps = {
    entries: TimelineEntry[];
};

const Timeline = ({ entries }: TimelineProps) => (
    <ol className={styles.list}>
        {entries.map((entry) => (
            <li key={`${entry.title}-${entry.period}`} className={styles.entry} data-reveal>
                <h3 className={styles['entry-title']}>{entry.title}</h3>
                <p className={styles['entry-meta']}>
                    {entry.place}, {entry.period}
                </p>
                <p>{entry.summary}</p>
            </li>
        ))}
    </ol>
);

const ExperienceBody = () => <Timeline entries={EXPERIENCE} />;

const EducationBody = () => <Timeline entries={EDUCATION} />;

const SkillsBody = () => (
    <dl className={styles.list}>
        {SKILL_GROUPS.map((group) => (
            <div key={group.name} className={styles.entry} data-reveal>
                <dt className={styles['entry-title']}>{group.name}</dt>
                <dd>{group.skills.join(', ')}</dd>
            </div>
        ))}
    </dl>
);

const ProjectsBody = () => (
    <ul className={styles.list}>
        {PROJECTS.map((project, index) => (
            <li key={`${project.name}-${index}`} className={styles.entry} data-reveal>
                <h3 className={styles['entry-title']}>{project.name}</h3>
                <p>{project.description}</p>
                <p className={styles['entry-meta']}>{project.tags.join(', ')}</p>
            </li>
        ))}
    </ul>
);

const ContactBody = () => (
    <ul className={styles.list}>
        {CONTACT_LINKS.map((link) => (
            <li key={link.label} className={styles.entry} data-reveal>
                <span className={styles['entry-meta']}>{link.label}</span>{' '}
                <a className={styles.link} href={link.href}>
                    {link.text}
                </a>
            </li>
        ))}
    </ul>
);

export const SECTION_BODIES: Record<SectionId, () => React.JSX.Element> = {
    experience: ExperienceBody,
    skills: SkillsBody,
    projects: ProjectsBody,
    education: EducationBody,
    contact: ContactBody
};
