import { ProjectRepository } from '../repositories/projectRepository';
import { IProject } from '../models/Project';

export class ProjectService {
    private projectRepository: ProjectRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
    }

    async getAllProjects(): Promise<IProject[]> {
        return this.projectRepository.findAll();
    }

    async getProjectById(id: string): Promise<IProject | null> {
        return this.projectRepository.findById(id);
    }

    async createProject(data: Partial<IProject>): Promise<IProject> {
        return this.projectRepository.create(data);
    }

    async updateProject(id: string, data: Partial<IProject>): Promise<IProject | null> {
        return this.projectRepository.update(id, data);
    }

    async deleteProject(id: string): Promise<IProject | null> {
        return this.projectRepository.delete(id);
    }
}

