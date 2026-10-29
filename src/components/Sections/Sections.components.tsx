import { type SectionId, type TimelineEntry } from '@/components/Sections/Sections.constants';
import { useI18n } from '@/i18n/i18n.context';

import {
    entryListClassName,
    entryMetaClassName,
    entryTitleClassName
} from '@/components/Sections/Sections.styles';
import styles from '@/components/Sections/Sections.module.css';

// Every direct block carries data-reveal: the scroll animation slides them in one by one

type TimelineProps = {
    entries: TimelineEntry[];
};

const Timeline = ({ entries }: TimelineProps) => (
    <ol className={entryListClassName}>
        {entries.map((entry) => (
            <li key={`${entry.title}-${entry.period}`} data-reveal>
                <h3 className={entryTitleClassName}>{entry.title}</h3>
                <p className={entryMetaClassName}>
                    {entry.place}, {entry.period}
                </p>
                <p>{entry.summary}</p>
            </li>
        ))}
    </ol>
);

const ExperienceBody = () => {
    const { t } = useI18n();
    return <Timeline entries={t.experience} />;
};

const EducationBody = () => {
    const { t } = useI18n();
    return <Timeline entries={t.education} />;
};

const SkillsBody = () => {
    const { t } = useI18n();
    return (
        <dl className={entryListClassName}>
            {t.skillGroups.map((group) => (
                <div key={group.name} data-reveal>
                    <dt className={entryTitleClassName}>{group.name}</dt>
                    <dd>{group.skills.join(', ')}</dd>
                </div>
            ))}
        </dl>
    );
};

const ProjectsBody = () => {
    const { t } = useI18n();
    return (
        <ul className={styles.list}>
            {t.projects.map((project, index) => (
                <li key={`${project.name}-${index}`} className={styles.entry} data-reveal>
                    <h3 className={styles['entry-title']}>{project.name}</h3>
                    <p>{project.description}</p>
                    <p className={styles['entry-meta']}>{project.tags.join(', ')}</p>
                </li>
            ))}
        </ul>
    );
};

const ContactBody = () => {
    const { t } = useI18n();
    return (
        <ul className={styles.list}>
            {t.contactLinks.map((link) => (
                <li key={link.label} className={styles.entry} data-reveal>
                    <span className={styles['entry-meta']}>{link.label}</span>{' '}
                    <a className={styles.link} href={link.href}>
                        {link.text}
                    </a>
                </li>
            ))}
        </ul>
    );
};

export const SECTION_BODIES: Record<SectionId, () => React.JSX.Element> = {
    experience: ExperienceBody,
    skills: SkillsBody,
    projects: ProjectsBody,
    education: EducationBody,
    contact: ContactBody
};
