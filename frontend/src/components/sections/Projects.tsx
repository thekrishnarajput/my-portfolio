import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaExternalLinkAlt, FaStar } from 'react-icons/fa';
import { projectsAPI } from '../../services/api';
import ProjectModal from '../ProjectModal';

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
}

interface ProjectsProps {
  config?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
    description?: string;
  };
}

const Projects = ({ config }: ProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sort projects: featured first, then by order
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      // Featured projects first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // Then sort by order
      return a.order - b.order;
    });
  }, [projects]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Small delay to allow exit animation
    setTimeout(() => {
      setSelectedProject(null);
    }, 300);
  };

  if (loading) {
    return (
      <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="projects"
      ref={ref}
      className="py-20 bg-gray-50 dark:bg-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {config?.title || 'Projects'}
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-8" />
          {config?.subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
              {config.subtitle}
            </p>
          )}
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {config?.description || 'A collection of projects showcasing my skills and experience in software development.'}
          </p>
        </motion.div>

        {sortedProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No projects available. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {sortedProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                onClick={() => handleProjectClick(project)}
                className={`bg-white dark:bg-gray-900 rounded-lg overflow-hidden transition-all cursor-pointer transform hover:scale-105 active:scale-95 ${
                  project.featured
                    ? 'shadow-xl border-2 border-yellow-400 dark:border-yellow-500 ring-2 ring-yellow-200 dark:ring-yellow-900/50'
                    : 'shadow-md hover:shadow-xl'
                }`}
              >
                {project.imageUrl && (
                  <div className={`relative ${project.featured ? 'h-40' : 'h-32'} bg-gray-200 dark:bg-gray-700 overflow-hidden`}>
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    {project.featured && (
                      <div className="absolute top-2 right-2 bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-900 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-lg">
                        <FaStar className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    )}
                  </div>
                )}
                {!project.imageUrl && project.featured && (
                  <div className="relative h-32 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 flex items-center justify-center">
                    <div className="absolute top-2 right-2 bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-900 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-lg">
                      <FaStar className="w-3 h-3" />
                      <span>Featured</span>
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`font-bold text-gray-900 dark:text-white line-clamp-2 flex-1 ${
                      project.featured ? 'text-lg' : 'text-lg'
                    }`}>
                      {project.title}
                    </h3>
                    {!project.imageUrl && project.featured && (
                      <div className="flex-shrink-0">
                        <FaStar className="w-4 h-4 text-yellow-400 dark:text-yellow-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-medium">
                    <span>View Details</span>
                    <FaExternalLinkAlt className="w-3 h-3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default Projects;

