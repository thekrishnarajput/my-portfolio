import { HomepageConfigRepository } from '../repositories/homepageConfigRepository';
import { IHomepageConfig, HomepageSections } from '../models/homepageConfig';
import { AppError } from '../errors/appError';
import { HTTP_STATUS } from '../constants';

export class HomepageConfigService {
    private homepageConfigRepository: HomepageConfigRepository;

    constructor() {
        this.homepageConfigRepository = new HomepageConfigRepository();
    }

    async getActiveConfig(): Promise<IHomepageConfig> {
        let config = await this.homepageConfigRepository.findActive();

        // If no active config exists, create default one
        if (!config) {
            config = await this.createDefaultConfig();
        }

        return config;
    }

    async getAllConfigs(): Promise<IHomepageConfig[]> {
        return this.homepageConfigRepository.findAll();
    }

    async getConfigById(id: string): Promise<IHomepageConfig> {
        const config = await this.homepageConfigRepository.findById(id);
        if (!config) {
            throw new AppError('Homepage configuration not found', HTTP_STATUS.NOT_FOUND);
        }
        return config;
    }

    async createConfig(data: Partial<IHomepageConfig>): Promise<IHomepageConfig> {
        // Validate sections
        this.validateSections(data.sections);

        return this.homepageConfigRepository.create(data);
    }

    async updateConfig(id: string, data: Partial<IHomepageConfig>): Promise<IHomepageConfig> {
        const existingConfig = await this.homepageConfigRepository.findById(id);
        if (!existingConfig) {
            throw new AppError('Homepage configuration not found', HTTP_STATUS.NOT_FOUND);
        }

        // Validate sections if provided
        if (data.sections) {
            this.validateSections(data.sections);
        }

        // Validate order if provided
        if (data.order) {
            this.validateOrder(data.order);
        }

        const updatedConfig = await this.homepageConfigRepository.update(id, data);
        if (!updatedConfig) {
            throw new AppError('Homepage configuration not found', HTTP_STATUS.NOT_FOUND);
        }
        return updatedConfig;
    }

    async deleteConfig(id: string): Promise<void> {
        const config = await this.homepageConfigRepository.findById(id);
        if (!config) {
            throw new AppError('Homepage configuration not found', HTTP_STATUS.NOT_FOUND);
        }

        // Prevent deleting active config
        if (config.isActive) {
            throw new AppError(
                'Cannot delete active configuration. Please activate another configuration first.',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        await this.homepageConfigRepository.delete(id);
    }

    async setActiveConfig(id: string): Promise<IHomepageConfig> {
        const config = await this.homepageConfigRepository.findById(id);
        if (!config) {
            throw new AppError('Homepage configuration not found', HTTP_STATUS.NOT_FOUND);
        }

        const updatedConfig = await this.homepageConfigRepository.setActive(id);
        if (!updatedConfig) {
            throw new AppError('Failed to set active configuration', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        return updatedConfig;
    }

    private validateSections(sections?: Partial<HomepageSections>): void {
        if (!sections) return;

        const validSectionIds = ['hero', 'about', 'projects', 'skills', 'contact'];
        const providedSectionIds = Object.keys(sections);

        // Check for invalid section IDs
        const invalidSections = providedSectionIds.filter((id) => !validSectionIds.includes(id));
        if (invalidSections.length > 0) {
            throw new AppError(
                `Invalid section IDs: ${invalidSections.join(', ')}`,
                HTTP_STATUS.BAD_REQUEST
            );
        }
    }

    private validateOrder(order: string[]): void {
        const validSectionIds = ['hero', 'about', 'projects', 'skills', 'contact'];
        const uniqueOrder = [...new Set(order)];

        // Check for invalid section IDs in order
        const invalidSections = uniqueOrder.filter((id) => !validSectionIds.includes(id));
        if (invalidSections.length > 0) {
            throw new AppError(
                `Invalid section IDs in order: ${invalidSections.join(', ')}`,
                HTTP_STATUS.BAD_REQUEST
            );
        }
    }

    private async createDefaultConfig(): Promise<IHomepageConfig> {
        const defaultConfig: Partial<IHomepageConfig> = {
            version: '1.0.0',
            sections: {
                hero: {
                    enabled: true,
                    badge: '<SoftwareEngineer />',
                    title: 'Mukesh Karn',
                    subtitle: '(Krishna)',
                    description:
                        'Full-stack developer specializing in modern web technologies, building scalable applications with clean code and best practices.',
                    primaryButton: {
                        text: 'View Projects',
                        href: '#projects',
                        target: '_self',
                    },
                    secondaryButton: {
                        text: 'Get In Touch',
                        href: '#contact',
                        target: '_self',
                    },
                    socialLinks: {
                        github: 'https://github.com/thekrishnarajput',
                        linkedin: 'https://www.linkedin.com/in/thekrishnarajput',
                    },
                    showScrollIndicator: true,
                },
                about: {
                    enabled: true,
                    title: 'About Me',
                    description:
                        "I'm a passionate software engineer with expertise in full-stack development, specializing in modern web technologies. I love building scalable applications that solve real-world problems.",
                    professionalSummary: {
                        title: 'Professional Summary',
                        content:
                            'As a software engineer, I bring a strong foundation in computer science and hands-on experience in developing robust, scalable applications. My expertise spans across frontend and backend technologies, with a focus on creating seamless user experiences and efficient server-side solutions.',
                    },
                    features: [
                        {
                            title: 'Clean Code',
                            description:
                                'Writing maintainable, scalable, and well-documented code following best practices.',
                        },
                        {
                            title: 'Performance',
                            description:
                                'Optimizing applications for speed, efficiency, and excellent user experience.',
                        },
                        {
                            title: 'Innovation',
                            description:
                                'Staying updated with latest technologies and implementing creative solutions.',
                        },
                    ],
                },
                projects: {
                    enabled: true,
                    title: 'Projects',
                    description:
                        'A collection of projects showcasing my skills and experience in software development.',
                },
                skills: {
                    enabled: true,
                    title: 'Skills',
                    description: 'Technologies and tools I work with to build amazing applications.',
                },
                contact: {
                    enabled: true,
                    title: 'Get In Touch',
                    description: 'Feel free to reach out for collaborations or just a friendly hello!',
                    showLinkedInFollowers: true,
                },
            },
            order: ['hero', 'about', 'projects', 'skills', 'contact'],
            isActive: true,
        };

        return this.homepageConfigRepository.create(defaultConfig);
    }
}
