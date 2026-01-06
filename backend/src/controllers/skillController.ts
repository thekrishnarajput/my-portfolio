import { Request, Response } from 'express';
import { SkillService } from '../services/skillService';
import { ResponseHelper } from '../utils/response';
import { NotFoundError } from '../errors/appError';
import { asyncHandler } from '../errors/errorHandler';
import { messages } from '../utils/message';

export class SkillController {
    private skillService: SkillService;

    constructor() {
        this.skillService = new SkillService();
    }

    getAllSkills = asyncHandler(async (_: Request, res: Response): Promise<void> => {
        const skills = await this.skillService.getAllSkills();
        ResponseHelper.success(res, skills);
    });

    getSkillById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const skill = await this.skillService.getSkillById(req.params.id);
        if (!skill) {
            throw new NotFoundError(messages.skillNotFound());
        }
        ResponseHelper.success(res, skill);
    });

    createSkill = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const skill = await this.skillService.createSkill(req.body);
        ResponseHelper.created(res, skill);
    });

    updateSkill = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const skill = await this.skillService.updateSkill(req.params.id, req.body);
        if (!skill) {
            throw new NotFoundError(messages.skillNotFound());
        }
        ResponseHelper.success(res, skill);
    });

    deleteSkill = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const skill = await this.skillService.deleteSkill(req.params.id);
        if (!skill) {
            throw new NotFoundError(messages.skillNotFound());
        }
        ResponseHelper.success(res, undefined, messages.skillDeleted());
    });
}

