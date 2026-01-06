import { Request, Response } from 'express';
import { LinkedInService } from '../services/linkedInService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../errors/errorHandler';

export class LinkedInController {
    private linkedInService: LinkedInService;

    constructor() {
        this.linkedInService = new LinkedInService();
    }

    getFollowers = asyncHandler(async (_: Request, res: Response): Promise<void> => {
        const data = await this.linkedInService.getFollowers();
        ResponseHelper.success(res, data);
    });
}

