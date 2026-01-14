import { useHomepageConfig } from '../hooks/useHomepageConfig';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Projects from '../components/sections/Projects';
import Skills from '../components/sections/Skills';
import Contact from '../components/sections/Contact';
import { HeroConfig, AboutConfig, ProjectsConfig, SkillsConfig, ContactConfig } from '../types/homepageConfig';

const Home = () => {
  const { config, loading, error } = useHomepageConfig();

  // Fallback to default order if config is not available
  const sectionOrder = config?.order || ['hero', 'about', 'projects', 'skills', 'contact'];
  const sections = config?.sections;

  // Section component map
  const sectionComponents: Record<string, React.ComponentType<any>> = {
    hero: Hero,
    about: About,
    projects: Projects,
    skills: Skills,
    contact: Contact,
  };

  // Section config map
  const sectionConfigs: Record<string, HeroConfig | AboutConfig | ProjectsConfig | SkillsConfig | ContactConfig | undefined> = {
    hero: sections?.hero,
    about: sections?.about,
    projects: sections?.projects,
    skills: sections?.skills,
    contact: sections?.contact,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading homepage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Fallback: render default sections if config fails to load
    console.warn('Failed to load homepage config, using defaults:', error);
    return (
      <>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </>
    );
  }

  return (
    <>
      {sectionOrder.map((sectionId) => {
        const SectionComponent = sectionComponents[sectionId];
        const sectionConfig = sectionConfigs[sectionId];

        // Skip disabled sections
        if (sectionConfig && !sectionConfig.enabled) {
          return null;
        }

        // Render section with config if available
        if (SectionComponent) {
          return <SectionComponent key={sectionId} config={sectionConfig} />;
        }

        return null;
      })}
    </>
  );
};

export default Home;

