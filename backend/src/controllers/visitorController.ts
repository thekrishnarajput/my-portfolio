import { Request, Response } from 'express';
import { VisitorService } from '../services/visitorService';
import { ResponseHelper } from '../utils/response';

export class VisitorController {
  private visitorService: VisitorService;

  constructor() {
    this.visitorService = new VisitorService();
  }

  /**
   * Track a visit and return visitor count
   */
  trackVisit = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.visitorService.trackVisit(req);
      ResponseHelper.success(res, result, 'Visit tracked successfully');
    } catch (error: any) {
      ResponseHelper.error(res, error.message);
    }
  };

  /**
   * Get total visitor count
   */
  getVisitorCount = async (_req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.visitorService.getTotalVisitorCount();
      ResponseHelper.success(res, { count }, 'Visitor count retrieved successfully');
    } catch (error: any) {
      ResponseHelper.error(res, error.message);
    }
  };
}
