import { PROFILE, SECTIONS } from '@/components/Sections/Sections.constants';

import styles from '@/components/Header/Header.module.css';

/** Sticky page header; its nav is the keyboard equivalent of clicking the daggers */
export const Header = () => (
    <header className={styles.header} data-review-hidden>
        <a className={styles.name} href="#hero">
            {PROFILE.name}
        </a>
        <nav aria-label="Sections">
            <ul className={styles['nav-list']}>
                {SECTIONS.map(({ id, title }) => (
                    <li key={id}>
                        <a className={styles['nav-link']} href={`#${id}`}>
                            {title}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    </header>
);
