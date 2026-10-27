const SECTIONS = [
    {
        id: 'experience',
        title: 'Experience',
        body: null
    },
    {
        id: 'skills',
        title: 'Skills',
        body: null
    },
    {
        id: 'projects',
        title: 'Projects',
        body: null
    },
    {
        id: 'about',
        title: 'About',
        body: null
    },
    {
        id: 'contact',
        title: 'Contact',
        body: null
    }
];

export const Sections = () => (
    <main>
        {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="section">
                <div className="section-inner">
                    <h2 className="section-title">{section.title}</h2>
                    <div className="section-body">
                        {section.body ?? (
                            <p className="section-placeholder">Content coming soon.</p>
                        )}
                    </div>
                </div>
            </section>
        ))}
    </main>
);
