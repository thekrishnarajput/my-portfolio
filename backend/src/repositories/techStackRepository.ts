import TechStack, { ITechStack } from '../models/techStack';

export class TechStackRepository {
  /**
   * Find all tech stacks, optionally filtered by search query
   */
  async findAll(searchQuery?: string): Promise<ITechStack[]> {
    const query = searchQuery
      ? { name: { $regex: searchQuery, $options: 'i' } } // Case-insensitive regex search
      : {};
    return TechStack.find(query)
      .sort({ name: 1 })
      .limit(20) // Limit results for performance
      .exec();
  }

  /**
   * Find tech stack by ID
   */
  async findById(id: string): Promise<ITechStack | null> {
    return TechStack.findById(id).exec();
  }

  /**
   * Find tech stack by name (case-insensitive)
   */
  async findByName(name: string): Promise<ITechStack | null> {
    return TechStack.findOne({ name: name.toLowerCase() }).exec();
  }

  /**
   * Create a new tech stack (handles duplicate check via unique index)
   */
  async create(data: { name: string }): Promise<ITechStack> {
    const techStack = new TechStack({
      name: data.name.toLowerCase().trim(),
    });
    return techStack.save();
  }

  /**
   * Delete tech stack by ID
   */
  async delete(id: string): Promise<ITechStack | null> {
    return TechStack.findByIdAndDelete(id).exec();
  }

  /**
   * Get count of tech stacks
   */
  async count(): Promise<number> {
    return TechStack.countDocuments().exec();
  }
}
