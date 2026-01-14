import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaCode, FaRocket, FaLightbulb } from 'react-icons/fa';

interface AboutProps {
  config?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
    description?: string;
    professionalSummary?: {
      title: string;
      content: string;
    };
    features?: Array<{
      icon?: string;
      title: string;
      description: string;
    }>;
    experience?: {
      title: string;
      content: string;
    };
    education?: {
      title: string;
      content: string;
    };
  };
}

const About = ({ config }: AboutProps) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Fallback to default values
  const title = config?.title || 'About Me';
  const description = config?.description || "I'm a passionate software engineer with expertise in full-stack development, specializing in modern web technologies. I love building scalable applications that solve real-world problems.";
  
  // Default features with icons
  const defaultFeatures = [
    {
      icon: <FaCode className="w-8 h-8" />,
      title: 'Clean Code',
      description: 'Writing maintainable, scalable, and well-documented code following best practices.',
    },
    {
      icon: <FaRocket className="w-8 h-8" />,
      title: 'Performance',
      description: 'Optimizing applications for speed, efficiency, and excellent user experience.',
    },
    {
      icon: <FaLightbulb className="w-8 h-8" />,
      title: 'Innovation',
      description: 'Staying updated with latest technologies and implementing creative solutions.',
    },
  ];

  // Use config features if available, otherwise use defaults
  const features = config?.features?.map((feature, index) => ({
    icon: defaultFeatures[index]?.icon || <FaCode className="w-8 h-8" />,
    title: feature.title,
    description: feature.description,
  })) || defaultFeatures;

  return (
    <section
      id="about"
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
            {title}
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-8" />
          {config?.subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
              {config.subtitle}
            </p>
          )}
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {description}
          </p>
        </motion.div>

        {/* Professional Summary */}
        {config?.professionalSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {config.professionalSummary.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {config.professionalSummary.content}
              </p>
            </div>
          </motion.div>
        )}

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-primary-600 dark:text-primary-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Experience & Education */}
        {(config?.experience || config?.education) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 grid md:grid-cols-2 gap-8"
          >
            {config.experience && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {config.experience.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {config.experience.content}
                </p>
              </div>
            )}
            {config.education && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {config.education.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {config.education.content}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default About;

