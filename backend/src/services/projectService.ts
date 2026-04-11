import { ProjectRepository } from '../repositories/projectRepository';
import { IProject } from '../models/project';
import NodeCache from 'node-cache';

const projectCache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
const PROJECTS_KEY = 'allProjects';

export class ProjectService {
    private projectRepository: ProjectRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
    }

    async getAllProjects(): Promise<IProject[]> {
        let projects = projectCache.get<IProject[]>(PROJECTS_KEY);
        if (!projects) {
            projects = await this.projectRepository.findAll() as unknown as IProject[];
            projectCache.set(PROJECTS_KEY, projects);
        }
        return projects;
    }

    async getProjectById(id: string): Promise<IProject | null> {
        return this.projectRepository.findById(id);
    }

    async createProject(data: Partial<IProject>): Promise<IProject> {
        const project = await this.projectRepository.create(data);
        projectCache.del(PROJECTS_KEY);
        return project;
    }

    async updateProject(id: string, data: Partial<IProject>): Promise<IProject | null> {
        const project = await this.projectRepository.update(id, data);
        projectCache.del(PROJECTS_KEY);
        return project;
    }

    async deleteProject(id: string): Promise<IProject | null> {
        const project = await this.projectRepository.delete(id);
        projectCache.del(PROJECTS_KEY);
        return project;
    }
}

