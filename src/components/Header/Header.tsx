import { PROFILE_NAME } from '@/components/Sections/Sections.constants';
import { useI18n } from '@/i18n/i18n.context';

import {
    headerNameVariants,
    headerVariants,
    navLinkVariants,
    navListVariants
} from '@/components/Header/Header.styles';

/** Sticky page header; its nav is the keyboard equivalent of clicking the daggers */
export const Header = () => {
    const { t, lang, setLanguage } = useI18n();
    return (
        <header className={headerVariants()} data-review-hidden>
            <a className={headerNameVariants()} href="#hero">
                {PROFILE_NAME}
            </a>
            <nav aria-label="Sections">
                <ul className={navListVariants()}>
                    {t.sections.map(({ id, title }) => (
                        <li key={id}>
                            <a className={navLinkVariants()} href={`#${id}`}>
                                {title}
                            </a>
                        </li>
                    ))}
                    <li>
                        <button
                            className={navLinkVariants()}
                            onClick={() => setLanguage(lang === 'en' ? 'fr' : 'en')}
                        >
                            {lang === 'en' ? 'FR' : 'EN'}
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
};
