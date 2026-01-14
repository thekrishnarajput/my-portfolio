import { Request, Response } from 'express';
import { VisitorService } from '../services/visitorService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../errors/errorHandler';
import { PAGINATION } from '../constants';

export class VisitorController {
  private visitorService: VisitorService;

  constructor() {
    this.visitorService = new VisitorService();
  }

  /**
   * Track a visit and return visitor count
   */
  trackVisit = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await this.visitorService.trackVisit(req);
      ResponseHelper.success(res, result, 'Visit tracked successfully');
    }
  );

  /**
   * Get total visitor count
   */
  getVisitorCount = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const count = await this.visitorService.getTotalVisitorCount();
      ResponseHelper.success(res, { count }, 'Visitor count retrieved successfully');
    }
  );

  /**
   * Get all visitors with pagination and sorting (admin only)
   */
  getAllVisitors = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
      let limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
      
      // Validate and limit the page size
      if (limit > PAGINATION.MAX_LIMIT) {
        limit = PAGINATION.MAX_LIMIT;
      }
      if (limit < 1) {
        limit = PAGINATION.DEFAULT_LIMIT;
      }
      
      const sortBy = (req.query.sortBy as string) || 'lastVisit';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
      
      const result = await this.visitorService.getAllVisitors(page, limit, sortBy, sortOrder);
      ResponseHelper.success(res, result, 'Visitors retrieved successfully');
    }
  );
}
