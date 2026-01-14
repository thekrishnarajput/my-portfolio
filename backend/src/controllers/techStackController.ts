import { Request, Response } from 'express';
import { TechStackService } from '../services/techStackService';
import { ResponseHelper } from '../utils/response';
import { HTTP_STATUS } from '../constants';
import { asyncHandler } from '../errors/errorHandler';

export class TechStackController {
  private techStackService: TechStackService;

  constructor() {
    this.techStackService = new TechStackService();
  }

  /**
   * Search tech stacks (for autocomplete)
   * GET /api/tech-stacks?query=react
   */
  searchTechStacks = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { query } = req.query;
      const searchQuery = typeof query === 'string' ? query.trim() : undefined;

      const techStacks = await this.techStackService.searchTechStacks(searchQuery);

      ResponseHelper.success(res, techStacks, 'Tech stacks retrieved successfully');
    }
  );

  /**
   * Create a new tech stack
   * POST /api/tech-stacks
   * Body: { name: "React" }
   */
  createTechStack = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { name } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        ResponseHelper.badRequest(res, 'Tech stack name is required');
        return;
      }

      const techStack = await this.techStackService.createTechStack(name.trim());

      ResponseHelper.success(
        res,
        techStack,
        'Tech stack created successfully',
        HTTP_STATUS.CREATED
      );
    }
  );

  /**
   * Delete a tech stack
   * DELETE /api/tech-stacks/:id
   */
  deleteTechStack = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      await this.techStackService.deleteTechStack(id);

      ResponseHelper.success(res, null, 'Tech stack deleted successfully');
    }
  );

  /**
   * Get all tech stacks
   * GET /api/tech-stacks
   */
  getAllTechStacks = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const techStacks = await this.techStackService.getAllTechStacks();

      ResponseHelper.success(res, techStacks, 'Tech stacks retrieved successfully');
    }
  );
}
