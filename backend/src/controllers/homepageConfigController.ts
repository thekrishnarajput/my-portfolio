import { Request, Response } from 'express';
import { HomepageConfigService } from '../services/homepageConfigService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../errors/errorHandler';

export class HomepageConfigController {
    private homepageConfigService: HomepageConfigService;

    constructor() {
        this.homepageConfigService = new HomepageConfigService();
    }

    getActiveConfig = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
        const config = await this.homepageConfigService.getActiveConfig();
        ResponseHelper.success(res, config, 'Homepage configuration retrieved successfully');
    });

    getAllConfigs = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
        const configs = await this.homepageConfigService.getAllConfigs();
        ResponseHelper.success(res, configs, 'Homepage configurations retrieved successfully');
    });

    getConfigById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const config = await this.homepageConfigService.getConfigById(id);
        ResponseHelper.success(res, config, 'Homepage configuration retrieved successfully');
    });

    createConfig = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const config = await this.homepageConfigService.createConfig(req.body);
        ResponseHelper.success(
            res,
            config,
            'Homepage configuration created successfully',
            201
        );
    });

    updateConfig = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const config = await this.homepageConfigService.updateConfig(id, req.body);
        ResponseHelper.success(res, config, 'Homepage configuration updated successfully');
    });

    deleteConfig = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        await this.homepageConfigService.deleteConfig(id);
        ResponseHelper.success(res, null, 'Homepage configuration deleted successfully');
    });

    setActiveConfig = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const config = await this.homepageConfigService.setActiveConfig(id);
        ResponseHelper.success(res, config, 'Homepage configuration activated successfully');
    });
}
