import { Header } from '@/components/Header/Header';
import { Hero } from '@/components/Hero/Hero';
import { Sections } from '@/components/Sections/Sections';
import { I18nProvider } from '@/i18n/i18n.context';

const App = () => (
    <I18nProvider>
        <Header />
        <Hero />
        <Sections />
    </I18nProvider>
);

export default App;
