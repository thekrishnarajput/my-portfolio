import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
import { ResponseHelper } from '../utils/response';
import { NotFoundError } from '../errors/appError';
import { asyncHandler } from '../errors/errorHandler';
import { messages } from '../utils/message';

export class ProjectController {
    private projectService: ProjectService;

    constructor() {
        this.projectService = new ProjectService();
    }

    getAllProjects = asyncHandler(async (_: Request, res: Response): Promise<void> => {
        const projects = await this.projectService.getAllProjects();
        ResponseHelper.success(res, projects);
    });

    getProjectById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const project = await this.projectService.getProjectById(req.params.id);
        if (!project) {
            throw new NotFoundError(messages.projectNotFound());
        }
        ResponseHelper.success(res, project);
    });

    createProject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const project = await this.projectService.createProject(req.body);
        ResponseHelper.created(res, project);
    });

    updateProject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const project = await this.projectService.updateProject(req.params.id, req.body);
        if (!project) {
            throw new NotFoundError(messages.projectNotFound());
        }
        ResponseHelper.success(res, project);
    });

    deleteProject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const project = await this.projectService.deleteProject(req.params.id);
        if (!project) {
            throw new NotFoundError(messages.projectNotFound());
        }
        ResponseHelper.success(res, undefined, messages.projectDeleted());
    });
}

