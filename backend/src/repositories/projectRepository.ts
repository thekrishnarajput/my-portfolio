import Project, { IProject } from "src/models/project";

export class ProjectRepository {
    async findAll(): Promise<IProject[]> {
        return Project.find().sort({ order: 1, createdAt: -1 }).exec();
    }

    async findById(id: string): Promise<IProject | null> {
        return Project.findById(id).exec();
    }

    async create(data: Partial<IProject>): Promise<IProject> {
        const project = new Project(data);
        return project.save();
    }

    async update(id: string, data: Partial<IProject>): Promise<IProject | null> {
        return Project.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    }

    async delete(id: string): Promise<IProject | null> {
        return Project.findByIdAndDelete(id).exec();
    }
}

