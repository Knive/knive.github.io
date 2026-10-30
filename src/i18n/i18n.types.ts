import type {
    SectionId,
    TimelineEntry,
    SkillGroup,
    Project,
    ContactLink
} from '@/components/Sections/Sections.constants';

export interface Translations {
    profile: {
        jobTitle: string;
    };
    sections: {
        id: SectionId;
        title: string;
    }[];
    experience: TimelineEntry[];
    skillGroups: SkillGroup[];
    projects: Project[];
    education: TimelineEntry[];
    contactLinks: ContactLink[];
    ui: {
        skipIntro: string;
        menu: string;
        sectionsNav: string;
    };
}

export type Language = 'en' | 'fr';
