import { PROFILE_NAME } from '@/components/Sections/Sections.constants';
import { useI18n } from '@/i18n/i18n.context';

import styles from '@/components/Header/Header.module.css';

/** Sticky page header; its nav is the keyboard equivalent of clicking the daggers */
export const Header = () => {
    const { t, lang, setLanguage } = useI18n();
    return (
        <header className={styles.header} data-review-hidden>
            <a className={styles.name} href="#hero">
                {PROFILE_NAME}
            </a>
            <nav aria-label="Sections">
                <ul className={styles['nav-list']}>
                    {t.sections.map(({ id, title }) => (
                        <li key={id}>
                            <a className={styles['nav-link']} href={`#${id}`}>
                                {title}
                            </a>
                        </li>
                    ))}
                    <li>
                        <button
                            className={styles['nav-link']}
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
