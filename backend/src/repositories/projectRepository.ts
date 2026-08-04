import Project, { IProject } from '../models/project';

export class ProjectRepository {
  async findAll(): Promise<IProject[]> {
    return Project.find().sort({ order: 1, createdAt: -1 }).lean().exec() as unknown as IProject[];
  }

  async findById(id: string): Promise<IProject | null> {
    return Project.findById(id).lean().exec() as unknown as IProject | null;
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

  async countByImageUrl(imageUrl: string, excludeId?: string): Promise<number> {
    return Project.countDocuments({
      imageUrl,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).exec();
  }
}
