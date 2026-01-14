import { TechStackRepository } from '../repositories/techStackRepository';
import { ITechStack } from '../models/techStack';
import { AppError } from '../errors/appError';
import { HTTP_STATUS } from '../constants';

export class TechStackService {
  private techStackRepository: TechStackRepository;

  constructor() {
    this.techStackRepository = new TechStackRepository();
  }

  /**
   * Search tech stacks by query (for autocomplete)
   */
  async searchTechStacks(query?: string): Promise<ITechStack[]> {
    return this.techStackRepository.findAll(query);
  }

  /**
   * Create a new tech stack
   * @throws AppError if duplicate exists
   */
  async createTechStack(name: string): Promise<ITechStack> {
    // Check if already exists (case-insensitive)
    const existing = await this.techStackRepository.findByName(name);
    if (existing) {
      throw new AppError(
        `Tech stack "${name}" already exists`,
        HTTP_STATUS.CONFLICT
      );
    }

    return this.techStackRepository.create({ name });
  }

  /**
   * Delete a tech stack by ID
   */
  async deleteTechStack(id: string): Promise<ITechStack | null> {
    const techStack = await this.techStackRepository.findById(id);
    if (!techStack) {
      throw new AppError('Tech stack not found', HTTP_STATUS.NOT_FOUND);
    }

    return this.techStackRepository.delete(id);
  }

  /**
   * Get all tech stacks
   */
  async getAllTechStacks(): Promise<ITechStack[]> {
    return this.techStackRepository.findAll();
  }
}
