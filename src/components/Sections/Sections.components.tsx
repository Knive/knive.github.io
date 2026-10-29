import { type SectionId, type TimelineEntry } from '@/components/Sections/Sections.constants';
import { useI18n } from '@/i18n/i18n.context';

import {
    contactLinkVariants,
    entryListVariants,
    entryMetaVariants,
    entryTitleVariants
} from '@/components/Sections/Sections.styles';

// Every direct block carries data-reveal: the scroll animation slides them in one by one

type TimelineProps = {
    entries: TimelineEntry[];
};

const Timeline = ({ entries }: TimelineProps) => (
    <ol className={entryListVariants()}>
        {entries.map((entry) => (
            <li key={`${entry.title}-${entry.period}`} data-reveal>
                <h3 className={entryTitleVariants()}>{entry.title}</h3>
                <p className={entryMetaVariants()}>
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
        <dl className={entryListVariants()}>
            {t.skillGroups.map((group) => (
                <div key={group.name} data-reveal>
                    <dt className={entryTitleVariants()}>{group.name}</dt>
                    <dd>{group.skills.join(', ')}</dd>
                </div>
            ))}
        </dl>
    );
};

const ProjectsBody = () => {
    const { t } = useI18n();
    return (
        <ul className={entryListVariants()}>
            {t.projects.map((project, index) => (
                <li key={`${project.name}-${index}`} data-reveal>
                    <h3 className={entryTitleVariants()}>{project.name}</h3>
                    <p>{project.description}</p>
                    <p className={entryMetaVariants()}>{project.tags.join(', ')}</p>
                </li>
            ))}
        </ul>
    );
};

const ContactBody = () => {
    const { t } = useI18n();
    return (
        <ul className={entryListVariants()}>
            {t.contactLinks.map((link) => (
                <li key={link.label} data-reveal>
                    <span className={entryMetaVariants()}>{link.label}</span>{' '}
                    <a className={contactLinkVariants()} href={link.href}>
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
