import { useEffect, useState } from 'react';

import { PROFILE_NAME } from '@/components/Sections/Sections.constants';
import { useI18n } from '@/i18n/i18n.context';

import {
    headerNameVariants,
    headerVariants,
    menuButtonVariants,
    navLinkVariants,
    navListVariants
} from '@/components/Header/Header.styles';

const NAV_LIST_ID = 'header-nav-list';

/** Sticky page header; its nav is the keyboard equivalent of clicking the daggers */
export const Header = () => {
    const { t, lang, setLanguage } = useI18n();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeMenu = () => setIsMenuOpen(false);

    useEffect(() => {
        if (!isMenuOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsMenuOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMenuOpen]);

    return (
        <header className={headerVariants()} data-review-hidden>
            <a className={headerNameVariants()} href="#hero">
                {PROFILE_NAME}
            </a>
            <nav aria-label={t.ui.sectionsNav}>
                <button
                    type="button"
                    className={menuButtonVariants()}
                    aria-expanded={isMenuOpen}
                    aria-controls={NAV_LIST_ID}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {t.ui.menu}
                </button>
                <ul id={NAV_LIST_ID} className={navListVariants({ isOpen: isMenuOpen })}>
                    {t.sections.map(({ id, title }) => (
                        <li key={id}>
                            <a className={navLinkVariants()} href={`#${id}`} onClick={closeMenu}>
                                {title}
                            </a>
                        </li>
                    ))}
                    <li>
                        <button
                            type="button"
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
