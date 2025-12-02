import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaCode, FaRocket, FaLightbulb } from 'react-icons/fa';

const About = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const features = [
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
            About Me
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-8" />
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            I'm a passionate software engineer with expertise in full-stack development,
            specializing in modern web technologies. I love building scalable applications
            that solve real-world problems.
          </p>
        </motion.div>

        {/* Professional Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Professional Summary
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              As a software engineer, I bring a strong foundation in computer science
              and hands-on experience in developing robust, scalable applications. My
              expertise spans across frontend and backend technologies, with a focus on
              creating seamless user experiences and efficient server-side solutions.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              I'm committed to continuous learning and staying current with industry
              trends. I enjoy collaborating with cross-functional teams to deliver
              high-quality software solutions that meet business objectives and exceed
              user expectations.
            </p>
          </div>
        </motion.div>

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

        {/* Experience & Education Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid md:grid-cols-2 gap-8"
        >
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Experience
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {/* This can be populated from LinkedIn API or manually */}
              Experienced in building full-stack applications using modern frameworks
              and technologies. Proficient in both frontend and backend development
              with a focus on clean architecture and best practices.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Education
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {/* This can be populated from LinkedIn API or manually */}
              Strong educational background in computer science with continuous
              learning through online courses, certifications, and hands-on projects.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;

