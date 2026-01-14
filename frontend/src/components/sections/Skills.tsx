import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { skillsAPI } from '../../services/api';

interface Skill {
  _id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'tools' | 'other';
  proficiency: number;
  icon?: string;
}

interface SkillsProps {
  config?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
    description?: string;
  };
}

const Skills = ({ config }: SkillsProps) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await skillsAPI.getAll();
      setSkills(response.data.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    database: 'Database',
    devops: 'DevOps',
    tools: 'Tools',
    other: 'Other',
  };

  if (loading) {
    return (
      <section id="skills" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading skills...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="skills"
      ref={ref}
      className="py-20 bg-white dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {config?.title || 'Skills'}
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-8" />
          {config?.subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
              {config.subtitle}
            </p>
          )}
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {config?.description || 'Technologies and tools I work with to build amazing applications.'}
          </p>
        </motion.div>

        {skills.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No skills available. Check back soon!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Skills can be added through the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {skills.map((skill, index) => (
              <motion.div
                key={skill._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 hover:-translate-y-1"
              >
                {/* Skill Icon/Name */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 md:w-14 md:h-14 mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
                    {skill.icon ? (
                      <img
                        src={skill.icon}
                        alt={skill.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Hide image and show fallback on error
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = parent.querySelector('.icon-fallback') as HTMLElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }
                        }}
                      />
                    ) : null}
                    <div className="icon-fallback w-full h-full rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center" style={{ display: skill.icon ? 'none' : 'flex' }}>
                      <span className="text-white font-bold text-lg md:text-xl">
                        {skill.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                    {skill.name}
                  </h3>
                  
                  {/* Proficiency Badge */}
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-16 md:w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${skill.proficiency}%` } : {}}
                        transition={{ duration: 1, delay: index * 0.05 + 0.3 }}
                      />
                    </div>
                    <span className="text-xs md:text-sm font-medium text-primary-600 dark:text-primary-400 min-w-[2.5rem]">
                      {skill.proficiency}%
                    </span>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                    {categoryLabels[skill.category]}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;

