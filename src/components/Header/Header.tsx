import { PROFILE_NAME } from '@/components/Sections/Sections.constants';
import { useI18n } from '@/i18n/i18n.context';

import { navLinkClassName } from '@/components/Header/Header.styles';

/** Sticky page header; its nav is the keyboard equivalent of clicking the daggers */
export const Header = () => {
    const { t, lang, setLanguage } = useI18n();
    return (
        // Solid enough to read over scrolling text, then only the bottom padding fades into the scene
        <header
            className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 px-10 pt-5 pb-8 bg-[linear-gradient(to_bottom,var(--color-void)_calc(100%-2rem),rgb(7_9_13/0))] max-md:px-6"
            data-review-hidden
        >
            <a
                className="font-display text-[1.05rem] tracking-[0.3em] text-steel no-underline hover:text-ember focus-visible:text-ember"
                href="#hero"
            >
                {PROFILE_NAME}
            </a>
            <nav aria-label="Sections">
                <ul className="flex list-none flex-wrap gap-x-6 gap-y-2 max-md:gap-x-4 max-md:gap-y-1">
                    {t.sections.map(({ id, title }) => (
                        <li key={id}>
                            <a className={navLinkClassName} href={`#${id}`}>
                                {title}
                            </a>
                        </li>
                    ))}
                    <li>
                        <button
                            className={navLinkClassName}
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
